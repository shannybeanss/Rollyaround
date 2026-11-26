import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { DemoBadge } from "../components/ui";
import { PLATFORMS, type AnalyticsEntry, type Platform, type Series } from "../types";
import { uid } from "../lib/helpers";

export function Analytics() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [adding, setAdding] = useState(false);

  // Real entries only for insights
  const real = data.analytics.filter((a) => !a.isDemo);

  const platformSummary = useMemo(() => {
    return PLATFORMS.map((p) => {
      const acct = data.accounts.find((a) => a.platform === p);
      const posts = data.analytics.filter((a) => a.platform === p && !a.isDemo);
      const views = posts.reduce((s, a) => s + (a.views ?? 0), 0);
      return { platform: p, acct, posts: posts.length, views };
    });
  }, [data]);

  // Top posts by views (real)
  const topPosts = useMemo(() => [...real].filter((a) => a.views != null).sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5), [real]);

  // What worked by series (highest save rate)
  const insights = useMemo(() => buildInsights(real), [real]);

  const removeEntry = (id: string) => update((d) => { d.analytics = d.analytics.filter((a) => a.id !== id); return d; });

  return (
    <div>
      <div className="agent-note"><b>Analytics</b><span>Log metrics per post & platform. Blanks are fine for unavailable metrics. Account followers are shown separately from post-attributed follows. Insights use real data only — DEMO entries are labelled and excluded.</span></div>

      {/* Platform summaries */}
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>Your platforms</h3>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {platformSummary.map((s) => (
          <div key={s.platform} className="card card-pad">
            <div className="row between"><b>{s.platform}</b>{s.acct?.isDemo && <DemoBadge />}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{s.acct ? s.acct.followers.toLocaleString() : "—"}</div>
            <div className="tiny muted">account followers</div>
            <div className="tiny muted" style={{ marginTop: 6 }}>{s.acct?.views30d != null ? `${(s.acct.views30d / 1000).toFixed(0)}K views / 30d` : "views —"} · eng {s.acct?.engagement != null ? `${s.acct.engagement}%` : "—"}</div>
            <div className="tiny muted">{s.posts} logged posts</div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>What worked</h3>
      {insights.length === 0 ? (
        <div className="card card-pad" style={{ marginBottom: 20 }}><p className="muted">Log a few posts with saves/shares to unlock insights. (Rule-based — uses only your real logged data.)</p></div>
      ) : (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          {insights.map((ins) => (
            <div key={ins.title} className="card card-pad">
              <b>{ins.title}</b>
              <p className="muted" style={{ marginTop: 4 }}>{ins.detail}</p>
              <p className="tiny" style={{ marginTop: 6, color: "var(--accent-ink)" }}>Why it matters: {ins.why}</p>
              <p className="tiny" style={{ marginTop: 2 }}>↳ Try next: {ins.followUp}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top posts */}
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>Top posts <span className="tiny muted">(by logged views)</span></h3>
      <div className="stack gap-8" style={{ marginBottom: 20 }}>
        {topPosts.length === 0 && <div className="card card-pad"><p className="muted">No posts logged yet.</p></div>}
        {topPosts.map((a) => (
          <div key={a.id} className="card card-pad row between wrap">
            <div><b>{a.title}</b><div className="tiny muted">{a.platform} · {a.series ?? "—"} · {a.ageWindow ?? "window —"}</div></div>
            <div className="row gap-16 tiny muted">
              <span>{a.views != null ? `${a.views.toLocaleString()} views` : "views —"}</span>
              <span>{a.saves != null ? `${a.saves} saves` : "saves —"}</span>
              <span>{a.shares != null ? `${a.shares} shares` : "shares —"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Logged entries table */}
      <div className="row between" style={{ marginBottom: 10 }}>
        <h3 style={{ fontSize: 16 }}>Logged posts</h3>
        <button className="btn btn-accent" onClick={() => setAdding(true)}>+ Log a post</button>
      </div>
      <div className="card card-pad" style={{ overflowX: "auto" }}>
        <table className="rolly">
          <thead><tr><th>Post</th><th>Platform</th><th>Window</th><th>Views</th><th>Saves</th><th>Shares</th><th>Follows</th><th></th></tr></thead>
          <tbody>
            {data.analytics.map((a) => (
              <tr key={a.id}>
                <td>{a.title} {a.isDemo && <DemoBadge />}</td>
                <td>{a.platform}</td><td>{a.ageWindow ?? "—"}</td>
                <td>{a.views ?? "—"}</td><td>{a.saves ?? "—"}</td><td>{a.shares ?? "—"}</td><td>{a.follows ?? "—"}</td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => removeEntry(a.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding && <LogPostModal onClose={() => setAdding(false)} onSave={(e) => { update((d) => { d.analytics.unshift(e); return d; }); show("Post logged"); setAdding(false); }} />}
    </div>
  );
}

interface Insight { title: string; detail: string; why: string; followUp: string; }
function buildInsights(entries: AnalyticsEntry[]): Insight[] {
  const out: Insight[] = [];
  const withSaves = entries.filter((e) => e.saves != null && e.views);
  if (withSaves.length) {
    const best = [...withSaves].sort((a, b) => ((b.saves! / (b.views || 1)) - (a.saves! / (a.views || 1))))[0];
    out.push({
      title: `Highest save rate: "${best.title}"`,
      detail: `${best.saves} saves on ${best.views?.toLocaleString()} views (${best.platform}).`,
      why: "High saves mean people want to come back to it — strong signal to make more like it.",
      followUp: `A follow-up in the same format${best.series ? ` for ${best.series}` : ""}, using the same template.`,
    });
  }
  const withShares = entries.filter((e) => e.shares != null);
  if (withShares.length) {
    const best = [...withShares].sort((a, b) => (b.shares! - a.shares!))[0];
    out.push({
      title: `Most shared: "${best.title}"`,
      detail: `${best.shares} shares (${best.platform}).`,
      why: "Shares drive the most new reach for little extra effort.",
      followUp: "Cross-post this to another platform where it hasn't run yet.",
    });
  }
  return out;
}

function LogPostModal({ onClose, onSave }: { onClose: () => void; onSave: (e: AnalyticsEntry) => void }) {
  const { data } = useStore();
  const [e, setE] = useState<AnalyticsEntry>({ id: uid(), title: "", platform: "TikTok", isDemo: false, ageWindow: "7d", views: null, likes: null, saves: null, shares: null, watchTime: null, follows: null });
  const num = (v: string): number | null => v === "" ? null : Number(v);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e2) => e2.stopPropagation()}>
        <div className="modal-head"><h3>Log a post</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div><label>Post</label>
            <input list="idea-list" value={e.title} onChange={(ev) => setE({ ...e, title: ev.target.value })} placeholder="Type or link to a post" />
            <datalist id="idea-list">{data.ideas.filter((i) => !i.isDemo).map((i) => <option key={i.id} value={i.title} />)}</datalist>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Platform</label><select value={e.platform} onChange={(ev) => setE({ ...e, platform: ev.target.value as Platform })}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></div>
            <div><label>Window</label><select value={e.ageWindow} onChange={(ev) => setE({ ...e, ageWindow: ev.target.value })}><option>48h</option><option>7d</option><option>30d</option><option>lifetime</option></select></div>
            <div><label>Posted date</label><input type="date" value={e.postedDate ?? ""} onChange={(ev) => setE({ ...e, postedDate: ev.target.value })} /></div>
            <div><label>Series</label><select value={e.series ?? ""} onChange={(ev) => setE({ ...e, series: (ev.target.value || undefined) as Series })}><option value="">—</option><option>I Only Have One Stomach</option><option>Your Unpaid Tour Guide</option><option>Rolly Around the World</option><option>Standalone</option></select></div>
          </div>
          <div className="grid-3" style={{ gap: 10 }}>
            <div><label>Views</label><input type="number" onChange={(ev) => setE({ ...e, views: num(ev.target.value) })} /></div>
            <div><label>Likes</label><input type="number" onChange={(ev) => setE({ ...e, likes: num(ev.target.value) })} /></div>
            <div><label>Saves</label><input type="number" onChange={(ev) => setE({ ...e, saves: num(ev.target.value) })} /></div>
            <div><label>Shares</label><input type="number" onChange={(ev) => setE({ ...e, shares: num(ev.target.value) })} /></div>
            <div><label>Watch time</label><input type="number" onChange={(ev) => setE({ ...e, watchTime: num(ev.target.value) })} /></div>
            <div><label>Follows (this post)</label><input type="number" onChange={(ev) => setE({ ...e, follows: num(ev.target.value) })} /></div>
          </div>
          <p className="tiny muted">Leave blank any metric you don't have — blanks stay blank, not zero.</p>
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-accent" disabled={!e.title} onClick={() => onSave(e)}>Save</button></div>
      </div>
    </div>
  );
}
