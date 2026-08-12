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
import { supabase } from "../lib/supabase";
import { isTrialScaduto } from "previcloud-shared";
import { AggiornamentoObbligatorioModal } from "./AggiornamentoObbligatorioModal";
import { TrialScadutoModal } from "./TrialScadutoModal";

export default function Layout() {
  const [aggiornaObbligatorio, setAggiornaObbligatorio] = useState(false);
  const [versioneInstallata, setVersioneInstallata] = useState<string>();
  const [versioneMinima, setVersioneMinima] = useState<string>();
  const [trialScaduto, setTrialScaduto] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    applyThemeMode(getThemeMode());
    void purgeCestinoScaduto();
    void controllaEProponeAggiornamentoAvvio();
  }, []);

  useEffect(() => {
    controllaVersioneMinima().then((risultato) => {
      if (!risultato.ok) {
        setVersioneInstallata(risultato.installata);
        setVersioneMinima(risultato.minima);
        setAggiornaObbligatorio(true);
      }
    });
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('plan, trial_ends_at')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (isTrialScaduto(data?.plan, data?.trial_ends_at)) {
            setTrialScaduto(true)
          }
        })
    })
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
    </>
  );
}
