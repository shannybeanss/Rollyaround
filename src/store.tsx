// Rolly Around Studios — data store (multi-account).
//
// Two creator accounts (Rolly Around travel, Rolly Belly cooking), each with
// its own AppData. `data`/`update` always target the ACTIVE account so every
// page component keeps working unchanged. Account switching + history live on top.
//
// Migration: older single-account saves are wrapped into the Rolly Around
// account automatically, after snapshotting, so nothing is lost.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AppData, MultiAccountData, CreatorAccount } from "./types";
import { seedAppData, seedCookingData, seedMultiAccount } from "./seed/defaults";

const STORAGE_KEY = "rolly-around-studios/v1";   // kept: now holds MultiAccountData
const HISTORY_KEY = "rolly-around-studios/history/v1";
const MAX_SNAPSHOTS = 20;

export interface Snapshot {
  id: string;
  at: string;
  reason: string;
  ideaCount: number;
  data: MultiAccountData;
}

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

// Is this an old single-account save (has `ideas` at the top level)?
function isLegacy(obj: unknown): obj is AppData {
  return !!obj && typeof obj === "object" && Array.isArray((obj as AppData).ideas) && !("accounts" in (obj as object) && Array.isArray((obj as MultiAccountData).accounts) && (obj as MultiAccountData).schemaVersion >= 2);
}

function migrate(legacy: AppData): MultiAccountData {
  // Ensure the legacy travel data has a seriesList.
  const travel: AppData = { ...legacy, seriesList: legacy.seriesList ?? seedAppData().seriesList };
  return {
    schemaVersion: 2,
    activeAccountId: "rollyaround",
    accounts: [
      { id: "rollyaround", name: "Rolly Around", emoji: "🌍", data: travel },
      { id: "rollybelly", name: "Rolly Belly", emoji: "🍳", data: seedCookingData() },
    ],
  };
}

function load(): MultiAccountData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed as MultiAccountData).schemaVersion >= 2 && Array.isArray((parsed as MultiAccountData).accounts)) {
        return parsed as MultiAccountData;
      }
      if (isLegacy(parsed)) {
        const migrated = migrate(parsed as AppData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch { /* fall through */ }
  const seeded = seedMultiAccount();
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
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_SNAPSHOTS))); } catch { /* ignore */ }
}

interface StoreCtx {
  multi: MultiAccountData;
  account: CreatorAccount;
  data: AppData;                                   // active account's data
  saveState: "idle" | "saving" | "saved";
  update: (fn: (draft: AppData) => AppData) => void; // edits active account
  switchAccount: (id: string) => void;
  renameSeriesList: (list: string[]) => void;
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
  const [multi, setMulti] = useState<MultiAccountData>(() => load());
  const [history, setHistory] = useState<Snapshot[]>(() => loadHistory());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<number | null>(null);
  const savedTimer = useRef<number | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    // Don't flash "saving" on the very first load.
    if (firstRun.current) { firstRun.current = false; return; }
    setSaveState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(multi)); } catch { /* ignore */ }
      setSaveState("saved");
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setSaveState("idle"), 1500);
    }, 250);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [multi]);

  const account = multi.accounts.find((a) => a.id === multi.activeAccountId) ?? multi.accounts[0];
  const data = account.data;

  const totalIdeas = (m: MultiAccountData) => m.accounts.reduce((s, a) => s + a.data.ideas.length, 0);

  const pushSnapshot = (snapMulti: MultiAccountData, reason: string): Snapshot[] => {
    const snap: Snapshot = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      at: new Date().toISOString(),
      reason,
      ideaCount: totalIdeas(snapMulti),
      data: structuredClone(snapMulti),
    };
    const next = [snap, ...history].slice(0, MAX_SNAPSHOTS);
    setHistory(next); saveHistory(next);
    return next;
  };

  // Edit ONLY the active account's data.
  const update: StoreCtx["update"] = (fn) =>
    setMulti((prev) => {
      const copy = structuredClone(prev);
      const acc = copy.accounts.find((a) => a.id === copy.activeAccountId) ?? copy.accounts[0];
      acc.data = fn(acc.data);
      return copy;
    });

  const switchAccount = (id: string) =>
    setMulti((prev) => ({ ...structuredClone(prev), activeAccountId: id }));

  const renameSeriesList = (list: string[]) =>
    update((d) => ({ ...d, seriesList: list }));

  const snapshot = (reason: string) => pushSnapshot(multi, reason);

  const reset = () => { pushSnapshot(multi, "Before reset"); setMulti(seedMultiAccount()); };

  const restoreSnapshot = (id: string) => {
    const snap = history.find((s) => s.id === id);
    if (!snap) return;
    pushSnapshot(multi, "Before restore");
    setMulti(structuredClone(snap.data));
  };

  const deleteSnapshot = (id: string) => {
    const next = history.filter((s) => s.id !== id);
    setHistory(next); saveHistory(next);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(multi, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rolly-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importData = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      pushSnapshot(multi, "Before import");
      if (parsed && (parsed as MultiAccountData).schemaVersion >= 2 && Array.isArray((parsed as MultiAccountData).accounts)) {
        setMulti(parsed as MultiAccountData); return true;
      }
      if (isLegacy(parsed)) { setMulti(migrate(parsed as AppData)); return true; }
      return false;
    } catch { return false; }
  };

  return (
    <Ctx.Provider value={{ multi, account, data, saveState, update, switchAccount, renameSeriesList, reset, exportData, importData, history, snapshot, restoreSnapshot, deleteSnapshot }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
