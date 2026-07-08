import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, PencilSimple, Copy, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import { caricaServizi, creaServizio, eliminaServizi, eliminaServizio, inserisciServizi } from "../lib/listino";
import type { ServizioDraft } from "../lib/listinoSmart";
import ListinoSmartPanel from "../components/ListinoSmartPanel";
import type { Servizio } from "../lib/types";
import { formatImporto } from "../lib/format";
import { useSelezione } from "../lib/hooks/useSelezione";
import { useAnnullaSelezioneOnEscape } from "../lib/hooks/useAnnullaSelezioneOnEscape";
import ServizioModal from "../components/ServizioModal";
import PageContainer from "../components/PageContainer";
import CheckboxSelezione from "../components/CheckboxSelezione";
import BarraSelezione from "../components/BarraSelezione";
import { trackEvento } from "../lib/track";

export default function ListinoServizi() {
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAperto, setModalAperto] = useState(false);
  const [servizioInEdit, setServizioInEdit] = useState<Servizio | null>(null);
  const [importando, setImportando] = useState(false);
  const [msgImport, setMsgImport] = useState("");
  const [ricerca, setRicerca] = useState("");

  const ids = servizi.map((s) => s.id);
  const serviziFiltrati = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    if (!q) return servizi;
    return servizi.filter((s) =>
      s.nome.toLowerCase().includes(q) || (s.descrizione || "").toLowerCase().includes(q),
    );
  }, [ricerca, servizi]);

  const {
    selezionati,
    selezioneAttiva,
    tuttiSelezionati,
    parziale,
    toggle,
    annulla,
    toggleTutti,
  } = useSelezione(ids);

  useAnnullaSelezioneOnEscape(selezioneAttiva, annulla);

  function carica() {
    caricaServizi().then(({ data, error }) => {
      setServizi(data);
      if (error) {
        window.alert("Impossibile caricare i servizi, riprova.");
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    void trackEvento("schermata_aperta", "listino");
  }, []);

  useEffect(() => {
    carica();
  }, []);

  function apriNuovo() {
    setServizioInEdit(null);
    setModalAperto(true);
  }

  function apriModifica(s: Servizio) {
    setServizioInEdit(s);
    setModalAperto(true);
  }

  async function duplicaServizio(s: Servizio) {
    const { data, error } = await creaServizio({
      nome: `Copia di ${s.nome}`,
      descrizione: s.descrizione || "",
      costo: s.costo != null ? String(s.costo) : "",
      unita: s.unita,
      ordine: servizi.length,
    });
    if (error) {
      window.alert(error.message);
      return;
    }
    if (data) {
      const copia = data as Servizio;
      setServizi((lista) => [...lista, copia]);
      apriModifica(copia);
    }
  }

  async function eliminaSingolo(id: string) {
    if (!window.confirm("Eliminare questo servizio?")) return;
    const { error } = await eliminaServizio(id);
    if (error) {
      window.alert(error.message);
      return;
    }
    setServizi((lista) => lista.filter((s) => s.id !== id));
  }

  async function eliminaSelezionati() {
    if (selezionati.length === 0) return;
    const msg =
      selezionati.length === 1
        ? "Eliminare questo servizio?"
        : `Eliminare ${selezionati.length} servizi?`;
    if (!window.confirm(msg)) return;

    const { error } = await eliminaServizi(selezionati);
    if (error) {
      window.alert(error.message);
      return;
    }
    setServizi((lista) => lista.filter((s) => !selezionati.includes(s.id)));
    annulla();
  }

  async function importaServiziSmart(nuovi: ServizioDraft[]) {
    if (nuovi.length === 0) return;
    setImportando(true);
    setMsgImport("");
    const { error } = await inserisciServizi(nuovi, servizi.length);
    setImportando(false);
    if (error) {
      window.alert(error.message);
      return;
    }
    setMsgImport(`${nuovi.length} servizi aggiunti al listino.`);
    carica();
    window.setTimeout(() => setMsgImport(""), 2500);
  }

  return (
    <PageContainer>
      <Link to="/impostazioni" className="inline-flex items-center gap-1.5 text-sm text-brand-navy/60 transition hover:text-brand-navy">
        <ArrowLeft size={14} weight="bold" />
        Torna alle impostazioni
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-navy">I miei servizi</h1>
          <p className="mt-1 text-brand-navy/60">Il tuo listino prezzi, da riusare velocemente nei preventivi.</p>
        </div>
        <button
          onClick={apriNuovo}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-teal/25 transition hover:bg-brand-teal/90 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          Nuovo servizio
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-edge-faint bg-surface p-6 shadow-sm shadow-brand-navy/[0.03]">
        <h2 className="text-sm font-semibold text-brand-navy">Importa servizi</h2>
        <p className="mt-1 text-sm text-brand-navy/60">
          Incolla testo, carica una foto del listino o registra un vocale. L&apos;AI estrae i servizi automaticamente.
        </p>
        <div className={`mt-4 ${importando ? "pointer-events-none opacity-60" : ""}`}>
          <ListinoSmartPanel
            servizi={[]}
            onServiziChange={() => {}}
            onImportServizi={importaServiziSmart}
          />
        </div>
        {msgImport && <p className="mt-3 text-sm text-brand-teal-ink">{msgImport}</p>}
      </div>

      {loading && <p className="mt-4 text-brand-navy/60">Caricamento...</p>}
      {!loading && servizi.length === 0 && <p className="mt-4 text-brand-navy/60">Nessun servizio ancora.</p>}

      {!loading && servizi.length > 0 && (
        <div className="mt-6 pb-20">
          <div className="rounded-2xl border border-edge-faint bg-surface p-4 shadow-sm shadow-brand-navy/[0.03]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-brand-teal-ink">Servizi salvati</h2>
                <p className="mt-0.5 text-sm text-brand-navy/55">
                  {servizi.length} {servizi.length === 1 ? "voce nel listino" : "voci nel listino"}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm text-brand-navy/60">
                  <CheckboxSelezione
                    checked={tuttiSelezionati}
                    indeterminate={parziale}
                    onChange={toggleTutti}
                    ariaLabel="Seleziona tutti i servizi"
                  />
                  Seleziona tutti
                </label>
                <div className="relative w-full sm:w-72">
                  <MagnifyingGlass
                    size={16}
                    weight="regular"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-navy/35"
                  />
                  <input
                    type="search"
                    value={ricerca}
                    onChange={(e) => setRicerca(e.target.value)}
                    placeholder="Cerca per nome o descrizione"
                    className="w-full rounded-xl border border-edge bg-brand-bg py-2 pr-3 pl-9 text-sm outline-none transition focus:border-brand-teal sm:w-72"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {serviziFiltrati.map((s) => {
                const selezionato = selezionati.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                      selezionato
                        ? "border-brand-teal bg-brand-teal/5"
                        : "border-edge-faint bg-surface hover:border-brand-teal/30 hover:shadow-sm"
                    }`}
                  >
                    <CheckboxSelezione
                      checked={selezionato}
                      onChange={() => toggle(s.id)}
                      ariaLabel={`Seleziona ${s.nome}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-brand-navy">{s.nome}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-brand-navy/60">
                        {s.descrizione || "Nessuna descrizione"}
                      </p>
                    </div>

                    <span className="hidden shrink-0 rounded-full border border-edge bg-brand-bg px-2.5 py-1 text-xs font-semibold text-brand-navy/65 sm:inline-flex">
                      {s.unita}
                    </span>

                    <div className="w-28 shrink-0 text-right text-sm font-bold text-brand-navy">
                      {formatImporto(s.costo)}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => apriModifica(s)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-navy/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-ink"
                        aria-label={`Modifica ${s.nome}`}
                        title="Modifica"
                      >
                        <PencilSimple size={16} weight="regular" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void duplicaServizio(s)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-navy/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-ink"
                        aria-label={`Duplica ${s.nome}`}
                        title="Duplica"
                      >
                        <Copy size={16} weight="regular" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminaSingolo(s.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-navy/35 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Elimina ${s.nome}`}
                        title="Elimina"
                      >
                        <Trash size={16} weight="regular" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {serviziFiltrati.length === 0 && (
                <p className="rounded-2xl border border-dashed border-edge bg-brand-bg p-6 text-center text-sm text-brand-navy/55">
                  Nessun servizio trovato.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <BarraSelezione
        count={selezionati.length}
        onCancel={annulla}
        onDelete={eliminaSelezionati}
        etichetta="servizi selezionati"
      />

      {modalAperto && (
        <ServizioModal
          servizio={servizioInEdit}
          ordineSuccessivo={servizi.length}
          onClose={() => setModalAperto(false)}
          onSaved={carica}
        />
      )}
    </PageContainer>
  );
}
