import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { SeriesPill, StageBadge } from "../components/ui";
import { SERIES_META, type Idea, type TaskKind } from "../types";
import { proposePriorities, quickAction, weekDays, conflicts, needsAPlan, TASK_KINDS } from "../lib/planner";
import { startOfWeekSGT, fmtSGT, uid } from "../lib/helpers";

export function Lineup({ onOpenIdea }: { onOpenIdea?: (idea: Idea) => void }) {
  const { data, update } = useStore();
  const { show } = useToast();
  const [weekStart, setWeekStart] = useState(startOfWeekSGT());

  const priorities = useMemo(() => proposePriorities(data), [data]);
  const quick = useMemo(() => quickAction(data), [data]);
  const days = useMemo(() => weekDays(data, weekStart), [data, weekStart]);
  const conflictList = useMemo(() => conflicts(data), [data]);
  const needPlan = useMemo(() => needsAPlan(data), [data]);

  const [adding, setAdding] = useState<{ date: string } | null>(null);

  const toggleTask = (id: string) =>
    update((d) => { const t = d.scheduledTasks.find((x) => x.id === id); if (t) t.done = !t.done; return d; });

  const addTask = (ideaId: string, kind: TaskKind, date: string) => {
    update((d) => { d.scheduledTasks.push({ id: uid(), ideaId, kind, date, done: false }); return d; });
    show(`Added ${kind} task`);
    setAdding(null);
  };

  const shiftWeek = (n: number) => {
    const d = new Date(weekStart + "T00:00:00+08:00"); d.setDate(d.getDate() + n * 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };

  return (
    <div>
      <div className="agent-note"><b>Lineup</b><span>Singapore time. Weekends kept free, weekdays capped at 2 production tasks. Rule-based priorities from your bank.</span></div>

      {/* Quick action */}
      {quick && (
        <div className="card card-pad" style={{ marginBottom: 16, background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <div className="row between wrap">
            <div><b>Got 10–20 minutes?</b> <span>{quick.text}</span></div>
            {quick.ideaId && onOpenIdea && <button className="btn btn-sm btn-accent" onClick={() => { const i = data.ideas.find((x) => x.id === quick.ideaId); if (i) onOpenIdea(i); }}>Open</button>}
          </div>
        </div>
      )}

      {/* Priority proposals */}
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>This week's priorities</h3>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        {priorities.map((p) => (
          <div key={p.idea.id} className="card card-pad idea-card" style={{ borderLeft: `4px solid ${SERIES_META[p.idea.series].accent}` }}>
            <div className="row between"><span className="badge badge-scheduled">{p.kind}</span><StageBadge stage={p.idea.stage} /></div>
            <div className="title">{p.idea.title}</div>
            <SeriesPill series={p.idea.series} />
            <p className="tiny muted">{p.why}</p>
            {onOpenIdea && <button className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => onOpenIdea(p.idea)}>Open post card</button>}
          </div>
        ))}
        {priorities.length === 0 && <p className="muted">Mark some ideas "Try" to get priority proposals.</p>}
      </div>

      {/* Bottleneck check */}
      <div className="card card-pad" style={{ marginBottom: 16, background: conflictList.length ? "var(--danger-bg)" : "var(--status-ready-bg)" }}>
        <b>{conflictList.length ? "⚠ Conflicts" : "✓ All clear"}</b>
        {conflictList.length ? (
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{conflictList.map((c) => <li key={c}>{c}</li>)}</ul>
        ) : <span className="muted"> No overloaded weekdays and your weekends are free. Nice pacing.</span>}
      </div>

      {/* Weekly timeline */}
      <div className="row between" style={{ marginBottom: 10 }}>
        <h3 style={{ fontSize: 16 }}>Weekly timeline <span className="tiny muted">(work order)</span></h3>
        <div className="row gap-8"><button className="btn btn-sm" onClick={() => shiftWeek(-1)}>← Prev</button><button className="btn btn-sm" onClick={() => setWeekStart(startOfWeekSGT())}>This week</button><button className="btn btn-sm" onClick={() => shiftWeek(1)}>Next →</button></div>
      </div>

      <div className="card card-pad" style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 640 }}>
          {/* Header row of days */}
          <div className="row" style={{ gap: 6, marginBottom: 8 }}>
            <div style={{ width: 54, flex: "none" }} />
            {days.map((d) => (
              <div key={d.date} style={{ flex: 1, textAlign: "center" }} className={`tiny ${d.weekend ? "faint" : "muted"}`}>
                <div style={{ fontWeight: 700 }}>{new Date(d.date + "T00:00:00+08:00").toLocaleDateString("en-SG", { weekday: "short", timeZone: "Asia/Singapore" })}</div>
                <div>{fmtSGT(d.date)}</div>
                {d.overloaded && <div style={{ color: "var(--danger)" }}>over</div>}
                {d.weekend && <div className="faint">free</div>}
              </div>
            ))}
          </div>
          {/* Rows per kind */}
          {TASK_KINDS.map((kind) => (
            <div key={kind} className="row" style={{ gap: 6, alignItems: "stretch", marginBottom: 6 }}>
              <div style={{ width: 54, flex: "none", fontSize: 12, fontWeight: 650, color: "var(--ink-soft)", display: "flex", alignItems: "center" }}>{kind}</div>
              {days.map((d) => {
                const cell = d.tasks.filter((t) => t.kind === kind);
                return (
                  <div key={d.date} style={{ flex: 1, minHeight: 46, background: d.weekend ? "var(--surface-2)" : "var(--bg)", borderRadius: 8, padding: 4, border: "1px solid var(--border)" }}>
                    {cell.map((t) => (
                      <div key={t.id} onClick={() => toggleTask(t.id)} title="Click to toggle done"
                           style={{ fontSize: 11, padding: "3px 6px", borderRadius: 6, marginBottom: 3, cursor: "pointer", color: "#fff",
                                    background: t.idea ? SERIES_META[t.idea.series].accent : "var(--ink-soft)", opacity: t.done ? 0.45 : 1, textDecoration: t.done ? "line-through" : "none" }}>
                        {t.idea?.title.slice(0, 18) ?? "—"}
                      </div>
                    ))}
                    <button className="btn btn-sm btn-ghost" style={{ padding: "1px 6px", fontSize: 11, width: "100%" }} onClick={() => setAdding({ date: d.date })}>+</button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="row gap-16 wrap" style={{ marginTop: 8 }}>
        {Object.entries(SERIES_META).map(([s, m]) => <span key={s} className="tiny row gap-6"><span className="badge-dot" style={{ background: m.accent }} />{m.short}</span>)}
      </div>

      {/* Needs a plan */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 10 }}>Needs a plan <span className="tiny muted">— lineup pieces with no next workday</span></h3>
        {needPlan.length === 0 ? <div className="card card-pad"><p className="muted">Every active piece has a scheduled next step.</p></div> : (
          <div className="stack gap-8">
            {needPlan.map((i) => (
              <div key={i.id} className="card card-pad row between wrap">
                <div><b>{i.title}</b> <StageBadge stage={i.stage} /></div>
                <button className="btn btn-sm btn-accent" onClick={() => setAdding({ date: startOfWeekSGT() })}>Schedule next step</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {adding && <AddTaskModal date={adding.date} onClose={() => setAdding(null)} onAdd={addTask} />}
    </div>
  );
}

function AddTaskModal({ date, onClose, onAdd }: { date: string; onClose: () => void; onAdd: (ideaId: string, kind: TaskKind, date: string) => void }) {
  const { data } = useStore();
  const [ideaId, setIdeaId] = useState("");
  const [kind, setKind] = useState<TaskKind>("Edit");
  const [d, setD] = useState(date);
  const pieces = data.ideas.filter((i) => !i.isDemo && i.stage !== "Posted");
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Schedule a task</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div><label>Piece</label><select value={ideaId} onChange={(e) => setIdeaId(e.target.value)}><option value="">Choose…</option>{pieces.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}</select></div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Task</label><select value={kind} onChange={(e) => setKind(e.target.value as TaskKind)}>{TASK_KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
            <div><label>Date (SGT)</label><input type="date" value={d} onChange={(e) => setD(e.target.value)} /></div>
          </div>
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-accent" disabled={!ideaId} onClick={() => onAdd(ideaId, kind, d)}>Add</button></div>
      </div>
    </div>
  );
}
