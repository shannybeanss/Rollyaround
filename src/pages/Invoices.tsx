import { useState, useEffect } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { money, invoiceTotal, isOverdue, daysLate, fmtSGT, uid } from "../lib/helpers";
import { DemoBadge } from "../components/ui";
import type { Invoice, InvoiceLine, RateLine } from "../types";

function emptyInvoice(num: string): Invoice {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  return { id: uid(), number: num, client: "", issueDate: today, dueDate: due, lines: [{ id: uid(), description: "", qty: 1, rate: 0 }], paid: false, isDemo: false };
}

export function Invoices({ carriedLines, clearCarried }: { carriedLines?: RateLine[] | null; clearCarried?: () => void }) {
  const { data, update } = useStore();
  const { show } = useToast();
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [viewing, setViewing] = useState<Invoice | null>(null);

  const nextNumber = () => {
    const nums = data.invoices.map((i) => Number(i.number.replace(/\D/g, ""))).filter((n) => !Number.isNaN(n));
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return "INV-" + String(n).padStart(4, "0");
  };

  // When rates are carried in, open a prefilled draft.
  useEffect(() => {
    if (carriedLines && carriedLines.length) {
      const inv = emptyInvoice(nextNumber());
      inv.lines = carriedLines.map((l) => ({ id: uid(), description: l.service + (l.unit ? ` (${l.unit})` : ""), qty: l.qty, rate: l.rate }));
      setEditing(inv);
      clearCarried?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carriedLines]);

  const saveInvoice = (inv: Invoice) => {
    update((d) => {
      const idx = d.invoices.findIndex((x) => x.id === inv.id);
      if (idx >= 0) d.invoices[idx] = inv; else d.invoices.unshift(inv);
      return d;
    });
    show(`Saved invoice ${inv.number}`);
    setEditing(null);
  };

  const togglePaid = (inv: Invoice) => {
    update((d) => {
      const i = d.invoices.find((x) => x.id === inv.id);
      if (i) { i.paid = !i.paid; i.paidDate = i.paid ? new Date().toISOString().slice(0, 10) : undefined; }
      return d;
    });
    show(inv.paid ? "Marked unpaid — Money updated" : "Marked paid — Money updated");
  };

  const removeInvoice = (inv: Invoice) =>
    update((d) => { d.invoices = d.invoices.filter((x) => x.id !== inv.id); return d; });

  return (
    <div>
      <div className="agent-note"><b>Invoices</b><span>Create, edit, print/PDF and mark paid. Money stays in sync. Sample invoices are marked DEMO and excluded from real totals.</span></div>

      <div className="row between" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 16 }}>All invoices</h3>
        <button className="btn btn-accent" onClick={() => setEditing(emptyInvoice(nextNumber()))}>+ New invoice</button>
      </div>

      <div className="stack gap-10">
        {data.invoices.map((inv) => (
          <div key={inv.id} className="card card-pad">
            <div className="row between wrap gap-10">
              <div>
                <div className="row gap-8 wrap">
                  <b>{inv.number}</b> · {inv.client || <span className="muted">No client</span>}
                  {inv.isDemo && <DemoBadge />}
                  {inv.paid ? <span className="badge badge-ready">Paid</span> : isOverdue(inv) ? <span className="badge badge-danger">Overdue {daysLate(inv)}d</span> : <span className="badge badge-progress">Unpaid</span>}
                </div>
                <div className="tiny muted">Issued {fmtSGT(inv.issueDate)} · Due {fmtSGT(inv.dueDate)}</div>
              </div>
              <div className="row gap-16">
                <b style={{ fontSize: 17 }}>{money(invoiceTotal(inv))}</b>
              </div>
            </div>
            <div className="row gap-8 wrap" style={{ marginTop: 10 }}>
              <button className="btn btn-sm" onClick={() => setViewing(inv)}>View</button>
              <button className="btn btn-sm" onClick={() => setEditing(structuredClone(inv))}>Edit</button>
              <button className="btn btn-sm" onClick={() => togglePaid(inv)}>{inv.paid ? "Mark unpaid" : "Mark paid"}</button>
              <button className="btn btn-sm btn-ghost" onClick={() => removeInvoice(inv)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Business details */}
      <BusinessDetails />

      {editing && <InvoiceEditor invoice={editing} onSave={saveInvoice} onClose={() => setEditing(null)} />}
      {viewing && <InvoiceView invoice={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function InvoiceEditor({ invoice, onSave, onClose }: { invoice: Invoice; onSave: (i: Invoice) => void; onClose: () => void }) {
  const [inv, setInv] = useState<Invoice>(invoice);
  const setLine = (id: string, patch: Partial<InvoiceLine>) =>
    setInv((p) => ({ ...p, lines: p.lines.map((l) => l.id === id ? { ...l, ...patch } : l) }));
  const addLine = () => setInv((p) => ({ ...p, lines: [...p.lines, { id: uid(), description: "", qty: 1, rate: 0 }] }));
  const rmLine = (id: string) => setInv((p) => ({ ...p, lines: p.lines.filter((l) => l.id !== id) }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Invoice {inv.number}</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="grid-2" style={{ gap: 12 }}>
            <div><label>Invoice number</label><input value={inv.number} onChange={(e) => setInv({ ...inv, number: e.target.value })} /></div>
            <div><label>Client</label><input value={inv.client} onChange={(e) => setInv({ ...inv, client: e.target.value })} /></div>
            <div><label>Issue date</label><input type="date" value={inv.issueDate} onChange={(e) => setInv({ ...inv, issueDate: e.target.value })} /></div>
            <div><label>Due date</label><input type="date" value={inv.dueDate} onChange={(e) => setInv({ ...inv, dueDate: e.target.value })} /></div>
          </div>
          <div>
            <label>Line items</label>
            <table className="rolly">
              <thead><tr><th>Description</th><th style={{ width: 60 }}>Qty</th><th style={{ width: 110 }}>Rate</th><th style={{ width: 90 }}>Total</th><th></th></tr></thead>
              <tbody>
                {inv.lines.map((l) => (
                  <tr key={l.id}>
                    <td><input value={l.description} onChange={(e) => setLine(l.id, { description: e.target.value })} /></td>
                    <td><input type="number" value={l.qty} onChange={(e) => setLine(l.id, { qty: Number(e.target.value) })} /></td>
                    <td><input type="number" value={l.rate} onChange={(e) => setLine(l.id, { rate: Number(e.target.value) })} /></td>
                    <td>{money(l.qty * l.rate)}</td>
                    <td><button className="btn btn-sm btn-ghost" onClick={() => rmLine(l.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={addLine}>+ Add line</button>
          </div>
          <div><label>Notes</label><textarea rows={2} value={inv.notes ?? ""} onChange={(e) => setInv({ ...inv, notes: e.target.value })} /></div>
          <div className="row between"><span className="muted">Total</span><b style={{ fontSize: 18 }}>{money(invoiceTotal(inv))}</b></div>
          <label className="row gap-6" style={{ margin: 0 }}><input type="checkbox" style={{ width: 16 }} checked={inv.isDemo} onChange={(e) => setInv({ ...inv, isDemo: e.target.checked })} /> Mark as DEMO (excluded from real totals)</label>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={() => onSave(inv)}>Save invoice</button>
        </div>
      </div>
    </div>
  );
}

function InvoiceView({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { data } = useStore();
  const b = data.business;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head no-print"><h3>Invoice preview</h3><div className="row gap-8"><button className="btn btn-sm" onClick={() => window.print()}>Print / PDF</button><button className="btn btn-ghost" onClick={onClose}>✕</button></div></div>
        <div className="modal-body" id="invoice-print">
          {invoice.isDemo && <div className="badge badge-demo" style={{ alignSelf: "flex-start" }}>DEMO — sample invoice</div>}
          <div className="row between">
            <div><h2 style={{ fontSize: 20 }}>{b.businessName || b.creatorName}</h2><div className="tiny muted">{b.email}</div><div className="tiny muted" style={{ whiteSpace: "pre-line" }}>{b.address}</div></div>
            <div style={{ textAlign: "right" }}><h3>INVOICE</h3><div className="tiny muted">{invoice.number}</div></div>
          </div>
          <div className="row between">
            <div><div className="tiny muted">Bill to</div><b>{invoice.client}</b></div>
            <div style={{ textAlign: "right" }}><div className="tiny muted">Issued {fmtSGT(invoice.issueDate)}</div><div className="tiny muted">Due {fmtSGT(invoice.dueDate)}</div></div>
          </div>
          <table className="rolly">
            <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
            <tbody>{invoice.lines.map((l) => <tr key={l.id}><td>{l.description}</td><td>{l.qty}</td><td>{money(l.rate)}</td><td>{money(l.qty * l.rate)}</td></tr>)}</tbody>
          </table>
          <div className="row between"><span></span><div style={{ textAlign: "right" }}><div className="tiny muted">Total due</div><b style={{ fontSize: 22 }}>{money(invoiceTotal(invoice))}</b></div></div>
          {b.paymentInstructions && <div><div className="tiny muted">Payment instructions</div><div style={{ whiteSpace: "pre-line" }}>{b.paymentInstructions}</div></div>}
          {invoice.notes && <div className="tiny muted">{invoice.notes}</div>}
        </div>
      </div>
    </div>
  );
}

function BusinessDetails() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [b, setB] = useState(data.business);
  const save = () => { update((d) => { d.business = b; return d; }); show("Invoice details saved"); };
  return (
    <details className="card card-pad" style={{ marginTop: 18 }}>
      <summary style={{ cursor: "pointer", fontWeight: 650 }}>Your invoice details <span className="tiny muted">— name, address and payment instructions shown on every invoice</span></summary>
      <div className="stack gap-10" style={{ marginTop: 12 }}>
        <div className="grid-2" style={{ gap: 12 }}>
          <div><label>Creator name</label><input value={b.creatorName} onChange={(e) => setB({ ...b, creatorName: e.target.value })} /></div>
          <div><label>Business name</label><input value={b.businessName} onChange={(e) => setB({ ...b, businessName: e.target.value })} /></div>
          <div><label>Email</label><input value={b.email} onChange={(e) => setB({ ...b, email: e.target.value })} /></div>
        </div>
        <div><label>Address</label><textarea rows={2} value={b.address} onChange={(e) => setB({ ...b, address: e.target.value })} /></div>
        <div><label>Payment instructions (PayNow / bank)</label><textarea rows={2} value={b.paymentInstructions} onChange={(e) => setB({ ...b, paymentInstructions: e.target.value })} /></div>
        <button className="btn btn-accent" style={{ alignSelf: "flex-start" }} onClick={save}>Save details</button>
      </div>
    </details>
  );
}
