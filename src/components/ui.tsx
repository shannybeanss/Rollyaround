// Small reusable UI primitives for Rolly Around Studios.

import type { ReactNode } from "react";
import type { ProductionStage, Series, Platform, PlatformStatus } from "../types";
import { SERIES_META } from "../types";

export function SeriesPill({ series }: { series: Series }) {
  const m = SERIES_META[series];
  return <span className={`series-pill ${m.cls}`}><span className="badge-dot" style={{ background: m.accent }} />{m.short}</span>;
}

export function DemoBadge() {
  return <span className="badge badge-demo" title="Demo data — excluded from real totals and recommendations">DEMO</span>;
}

const STAGE_BADGE: Record<ProductionStage, string> = {
  Idea: "badge-idea",
  Script: "badge-progress",
  Edit: "badge-progress",
  Ready: "badge-ready",
  Scheduled: "badge-scheduled",
  Posted: "badge-posted",
};

export function StageBadge({ stage }: { stage: ProductionStage }) {
  return <span className={`badge ${STAGE_BADGE[stage]}`}>{stage === "Ready" ? "Ready to post" : stage}</span>;
}

const PLAT_STATUS_BADGE: Record<PlatformStatus, string> = {
  none: "badge-idea",
  planned: "badge-progress",
  scheduled: "badge-scheduled",
  live: "badge-live",
};

export function PlatformBadge({ platform, status }: { platform: Platform; status: PlatformStatus }) {
  if (status === "none") return null;
  const label = status === "live" ? "Live" : status === "scheduled" ? "Scheduled" : "Planned";
  const short = platform === "Instagram" ? "IG" : platform === "TikTok" ? "TikTok" : platform === "YouTube Shorts" ? "YT" : platform === "Xiaohongshu" ? "RED" : platform;
  return <span className={`badge ${PLAT_STATUS_BADGE[status]}`}>{short} {label}</span>;
}

export function Section({ title, right, children, note }: { title: string; right?: ReactNode; children: ReactNode; note?: string }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <div className="row between" style={{ marginBottom: 10 }}>
        <div>
          <h3 style={{ fontSize: 16 }}>{title}</h3>
          {note && <p className="tiny muted" style={{ marginTop: 2 }}>{note}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-faint)" }}>{children}</div>;
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: "danger" | "ok" }) {
  const color = tone === "danger" ? "var(--danger)" : tone === "ok" ? "var(--ok)" : "var(--ink)";
  return (
    <div className="card card-pad" style={{ flex: 1, minWidth: 140 }}>
      <div className="tiny muted" style={{ textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, color }}>{value}</div>
      {sub && <div className="tiny muted" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
