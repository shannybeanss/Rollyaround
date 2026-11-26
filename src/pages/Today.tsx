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

        <div className="stack gap-12" style={{ marginTop: 10 }}>
          <BriefLine label="Work on first">
            {brief.firstThing ? (
              <><b>{brief.firstThing.text}.</b> <span className="muted">{brief.firstThing.reason}</span></>
            ) : <span className="muted">Nothing blocking — pick a Try idea from your bank to start a quick win.</span>}
          </BriefLine>

          <BriefLine label="Clear next">
            {brief.clearNext ? <b>{brief.clearNext.text}</b> : <span className="muted">Backlog is clear of unqueued Try ideas.</span>}
          </BriefLine>

          <BriefLine label="This week ({brief.thisWeek.length})">
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
              <h3 style={{ fontSize: 15, marginBottom: 8 }}>{kind}</h3>
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
