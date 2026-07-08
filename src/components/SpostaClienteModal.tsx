import { useEffect, useState } from "react";
import { User } from "@phosphor-icons/react";
import { useAppModalKeyboard } from "./ModalShell";

type ClienteOpzione = { id: string; nome: string };

type Props = {
  titolo?: string;
  onClose: () => void;
  onSeleziona: (cliente: ClienteOpzione) => void;
  caricaClienti: () => Promise<ClienteOpzione[]>;
};

export default function SpostaClienteModal({
  titolo = "Sposta a quale cliente?",
  onClose,
  onSeleziona,
  caricaClienti,
}: Props) {
  const [clienti, setClienti] = useState<ClienteOpzione[]>([]);
  const [loading, setLoading] = useState(true);

  useAppModalKeyboard(onClose);

  useEffect(() => {
    caricaClienti().then((data) => {
      setClienti(data);
      setLoading(false);
    });
  }, [caricaClienti]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border border-edge-faint bg-surface shadow-xl shadow-brand-navy/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-edge-faint p-5">
          <h2 className="text-lg font-semibold text-brand-navy">{titolo}</h2>
        </div>

        <div className="overflow-y-auto p-2">
          {loading && <p className="px-3 py-4 text-sm text-brand-navy/60">Caricamento...</p>}
          {!loading && clienti.length === 0 && (
            <p className="px-3 py-4 text-sm text-brand-navy/60">Nessun cliente disponibile.</p>
          )}
          {!loading &&
            clienti.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => onSeleziona(cliente)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-brand-navy transition hover:bg-brand-bg"
              >
                <User size={16} weight="regular" className="text-brand-navy/40" />
                <span>{cliente.nome}</span>
              </button>
            ))}
        </div>

        <div className="border-t border-edge-faint p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-edge px-4 py-2.5 text-sm font-medium text-brand-navy/70 transition hover:bg-brand-bg"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
