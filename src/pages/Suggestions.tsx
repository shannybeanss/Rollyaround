import { useMemo } from "react";
import { useStore } from "../store";
import type { AppData, Idea } from "../types";

export interface Suggestion {
  kind: "Make next" | "Repeat" | "Improve" | "Test";
  title: string;
  detail: string;
  evidence?: string;      // shown for analytics-based recs
  action: { label: "Open idea" | "Add to lineup" | "Use template" | "Log analytics"; ideaId?: string };
}

export function buildSuggestions(data: AppData): Suggestion[] {
  const out: Suggestion[] = [];
  const real = data.ideas.filter((i) => !i.isDemo);

  // Make next — from lineup/backlog, prefer something buildable from footage you have.
  const makeNext = real.find((i) => i.stage === "Edit" || i.stage === "Ready")
    ?? real.find((i) => i.stage === "Idea" && i.verdict === "Try" && !i.verifyBeforeLineup);
  if (makeNext) out.push({
    kind: "Make next",
    title: makeNext.title,
    detail: makeNext.stage === "Edit" || makeNext.stage === "Ready"
      ? "It's already near done — finishing it clears a slot fastest."
      : "You marked it Try with no blockers — a clean next build.",
    action: { label: "Add to lineup", ideaId: makeNext.id },
  });

  // Repeat — tied to a real logged result (highest saves).
  const analytics = data.analytics.filter((a) => !a.isDemo && a.saves != null && a.views);
  if (analytics.length) {
    const best = [...analytics].sort((a, b) => (b.saves! / (b.views || 1)) - (a.saves! / (a.views || 1)))[0];
    const linked = real.find((i) => i.title === best.title);
    out.push({
      kind: "Repeat",
      title: `Follow up "${best.title}"`,
      detail: `Make a second piece in the same format${best.series ? ` for ${best.series}` : ""}.`,
      evidence: `${best.saves} saves on ${best.views?.toLocaleString()} views (${best.platform}, ${best.ageWindow ?? "window n/a"}). Early signal from one post.`,
      action: { label: linked ? "Open idea" : "Use template", ideaId: linked?.id },
    });
  }

  // Improve — a concrete change to a near-done piece.
  const improve = real.find((i) => i.stage === "Edit" || i.stage === "Ready");
  if (improve) out.push({
    kind: "Improve",
    title: `Sharpen the hook on "${improve.title}"`,
    detail: "Open on your most interesting visual and name a number or a verdict in the first 2 seconds.",
    action: { label: "Open idea", ideaId: improve.id },
  });

  // Test — one small experiment.
  out.push({
    kind: "Test",
    title: "Post a food piece at 7pm SGT",
    detail: "Try one evening post and compare 48-hour views against your usual slot.",
    action: { label: "Log analytics" },
  });

  return out;
}

export function Suggestions({ onOpenIdea, onGoLineup }: { onOpenIdea?: (i: Idea) => void; onGoLineup?: () => void }) {
  const { data } = useStore();
  const suggestions = useMemo(() => buildSuggestions(data), [data]);
  const hasRealAnalytics = data.analytics.some((a) => !a.isDemo);

  return (
    <div>
      <div className="agent-note"><b>Suggestions</b><span>{data.settings.aiConnected ? "AI-assisted." : "Rule-based (no AI model connected)."} Performance claims use your real logged data only; one post = an early signal.</span></div>

      {!hasRealAnalytics && <div className="card card-pad" style={{ marginBottom: 14 }}><p className="tiny muted">Repeat/Improve suggestions get sharper once you log real analytics. The current ones are driven by your lineup and bank.</p></div>}

      <div className="grid-2">
        {suggestions.map((s, idx) => (
          <div key={idx} className="card card-pad idea-card">
            <span className="badge badge-scheduled" style={{ alignSelf: "flex-start" }}>{s.kind}</span>
            <div className="title">{s.title}</div>
            <p className="muted">{s.detail}</p>
            {s.evidence && <p className="tiny" style={{ background: "var(--surface-2)", padding: "6px 8px", borderRadius: 8 }}>📊 Evidence: {s.evidence}</p>}
            <div style={{ marginTop: "auto", paddingTop: 6 }}>
              <button className="btn btn-sm btn-accent" onClick={() => {
                if (s.action.ideaId && onOpenIdea) { const i = data.ideas.find((x) => x.id === s.action.ideaId); if (i) onOpenIdea(i); }
                else if (s.action.label === "Add to lineup" && onGoLineup) onGoLineup();
              }}>{s.action.label}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
