import { useState } from "react";
import { StoreProvider, useStore, storageWorks } from "./store";
import { ToastProvider } from "./components/Toast";
import { Today } from "./pages/Today";
import { Ideas } from "./pages/Ideas";
import { Lineup } from "./pages/Lineup";
import { Money } from "./pages/Money";
import { Rates } from "./pages/Rates";
import { Invoices } from "./pages/Invoices";
import { Analytics } from "./pages/Analytics";
import { Suggestions } from "./pages/Suggestions";
import { Templates } from "./pages/Templates";
import { Profile } from "./pages/Profile";
import { Deals } from "./pages/Deals";
import { Settings } from "./pages/Settings";
import { IdeaModal } from "./pages/IdeaModal";
import type { Idea, RateLine } from "./types";
import "./theme.css";
import "./App.css";

type TabId =
  | "today" | "ideas" | "lineup" | "money" | "rates"
  | "invoices" | "analytics" | "suggestions" | "templates" | "profile" | "deals";

function Shell() {
  const { data, multi, account, switchAccount, exportData, saveState } = useStore();
  const [tab, setTab] = useState<TabId>("today");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openIdea, setOpenIdea] = useState<Idea | null>(null);
  const [carried, setCarried] = useState<RateLine[] | null>(null);
  const canSave = storageWorks();

  // Money/Rates/Invoices hidden for now — Shanice does not need them yet; pages kept so data is not lost
  const tabs: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "ideas", label: "Ideas" },
    { id: "lineup", label: "Lineup" },
    { id: "analytics", label: "Analytics" },
    { id: "suggestions", label: "Suggestions" },
    { id: "templates", label: "Templates" },
    { id: "profile", label: "Profile" },
  ];
  if (data.settings.brandDealsEnabled) tabs.splice(3, 0, { id: "deals", label: "Brand Deals" });

  const goIdea = (i: Idea) => { setTab("ideas"); setOpenIdea(i); };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-row">
            <div className="brand">
              <h1><span className="brand-script">Rolly</span></h1>
              <div className="sub">Private planner · {account.name}</div>
            </div>
            <div className="row gap-8">
              {canSave ? (
                <span className={`save-pill ${saveState}`} title="Every change saves automatically to this browser">
                  {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Auto-save on"}
                </span>
              ) : (
                <span className="badge badge-danger" title="Where your data lives">Saving blocked — export backups</span>
              )}
              <button className="btn btn-sm" onClick={() => setSettingsOpen(true)}>⚙ Settings</button>
            </div>
          </div>
          {!canSave && (
            <div className="row between wrap" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: 9, padding: "8px 12px", marginTop: 10, fontSize: 13 }}>
              <span>⚠ This browser isn't saving changes (common when opening the file directly). Your edits won't survive a refresh — <b>export a backup</b> before closing, and import it next time.</span>
              <button className="btn btn-sm btn-accent" onClick={exportData}>Export backup now</button>
            </div>
          )}

          {/* Account switcher (two top-level accounts) */}
          <div className="account-switch">
            {multi.accounts.map((a) => (
              <button key={a.id}
                className={`account-tab ${a.id === account.id ? "active" : ""}`}
                onClick={() => { switchAccount(a.id); setTab("today"); }}>
                <span className="account-emoji">{a.emoji}</span> {a.name}
              </button>
            ))}
          </div>

          <nav className="tabs">
            {tabs.map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main" key={account.id}>
        {tab === "today" && <Today />}
        {tab === "ideas" && <Ideas />}
        {tab === "lineup" && <Lineup onOpenIdea={goIdea} />}
        {tab === "money" && <Money />}
        {tab === "rates" && <Rates onCarryToInvoice={(lines) => { setCarried(lines); setTab("invoices"); }} />}
        {tab === "invoices" && <Invoices carriedLines={carried} clearCarried={() => setCarried(null)} />}
        {tab === "analytics" && <Analytics />}
        {tab === "suggestions" && <Suggestions onOpenIdea={goIdea} onGoLineup={() => setTab("lineup")} />}
        {tab === "templates" && <Templates />}
        {tab === "profile" && <Profile />}
        {tab === "deals" && <Deals />}
      </main>

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      {openIdea && <IdeaModal idea={openIdea} onClose={() => setOpenIdea(null)} />}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </StoreProvider>
  );
}
