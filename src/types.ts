// Rolly Around Studios — core data model

// Series is now a free string so each account can define its own.
// The known travel ones keep their short labels/colours; anything else
// falls back to a neutral style. Each account also stores its own seriesList.
export type Series = string;

export const TRAVEL_SERIES: string[] = [
  "I Only Have One Stomach",
  "Your Unpaid Tour Guide",
  "Rolly Around the World",
  "Standalone",
];

export const COOKING_SERIES: string[] = [
  "Recipes",
  "Cook With Me",
  "Honest Kitchen Reviews",
  "Standalone",
];

// Back-compat export (some modules import SERIES_LIST). Prefer account.seriesList.
export const SERIES_LIST: string[] = TRAVEL_SERIES;

const SERIES_STYLE: Record<string, { short: string; cls: string; accent: string }> = {
  "I Only Have One Stomach": { short: "One Stomach", cls: "series-stomach", accent: "var(--series-stomach)" },
  "Your Unpaid Tour Guide": { short: "Tour Guide", cls: "series-guide", accent: "var(--series-guide)" },
  "Rolly Around the World": { short: "Around the World", cls: "series-world", accent: "var(--series-world)" },
  "Standalone": { short: "Standalone", cls: "series-standalone", accent: "var(--series-standalone)" },
  "Recipes": { short: "Recipes", cls: "series-stomach", accent: "var(--series-stomach)" },
  "Cook With Me": { short: "Cook With Me", cls: "series-guide", accent: "var(--series-guide)" },
  "Honest Kitchen Reviews": { short: "Kitchen Reviews", cls: "series-world", accent: "var(--series-world)" },
};

const FALLBACK_STYLE = { short: "", cls: "series-standalone", accent: "var(--series-standalone)" };

// Proxy-like accessor so existing `SERIES_META[series]` calls keep working
// for any string, with a graceful fallback for custom series.
export const SERIES_META: Record<string, { short: string; cls: string; accent: string }> = new Proxy(SERIES_STYLE, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    return { ...FALLBACK_STYLE, short: prop.length > 16 ? prop.slice(0, 15) + "…" : prop };
  },
});

export type Platform = "TikTok" | "Instagram" | "Lemon8" | "Xiaohongshu" | "YouTube Shorts";
export const PLATFORMS: Platform[] = ["TikTok", "Instagram", "Lemon8", "Xiaohongshu", "YouTube Shorts"];

// The verdict you give an idea
export type Verdict = "Try" | "Rework" | "Later" | "Skip";

// Production status of a piece
export type ProductionStage = "Idea" | "Script" | "Edit" | "Ready" | "Scheduled" | "Posted";

// Per-platform publishing status
export type PlatformStatus = "none" | "planned" | "scheduled" | "live";

export interface PlatformState {
  status: PlatformStatus;
  date?: string;       // ISO date (SGT) when scheduled / went live
  time?: string;       // HH:mm (SGT) for scheduled posts
  uploadStatus?: string; // free text e.g. "uploading", "draft saved"
  liveLink?: string;
}

// A reference video attached to an idea
export interface ReferenceVideo {
  id: string;
  link: string;
  learn: string; // what I want to learn from it (opening shot, reveal, etc.)
}

// One beat in a storyboard: a shot + what you say + whether you have the footage
export type FootageStatus = "Have" | "Need" | "Optional";
export interface StoryboardBeat {
  id: string;
  shot: string;        // the visual on screen
  voiceover: string;   // what you say / on-screen text
  footage: FootageStatus;
}

export interface Idea {
  id: string;
  title: string;
  series: Series;
  destination?: string;
  rollyRating?: boolean;      // uses the Rolly Rating review format
  isDemo: boolean;            // clearly-labelled demo data, excluded from totals

  // The thinking
  rawThought?: string;        // my original wording / link / transcript
  payoff?: string;            // viewer payoff
  angle?: string;             // one recommended starting angle
  firstTask?: string;         // one next step
  reason?: string;            // why this angle / task
  hooks: string[];            // saved hook options
  references: ReferenceVideo[];
  notes?: string;

  verdict?: Verdict;
  verifyBeforeLineup?: boolean; // "check your live posts before relineup"

  // Production
  stage: ProductionStage;
  platforms: Record<Platform, PlatformState>;
  checklist: ChecklistItem[]; // plan/film/edit/post tasks specific to this piece
  storyboard?: StoryboardBeat[]; // shot-by-shot plan
  coverText?: string;
  captionIG?: string;
  captionTikTok?: string;
  templateId?: string;

  createdAt: string;
  updatedAt: string;
}

export type TaskKind = "Plan" | "Film" | "Edit" | "Post";

export interface ChecklistItem {
  id: string;
  label: string;
  kind: TaskKind;
  done: boolean;
}

// A scheduled production task on the weekly timeline
export interface ScheduledTask {
  id: string;
  ideaId: string;
  kind: TaskKind;
  date: string;   // ISO date (SGT)
  done: boolean;
}

