import { useEffect, useMemo, useRef, useState } from "react";
import { User, X, MagnifyingGlass, CaretDown } from "@phosphor-icons/react";

const ANTEPRIMA_SENZA_RICERCA = 5;
const MAX_RISULTATI_RICERCA = 8;

type ClienteOpzione = {
  id: string;
  nome: string;
};

type Props = {
  clienti: ClienteOpzione[];
  clienteSelezionatoId: string;
  onSelect: (id: string) => void;
  onClear: () => void;
  onNuovoCliente: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export default function BuilderClienteCard({
  clienti,
  clienteSelezionatoId,
  onSelect,
  onClear,
  onNuovoCliente,
  disabled = false,
  compact = false,
}: Props) {
  const [ricerca, setRicerca] = useState("");
  const [mostraRicerca, setMostraRicerca] = useState(!clienteSelezionatoId);
  const [listaAperta, setListaAperta] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clienteSelezionatoId) setMostraRicerca(false);
  }, [clienteSelezionatoId]);

  useEffect(() => {
    if (!listaAperta) return;

    function chiudi(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setListaAperta(false);
      }
    }

    document.addEventListener("mousedown", chiudi);
    return () => document.removeEventListener("mousedown", chiudi);
  }, [listaAperta]);

  const clienteSelezionato = clienti.find((c) => c.id === clienteSelezionatoId) ?? null;

  const clientiFiltrati = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    if (!q) return clienti;
    return clienti.filter((c) => c.nome.toLowerCase().includes(q));
  }, [clienti, ricerca]);

  const haRicerca = ricerca.trim().length > 0;
  const clientiVisibili = haRicerca
    ? clientiFiltrati.slice(0, MAX_RISULTATI_RICERCA)
    : clientiFiltrati.slice(0, ANTEPRIMA_SENZA_RICERCA);
  const clientiNascosti = clientiFiltrati.length - clientiVisibili.length;

  function seleziona(id: string) {
    onSelect(id);
    setMostraRicerca(false);
    setRicerca("");
    setListaAperta(false);
  }

  function rimuovi() {
    onClear();
    setMostraRicerca(true);
    setRicerca("");
    setListaAperta(false);
  }

  function apriLista() {
    if (!disabled) setListaAperta(true);
  }

  const wrapperClass = compact
    ? "space-y-3"
    : "mb-8 rounded-2xl border border-edge-faint bg-surface p-4 shadow-sm shadow-brand-navy/[0.03]";

  return (
    <div className={wrapperClass}>
      <div className="flex items-center gap-2">
        <span className="text-brand-teal-ink">
          <User size={16} weight="regular" />
        </span>
        <div>
          <p className="text-base font-bold text-brand-teal-ink">Cliente</p>
          {!compact && <p className="text-xs text-brand-navy/50">Opzionale — i dati appariranno nel PDF</p>}
        </div>
      </div>

      {clienteSelezionato && !mostraRicerca ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-teal bg-brand-teal/5 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal-ink">
            <User size={16} weight="regular" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-navy">{clienteSelezionato.nome}</p>
          </div>
          {!disabled && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMostraRicerca(true);
                  setListaAperta(false);
                }}
                className="text-xs font-medium text-brand-teal-ink hover:underline"
              >
                Cambia
              </button>
              <button
                type="button"
                onClick={rimuovi}
                className="rounded-lg p-1 text-brand-navy/40 transition hover:bg-brand-navy/5 hover:text-brand-navy"
                aria-label="Rimuovi cliente"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div ref={rootRef} className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-brand-navy/40">
              <MagnifyingGlass size={16} weight="regular" />
            </span>
            <input
              type="search"
              value={ricerca}
              onChange={(e) => {
                setRicerca(e.target.value);
                setListaAperta(true);
              }}
              onFocus={apriLista}
              disabled={disabled}
              placeholder={
                clienti.length > 0
                  ? `Cerca tra ${clienti.length} clienti...`
                  : "Cerca cliente per nome..."
              }
              className="w-full rounded-xl border border-edge bg-brand-bg py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-brand-teal disabled:opacity-60"
            />
            {!disabled && clienti.length > 0 && (
              <button
                type="button"
                onClick={() => setListaAperta((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-brand-navy/40 transition hover:bg-brand-navy/5 hover:text-brand-navy"
                aria-label={listaAperta ? "Chiudi lista clienti" : "Apri lista clienti"}
              >
                <CaretDown size={14} weight="bold" className={`transition-transform ${listaAperta ? "rotate-180" : ""}`} />
              </button>
            )}

            {listaAperta && !disabled && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-xl border border-edge-faint bg-surface shadow-lg shadow-brand-navy/10">
                <div className="max-h-52 overflow-y-auto p-1">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => seleziona("")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      !clienteSelezionatoId
                        ? "bg-brand-teal/10 font-medium text-brand-navy"
                        : "text-brand-navy/70 hover:bg-brand-bg"
                    }`}
                  >
                    Senza cliente
                  </button>

                  {clientiFiltrati.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-brand-navy/50">Nessun cliente trovato</p>
                  ) : (
                    clientiVisibili.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => seleziona(c.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          clienteSelezionatoId === c.id
                            ? "bg-brand-teal/10 font-medium text-brand-navy"
                            : "text-brand-navy/80 hover:bg-brand-bg"
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-bg text-brand-teal-ink">
                          <User size={13} weight="regular" />
                        </span>
                        <span className="truncate">{c.nome}</span>
                      </button>
                    ))
                  )}
                </div>

                {clientiNascosti > 0 && (
                  <p className="border-t border-edge-faint px-3 py-2 text-xs text-brand-navy/50">
                    {haRicerca
                      ? `Altri ${clientiNascosti} risultati — affina la ricerca`
                      : `Altri ${clientiNascosti} clienti — digita per filtrare`}
                  </p>
                )}

                {!haRicerca && clienti.length > ANTEPRIMA_SENZA_RICERCA && clientiNascosti === 0 && (
                  <p className="border-t border-edge-faint px-3 py-2 text-xs text-brand-navy/50">
                    Digita per filtrare l&apos;elenco completo
                  </p>
                )}
              </div>
            )}
          </div>

          {!listaAperta && !disabled && (
            <p className="text-xs text-brand-navy/45">
              {clienti.length === 0
                ? "Nessun cliente salvato — puoi crearne uno nuovo."
                : clienti.length <= ANTEPRIMA_SENZA_RICERCA
                  ? `${clienti.length} clienti — clicca la freccia o digita per scegliere`
                  : `${clienti.length} clienti — digita per cercare o apri l'elenco`}
            </p>
          )}

          {!disabled && (
            <div className="flex flex-wrap items-center gap-2">
              {!clienteSelezionatoId && (
                <button
                  type="button"
                  onClick={() => seleziona("")}
                  className="rounded-lg border border-edge bg-brand-bg px-3 py-1.5 text-xs font-medium text-brand-navy/70 transition hover:border-brand-teal/30 hover:text-brand-navy"
                >
                  Senza cliente
                </button>
              )}
              <button
                type="button"
                onClick={onNuovoCliente}
                className="rounded-lg border border-dashed border-brand-navy/15 bg-surface px-3 py-1.5 text-xs font-medium text-brand-teal-ink transition hover:border-brand-teal/40 hover:bg-brand-teal/5"
              >
                + Nuovo cliente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
