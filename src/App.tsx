import { useState } from "react";
import { StoreProvider, useStore } from "./store";
import { ToastProvider } from "./components/Toast";
import { Today } from "./pages/Today";
import { Ideas } from "./pages/Ideas";
import { Placeholder } from "./pages/Placeholder";
import "./theme.css";
import "./App.css";

type TabId =
  | "today" | "ideas" | "lineup" | "money" | "rates"
  | "invoices" | "analytics" | "suggestions" | "templates" | "profile" | "deals";

interface Tab { id: TabId; label: string }

function Shell() {
  const { data } = useStore();
  const [tab, setTab] = useState<TabId>("today");

  const tabs: Tab[] = [
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
  if (data.settings.brandDealsEnabled) {
    tabs.splice(3, 0, { id: "deals", label: "Brand Deals" });
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-row">
            <div className="brand">
              <h1><span className="brand-mark">R</span> Rolly Around Studios</h1>
              <div className="sub">Your private planner for @rollyaround · travel, food & experiences</div>
            </div>
            <span className="badge badge-idea" title="Where your data lives">Stored in this browser</span>
          </div>
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
        {tab === "lineup" && <Placeholder title="Lineup / Planner / Calendar" desc="Priority posts, backup, weekly Plan/Film/Edit/Post timeline colour-coded by series, weekends free, conflict flags, and post cards with voiceover/carousel beats." />}
        {tab === "money" && <Placeholder title="Money" desc="Total earned, paid this month, pending, overdue, 30-day due, cash-flow by month, and overdue chasers." />}
        {tab === "rates" && <Placeholder title="Rates" desc="Your SGD rate card — editable services, usage periods, package total, copy a quote or carry lines into an invoice." />}
        {tab === "invoices" && <Placeholder title="Invoices" desc="Create/edit invoices, line items, totals, PDF, mark paid — kept in sync with Money." />}
        {tab === "analytics" && <Placeholder title="Analytics" desc="Log views/likes/saves/shares/watch time/follows per post & platform, platform summaries, top posts, what worked by series." />}
        {tab === "suggestions" && <Placeholder title="AI Suggestions" desc="Make next / Repeat / Improve / Test — each with an action and the evidence behind it. Rule-based until an AI key is connected." />}
        {tab === "templates" && <Placeholder title="Templates & References" desc="Save finished posts as editing templates; starter templates, hook bank and reference videos." />}
        {tab === "profile" && <Placeholder title="Profile & Portfolio" desc="Display name, intro, social links, contact, follower counts, featured pieces." />}
        {tab === "deals" && <Placeholder title="Brand Deals" desc="Pipeline from Inquiry to Paid, waiting-on filters, linked to planner & invoices." />}
      </main>
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
