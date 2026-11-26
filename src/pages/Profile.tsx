import { useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { DemoBadge } from "../components/ui";
import type { PortfolioPiece, ProfileData } from "../types";

export function Profile() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [p, setP] = useState<ProfileData>(data.profile);
  const [editing, setEditing] = useState(false);

  const save = () => { update((d) => { d.profile = p; return d; }); show("Profile saved"); setEditing(false); };
  const copy = (text: string, what: string) => { navigator.clipboard?.writeText(text); show(`Copied ${what}`); };

  const allLinks = p.links.filter((l) => l.url).map((l) => `${l.platform}: ${l.url}`).join("\n");
  const goalPct = Math.min(100, Math.round((data.accounts.reduce((s, a) => s + a.followers, 0) / Math.max(1, data.settings.followerGoal)) * 100));

  const setPortfolio = (pp: PortfolioPiece) =>
    update((d) => { const i = d.portfolio.findIndex((x) => x.id === pp.id); if (i >= 0) d.portfolio[i] = pp; return d; });

  return (
    <div>
      <div className="agent-note"><b>Profile & Portfolio</b><span>Your display name, intro, links and featured work. Follower counts come from Analytics.</span></div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="row between wrap">
          <div><h2 style={{ fontSize: 22 }}>{p.displayName}</h2><div className="tiny muted">{p.languages} · {p.contactEmail}</div></div>
          {!editing && <button className="btn" onClick={() => setEditing(true)}>Edit</button>}
        </div>
        <div className="row gap-6 wrap" style={{ marginTop: 8 }}>{p.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>

        <div className="row gap-16 wrap" style={{ marginTop: 12 }}>
          <div><b style={{ fontSize: 22 }}>{data.accounts.reduce((s, a) => s + a.followers, 0).toLocaleString()}</b> <span className="tiny muted">followers across platforms</span></div>
          <div className="grow" style={{ minWidth: 200 }}>
            <div className="tiny muted">Goal: {data.settings.followerGoal.toLocaleString()} ({goalPct}%)</div>
            <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, marginTop: 4 }}><div style={{ height: "100%", width: `${goalPct}%`, background: "var(--accent)", borderRadius: 999 }} /></div>
          </div>
        </div>

        <div className="row gap-8 wrap" style={{ marginTop: 14 }}>
          <button className="btn btn-sm" onClick={() => copy(allLinks, "all links")}>Copy all links</button>
          <button className="btn btn-sm" onClick={() => copy(p.intro, "creator intro")}>Copy creator intro</button>
        </div>
      </div>

      {/* Per-platform links */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {p.links.map((l, i) => {
          const acct = data.accounts.find((a) => a.platform === l.platform);
          return (
            <div key={l.platform} className="card card-pad">
              <div className="row between"><b>{l.platform}</b>{acct && <span className="tiny muted">{acct.followers.toLocaleString()} {acct.isDemo && <DemoBadge />}</span>}</div>
              {editing ? (
                <div className="stack gap-6" style={{ marginTop: 6 }}>
                  <input value={l.handle} onChange={(e) => { const links = [...p.links]; links[i] = { ...l, handle: e.target.value }; setP({ ...p, links }); }} placeholder="@handle" />
                  <input value={l.url} onChange={(e) => { const links = [...p.links]; links[i] = { ...l, url: e.target.value }; setP({ ...p, links }); }} placeholder="https://" />
                </div>
              ) : (
                <>
                  <div className="tiny muted">{l.handle}</div>
                  <div className="row gap-8" style={{ marginTop: 8 }}>
                    {l.url && <a className="btn btn-sm" href={l.url} target="_blank" rel="noreferrer">Open</a>}
                    {l.url && <button className="btn btn-sm" onClick={() => copy(l.url, l.platform + " link")}>Copy link</button>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Creator intro */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <label>Creator intro</label>
        {editing ? <textarea rows={5} value={p.intro} onChange={(e) => setP({ ...p, intro: e.target.value })} /> : <p style={{ whiteSpace: "pre-line" }}>{p.intro}</p>}
      </div>

      {editing && (
        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Display name</label><input value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} /></div>
            <div><label>Contact email</label><input value={p.contactEmail} onChange={(e) => setP({ ...p, contactEmail: e.target.value })} /></div>
            <div><label>Languages</label><input value={p.languages ?? ""} onChange={(e) => setP({ ...p, languages: e.target.value })} /></div>
            <div><label>Tags (comma separated)</label><input value={p.tags.join(", ")} onChange={(e) => setP({ ...p, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
          </div>
          <div className="row gap-8" style={{ marginTop: 12 }}><button className="btn btn-accent" onClick={save}>Save</button><button className="btn btn-ghost" onClick={() => { setP(data.profile); setEditing(false); }}>Cancel</button></div>
        </div>
      )}

      {/* Featured portfolio */}
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>Featured work</h3>
      <div className="grid-3">
        {data.portfolio.map((pp) => (
          <div key={pp.id} className="card card-pad">
            <div className="row between"><span className="badge badge-scheduled">{pp.kind}</span>{pp.isDemo && <DemoBadge />}</div>
            <input style={{ marginTop: 8, fontWeight: 600 }} value={pp.title} onChange={(e) => setPortfolio({ ...pp, title: e.target.value })} />
            <input style={{ marginTop: 6 }} placeholder="Finished link" value={pp.link ?? ""} onChange={(e) => setPortfolio({ ...pp, link: e.target.value })} />
            <input style={{ marginTop: 6 }} placeholder="Audience" value={pp.audience ?? ""} onChange={(e) => setPortfolio({ ...pp, audience: e.target.value })} />
            <input style={{ marginTop: 6 }} placeholder="My role" value={pp.role ?? ""} onChange={(e) => setPortfolio({ ...pp, role: e.target.value })} />
            <input style={{ marginTop: 6 }} placeholder="A creative decision" value={pp.creativeDecision ?? ""} onChange={(e) => setPortfolio({ ...pp, creativeDecision: e.target.value })} />
            <input style={{ marginTop: 6 }} placeholder="Results (optional)" value={pp.results ?? ""} onChange={(e) => setPortfolio({ ...pp, results: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
}
