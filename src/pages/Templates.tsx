import { useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { SeriesPill } from "../components/ui";
import { SERIES_LIST, type Template, type Series } from "../types";
import { uid } from "../lib/helpers";

export function Templates() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [editing, setEditing] = useState<Template | null>(null);

  const save = (t: Template) => {
    update((d) => { const i = d.templates.findIndex((x) => x.id === t.id); if (i >= 0) d.templates[i] = t; else d.templates.push(t); return d; });
    show("Template saved"); setEditing(null);
  };
  const remove = (id: string) => update((d) => { d.templates = d.templates.filter((x) => x.id !== id); return d; });

  const starters = data.templates.filter((t) => t.isStarter);
  const mine = data.templates.filter((t) => !t.isStarter);

  const emptyTemplate = (): Template => ({ id: uid(), name: "New template", isStarter: false });

  return (
    <div>
      <div className="agent-note"><b>Templates & References</b><span>Save a finished post as a reusable editing template. Starter templates and your hook bank live here.</span></div>

      <div className="row between" style={{ marginBottom: 10 }}>
        <h3 style={{ fontSize: 16 }}>Starter templates</h3>
        <button className="btn btn-accent" onClick={() => setEditing(emptyTemplate())}>+ New template</button>
      </div>
      <div className="grid-auto" style={{ marginBottom: 20 }}>
        {starters.map((t) => <TemplateCard key={t.id} t={t} onEdit={() => setEditing(structuredClone(t))} onRemove={() => remove(t.id)} />)}
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 10 }}>My templates</h3>
      <div className="grid-auto">
        {mine.length === 0 && <p className="muted">Save a finished post here to reuse its structure, cover and links.</p>}
        {mine.map((t) => <TemplateCard key={t.id} t={t} onEdit={() => setEditing(structuredClone(t))} onRemove={() => remove(t.id)} />)}
      </div>

      {editing && <TemplateEditor t={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function TemplateCard({ t, onEdit, onRemove }: { t: Template; onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="card card-pad idea-card">
      <div className="row between"><b>{t.name}</b>{t.isStarter && <span className="badge badge-idea">Starter</span>}</div>
      {t.series && <SeriesPill series={t.series} />}
      {t.hook && <p className="tiny muted">Hook: {t.hook}</p>}
      {t.structure && <p className="tiny muted">Structure: {t.structure}</p>}
      <div className="row gap-8" style={{ marginTop: "auto", paddingTop: 6 }}>
        <button className="btn btn-sm" onClick={onEdit}>Edit</button>
        {!t.isStarter && <button className="btn btn-sm btn-ghost" onClick={onRemove}>Delete</button>}
      </div>
    </div>
  );
}

function TemplateEditor({ t, onSave, onClose }: { t: Template; onSave: (t: Template) => void; onClose: () => void }) {
  const [d, setD] = useState<Template>(t);
  const F = (k: keyof Template, label: string, ta = false) => (
    <div><label>{label}</label>{ta ? <textarea rows={2} value={(d[k] as string) ?? ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} /> : <input value={(d[k] as string) ?? ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} />}</div>
  );
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Template</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {F("name", "Name")}
          <div><label>Series</label><select value={d.series ?? ""} onChange={(e) => setD({ ...d, series: (e.target.value || undefined) as Series })}><option value="">—</option>{SERIES_LIST.map((s) => <option key={s}>{s}</option>)}</select></div>
          {F("openingShot", "Opening shot")}
          {F("hook", "Hook")}
          {F("structure", "Clip / slide order & voiceover structure", true)}
          <div className="grid-2" style={{ gap: 12 }}>{F("fonts", "Fonts")}{F("coverText", "Cover text")}</div>
          {F("textPlacement", "Text placement")}
          {F("ending", "Ending")}
          <div className="grid-2" style={{ gap: 12 }}>{F("capcutLink", "CapCut link")}{F("canvaLink", "Canva link")}</div>
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-accent" onClick={() => onSave(d)}>Save</button></div>
      </div>
    </div>
  );
}
