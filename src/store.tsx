// Rolly Around Studios — data store.
// Persists to localStorage now (survives refresh). Structured so a Supabase
// sync layer can be dropped in without changing any component code.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AppData } from "./types";
import { seedAppData } from "./seed/defaults";

const STORAGE_KEY = "rolly-around-studios/v1";

// Detect whether localStorage actually persists (it can be blocked on file://).
export function storageWorks(): boolean {
  try {
    const k = "__rolly_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // ignore corrupt data, fall through to seed
  }
  const seeded = seedAppData();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded)); } catch { /* ignore */ }
  return seeded;
}

interface StoreCtx {
  data: AppData;
  // Immutable update: pass a function that returns the next state.
  update: (fn: (draft: AppData) => AppData) => void;
  reset: () => void;
  exportData: () => void;
  importData: (json: string) => boolean;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => load());
  const saveTimer = useRef<number | null>(null);

  // Debounced persistence so rapid edits don't thrash localStorage.
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore quota */ }
    }, 250);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [data]);

  const update: StoreCtx["update"] = (fn) => setData((prev) => fn(structuredClone(prev)));

  const reset = () => {
    const seeded = seedAppData();
    setData(seeded);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rolly-around-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as AppData;
      if (!parsed || !Array.isArray(parsed.ideas)) return false;
      setData(parsed);
      return true;
    } catch {
      return false;
    }
  };

  return <Ctx.Provider value={{ data, update, reset, exportData, importData }}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
