import { Link, useSearchParams } from "react-router";
import { PencilSimpleLine, Microphone, ListBullets, CaretRight } from "@phosphor-icons/react";
import PageContainer from "../components/PageContainer";
import { queryClienteNuovoPreventivo } from "../lib/nuovoNav";

const opzioni = [
  {
    to: "/nuovo/chat",
    icon: <PencilSimpleLine size={24} weight="regular" />,
    titolo: "Scrivi in chat",
    descrizione: "Descrivi il lavoro a testo, l'assistente AI ti farà le domande giuste.",
  },
  {
    to: "/nuovo/registra",
    icon: <Microphone size={24} weight="regular" />,
    titolo: "Registra voce",
    descrizione: "Parla del lavoro, trascrivo e genero automaticamente.",
  },
  {
    to: "/nuovo/manuale",
    icon: <ListBullets size={24} weight="regular" />,
    titolo: "Builder manuale",
    descrizione: "Seleziona i servizi dal listino e assembla il preventivo voce per voce.",
  },
];

export default function NuovoHub() {
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get("cliente_id") ?? undefined;
  const clienteNome = searchParams.get("cliente_nome") ?? undefined;
  const queryCliente = queryClienteNuovoPreventivo(clienteId, clienteNome);

  return (
    <PageContainer>
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-8">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-brand-navy">Nuovo preventivo</h1>
          <p className="mt-2 text-sm text-brand-navy/60">Come vuoi iniziare?</p>
        </div>

        <div className="mt-8 w-full max-w-lg space-y-3">
          {opzioni.map((opzione) => (
            <Link
              key={opzione.to}
              to={`${opzione.to}${queryCliente}`}
              className="group flex items-center gap-4 rounded-2xl border border-edge-faint bg-surface p-5 shadow-sm shadow-brand-navy/[0.03] transition hover:border-brand-teal/25 hover:shadow-md hover:shadow-brand-teal/5 active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition group-hover:bg-brand-teal group-hover:text-white">
                {opzione.icon}
              </span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-brand-navy">{opzione.titolo}</p>
                <p className="mt-0.5 text-sm text-brand-navy/60">{opzione.descrizione}</p>
              </div>
              <span className="text-brand-navy/30 transition group-hover:translate-x-0.5 group-hover:text-brand-teal">
                <CaretRight size={18} weight="bold" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
