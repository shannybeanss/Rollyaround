import { useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { type Idea, type Series, type Verdict } from "../types";
import { uid } from "../lib/helpers";

// Rule-based suggestion. Picks the best-matching series from THIS account's list.
function suggest(text: string, seriesList: string[]): { title: string; series: Series; payoff: string; angle: string; firstTask: string; reason: string; verdict: Verdict } {
  const t = text.toLowerCase();
  const has = (name: string) => seriesList.includes(name);
  let series: Series = seriesList.find((s) => s !== "Standalone") ?? seriesList[0] ?? "Standalone";

  // Travel series matching
  if (has("I Only Have One Stomach") && /café|cafe|matcha|food|eat|restaurant|bakery|pizza|omakase|review|verdict|taste/.test(t)) series = "I Only Have One Stomach";
  else if (has("Your Unpaid Tour Guide") && /itinerary|guide|pack|cost|transport|how to|day trip|tips|where to|plan/.test(t)) series = "Your Unpaid Tour Guide";
  else if (has("Rolly Around the World") && /adventure|story|diary|memories|experience|skydiv|discover|camera roll/.test(t)) series = "Rolly Around the World";
  // Cooking series matching
  else if (has("Recipes") && /recipe|make|cook|dish|bake|ingredient|burger|pasta|how to make/.test(t)) series = "Recipes";
  else if (has("Honest Kitchen Reviews") && /review|worth it|gadget|tool|test|verdict|try/.test(t)) series = "Honest Kitchen Reviews";
  else if (has("Cook With Me") && /vlog|with me|day|morning|evening|routine/.test(t)) series = "Cook With Me";

  const title = text.trim().replace(/\s+/g, " ").slice(0, 70);
  const payoff = series === "I Only Have One Stomach" ? "Is it actually worth it — an honest verdict."
    : series === "Your Unpaid Tour Guide" ? "Everything a viewer needs to plan this themselves."
    : series === "Recipes" ? "A dish worth saving and making."
    : series === "Honest Kitchen Reviews" ? "Is it actually worth buying — an honest verdict."
    : "A personal, visual story worth remembering.";
  const angle = "Open on an interesting visual, then a conversational curiosity hook.";
  const firstTask = "Write the first hook line out loud, then pick the opening shot.";
  const reason = "Your strongest pieces lead with a visual + curiosity; locking the hook first stops the overthinking on edit one.";
  return { title, series, payoff, angle, firstTask, reason, verdict: "Try" };
}

export function QuickCapture({ onOpen }: { onOpen: (idea: Idea) => void }) {
  const { data, update } = useStore();
  const { show } = useToast();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof suggest> | null>(null);

  const analyze = () => { if (text.trim()) setPreview(suggest(text, data.seriesList)); };

  const save = () => {
    if (!preview) return;
    const now = new Date().toISOString();
    const idea: Idea = {
      id: uid(), title: preview.title, series: preview.series, isDemo: false,
      rawThought: text, payoff: preview.payoff, angle: preview.angle,
      firstTask: preview.firstTask, reason: preview.reason, verdict: preview.verdict,
      hooks: [], references: [], stage: "Idea",
      platforms: { TikTok:{status:"none"}, Instagram:{status:"none"}, Lemon8:{status:"none"}, Xiaohongshu:{status:"none"}, "YouTube Shorts":{status:"none"} },
      checklist: [], createdAt: now, updatedAt: now,
    };
    update((d) => { d.ideas.unshift(idea); return d; });
    show(`Saved "${idea.title}"`, undefined);
    setText(""); setPreview(null);
    onOpen(idea);
  };

  return (
    <div className="card card-pad" style={{ marginBottom: 16 }}>
      <label>Tell me your idea</label>
      <div className="row gap-8 wrap">
        <input className="grow" placeholder="A rough thought, a link, or a transcript…" value={text}
               onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} style={{ minWidth: 220 }} />
        <button className="btn btn-primary" onClick={analyze} disabled={!text.trim()}>Suggest</button>
      </div>

      {preview && (
        <div className="card card-pad" style={{ background: "var(--surface-2)", marginTop: 12 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <h4>Suggestion <span className="tiny muted">(rule-based — edit before saving)</span></h4>
            <span className="badge badge-ready">Verdict: {preview.verdict}</span>
          </div>
          <div className="stack gap-10">
            <Field label="Title"><input value={preview.title} onChange={(e) => setPreview({ ...preview, title: e.target.value })} /></Field>
            <Field label="Series">
              <select value={preview.series} onChange={(e) => setPreview({ ...preview, series: e.target.value as Series })}>
                {data.seriesList.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Viewer payoff"><input value={preview.payoff} onChange={(e) => setPreview({ ...preview, payoff: e.target.value })} /></Field>
            <Field label="Starting angle"><input value={preview.angle} onChange={(e) => setPreview({ ...preview, angle: e.target.value })} /></Field>
            <Field label="First task"><input value={preview.firstTask} onChange={(e) => setPreview({ ...preview, firstTask: e.target.value })} /></Field>
            <Field label="Reason"><input value={preview.reason} onChange={(e) => setPreview({ ...preview, reason: e.target.value })} /></Field>
            <Field label="Verdict">
              <div className="row gap-6">
                {(["Try","Rework","Later","Skip"] as Verdict[]).map((v) => (
                  <button key={v} className={`chip ${preview.verdict === v ? "active" : ""}`} onClick={() => setPreview({ ...preview, verdict: v })}>{v}</button>
                ))}
              </div>
            </Field>
          </div>
          <div className="row gap-8" style={{ marginTop: 12 }}>
            <button className="btn btn-accent" onClick={save}>Save idea</button>
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>Discard</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label>{label}</label>{children}</div>;
}
