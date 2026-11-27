// Default + clearly-labelled DEMO seed data for areas Karina has not supplied yet.
// Everything here with isDemo:true is excluded from real totals & recommendations.

import type {
  AppData, RateLine, Invoice, AnalyticsEntry, PlatformAccount,
  Template, PortfolioPiece, ProfileData, BusinessProfile, Settings,
} from "../types";
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
  { platform: "TikTok", followers: 12000, followerDate: addDays(0), engagement: 4.1, views30d: 286000, isDemo: true },
  { platform: "Instagram", followers: 8900, followerDate: addDays(0), engagement: 3.2, views30d: 154000, isDemo: true },
  { platform: "Lemon8", followers: 1500, followerDate: addDays(0), engagement: null, views30d: null, isDemo: true },
  { platform: "Xiaohongshu", followers: 900, followerDate: addDays(0), engagement: null, views30d: null, isDemo: true },
  { platform: "YouTube Shorts", followers: 1200, followerDate: addDays(0), engagement: 2.4, views30d: 18000, isDemo: true },
];

// ---- Analytics (DEMO sample entries) ----
const analytics: AnalyticsEntry[] = [
  { id: id(), title: "Cheapest omakase in Singapore (DEMO)", platform: "TikTok", series: "I Only Have One Stomach", postedDate: addDays(-21), ageWindow: "7d", views: 180000, likes: 9200, saves: 2100, shares: 410, follows: 320, isDemo: true },
  { id: id(), title: "3 day Bangkok itinerary (DEMO)", platform: "TikTok", series: "Your Unpaid Tour Guide", postedDate: addDays(-29), ageWindow: "7d", views: 95000, likes: 5100, saves: 1200, shares: 180, follows: 210, isDemo: true },
];

// ---- Templates (starter set, not demo — these are real reusable formats) ----
const templates: Template[] = [
  { id: id(), name: "One Stomach Review", series: "I Only Have One Stomach", isStarter: true,
    openingShot: "Interesting food visual / the dish arriving", hook: "Conversational curiosity hook", structure: "Visual open → context → taste → honest verdict", ending: "Rolly Rating verdict card" },
  { id: id(), name: "Café & matcha Rolly Rating receipt", series: "I Only Have One Stomach", isStarter: true,
    hook: "Is this worth it?", structure: "Order → first sip → rating receipt overlay", ending: "Receipt-style rating" },
  { id: id(), name: "Unpaid Tour Guide Reel", series: "Your Unpaid Tour Guide", isStarter: true,
    hook: "Planning X? Save this.", structure: "Day-by-day beats, cost + transport callouts", ending: "Save-this CTA" },
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
  followerGoal: 50000,
  timezone: "Asia/Singapore",
  brandDealsEnabled: false,
  aiConnected: false,
  storageMode: "browser",
  integrations: { windsor: false, email: false, messaging: false },
  schedules: { morningBrief: false, weeklyAnalytics: false, brandInbox: false },
};

export function seedAppData(): AppData {
  return {
    version: 1,
    ideas: seedIdeas(),
    scheduledTasks: [],
    waiting: [],
    dailyUpdates: [],
    rates,
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
