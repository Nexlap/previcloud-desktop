import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router";
import BozzaInSospesoDialog from "./BozzaInSospesoDialog";
import type { BozzaNuovoInfo } from "../lib/nuovoDraft";
import { getCachedUserId } from "../lib/auth";
import {
  bozzaNuovoDaIntercettare,
  messaggioBozzaInSospeso,
  percorsoNuovoPreventivoHub,
  percorsoNuovoPreventivoVuoto,
  percorsoRipresaBozza,
} from "../lib/nuovoNav";

type NavigaNuovoOpts = {
  clienteId?: string;
  clienteNome?: string;
};

type PendingNav = NavigaNuovoOpts & {
  bozza: BozzaNuovoInfo;
};

const NuovoPreventivoNavContext = createContext<(opts?: NavigaNuovoOpts) => void>(() => {});

export function useNavigaNuovoPreventivo() {
  return useContext(NuovoPreventivoNavContext);
}

export function NuovoPreventivoNavProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState<PendingNav | null>(null);

  const navigaNuovoPreventivo = useCallback(
    (opts?: NavigaNuovoOpts) => {
      const userId = getCachedUserId();
      const bozza = userId ? bozzaNuovoDaIntercettare(userId, location.pathname) : null;
      if (bozza) {
        setPending({ bozza, clienteId: opts?.clienteId, clienteNome: opts?.clienteNome });
        return;
      }
      navigate(percorsoNuovoPreventivoHub(opts?.clienteId, opts?.clienteNome));
    },
    [location.pathname, navigate],
  );

  const handleRiprendi = useCallback(() => {
    if (!pending) return;
    const userId = getCachedUserId();
    const target = userId
      ? percorsoRipresaBozza(userId, pending.bozza)
      : percorsoNuovoPreventivoHub();
    setPending(null);
    navigate(target);
  }, [navigate, pending]);

  const handleIniziaNuovo = useCallback(() => {
    if (!pending) return;
    const userId = getCachedUserId();
    const target = userId
      ? percorsoNuovoPreventivoVuoto(userId, pending.clienteId, pending.clienteNome)
      : percorsoNuovoPreventivoHub(pending.clienteId, pending.clienteNome);
    setPending(null);
    navigate(target);
  }, [navigate, pending]);

  const value = useMemo(() => navigaNuovoPreventivo, [navigaNuovoPreventivo]);

  return (
    <NuovoPreventivoNavContext.Provider value={value}>
      {children}
      {pending ? (
        <BozzaInSospesoDialog
          message={messaggioBozzaInSospeso(pending.bozza)}
          onRiprendi={handleRiprendi}
          onIniziaNuovo={handleIniziaNuovo}
          onDismiss={() => setPending(null)}
        />
      ) : null}
    </NuovoPreventivoNavContext.Provider>
  );
}
