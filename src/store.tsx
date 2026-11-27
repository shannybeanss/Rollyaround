// Rolly Around Studios — data store.
// Persists to localStorage now (survives refresh). Structured so a Supabase
// sync layer can be dropped in without changing any component code.
//
// Safety: before any reset or import (and on demand), we save a timestamped
// snapshot of the current data to a separate history key so nothing is lost
// by accident. You can restore any snapshot from Settings → Backups & history.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AppData } from "./types";
import { seedAppData } from "./seed/defaults";

const STORAGE_KEY = "rolly-around-studios/v1";
const HISTORY_KEY = "rolly-around-studios/history/v1";
const MAX_SNAPSHOTS = 20;

export interface Snapshot {
  id: string;
  at: string;          // ISO timestamp
  reason: string;      // "Before reset", "Before import", "Manual save", "Auto"
  ideaCount: number;
  data: AppData;
}

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

function loadHistory(): Snapshot[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as Snapshot[];
  } catch { /* ignore */ }
  return [];
}

function saveHistory(list: Snapshot[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_SNAPSHOTS))); } catch { /* ignore quota */ }
}

interface StoreCtx {
  data: AppData;
  update: (fn: (draft: AppData) => AppData) => void;
  reset: () => void;
  exportData: () => void;
  importData: (json: string) => boolean;
  history: Snapshot[];
  snapshot: (reason: string) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => load());
  const [history, setHistory] = useState<Snapshot[]>(() => loadHistory());
  const saveTimer = useRef<number | null>(null);

  // Debounced persistence so rapid edits don't thrash localStorage.
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore quota */ }
    }, 250);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [data]);

  const pushSnapshot = (snapData: AppData, reason: string): Snapshot[] => {
    const snap: Snapshot = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      at: new Date().toISOString(),
      reason,
      ideaCount: snapData.ideas.length,
      data: structuredClone(snapData),
    };
    const next = [snap, ...history].slice(0, MAX_SNAPSHOTS);
    setHistory(next);
    saveHistory(next);
    return next;
  };

  const update: StoreCtx["update"] = (fn) => setData((prev) => fn(structuredClone(prev)));

  const snapshot = (reason: string) => { pushSnapshot(data, reason); };

  const reset = () => {
    pushSnapshot(data, "Before reset");   // save current state first
    setData(seedAppData());
  };

  const restoreSnapshot = (id: string) => {
    const snap = history.find((s) => s.id === id);
    if (!snap) return;
    pushSnapshot(data, "Before restore"); // also snapshot what we're leaving
    setData(structuredClone(snap.data));
  };

  const deleteSnapshot = (id: string) => {
    const next = history.filter((s) => s.id !== id);
    setHistory(next);
    saveHistory(next);
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
      pushSnapshot(data, "Before import"); // save current state first
      setData(parsed);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Ctx.Provider value={{ data, update, reset, exportData, importData, history, snapshot, restoreSnapshot, deleteSnapshot }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
