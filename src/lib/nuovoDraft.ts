/**
 * Persistenza bozza "Nuovo preventivo" in localStorage (chat e builder manuale).
 *
 * Accoppiato a `nuovoBozzaSnapshot.ts` (costruzione snapshot da stato React),
 * `nuovoRipresaPath.ts` (ultimo URL dentro /nuovo), `nuovoNav.ts` (dialog ripresa)
 * e `Nuovo.tsx` (orchestrazione). Due chiavi separate: una per chat, una per manuale;
 * `infoBozzaNuovoInSospeso` sceglie la bozza più recente via `aggiornatoAt`.
 */
import type { TrasfertaBuilder, VoceBuilder } from "./builder";
import type { MetodoPagamento } from "./pagamenti";
import type { Messaggio } from "./types";
import type { RateAccontoTipo } from "previcloud-shared";

export type PianoPagamentoTipo = "nessuno" | "acconto" | "rate" | "abbonamento";

const CHAT_KEY_LEGACY = "previcloud-nuovo-chat";
const MANUALE_KEY_LEGACY = "previcloud-nuovo-manuale";

function chatKey(userId: string): string {
  return `previcloud-nuovo-chat:${userId}`;
}

function manualeKey(userId: string): string {
  return `previcloud-nuovo-manuale:${userId}`;
}

/** Rimuove chiavi bozza pre-userId (una tantum; safe se assenti). */
export function pulisciBozzeNuovoLegacy() {
  try {
    localStorage.removeItem(CHAT_KEY_LEGACY);
    localStorage.removeItem(MANUALE_KEY_LEGACY);
  } catch {
    // private mode / storage non disponibile
  }
}

type NuovoChatDraft = {
  messaggi: Messaggio[];
  input: string;
  recap: string;
  preventivo: string;
  clienteSelezionatoId: string;
  clienteNome?: string;
  template: string;
  pdfUrl: string;
  aggiornatoAt?: string;
};

export type NuovoManualeDraft = {
  voci: VoceBuilder[];
  trasferte: TrasfertaBuilder[];
  mostraTrasferte: boolean;
  metodoPagamentoSelezionato: MetodoPagamento | null;
  metodoPagamentoNessuno: boolean;
  includiIva: boolean;
  noteExtra: string;
  mostraFiscale: boolean;
  nettoDesiderato: string;
  lordoCalcolato: number | null;
  storicoVoci: VoceBuilder[][];
  clienteSelezionatoId: string;
  clienteNome?: string;
  preventivo: string;
  template: string;
  pdfUrl: string;
  nascondiPrezzi: boolean;
  pianoPagamentoTipo: PianoPagamentoTipo;
  abImporto: string;
  abGiorno: string;
  abMeseInizio: string;
  abMensilita: string;
  abVisibileNelPDF: boolean;
  rateNumero: string;
  rateGiornoScadenza: string;
  rateMeseInizio: string;
  rateVisibileNelPDF: boolean;
  rateAccontoTipo: RateAccontoTipo;
  rateAccontoValore: string;
  scontoAttivo: boolean;
  scontoTipo: "percentuale" | "fisso";
  scontoValore: string;
  aggiornatoAt?: string;
};

export function scontoDraftDefault(): Pick<NuovoManualeDraft, "scontoAttivo" | "scontoTipo" | "scontoValore"> {
  return {
    scontoAttivo: false,
    scontoTipo: "percentuale",
    scontoValore: "",
  };
}

function normalizzaBozzaManuale(parsed: NuovoManualeDraft): NuovoManualeDraft {
  return {
    ...parsed,
    scontoAttivo: parsed.scontoAttivo ?? false,
    scontoTipo: parsed.scontoTipo ?? "percentuale",
    scontoValore: parsed.scontoValore ?? "",
  };
}

/** Bozze salvate prima di pianoPagamentoTipo unificato. */
type NuovoManualeDraftLegacy = NuovoManualeDraft & {
  abbonamentoAttivo?: boolean;
  pagamentoRateAttivo?: boolean;
  rateModalita?: "rate_uguali" | "acconto_saldo";
};

export function pianoPagamentoTipoDaBozza(
  draft: Partial<NuovoManualeDraftLegacy>,
): PianoPagamentoTipo {
  if (draft.pianoPagamentoTipo) return draft.pianoPagamentoTipo;
  if (draft.abbonamentoAttivo) return "abbonamento";
  if (draft.pagamentoRateAttivo) {
    return draft.rateModalita === "acconto_saldo" ? "acconto" : "rate";
  }
  return "nessuno";
}

export type BozzaStorageWarning = {
  type: "save_failed" | "load_corrupted";
  message: string;
};

type BozzaStorageWarningListener = (warning: BozzaStorageWarning) => void;

const bozzaWarningListeners = new Set<BozzaStorageWarningListener>();
const pendingBozzaWarnings: BozzaStorageWarning[] = [];

export function onBozzaStorageWarning(listener: BozzaStorageWarningListener) {
  bozzaWarningListeners.add(listener);
  for (const warning of pendingBozzaWarnings.splice(0)) {
    listener(warning);
  }
  return () => {
    bozzaWarningListeners.delete(listener);
  };
}