// Waiting-on-you decisions surfaced on Today
export interface WaitingItem {
  id: string;
  label: string;        // e.g. "Pick the packing cover"
  ideaId?: string;
  done: boolean;
}

// A captured daily update (voice/type/paste)
export interface DailyUpdate {
  id: string;
  createdAt: string;
  transcript: string;
  minutesAvailable?: number;
  applied: boolean;
}

// ---- Money / Rates / Invoices ----
export interface RateLine {
  id: string;
  service: string;      // e.g. "One TikTok video"
  unit?: string;        // e.g. "per 30 days"
  qty: number;
  rate: number;         // SGD
}

export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  issueDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  paid: boolean;
  paidDate?: string;
  isDemo: boolean;
  notes?: string;
}

export interface BusinessProfile {
  creatorName: string;
  businessName: string;
  email: string;
  address: string;
  paymentInstructions: string;
}

// ---- Analytics ----
export interface AnalyticsEntry {
  id: string;
  ideaId?: string;          // link to the actual post
  title: string;
  platform: Platform;
  series?: Series;
  postedDate?: string;
  ageWindow?: string;       // "48h" | "7d" | etc.
  views?: number | null;
  likes?: number | null;
  saves?: number | null;
  shares?: number | null;
  watchTime?: number | null;
  follows?: number | null;  // follows attributed to this post
  isDemo: boolean;
}

export interface PlatformAccount {
  platform: Platform;
  followers: number;
  followerDate?: string;    // when counted
  engagement?: number | null;
  views30d?: number | null;
  isDemo: boolean;
}

// ---- Templates ----
export interface Template {
  id: string;
  name: string;
  series?: Series;
  openingShot?: string;
  hook?: string;
  structure?: string;       // clip / slide order, voiceover structure
  fonts?: string;
  coverText?: string;
  textPlacement?: string;
  ending?: string;
  capcutLink?: string;
  canvaLink?: string;
  isStarter: boolean;
}

// ---- Profile / Portfolio ----
export interface PortfolioPiece {
  id: string;
  kind: "Destination guide" | "Adventure story" | "Food or venue review";
  title: string;
  link?: string;
  audience?: string;
  role?: string;
  creativeDecision?: string;
  results?: string;
  isDemo: boolean;
}

export interface ProfileData {
  displayName: string;
  intro: string;
  contactEmail: string;
  languages?: string;
  tags: string[];
  links: { platform: Platform; handle: string; url: string }[];
}

// ---- Settings ----
export interface Settings {
  weeklyGoal: number;          // original pieces per week (default 3)
  followerGoal: number;        // editable follower goal
  timezone: string;            // "Asia/Singapore"
  brandDealsEnabled: boolean;
  aiConnected: boolean;
  aiProvider?: "openai" | "anthropic";
  storageMode: "browser" | "synced";
  integrations: {
    windsor: boolean;
    email: boolean;
    messaging: boolean;
  };
  schedules: {
    morningBrief: boolean;      // weekdays 8am SGT
    weeklyAnalytics: boolean;   // Monday
    brandInbox: boolean;        // only when brand deals enabled
  };
}

// ---- Brand deals (deferred) ----
export type DealStage =
  | "Inquiry" | "Negotiating" | "Confirmed" | "Filming"
  | "Posted" | "Invoiced" | "Paid" | "Declined" | "Closed";

export interface BrandDeal {
  id: string;
  brand: string;
  contact?: string;
  channel?: string;
  offer?: string;
  deliverables?: string;
  fee?: number;
  deadlines?: string;
  usageRights?: string;
  endDate?: string;
  nextAction?: string;
  notes?: string;
  stage: DealStage;
  waitingOn?: "me" | "brand";
  isDemo: boolean;
}

// Your own stated plan (overrides the suggested "first thing").
export interface TodayPlan {
  date: string;        // ISO date (SGT) the plan was set for
  text: string;        // what you decided to focus on
  ideaId?: string;     // optional link to a piece
}

// ---- One creator account's full state (per account: travel / cooking) ----
export interface AppData {
  version: number;
  seriesList: string[];        // this account's content series
  todayPlan?: TodayPlan;       // your own focus for today (beats the suggestion)
  ideas: Idea[];
  scheduledTasks: ScheduledTask[];
  waiting: WaitingItem[];
  dailyUpdates: DailyUpdate[];
  rates: RateLine[];
  invoices: Invoice[];
  business: BusinessProfile;
  analytics: AnalyticsEntry[];
  accounts: PlatformAccount[]; // social platform follower accounts
  templates: Template[];
  portfolio: PortfolioPiece[];
  profile: ProfileData;
  deals: BrandDeal[];
  settings: Settings;
}

// ---- A creator account (Rolly Around travel, Rolly Belly cooking) ----
export interface CreatorAccount {
  id: string;            // "rollyaround" | "rollybelly"
  name: string;          // display name of the account
  emoji: string;         // tab icon
  data: AppData;         // everything scoped to this account
}

// ---- Top-level persisted state: multiple accounts ----
export interface MultiAccountData {
  schemaVersion: number;
  activeAccountId: string;
  accounts: CreatorAccount[];
}
