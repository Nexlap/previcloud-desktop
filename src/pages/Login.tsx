import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router";
import { CheckCircle, Eye, EyeSlash, SealCheck } from "@phosphor-icons/react";
import { useAuth } from "../app/useAuth";
import { resetPassword, signInWithEmail, signUpWithEmail } from "../lib/auth";
import { PLACEHOLDER } from "../lib/placeholders";
import logo from "../assets/logo.png";
import { openUrl } from "@tauri-apps/plugin-opener";

const WEB_BASE_URL = "https://previcloud.it";
const WEB_TERMINI_URL = `${WEB_BASE_URL}/termini`;

/** Imposta `true` per riattivare tab e form di registrazione. */
const BETA_REGISTRAZIONE_APERTA = false;

type AuthMode = "login" | "register";

export default function Login() {
  const { loading, authenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostraPassword, setMostraPassword] = useState(false);
  const [accettaTermini, setAccettaTermini] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  if (!loading && authenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || !password) {
      setError("Inserisci email e password.");
      return;
    }
    if (mode === "register" && BETA_REGISTRAZIONE_APERTA && !accettaTermini) {
      setError("Accetta i termini e condizioni per continuare.");
      return;
    }
    if (mode === "register" && BETA_REGISTRAZIONE_APERTA && password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }

    setSubmitting(true);
    if (mode === "register" && BETA_REGISTRAZIONE_APERTA) {
      const { error: signUpError } = await signUpWithEmail(email.trim(), password);
      setSubmitting(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setInfo("Account creato. Controlla la tua email per confermare l'accesso.");
      return;
    }

    const { error: signInError } = await signInWithEmail(email.trim(), password);
    setSubmitting(false);
    if (signInError) setError("Email o password non corretti.");
  }

  async function recuperaPassword() {
    if (!email.trim()) {
      setError("Inserisci la tua email e poi riprova.");
      return;
    }
    setError("");
    setInfo("");
    setResetLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setResetLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setInfo("Email inviata. Segui il link per reimpostare la password.");
  }

  async function apriTerminiWeb() {
    try {
      await openUrl(WEB_TERMINI_URL);
    } catch {
      window.open(WEB_TERMINI_URL, "_blank", "noopener,noreferrer");
    }
  }

  async function apriHomepageWeb() {
    try {
      await openUrl(WEB_BASE_URL);
    } catch {
      window.open(WEB_BASE_URL, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="theme-surface flex h-screen overflow-hidden bg-brand-bg">
      <aside className="relative hidden w-[44%] max-w-2xl flex-col justify-between overflow-hidden bg-brand-navy p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 8% -10%, rgb(14 159 142 / 0.28), transparent 55%), radial-gradient(90% 70% at 100% 115%, rgb(14 159 142 / 0.18), transparent 60%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10 rounded-[10px] shadow-lg shadow-black/30" />
          <p className="text-2xl font-bold tracking-tight">
            Previ<span className="text-brand-teal">Cloud</span>
          </p>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-10">
          <div className="relative w-full max-w-[300px] motion-safe:animate-[login-card-in_700ms_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="absolute -inset-x-6 -inset-y-8 rounded-[32px] bg-brand-teal/10 blur-2xl" />

            <div className="relative -rotate-3 rounded-2xl bg-white p-4 text-brand-navy shadow-2xl shadow-black/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-navy/40">Preventivo #128</p>
                  <p className="text-sm font-semibold">Rossi Costruzioni Srl</p>
                </div>
                <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-semibold text-brand-teal-ink">
                  Inviato
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-black/5 pt-3 text-xs">
                <div className="flex items-center justify-between text-brand-navy/70">
                  <span>Fornitura e posa infissi</span>
                  <span className="font-medium text-brand-navy">€ 2.450</span>
                </div>
                <div className="flex items-center justify-between text-brand-navy/70">
                  <span>Sopralluogo e progettazione</span>
                  <span className="font-medium text-brand-navy">€ 180</span>
                </div>
                <div className="flex items-center justify-between text-brand-navy/70">
                  <span>Manodopera specializzata</span>
                  <span className="font-medium text-brand-navy">€ 1.120</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-navy px-3 py-2 text-white">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Totale</span>
                <span className="text-sm font-bold text-brand-teal">€ 3.750</span>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-6 flex rotate-3 items-center gap-2 rounded-xl bg-white px-3 py-2 text-brand-navy shadow-xl shadow-black/30">
              <SealCheck size={20} weight="fill" className="text-brand-teal" />
              <div className="leading-tight">
                <p className="text-[11px] font-semibold">Firmato</p>
                <p className="text-[10px] text-brand-navy/50">oggi, 09:41</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative space-y-5">
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex gap-2.5">
              <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-brand-teal" />
              <span>Genera preventivi con l&apos;assistente AI o dal listino servizi</span>
            </li>
            <li className="flex gap-2.5">
              <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-brand-teal" />
              <span>PDF multi-template, clienti, rate e abbonamenti in un unico posto</span>
            </li>
            <li className="flex gap-2.5">
              <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-brand-teal" />
              <span>Storico, versioni alternative e tracciamento incassi</span>
            </li>
          </ul>
          <p className="text-xs text-white/35">© PreviCloud — fatto per artigiani e professionisti</p>
        </div>
      </aside>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-md motion-safe:animate-[login-card-in_500ms_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img src={logo} alt="" className="mb-3 h-12 w-12 rounded-[12px] shadow-md shadow-brand-navy/20" />
            <p className="text-3xl font-bold tracking-tight text-brand-navy">
              Previ<span className="text-brand-teal-ink">Cloud</span>
            </p>
            <p className="mt-2 text-sm text-brand-navy/60">
              {mode === "register" && BETA_REGISTRAZIONE_APERTA ? "Crea il tuo account" : "Bentornato"}
            </p>
          </div>

          <div className="rounded-3xl border border-edge-faint bg-surface p-6 shadow-xl shadow-brand-navy/[0.06] sm:p-8">
            <p className="mb-6 hidden text-sm text-brand-navy/60 lg:block">
              {mode === "register" && BETA_REGISTRAZIONE_APERTA ? "Crea il tuo account" : "Bentornato"}
            </p>

            {BETA_REGISTRAZIONE_APERTA ? (
              <div className="mb-6 flex rounded-xl bg-brand-bg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setAccettaTermini(false);
                    setError("");
                    setInfo("");
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    mode === "login"
                      ? "bg-surface text-brand-navy shadow-sm"
                      : "text-brand-navy/45 hover:text-brand-navy/70"
                  }`}
                >
                  Accedi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setInfo("");
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    mode === "register"
                      ? "bg-surface text-brand-navy shadow-sm"
                      : "text-brand-navy/45 hover:text-brand-navy/70"
                  }`}
                >
                  Registrati
                </button>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-edge bg-brand-bg px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
                  placeholder={PLACEHOLDER.loginEmail}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">
                  Password
                </label>
                <div className="flex items-center rounded-xl border border-edge bg-brand-bg">
                  <input
                    type={mostraPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    placeholder={mode === "register" && BETA_REGISTRAZIONE_APERTA ? "Minimo 6 caratteri" : "••••••••"}
                    autoComplete={mode === "register" && BETA_REGISTRAZIONE_APERTA ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setMostraPassword((v) => !v)}
                    aria-label={mostraPassword ? "Nascondi password" : "Mostra password"}
                    className="shrink-0 px-3 py-2.5 text-brand-navy/40 transition hover:text-brand-teal-ink"
                  >
                    {mostraPassword ? <EyeSlash size={18} weight="regular" /> : <Eye size={18} weight="regular" />}
                  </button>
                </div>
                {mode === "login" ? (
                  <button
                    type="button"
                    onClick={() => void recuperaPassword()}
                    disabled={resetLoading}
                    className="mt-1 block text-xs font-semibold text-brand-teal-ink hover:underline disabled:opacity-60"
                  >
                    {resetLoading ? "Invio email..." : "Password dimenticata?"}
                  </button>
                ) : null}
              </div>

              {mode === "register" && BETA_REGISTRAZIONE_APERTA ? (
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={accettaTermini}
                    onChange={(e) => setAccettaTermini(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-edge text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-sm leading-relaxed text-brand-navy/65">
                    Accetto i{" "}
                    <button type="button" onClick={apriTerminiWeb} className="font-semibold text-brand-teal-ink hover:underline">
                      termini e condizioni
                    </button>
                    .{" "}
                    <button type="button" onClick={apriHomepageWeb} className="font-semibold text-brand-teal-ink hover:underline">
                      Scopri di più
                    </button>
                  </span>
                </label>
              ) : null}

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {info ? <p className="text-sm text-brand-teal-ink">{info}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand-navy py-3 text-sm font-semibold text-white shadow-sm shadow-brand-navy/20 transition hover:bg-brand-navy/90 active:scale-[0.99] disabled:opacity-60"
              >
                {submitting ? "Attendere..." : mode === "register" && BETA_REGISTRAZIONE_APERTA ? "Crea account" : "Accedi"}
              </button>

              {!BETA_REGISTRAZIONE_APERTA ? (
                <p className="text-center text-sm leading-relaxed text-brand-navy/60">
                  Non hai un account? Richiedi l&apos;accesso alla beta su{" "}
                  <button
                    type="button"
                    onClick={apriHomepageWeb}
                    className="font-semibold text-brand-teal-ink hover:underline"
                  >
                    previcloud.it
                  </button>
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
