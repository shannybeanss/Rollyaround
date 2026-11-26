// Rule-based brief + suggestion engine.
// NOTE: No AI model is connected — these are RULE-BASED, driven by logged data.
// Nothing here invents prices, opinions, routes or results Karina hasn't supplied.

import type { AppData, Idea } from "../types";
import { isOverdue, daysLate, invoiceTotal, money, realInvoices, todaySGT, weeklyPublishedCount } from "./helpers";

export interface Brief {
  greeting: string;
  firstThing: { text: string; reason: string; ideaId?: string } | null;
  clearNext: { text: string; ideaId?: string } | null;
  thisWeek: { idea: Idea; lastStop: string }[];
  dueToday: string[];
  comingUp: string[];
  overdue: { text: string; invoiceId: string }[];
  weeklyProgress: { done: number; goal: number };
}

const STAGE_LAST_STOP: Record<string, string> = {
  Idea: "captured as an idea",
  Script: "scripting",
  Edit: "editing",
  Ready: "edit is ready to post",
  Scheduled: "scheduled",
  Posted: "posted",
};

export function buildBrief(data: AppData): Brief {
  const today = todaySGT();

  // In-progress pieces (not demo, actively being worked)
  const inProgress = data.ideas.filter(
    (i) => !i.isDemo && ["Script", "Edit", "Ready", "Scheduled"].includes(i.stage)
  );

  // First thing: prefer a Ready piece missing a cover/next waiting item,
  // else the nearest-to-done in-progress piece.
  let firstThing: Brief["firstThing"] = null;
  const openWaiting = data.waiting.filter((w) => !w.done);
  const readyMissing = inProgress.find((i) => i.stage === "Edit" || i.stage === "Ready");

  if (openWaiting.length > 0) {
    const w = openWaiting[0];
    firstThing = {
      text: w.label,
      reason: "It's the smallest decision blocking a piece from moving forward.",
      ideaId: w.ideaId,
    };
  } else if (readyMissing) {
    firstThing = {
      text: `Finish "${readyMissing.title}"`,
      reason: `It's already at ${readyMissing.stage.toLowerCase()} stage — closest to done, so clearing it frees the most momentum.`,
      ideaId: readyMissing.id,
    };
  } else {
    const backlog = data.ideas.find((i) => !i.isDemo && i.stage === "Idea" && i.verdict === "Try" && !i.verifyBeforeLineup);
    if (backlog) {
      firstThing = {
        text: `Start "${backlog.title}"`,
        reason: "You marked it Try and it has no blockers — a clean quick win to open the week.",
        ideaId: backlog.id,
      };
    }
  }

  // Clear next: a backlog idea (verdict Try, or any Idea stage) to pull in
  const clearCandidate = data.ideas.find(
    (i) => !i.isDemo && i.stage === "Idea" && !i.verifyBeforeLineup && i.verdict !== "Later" && i.verdict !== "Skip"
  );
  const clearNext = clearCandidate
    ? { text: clearCandidate.title, ideaId: clearCandidate.id }
    : null;

  const thisWeek = inProgress.slice(0, 3).map((idea) => ({
    idea,
    lastStop: STAGE_LAST_STOP[idea.stage] ?? idea.stage,
  }));

  // Due / coming up from scheduled tasks
  const dueToday: string[] = [];
  const comingUp: string[] = [];
  for (const t of data.scheduledTasks) {
    if (t.done) continue;
    const idea = data.ideas.find((i) => i.id === t.ideaId);
    if (!idea) continue;
    const label = `${t.kind}: ${idea.title}`;
    if (t.date === today) dueToday.push(label);
    else if (t.date > today) comingUp.push(`${t.date} — ${label}`);
  }
  comingUp.sort();

  // Overdue invoices (real only)
  const overdue = realInvoices(data)
    .filter(isOverdue)
    .map((inv) => ({
      text: `${inv.client}: ${money(invoiceTotal(inv))} — ${daysLate(inv)} days late`,
      invoiceId: inv.id,
    }));

  const greetingHour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", hour: "2-digit", hour12: false }).format(new Date()));
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";

  return {
    greeting,
    firstThing,
    clearNext,
    thisWeek,
    dueToday,
    comingUp: comingUp.slice(0, 6),
    overdue,
    weeklyProgress: { done: weeklyPublishedCount(data), goal: data.settings.weeklyGoal },
  };
}
