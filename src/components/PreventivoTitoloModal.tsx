import { useState } from "react";
import type { FormEvent } from "react";
import { useAppModalKeyboard, useModalBackdropClose } from "./ModalShell";

type Props = {
  titoloIniziale: string;
  onClose: () => void;
  onSalva: (titolo: string) => Promise<void>;
};

export default function PreventivoTitoloModal({ titoloIniziale, onClose, onSalva }: Props) {
  useAppModalKeyboard(onClose);
  const { handleBackdropMouseDown, handleBackdropMouseUp } = useModalBackdropClose(onClose);

  const [titolo, setTitolo] = useState(titoloIniziale);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalva(titolo);
      onClose();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 p-4 backdrop-blur-[2px]"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-edge-faint bg-surface p-5 shadow-xl shadow-brand-navy/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-brand-navy">Rinomina preventivo</h2>
        <input
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
          placeholder="es. Preventivo caldaia"
          autoFocus
          className="mt-4 w-full rounded-lg border border-edge px-3 py-2 text-sm outline-none transition focus:border-brand-teal"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-edge px-4 py-2.5 text-sm font-medium text-brand-navy/70 transition hover:bg-brand-bg"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90 active:scale-[0.98] disabled:opacity-60"
          >
            {salvando ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </form>
    </div>
  );
}
