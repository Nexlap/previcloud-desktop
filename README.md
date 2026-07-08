# PreviCloud Desktop

App desktop Tauri + React per PreviCloud.

## Sviluppo

```powershell
npm install
npm run tauri dev
```

## Aggiornamenti OTA (Tauri Updater)

L'app controlla aggiornamenti all'avvio e da **Impostazioni → Controlla aggiornamenti**.

### Build release (Windows)

```powershell
.\scripts\release-build.ps1
```

Oppure manualmente:

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY_PATH = "$env:USERPROFILE\.tauri\previcloud-desktop.key"
npm run tauri:build
```

### Pubblicare una release

1. Crea tag/release su GitHub (`danielegalmax/previcloud-desktop`)
2. Carica installer `.exe` + `.exe.sig` dalla cartella `src-tauri/target/release/bundle/nsis/`
3. Genera e carica `latest.json`:

```powershell
npm run updater:manifest -- 0.1.1 "Note release" https://github.com/danielegalmax/previcloud-desktop/releases/download/v0.1.1
```

La chiave privata di firma resta in `%USERPROFILE%\.tauri\previcloud-desktop.key` (non committare).
