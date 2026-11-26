import { useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { money, uid } from "../lib/helpers";
import type { RateLine } from "../types";

export function Rates({ onCarryToInvoice }: { onCarryToInvoice?: (lines: RateLine[]) => void }) {
  const { data, update } = useStore();
  const { show } = useToast();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const setLine = (id: string, patch: Partial<RateLine>) =>
    update((d) => { const l = d.rates.find((x) => x.id === id); if (l) Object.assign(l, patch); return d; });

  const addLine = () =>
    update((d) => { d.rates.push({ id: uid(), service: "New service", qty: 1, rate: 0 }); return d; });

  const removeLine = (id: string) =>
    update((d) => { d.rates = d.rates.filter((x) => x.id !== id); return d; });

  const selectedLines = data.rates.filter((l) => selected[l.id]);
  const packageTotal = data.rates.reduce((s, l) => s + l.qty * l.rate, 0);
  const selectedTotal = selectedLines.reduce((s, l) => s + l.qty * l.rate, 0);

  const copyQuote = () => {
    const lines = (selectedLines.length ? selectedLines : data.rates);
    const total = lines.reduce((s, l) => s + l.qty * l.rate, 0);
    const text = [
      "Rate quote — Rolly Around Studios (SGD)",
      ...lines.map((l) => `• ${l.service}${l.unit ? ` (${l.unit})` : ""} ×${l.qty} — ${money(l.rate * l.qty)}`),
      `Total: ${money(total)}`,
    ].join("\n");
    navigator.clipboard?.writeText(text);
    show("Quote copied to clipboard");
  };

  return (
    <div>
      <div className="agent-note"><b>Rates</b><span>Your rate card in SGD. Edit services, units, quantities and rates. Copy a quote or carry lines into a new invoice.</span></div>

      <div className="card card-pad">
        <table className="rolly">
          <thead>
            <tr><th style={{ width: 30 }}></th><th>Service</th><th>Unit / period</th><th style={{ width: 70 }}>Qty</th><th style={{ width: 120 }}>Rate (SGD)</th><th style={{ width: 110 }}>Line total</th><th></th></tr>
          </thead>
          <tbody>
            {data.rates.map((l) => (
              <tr key={l.id}>
                <td><input type="checkbox" style={{ width: 16 }} checked={!!selected[l.id]} onChange={() => setSelected((p) => ({ ...p, [l.id]: !p[l.id] }))} /></td>
                <td><input value={l.service} onChange={(e) => setLine(l.id, { service: e.target.value })} /></td>
                <td><input value={l.unit ?? ""} placeholder="e.g. per 30 days" onChange={(e) => setLine(l.id, { unit: e.target.value })} /></td>
                <td><input type="number" min={0} value={l.qty} onChange={(e) => setLine(l.id, { qty: Number(e.target.value) })} /></td>
                <td><input type="number" min={0} value={l.rate} onChange={(e) => setLine(l.id, { rate: Number(e.target.value) })} /></td>
                <td>{money(l.qty * l.rate)}</td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => removeLine(l.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="row between wrap" style={{ marginTop: 14 }}>
          <button className="btn btn-sm" onClick={addLine}>+ Add service</button>
          <div className="row gap-16">
            <div className="tiny muted">Package total: <b style={{ color: "var(--ink)", fontSize: 15 }}>{money(packageTotal)}</b></div>
            {selectedLines.length > 0 && <div className="tiny muted">Selected: <b style={{ color: "var(--ink)", fontSize: 15 }}>{money(selectedTotal)}</b></div>}
          </div>
        </div>

        <div className="row gap-8 wrap" style={{ marginTop: 14 }}>
          <button className="btn" onClick={copyQuote}>Copy quote{selectedLines.length ? ` (${selectedLines.length})` : ""}</button>
          {onCarryToInvoice && (
            <button className="btn btn-accent" onClick={() => { onCarryToInvoice(selectedLines.length ? selectedLines : data.rates); show("Carried into a new invoice draft — see Invoices"); }}>
              Carry into new invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
