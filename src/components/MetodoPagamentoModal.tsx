import { X, Check } from "@phosphor-icons/react";
import { iconaMetodoPagamento, type MetodoPagamento } from "../lib/pagamenti";
import { trackEvento } from "../lib/track";

type Props = {
  open: boolean;
  metodiPagamento: MetodoPagamento[];
  metodoPagamentoSelezionato: MetodoPagamento | null;
  metodoPagamentoNessuno: boolean;
  onClose: () => void;
  onSelect: (metodo: MetodoPagamento) => void;
  onSelectNessuno: () => void;
};

export default function MetodoPagamentoModal({
  open,
  metodiPagamento,
  metodoPagamentoSelezionato,
  metodoPagamentoNessuno,
  onClose,
  onSelect,
  onSelectNessuno,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-edge-faint bg-surface shadow-xl shadow-brand-navy/10">
        <div className="flex items-center justify-between border-b border-edge-faint px-5 py-4">
          <h2 className="text-base font-semibold text-brand-navy">Metodo pagamento</h2>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-navy/50 transition hover:bg-brand-navy/5 hover:text-brand-navy">
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto p-4">
          <button
            type="button"
            onClick={() => {
              onSelectNessuno();
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
              metodoPagamentoNessuno
                ? "border-brand-teal bg-brand-teal/5"
                : "border-edge bg-surface hover:border-brand-teal/30"
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center text-base text-brand-navy/40">—</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-navy">Nessuno / da concordare</p>
              <p className="text-xs text-brand-navy/50">Nessun metodo indicato nel preventivo</p>
            </div>
            {metodoPagamentoNessuno && <Check size={16} weight="bold" className="text-brand-teal-ink" />}
          </button>

          <div className="border-t border-edge pt-2" />

          {metodiPagamento.map((m) => {
            const attivo = !metodoPagamentoNessuno && metodoPagamentoSelezionato?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  void trackEvento("metodo_pagamento_selezionato", "builder", { tipo: m.tipo });
                  onSelect(m);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                  attivo ? "border-brand-teal bg-brand-teal/5" : "border-edge bg-surface hover:border-brand-teal/30"
                }`}
              >
                <span className="text-xl">{iconaMetodoPagamento(m.tipo)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-navy">{m.nome}</p>
                  {m.tipo === "bonifico" && m.dati?.iban && (
                    <p className="truncate text-xs text-brand-navy/50">{m.dati.iban}</p>
                  )}
                  {m.tipo === "paypal" && m.dati?.email && (
                    <p className="truncate text-xs text-brand-navy/50">{m.dati.email}</p>
                  )}
                </div>
                {attivo && <Check size={16} weight="bold" className="text-brand-teal-ink" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
