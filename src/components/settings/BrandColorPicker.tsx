import { CaretDown, Check } from "@phosphor-icons/react";
import { COLORI_BRAND, normalizzaHexColore } from "../../lib/settingsConstants";

type Props = {
  value: string;
  onChange: (val: string) => void;
  expanded: boolean;
  onToggle: () => void;
};

export default function BrandColorPicker({ value, onChange, expanded, onToggle }: Props) {
  const hex = normalizzaHexColore(value || "0D1B2A") || "0D1B2A";

  return (
    <div className="rounded-2xl border border-edge-faint bg-surface shadow-sm shadow-brand-navy/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-brand-bg/40"
      >
        <span className="text-sm font-semibold text-brand-navy">Colore brand</span>
        <span className="flex items-center gap-2">
          <span className="text-sm text-brand-navy/60">#{hex}</span>
          <span
            className="h-6 w-6 shrink-0 rounded-md border border-edge"
            style={{ backgroundColor: `#${hex}` }}
          />
          <CaretDown size={14} weight="bold" className={`text-brand-navy/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-edge-faint px-4 py-4">
          <p className="text-xs text-brand-navy/50">Usato nell&apos;intestazione e nei dettagli del PDF</p>
          <div className="flex flex-wrap gap-2">
            {COLORI_BRAND.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition ${
                  hex === c ? "border-brand-teal ring-2 ring-brand-teal/30" : "border-transparent"
                }`}
                style={{ backgroundColor: `#${c}` }}
                aria-label={`Colore ${c}`}
              >
                {hex === c ? <Check size={16} weight="bold" className="text-white drop-shadow" /> : null}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={hex}
              onChange={(e) => onChange(normalizzaHexColore(e.target.value))}
              placeholder="0D1B2A"
              maxLength={6}
              className="w-full rounded-lg border border-edge px-3 py-2 text-sm uppercase outline-none transition focus:border-brand-teal"
            />
            <span
              className="h-10 w-10 shrink-0 rounded-lg border border-edge"
              style={{ backgroundColor: `#${hex}` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
