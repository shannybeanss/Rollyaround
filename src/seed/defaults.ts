// Default + clearly-labelled DEMO seed data for areas Karina has not supplied yet.
// Everything here with isDemo:true is excluded from real totals & recommendations.

import type {
  AppData, RateLine, Invoice, AnalyticsEntry, PlatformAccount,
  Template, PortfolioPiece, ProfileData, BusinessProfile, Settings,
} from "../types";
import { TRAVEL_SERIES, COOKING_SERIES } from "../types";
import { seedIdeas } from "./ideas";

const id = () => Math.random().toString(36).slice(2, 10);
const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

// ---- Rates (DEMO placeholders in SGD, editable) ----
const rates: RateLine[] = [
  { id: id(), service: "One TikTok video", qty: 1, rate: 800 },
  { id: id(), service: "Instagram cross-posting", qty: 1, rate: 300 },
  { id: id(), service: "Usage rights", unit: "per 30 days", qty: 1, rate: 400 },
  { id: id(), service: "Whitelisting", unit: "per 30 days", qty: 1, rate: 500 },
];

// ---- Invoices (one clearly-labelled DEMO sample) ----
const invoices: Invoice[] = [
  {
    id: id(), number: "DEMO-0001", client: "Sample Brand Pte Ltd (DEMO)",
    issueDate: addDays(-40), dueDate: addDays(-10),
    lines: [
      { id: id(), description: "One TikTok video", qty: 1, rate: 800 },
      { id: id(), description: "IG cross-post", qty: 1, rate: 300 },
    ],
    paid: false, isDemo: true,
    notes: "Sample invoice — clearly marked DEMO, excluded from real Money totals.",
  },
];

