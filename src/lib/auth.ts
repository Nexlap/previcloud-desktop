import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { invalidaFatturatoClienteCache } from "./incassi";
import { supabase } from "./supabase";

/** user_id della sessione già risolta da useAuth / getInitialSession (sync, no extra round-trip). */
let cachedUserId: string | null = null;

function setCachedUserIdFromSession(session: Session | null) {
  cachedUserId = session?.user?.id ?? null;
}

/** Disponibile dopo RequireAuth (loading=false); evita getUser/getSession extra nei call site sync. */
export function getCachedUserId(): string | null {
  return cachedUserId;
}

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://previcloud.it/reset-password",
  });
}

export function signOut() {
  invalidaFatturatoClienteCache();
  return supabase.auth.signOut();
}

export async function getInitialSession() {
  const { data: { session } } = await supabase.auth.getSession();
  setCachedUserIdFromSession(session);
  return session;
}

export function onAuthStateChange(callback: (session: Session | null, event: AuthChangeEvent) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setCachedUserIdFromSession(session);
    callback(session, event);
  });
  return () => subscription.unsubscribe();
}
