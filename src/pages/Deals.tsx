import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { DemoBadge } from "../components/ui";
import { money, uid } from "../lib/helpers";
import type { BrandDeal, DealStage } from "../types";

const STAGES: DealStage[] = ["Inquiry", "Negotiating", "Confirmed", "Filming", "Posted", "Invoiced", "Paid", "Declined", "Closed"];

export function Deals() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [editing, setEditing] = useState<BrandDeal | null>(null);
  const [search, setSearch] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of data.deals) c[d.stage] = (c[d.stage] ?? 0) + 1;
    return c;
  }, [data.deals]);

  const filtered = data.deals.filter((d) => !search || `${d.brand} ${d.contact ?? ""} ${d.offer ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const waitingMe = filtered.filter((d) => d.waitingOn === "me");
  const waitingBrand = filtered.filter((d) => d.waitingOn === "brand");

  const empty = (): BrandDeal => ({ id: uid(), brand: "", stage: "Inquiry", isDemo: false });
  const save = (d: BrandDeal) => { update((s) => { const i = s.deals.findIndex((x) => x.id === d.id); if (i >= 0) s.deals[i] = d; else s.deals.unshift(d); return s; }); show("Deal saved"); setEditing(null); };

  return (
    <div>
      <div className="agent-note"><b>Brand Deals</b><span>Pipeline from Inquiry to Paid. Outgoing messages stay drafts until you approve. Never publishes on your behalf.</span></div>

      <div className="row gap-8 wrap" style={{ marginBottom: 14 }}>
        {STAGES.map((st) => <span key={st} className="badge badge-idea">{st}: {counts[st] ?? 0}</span>)}
      </div>

      <div className="row between wrap" style={{ marginBottom: 14 }}>
        <input placeholder="Search brands…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <div className="row gap-8"><button className="btn" onClick={() => setPasteOpen(true)}>Paste an inquiry</button><button className="btn btn-accent" onClick={() => setEditing(empty())}>+ New deal</button></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div><h4 style={{ marginBottom: 8 }}>Waiting on me ({waitingMe.length})</h4>{waitingMe.map((d) => <DealRow key={d.id} d={d} onEdit={() => setEditing(structuredClone(d))} />)}{!waitingMe.length && <p className="tiny muted">Nothing.</p>}</div>
        <div><h4 style={{ marginBottom: 8 }}>Waiting on brand ({waitingBrand.length})</h4>{waitingBrand.map((d) => <DealRow key={d.id} d={d} onEdit={() => setEditing(structuredClone(d))} />)}{!waitingBrand.length && <p className="tiny muted">Nothing.</p>}</div>
      </div>

      <h4 style={{ marginBottom: 8 }}>All deals</h4>
      <div className="stack gap-8">
        {filtered.map((d) => <DealRow key={d.id} d={d} onEdit={() => setEditing(structuredClone(d))} />)}
        {!filtered.length && <div className="card card-pad"><p className="muted">No deals yet.</p></div>}
      </div>

      {editing && <DealEditor d={editing} onSave={save} onClose={() => setEditing(null)} />}
      {pasteOpen && <PasteInquiry onClose={() => setPasteOpen(false)} onCreate={(d) => { setEditing(d); setPasteOpen(false); }} />}
    </div>
  );
}

function DealRow({ d, onEdit }: { d: BrandDeal; onEdit: () => void }) {
  return (
    <div className="card card-pad row between wrap" style={{ marginBottom: 8 }}>
      <div><div className="row gap-8"><b>{d.brand || "Untitled"}</b><span className="badge badge-scheduled">{d.stage}</span>{d.isDemo && <DemoBadge />}</div>{d.nextAction && <div className="tiny muted">Next: {d.nextAction}</div>}</div>
      <div className="row gap-12">{d.fee != null && <b>{money(d.fee)}</b>}<button className="btn btn-sm" onClick={onEdit}>Open</button></div>
    </div>
  );
}

function DealEditor({ d, onSave, onClose }: { d: BrandDeal; onSave: (d: BrandDeal) => void; onClose: () => void }) {
  const [x, setX] = useState<BrandDeal>(d);
  const F = (k: keyof BrandDeal, label: string) => <div><label>{label}</label><input value={(x[k] as string) ?? ""} onChange={(e) => setX({ ...x, [k]: e.target.value })} /></div>;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Brand deal</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="grid-2" style={{ gap: 12 }}>{F("brand", "Brand")}{F("contact", "Contact")}{F("channel", "Channel")}
            <div><label>Stage</label><select value={x.stage} onChange={(e) => setX({ ...x, stage: e.target.value as DealStage })}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
          {F("offer", "Offer")}{F("deliverables", "Deliverables")}
          <div className="grid-2" style={{ gap: 12 }}><div><label>Fee (SGD)</label><input type="number" value={x.fee ?? ""} onChange={(e) => setX({ ...x, fee: e.target.value === "" ? undefined : Number(e.target.value) })} /></div>{F("deadlines", "Deadlines")}{F("usageRights", "Usage rights")}{F("endDate", "Usage end date")}</div>
          {F("nextAction", "Next action")}
          <div><label>Waiting on</label><select value={x.waitingOn ?? ""} onChange={(e) => setX({ ...x, waitingOn: (e.target.value || undefined) as "me" | "brand" })}><option value="">—</option><option value="me">Me</option><option value="brand">Brand</option></select></div>
          <div><label>Notes</label><textarea rows={2} value={x.notes ?? ""} onChange={(e) => setX({ ...x, notes: e.target.value })} /></div>
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-accent" onClick={() => onSave(x)}>Save</button></div>
      </div>
    </div>
  );
}

function PasteInquiry({ onClose, onCreate }: { onClose: () => void; onCreate: (d: BrandDeal) => void }) {
  const [text, setText] = useState("");
  const parse = () => {
    const feeMatch = text.match(/(?:S\$|SGD|\$)\s?(\d[\d,]*)/i);
    const brandMatch = text.match(/(?:from|at|—)\s*([A-Z][A-Za-z0-9& ]{2,30})/);
    const d: BrandDeal = {
      id: uid(), brand: brandMatch?.[1]?.trim() ?? "", stage: "Inquiry", isDemo: false,
      fee: feeMatch ? Number(feeMatch[1].replace(/,/g, "")) : undefined,
      offer: text.slice(0, 160), waitingOn: "me", nextAction: "Review and reply",
    };
    onCreate(d);
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Paste an inquiry</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body"><p className="tiny muted">Paste an email/DM. Rolly previews a deal card (rule-based) for you to edit — nothing is sent.</p><textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} /></div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-accent" disabled={!text.trim()} onClick={parse}>Preview deal card</button></div>
      </div>
    </div>
  );
}
