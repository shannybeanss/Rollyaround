# Rolly Around Studios

Your private planner & content assistant for **@rollyaround** — travel, food & experience content for TikTok and Instagram.

> **Cost:** The app, this repo, GitHub Pages hosting, and the rule-based assistant are **free**. The optional real-AI brain uses your own OpenAI/Anthropic key (pay-as-you-go, a few $/month). Flip it off and the free rule-based engine still runs everything.

## What's built (Phase 1)

- **Rolly's own design** — white + warm neutrals, subtle per-series accents, readable status badges, horizontal tabs, mobile + laptop friendly.
- **Today / Morning Brief** — rule-based brief (one thing first + why, what to clear next, this week's pieces, due/coming up, overdue money), Plan/Film/Edit/Post checklists, Waiting-on-you.
- **Record daily update** — speak (where the browser supports it) / type / paste → rule-based extraction of ideas, hooks, finished tasks, blockers, time → **proposed-changes diff** → save with **Undo**.
- **Ideas** — your real idea bank (~90 cards) across your 3 series + Standalone, searchable by series/destination/status, quick capture with suggested title/series/payoff/angle/next step/verdict, status badges, Mark edit ready (instant green badge), Log published.
- **Data survives refresh** (stored in this browser) + **Export / Import backup** so your data is always portable.

## Coming next (phases 2–5)

Lineup/calendar + post cards · Money · Rates · Invoices · Analytics · Suggestions · Templates · Profile · Brand Deals (hidden until enabled) · AI toggle + integration stubs (Windsor.ai, email, messaging) + scheduled jobs.

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
