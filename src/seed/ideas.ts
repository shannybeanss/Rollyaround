// Rolly Around Studios — real idea bank seed.
// Source: Karina's pasted "Rolly Around — Full Idea Bank" (NOT demo data).
// Statuses start fresh because live statuses in the old browser could not be read.

import type { Idea, Series, Platform, PlatformState } from "../types";

function pid() {
  return Math.random().toString(36).slice(2, 10);
}

const emptyPlatforms = (): Record<Platform, PlatformState> => ({
  TikTok: { status: "none" },
  Instagram: { status: "none" },
  Lemon8: { status: "none" },
  Xiaohongshu: { status: "none" },
  "YouTube Shorts": { status: "none" },
});

interface SeedSpec {
  title: string;
  series: Series;
  destination?: string;
  rollyRating?: boolean;
  verifyBeforeLineup?: boolean;
  verdict?: Idea["verdict"];
  notes?: string;
}

const now = new Date().toISOString();

function make(spec: SeedSpec): Idea {
  return {
    id: pid(),
    title: spec.title,
    series: spec.series,
    destination: spec.destination,
    rollyRating: spec.rollyRating,
    isDemo: false,
    hooks: [],
    references: [],
    notes: spec.notes,
    verdict: spec.verdict,
    verifyBeforeLineup: spec.verifyBeforeLineup,
    stage: "Idea",
    platforms: emptyPlatforms(),
    checklist: [],
    createdAt: now,
    updatedAt: now,
  };
}

const S: Series = "I Only Have One Stomach";
const G: Series = "Your Unpaid Tour Guide";
const W: Series = "Rolly Around the World";
const A: Series = "Standalone";

