import { Link } from "react-router";
import type { PianoPagamentoTipo } from "../../lib/nuovoDraft";
import type { RateAccontoTipo } from "previcloud-shared";
import BuilderClienteCard from "../BuilderClienteCard";
import BuilderPianoPagamentoCard from "../builder/BuilderPianoPagamentoCard";
import PreventivoPdfTemplatePicker from "../PreventivoPdfTemplatePicker";
import PreventivoPdfPreview from "../PreventivoPdfPreview";
import ToggleSwitch from "../ToggleSwitch";

type Props = {
  clienti: { id: string; nome: string }[];
  clienteSelezionatoId: string;
  onSelectCliente: (id: string) => void;
  onClearCliente: () => void;
  onNuovoCliente: () => void;
  template: string;
  onSelectTemplate: (template: string) => void;
  pianoPagamentoTipo: PianoPagamentoTipo;
  onChangePianoPagamentoTipo: (tipo: PianoPagamentoTipo) => void;
  importoAnteprima: number;
  rateAccontoTipo: RateAccontoTipo;
  rateAccontoValore: string;
  rateNumero: string;
  rateGiornoScadenza: string;
  rateMeseInizio: string;
  rateVisibileNelPDF: boolean;
  onChangeRateAccontoTipo: (tipo: RateAccontoTipo) => void;
  onChangeRateAccontoValore: (value: string) => void;
  onChangeRateNumero: (value: string) => void;
  onChangeRateGiornoScadenza: (value: string) => void;
  onChangeRateMeseInizio: (value: string) => void;
  onChangeRateVisibileNelPDF: (value: boolean) => void;
  abImporto: string;
  abGiorno: string;
  abMeseInizio: string;
  abMensilita: string;
  abVisibileNelPDF: boolean;
  onChangeAbImporto: (value: string) => void;
  onChangeAbGiorno: (value: string) => void;
  onChangeAbMeseInizio: (value: string) => void;
  onChangeAbMensilita: (value: string) => void;
  onChangeAbVisibileNelPDF: (value: boolean) => void;
  mode: "chat" | "manuale";
  nascondiPrezzi: boolean;
  onNascondiPrezziChange: (value: boolean) => void;
  onGeneraPdf: () => void;
  generandoPdf: boolean;
  preventivo: string;
  onSalva: () => void;
  salvataggioInCorso: boolean;
  salvato: boolean;
  pdfUrl: string;
  onApriPdf: () => void;
  messaggioSuccesso: string;
  errore: string;
  htmlPreview: string;
  caricandoPreview: boolean;
};

