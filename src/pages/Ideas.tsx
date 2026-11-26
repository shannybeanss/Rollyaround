import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { SeriesPill, StageBadge, PlatformBadge, DemoBadge } from "../components/ui";
import { SERIES_LIST, type Idea, type Series, type Platform } from "../types";
import { activePlatforms } from "../lib/helpers";
import { IdeaModal } from "./IdeaModal";
import { QuickCapture } from "./QuickCapture";

type FilterStage = "all" | "ideas" | "progress" | "ready" | "posted";

export function Ideas() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<Series | "all">("all");
  const [stageFilter, setStageFilter] = useState<FilterStage>("all");
  const [editing, setEditing] = useState<Idea | null>(null);
  const [logging, setLogging] = useState<Idea | null>(null);

  const destinations = useMemo(
    () => Array.from(new Set(data.ideas.map((i) => i.destination).filter(Boolean))) as string[],
    [data.ideas]
  );
  const [destFilter, setDestFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return data.ideas.filter((i) => {
      if (seriesFilter !== "all" && i.series !== seriesFilter) return false;
      if (destFilter !== "all" && i.destination !== destFilter) return false;
      if (stageFilter === "ideas" && i.stage !== "Idea") return false;
      if (stageFilter === "progress" && !["Script", "Edit"].includes(i.stage)) return false;
      if (stageFilter === "ready" && i.stage !== "Ready") return false;
      if (stageFilter === "posted" && i.stage !== "Posted") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(`${i.title} ${i.destination ?? ""} ${i.series} ${i.notes ?? ""}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [data.ideas, seriesFilter, destFilter, stageFilter, search]);

  const markReady = (idea: Idea) => {
    update((d) => { const i = d.ideas.find((x) => x.id === idea.id); if (i) i.stage = "Ready"; return d; });
    show(`"${idea.title}" → Ready to post`);
  };

  return (
    <div>
      <div className="agent-note">
        <b>Ideas</b>
        <span>Your real idea bank ({data.ideas.filter((i) => !i.isDemo).length} cards). Searchable by series, destination and status.</span>
      </div>

      <QuickCapture onOpen={(idea) => setEditing(idea)} />

      {/* Filters */}
      <div className="filter-bar">
        <input placeholder="Search ideas, destinations…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <div className="row gap-6 wrap">
          {(["all", "ideas", "progress", "ready", "posted"] as FilterStage[]).map((s) => (
            <button key={s} className={`chip ${stageFilter === s ? "active" : ""}`} onClick={() => setStageFilter(s)}>
              {s === "all" ? "All" : s === "ideas" ? "Ideas" : s === "progress" ? "In progress" : s === "ready" ? "Ready" : "Posted"}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-bar">
        <button className={`chip ${seriesFilter === "all" ? "active" : ""}`} onClick={() => setSeriesFilter("all")}>All series</button>
        {SERIES_LIST.map((s) => (
          <button key={s} className={`chip ${seriesFilter === s ? "active" : ""}`} onClick={() => setSeriesFilter(s)}>{s}</button>
        ))}
        <select value={destFilter} onChange={(e) => setDestFilter(e.target.value)} style={{ width: "auto", minWidth: 150 }}>
          <option value="all">All destinations</option>
          {destinations.sort().map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <p className="tiny muted" style={{ marginBottom: 10 }}>{filtered.length} shown</p>

      <div className="grid-auto">
        {filtered.map((idea) => (
          <div key={idea.id} className="card card-pad idea-card">
            <div className="idea-badges">
              <StageBadge stage={idea.stage} />
              {activePlatforms(idea).map(({ platform, state }) => (
                <PlatformBadge key={platform} platform={platform} status={state.status} />
              ))}
              {idea.rollyRating && <span className="badge badge-idea">Rolly Rating</span>}
              {idea.verifyBeforeLineup && <span className="badge badge-danger">Verify before lineup</span>}
              {idea.verdict === "Later" && <span className="badge badge-idea">Later</span>}
              {idea.isDemo && <DemoBadge />}
            </div>
            <div className="title">{idea.title}</div>
            <div className="idea-badges">
              <SeriesPill series={idea.series} />
              {idea.destination && <span className="tiny muted">📍 {idea.destination}</span>}
            </div>
            {idea.notes && <p className="tiny muted">{idea.notes}</p>}
            <div className="row gap-8 wrap" style={{ marginTop: "auto", paddingTop: 6 }}>
              <button className="btn btn-sm" onClick={() => setEditing(idea)}>Open</button>
              {idea.stage !== "Ready" && idea.stage !== "Posted" && (
                <button className="btn btn-sm btn-accent" onClick={() => markReady(idea)}>Mark edit ready</button>
              )}
              <button className="btn btn-sm" onClick={() => setLogging(idea)}>Log published</button>
            </div>
          </div>
        ))}
      </div>

      {editing && <IdeaModal idea={editing} onClose={() => setEditing(null)} />}
      {logging && <LogPublished idea={logging} onClose={() => setLogging(null)} />}
    </div>
  );
}

// Quick "Log published" — pick IG/TikTok/both + date, no full form.
function LogPublished({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const { update } = useStore();
  const { show } = useToast();
  const [plats, setPlats] = useState<Platform[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const toggle = (p: Platform) => setPlats((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const save = () => {
    if (plats.length === 0) { show("Pick at least one platform."); return; }
    update((d) => {
      const i = d.ideas.find((x) => x.id === idea.id);
      if (i) { for (const p of plats) { i.platforms[p].status = "live"; i.platforms[p].date = date; } i.stage = "Posted"; }
      return d;
    });
    show(`Logged "${idea.title}" live on ${plats.join(" + ")}`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Log published</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <p className="muted">{idea.title}</p>
          <div>
            <label>Platforms</label>
            <div className="row gap-8 wrap">
              {(["TikTok", "Instagram"] as Platform[]).map((p) => (
                <button key={p} className={`chip ${plats.includes(p) ? "active" : ""}`} onClick={() => toggle(p)}>{p}</button>
              ))}
            </div>
          </div>
          <div><label>Date (Singapore time)</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={save}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
