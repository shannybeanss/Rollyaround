export function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <div className="agent-note"><b>{title}</b><span>Coming together next. Your data model and tab are wired — full UI is being built.</span></div>
      <div className="card card-pad" style={{ textAlign: "center", padding: 40, color: "var(--ink-faint)" }}>
        <h2 style={{ fontSize: 20, color: "var(--ink)" }}>{title}</h2>
        <p className="muted" style={{ marginTop: 8, maxWidth: 480, marginInline: "auto" }}>{desc}</p>
      </div>
    </div>
  );
}
