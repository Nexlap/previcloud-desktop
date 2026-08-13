import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { NuovoPreventivoNavProvider } from "./NuovoPreventivoNavProvider";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NuovoRipresaPathTracker from "./NuovoRipresaPathTracker";
import { NotificheProvider } from "./NotificheProvider";
import { SegnalazioneProvider } from "./SegnalazioneProvider";
import { applyThemeMode, getThemeMode } from "../lib/theme";
import { purgeCestinoScaduto } from "../lib/cestino";
import { isDesktopApp } from "../lib/appSettings";
import { controllaEProponeAggiornamentoAvvio } from "../lib/appUpdater";
import { controllaVersioneMinima } from "../lib/versione";
import { pulisciBozzeNuovoLegacy } from "../lib/nuovoDraft";
import { supabase } from "../lib/supabase";
import { isTrialScaduto } from "previcloud-shared";
import { AggiornamentoObbligatorioModal } from "./AggiornamentoObbligatorioModal";
import { TrialScadutoModal } from "./TrialScadutoModal";

export default function Layout() {
  const [aggiornaObbligatorio, setAggiornaObbligatorio] = useState(false);
  const [versioneInstallata, setVersioneInstallata] = useState<string>();
  const [versioneMinima, setVersioneMinima] = useState<string>();
  const [trialScaduto, setTrialScaduto] = useState(false);
  const [gatePronto, setGatePronto] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    applyThemeMode(getThemeMode());
    pulisciBozzeNuovoLegacy();
    void purgeCestinoScaduto();
    void controllaEProponeAggiornamentoAvvio();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function verificaGate() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setGatePronto(true);
        return;
      }

      const { data: profilo } = await supabase
        .from("profiles")
        .select("plan, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (isTrialScaduto(profilo?.plan, profilo?.trial_ends_at)) {
        setTrialScaduto(true);
      }

      const risultato = await controllaVersioneMinima();
      if (cancelled) return;
      if (!risultato.ok) {
        setVersioneInstallata(risultato.installata);
        setVersioneMinima(risultato.minima);
        setAggiornaObbligatorio(true);
      }

      setGatePronto(true);
    }

    void verificaGate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDesktopApp()) return;
    const bloccaMenuBrowser = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", bloccaMenuBrowser);
    return () => document.removeEventListener("contextmenu", bloccaMenuBrowser);
  }, []);
  return (
    <>
    <AggiornamentoObbligatorioModal
      visibile={aggiornaObbligatorio}
      versioneInstallata={versioneInstallata}
      versioneMinima={versioneMinima}
    />
    <TrialScadutoModal visibile={trialScaduto} />
    {!gatePronto ? (
      <div className="fixed inset-0 z-[9998] bg-brand-navy" />
    ) : (
    <NotificheProvider>
      <SegnalazioneProvider>
        <NuovoPreventivoNavProvider>
        <div className="flex h-screen bg-brand-bg">
          <NuovoRipresaPathTracker />
          <Sidebar />
          <div className="theme-surface flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />
            <main className={`flex min-h-0 flex-1 flex-col ${isHome ? "overflow-hidden" : "overflow-y-auto"}`}>
              <Outlet />
            </main>
          </div>
        </div>
        </NuovoPreventivoNavProvider>
      </SegnalazioneProvider>
    </NotificheProvider>
    )}
    </>
  );
}
