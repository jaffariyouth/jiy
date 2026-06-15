import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ModalPayload = "sponsor" | "ticket" | null;
export type Toast = { id: number; msg: string; success: boolean };

type Ctx = {
  modal: ModalPayload;
  openModal: (p: Exclude<ModalPayload, null>) => void;
  dismissModal: () => void;
  toasts: Toast[];
  dispatchToast: (msg: string, success?: boolean) => void;
  removeToast: (id: number) => void;
};

const DashboardCtx = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalPayload>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dispatchToast = useCallback((msg: string, success = true) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, success }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback(
    (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  return (
    <DashboardCtx.Provider
      value={{
        modal,
        openModal: setModal,
        dismissModal: () => setModal(null),
        toasts,
        dispatchToast,
        removeToast,
      }}
    >
      {children}
    </DashboardCtx.Provider>
  );
}

export function useDashboard() {
  const c = useContext(DashboardCtx);
  if (!c) throw new Error("useDashboard outside provider");
  return c;
}
