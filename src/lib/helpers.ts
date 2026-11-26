// Shared logic — respects Karina's rules:
// - 3 original pieces per week; cross-posted piece counts once.
// - demo data excluded from real totals.
// - Singapore time for scheduling.

import type { AppData, Idea, Invoice, Platform, PlatformState } from "../types";

export const SGT_TZ = "Asia/Singapore";

export function fmtSGT(dateIso?: string, withTime = false): string {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString("en-SG", {
    timeZone: SGT_TZ, day: "numeric", month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function todaySGT(): string {
  const now = new Date();
  // Convert to SGT date string YYYY-MM-DD
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: SGT_TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(now);
}

export function startOfWeekSGT(base = todaySGT()): string {
  const d = new Date(base + "T00:00:00+08:00");
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function money(n: number): string {
  return "S$" + n.toLocaleString("en-SG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function invoiceTotal(inv: Invoice): number {
  return inv.lines.reduce((s, l) => s + l.qty * l.rate, 0);
}

export function daysLate(inv: Invoice): number {
  const due = new Date(inv.dueDate + "T00:00:00+08:00").getTime();
  const now = new Date(todaySGT() + "T00:00:00+08:00").getTime();
  return Math.floor((now - due) / 86400000);
}

export function isOverdue(inv: Invoice): boolean {
  return !inv.paid && daysLate(inv) > 0;
}

// Real (non-demo) invoices only
export function realInvoices(data: AppData): Invoice[] {
  return data.invoices.filter((i) => !i.isDemo);
}

// A piece counts as "published this week" once even if cross-posted.
export function weeklyPublishedCount(data: AppData, weekStart = startOfWeekSGT()): number {
  const weekEnd = new Date(weekStart + "T00:00:00+08:00");
  weekEnd.setDate(weekEnd.getDate() + 7);
  const end = weekEnd.toISOString().slice(0, 10);

  let count = 0;
  for (const idea of data.ideas) {
    if (idea.isDemo) continue;
    // did ANY platform go live within this week? count the piece once.
    const liveDates = (Object.values(idea.platforms) as PlatformState[])
      .filter((p) => p.status === "live" && p.date)
      .map((p) => p.date!) as string[];
    if (liveDates.some((d) => d >= weekStart && d < end)) count += 1;
  }
  return count;
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  TikTok: "TikTok",
  Instagram: "Instagram",
  Lemon8: "Lemon8",
  Xiaohongshu: "Xiaohongshu",
  "YouTube Shorts": "YouTube Shorts",
};

// Platforms that are actively scheduled/live on an idea
export function activePlatforms(idea: Idea): { platform: Platform; state: PlatformState }[] {
  return (Object.entries(idea.platforms) as [Platform, PlatformState][])
    .filter(([, s]) => s.status !== "none")
    .map(([platform, state]) => ({ platform, state }));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