const specs: SeedSpec[] = [
  // ---------- I Only Have One Stomach ----------
  { title: "Huge salmon bibimbap café review (truffle cream pasta + strawberry matcha)", series: S, destination: "JB", rollyRating: true },
  { title: "Niko Niko Onigiri verdict", series: S, destination: "JB", rollyRating: true },
  { title: "Starter Café and Chill Chow food stops", series: S, destination: "JB" },
  { title: "Tsujiri Premium matcha", series: S, destination: "Singapore", rollyRating: true },
  { title: "Gotcha Matcha", series: S, destination: "Singapore", rollyRating: true },
  { title: "Rise Bakehouse", series: S, destination: "Singapore", rollyRating: true },
  { title: "Fortuna Pizza", series: S, destination: "Singapore", rollyRating: true },
  { title: "Coffee Break at Amoy", series: S, destination: "Singapore", rollyRating: true },
  { title: "HK food & café roundup (Yat Lok, Detour, Bakehouse, PMQ, Jenny Bakery, dim sum)", series: S, destination: "Hong Kong" },
  { title: "Hong Kong matcha verdict", series: S, destination: "Hong Kong", rollyRating: true },
  { title: "Seoul cafés and bakeries", series: S, destination: "Seoul" },
  { title: "Miffy café", series: S, destination: "Seoul", rollyRating: true },
  { title: "Seoul roundup (Dalimmok, Beton, Salmon Noodle, Jovular)", series: S, destination: "Seoul" },
  { title: "Busan bakery trail (Mumu, Shio Pan, Brook, Yellow Summer Cake)", series: S, destination: "Busan" },
  { title: "Busan seafood and markets", series: S, destination: "Busan" },
  { title: "Freewill Pizza and the wait", series: S, destination: "Busan", rollyRating: true },
  { title: "HCMC café trail", series: S, destination: "Ho Chi Minh City" },
  { title: "Morisan Café", series: S, destination: "Ho Chi Minh City", rollyRating: true },
  { title: "Taka Japanese Café", series: S, destination: "Ho Chi Minh City", rollyRating: true },
  { title: "Phin Phin smoothie bowl", series: S, destination: "Ho Chi Minh City", rollyRating: true },
  { title: "4P and Thiemmem", series: S, destination: "Ho Chi Minh City" },
  { title: "Tori Matcha", series: S, destination: "Melbourne / Victoria", rollyRating: true },
  { title: "Messina gelato", series: S, destination: "Melbourne / Victoria", rollyRating: true },
  { title: "Fishbowl salad", series: S, destination: "Melbourne / Victoria", rollyRating: true },
  { title: "Hot chocolate near the Great Ocean Road", series: S, destination: "Melbourne / Victoria" },
  { title: "Athens cafés & food (10AM Apotheke, Ta Kapamanaiaika, Seychelles)", series: S, destination: "Greece" },
  { title: "Greek supermarket juice find", series: S, destination: "Greece" },
  { title: "Tokyo food finds and Negishi", series: S, destination: "Japan" },

  // ---------- Your Unpaid Tour Guide ----------
  { title: "Seven-outfit packing carousel", series: G, destination: "Packing" },
  { title: "Packing cubes vs compression bags", series: G, destination: "Packing" },
  { title: "Flight essentials (eye masks, cardigan, neck pillow)", series: G, destination: "Packing" },
  { title: "Travel cable pouch", series: G, destination: "Packing" },
  { title: "Hanging organiser and toiletries", series: G, destination: "Packing" },
  { title: "Foldable bag setup", series: G, destination: "Packing" },
  { title: "What stays accessible on the plane", series: G, destination: "Packing" },
  { title: "Singapore date ideas (pottery, terrarium, night picnic, flower shopping, Koma)", series: G, destination: "Singapore" },
  { title: "Batam weekend guide", series: G, destination: "Batam" },
  { title: "Hong Kong to Shenzhen by train", series: G, destination: "Hong Kong / Shenzhen" },
  { title: "Busan Pass activities", series: G, destination: "Busan", notes: "Check pass inclusions (Lotte World, Club D Oasis) before scripting." },
  { title: "One day in Busan (hanbok, luge, capsule train, beach)", series: G, destination: "Busan" },
  { title: "Great Ocean Road stops", series: G, destination: "Melbourne / Victoria" },
  { title: "EatClub how-to", series: G, destination: "Melbourne / Victoria" },
  { title: "Melbourne free tram guide", series: G, destination: "Melbourne / Victoria" },
  { title: "Queen Victoria Market stops", series: G, destination: "Melbourne / Victoria" },
  { title: "State Library photo spots", series: G, destination: "Melbourne / Victoria" },
  { title: "Melbourne day dates (LEGO, strawberry picking, Red Hill)", series: G, destination: "Melbourne / Victoria" },
  { title: "Santorini beyond Oia", series: G, destination: "Greece" },
  { title: "Renting a car in Greece", series: G, destination: "Greece" },
  { title: "Athens road trip to Corinth and Mykines", series: G, destination: "Greece" },
  { title: "Temple of Poseidon sunset drive", series: G, destination: "Greece" },
  { title: "Lycabettus Hill viewpoint", series: G, destination: "Greece" },
  { title: "A quieter side of Santorini in Megalochori", series: G, destination: "Greece" },
  { title: "Santorini winter tips", series: G, destination: "Greece" },
  { title: "Where I stayed in Santorini, Le Blanc", series: G, destination: "Greece" },
  { title: "Kamakura day trip", series: G, destination: "Japan" },
  { title: "Lake Kawaguchi day trip", series: G, destination: "Japan" },
  { title: "Phu Quoc travel ideas", series: G, destination: "Vietnam" },
  { title: "Travel Costs Unpacked", series: G, destination: "Travel costs" },

  // ---------- Rolly Around the World ----------
  { title: "JB day out with the IKEA mushroom-hat reveal", series: W, destination: "JB" },
  { title: "Backus Ceramics", series: W, destination: "Bali / Batam", rollyRating: true },
  { title: "Seminyak café outing", series: W, destination: "Bali / Batam" },
  { title: "Bali pottery-café experience", series: W, destination: "Bali / Batam" },
  { title: "Batam jet ski experience", series: W, destination: "Bali / Batam" },
  { title: "Soft little Seoul memories", series: W, destination: "Seoul" },
  { title: "You & me, Busan (beach, city nights, clubbing)", series: W, destination: "Busan" },
  { title: "You & me, Ho Chi Minh City", series: W, destination: "Ho Chi Minh City" },
  { title: "Hamie Hair spa experience", series: W, destination: "Ho Chi Minh City", rollyRating: true },
  { title: "What skydiving in Torquay felt like", series: W, destination: "Melbourne / Victoria", rollyRating: true },
  { title: "How many dogs did I see at Red Hill market?", series: W, destination: "Melbourne / Victoria" },
  { title: "Red Hill lavender and strawberry picking", series: W, destination: "Melbourne / Victoria" },
  { title: "Fish and chips at sunset", series: W, destination: "Melbourne / Victoria" },
  { title: "Greece through my camera roll", series: W, destination: "Greece" },
  { title: "The deer that never showed", series: W, destination: "Greece" },
  { title: "Paid for the view and got fog", series: W, destination: "Greece" },
  { title: "Cave of the Seal discovery", series: W, destination: "Greece" },
  { title: "Santorini cats", series: W, destination: "Greece" },
  { title: "Cooking in our Santorini Airbnb", series: W, destination: "Greece" },
  { title: "Taking my parents to Santorini", series: W, destination: "Greece" },
  { title: "Running around Greece like we're in a film", series: W, destination: "Greece" },
  { title: "Japan photo diary", series: W, destination: "Japan" },
  { title: "2026 travel recap", series: W, destination: "Travel recap" },
  { title: "11 destinations in one travel recap", series: W, destination: "Travel recap" },

  // ---------- Standalone ----------
  { title: "Dog studio photoshoot with the final photos reveal", series: A, rollyRating: true },
  { title: "Girlhood night picnic", series: A },
  { title: "City nights photo diary", series: A },
  { title: "Outfit lift checks", series: A },

  // ---------- Future content (parked as Later) ----------
  { title: "Wedding planning series", series: A, verdict: "Later", notes: "Future content." },
  { title: "BTO renovation series", series: A, verdict: "Later", notes: "Future content." },
  { title: "Home café ideas", series: A, verdict: "Later", notes: "Future content." },
  { title: "Rolly 3D2N trips (food hunts, cooking, adventure, games)", series: W, verdict: "Later", notes: "Future Rolly project." },
  { title: "Travel map and custom itineraries", series: G, verdict: "Later", notes: "Future Rolly project." },
  { title: "Corporate retreat ideas", series: W, verdict: "Later", notes: "Future Rolly project." },

  // ---------- Verify before lineup (check live posts first) ----------
  { title: "Standard Bread in Seoul", series: S, destination: "Seoul", verifyBeforeLineup: true, notes: "Check if already posted before relineup." },
  { title: "Tokyo chopstick workshop", series: W, destination: "Japan", verifyBeforeLineup: true, notes: "Check if already posted." },
  { title: "Toa Payoh matcha", series: S, destination: "Singapore", rollyRating: true, verifyBeforeLineup: true, notes: "Check if already posted." },
  { title: "Rooftop bar", series: W, destination: "Singapore", verifyBeforeLineup: true, notes: "Check if already posted." },
  { title: "Flower Dome", series: W, destination: "Singapore", verifyBeforeLineup: true, notes: "Check if already posted." },
  { title: "The honeycomb drink", series: S, destination: "Singapore", verifyBeforeLineup: true, notes: "Check if already posted." },
  { title: "Korean pasta", series: S, destination: "Seoul", verifyBeforeLineup: true, notes: "Check if already posted." },
  { title: "Wild koalas at Kennett River", series: W, destination: "Melbourne / Victoria", verifyBeforeLineup: true, notes: "Check if already posted." },
  { title: "Greece souvenir angle", series: W, destination: "Greece", verifyBeforeLineup: true, notes: "Check if already posted." },
];

export function seedIdeas(): Idea[] {
  return specs.map(make);
}

export const SEED_IDEA_COUNT = specs.length;
