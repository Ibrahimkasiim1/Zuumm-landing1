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
    slug: "singapore",
    name: "Singapore",
    city: "Singapore",
    country: "Singapore",
    cardLabel: "Gardens by the Bay, Singapore",
    blurb:
      "Supertrees glowing at dusk, hawker-court feasts, a skyline pool over the bay — Asia's easiest, cleanest long weekend.",
    iata: "SIN",
    nights: 4,
    live: false,
    heroImage: "/destinations/singapore-hero.jpg",
    cardImage: "/destinations/singapore-card.jpg",
    planHref: plannerHref({ destination: "Singapore" }),
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
    slug: "maldives",
    name: "Maldives",
    city: "Maldives",
    country: "Indian Ocean",
    cardLabel: "Overwater villas, Malé Atoll",
    blurb:
      "A seaplane hop to a villa on stilts — house-reef snorkelling, sandbank picnics, dinner over the lagoon.",
    iata: "MLE",
    nights: 4,
    live: false,
    heroImage: "/destinations/maldives-hero.jpg",
    cardImage: "/destinations/maldives-card.jpg",
    planHref: plannerHref({ destination: "Maldives" }),
  },
  {
    slug: "mauritius",
    name: "Mauritius",
    city: "Mauritius",
    country: "Indian Ocean",
    cardLabel: "Le Morne, Mauritius",
    blurb:
      "Lagoons in seven shades of blue under Le Morne — catamaran days, rum estates, and beaches that stay quiet till noon.",
    iata: "MRU",
    nights: 5,
    live: false,
    heroImage: "/destinations/mauritius-hero.jpg",
    cardImage: "/destinations/mauritius-card.jpg",
    planHref: plannerHref({ destination: "Mauritius" }),
  },
  {
    slug: "sri-lanka",
    name: "Sri Lanka",
    city: "Sri Lanka",
    country: "Sri Lanka",
    cardLabel: "Nine Arches Bridge, Ella",
    blurb:
      "Tea country by blue train, leopards in Yala, surf on the south coast — an island that packs a continent into a week.",
    iata: "CMB",
    nights: 5,
    live: false,
    heroImage: "/destinations/sri-lanka-hero.jpg",
    cardImage: "/destinations/sri-lanka-card.jpg",
    planHref: plannerHref({ destination: "Sri Lanka" }),
  },
];
