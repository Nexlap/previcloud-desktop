import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { PencilSimpleLine, Microphone, ListBullets, CaretRight } from "@phosphor-icons/react";
import type { ModificaPreventivoInput } from "../lib/modificaPreventivo/apriModificaPreventivo";
import { paramsRouterModifica } from "../lib/modificaPreventivo/apriModificaPreventivo";
import { MODIFICA_VERSIONE_MODAL_SUB } from "../lib/modificaPreventivo/constants";
import { setModificaSession } from "../lib/modificaPreventivo/modificaSession";
import { useAppModalKeyboard } from "./ModalShell";

type Props = {
  open: boolean;
  input: ModificaPreventivoInput | null;
  onClose: () => void;
};

const OPZIONI: {
  icon: ReactNode;
  title: string;
  sub: string;
  path: string;
}[] = [
  {
    icon: <ListBullets size={22} weight="regular" />,
    title: "Builder manuale",
    sub: "Modifica servizi, rimborsi e pagamento dal form",
    path: "/nuovo/manuale",
  },
  {
    icon: <PencilSimpleLine size={22} weight="regular" />,
    title: "Chat",
    sub: "Descrivi le modifiche all'AI a testo",
    path: "/nuovo/chat",
  },
  {
    icon: <Microphone size={22} weight="regular" />,
    title: "Registra voce",
    sub: "Parla delle modifiche da fare",
    path: "/nuovo/registra",
  },
];

export default function ModificaPreventivoModal({ open, input, onClose }: Props) {
  const navigate = useNavigate();

  useAppModalKeyboard(onClose, { enabled: open && !!input });

  if (!open || !input) return null;

  function scegli(path: string) {
    setModificaSession(input!);
    const qs = new URLSearchParams(paramsRouterModifica(input!)).toString();
    onClose();
    navigate(`${path}?${qs}`);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-navy/45 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-brand-bg p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modifica-preventivo-titolo"
      >
        <h2 id="modifica-preventivo-titolo" className="text-lg font-semibold text-brand-navy">
          Modifica preventivo
        </h2>
        <p className="mt-1 text-sm text-brand-navy/60">{MODIFICA_VERSIONE_MODAL_SUB}</p>

        <div className="mt-4 space-y-3">
          {OPZIONI.map((op) => (
            <button
              key={op.path}
              type="button"
              onClick={() => scegli(op.path)}
              className="flex w-full items-center gap-4 rounded-2xl border border-edge-faint bg-surface p-4 text-left shadow-sm shadow-brand-navy/[0.03] transition-colors hover:bg-brand-bg/80"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal-ink">
                {op.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-brand-navy">{op.title}</span>
                <span className="mt-0.5 block text-sm text-brand-navy/60">{op.sub}</span>
              </span>
              <span className="text-brand-navy/30">
                <CaretRight size={18} weight="bold" />
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-center text-sm font-semibold text-brand-navy/60 transition hover:text-brand-navy"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
