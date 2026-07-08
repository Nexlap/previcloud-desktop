import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Trash } from "@phosphor-icons/react";
import { caricaStorico, caricaCollegamentiPianoPreventivi } from "../lib/storico";
import { conteggioCestino } from "../lib/cestino";
import type { CollegamentiPianoMap } from "../lib/collegamentiPiano";
import type { Preventivo } from "../lib/types";
import PageContainer from "../components/PageContainer";
import PreventiviLista from "../components/PreventiviLista";
import { NotificaAzioneStorico } from "../components/NotificheBell";
import { caricaNotificaById, type Notifica } from "../lib/notifiche";
import { eventBus } from "../lib/eventBus";
import { trackEvento } from "../lib/track";

export default function Storico() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const notificaIdParam = searchParams.get("notifica");

  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [collegamentiPiano, setCollegamentiPiano] = useState<CollegamentiPianoMap>({});
  const [loading, setLoading] = useState(true);
  const [vociCestino, setVociCestino] = useState(0);
  const [notificaAzione, setNotificaAzione] = useState<Notifica | null>(null);
  const [focusPronto, setFocusPronto] = useState(!focusId);

  useEffect(() => {
    void trackEvento("schermata_aperta", "storico");
  }, []);

  useEffect(() => {
    Promise.all([caricaStorico(), caricaCollegamentiPianoPreventivi(), conteggioCestino()]).then(
      ([data, collegamenti, cestino]) => {
        setPreventivi(data);
        setCollegamentiPiano(collegamenti);
        setVociCestino(cestino);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!notificaIdParam) return;
    void caricaNotificaById(notificaIdParam).then((n) => {
      if (n) setNotificaAzione(n);
    });
  }, [notificaIdParam]);

  useEffect(() => {
    return eventBus.onApriNotifica(({ notifica }) => {
      if (notifica.tipo === "rata_in_scadenza") return;
      setNotificaAzione(notifica);
    });
  }, []);

  function consumaFocus() {
    setFocusPronto(true);
    if (focusId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("focus");
        return next;
      }, { replace: true });
    }
  }

  function chiudiNotificaAzione() {
    setNotificaAzione(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("notifica");
      return next;
    }, { replace: true });
  }

  async function ricaricaDopoElimina() {
    const [data, collegamenti, cestino] = await Promise.all([
      caricaStorico(),
      caricaCollegamentiPianoPreventivi(),
      conteggioCestino(),
    ]);
    setPreventivi(data);
    setCollegamentiPiano(collegamenti);
    setVociCestino(cestino);
  }

  const mostraAzione = !!notificaAzione && (focusPronto || !focusId);

  return (
    <PageContainer>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-navy">Storico preventivi</h1>
          <p className="mt-1 text-sm text-brand-navy/55">Preventivi attivi e versioni precedenti.</p>
        </div>
        <Link
          to="/cestino"
          className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-sm font-medium text-brand-navy/70 shadow-sm transition hover:border-brand-teal/25 hover:bg-brand-bg"
        >
          <Trash size={16} weight="regular" />
          Elementi eliminati
          {vociCestino > 0 && (
            <span className="rounded-full bg-brand-teal/15 px-2 py-0.5 text-xs font-semibold text-brand-teal-ink">
              {vociCestino}
            </span>
          )}
        </Link>
      </div>

      {loading && (
        <div className="mt-4 divide-y divide-edge-faint overflow-hidden rounded-2xl border border-edge-faint bg-surface">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-3.5">
              <div className="h-9 w-9 rounded-full bg-brand-navy/10" />
              <div className="h-3 flex-1 rounded bg-brand-navy/10" />
              <div className="hidden h-3 w-24 rounded bg-brand-navy/10 sm:block" />
              <div className="h-3 w-20 rounded bg-brand-navy/10" />
            </div>
          ))}
        </div>
      )}
      {!loading && preventivi.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-edge px-6 py-16 text-center">
          <p className="text-sm font-medium text-brand-navy">Nessun preventivo ancora</p>
          <p className="mt-1 max-w-sm text-xs text-brand-navy/45">
            I preventivi che crei compariranno qui.
          </p>
        </div>
      )}

      {!loading && preventivi.length > 0 && (
        <div className="mt-4">
          <PreventiviLista
            preventivi={preventivi}
            setPreventivi={setPreventivi}
            variant="storico"
            collegamentiPiano={collegamentiPiano}
            focusPreventivoId={focusId}
            onFocusConsumato={consumaFocus}
            onPreventiviEliminati={ricaricaDopoElimina}
          />
        </div>
      )}

      {mostraAzione ? (
        <NotificaAzioneStorico notifica={notificaAzione} onClose={chiudiNotificaAzione} />
      ) : null}
    </PageContainer>
  );
}
