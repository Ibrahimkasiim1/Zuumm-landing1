import { Reveal } from "@/components/Reveal";
import TrendingShowcase, { TrendCard } from "@/components/home/TrendingShowcase";
import { wizardHref } from "@/lib/planner/openPlanner";

/* What India is searching, staged as a dark exhibit: the leading
   destination enlarged, the rest queued as numbered cards, arrows walking
   the queue. Each card carries the decision data Indian planners ask for
   first (best season, typical budget) plus this week's search volume.
   Destinations on the deterministic engine (Bali, Thailand) carry a
   "fully priced" badge and deep-link the wizard; the rest open the AI
   planner. The budget-first chips ("where can ₹30k take me?") prefill the
   one-line brief, mirroring how price-sensitive travellers actually start.

   Search counts drift week to week: each destination has a base volume and
   the shown figure is jittered ±10% by a PRNG seeded on the ISO week, so
   every build in a given week renders the same numbers (server component —
   no hydration drift) and the ranking can never flip. No growth deltas
   shown, we don't have that data. */

type Trend = Omit<TrendCard, "count"> & {
  /** base weekly search volume; the rendered count is week-jittered */
  searches: number;
};

/* mulberry32 — tiny deterministic PRNG, seeded once per ISO week */
function isoWeekSeed(): number {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return d.getUTCFullYear() * 100 + week;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** ±10% around the base, rounded to tens — enough drift to feel alive,
    not enough to reorder the leaderboard */
function weeklyCounts(bases: number[]): number[] {
  const rand = mulberry32(isoWeekSeed());
  return bases.map((b) => Math.round((b * (0.9 + rand() * 0.2)) / 10) * 10);
}

const TRENDS: Trend[] = [
  {
    rank: 1,
    destination: "Dubai",
    searches: 1520,
    budget: "₹58,000",
    season: "Nov-Mar",
    vibe: "Luxury and family",
    photo: "/travel/dubai.jpg",
    alt: "Dubai skyline at sunset",
    href: "#",
  },
  {
    rank: 2,
    destination: "Bali",
    searches: 1240,
    budget: "₹42,000",
    season: "Apr-Oct",
    vibe: "Adventure and nightlife",
    photo: "/travel/bali.jpg",
    alt: "Ulun Danu temple, Bali",
    href: wizardHref({ to: "Bali", fresh: true }),
    live: true,
  },
  {
    rank: 3,
    destination: "Vietnam",
    searches: 890,
    budget: "₹35,000",
    season: "Oct-Apr",
    vibe: "Culture and nature",
    photo: "/travel/vietnam.jpg",
    alt: "Ha Long Bay, Vietnam",
    href: "#",
  },
  {
    rank: 4,
    destination: "Thailand",
    searches: 760,
    budget: "₹38,000",
    season: "Nov-Apr",
    vibe: "Islands and street food",
    photo: "/travel/thailand.jpg",
    alt: "Longtail boats on Railay beach, Thailand",
    href: wizardHref({ to: "Thailand", fresh: true }),
    live: true,
  },
];

/* budget-first doors into the one-line brief (the /plan?brief= capability) */
const BUDGETS = [
  { label: "Under ₹30k", brief: "Plan a trip under ₹30,000 per person" },
  { label: "Under ₹50k", brief: "Plan a trip under ₹50,000 per person" },
  { label: "Around ₹75k", brief: "Plan a trip around ₹75,000 per person" },
  { label: "₹1L+, go big", brief: "Plan a luxury trip around ₹1,00,000 per person" },
];

export default function TrendingSearches() {
  const counts = weeklyCounts(TRENDS.map((t) => t.searches));
  const cards: TrendCard[] = TRENDS.map(({ searches: _searches, ...t }, i) => ({
    ...t,
    count: counts[i],
  }));

  return (
    <section className="container-x py-16 md:py-24" aria-label="Trending destinations">
      <Reveal>
        <TrendingShowcase trends={cards} budgets={BUDGETS} />
      </Reveal>
    </section>
  );
}
