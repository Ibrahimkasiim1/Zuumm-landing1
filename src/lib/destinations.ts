/* The hero slider's destination reel.

   This is marketing surface, not engine data — lib/planner/destinations.ts
   stays the source of truth for what the planner can actually price. The
   `live` flag here mirrors that file: live destinations deep-link into the
   wizard with the destination pre-answered; the rest land on the planner's
   front door. Keep the two files in sync when a destination goes live.

   Images live in public/destinations/ as two crops per destination:
   {slug}-hero.jpg (2400×1440, the full-bleed background) and
   {slug}-card.jpg (640×860, the deck card). Unsplash-licensed. */

import { plannerHref, wizardHref } from "@/lib/planner/openPlanner";

export type HeroDestination = {
  slug: string;
  /** engine/display name — keep in sync with lib/planner/destinations.ts */
  name: string;
  /** the giant hero title (a CITY, matching the card that swipes in) */
  city: string;
  /** the ghost watermark at the bottom (the COUNTRY: UAE, Thailand, …) */
  country: string;
  /** landmark label shown above the deck card — names the same city */
  cardLabel: string;
  blurb: string;
  /** mono fact row: IATA · nights (price only when live) */
  iata: string;
  nights: number;
  /** "from" price per person, shown only when `live` */
  fromPrice?: string;
  /** priced end-to-end by the planner engine today */
  live: boolean;
  heroImage: string;
  cardImage: string;
  planHref: string;
};

export const HERO_DESTINATIONS: HeroDestination[] = [
  {
    slug: "bali",
    name: "Bali",
    city: "Bali",
    country: "Indonesia",
    cardLabel: "Ulun Danu, Bali",
    blurb:
      "Temple mornings, rice-terrace afternoons, beach-club sunsets. Two hubs and 51 curated experiences, ready to shape into your week.",
    iata: "DPS",
    nights: 6,
    fromPrice: "₹52,000",
    live: true,
    heroImage: "/destinations/bali-hero.jpg",
    cardImage: "/destinations/bali-card.jpg",
    planHref: wizardHref({ to: "Bali", fresh: true }),
  },
  {
    slug: "thailand",
    name: "Thailand",
    city: "Krabi",
    country: "Thailand",
    cardLabel: "Railay coast, Krabi",
    blurb:
      "Bangkok rooftops to Krabi's limestone coast — 43 cities and 55 experiences, sequenced into one easy route.",
    iata: "BKK",
    nights: 5,
    fromPrice: "₹48,000",
    live: true,
    heroImage: "/destinations/thailand-hero.jpg",
    cardImage: "/destinations/thailand-card.jpg",
    planHref: wizardHref({ to: "Thailand", fresh: true }),
  },
  {
    slug: "dubai",
    name: "Dubai",
    city: "Dubai",
    country: "UAE",
    cardLabel: "Burj Khalifa, Dubai",
    blurb:
      "Desert safaris, Downtown views and the Palm — a long-weekend city that runs like clockwork, visa handled in-house.",
    iata: "DXB",
    nights: 4,
    live: false,
    heroImage: "/destinations/dubai-hero.jpg",
    cardImage: "/destinations/dubai-card.jpg",
    planHref: plannerHref({ destination: "Dubai" }),
  },
  {
    slug: "vietnam",
    name: "Vietnam",
    city: "Ha Long",
    country: "Vietnam",
    cardLabel: "Ha Long Bay, Vietnam",
    blurb:
      "Karst bays at Ha Long, lantern streets in Hoi An, pho at dawn — slow mornings, loud markets, unforgettable food.",
    iata: "HAN",
    nights: 6,
    live: false,
    heroImage: "/destinations/vietnam-hero.jpg",
    cardImage: "/destinations/vietnam-card.jpg",
    planHref: plannerHref({ destination: "Vietnam" }),
  },
  {
    slug: "kerala",
    name: "Kerala",
    city: "Alleppey",
    country: "India",
    cardLabel: "Alleppey backwaters, Kerala",
    blurb:
      "Houseboats drifting the backwaters, spice hills above Munnar, calm the whole way down. India's slowest, greenest weekend.",
    iata: "COK",
    nights: 4,
    live: false,
    heroImage: "/destinations/kerala-hero.jpg",
    cardImage: "/destinations/kerala-card.jpg",
    planHref: plannerHref({ destination: "Kerala" }),
  },
];