// ---- Accounts (DEMO follower numbers, editable) ----
const accounts: PlatformAccount[] = [
  { platform: "TikTok", followers: 250, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
  { platform: "Instagram", followers: 7, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
  { platform: "Lemon8", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
  { platform: "Xiaohongshu", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
  { platform: "YouTube Shorts", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
];

// ---- Analytics (real TikTok entries, logged 28 Nov 2026 from TikTok screenshots; likes/saves/shares/follows unknown) ----
// No automatic TikTok sync in this planner — these are manually logged, not a live link.
const analytics: AnalyticsEntry[] = [
  { id: id(), title: "DIHUA STREET Taiwan", platform: "TikTok", series: "Your Unpaid Tour Guide", ageWindow: "7d", views: 10400, likes: null, saves: null, shares: null, follows: null, isDemo: false },
  { id: id(), title: "Unboxing with me", platform: "TikTok", series: "Standalone", ageWindow: "7d", views: 18800, likes: null, saves: null, shares: null, follows: null, isDemo: false },
  { id: id(), title: "Where to find a digi camera under $150", platform: "TikTok", series: "Your Unpaid Tour Guide", ageWindow: "7d", views: 3809, likes: null, saves: null, shares: null, follows: null, isDemo: false },
  { id: id(), title: "Price of an Osmo Pocket", platform: "TikTok", series: "Standalone", ageWindow: "7d", views: 3751, likes: null, saves: null, shares: null, follows: null, isDemo: false },
  { id: id(), title: "Your next trip to MELBOURNE — 15 places", platform: "TikTok", series: "Your Unpaid Tour Guide", ageWindow: "7d", views: 3376, likes: null, saves: null, shares: null, follows: null, isDemo: false },
  { id: id(), title: "Where to find WILD KOALAS in Australia", platform: "TikTok", series: "Your Unpaid Tour Guide", ageWindow: "7d", views: 2121, likes: null, saves: null, shares: null, follows: null, isDemo: false },
];

// ---- Templates (starter set, not demo — these are real reusable formats) ----
const templates: Template[] = [
  { id: id(), name: "One Stomach Review", series: "I Only Have One Stomach", isStarter: true,
    openingShot: "Interesting food visual / the dish arriving", hook: "Conversational curiosity hook", structure: "Visual open → context → taste → honest verdict", ending: "Rolly Rating verdict card" },
  { id: id(), name: "Café & matcha Rolly Rating receipt", series: "I Only Have One Stomach", isStarter: true,
    hook: "Is this worth it?", structure: "Order → first sip → rating receipt overlay", ending: "Receipt-style rating" },
  { id: id(), name: "Unpaid Tour Guide Reel", series: "Your Unpaid Tour Guide", isStarter: true,
    hook: "Planning X? Save this.", structure: "Hook → 1.5s series intro → hack/tip → Save-this CTA", ending: "Save-this CTA" },
  { id: id(), name: "Unpaid Tour Guide carousel", series: "Your Unpaid Tour Guide", isStarter: true,
    structure: "Slide-by-slide: cover → stops → costs → tips → save", coverText: "City in X days" },
  { id: id(), name: "Around the World Story", series: "Rolly Around the World", isStarter: true,
    hook: "Personal, visual open", structure: "Story beats with voiceover, discovery moment", ending: "Reflection" },
  { id: id(), name: "30-minute quick edit", isStarter: true,
    structure: "Trim best 5 clips → one caption → one cover → post" },
];

// ---- Portfolio (DEMO featured pieces) ----
const portfolio: PortfolioPiece[] = [
  { id: id(), kind: "Destination guide", title: "Sample: 3-day Bangkok itinerary (DEMO)", isDemo: true },
  { id: id(), kind: "Adventure story", title: "Sample: Skydiving in Torquay (DEMO)", isDemo: true },
  { id: id(), kind: "Food or venue review", title: "Sample: Cheapest omakase in SG (DEMO)", isDemo: true },
];

// ---- Profile (DEMO defaults, editable) ----
const profile: ProfileData = {
  displayName: "Rolly Around",
  intro: "Hi, I'm Rolly — a travel, food and experience creator. I'm the adventurous friend who shows you something worth doing and tells you what it was actually like. Edit this intro anytime.",
  contactEmail: "collabs@example.com",
  languages: "English and Mandarin",
  tags: ["Travel", "Food", "Experiences", "Café", "Itineraries"],
  links: [
    { platform: "TikTok", handle: "@rollyaround", url: "https://www.tiktok.com/@rollyaround" },
    { platform: "Instagram", handle: "@rollyaround", url: "https://www.instagram.com/rollyaround" },
    { platform: "Lemon8", handle: "@rollyaround", url: "" },
    { platform: "Xiaohongshu", handle: "rollyaround", url: "" },
    { platform: "YouTube Shorts", handle: "@rollyaround", url: "" },
  ],
};

const business: BusinessProfile = {
  creatorName: "Rolly Around",
  businessName: "Rolly Around Studios (DEMO — edit me)",
  email: "collabs@example.com",
  address: "Singapore (DEMO — edit me)",
  paymentInstructions: "PayNow / bank details here (DEMO — edit me)",
};

const settings: Settings = {
  weeklyGoal: 3,
  followerGoal: 1000,
  timezone: "Asia/Singapore",
  brandDealsEnabled: false,
  aiConnected: false,
  storageMode: "browser",
  integrations: { windsor: false, email: false, messaging: false },
  schedules: { morningBrief: false, weeklyAnalytics: false, brandInbox: false },
};

// ---- Rolly Around (travel) account data ----
export function seedAppData(): AppData {
  const ideas = seedIdeas();
  const findIdea = (title: string) => {
    const idea = ideas.find((i) => i.title === title);
    if (!idea) throw new Error(`seedAppData: missing idea "${title}"`);
    return idea;
  };
  const recap = findIdea("11 destinations in one travel recap");
  const matcha = findIdea("Tsujiri Premium matcha");
  const hairwash = findIdea("$8 Vietnam hair wash");
  // The recap is already stage Ready (set in ideas.ts); bring the next two
  // into Edit so the weekly timeline makes sense.
  matcha.stage = "Edit";
  hairwash.stage = "Edit";
  return {
    version: 1,
    seriesList: [...TRAVEL_SERIES],
    todayPlan: { date: "2026-11-28", text: "Post 11-destinations recap tonight 28 Nov" },
    pinnedPriorities: [recap.id, matcha.id, hairwash.id],
    ideas,
    scheduledTasks: [
      // Posted Sat 28 Nov, a day early; originally scheduled Sun 29 Nov.
      { id: id(), ideaId: recap.id, kind: "Post", date: "2026-11-28", done: true },
      { id: id(), ideaId: matcha.id, kind: "Edit", date: "2026-11-30", done: false },
      { id: id(), ideaId: matcha.id, kind: "Post", date: "2026-12-01", done: false },
      { id: id(), ideaId: hairwash.id, kind: "Edit", date: "2026-12-02", done: false },
      { id: id(), ideaId: hairwash.id, kind: "Post", date: "2026-12-03", done: false },
    ],
    waiting: [],
    dailyUpdates: [],
    rates: rates.map((r) => ({ ...r, id: id() })),
    invoices,
    business,
    analytics,
    accounts,
    templates,
    portfolio,
    profile,
    deals: [],
    settings,
  };
}

// ---- Rolly Belly (cooking) account data — starts empty, own series ----
export function seedCookingData(): AppData {
  const cookingTemplates: Template[] = [
    { id: id(), name: "Recipe (make-this)", series: "Recipes", isStarter: true,
      openingShot: "The finished dish, close-up", hook: "“Save this — it's easier than it looks.”", structure: "Finished dish → ingredients → key steps → first bite", ending: "Taste reaction + save CTA" },
    { id: id(), name: "Cook With Me vlog", series: "Cook With Me", isStarter: true,
      hook: "Casual “come cook with me” open", structure: "Prep → cook → plate, calm voiceover", ending: "Sit down and eat" },
    { id: id(), name: "Honest Kitchen Review", series: "Honest Kitchen Reviews", isStarter: true,
      hook: "“Is this gadget/ingredient worth it?”", structure: "Unbox/try → test → honest verdict", ending: "Rating" },
    { id: id(), name: "30-minute quick edit", isStarter: true,
      structure: "Trim best 5 clips → one caption → one cover → post" },
  ];
  return {
    version: 1,
    seriesList: [...COOKING_SERIES],
    ideas: [],
    scheduledTasks: [],
    waiting: [],
    dailyUpdates: [],
    rates: rates.map((r) => ({ ...r, id: id() })),
    invoices: [],
    business: {
      creatorName: "Rolly Belly",
      businessName: "Rolly Belly (edit me)",
      email: "collabs@example.com",
      address: "Singapore (edit me)",
      paymentInstructions: "PayNow / bank details here (edit me)",
    },
    analytics: [],
    accounts: [
      { platform: "TikTok", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
      { platform: "Instagram", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
      { platform: "Lemon8", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
      { platform: "Xiaohongshu", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
      { platform: "YouTube Shorts", followers: 0, followerDate: addDays(0), engagement: null, views30d: null, isDemo: false },
    ],
    templates: cookingTemplates,
    portfolio: [],
    profile: {
      displayName: "Rolly Belly",
      intro: "Hi, I'm Rolly Belly — my cooking corner. Recipes, cook-with-me vlogs and honest kitchen reviews. Edit this intro anytime.",
      contactEmail: "collabs@example.com",
      languages: "English and Mandarin",
      tags: ["Cooking", "Recipes", "Food", "Kitchen"],
      links: [
        { platform: "TikTok", handle: "@rollybelly", url: "https://www.tiktok.com/@rollybelly" },
        { platform: "Instagram", handle: "@rollybelly", url: "https://www.instagram.com/rollybelly" },
        { platform: "Lemon8", handle: "@rollybelly", url: "" },
        { platform: "Xiaohongshu", handle: "rollybelly", url: "" },
        { platform: "YouTube Shorts", handle: "@rollybelly", url: "" },
      ],
    },
    deals: [],
    settings: { ...settings },
  };
}

// ---- Top-level multi-account seed ----
export function seedMultiAccount(): import("../types").MultiAccountData {
  return {
    schemaVersion: 2,
    activeAccountId: "rollyaround",
    accounts: [
      { id: "rollyaround", name: "Rolly Around", emoji: "🌍", data: seedAppData() },
      { id: "rollybelly", name: "Rolly Belly", emoji: "🍳", data: seedCookingData() },
    ],
  };
}
