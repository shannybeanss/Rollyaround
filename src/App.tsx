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
  const { data, exportData } = useStore();
  const [tab, setTab] = useState<TabId>("today");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openIdea, setOpenIdea] = useState<Idea | null>(null);
  const [carried, setCarried] = useState<RateLine[] | null>(null);
  const canSave = storageWorks();

  const tabs: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "ideas", label: "Ideas" },
    { id: "lineup", label: "Lineup" },
    { id: "money", label: "Money" },
    { id: "rates", label: "Rates" },
    { id: "invoices", label: "Invoices" },
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
              <h1><span className="brand-mark">R</span> Rolly Around Studios</h1>
              <div className="sub">Private planner for @rollyaround · travel, food & experiences</div>
            </div>
            <div className="row gap-8">
              <span className={`badge ${canSave ? "badge-ready" : "badge-danger"}`} title="Where your data lives">
                {canSave ? "Saved in this browser" : "Saving blocked — export backups"}
              </span>
              <button className="btn btn-sm" onClick={() => setSettingsOpen(true)}>⚙ Settings</button>
            </div>
          </div>
          {!canSave && (
            <div className="row between wrap" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: 9, padding: "8px 12px", marginTop: 10, fontSize: 13 }}>
              <span>⚠ This browser isn't saving changes (common when opening the file directly). Your edits won't survive a refresh — <b>export a backup</b> before closing, and import it next time.</span>
              <button className="btn btn-sm btn-accent" onClick={exportData}>Export backup now</button>
            </div>
          )}
          <nav className="tabs">
            {tabs.map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
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
