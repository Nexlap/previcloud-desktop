import { parseImportoEuro } from "previcloud-shared";
import { supabase } from "./supabase";
import { oggiItItLabel } from "./format";
import { sessionToken } from "./settings";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const ONBOARDING_CATEGORIE = [
  "videomaker",
  "fotografo",
  "catering",
  "falegname",
  "estetista",
  "elettricista",
  "idraulico",
  "imbianchino",
  "consulente",
  "altro",
] as const;

const DEMO_NOME_AZIENDA: Record<string, string> = {
  videomaker: "Studio Visivo Productions",
  fotografo: "Foto Art Studio",
  catering: "Sapori Eventi Catering",
  falegname: "Bottega Legno Vivo",
  estetista: "Essenza Beauty Studio",
  elettricista: "Elettro Service Roma",
  idraulico: "IdroCasa Service",
  imbianchino: "Colori & Pareti",
  consulente: "Strategia Pratica Consulting",
  altro: "Studio Professionale Demo",
};

function testoDemoOnboarding(): string {
  const data = oggiItItLabel();
  return `PREVENTIVO
Data: ${data}  |  Validità: 30 giorni

SERVIZI:

SERVIZIO: Consulenza e progettazione
DETTAGLI:
- Analisi esigenze del cliente
- Proposta operativa personalizzata
PREZZO: €500,00

SERVIZIO: Esecuzione lavori
DETTAGLI:
- Materiali e manodopera inclusi
- Collaudo finale
PREZZO: €1.200,00

RIEPILOGO:
Imponibile: €1.700,00
IVA 22%: €374,00
TOTALE: €2.074,00

Note: Preventivo dimostrativo PreviCloud
PAGAMENTO: Bonifico bancario`;
}

export async function hasCompletedProfile(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_completato")
    .eq("id", user.id)
    .single();

  // PGRST116 (nessuna riga trovata) è legittimo per un utente nuovo; qualsiasi altro
  // errore (rete/RLS/timeout) va propagato invece di restituire false in silenzio,
  // altrimenti un utente esistente rischia di essere rimandato a /onboarding.
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return Boolean(profile?.onboarding_completato);
}

/**
 * Come hasCompletedProfile(), ma con un retry singolo e fallback sicuro: se la fetch
 * fallisce anche al secondo tentativo, non forza mai /onboarding per un errore di rete
 * (un utente esistente perderebbe il profilo di vista) — assume profilo completo e
 * logga l'errore per essere investigato.
 */
export async function hasCompletedProfileSicuro(): Promise<boolean> {
  try {
    return await hasCompletedProfile();
  } catch (err: unknown) {
    console.error("[onboarding] hasCompletedProfile: primo tentativo fallito, riprovo", err);
    try {
      return await hasCompletedProfile();
    } catch (err2: unknown) {
      console.error("[onboarding] hasCompletedProfile: fallito anche il retry", err2);
      return true;
    }
  }
}

export async function generaPreviewOnboarding(template: string, categoria: string, firmaNome: string) {
  const token = await sessionToken();
  if (!token) throw new Error("Sessione non valida");

  const categoriaDemo = categoria in DEMO_NOME_AZIENDA ? categoria : "altro";
  const nomeAziendaDemo = DEMO_NOME_AZIENDA[categoriaDemo];

  const res = await fetch(`${BACKEND_URL}/api/genera-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      testo: testoDemoOnboarding(),
      template,
      versione_padre_id: null,
      demo_profile: {
        nome_azienda: nomeAziendaDemo,
        citta: "Roma",
        piva: "12345678901",
        telefono: "06 1234567",
        firma_nome: firmaNome.trim() || nomeAziendaDemo,
      },
      demo_cliente: {
        nome: "Marco Bianchi",
        email: "marco.bianchi@email.it",
        telefono: "333 1234567",
        indirizzo: "Via Roma 24, 00100 Roma",
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Errore server (${res.status})`);
  if (data.error) throw new Error(data.error);
  return data.html as string;
}

export async function completaOnboarding({
  nomeAzienda,
  citta,
  categoria,
  templateScelto,
  firmaNome,
  servizi = [],
}: {
  nomeAzienda: string;
  citta: string;
  categoria: string;
  templateScelto: string;
  firmaNome: string;
  servizi?: Array<{ nome: string; descrizione: string; costo: string; unita: string }>;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Utente non autenticato" } };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    nome_azienda: nomeAzienda.trim(),
    citta: citta.trim(),
    categoria,
    template_preferito: templateScelto,
    firma_nome: firmaNome.trim(),
    onboarding_completato: true,
  });

  if (error) return { error };

  if (servizi.length > 0) {
    const rows = servizi.map((servizio, index) => {
      const trimmed = servizio.costo.trim();
      const costo = trimmed ? parseImportoEuro(trimmed) : null;
      if (trimmed && costo === null) return null;
      return {
        user_id: user.id,
        nome: servizio.nome.trim(),
        descrizione: servizio.descrizione.trim() || null,
        costo,
        unita: servizio.unita || "cad",
        ordine: index,
      };
    });
    if (rows.some((row) => row === null)) {
      return { error: { message: "Uno o più costi non sono validi." } };
    }
    const { error: serviziError } = await supabase.from("servizi").insert(rows as NonNullable<(typeof rows)[number]>[]);
    if (serviziError) return { error: serviziError };
  }

  return { error: null };
}
