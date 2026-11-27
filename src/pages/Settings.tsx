import { useRef } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";

export function Settings({ onClose }: { onClose: () => void }) {
  const { data, update, exportData, importData, reset, history, snapshot, restoreSnapshot, deleteSnapshot } = useStore();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const s = data.settings;

  const fmtWhen = (iso: string) => new Date(iso).toLocaleString("en-SG", { timeZone: "Asia/Singapore", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

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
              <button className="btn btn-sm" onClick={() => { snapshot("Manual save"); show("Snapshot saved to history"); }}>Save a snapshot now</button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
            </div>
          </div>

          <div className="card card-pad">
            <b>Backups &amp; history</b>
            <p className="tiny muted" style={{ marginTop: 4 }}>A snapshot is saved automatically before any reset or import. Restore any version with one tap — restoring also snapshots your current data first, so you can always go back.</p>
            {history.length === 0 ? (
              <p className="tiny muted" style={{ marginTop: 8 }}>No snapshots yet. One is created the next time you reset or import, or tap “Save a snapshot now” above.</p>
            ) : (
              <div className="stack gap-8" style={{ marginTop: 10 }}>
                {history.map((snap) => (
                  <div key={snap.id} className="row between wrap" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div className="row gap-8"><b className="tiny">{snap.reason}</b><span className="badge badge-idea">{snap.ideaCount} ideas</span></div>
                      <div className="tiny muted">{fmtWhen(snap.at)} · Singapore time</div>
                    </div>
                    <div className="row gap-6">
                      <button className="btn btn-sm btn-accent" onClick={() => { if (confirm(`Restore this version from ${fmtWhen(snap.at)}? Your current data will be snapshotted first.`)) { restoreSnapshot(snap.id); show("Restored — your previous data is now active"); } }}>Restore</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => deleteSnapshot(snap.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
