// Rule-based extraction from a daily update transcript.
// NOT AI — pattern matching over the text. Produces PROPOSED changes only;
// nothing is saved until Karina approves the diff.

import type { AppData, Idea } from "../types";

export interface ProposedChange {
  id: string;
  kind: "idea" | "hook" | "task-done" | "blocker" | "ready" | "schedule" | "live" | "tentative" | "time";
  label: string;        // human description shown in the diff
  detail?: string;
  ideaId?: string;      // matched existing card
  confidence: "clear" | "ask"; // "ask" = needs a question before applying
  question?: string;
  apply: (d: AppData) => void;
}

function uid() { return Math.random().toString(36).slice(2, 10); }

// Fuzzy-match a phrase to an existing idea card by overlapping significant words.
export function matchIdea(text: string, ideas: Idea[]): Idea[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const stop = new Set(["the", "a", "an", "and", "is", "to", "for", "on", "in", "of", "my", "i", "it", "this", "that", "with", "post", "video", "ready", "done"]);
  const sig = words.filter((w) => w.length > 2 && !stop.has(w));
  const scored = ideas
    .filter((i) => !i.isDemo)
    .map((i) => {
      const t = i.title.toLowerCase();
      const score = sig.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
      return { idea: i, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((s) => s.idea);
}

export function extractChanges(transcript: string, data: AppData): ProposedChange[] {
  const out: ProposedChange[] = [];
  const text = transcript.trim();
  if (!text) return out;
  const lower = text.toLowerCase();

  // Minutes available
  const timeMatch = lower.match(/(\d{1,3})\s*(min|mins|minutes)/);
  if (timeMatch) {
    const mins = Number(timeMatch[1]);
    out.push({
      id: uid(), kind: "time", confidence: "clear",
      label: `Note you have about ${mins} minutes available`,
      apply: () => { /* stored on the daily update record itself */ },
    });
  }

  // Split into clauses for phrase-level signals. Keep "still" with its clause
  // (it's part of "still need…"), only split on "and/but/then".
  const clauses = text.split(/[.;\n]|,\s+(?:and|but|then)\s+/i).map((c) => c.trim()).filter(Boolean);

  for (const clause of clauses) {
    const cl = clause.toLowerCase();
    const matches = matchIdea(clause, data.ideas);
    const top = matches[0];

    // "ready" / "edit done"
    if (/\b(ready|edit (is )?(done|ready|complete|finished)|finished (the )?edit)\b/.test(cl)) {
      if (top) {
        const needPlatformDate = true;
        out.push({
          id: uid(), kind: "ready", confidence: matches.length > 1 ? "ask" : "clear",
          question: matches.length > 1 ? `Which piece — "${matches[0].title}" or "${matches[1].title}"?` : undefined,
          ideaId: top.id,
          label: `Mark "${top.title}" edit ready → green Ready to post badge`,
          detail: needPlatformDate ? "Will keep any confirmed date; otherwise queued for a slot to approve." : undefined,
          apply: (d) => { const i = d.ideas.find((x) => x.id === top.id); if (i) i.stage = "Ready"; },
        });
      } else {
        out.push({ id: uid(), kind: "ready", confidence: "ask", label: `"${clause}" — couldn't match a card`, question: "Which piece is ready?", apply: () => {} });
      }
      continue;
    }

    // "posted on TikTok/IG today"
    const postedMatch = cl.match(/\b(posted|went live|published|uploaded)\b/);
    if (postedMatch) {
      const plat = /tiktok/.test(cl) ? "TikTok" : /insta|\big\b/.test(cl) ? "Instagram" : null;
      if (top && plat) {
        out.push({
          id: uid(), kind: "live", confidence: "clear", ideaId: top.id,
          label: `Mark "${top.title}" LIVE on ${plat} today (weekly count +1, other platform left pending)`,
          apply: (d) => {
            const i = d.ideas.find((x) => x.id === top.id);
            if (i) { i.platforms[plat as "TikTok" | "Instagram"].status = "live"; i.platforms[plat as "TikTok" | "Instagram"].date = new Date().toISOString().slice(0,10); i.stage = "Posted"; }
          },
        });
      } else if (top && !plat) {
        out.push({ id: uid(), kind: "live", confidence: "ask", ideaId: top.id, label: `"${top.title}" is live`, question: "Which platform went live — TikTok or Instagram?", apply: () => {} });
      }
      continue;
    }

    // "schedule X for IG on Thursday at 8pm"
    if (/\bschedule\b/.test(cl)) {
      const plat = /tiktok/.test(cl) ? "TikTok" : /insta|\big\b/.test(cl) ? "Instagram" : null;
      if (top) {
        out.push({
          id: uid(), kind: "schedule", confidence: plat ? "clear" : "ask", ideaId: top.id,
          question: plat ? undefined : "Which platform should I schedule?",
          label: `Schedule "${top.title}"${plat ? ` on ${plat}` : ""} (Singapore time) — confirm the exact slot in Lineup`,
          apply: (d) => { const i = d.ideas.find((x) => x.id === top.id); if (i && plat) { i.platforms[plat as "TikTok"|"Instagram"].status = "scheduled"; i.stage = "Scheduled"; } },
        });
      }
      continue;
    }

    // tentative "maybe / might film/post tomorrow"
    if (/\b(maybe|might|i think i'?ll|possibly)\b/.test(cl) && /\b(film|post|edit|shoot|record)\b/.test(cl)) {
      out.push({
        id: uid(), kind: "tentative", confidence: "clear", ideaId: top?.id,
        label: `Save as a tentative plan${top ? ` for "${top.title}"` : ""} — suggest a slot for you to confirm`,
        apply: () => {},
      });
      continue;
    }

    // A clause can carry BOTH a finished task and a leftover blocker,
    // e.g. "I picked the photos, still need a cover". Detect each independently.
    let matchedSomething = false;

    // finished a task like "I picked the photos"
    if (/\b(picked|chose|selected|finished|done with|wrote|recorded|filmed|shot)\b/.test(cl)) {
      out.push({
        id: uid(), kind: "task-done", confidence: "clear", ideaId: top?.id,
        label: `Mark done: "${clause}"${top ? ` (on "${top.title}")` : ""}`,
        apply: () => {},
      });
      matchedSomething = true;
    }

    // blockers / still need (pull out the specific "still need X" fragment)
    const needMatch = cl.match(/\b(?:still need|need to|still have to|have to still|waiting on)\b/);
    if (needMatch || /\b(blocked|haven'?t)\b/.test(cl)) {
      const frag = clause.slice(clause.toLowerCase().indexOf(needMatch ? needMatch[0] : "")).trim() || clause.trim();
      const label = frag.replace(/^(and |but )?/i, "").trim();
      out.push({
        id: uid(), kind: "blocker", confidence: "clear", ideaId: top?.id,
        label: `Add to Waiting on you: "${label}"`,
        apply: (d) => { d.waiting.push({ id: uid(), label, ideaId: top?.id, done: false }); },
      });
      matchedSomething = true;
    }

    if (matchedSomething) continue;

    // new idea / hook
    if (/\b(idea|i want to|what if|hook)\b/.test(cl) && !top) {
      out.push({
        id: uid(), kind: "idea", confidence: "clear",
        label: `Capture new idea: "${clause}"`,
        apply: (d) => { /* created as Standalone draft; user refines in Ideas */
          d.ideas.push({
            id: uid(), title: clause.slice(0, 80), series: "Standalone", isDemo: false,
            rawThought: clause, hooks: [], references: [], stage: "Idea",
            platforms: { TikTok:{status:"none"}, Instagram:{status:"none"}, Lemon8:{status:"none"}, Xiaohongshu:{status:"none"}, "YouTube Shorts":{status:"none"} },
            checklist: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          });
        },
      });
    }
  }

  return out;
}
