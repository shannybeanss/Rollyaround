import { useRef } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";

export function Settings({ onClose }: { onClose: () => void }) {
  const { data, update, exportData, importData, reset } = useStore();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const s = data.settings;

  const setS = (patch: Partial<typeof s>) => update((d) => { d.settings = { ...d.settings, ...patch }; return d; });

  const doImport = (file: File) => {
    const r = new FileReader();
    r.onload = () => { const ok = importData(String(r.result)); show(ok ? "Backup imported" : "Couldn't read that file"); };
    r.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Settings & data</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">

          <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
            <b>Where your data lives</b>
            <p className="tiny muted" style={{ marginTop: 4 }}>Currently <b>stored in this browser</b> (survives refresh, on this device). Cross-device sync via Supabase is a planned add-on. Export a backup regularly.</p>
            <div className="row gap-8 wrap" style={{ marginTop: 10 }}>
              <button className="btn btn-sm" onClick={exportData}>Export backup</button>
              <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>Import backup</button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
            </div>
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Weekly original goal</label><input type="number" value={s.weeklyGoal} onChange={(e) => setS({ weeklyGoal: Number(e.target.value) })} /></div>
            <div><label>Follower goal</label><input type="number" value={s.followerGoal} onChange={(e) => setS({ followerGoal: Number(e.target.value) })} /></div>
          </div>

          <label className="row gap-8" style={{ margin: 0 }}><input type="checkbox" style={{ width: 16 }} checked={s.brandDealsEnabled} onChange={(e) => setS({ brandDealsEnabled: e.target.checked })} /> Enable Brand Deals (deferred feature)</label>

          <div className="card card-pad">
            <b>AI brain</b>
            <p className="tiny muted" style={{ marginTop: 4 }}>{s.aiConnected ? "Connected — suggestions use AI." : "Not connected — all suggestions are rule-based (free). Paste your own OpenAI/Anthropic key to upgrade (pay-as-you-go on your account)."}</p>
            <label className="row gap-8" style={{ margin: "8px 0 0" }}><input type="checkbox" style={{ width: 16 }} checked={s.aiConnected} onChange={(e) => setS({ aiConnected: e.target.checked })} /> AI connected (wiring comes with a real key)</label>
          </div>

          <div className="card card-pad">
            <b>Integrations</b>
            <p className="tiny muted" style={{ marginTop: 4 }}>Connect when a real integration is available and you authorise it.</p>
            {(["windsor", "email", "messaging"] as const).map((k) => (
              <div key={k} className="row between" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span>{k === "windsor" ? "Windsor.ai analytics" : k === "email" ? "Email (brand inbox)" : "Messaging (brand inbox)"}</span>
                <span className="badge badge-idea">{s.integrations[k] ? "Connected" : "Not connected"}</span>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <b>Schedules</b>
            <p className="tiny muted" style={{ marginTop: 4 }}>A browser-only app runs these when you open it. True background jobs come with the backend.</p>
            {([["morningBrief","Weekday 8am morning brief"],["weeklyAnalytics","Monday analytics refresh"],["brandInbox","Brand inbox checks (needs Brand Deals + source)"]] as const).map(([k, label]) => (
              <label key={k} className="row gap-8" style={{ margin: "6px 0" }}>
                <input type="checkbox" style={{ width: 16 }} disabled={k === "brandInbox" && !s.brandDealsEnabled} checked={s.schedules[k]} onChange={(e) => setS({ schedules: { ...s.schedules, [k]: e.target.checked } })} />
                {label} <span className="badge badge-idea">{s.schedules[k] ? "Active" : "Inactive"}</span>
              </label>
            ))}
          </div>

          <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => { if (confirm("Reset ALL data to the seeded idea bank + demo defaults? Export a backup first.")) { reset(); show("Reset to seed"); } }}>Reset all data</button>
        </div>
      </div>
    </div>
  );
}
