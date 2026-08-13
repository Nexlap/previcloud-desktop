import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { supabase } from "../lib/supabase";
import { TerminiNonAccettatiModal } from "./TerminiNonAccettatiModal";

/**
 * Gate termini a monte di onboarding e Layout.
 * Fail-closed: errore di rete/fetch (non riga assente) → mostra il blocco termini,
 * come resolvePostAuthRoute sul mobile.
 */
async function hasAcceptedTermini(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("termini_accettati")
    .eq("id", user.id)
    .single();

  // PGRST116 = nessuna riga: legittimo per utente nuovo → termini non accettati.
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return Boolean(profile?.termini_accettati);
}

async function hasAcceptedTerminiSicuro(): Promise<boolean> {
  try {
    return await hasAcceptedTermini();
  } catch (err: unknown) {
    console.error("[termini] hasAcceptedTermini: primo tentativo fallito, riprovo", err);
    try {
      return await hasAcceptedTermini();
    } catch (err2: unknown) {
      // Fail-closed: senza verifica non instradiamo oltre, altrimenti un errore
      // di rete potrebbe bypassare termini_accettati=false.
      console.error("[termini] hasAcceptedTermini: fallito anche il retry", err2);
      return false;
    }
  }
}

export default function RequireTermini() {
  const [loading, setLoading] = useState(true);
  const [terminiOk, setTerminiOk] = useState(false);

  useEffect(() => {
    void hasAcceptedTerminiSicuro().then((ok) => {
      setTerminiOk(ok);
      setLoading(false);
    });
  }, []);

  function handleAccettati() {
    setTerminiOk(true);
  }

  if (loading) {
    return (
      <div className="theme-surface flex h-screen items-center justify-center bg-brand-bg text-brand-navy/60">
        Caricamento...
      </div>
    );
  }

  if (!terminiOk) {
    return (
      <TerminiNonAccettatiModal visibile onAccettati={handleAccettati} />
    );
  }

  return <Outlet />;
}
