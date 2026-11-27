// Rule-based brainstorm: from "I did X today" → hook options + follow-up video ideas.
// NOT AI — hooks are built from proven templates filled with the detected topic.
// Structured so a real AI model can replace `brainstorm()` later without UI changes.

import type { AppData, Idea, Series } from "../types";

const uid = () => Math.random().toString(36).slice(2, 10);

// Pull the likely topic/subject out of a sentence like
// "today I did the burger video and also edited clips about it".
export function detectTopic(text: string): string {
  const t = text.toLowerCase();
  // "the X video", "a X recipe", "X review", "filmed X"
  const patterns = [
    /(?:the|a|an|my)\s+([a-z][a-z0-9 '&-]{2,40}?)\s+(?:video|clip|clips|recipe|review|vlog|reel|carousel|guide)/,
    /(?:did|filmed|shot|made|recorded|cooked|tried|visited|ate at)\s+(?:the|a|an|my)?\s*([a-z][a-z0-9 '&-]{2,40})/,
    /(?:about|on|of)\s+(?:the|a|an|my)?\s*([a-z][a-z0-9 '&-]{2,40})/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m && m[1]) {
      return m[1].replace(/\b(video|clip|clips|today|and|also|some|editing|about|it)\b/g, "").trim()
        .replace(/\s+/g, " ");
    }
  }
  // Fallback: longest meaningful noun-ish word
  const words = (t.match(/[a-z]{4,}/g) ?? []).filter((w) => !["today","video","clip","clips","also","some","editing","about","with","that","this","done","did"].includes(w));
  return words[0] ?? "this";
}

function guessSeries(topic: string, seriesList: string[]): Series {
  const t = topic.toLowerCase();
  const has = (s: string) => seriesList.includes(s);
  if (has("Recipes") && /recipe|burger|pasta|cook|bake|dish|food|meal/.test(t)) return "Recipes";
  if (has("Honest Kitchen Reviews") && /review|gadget|tool|worth/.test(t)) return "Honest Kitchen Reviews";
  if (has("I Only Have One Stomach") && /café|cafe|matcha|food|eat|restaurant|bakery|burger|dish/.test(t)) return "I Only Have One Stomach";
  if (has("Your Unpaid Tour Guide") && /guide|itinerary|trip|travel|pack/.test(t)) return "Your Unpaid Tour Guide";
  if (has("Rolly Around the World") && /adventure|story|trip|experience/.test(t)) return "Rolly Around the World";
  return seriesList[0] ?? "Standalone";
}

// Build hook options from proven templates.
export function hookIdeas(topic: string): string[] {
  const T = topic.trim() || "this";
  const Cap = T.charAt(0).toUpperCase() + T.slice(1);
  return [
    `I tried ${T} so you don't have to — here's the honest verdict.`,
    `POV: you've been making ${T} wrong this whole time.`,
    `3 things nobody tells you about ${T}.`,
    `Is ${T} actually worth it? Let's find out.`,
    `${Cap} — but make it 10x better. Save this.`,
    `The ${T} that broke my brain (in the best way).`,
    `Stop scrolling if you love ${T}.`,
  ];
}

// Build follow-up video ideas (a content series from one topic).
export function followUpIdeas(topic: string): { title: string; note: string }[] {
  const T = topic.trim() || "this";
  return [
    { title: `${T} — Part 2 / the sequel`, note: "Ride the momentum with a second angle while interest is high." },
    { title: `How to make/do ${T} (step-by-step)`, note: "Turn it into a saveable how-to — guides get saved for weeks." },
    { title: `${T}: my honest rating`, note: "A Rolly Rating verdict version for a different format." },
    { title: `Behind the scenes of the ${T} video`, note: "BTS performs well and is low effort from footage you already have." },
    { title: `What I'd change about my ${T} video`, note: "A reflective / improvement angle that invites comments." },
  ];
}

export interface BrainstormResult {
  topic: string;
  series: Series;
  hooks: string[];
  followUps: { title: string; note: string }[];
}

export function brainstorm(text: string, data: AppData): BrainstormResult {
  const topic = detectTopic(text);
  const series = guessSeries(topic, data.seriesList);
  return { topic, series, hooks: hookIdeas(topic), followUps: followUpIdeas(topic) };
}

// Turn the brainstorm into saved cards: one main piece (with hook bank) + follow-up ideas.
export function dumpBrainstorm(d: AppData, r: BrainstormResult, selectedHooks: string[], selectedFollowUps: string[]): void {
  const now = new Date().toISOString();
  const empty = () => ({ TikTok:{status:"none" as const}, Instagram:{status:"none" as const}, Lemon8:{status:"none" as const}, Xiaohongshu:{status:"none" as const}, "YouTube Shorts":{status:"none" as const} });
  const Cap = r.topic.charAt(0).toUpperCase() + r.topic.slice(1);

  // Main piece — the thing she filmed today, in Edit stage, with chosen hooks.
  const main: Idea = {
    id: uid(), title: `${Cap} video`, series: r.series, isDemo: false,
    rawThought: "Filmed today — brainstormed hooks + follow-ups (rule-based).",
    hooks: selectedHooks, references: [], stage: "Edit",
    platforms: empty(), checklist: [], verdict: "Try",
    notes: "Captured from a daily update. Editing in progress.",
    createdAt: now, updatedAt: now,
  };
  d.ideas.unshift(main);

  // Follow-up ideas → idea dump, parked as "to consider".
  for (const fu of r.followUps.filter((f) => selectedFollowUps.includes(f.title))) {
    d.ideas.unshift({
      id: uid(), title: fu.title, series: r.series, isDemo: false,
      rawThought: fu.note, hooks: [], references: [], stage: "Idea", verdict: "Later",
      notes: `Follow-up idea from your "${Cap}" video. ${fu.note}`,
      platforms: empty(), checklist: [], createdAt: now, updatedAt: now,
    });
  }
}
