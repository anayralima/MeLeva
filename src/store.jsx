/**
 * @file Estado global da demo (dados mock persistidos no localStorage),
 * avisos rápidos (toasts) e janelas (modais).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createStorage } from "./services/storage.js";
import { createSeed, SEED_VERSION } from "./services/seed.js";

const storage = createStorage({ area: "local", namespace: "meleva" });
const KEY = "state";

function loadState() {
  const saved = storage.read(KEY, null);
  if (saved && saved.version === SEED_VERSION) return saved;
  return createSeed();
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    storage.write(KEY, state);
  }, [state]);

  /** Executa uma regra de `rules.js` e grava o novo estado. */
  const run = useCallback((rule, ...args) => {
    const output = rule(stateRef.current, ...args);
    stateRef.current = output.state;
    setState(output.state);
    return output;
  }, []);

  /** Atualização livre do estado (para ajustes simples de perfil etc.). */
  const update = useCallback((change) => {
    setState((current) => {
      const next = typeof change === "function" ? change(current) : { ...current, ...change };
      stateRef.current = next;
      return next;
    });
  }, []);

  const toast = useCallback((text, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  const reset = useCallback(() => {
    const fresh = createSeed();
    stateRef.current = fresh;
    setState(fresh);
  }, []);

  const openModal = useCallback((name, props = {}) => setModal({ name, props }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo(
    () => ({
      state,
      run,
      update,
      toast,
      reset,
      modal,
      openModal,
      closeModal,
      me: state.users.me,
      user: (id) => state.users[id] ?? { id, name: "Participante", firstName: "Participante", avatar: "/assets/landing/avatar-1.webp", level: "", sports: [] },
    }),
    [state, run, update, toast, reset, modal, openModal, closeModal],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className={`toast toast--${t.tone}`} key={t.id}>
            <span className="toast__dot" aria-hidden="true" />
            {t.text}
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