export default function NuovoAnteprimaView({
  clienti,
  clienteSelezionatoId,
  onSelectCliente,
  onClearCliente,
  onNuovoCliente,
  template,
  onSelectTemplate,
  pianoPagamentoTipo,
  onChangePianoPagamentoTipo,
  importoAnteprima,
  rateAccontoTipo,
  rateAccontoValore,
  rateNumero,
  rateGiornoScadenza,
  rateMeseInizio,
  rateVisibileNelPDF,
  onChangeRateAccontoTipo,
  onChangeRateAccontoValore,
  onChangeRateNumero,
  onChangeRateGiornoScadenza,
  onChangeRateMeseInizio,
  onChangeRateVisibileNelPDF,
  abImporto,
  abGiorno,
  abMeseInizio,
  abMensilita,
  abVisibileNelPDF,
  onChangeAbImporto,
  onChangeAbGiorno,
  onChangeAbMeseInizio,
  onChangeAbMensilita,
  onChangeAbVisibileNelPDF,
  mode,
  nascondiPrezzi,
  onNascondiPrezziChange,
  onGeneraPdf,
  generandoPdf,
  preventivo,
  onSalva,
  salvataggioInCorso,
  salvato,
  pdfUrl,
  onApriPdf,
  messaggioSuccesso,
  errore,
  htmlPreview,
  caricandoPreview,
}: Props) {
  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:items-stretch">
      <div className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-edge-faint bg-surface shadow-sm shadow-brand-navy/[0.03] lg:w-[400px]">
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <PreventivoPdfTemplatePicker embedded template={template} onSelectTemplate={onSelectTemplate} />

          <div className="mt-5 border-t border-edge-faint pt-5">
            <BuilderClienteCard
              compact
              clienti={clienti}
              clienteSelezionatoId={clienteSelezionatoId}
              onSelect={onSelectCliente}
              onClear={onClearCliente}
              onNuovoCliente={onNuovoCliente}
            />
          </div>

          <div className="mt-5 border-t border-edge-faint pt-5">
            <BuilderPianoPagamentoCard
              tipo={pianoPagamentoTipo}
              onChangeTipo={onChangePianoPagamentoTipo}
              importoTotale={importoAnteprima}
              rateAccontoTipo={rateAccontoTipo}
              rateAccontoValore={rateAccontoValore}
              rateNumero={rateNumero}
              rateGiornoScadenza={rateGiornoScadenza}
              rateMeseInizio={rateMeseInizio}
              rateVisibileNelPDF={rateVisibileNelPDF}
              onChangeRateAccontoTipo={onChangeRateAccontoTipo}
              onChangeRateAccontoValore={onChangeRateAccontoValore}
              onChangeRateNumero={onChangeRateNumero}
              onChangeRateGiornoScadenza={onChangeRateGiornoScadenza}
              onChangeRateMeseInizio={onChangeRateMeseInizio}
              onChangeRateVisibileNelPDF={onChangeRateVisibileNelPDF}
              abImporto={abImporto}
              abGiorno={abGiorno}
              abMeseInizio={abMeseInizio}
              abMensilita={abMensilita}
              abVisibileNelPDF={abVisibileNelPDF}
              onChangeAbImporto={onChangeAbImporto}
              onChangeAbGiorno={onChangeAbGiorno}
              onChangeAbMeseInizio={onChangeAbMeseInizio}
              onChangeAbMensilita={onChangeAbMensilita}
              onChangeAbVisibileNelPDF={onChangeAbVisibileNelPDF}
            />
          </div>

          {mode === "manuale" && (
            <div className="mt-5 rounded-2xl border border-edge-faint bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-brand-navy">Tariffa a corpo</h3>
                  <p className="mt-0.5 text-xs text-brand-navy/50">
                    Nasconde i prezzi delle singole voci - mostra solo il totale
                  </p>
                </div>
                <ToggleSwitch checked={nascondiPrezzi} onChange={onNascondiPrezziChange} />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-edge-faint p-5">
          <div className="flex flex-col gap-3">
            <button
              onClick={onGeneraPdf}
              disabled={generandoPdf || !preventivo}
              className="w-full rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-navy/90 active:scale-[0.99] disabled:opacity-60"
            >
              {generandoPdf ? "Generazione PDF..." : "Genera PDF"}
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onSalva}
                disabled={salvataggioInCorso || salvato}
                className="rounded-lg border border-brand-teal px-5 py-2.5 text-sm font-medium text-brand-teal-ink transition hover:bg-brand-teal/5 active:scale-[0.99] disabled:opacity-60"
              >
                {salvato ? "Salvato" : salvataggioInCorso ? "Salvataggio..." : "Salva nello storico"}
              </button>
              {salvato && (
                <Link to="/storico" className="text-sm text-brand-teal-ink hover:underline">
                  Vai allo storico →
                </Link>
              )}
              {pdfUrl && (
                <button
                  type="button"
                  onClick={onApriPdf}
                  className="text-sm text-brand-teal-ink hover:underline"
                >
                  Apri PDF
                </button>
              )}
            </div>

            {messaggioSuccesso && <p className="text-sm text-brand-teal-ink">{messaggioSuccesso}</p>}
            {errore && <p className="text-sm text-red-600">{errore}</p>}
          </div>
        </div>
      </div>

      <PreventivoPdfPreview
        html={htmlPreview}
        loading={caricandoPreview}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
