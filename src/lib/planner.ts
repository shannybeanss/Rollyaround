// Planner logic: priority proposals, weekly timeline, conflict detection.
import type { AppData, Idea, ScheduledTask, TaskKind } from "../types";
import { startOfWeekSGT } from "./helpers";

export interface PriorityProposal {
  idea: Idea;
  kind: "Quick win" | "Useful guide" | "Portfolio piece" | "Backup";
  why: string;
}

// Favour: a quick win from existing footage, a useful guide, a portfolio piece.
export function proposePriorities(data: AppData): PriorityProposal[] {
  const pool = data.ideas.filter((i) => !i.isDemo && i.stage !== "Posted" && i.verdict !== "Skip" && i.verdict !== "Later" && !i.verifyBeforeLineup);
  const out: PriorityProposal[] = [];

  const quickWin = pool.find((i) => i.stage === "Edit" || i.stage === "Ready")
    ?? pool.find((i) => i.rollyRating);
  if (quickWin) out.push({ idea: quickWin, kind: "Quick win", why: quickWin.stage === "Edit" || quickWin.stage === "Ready" ? "Already near done — fastest thing to ship." : "A Rolly Rating receipt is quick to cut from footage you likely have." });

  const guide = pool.find((i) => i.series === "Your Unpaid Tour Guide" && i.id !== quickWin?.id);
  if (guide) out.push({ idea: guide, kind: "Useful guide", why: "Guides get saved and keep working for weeks — steady growth." });

  const portfolio = pool.find((i) => i.series === "Rolly Around the World" && i.id !== quickWin?.id && i.id !== guide?.id);
  if (portfolio) out.push({ idea: portfolio, kind: "Portfolio piece", why: "A travel story rounds out your portfolio when workload allows." });

  const backup = pool.find((i) => ![quickWin?.id, guide?.id, portfolio?.id].includes(i.id));
  if (backup) out.push({ idea: backup, kind: "Backup", why: "Ready to pull in if one of the three slips." });

  return out;
}

// A clear next action for a 10–20 minute window.
export function quickAction(data: AppData): { text: string; ideaId?: string } | null {
  const openWaiting = data.waiting.find((w) => !w.done);
  if (openWaiting) return { text: `Decide: ${openWaiting.label}`, ideaId: openWaiting.ideaId };
  const nearDone = data.ideas.find((i) => !i.isDemo && (i.stage === "Edit" || i.stage === "Ready"));
  if (nearDone) return { text: `Cut one clip or write the cover text for "${nearDone.title}"`, ideaId: nearDone.id };
  const script = data.ideas.find((i) => !i.isDemo && i.stage === "Idea" && i.verdict === "Try");
  if (script) return { text: `Draft the hook for "${script.title}"`, ideaId: script.id };
  return null;
}

export function isWeekend(dateIso: string): boolean {
  // Compute the weekday as it is in Singapore, independent of the host timezone.
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Singapore", weekday: "short" })
    .format(new Date(dateIso + "T12:00:00+08:00"));
  return wd === "Sat" || wd === "Sun";
}

// Tasks per weekday; flags overloaded (>2) and weekend work.
export interface DayLoad { date: string; tasks: (ScheduledTask & { idea?: Idea })[]; overloaded: boolean; weekend: boolean; }

export function weekDays(data: AppData, weekStart = startOfWeekSGT()): DayLoad[] {
  const days: DayLoad[] = [];
  for (let n = 0; n < 7; n++) {
    const d = new Date(weekStart + "T00:00:00+08:00");
    d.setDate(d.getDate() + n);
    const date = d.toISOString().slice(0, 10);
    const tasks = data.scheduledTasks.filter((t) => t.date === date).map((t) => ({ ...t, idea: data.ideas.find((i) => i.id === t.ideaId) }));
    const prod = tasks.filter((t) => !t.done).length;
    days.push({ date, tasks, overloaded: !isWeekend(date) && prod > 2, weekend: isWeekend(date) });
  }
  return days;
}

export function conflicts(data: AppData): string[] {
  const out: string[] = [];
  for (const d of weekDays(data)) {
    if (d.overloaded) out.push(`${d.date} has ${d.tasks.filter((t) => !t.done).length} production tasks — over the 2/day cap.`);
    if (d.weekend && d.tasks.some((t) => !t.done)) out.push(`${d.date} is a weekend but has work scheduled.`);
  }
  return out;
}

// Lineup pieces with no scheduled next workday.
export function needsAPlan(data: AppData): Idea[] {
  const scheduledIdeaIds = new Set(data.scheduledTasks.filter((t) => !t.done).map((t) => t.ideaId));
  return data.ideas.filter((i) => !i.isDemo && ["Script", "Edit"].includes(i.stage) && !scheduledIdeaIds.has(i.id));
}

export const TASK_KINDS: TaskKind[] = ["Plan", "Film", "Edit", "Post"];
