/* The content layer: badges and imagery for experience cards.

   Two sources, merged, in priority order:

   1. An ingested bundle (`contentBundle`) — what the nightly Hotelbeds sync
      plus the one-off LLM pass writes: real photos and an editorial "why"
      line per activity. Populated by /api/planner/content once
      HOTELBEDS_API_KEY is set. Empty until then.
   2. A deterministic fallback derived from the dataset we already have.

   The fallback is deliberately *derived, never invented*: every line it
   produces restates a fact already in the rate card (duration, start time,
   price, the city's theme). An LLM writing "best half-day with kids" before
   anyone has ingested that judgement would be exactly the imagined-content
   problem the engine exists to avoid. When the real ingested line arrives it
   simply wins.

   Badges are computed here rather than at render time so a card's copy can't
   change between two paints of the same plan. */

import type { Attraction } from "./attractions";
import { CITIES } from "./data";
import { vibeScore } from "./engine";

export interface AttractionContent {
  /** one line answering "why this one?" */
  why: string;
  /** who it suits — "with kids", "rainy day", "first-timer" */
  tags: string[];
  /** ingested photo; absent → CityPhoto's gradient/Unsplash path handles it */
  photo?: string;
  /** true when the line came from ingestion rather than derivation */
  curated: boolean;
}

/* -------------------------------------------------- ingested bundle */

type BundleEntry = { why?: string; tags?: string[]; photo?: string };

let bundle: Record<string, BundleEntry> = {};

/** Called by the content route (or a build step) with the synced bundle,
    keyed by engine key "City|Activity name". */
export function loadContentBundle(next: Record<string, BundleEntry>) {
  bundle = next ?? {};
}

export const contentBundleSize = () => Object.keys(bundle).length;

/* -------------------------------------------------- derivation */

const FULL_DAY = 8;
const HALF_DAY = 5;

function deriveWhy(a: Attraction): string {
  const h = a.hours;
  if (a.overnightRequired) {
    return `${a.hopLabel ?? "Far"} from ${a.gateway} — this one holds its own night`;
  }
  if (a.dayTripable) {
    return `Day trip from ${a.gateway}, ${a.hopLabel ?? "a short hop"} each way — same hotel that night`;
  }
  if (h >= FULL_DAY) return `A full day (${a.activity.duration}) — plan nothing else around it`;
  if (h <= 3) return `Short one, ${a.activity.duration} — slots into any day`;
  if (h <= HALF_DAY) return `Half a day, starts ${a.activity.start} — the rest stays yours`;
  return `${a.activity.duration}, starts ${a.activity.start}`;
}

function deriveTags(a: Attraction): string[] {
  const tags: string[] = [];
  const text = `${a.activity.name} ${a.activity.about} ${a.cityTheme}`.toLowerCase();

  if (a.hours <= 4 && !/dive|scuba|trek|climb|raft|zipline|kayak/.test(text)) tags.push("with kids");
  if (/museum|temple|palace|market|cooking|spa|gallery/.test(text)) tags.push("rainy day");
  if (CITIES[a.city]?.pop === "Very Popular" && a.hours <= FULL_DAY) tags.push("first-timer");
  if (/dive|scuba|trek|climb|raft|zipline|kayak|snorkel/.test(text)) tags.push("active");
  if (a.activity.start >= "17:00" || /night|sunset|evening/.test(text)) tags.push("evening");
  return tags.slice(0, 2);
}

export function contentFor(a: Attraction): AttractionContent {
  const hit = bundle[a.key];
  return {
    why: hit?.why ?? deriveWhy(a),
    tags: hit?.tags?.slice(0, 2) ?? deriveTags(a),
    photo: hit?.photo,
    curated: Boolean(hit?.why),
  };
}

/** "Zuumm's pick" — the engine's own vibe score, not an opinion bolted on.
    Only meaningful once the traveller has told us something about the trip,
    so with no vibes set nothing gets a badge (a badge on everything is a
    badge on nothing). */
export function isZuummPick(a: Attraction, vibes: string[]): boolean {
  if (!vibes.length) return false;
  const city = CITIES[a.city];
  if (!city) return false;
  return vibeScore(city, vibes) >= 2;
}