function emitBozzaStorageWarning(warning: BozzaStorageWarning) {
  console.error(`[nuovoDraft] ${warning.type}:`, warning.message);
  if (bozzaWarningListeners.size === 0) {
    pendingBozzaWarnings.push(warning);
    return;
  }
  bozzaWarningListeners.forEach((listener) => listener(warning));
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`[nuovoDraft] JSON corrotto per chiave ${key}:`, e);
    localStorage.removeItem(key);
    emitBozzaStorageWarning({
      type: "load_corrupted",
      message: "La bozza precedente era danneggiata e non può essere recuperata",
    });
    return null;
  }
}

function save<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`[nuovoDraft] Salvataggio fallito per chiave ${key}:`, e);
    emitBozzaStorageWarning({
      type: "save_failed",
      message: "Impossibile salvare la bozza automaticamente",
    });
    return false;
  }
}

function remove(key: string) {
  localStorage.removeItem(key);
}

function bozzaChatVuota(d: NuovoChatDraft): boolean {
  return (
    d.messaggi.length === 0 &&
    !d.input.trim() &&
    !d.recap &&
    !d.preventivo &&
    !d.clienteSelezionatoId
  );
}

function bozzaManualeVuota(d: NuovoManualeDraft): boolean {
  return (
    !d.preventivo &&
    !d.noteExtra.trim() &&
    !d.clienteSelezionatoId &&
    !d.voci.some((v) => v.nome.trim())
  );
}

export function caricaBozzaChat(userId: string): NuovoChatDraft | null {
  if (!userId) return null;
  return load<NuovoChatDraft>(chatKey(userId));
}

function timestampBozza(draft: { aggiornatoAt?: string }): number {
  if (!draft.aggiornatoAt) return 0;
  const ms = Date.parse(draft.aggiornatoAt);
  return Number.isFinite(ms) ? ms : 0;
}

function withTimestamp<T extends { aggiornatoAt?: string }>(draft: T): T {
  return { ...draft, aggiornatoAt: new Date().toISOString() };
}

export function salvaBozzaChat(userId: string, draft: NuovoChatDraft) {
  if (!userId) return;
  if (bozzaChatVuota(draft)) {
    remove(chatKey(userId));
    return;
  }
  save(chatKey(userId), withTimestamp(draft));
}

export function cancellaBozzaChat(userId: string) {
  if (!userId) return;
  remove(chatKey(userId));
}

export function caricaBozzaManuale(userId: string): NuovoManualeDraft | null {
  if (!userId) return null;
  const draft = load<NuovoManualeDraft>(manualeKey(userId));
  if (!draft) return null;
  return normalizzaBozzaManuale(draft);
}

export function salvaBozzaManuale(userId: string, draft: NuovoManualeDraft) {
  if (!userId) return;
  if (bozzaManualeVuota(draft)) {
    remove(manualeKey(userId));
    return;
  }
  save(manualeKey(userId), withTimestamp(draft));
}

export function cancellaBozzaManuale(userId: string) {
  if (!userId) return;
  remove(manualeKey(userId));
}

export type BozzaNuovoInfo = {
  mode: "chat" | "manuale";
  clienteId: string;
  clienteNome: string;
};

function infoDaBozzaChat(draft: NuovoChatDraft): BozzaNuovoInfo {
  return {
    mode: "chat",
    clienteId: draft.clienteSelezionatoId,
    clienteNome: draft.clienteNome?.trim() || "",
  };
}

function infoDaBozzaManuale(draft: NuovoManualeDraft): BozzaNuovoInfo {
  return {
    mode: "manuale",
    clienteId: draft.clienteSelezionatoId,
    clienteNome: draft.clienteNome?.trim() || "",
  };
}

export function infoBozzaNuovoInSospeso(userId: string): BozzaNuovoInfo | null {
  const chat = caricaBozzaChat(userId);
  const manuale = caricaBozzaManuale(userId);
  const chatAttiva = chat != null && !bozzaChatVuota(chat);
  const manualeAttiva = manuale != null && !bozzaManualeVuota(manuale);

  if (!chatAttiva && !manualeAttiva) return null;
  if (chatAttiva && !manualeAttiva) return infoDaBozzaChat(chat);
  if (manualeAttiva && !chatAttiva) return infoDaBozzaManuale(manuale);

  const chatTs = timestampBozza(chat!);
  const manualeTs = timestampBozza(manuale!);
  if (chatTs !== manualeTs) {
    return chatTs > manualeTs ? infoDaBozzaChat(chat!) : infoDaBozzaManuale(manuale!);
  }

  return infoDaBozzaManuale(manuale!);
}

export function percorsoRipresaBozzaNuovo(userId: string, mode: BozzaNuovoInfo["mode"]): string {
  if (mode === "chat") {
    const chat = caricaBozzaChat(userId);
    if (chat?.preventivo) return "/nuovo/chat/anteprima";
    return "/nuovo/chat";
  }
  const manuale = caricaBozzaManuale(userId);
  if (manuale?.preventivo) return "/nuovo/manuale/anteprima";
  return "/nuovo/manuale";
}

export function cancellaTutteLeBozzeNuovo(userId: string) {
  cancellaBozzaChat(userId);
  cancellaBozzaManuale(userId);
}

export function finalizzaBozzaNuovo(userId: string, mode: "chat" | "manuale") {
  if (mode === "chat") cancellaBozzaChat(userId);
  else cancellaBozzaManuale(userId);
}
