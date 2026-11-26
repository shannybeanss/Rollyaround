import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { Stat } from "../components/ui";
import { money, invoiceTotal, isOverdue, daysLate, realInvoices, todaySGT, fmtSGT } from "../lib/helpers";
import type { Invoice } from "../types";

export function Money() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [draftFor, setDraftFor] = useState<Invoice | null>(null);

  const real = realInvoices(data);
  const today = todaySGT();
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7);

  const totals = useMemo(() => {
    let earned = 0, paidThisMonth = 0, pending = 0, overdue = 0, due30 = 0;
    for (const inv of real) {
      const t = invoiceTotal(inv);
      if (inv.paid) {
        earned += t;
        if (inv.paidDate?.slice(0, 7) === monthStart) paidThisMonth += t;
      } else {
        pending += t;
        if (isOverdue(inv)) overdue += t;
        if (inv.dueDate >= today && inv.dueDate <= in30) due30 += t;
      }
    }
    return { earned, paidThisMonth, pending, overdue, due30 };
  }, [real, monthStart, today, in30]);

  // Cash flow by month from unpaid invoice due dates
  const cashflow = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of real) {
      if (inv.paid) continue;
      const m = inv.dueDate.slice(0, 7);
      map.set(m, (map.get(m) ?? 0) + invoiceTotal(inv));
    }
    return Array.from(map.entries()).sort().slice(0, 6);
  }, [real]);
  const maxFlow = Math.max(1, ...cashflow.map(([, v]) => v));

  const overdueList = real.filter(isOverdue).sort((a, b) => daysLate(b) - daysLate(a));

  const markPaid = (inv: Invoice) => {
    update((d) => { const i = d.invoices.find((x) => x.id === inv.id); if (i) { i.paid = true; i.paidDate = today; } return d; });
    show(`${inv.client} marked paid`);
  };

  return (
    <div>
      <div className="agent-note"><b>Money</b><span>Real invoices only — DEMO/sample invoices are excluded from these totals.</span></div>

      <div className="row gap-12 wrap" style={{ marginBottom: 16 }}>
        <Stat label="Total earned" value={money(totals.earned)} sub="paid, all time" />
        <Stat label="Paid this month" value={money(totals.paidThisMonth)} tone="ok" />
        <Stat label="Pending" value={money(totals.pending)} />
        <Stat label="Overdue" value={money(totals.overdue)} tone={totals.overdue ? "danger" : undefined} />
        <Stat label="Due in 30 days" value={money(totals.due30)} />
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Expected cash flow <span className="tiny muted">— by invoice due date</span></h3>
        {cashflow.length === 0 && <p className="tiny muted">No upcoming unpaid invoices.</p>}
        <div className="row gap-12" style={{ alignItems: "flex-end", height: 140 }}>
          {cashflow.map(([m, v]) => (
            <div key={m} className="stack" style={{ alignItems: "center", flex: 1 }}>
              <div className="tiny muted">{money(v)}</div>
              <div style={{ width: "70%", background: "var(--accent)", borderRadius: "6px 6px 0 0", height: `${(v / maxFlow) * 100}%`, minHeight: 4 }} />
              <div className="tiny muted" style={{ marginTop: 6 }}>{m}</div>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Overdue — follow up</h3>
      {overdueList.length === 0 ? (
        <div className="card card-pad"><p className="muted">No overdue invoices. 🎉</p></div>
      ) : (
        <div className="stack gap-10">
          {overdueList.map((inv) => (
            <div key={inv.id} className="card card-pad" style={{ borderColor: "var(--danger)" }}>
              <div className="row between wrap">
                <div><b>{inv.client}</b> · <span style={{ color: "var(--danger)" }}>{money(invoiceTotal(inv))} · {daysLate(inv)} days late</span><div className="tiny muted">Due {fmtSGT(inv.dueDate)} · {inv.number}</div></div>
                <div className="row gap-8">
                  <button className="btn btn-sm" onClick={() => setDraftFor(inv)}>Draft follow-up</button>
                  <button className="btn btn-sm btn-accent" onClick={() => markPaid(inv)}>Mark paid</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draftFor && <FollowUpDraft invoice={draftFor} onClose={() => setDraftFor(null)} />}
    </div>
  );
}

function FollowUpDraft({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { data } = useStore();
  const { show } = useToast();
  const draft = `Hi ${invoice.client},\n\nJust a friendly nudge on invoice ${invoice.number} for ${money(invoiceTotal(invoice))}, which was due on ${fmtSGT(invoice.dueDate)} (${daysLate(invoice)} days ago). Could you let me know when I can expect payment?\n\nPayment details:\n${data.business.paymentInstructions}\n\nThank you!\n${data.business.creatorName}`;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>Follow-up draft</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <p className="tiny muted">Draft only — nothing is sent. Copy and send it yourself.</p>
          <textarea rows={10} defaultValue={draft} id="followup-text" />
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-accent" onClick={() => { const el = document.getElementById("followup-text") as HTMLTextAreaElement; navigator.clipboard?.writeText(el.value); show("Follow-up copied"); }}>Copy</button>
        </div>
      </div>
    </div>
  );
}
