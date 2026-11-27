import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { buildBrief } from "../lib/brief";
import { Section, Empty } from "../components/ui";
import { fmtSGT, todaySGT, uid } from "../lib/helpers";
import type { TaskKind } from "../types";
import { DailyUpdate } from "./DailyUpdate";

const KINDS: TaskKind[] = ["Plan", "Film", "Edit", "Post"];

export function Today() {
  const { data, update } = useStore();
  const { show } = useToast();
  const brief = useMemo(() => buildBrief(data), [data]);

  const [newWaiting, setNewWaiting] = useState("");
  const [addingKind, setAddingKind] = useState<TaskKind | null>(null);
  const [planText, setPlanText] = useState(
    data.todayPlan?.date === todaySGT() ? data.todayPlan.text : ""
  );

  const savePlan = () => {
    const text = planText.trim();
    update((d) => { d.todayPlan = text ? { date: todaySGT(), text } : undefined; return d; });
    show(text ? "Today's focus set — it leads your brief" : "Focus cleared");
  };
  const clearPlan = () => { setPlanText(""); update((d) => { d.todayPlan = undefined; return d; }); show("Focus cleared — back to suggestions"); };

  const toggleWaiting = (id: string) =>
    update((d) => { const w = d.waiting.find((x) => x.id === id); if (w) w.done = !w.done; return d; });

  const addWaiting = () => {
    if (!newWaiting.trim()) return;
    const label = newWaiting.trim();
    update((d) => { d.waiting.push({ id: uid(), label, done: false }); return d; });
    setNewWaiting("");
    show(`Added "${label}" to Waiting on you`);
  };

  const toggleTask = (id: string) =>
    update((d) => { const t = d.scheduledTasks.find((x) => x.id === id); if (t) t.done = !t.done; return d; });

  const checklistByKind = (kind: TaskKind) =>
    data.scheduledTasks
      .filter((t) => t.kind === kind && !t.done)
      .map((t) => ({ task: t, idea: data.ideas.find((i) => i.id === t.ideaId) }))
      .filter((x) => x.idea);

  return (
    <div>
      <div className="agent-note">
        <b>Daily Manager</b>
        <span>Rolly's rule-based brief, built from your live planner. No AI model connected yet — suggestions are rule-based.</span>
      </div>

      {/* Record daily update pinned at top */}
      <DailyUpdate />

      {/* Morning brief */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="row between wrap" style={{ marginBottom: 6 }}>
          <h2 style={{ fontSize: 22 }}>{brief.greeting}, Rolly</h2>
          <span className="tiny muted">Brief for {fmtSGT(todaySGT())} · Singapore time</span>
        </div>

        {/* Today's focus — your own plan leads the brief */}
        <div className="card card-pad" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", marginBottom: 14 }}>
          <label>✍️ Today's focus <span className="tiny muted">— set your own plan; it leads the brief</span></label>
          <div className="row gap-8 wrap">
            <input className="grow" style={{ minWidth: 220 }} placeholder='e.g. "Edit the matcha café review and pick a cover"'
                   value={planText} onChange={(e) => setPlanText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && savePlan()} />
            <button className="btn btn-accent" onClick={savePlan}>Set focus</button>
            {brief.myPlan && <button className="btn btn-ghost" onClick={clearPlan}>Clear</button>}
          </div>
        </div>

        <div className="stack gap-12" style={{ marginTop: 10 }}>
          {brief.myPlan ? (
            <>
              <BriefLine label="Your plan">
                <b style={{ color: "var(--accent-ink)" }}>{brief.myPlan.text}</b>
              </BriefLine>
              {brief.firstThing && (
                <BriefLine label="If spare time">
                  <span className="muted">{brief.firstThing.text} — {brief.firstThing.reason}</span>
                </BriefLine>
              )}
            </>
          ) : (
            <BriefLine label="Work on first">
              {brief.firstThing ? (
                <><b>{brief.firstThing.text}.</b> <span className="muted">{brief.firstThing.reason}</span> <span className="tiny faint">(suggested — set your own focus above to override)</span></>
              ) : <span className="muted">Nothing blocking — set your focus above, or pick a Try idea to start a quick win.</span>}
            </BriefLine>
          )}

          <BriefLine label="Clear next">
            {brief.clearNext ? <b>{brief.clearNext.text}</b> : <span className="muted">Backlog is clear of unqueued Try ideas.</span>}
          </BriefLine>

          <BriefLine label={`This week (${brief.thisWeek.length})`}>
            {brief.thisWeek.length ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {brief.thisWeek.map(({ idea, lastStop }) => (
                  <li key={idea.id}><b>{idea.title}</b> <span className="muted">— last stop: {lastStop}</span></li>
                ))}
              </ul>
            ) : <span className="muted">No pieces in progress yet. Pull three into your lineup.</span>}
          </BriefLine>

          <BriefLine label="Due today">
            {brief.dueToday.length ? brief.dueToday.join(" · ") : <span className="muted">Nothing due today.</span>}
          </BriefLine>

          <BriefLine label="Coming up">
            {brief.comingUp.length ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>{brief.comingUp.map((c) => <li key={c}>{c}</li>)}</ul>
            ) : <span className="muted">Nothing scheduled ahead yet.</span>}
          </BriefLine>

          <BriefLine label="Money to chase">
            {brief.overdue.length ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {brief.overdue.map((o) => <li key={o.invoiceId} style={{ color: "var(--danger)" }}>{o.text}</li>)}
              </ul>
            ) : <span className="muted">No overdue invoices. 🎉</span>}
          </BriefLine>

          <div className="row gap-8" style={{ marginTop: 4 }}>
            <span className="badge badge-ready">This week: {brief.weeklyProgress.done} / {brief.weeklyProgress.goal} originals</span>
          </div>
        </div>
      </div>

      {/* Plan / Film / Edit / Post checklists */}
      <div className="grid-2">
        {KINDS.map((kind) => {
          const items = checklistByKind(kind);
          return (
            <div key={kind} className="card card-pad">
              <div className="row between" style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: 15 }}>{kind}</h3>
                <button className="btn btn-sm btn-ghost" onClick={() => setAddingKind(kind)}>+ Add</button>
              </div>
              {items.length === 0 && <p className="tiny muted">No {kind.toLowerCase()} tasks queued.</p>}
              {items.map(({ task, idea }) => (
                <div key={task.id} className={`checkitem ${task.done ? "done" : ""}`}>
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                  <label className="grow">{idea!.title}</label>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {addingKind && <AddTodayTask kind={addingKind} onClose={() => setAddingKind(null)} />}

      {/* Waiting on you */}
      <div style={{ marginTop: 20 }}>
        <Section title="Waiting on you" note="Specific decisions blocking a piece — check off or add your own.">
          <div className="card card-pad">
            {data.waiting.length === 0 && <Empty>No open decisions. Add one below, e.g. "Pick the packing cover".</Empty>}
            {data.waiting.map((w) => {
              const idea = w.ideaId ? data.ideas.find((i) => i.id === w.ideaId) : undefined;
              return (
                <div key={w.id} className={`checkitem ${w.done ? "done" : ""}`}>
                  <input type="checkbox" checked={w.done} onChange={() => toggleWaiting(w.id)} />
                  <label className="grow">{w.label}{idea && <span className="tiny muted"> · {idea.title}</span>}</label>
                </div>
              );
            })}
            <div className="row gap-8" style={{ marginTop: 12 }}>
              <input placeholder='e.g. "Record the Torquay voiceover"' value={newWaiting}
                     onChange={(e) => setNewWaiting(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && addWaiting()} />
              <button className="btn btn-accent" onClick={addWaiting}>Add</button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function BriefLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
      <span className="tiny muted" style={{ minWidth: 92, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</span>
      <span className="grow" style={{ minWidth: 200 }}>{children}</span>
    </div>
  );
}

// Quick-add a task straight from the Today tab (links to a piece, or a free-text one-off).
function AddTodayTask({ kind, onClose }: { kind: TaskKind; onClose: () => void }) {
  const { data, update } = useStore();
  const { show } = useToast();
  const [ideaId, setIdeaId] = useState("");
  const [freeText, setFreeText] = useState("");
  const [date, setDate] = useState(todaySGT());
  const pieces = data.ideas.filter((i) => !i.isDemo && i.stage !== "Posted");

  const add = () => {
    if (!ideaId && !freeText.trim()) { show("Pick a piece or type a task."); return; }
    update((d) => {
      let targetId = ideaId;
      // If they typed a free-text task with no piece, create a lightweight idea to attach it to.
      if (!targetId && freeText.trim()) {
        targetId = uid();
        d.ideas.unshift({
          id: targetId, title: freeText.trim(), series: d.seriesList[0] ?? "Standalone", isDemo: false,
          hooks: [], references: [], stage: "Idea",
          platforms: { TikTok:{status:"none"}, Instagram:{status:"none"}, Lemon8:{status:"none"}, Xiaohongshu:{status:"none"}, "YouTube Shorts":{status:"none"} },
          checklist: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
      }
      d.scheduledTasks.push({ id: uid(), ideaId: targetId, kind, date, done: false });
      return d;
    });
    show(`Added a ${kind} task`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Add a {kind} task</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div><label>For which piece?</label>
            <select value={ideaId} onChange={(e) => setIdeaId(e.target.value)}>
              <option value="">— or type a new task below —</option>
              {pieces.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
          </div>
          {!ideaId && (
            <div><label>New task</label><input placeholder={`e.g. "${kind === "Film" ? "Film the matcha café" : kind === "Edit" ? "Edit the JB review" : kind === "Plan" ? "Plan the packing carousel" : "Post the café guide"}"`} value={freeText} onChange={(e) => setFreeText(e.target.value)} /></div>
          )}
          <div><label>Date (Singapore time)</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <p className="tiny muted">It'll appear in this {kind} box and on your Lineup timeline.</p>
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-accent" onClick={add}>Add task</button></div>
      </div>
    </div>
  );
}
