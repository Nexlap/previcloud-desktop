import { X } from "@phosphor-icons/react";

type Props = {
  count: number;
  onCancel: () => void;
  onDelete: () => void;
  onMove?: () => void;
  etichetta?: string;
};

export default function BarraSelezione({
  count,
  onCancel,
  onDelete,
  onMove,
  etichetta = "selezionati",
}: Props) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-56 right-0 z-30 border-t border-edge bg-surface px-6 py-3 shadow-[0_-4px_12px_rgba(13,27,42,0.06)]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-navy/60 transition hover:bg-brand-bg hover:text-brand-navy"
            aria-label="Annulla selezione"
          >
            <X size={16} weight="bold" />
          </button>
          <span className="text-sm font-medium text-brand-navy">
            {count} {etichetta}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onMove && (
            <button
              type="button"
              onClick={onMove}
              className="rounded-xl border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-bg active:scale-[0.98]"
            >
              Sposta
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition hover:bg-red-700 active:scale-[0.98]"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}
