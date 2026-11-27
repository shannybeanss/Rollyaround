// Starter storyboards per series — following Rolly's style:
// open on an interesting visual, conversational curiosity hook, voiceover,
// honest verdict. These are editable starting points, not fixed scripts.

import type { Series, StoryboardBeat } from "../types";

const uid = () => Math.random().toString(36).slice(2, 10);
const beat = (shot: string, voiceover: string, footage: StoryboardBeat["footage"] = "Need"): StoryboardBeat =>
  ({ id: uid(), shot, voiceover, footage });

export function starterStoryboard(series: Series): StoryboardBeat[] {
  switch (series) {
    case "I Only Have One Stomach":
      return [
        beat("Close-up of the dish/drink arriving — steam, pour, or first cut", "Curiosity hook: “Is this actually worth it?” / “Everyone's talking about this — let's see.”", "Have"),
        beat("Wide shot of the place / your reaction as you sit down", "Where you are and why you came — one honest line.", "Need"),
        beat("First bite / first sip, real reaction", "Say what it actually tastes like — texture, flavour, surprise.", "Need"),
        beat("Price tag / menu / receipt on screen", "The cost, plainly. (Confirm the real price before posting.)", "Optional"),
        beat("Final shot of you + the verdict card", "Your Rolly Rating verdict — would you go back?", "Need"),
      ];
    case "Your Unpaid Tour Guide":
      return [
        beat("Striking establishing shot of the destination", "Hook: “Planning [place]? Save this.” Name the payoff in 2 seconds.", "Have"),
        beat("Stop 1 — the thing itself", "What it is, why it's worth it, one tip.", "Need"),
        beat("Transport / cost overlay", "How to get there + what it costs. (Confirm real details.)", "Optional"),
        beat("Stop 2 and 3, quick cuts", "Keep each beat to one useful line.", "Need"),
        beat("You to camera / map end card", "Recap + “Save this for your trip.”", "Need"),
      ];
    case "Rolly Around the World":
      return [
        beat("Your most beautiful / surprising visual of the trip", "Open on the feeling, not an explanation. Let the shot breathe.", "Have"),
        beat("You in the moment — candid", "Voiceover: what was actually happening, how it felt.", "Need"),
        beat("The discovery / turning point", "The little story — the deer, the fog, the cat, the view.", "Need"),
        beat("Quiet reflective shot", "One honest personal line to land it.", "Optional"),
        beat("Ending frame", "A thought that makes someone want to go too.", "Need"),
      ];
    default:
      return [
        beat("Open on your most interesting visual", "Conversational curiosity hook in the first 2 seconds.", "Have"),
        beat("Context shot", "One line: what this is.", "Need"),
        beat("The main moment", "Voiceover — what it was actually like.", "Need"),
        beat("Ending frame", "A line that lands it.", "Need"),
      ];
  }
}
