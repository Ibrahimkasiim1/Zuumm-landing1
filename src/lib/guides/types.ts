/* Destination guides — the typed shape every guide is authored against.

   One JSON file per destination in lib/guides/data/, validated by
   scripts/validate-guides.mjs. The registry in lib/guides/index.ts loads
   them all; pages, the nav dropdown and the trip wizard read only through
   the registry, never the files.

   Images are referenced by convention, never by URL: every item's photo
   lives at /guides/<guide-slug>/<item-id>.jpg (the hero at /hero.jpg),
   sourced and downloaded by scripts/source-guide-images.mjs from each
   item's `image` sourcing hints. */

export type RegionKey =
  | "oceania"
  | "southeast-asia"
  | "east-asia"
  | "south-asia"
  | "middle-east"
  | "africa"
  | "europe"
  | "americas";

/** sourcing hints for one photo slot; the file itself lands on disk */
export type ImageSpec = {
  /** search phrase used to source the photo, e.g. "uluwatu temple sunset" */
  query: string;
  /** what the chosen photo should show — becomes the alt text */
  alt: string;
  /** optional pre-verified direct URLs (Unsplash CDN), best first */
  candidates?: string[];
};

export type Season = {
  label: string;
  months: string;
  temp: string;
  notes: string;
  /** high = peak/best · shoulder = tradeoff · low = off-season */
  tone: "high" | "shoulder" | "low";
};

export type GuideCity = {
  id: string;
  name: string;
  blurb: string;
  image: ImageSpec;
};

export type GuideHighlight = {
  id: string;
  rank: number; // 1..10
  name: string;
  category: string;
  blurb: string;
  /** longer copy for the highlight's own detail page */
  detail: string;
  image: ImageSpec;
};

export type GuideActivity = {
  id: string;
  name: string;
  category: string;
  blurb: string;
  image: ImageSpec;
};

export type GuideTrip = {
  id: string;
  title: string;
  nights: number;
  route: { place: string; nights: number }[];
  summary: string;
  /** all-in per-person figure when we can stand behind one */
  priceFrom?: string;
  image: ImageSpec;
};

export type DestinationGuide = {
  slug: string;
  /** short name: "Bali" */
  name: string;
  /** long name for the hero: "Bali, Indonesia" */
  displayName: string;
  country: string;
  region: RegionKey;
  flag: string;
  tagline: string;
  /** 130–170 words of original prose */
  overview: string;
  heroAlt: string;
  heroImage: ImageSpec;

  quickFacts: {
    capital: string;
    currency: { code: string; name: string; inr: string };
    languages: string[];
    timezone: string;
    flightFromIndia: string;
    plug: string;
    sim: string;
  };

  visa: {
    type: "visa-free" | "voa" | "evisa" | "sticker";
    headline: string;
    body: string;
    cost?: string;
    processing?: string;
  };

  weather: {
    summary: string;
    bestTime: string;
    seasons: Season[]; // exactly 3
  };

  /** booking-calendar view: when prices peak and dip */
  booking: { high: string; low: string; note: string };

  idealDuration: { nights: string; note: string };

  budget: {
    perDay: { tier: string; inr: string }[]; // 3 tiers
    note: string;
  };

  safety: { score: 1 | 2 | 3 | 4 | 5; headline: string; tips: string[] };

  goodToKnow: string[]; // 6–8 practical one-liners

  cities: GuideCity[]; // 5–6
  highlights: GuideHighlight[]; // exactly 10
  activities: GuideActivity[]; // 6
  trips: GuideTrip[]; // 3
  faqs: { q: string; a: string }[]; // 4–6
};

/** region hub pages (Europe, Africa, South America) */
export type RegionHub = {
  slug: string;
  name: string;
  tagline: string;
  overview: string;
  heroImage: ImageSpec;
  /** guide slugs that belong to this hub */
  members: string[];
  /** places without a full guide yet — routed to the AI planner */
  teasers?: { name: string; blurb: string; image: ImageSpec }[];
};
