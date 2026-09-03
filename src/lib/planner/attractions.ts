/* Attraction catalog layer on top of the Thailand dataset.
   Gives every activity a stable id (used by the wizard UI, the copilot's
   scroll/edit actions and analytics), parsed duration hours, and the
   feasibility metadata the scheduler needs. Pure + synchronous. */

import {
  CITIES,
  DEFAULT_COUNTRY,
  GATEWAY_ORDER,
  SATELLITES_BY_GATEWAY,
  type City,
  type CityActivity,
} from "./data";
import { vibeScore, type Season } from "./engine";

export interface Attraction {
  /** stable id: slug of "city--activity name" */
  id: string;
  /** engine key: "City|Activity name" — what PlannerInput.activities takes */
  key: string;
  city: string;
  /** which priced country this attraction's city belongs to */
  country: string;
  cityIcon: string;
  cityTheme: string;
  /** the gateway this attraction hangs off (itself if the city is a gateway) */
  gateway: string;
  /** true when the city is a satellite that can be visited as a day trip */
  dayTripable: boolean;
  /** true when visiting means sleeping there (satellite >3h from its base) */
  overnightRequired: boolean;
  hopLabel?: string;
  hopHours?: number;
  /** average duration in hours parsed from e.g. "6-8 hrs" */
  hours: number;
  activity: CityActivity;
  /** optional curation fields the dataset may grow — never invented here */
  monthsClosed?: number[];
  minAge?: number;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const attractionId = (city: string, activityName: string) =>
  `${slug(city)}--${slug(activityName)}`;

export const engineKey = (city: string, activityName: string) =>
  `${city}|${activityName}`;

/** "6-8 hrs" → 7, "10-12 hrs" → 11, "40 min" → 0.5. Unknown formats fall
    back to 4h. */
export function parseHours(duration: string): number {
  const nums = duration.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (!nums.length) return 4;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  if (/min/i.test(duration) && !/h/i.test(duration)) {
    return Math.max(0.5, Math.round((avg / 60) * 2) / 2);
  }
  return Math.round(avg * 2) / 2;
}

function toAttraction(city: City, a: CityActivity): Attraction {
  const isSat = !!city.gateway;
  const hop = city.hopHours ?? 0;
  return {
    id: attractionId(city.name, a.name),
    key: engineKey(city.name, a.name),
    city: city.name,
    country: city.country ?? DEFAULT_COUNTRY,
    cityIcon: city.icon,
    cityTheme: city.theme,
    gateway: city.gateway ?? city.name,
    dayTripable: isSat && hop <= 3,
    overnightRequired: isSat && hop > 3,
    hopLabel: city.hopLabel,
    hopHours: city.hopHours,
    hours: parseHours(a.duration),
    activity: a,
  };
}

let fullCache: Attraction[] | null = null;

/** Every attraction in the dataset, in gateway order. */
export function fullCatalog(): Attraction[] {
  if (fullCache) return fullCache;
  const out: Attraction[] = [];
  for (const gw of GATEWAY_ORDER) {
    const g = CITIES[gw];
    for (const a of g.activities) out.push(toAttraction(g, a));
    for (const satName of SATELLITES_BY_GATEWAY[gw] ?? []) {
      const s = CITIES[satName];
      for (const a of s.activities) out.push(toAttraction(s, a));
    }
  }
  fullCache = out;
  return out;
}

const byId = () => {
  const map = new Map<string, Attraction>();
  for (const a of fullCatalog()) map.set(a.id, a);
  return map;
};
let idCache: Map<string, Attraction> | null = null;
export function attractionById(id: string): Attraction | undefined {
  idCache ??= byId();
  return idCache.get(id);
}

let keyCache: Map<string, Attraction> | null = null;
/** Engine key → attraction. Hot path: the canvas resolves every itinerary
    row through this on each recompute, so it's indexed, not scanned. */
export function attractionByKey(key: string): Attraction | undefined {
  keyCache ??= new Map(fullCatalog().map((a) => [a.key, a]));
  return keyCache.get(key);
}

/** Catalog scoped to one priced country — what "browse everything" means
    once more than one country is live. */
export function catalogForCountry(country: string): Attraction[] {
  return fullCatalog().filter((a) => a.country === country);
}

/** Catalog scoped to a route: the route's cities plus every satellite of the
    route's gateways (reachable side-quests the user can still add). */
export function catalogForRoute(routeCities: string[]): Attraction[] {
  const inRoute = new Set(routeCities);
  const gateways = new Set(
    routeCities.map((c) => CITIES[c]?.gateway ?? c).filter(Boolean)
  );
  return fullCatalog().filter(
    (a) => inRoute.has(a.city) || gateways.has(a.gateway)
  );
}

/** Recommended-first ordering: vibe match, then popularity, then in-route
    cities before add-a-day-trip cities. */
export function sortRecommended(
  list: Attraction[],
  vibes: string[],
  routeCities: string[]
): Attraction[] {
  const inRoute = new Set(routeCities);
  const POP: Record<City["pop"], number> = {
    "Very Popular": 4,
    Popular: 3,
    Rising: 2,
    "Hidden Gem": 1,
  };
  return [...list].sort((a, b) => {
    const ca = CITIES[a.city];
    const cb = CITIES[b.city];
    const sa =
      vibeScore(ca, vibes) * 3 + POP[ca.pop] + (inRoute.has(a.city) ? 6 : 0);
    const sb =
      vibeScore(cb, vibes) * 3 + POP[cb.pop] + (inRoute.has(b.city) ? 6 : 0);
    return sb - sa;
  });
}

export function priceFor(a: Attraction, season: Season): number {
  return a.activity.price[season] || a.activity.price.shoulder;
}
