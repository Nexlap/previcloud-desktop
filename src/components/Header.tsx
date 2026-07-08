import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  CaretDown,
  User,
  Monitor,
  ChatCircle,
  Moon,
  SignOut,
} from "@phosphor-icons/react";
import { signOut } from "../lib/auth";
import { caricaHeaderProfilo, type HeaderProfilo } from "../lib/greeting";
import { isDarkMode, setDarkMode } from "../lib/theme";
import { isDesktopApp } from "../lib/appSettings";
import { onAggiornaProfilo } from "../lib/eventBus";
import { onNativeNotificationSyncStatus } from "../lib/nativeNotificationSession";
import { supabase } from "../lib/supabase";
import ToggleSwitch from "./ToggleSwitch";
import NotificheBell from "./NotificheBell";
import { useSegnalazioneFeedback } from "./SegnalazioneProvider";

export default function Header() {
  const [profilo, setProfilo] = useState<HeaderProfilo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scuro, setScuro] = useState(isDarkMode);
  const [avvisoNotificheNative, setAvvisoNotificheNative] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { apriSegnalazione } = useSegnalazioneFeedback();

  useEffect(() => {
    if (!isDesktopApp()) return;
    return onNativeNotificationSyncStatus(setAvvisoNotificheNative);
  }, []);

  useEffect(() => {
    void caricaHeaderProfilo().then(setProfilo);
  }, []);

  useEffect(() => {
    return onAggiornaProfilo(() => {
      void caricaHeaderProfilo().then(setProfilo);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      channel = supabase
        .channel("header-profilo")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          () => {
            void caricaHeaderProfilo().then(setProfilo);
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function chiudi(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", chiudi);
    return () => document.removeEventListener("mousedown", chiudi);
  }, [menuOpen]);

  function onTemaScuro(checked: boolean) {
    setScuro(checked);
    setDarkMode(checked);
  }

  async function esci() {
    setMenuOpen(false);
    if (!window.confirm("Vuoi uscire dall'account?")) return;
    await signOut();
  }

  return (
    <>
      {avvisoNotificheNative ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-800">
          <p>{avvisoNotificheNative}</p>
          <button
            type="button"
            onClick={() => setAvvisoNotificheNative(null)}
            className="shrink-0 text-amber-700/70 hover:text-amber-900"
            aria-label="Chiudi avviso"
          >
            ×
          </button>
        </div>
      ) : null}
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b border-edge-faint bg-surface px-6">
      <NotificheBell />
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-3 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-brand-bg"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-teal text-sm font-bold text-white shadow-sm">
            {profilo?.iniziale || "P"}
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-semibold text-ink">
              {profilo?.nomeBreve || "..."}
            </p>
          </div>
          <CaretDown
            size={16}
            weight="bold"
            className={`shrink-0 text-ink/40 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-edge bg-surface py-2 shadow-lg"
          >
            <div className="border-b border-edge-faint px-4 py-3">
              <p className="truncate text-sm font-semibold text-ink">{profilo?.nomeBreve || "Account"}</p>
              {profilo?.email && (
                <p className="mt-0.5 truncate text-xs text-ink/50">{profilo.email}</p>
              )}
            </div>

            <Link
              to="/profilo"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-brand-bg"
            >
              <User size={16} weight="regular" className="text-ink/50" />
              Il mio profilo
            </Link>
            <Link
              to="/app"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-brand-bg"
            >
              <Monitor size={16} weight="regular" className="text-ink/50" />
              Impostazioni app
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                apriSegnalazione();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink hover:bg-brand-bg"
            >
              <ChatCircle size={16} weight="regular" className="text-ink/50" />
              Segnala un problema
            </button>

            <div className="my-2 border-t border-edge-faint" />

            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Moon size={16} weight="regular" className="text-ink/50" />
                <span className="text-sm text-ink">Tema scuro</span>
              </div>
              <ToggleSwitch checked={scuro} onChange={onTemaScuro} />
            </div>

            <div className="my-2 border-t border-edge-faint" />

            <button
              type="button"
              role="menuitem"
              onClick={() => void esci()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-500/10"
            >
              <SignOut size={16} weight="regular" />
              Esci dall&apos;account
            </button>
          </div>
        )}
      </div>
    </header>
    </>
  );
}

