import ModalShell from "./ModalShell";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  zClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Elimina",
  cancelLabel = "Annulla",
  destructive = true,
  zClass = "z-[60]",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ModalShell
      title={title}
      titleId="confirm-dialog-title"
      onClose={onCancel}
      onConfirm={onConfirm}
      onBackdropClick={onCancel}
      zClass={zClass}
      panelClassName="w-full max-w-md rounded-2xl border border-edge-faint bg-surface p-6 shadow-xl shadow-brand-navy/10"
      contentClassName="mt-4"
    >
      <p className="whitespace-pre-line text-sm leading-relaxed text-brand-navy/70">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-edge py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-bg"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] ${
            destructive ? "bg-red-600 shadow-red-600/25 hover:bg-red-700" : "bg-brand-teal shadow-brand-teal/25 hover:bg-brand-teal/90"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
