import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { mergeMessaggiCliente, type MessaggiClienteTemplates } from "previcloud-shared";
import type { Json } from "./database.types";
import { invalidaCacheMessaggiCliente } from "./messaggiCliente";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Codice Postgrest per "nessuna riga trovata" (.single() su 0 risultati) — è l'unico
// errore che rappresenta legittimamente un profilo non ancora creato, non un fetch fallito.
const NESSUNA_RIGA_TROVATA = "PGRST116";

export interface SettingsForm {
  nome_azienda: string;
  categoria: string;
  citta: string;
  piva: string;
  telefono: string;
  tono: string;
  colore_brand: string;
  note_pagamento: string;
  firma_nome: string;
  reminder_firma_giorni: number;
  reminder_firma_globale_disabilitato: boolean;
  messaggi: MessaggiClienteTemplates;
}

type SettingsProfile = {
  [K in keyof Omit<SettingsForm, "messaggi">]?: SettingsForm[K] | null;
} & {
  logo_url?: string | null;
  messaggi_cliente?: Partial<MessaggiClienteTemplates> | Json | null;
};

function messaggiDaProfilo(
  value: SettingsProfile["messaggi_cliente"],
): Partial<MessaggiClienteTemplates> | null | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Partial<MessaggiClienteTemplates>;
}

function normalizzaFormProfilo(data: SettingsProfile): SettingsForm {
  return {
    nome_azienda: data.nome_azienda || "",
    categoria: data.categoria || "videomaker",
    citta: data.citta || "",
    piva: data.piva || "",
    telefono: data.telefono || "",
    tono: data.tono || "professionale e diretto",
    colore_brand: data.colore_brand || "0D1B2A",
    note_pagamento: data.note_pagamento || "",
    firma_nome: data.firma_nome || "",
    reminder_firma_giorni: typeof data.reminder_firma_giorni === "number" ? data.reminder_firma_giorni : 3,
    reminder_firma_globale_disabilitato: Boolean(data.reminder_firma_globale_disabilitato),
    messaggi: mergeMessaggiCliente(messaggiDaProfilo(data.messaggi_cliente)),
  };
}

export async function caricaSettingsData(): Promise<{ form: SettingsForm | null; logoUrl: string; error: PostgrestError | null } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // Un profilo mancante (PGRST116) è legittimo per un utente nuovo; qualsiasi altro
  // errore (rete, RLS, timeout) va segnalato invece di restituire i default in silenzio,
  // altrimenti i chiamanti rischiano di trattare i default come dati reali e salvarli.
  const fetchError = error && error.code !== NESSUNA_RIGA_TROVATA ? error : null;

  return {
    form: fetchError ? null : normalizzaFormProfilo(profile ?? {}),
    logoUrl: profile?.logo_url || "",
    error: fetchError,
  };
}

export async function salvaProfiloSettings(form: SettingsForm) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Utente non autenticato" } };

  const { messaggi, ...profileFields } = form;
  const result = await supabase.from("profiles").update({
    ...profileFields,
    messaggi_cliente: messaggi,
  }).eq("id", user.id);
  if (!result.error) invalidaCacheMessaggiCliente();
  return result;
}

export async function sessionToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || "";
}

export async function uploadLogoSettings({
  logoBase64,
  mimeType,
  token,
}: {
  logoBase64: string;
  mimeType: string;
  token: string;
}) {
  if (!token) throw new Error("Token mancante");
  const res = await fetch(`${BACKEND_URL}/api/upload-logo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ logo_base64: logoBase64, mime_type: mimeType || "image/png" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Errore server (${res.status})`);
  if (data.error) throw new Error(data.error);
  if (!data.logo_url) throw new Error("Risposta server non valida");
  return data.logo_url as string;
}
