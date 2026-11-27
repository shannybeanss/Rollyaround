# Rolly Around Studios

Your private planner & content assistant for **@rollyaround** — travel, food & experience content for TikTok and Instagram.

> **Cost:** The app, this repo, GitHub Pages hosting, and the rule-based assistant are **free**. The optional real-AI brain uses your own OpenAI/Anthropic key (pay-as-you-go, a few $/month). Flip it off and the free rule-based engine still runs everything.

## What's built

All 10 tabs are working, plus Brand Deals (hidden until enabled) and Settings.

- **Rolly's own design** — white + warm neutrals, subtle per-series accents, readable status badges, horizontal tabs, mobile + laptop friendly.
- **Today / Morning Brief** — rule-based brief (one thing first + why, what to clear next, this week's pieces, due/coming up, overdue money, weekly 3-originals progress), Plan/Film/Edit/Post checklists, Waiting-on-you. **Record daily update** (speak / type / paste → rule-based extraction → proposed-changes diff → save with Undo).
- **Ideas** — your real idea bank (~90 cards), searchable by series/destination/status, quick capture with suggested title/series/payoff/angle/next step/verdict, instant Mark edit ready, Log published.
- **Lineup** — rule-based priority proposals (quick win + guide + portfolio + backup), 10–20 min quick action, weekly Plan/Film/Edit/Post timeline colour-coded by series, weekends free, weekday cap of 2, conflict flags, Needs-a-plan.
- **Money** — earned / paid this month / pending / overdue / due-in-30, cash-flow by month, overdue chasers with draft follow-up + mark paid. Demo invoices excluded.
- **Rates** — editable SGD rate card, package total, copy quote, carry lines into a new invoice.
- **Invoices** — create/edit, line items, totals, print/PDF, mark paid/unpaid (syncs with Money), editable business details.
- **Analytics** — log views/likes/saves/shares/watch-time/follows per post & platform (blanks allowed), platform summaries, top posts, rule-based insights with why-it-matters + follow-up.
- **Suggestions** — Make next / Repeat / Improve / Test, each with an action and (for analytics-based ones) the evidence.
- **Templates** — starter templates + save your own, hook structure, cover, CapCut/Canva links.
- **Profile** — display name, intro, links (copy one/all), follower goal progress, featured portfolio.
- **Settings** — storage info, export/import backup, weekly & follower goals, Brand Deals toggle, AI connect, integration stubs, schedule toggles, reset.
- **Data survives refresh** + **Export / Import backup**.

## Verified workflows

`npx vitest run src/verify.test.ts` — 15 checks covering: idea bank loads, daily-update extraction (finished task + blocker + time), Ready-in-one-tap, TikTok-live-while-IG-due, ask-which-platform, tentative plans, cross-post counts once, weekend protection, quote→invoice→paid→Money, demo exclusion, analytics→linked recommendation, brief first-task-with-reason, priority proposals.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages (free, yours forever)

1. Create a repo on **your** GitHub account and push this code to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every push to `main`.
4. Your app lives at `https://<your-username>.github.io/<repo-name>/`.

## Storage & the backend

- **Now:** data is stored in your browser (localStorage) and labelled as such in the header. Use **Export** regularly for backups.
- **Next (backend):** a Supabase (Postgres + email/password login) layer drops in behind the same data store for cross-device sync between your phone and laptop, without changing the UI.

## The AI brain

- The assistant is **rule-based** today (clearly labelled everywhere) and works at $0.
- A **Connect AI** setting will let you paste your own OpenAI/Anthropic key to upgrade extraction, drafting and suggestions. Your key, your spend, your control.

## Notes

- **Demo data is clearly labelled `DEMO`** and excluded from real totals and recommendations. Rates, invoice identity, follower counts and some analytics are DEMO placeholders — edit them in-app.
- All scheduling uses **Singapore time**. Weekends are kept free by default; weekdays cap at two production tasks.

Planner is back on GitHub Pages — last redeploy triggered 28 Nov 2026.
