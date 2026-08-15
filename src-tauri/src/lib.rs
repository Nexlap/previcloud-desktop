use chrono::Utc;
use serde::Deserialize;
use std::{
    collections::HashSet,
    path::{Component, Path, PathBuf},
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_opener::OpenerExt;

const MENU_OPEN: &str = "tray-open";
const MENU_QUIT: &str = "tray-quit";
const NOTIFICATION_POLL_INTERVAL_SECS: u64 = 35;
const CARTELLA_PDF_ROOT_NAME: &str = "PreviCloud - Preventivi PDF";

#[derive(Default)]
struct PdfFsState {
    /// Root aggiuntive (cartella custom da dialog / appSettings).
    allowed_extra_roots: Mutex<HashSet<PathBuf>>,
    /// Path restituiti da `write_pdf_file` in questa sessione.
    written_paths: Mutex<HashSet<PathBuf>>,
}

#[derive(Clone)]
struct SessionInfo {
    supabase_url: String,
    supabase_anon_key: String,
    access_token: String,
    user_id: String,
    last_check: String,
}

#[derive(Default)]
struct NotificationSessionState {
    session: Mutex<Option<SessionInfo>>,
    delivered_notification_ids: Mutex<HashSet<String>>,
}

#[derive(Deserialize)]
struct NotificationRow {
    id: String,
    titolo: Option<String>,
    messaggio: Option<String>,
    created_at: String,
    letta: Option<bool>,
    snooze_until: Option<String>,
}

fn notifica_in_rimando(snooze_until: &Option<String>, now_ms: i64) -> bool {
    let Some(until) = snooze_until else {
        return false;
    };
    chrono::DateTime::parse_from_rfc3339(until)
        .map(|dt| dt.timestamp_millis() > now_ms)
        .unwrap_or(false)
}

fn notifica_idonea_os(row: &NotificationRow, now_ms: i64) -> bool {
    if row.letta.unwrap_or(false) {
        return false;
    }
    !notifica_in_rimando(&row.snooze_until, now_ms)
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn set_notification_session(
    state: tauri::State<'_, Arc<NotificationSessionState>>,
    supabase_url: String,
    supabase_anon_key: String,
    access_token: String,
    user_id: String,
) -> Result<(), String> {
    let mut session = state.session.lock().map_err(|e| e.to_string())?;
    let last_check = session
        .as_ref()
        .filter(|current| current.user_id == user_id)
        .map(|current| current.last_check.clone())
        .unwrap_or_else(|| Utc::now().to_rfc3339());

    if session
        .as_ref()
        .map(|current| current.user_id != user_id)
        .unwrap_or(false)
    {
        state
            .delivered_notification_ids
            .lock()
            .map_err(|e| e.to_string())?
            .clear();
    }

    *session = Some(SessionInfo {
        supabase_url,
        supabase_anon_key,
        access_token,
        user_id,
        last_check,
    });
    Ok(())
}

#[tauri::command]
fn clear_notification_session(
    state: tauri::State<'_, Arc<NotificationSessionState>>,
) -> Result<(), String> {
    let mut session = state.session.lock().map_err(|e| e.to_string())?;
    *session = None;
    state
        .delivered_notification_ids
        .lock()
        .map_err(|e| e.to_string())?
        .clear();
    Ok(())
}

fn is_main_window_foreground(app: &tauri::AppHandle) -> bool {
    app.get_webview_window("main")
        .map(|window| {
            let visible = window.is_visible().unwrap_or(false);
            let focused = window.is_focused().unwrap_or(false);
            let minimized = window.is_minimized().unwrap_or(false);
            visible && focused && !minimized
        })
        .unwrap_or(false)
}

async fn fetch_new_notifications(
    client: &reqwest::Client,
    session: &SessionInfo,
) -> Result<Vec<NotificationRow>, String> {
    let url = format!(
        "{}/rest/v1/notifiche",
        session.supabase_url.trim_end_matches('/')
    );
    let now_iso = Utc::now().to_rfc3339();
    let query = vec![
        ("select", "id,titolo,messaggio,created_at,letta,snooze_until".to_string()),
        ("user_id", format!("eq.{}", session.user_id)),
        ("archiviata", "eq.false".to_string()),
        ("letta", "eq.false".to_string()),
        (
            "or",
            format!("(snooze_until.is.null,snooze_until.lte.{now_iso})"),
        ),
        ("created_at", format!("gt.{}", session.last_check)),
        ("order", "created_at.asc".to_string()),
        ("limit", "20".to_string()),
    ];

    let response = client
        .get(url)
        .header("apikey", &session.supabase_anon_key)
        .bearer_auth(&session.access_token)
        .header("Accept", "application/json")
        .query(&query)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let body = response.text().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        return Err(format!("Supabase notifiche HTTP {}", status.as_u16()));
    }

    serde_json::from_str::<Vec<NotificationRow>>(&body).map_err(|e| e.to_string())
}

fn start_notification_poller(app: tauri::AppHandle, state: Arc<NotificationSessionState>) {
    tauri::async_runtime::spawn(async move {
        let client = reqwest::Client::new();

        loop {
            tokio::time::sleep(Duration::from_secs(NOTIFICATION_POLL_INTERVAL_SECS)).await;

            let session_snapshot = match state.session.lock() {
                Ok(guard) => guard.clone(),
                Err(error) => {
                    eprintln!("Errore stato notifiche native: {error}");
                    None
                }
            };

            let Some(session) = session_snapshot else {
                continue;
            };

            match fetch_new_notifications(&client, &session).await {
                Ok(rows) => {
                    if rows.is_empty() {
                        continue;
                    }

                    let should_skip_native = is_main_window_foreground(&app);
                    let mut newest_created_at = session.last_check.clone();
                    let now_ms = Utc::now().timestamp_millis();

                    for row in rows {
                        newest_created_at = row.created_at.clone();
                        if !notifica_idonea_os(&row, now_ms) {
                            continue;
                        }
                        let already_delivered = state
                            .delivered_notification_ids
                            .lock()
                            .map(|ids| ids.contains(&row.id))
                            .unwrap_or(false);
                        if already_delivered {
                            continue;
                        }

                        if let Ok(mut ids) = state.delivered_notification_ids.lock() {
                            ids.insert(row.id.clone());
                        }

                        if should_skip_native {
                            continue;
                        }

                        let title = row.titolo.unwrap_or_else(|| "PreviCloud".to_string());
                        let body = row.messaggio.unwrap_or_default();
                        if let Err(error) =
                            app.notification().builder().title(title).body(body).show()
                        {
                            eprintln!("Errore notifica OS nativa: {error}");
                        }
                    }

                    if let Ok(mut guard) = state.session.lock() {
                        if let Some(current) = guard.as_mut() {
                            if current.user_id == session.user_id {
                                current.last_check = newest_created_at;
                            }
                        }
                    }
                }
                Err(error) => eprintln!("Errore polling notifiche native: {error}"),
            }
        }
    });
}

#[tauri::command]
fn mark_notification_delivered(
    state: tauri::State<'_, Arc<NotificationSessionState>>,
    notification_id: String,
) -> Result<(), String> {
    state
        .delivered_notification_ids
        .lock()
        .map_err(|e| e.to_string())?
        .insert(notification_id);
    Ok(())
}

/// Caratteri ammessi nello stem del nome file PDF (Unicode letters/digits + sicuri).
fn char_consentito_nome_pdf(c: char) -> bool {
    if c.is_control() || c == '/' || c == '\\' {
        return false;
    }
    // Lettere/numeri Unicode; apostrofo per cognomi (es. D'Angelo).
    c.is_alphanumeric() || matches!(c, '.' | '_' | '-' | ' ' | '\'')
}

/// Basename PDF: lettere/numeri Unicode, niente traversal/separatori/control chars.
fn valida_nome_file_pdf(nome_file: &str) -> Result<String, String> {
    let nome = nome_file.trim();
    if nome.is_empty() {
        return Err("Nome file PDF non valido.".to_string());
    }
    if nome.contains("..") {
        return Err("Nome file PDF non valido: path traversal non consentito.".to_string());
    }
    if nome.contains('/') || nome.contains('\\') {
        return Err("Nome file PDF non valido: separatori non consentiti.".to_string());
    }
    if nome.chars().any(|c| c.is_control()) {
        return Err("Nome file PDF non valido: caratteri di controllo non consentiti.".to_string());
    }

    let as_path = Path::new(nome);
    let mut components = as_path.components();
    let only = components.next();
    if components.next().is_some() {
        return Err("Nome file PDF non valido: deve essere un basename.".to_string());
    }
    match only {
        Some(Component::Normal(os)) => {
            let s = os.to_string_lossy();
            if s != nome {
                return Err("Nome file PDF non valido.".to_string());
            }
        }
        _ => {
            return Err("Nome file PDF non valido: path non consentito.".to_string());
        }
    }

    let (stem, ext) = nome
        .rsplit_once('.')
        .ok_or_else(|| "Nome file PDF non valido: estensione .pdf richiesta.".to_string())?;
    if stem.is_empty() || !ext.eq_ignore_ascii_case("pdf") {
        return Err("Nome file PDF non valido: estensione .pdf richiesta.".to_string());
    }
    if !stem.chars().all(char_consentito_nome_pdf) {
        return Err("Nome file PDF non valido: caratteri non consentiti.".to_string());
    }

    Ok(nome.to_string())
}

/// Risolve un path anche se non esiste ancora, rifiutando `..` nei segmenti mancanti.
fn strict_canonicalize(path: &Path) -> Result<PathBuf, String> {
    if path.as_os_str().is_empty() {
        return Err("Percorso vuoto non valido.".to_string());
    }
    if path.exists() {
        return path
            .canonicalize()
            .map_err(|e| format!("Impossibile risolvere il percorso: {e}"));
    }

    let mut rest = Vec::new();
    let mut cur = path.to_path_buf();
    while !cur.exists() {
        let name = cur
            .file_name()
            .ok_or_else(|| "Percorso non valido.".to_string())?
            .to_os_string();
        if name == "." || name == ".." {
            return Err("Percorso non consentito.".to_string());
        }
        rest.push(name);
        if !cur.pop() {
            return Err("Percorso non valido.".to_string());
        }
    }

    let mut resolved = cur
        .canonicalize()
        .map_err(|e| format!("Impossibile risolvere il percorso: {e}"))?;
    for component in rest.into_iter().rev() {
        resolved.push(component);
    }
    Ok(resolved)
}

fn is_path_under_root(path: &Path, root: &Path) -> bool {
    path.starts_with(root)
}

fn path_under_any_root(path: &Path, roots: &[PathBuf]) -> Result<bool, String> {
    let resolved = strict_canonicalize(path)?;
    for root in roots {
        let root_resolved = strict_canonicalize(root)?;
        if is_path_under_root(&resolved, &root_resolved) {
            return Ok(true);
        }
    }
    Ok(false)
}

fn radici_pdf_consentite(
    app: &tauri::AppHandle,
    state: &PdfFsState,
) -> Result<Vec<PathBuf>, String> {
    let desktop = app
        .path()
        .desktop_dir()
        .map_err(|e| format!("Impossibile risolvere Desktop: {e}"))?;
    let default_root = desktop.join(CARTELLA_PDF_ROOT_NAME);
    let cache = app
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Impossibile risolvere cache app: {e}"))?;

    let mut roots = vec![default_root, cache];
    let extra = state
        .allowed_extra_roots
        .lock()
        .map_err(|e| e.to_string())?;
    roots.extend(extra.iter().cloned());
    Ok(roots)
}

/// Registra una root PDF aggiuntiva (cartella custom da dialog / appSettings).
#[tauri::command]
fn register_pdf_allowed_root(
    state: tauri::State<'_, PdfFsState>,
    path: String,
) -> Result<(), String> {
    let resolved = strict_canonicalize(Path::new(&path))?;
    if resolved.exists() && !resolved.is_dir() {
        return Err("La root PDF deve essere una cartella.".to_string());
    }
    state
        .allowed_extra_roots
        .lock()
        .map_err(|e| e.to_string())?
        .insert(resolved);
    Ok(())
}

#[tauri::command]
fn read_file_bytes(
    app: tauri::AppHandle,
    state: tauri::State<'_, PdfFsState>,
    path: String,
) -> Result<Vec<u8>, String> {
    let p = PathBuf::from(&path);
    if !p.is_file() {
        return Err(format!("File non trovato: {path}"));
    }
    let canon = p
        .canonicalize()
        .map_err(|e| format!("Impossibile risolvere il percorso: {e}"))?;

    let in_session = state
        .written_paths
        .lock()
        .map_err(|e| e.to_string())?
        .contains(&canon);
    if in_session {
        return std::fs::read(&canon).map_err(|e| e.to_string());
    }

    let roots = radici_pdf_consentite(&app, &state)?;
    if !path_under_any_root(&canon, &roots)? {
        return Err("Lettura file non consentita: percorso fuori dalle cartelle PDF ammesse.".to_string());
    }

    std::fs::read(&canon).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_pdf_file(
    app: tauri::AppHandle,
    state: tauri::State<'_, PdfFsState>,
    cartella: String,
    nome_file: String,
    bytes: Vec<u8>,
) -> Result<String, String> {
    let nome = valida_nome_file_pdf(&nome_file)?;
    let roots = radici_pdf_consentite(&app, &state)?;

    if !path_under_any_root(Path::new(&cartella), &roots)? {
        return Err("Scrittura PDF non consentita: cartella fuori dalle root ammesse.".to_string());
    }

    std::fs::create_dir_all(&cartella).map_err(|e| e.to_string())?;
    let mut path = PathBuf::from(&cartella);
    path.push(&nome);

    if !path_under_any_root(&path, &roots)? {
        return Err("Scrittura PDF non consentita: percorso file fuori dalle root ammesse.".to_string());
    }

    std::fs::write(&path, bytes).map_err(|e| e.to_string())?;

    if let Ok(canon) = path.canonicalize() {
        if let Ok(mut written) = state.written_paths.lock() {
            written.insert(canon);
        }
    }

    path.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Percorso non valido.".to_string())
}

fn valida_percorso_pdf(path: &str) -> Result<PathBuf, String> {
    let p = PathBuf::from(path);
    let ext = p
        .extension()
        .and_then(|s| s.to_str())
        .map(|s| s.eq_ignore_ascii_case("pdf"))
        .unwrap_or(false);
    if !ext {
        return Err("Il file deve essere un PDF.".to_string());
    }
    if !p.is_file() {
        return Err(format!("File non trovato: {path}"));
    }
    Ok(p)
}

/// Apre un PDF locale via Rust (bypass scope frontend per path scelti con dialog).
#[tauri::command]
fn open_pdf_path(app: tauri::AppHandle, path: String) -> Result<(), String> {
    valida_percorso_pdf(&path)?;
    app.opener()
        .open_path(path, None::<&str>)
        .map_err(|e| e.to_string())
}

/// Mostra un PDF in Esplora file via Rust (stesso motivo di open_pdf_path).
#[tauri::command]
fn reveal_pdf_in_folder(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(format!("Percorso non trovato: {path}"));
    }
    app.opener()
        .reveal_item_in_dir(path)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let notification_state = Arc::new(NotificationSessionState::default());
    let poller_state = notification_state.clone();

    tauri::Builder::default()
        .manage(notification_state)
        .manage(PdfFsState::default())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(move |app| {
            start_notification_poller(app.handle().clone(), poller_state.clone());

            let open_item =
                MenuItem::with_id(app, MENU_OPEN, "Apri PreviCloud", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, MENU_QUIT, "Esci", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open_item, &quit_item])?;

            let icon = app
                .default_window_icon()
                .cloned()
                .expect("missing default window icon");

            TrayIconBuilder::new()
                .icon(icon)
                .tooltip("PreviCloud")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    MENU_OPEN => show_main_window(app),
                    MENU_QUIT => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            read_file_bytes,
            write_pdf_file,
            register_pdf_allowed_root,
            open_pdf_path,
            reveal_pdf_in_folder,
            set_notification_session,
            clear_notification_session,
            mark_notification_delivered
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            match event {
                tauri::RunEvent::ExitRequested { api, code, .. } => {
                    // code=None: chiusura involontaria (es. ultima finestra); code=Some: app.exit() dal menu
                    if code.is_none() {
                        api.prevent_exit();
                    }
                }
                #[cfg(target_os = "macos")]
                tauri::RunEvent::Reopen {
                    has_visible_windows,
                    ..
                } => {
                    if !has_visible_windows {
                        show_main_window(app_handle);
                    }
                }
                _ => {}
            }
        });
}

