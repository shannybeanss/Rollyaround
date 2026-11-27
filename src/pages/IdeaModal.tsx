import { useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { SERIES_LIST, type Idea, type Series, type Verdict, type ProductionStage, type Platform, type FootageStatus, PLATFORMS } from "../types";
import { uid } from "../lib/helpers";
import { starterStoryboard } from "../lib/storyboard";

const STAGES: ProductionStage[] = ["Idea", "Script", "Edit", "Ready", "Scheduled", "Posted"];

export function IdeaModal({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const { data, update } = useStore();
  const { show } = useToast();
  const [draft, setDraft] = useState<Idea>(structuredClone(idea));
  const [newHook, setNewHook] = useState("");
  const [refLink, setRefLink] = useState("");
  const [refLearn, setRefLearn] = useState("");

  const set = <K extends keyof Idea>(k: K, v: Idea[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    update((d) => {
      const idx = d.ideas.findIndex((x) => x.id === draft.id);
      if (idx >= 0) d.ideas[idx] = { ...draft, updatedAt: new Date().toISOString() };
      return d;
    });
    show("Saved");
    onClose();
  };

  const suggestedTemplate = data.templates.find((t) => t.series === draft.series);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Edit idea</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div><label>Title</label><input value={draft.title} onChange={(e) => set("title", e.target.value)} /></div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Series</label>
              <select value={draft.series} onChange={(e) => set("series", e.target.value as Series)}>
                {SERIES_LIST.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label>Destination</label><input value={draft.destination ?? ""} onChange={(e) => set("destination", e.target.value)} /></div>
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Production stage</label>
              <select value={draft.stage} onChange={(e) => set("stage", e.target.value as ProductionStage)}>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label>Verdict</label>
              <select value={draft.verdict ?? ""} onChange={(e) => set("verdict", (e.target.value || undefined) as Verdict)}>
                <option value="">—</option>{(["Try","Rework","Later","Skip"] as Verdict[]).map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="row gap-16 wrap">
            <label className="row gap-6" style={{ margin: 0 }}><input type="checkbox" style={{ width: 16 }} checked={!!draft.rollyRating} onChange={(e) => set("rollyRating", e.target.checked)} /> Rolly Rating format</label>
            <label className="row gap-6" style={{ margin: 0 }}><input type="checkbox" style={{ width: 16 }} checked={!!draft.verifyBeforeLineup} onChange={(e) => set("verifyBeforeLineup", e.target.checked)} /> Verify before lineup</label>
          </div>

          <div><label>Original wording / raw thought</label><textarea rows={2} value={draft.rawThought ?? ""} onChange={(e) => set("rawThought", e.target.value)} /></div>
          <div><label>Viewer payoff</label><input value={draft.payoff ?? ""} onChange={(e) => set("payoff", e.target.value)} /></div>
          <div><label>Recommended angle</label><input value={draft.angle ?? ""} onChange={(e) => set("angle", e.target.value)} /></div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>First task</label><input value={draft.firstTask ?? ""} onChange={(e) => set("firstTask", e.target.value)} /></div>
            <div><label>Reason</label><input value={draft.reason ?? ""} onChange={(e) => set("reason", e.target.value)} /></div>
          </div>

          {/* Hooks */}
          <div>
            <label>Hook bank</label>
            {draft.hooks.map((h, i) => (
              <div key={i} className="row gap-8" style={{ marginBottom: 6 }}>
                <input value={h} onChange={(e) => { const hooks = [...draft.hooks]; hooks[i] = e.target.value; set("hooks", hooks); }} />
                <button className="btn btn-sm btn-ghost" onClick={() => set("hooks", draft.hooks.filter((_, x) => x !== i))}>✕</button>
              </div>
            ))}
            <div className="row gap-8">
              <input placeholder="Add a hook…" value={newHook} onChange={(e) => setNewHook(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newHook.trim()) { set("hooks", [...draft.hooks, newHook.trim()]); setNewHook(""); } }} />
              <button className="btn btn-sm" onClick={() => { if (newHook.trim()) { set("hooks", [...draft.hooks, newHook.trim()]); setNewHook(""); } }}>Add</button>
            </div>
          </div>

          {/* References */}
          <div>
            <label>Reference videos</label>
            {draft.references.map((r) => (
              <div key={r.id} className="card card-pad" style={{ marginBottom: 6, background: "var(--surface-2)" }}>
                <a href={r.link} target="_blank" rel="noreferrer" className="tiny">{r.link}</a>
                <div className="tiny muted">Learn: {r.learn}</div>
                <button className="btn btn-sm btn-ghost" onClick={() => set("references", draft.references.filter((x) => x.id !== r.id))}>Remove</button>
              </div>
            ))}
            <div className="stack gap-6">
              <input placeholder="Reference link" value={refLink} onChange={(e) => setRefLink(e.target.value)} />
              <div className="row gap-8">
                <input placeholder="What to learn (e.g. the opening shot, the reveal)" value={refLearn} onChange={(e) => setRefLearn(e.target.value)} />
                <button className="btn btn-sm" onClick={() => { if (refLink.trim()) { set("references", [...draft.references, { id: uid(), link: refLink.trim(), learn: refLearn.trim() }]); setRefLink(""); setRefLearn(""); } }}>Add</button>
              </div>
            </div>
          </div>

          {/* Storyboard */}
          <div>
            <div className="row between">
              <label style={{ margin: 0 }}>🎬 Storyboard <span className="tiny muted">— shot by shot</span></label>
              {(!draft.storyboard || draft.storyboard.length === 0) && (
                <button className="btn btn-sm btn-accent" onClick={() => set("storyboard", starterStoryboard(draft.series))}>Start from {draft.series.split(" ").slice(-1)[0]} template</button>
              )}
            </div>
            {draft.storyboard && draft.storyboard.length > 0 && (
              <div className="stack gap-8" style={{ marginTop: 8 }}>
                {draft.storyboard.map((b, i) => (
                  <div key={b.id} className="card card-pad" style={{ background: "var(--surface-2)" }}>
                    <div className="row between">
                      <b className="tiny">Beat {i + 1}</b>
                      <div className="row gap-6">
                        <select style={{ width: "auto" }} value={b.footage} onChange={(e) => { const sb = [...draft.storyboard!]; sb[i] = { ...b, footage: e.target.value as FootageStatus }; set("storyboard", sb); }}>
                          <option>Have</option><option>Need</option><option>Optional</option>
                        </select>
                        <button className="btn btn-sm btn-ghost" onClick={() => set("storyboard", draft.storyboard!.filter((_, x) => x !== i))}>✕</button>
                      </div>
                    </div>
                    <label style={{ marginTop: 6 }}>Shot / visual</label>
                    <input value={b.shot} onChange={(e) => { const sb = [...draft.storyboard!]; sb[i] = { ...b, shot: e.target.value }; set("storyboard", sb); }} />
                    <label style={{ marginTop: 6 }}>Voiceover / on-screen text</label>
                    <textarea rows={2} value={b.voiceover} onChange={(e) => { const sb = [...draft.storyboard!]; sb[i] = { ...b, voiceover: e.target.value }; set("storyboard", sb); }} />
                  </div>
                ))}
                <button className="btn btn-sm" onClick={() => set("storyboard", [...(draft.storyboard ?? []), { id: uid(), shot: "", voiceover: "", footage: "Need" }])}>+ Add beat</button>
              </div>
            )}
          </div>

          {/* Cover + captions */}
          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Cover text</label><input value={draft.coverText ?? ""} onChange={(e) => set("coverText", e.target.value)} /></div>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Instagram caption</label><textarea rows={2} value={draft.captionIG ?? ""} onChange={(e) => set("captionIG", e.target.value)} /></div>
            <div><label>TikTok caption</label><textarea rows={2} value={draft.captionTikTok ?? ""} onChange={(e) => set("captionTikTok", e.target.value)} /></div>
          </div>

          {/* Per-platform status */}
          <div>
            <label>Publishing status (IG & TikTok tracked separately)</label>
            {PLATFORMS.map((p) => (
              <div key={p} className="row gap-8 wrap" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ minWidth: 110, fontWeight: 600 }}>{p}</span>
                <select style={{ width: "auto" }} value={draft.platforms[p].status} onChange={(e) => { const pl = structuredClone(draft.platforms); pl[p as Platform].status = e.target.value as any; set("platforms", pl); }}>
                  <option value="none">—</option><option value="planned">Planned</option><option value="scheduled">Scheduled</option><option value="live">Live</option>
                </select>
                <input type="date" style={{ width: "auto" }} value={draft.platforms[p].date ?? ""} onChange={(e) => { const pl = structuredClone(draft.platforms); pl[p as Platform].date = e.target.value; set("platforms", pl); }} />
                <input placeholder="live link" style={{ maxWidth: 160 }} value={draft.platforms[p].liveLink ?? ""} onChange={(e) => { const pl = structuredClone(draft.platforms); pl[p as Platform].liveLink = e.target.value; set("platforms", pl); }} />
              </div>
            ))}
          </div>

          <div><label>Notes</label><textarea rows={2} value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>

          {suggestedTemplate && <p className="tiny muted">💡 Suggested template for this series: <b>{suggestedTemplate.name}</b></p>}
        </div>
        <div className="modal-foot" style={{ justifyContent: "space-between" }}>
          <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => {
            if (!confirm(`Delete "${draft.title}"? This also removes its scheduled tasks.`)) return;
            update((d) => {
              d.ideas = d.ideas.filter((x) => x.id !== draft.id);
              d.scheduledTasks = d.scheduledTasks.filter((t) => t.ideaId !== draft.id);
              d.waiting = d.waiting.filter((w) => w.ideaId !== draft.id);
              return d;
            });
            show("Idea deleted");
            onClose();
          }}>🗑 Delete</button>
          <div className="row gap-10">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-accent" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
