import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { supabase } from "../lib/supabase";

type Props = {
  visibile: boolean;
  onAccettati: () => void;
};

export function TerminiNonAccettatiModal({ visibile, onAccettati }: Props) {
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState("");

  if (!visibile) return null;

  async function handleAccetta() {
    setErrore("");
    setSalvando(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrore("Sessione non valida. Riprova.");
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          termini_accettati: true,
          termini_accettati_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) {
        setErrore("Impossibile salvare l'accettazione. Riprova.");
        return;
      }
      onAccettati();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center
                    bg-brand-navy text-white p-8"
    >
      <h1 className="text-2xl font-bold mb-4 text-center">Termini di Servizio</h1>
      <p className="text-center text-gray-300 leading-relaxed max-w-md">
        Prima di continuare, leggi e accetta i Termini di Servizio di PreviCloud.
      </p>
      <button
        type="button"
        onClick={() => void openUrl("https://previcloud.it/termini")}
        style={{
          marginTop: 16,
          color: "#0E9F8E",
          textDecoration: "underline",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        Apri i Termini di Servizio
      </button>
      {errore ? (
        <p className="mt-4 text-center text-sm text-red-400 max-w-md">{errore}</p>
      ) : null}
      <button
        type="button"
        onClick={() => void handleAccetta()}
        disabled={salvando}
        className="mt-7 w-full max-w-sm rounded-xl bg-[#0E9F8E] px-5 py-3 text-sm font-semibold text-white
                   hover:bg-[#0d8f80] transition-colors disabled:opacity-60"
      >
        {salvando ? "Salvataggio…" : "Ho letto e accetto i Termini di Servizio"}
      </button>
    </div>
  );
}