#[cfg(test)]
mod pdf_path_tests {
    use super::{
        is_path_under_root, path_under_any_root, strict_canonicalize, valida_nome_file_pdf,
    };
    use std::fs;
    use std::path::PathBuf;

    fn temp_dir(label: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "previcloud-pdf-test-{}-{}",
            label,
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).expect("temp dir");
        dir
    }

    #[test]
    fn rifiuta_nome_con_traversal() {
        assert!(valida_nome_file_pdf("../escape.pdf").is_err());
        assert!(valida_nome_file_pdf("..\\escape.pdf").is_err());
        assert!(valida_nome_file_pdf("foo/../bar.pdf").is_err());
    }

    #[test]
    fn rifiuta_nome_con_separatori() {
        assert!(valida_nome_file_pdf("subdir/file.pdf").is_err());
        assert!(valida_nome_file_pdf("subdir\\file.pdf").is_err());
        assert!(valida_nome_file_pdf("C:\\Users\\file.pdf").is_err());
    }

    #[test]
    fn rifiuta_cartella_fuori_dalle_root() {
        let root = temp_dir("root-ok");
        let outside = temp_dir("root-evil");
        let roots = vec![root.clone()];

        assert_eq!(
            path_under_any_root(&outside, &roots).expect("resolve"),
            false
        );
        assert_eq!(
            path_under_any_root(&root.join("cliente"), &roots).expect("resolve"),
            true
        );

        let _ = fs::remove_dir_all(&root);
        let _ = fs::remove_dir_all(&outside);
    }

    #[test]
    fn accetta_caso_valido() {
        let nome = valida_nome_file_pdf("Mario Rossi_PRV-123.pdf").expect("nome ok");
        assert_eq!(nome, "Mario Rossi_PRV-123.pdf");
        assert!(valida_nome_file_pdf("preventivo.PDF").is_ok());

        let root = temp_dir("root-valid");
        let cartella = root.join("Cliente");
        let roots = vec![root.clone()];
        assert!(path_under_any_root(&cartella, &roots).expect("resolve"));

        let resolved_root = strict_canonicalize(&root).expect("canon root");
        let resolved_child = strict_canonicalize(&cartella).expect("canon child");
        assert!(is_path_under_root(&resolved_child, &resolved_root));

        let mut file_path = resolved_child;
        file_path.push("doc.pdf");
        assert!(is_path_under_root(&file_path, &resolved_root));

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn accetta_nomi_unicode_e_apostrofo() {
        assert_eq!(
            valida_nome_file_pdf("José_PRV-1.pdf").expect("José"),
            "José_PRV-1.pdf"
        );
        assert_eq!(
            valida_nome_file_pdf("Città_PRV-2.pdf").expect("Città"),
            "Città_PRV-2.pdf"
        );
        assert_eq!(
            valida_nome_file_pdf("D'Angelo_PRV-3.pdf").expect("D'Angelo"),
            "D'Angelo_PRV-3.pdf"
        );
    }
}
