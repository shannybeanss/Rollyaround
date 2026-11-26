import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ToastState { message: string; onUndo?: () => void; }
interface ToastCtx { show: (message: string, onUndo?: () => void) => void; }

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback((message: string, onUndo?: () => void) => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast({ message, onUndo });
    timer.current = window.setTimeout(() => setToast(null), 6000);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.onUndo && (
            <button className="btn btn-sm" onClick={() => { toast.onUndo?.(); setToast(null); }}>Undo</button>
          )}
          <button className="btn btn-sm btn-ghost" style={{ color: "#fff" }} onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
