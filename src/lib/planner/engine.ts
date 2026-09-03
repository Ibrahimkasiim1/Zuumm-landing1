/* Deterministic trip-planning engine.
   Every price, route and night here comes from the curated Thailand FIT
   dataset — nothing is invented at runtime. The rules it encodes:

   · Cities are either gateways (airports you fly into) or satellites that
     hang off a gateway with a known distance / duration / transfer mode.
   · A satellite ≤3h from its base defaults to a DAY TRIP — you keep your
     hotel at the base (so the base gets the night, not the satellite) and
     loop back by evening. Farther than 3h it becomes an OVERNIGHT stop
     with its own hotel, and the base gives up a night. Both are
     user-overridable.
   · Consecutive stops inside one gateway cluster connect by ground/boat
     (the dataset's real transfer mode). Crossing clusters means a
     domestic flight.
   · Nights are split evenly across overnight stops; remainder nights go
     to the earliest stops (you're freshest at the start).
   · Hotel rates are per room per night, double occupancy; solo travellers
     carry a single-room supplement, and rooms = ⌈adults / 2⌉.
   · Seasonal pricing by month of travel: green (May–Sep), shoulder
     (Oct, Mar, Apr), peak (Nov–Feb). No date yet → shoulder. */

import {
  CITIES,
  GATEWAY_ORDER,
  SATELLITES_BY_GATEWAY,
  anchorFor,
  countryOfCity,
  gatewayOrderFor,
  type City,
  type CityActivity,
  type HotelTierKey,
} from "./data";

export type Crew = "solo" | "couple" | "family" | "friends";
export type Pace = "relaxed" | "balanced" | "packed";
export type Season = "low" | "shoulder" | "peak";
export type SatMode = "daytrip" | "stay";

export interface PlannerInput {
  /** which priced country the trip is in; absent → Thailand */
  country?: string;
  crew: Crew;
  adults: number;
  children: number;
  /** under 2 — they share a bed and a seat, so nothing here is priced for
      them; the expert adds cots and bassinets at confirmation */
  infants?: number;
  tier: HotelTierKey;
  nights: number;
  /** ISO date, optional — "flexible" trips price at shoulder season */
  startDate?: string;
  flexibleMonth?: number; // 0-11, when no exact date
  departureCity?: string;
  /** rough arrival slot on day 1 — shapes how much day 1 can hold */
  arrivalTime?: "morning" | "afternoon" | "evening";
  /** optional trip-total budget ceiling, INR — feasibility check only */
  budgetMax?: number;
  vibes: string[];
  pace: Pace;
  cities: string[];
  satModes: Record<string, SatMode>;
  /** per-city night pins ("give Krabi 3 nights"); unpinned cities share the rest */
  nightsOverride?: Record<string, number>;
  /** per-city hotel pick by name; unset cities get the recommended one */
  hotelOverride?: Record<string, string>;
  /* ---- per-item constraints (there is no global manual/auto mode) ----
     The engine always auto-plans. `pinned` keys are forced in no matter what
     the vibe/pace budget says; `removed` keys are forced out and never
     re-suggested. Everything else stays auto and keeps adapting when nights,
     vibes or pace change — which is why peeking at the browser can no longer
     freeze the plan. Keys are "City|Activity name". */
  pinned: string[];
  removed: string[];
}

export interface DayTripLeg {
  city: City;
  activities: PlannedActivity[];
}

export interface PlannedActivity {
  city: string;
  activity: CityActivity;
  price: number; // per person, this season
}

export interface Stop {
  city: City;
  nights: number;
  dayStart: number;
  dayEnd: number;
  hotelName: string;
  hotelNightly: number; // per room / night, this season
  hotelSubtotal: number; // nightly × nights × rooms
  activities: PlannedActivity[];
  dayTrips: DayTripLeg[];
}

export interface Transfer {
  from: string;
  to: string;
  direct: boolean;
  mode: string;
  label: string;
  cost: number; // total for the party
}

export interface TripPlan {
  input: PlannerInput;
  season: Season;
  seasonLabel: string;
  /** true when no date/month was given and the price is a shoulder-season
      assumption. Never hide this — the total can move ±20% once dates land. */
  seasonAssumed: boolean;
  /** the month the price actually used, 0-11 */
  pricedMonth: number;
  travellers: number;
  rooms: number;
  stops: Stop[];
  transfers: Transfer[];
  /** nights on the ground — the sum of every stop's nights */
  totalDays: number;
  /** calendar days the trip spans, arrival through departure (nights + 1).
      Every surface reads this so "how many days" never disagrees. */
  days: number;
  hotelsTotal: number;
  activitiesTotal: number;
  transfersTotal: number;
  flightsEstimate: number;
  subtotal: number;
  gst: number;
  tcs: number;
  grandTotal: number;
  perPerson: number;
  depositDue: number;
  warnings: string[];
}

export const GST_PCT = 5;
export const TCS_PCT = 5;
export const DEPOSIT_PCT = 20;
const DOMESTIC_FLIGHT_PP = 3500;
const DAY_TRIP_MAX_HOURS = 3;

/** The month quoted when the traveller hasn't told us when. October, because
    it is genuinely a shoulder month in the dataset — so the named assumption
    and the price the engine charges are the same thing, and picking a real
    date moves the total in whichever direction is honest rather than always
    upward. Surfaced in the price bar; never silently applied. */
export const ASSUMED_MONTH = 9; // October

export function seasonForMonth(month?: number | null): Season {
  // no month at all → the assumed month's season, so the price the engine
  // charges and the month the price bar names never disagree
  if (month === undefined || month === null) return seasonForMonth(ASSUMED_MONTH);
  if (month >= 4 && month <= 8) return "low"; // May–Sep
  if (month === 9 || month === 2 || month === 3) return "shoulder"; // Oct, Mar, Apr
  return "peak"; // Nov–Feb
}

export const SEASON_LABEL: Record<Season, string> = {
  low: "green season (quietest, best prices)",
  shoulder: "shoulder season (great balance)",
  peak: "peak season (best weather, busiest)",
};

/** Nightly room rate for a tier, interpolated low→high by season. */
export function nightlyRate(city: City, tier: HotelTierKey, season: Season): number {
  const t = city.hotels[tier] ?? city.hotels["4"] ?? city.hotels["3"];
  if (!t) return 0;
  if (season === "low") return t.low;
  if (season === "peak") return t.high;
  return Math.round((t.low + t.high) / 2);
}

export function defaultSatMode(city: City): SatMode {
  if (!city.gateway) return "stay";
  return (city.hopHours ?? 99) <= DAY_TRIP_MAX_HOURS ? "daytrip" : "stay";
}

export function activityPrice(a: CityActivity, season: Season): number {
  return a.price[season] || a.price.shoulder;
}

/** All selected cities resolved into sequenced overnight bases + the day
    trips hanging off each base. This is where daytrip-vs-stay plays out. */
export function buildRoute(
  cities: string[],
  satModes: Record<string, SatMode>
): { bases: string[]; dayTripsByBase: Record<string, string[]>; warnings: string[] } {
  const selected = new Set(cities);
  const bases: string[] = [];
  const dayTripsByBase: Record<string, string[]> = {};
  const warnings: string[] = [];
  let currentBase: string | null = null;

  for (const gw of GATEWAY_ORDER) {
    if (selected.has(gw)) {
      bases.push(gw);
      currentBase = gw;
      dayTripsByBase[gw] ??= [];
    }
    for (const satName of SATELLITES_BY_GATEWAY[gw] ?? []) {
      if (!selected.has(satName)) continue;
      const sat = CITIES[satName];
      const mode = satModes[satName] ?? defaultSatMode(sat);
      if (mode === "daytrip" && currentBase) {
        dayTripsByBase[currentBase].push(satName);
      } else {
        // Either the user chose to sleep there, or there's no base to loop
        // back to — a day trip with nowhere to return isn't a day trip.
        if (mode === "daytrip" && !currentBase) {
          warnings.push(
            `${satName} was set as a day trip but there's no base city before it — we've made it an overnight stop instead.`
          );
        }
        bases.push(satName);
        currentBase = satName;
        dayTripsByBase[satName] ??= [];
      }
    }
  }
  return { bases, dayTripsByBase, warnings };
}

function allocateNights(
  nights: number,
  bases: string[],
  overrides?: Record<string, number>
): number[] {
  const baseCount = bases.length;
  if (baseCount === 0) return [];
  if (nights < baseCount) return Array(baseCount).fill(1);

  const pinned = bases.map((b) => {
    const v = overrides?.[b];
    return v && v >= 1 ? Math.round(v) : undefined;
  });
  const pinnedSum = pinned.reduce<number>((s, v) => s + (v ?? 0), 0);
  const freeIdx = pinned.flatMap((v, i) => (v === undefined ? [i] : []));

  // No free cities (or pins already eat the whole budget): honor pins,
  // scale evenly if they overshoot the total.
  if (!freeIdx.length || pinnedSum >= nights - freeIdx.length + 1) {
    if (!freeIdx.length) return pinned.map((v) => v ?? 1);
  }

  const remaining = Math.max(freeIdx.length, nights - pinnedSum);
  const each = Math.floor(remaining / freeIdx.length);
  const rem = remaining % freeIdx.length;
  const out = pinned.map((v) => v ?? 0);
  freeIdx.forEach((idx, j) => {
    out[idx] = each + (j < rem ? 1 : 0);
  });
  return out.map((v) => Math.max(1, v));
}

function transferBetween(fromName: string, toName: string, travellers: number): Transfer {
  const from = CITIES[fromName];
  const to = CITIES[toName];
  const fromGroup = from.gateway ?? from.name;
  const toGroup = to.gateway ?? to.name;
  if (fromGroup === toGroup) {
    const hop = to.gateway ? to : from;
    return {
      from: fromName,
      to: toName,
      direct: true,
      mode: hop.hopMode ?? "🚐 Car / van",
      label: `${hop.hopMode ?? "🚐 Car / van"} · ${hop.hopLabel ?? ""}`,
      cost: hop.hopCost ?? 0, // private vehicle, whole party
    };
  }
  /* two gateways on the same land mass (Kuta ↔ Ubud) cross by road, not by
     domestic flight — the dataset says so via landCrossing */
  const crossing = to.landCrossing ?? from.landCrossing;
  if (crossing && countryOfCity(fromName) === countryOfCity(toName)) {
    return {
      from: fromName,
      to: toName,
      direct: true,
      mode: crossing.mode,
      label: crossing.label,
      cost: crossing.cost, // whole-party vehicle
    };
  }
  return {
    from: fromName,
    to: toName,
    direct: false,
    mode: "✈️ Domestic flight",
    label: "✈️ Domestic flight · ~1–1.5 hr",
    cost: DOMESTIC_FLIGHT_PP * travellers,
  };
}

/* ---------- auto-planning ---------- */

export const VIBE_THEMES: Record<string, string[]> = {
  beaches: ["Beach", "Island", "Marine"],
  culture: ["Culture", "History", "City"],
  food: ["Food"],
  nature: ["Nature", "Mountain", "Wildlife"],
  adventure: ["Adventure", "Diving"],
  wellness: ["Wellness", "Relaxation"],
};

const POP_SCORE: Record<City["pop"], number> = {
  "Very Popular": 4,
  Popular: 3,
  Rising: 2,
  "Hidden Gem": 1,
};

export function vibeScore(city: City, vibes: string[]): number {
  if (!vibes.length) return 0;
  let s = 0;
  for (const v of vibes) {
    for (const kw of VIBE_THEMES[v] ?? []) {
      if (city.theme.toLowerCase().includes(kw.toLowerCase())) s += 2;
    }
  }
  return s;
}

/** Pick a route for "plan it for me": gateways that match the vibes, roughly
    one base per 2–3 nights, plus the best nearby day trips. */
export function autoRoute(
  nights: number,
  vibes: string[],
  country?: string
): { cities: string[]; satModes: Record<string, SatMode> } {
  const order = gatewayOrderFor(country);
  const maxBases = Math.max(1, Math.min(4, Math.floor(nights / 2)));
  const gateways = order.map((name) => CITIES[name])
    .map((c) => ({ c, score: vibeScore(c, vibes) * 3 + POP_SCORE[c.pop] }))
    .sort((a, b) => b.score - a.score);

  // The country's international gateway anchors every first trip.
  const picked: string[] = [anchorFor(country)];
  for (const { c } of gateways) {
    if (picked.length >= maxBases) break;
    if (!picked.includes(c.name)) picked.push(c.name);
  }

  // Attach the strongest day-trip-able satellite to each base (if any).
  const satModes: Record<string, SatMode> = {};
  const cities: string[] = [];
  const nightsPerBase = nights / picked.length;
  for (const gw of order) {
    if (!picked.includes(gw)) continue;
    cities.push(gw);
    if (nightsPerBase < 2) continue; // no room for side quests
    const sats = (SATELLITES_BY_GATEWAY[gw] ?? [])
      .map((n) => CITIES[n])
      .filter((s) => (s.hopHours ?? 99) <= DAY_TRIP_MAX_HOURS)
      .map((s) => ({ s, score: vibeScore(s, vibes) * 3 + POP_SCORE[s.pop] }))
      .sort((a, b) => b.score - a.score);
    if (sats.length) {
      cities.push(sats[0].s.name);
      satModes[sats[0].s.name] = "daytrip";
    }
  }
  return { cities, satModes };
}

export const PACE_ACTS_PER_DAY: Record<Pace, number> = {
  relaxed: 0.5,
  balanced: 0.8,
  packed: 1.2,
};

export const engineKeyFor = (city: string, activityName: string) =>
  `${city}|${activityName}`;

/** Plan one stop's experiences.

    Pins and removals are per-item constraints layered over auto-planning,
    never a mode switch:
      · a removed key is invisible — it is never picked and never suggested;
      · a pinned key is always present, even past the pace budget (the user
        asked for it explicitly, so the scheduler flags an over-packed day
        rather than the engine silently dropping it);
      · everything else is chosen fresh from the curated order on every
        recompute, so nights / vibes / pace keep steering the plan. */
function planActivities(
  stop: { city: City; nights: number; dayTrips: City[] },
  vibes: string[],
  pace: Pace,
  season: Season,
  pinned: Set<string>,
  removed: Set<string>
): { base: PlannedActivity[]; byDayTrip: Map<string, PlannedActivity[]> } {
  const daysHere = Math.max(1, stop.nights);
  const budget = Math.max(1, Math.round(daysHere * PACE_ACTS_PER_DAY[pace]));
  const plan = (city: City, a: CityActivity): PlannedActivity => ({
    city: city.name,
    activity: a,
    price: activityPrice(a, season),
  });
  const isPinned = (city: City, a: CityActivity) => pinned.has(engineKeyFor(city.name, a.name));
  const isRemoved = (city: City, a: CityActivity) => removed.has(engineKeyFor(city.name, a.name));

  /* Day trips first — a day trip without its activity is just a long drive. */
  const byDayTrip = new Map<string, PlannedActivity[]>();
  let remaining = budget;
  for (const dt of stop.dayTrips) {
    const open = dt.activities.filter((a) => !isRemoved(dt, a));
    const pins = open.filter((a) => isPinned(dt, a));
    const picks = pins.length ? pins : open.slice(0, 1);
    if (picks.length) {
      byDayTrip.set(dt.name, picks.map((a) => plan(dt, a)));
      remaining -= picks.length;
    }
  }

  /* Base city: pins are guaranteed, the rest fills whatever budget is left. */
  const open = stop.city.activities.filter((a) => !isRemoved(stop.city, a));
  const pins = open.filter((a) => isPinned(stop.city, a));
  const floor = stop.dayTrips.length ? 0 : 1; // a stop with nothing to do isn't a stop
  const autoSlots = Math.max(floor, remaining) - pins.length;
  const auto = autoSlots > 0
    ? open.filter((a) => !isPinned(stop.city, a)).slice(0, autoSlots)
    : [];

  /* Re-order to the dataset's curated sequence so pinned and auto picks read
     as one list rather than "yours, then ours". */
  const keep = new Set([...pins, ...auto]);
  const base = open.filter((a) => keep.has(a)).map((a) => plan(stop.city, a));
  return { base, byDayTrip };
}

/* ---------- main entry ---------- */

/** Every hotel this city offers at this tier — the list the traveller can
    actually choose between, in the dataset's own order. */
export function hotelsFor(city: City, tier: HotelTierKey): string[] {
  return (city.hotels[tier] ?? city.hotels["4"])?.names ?? [];
}

/** The hotel a stop is priced on: the traveller's pick when they made one
    and it is genuinely on this city's list, else the first — which is what
    the rest of the UI calls "recommended". */
export function hotelFor(city: City, tier: HotelTierKey, chosen?: string): string {
  const names = hotelsFor(city, tier);
  if (chosen && names.includes(chosen)) return chosen;
  return names[0] ?? "Curated hotel";
}

export function planTrip(input: PlannerInput): TripPlan | null {
  const warnings: string[] = [];

  let cities = input.cities;
  let satModes = input.satModes;
  if (cities.length === 0) {
    const auto = autoRoute(input.nights, input.vibes, input.country);
    cities = auto.cities;
    satModes = { ...auto.satModes, ...input.satModes };
  }

  /* Pinning an experience in a city you aren't visiting yet adds that city to
     the route — pinning is the "take me there" gesture, so it has to be able
     to reshape the route, not silently do nothing. */
  const pinned = new Set(input.pinned);
  const removed = new Set(input.removed);
  for (const key of pinned) {
    const cityName = key.split("|")[0];
    const city = CITIES[cityName];
    if (!city || cities.includes(cityName)) continue;
    cities = [...cities, cityName];
    if (city.gateway && !satModes[cityName]) {
      satModes = { ...satModes, [cityName]: defaultSatMode(city) };
    }
  }

  const route = buildRoute(cities, satModes);
  warnings.push(...route.warnings);
  const { bases, dayTripsByBase } = route;
  if (!bases.length) return null;

  const month = input.startDate
    ? new Date(input.startDate + "T00:00:00").getMonth()
    : input.flexibleMonth;
  const season = seasonForMonth(month);
  const seasonAssumed = month === undefined || month === null;
  /* When we're guessing, we guess June — mid green season, the month the
     shoulder-priced default actually sits closest to. Named, not hidden. */
  const pricedMonth = seasonAssumed ? ASSUMED_MONTH : month!;

  const travellers = input.adults + input.children;
  const rooms = Math.max(1, Math.ceil(input.adults / 2));

  if (input.nights < bases.length) {
    warnings.push(
      `You have ${bases.length} overnight stops but only ${input.nights} nights — add nights or turn a stop into a day trip so the route can breathe.`
    );
  }
  if (input.crew === "solo") {
    warnings.push(
      "Solo traveller: hotel rooms are priced per room (double occupancy), so you carry the full room rate."
    );
  }
  if (input.children > 0) {
    warnings.push(
      "Children under 12 often stay free with parents — your expert confirms exact child rates before you pay."
    );
  }
  if ((input.infants ?? 0) > 0) {
    warnings.push(
      "Infants under 2 aren't priced here — they share your room and seat. Your expert adds cots and bassinets when confirming."
    );
  }

  const nightsAlloc = allocateNights(input.nights, bases, input.nightsOverride);

  let dayCursor = 1;
  let hotelsTotal = 0;
  let activitiesTotal = 0;
  let transfersTotal = 0;

  const stops: Stop[] = bases.map((baseName, i) => {
    const city = CITIES[baseName];
    const nights = nightsAlloc[i];
    const dayStart = dayCursor;
    const dayEnd = dayCursor + nights - 1;
    dayCursor += nights;

    const nightly = nightlyRate(city, input.tier, season);
    const hotelSubtotal = Math.round(nightly * nights * rooms);
    hotelsTotal += hotelSubtotal;

    const dayTripCities = (dayTripsByBase[baseName] ?? []).map((n) => CITIES[n]);

    const picked = planActivities(
      { city, nights, dayTrips: dayTripCities },
      input.vibes,
      input.pace,
      season,
      pinned,
      removed
    );
    const baseActs = picked.base;
    const byDayTrip = picked.byDayTrip;

    /* A day trip whose experiences have all been removed is just a long
       drive — drop the leg entirely rather than showing an empty excursion
       and still charging the vehicle for it. */
    const dayTrips: DayTripLeg[] = dayTripCities
      .map((dt) => ({ city: dt, activities: byDayTrip.get(dt.name) ?? [] }))
      .filter((leg) => leg.activities.length > 0);
    for (const leg of dayTrips) {
      transfersTotal += leg.city.hopCost ?? 0; // round-trip vehicle back to base
    }

    for (const a of [...baseActs, ...dayTrips.flatMap((d) => d.activities)]) {
      activitiesTotal += a.price * travellers;
      // shared transfer to the activity area, when pickup isn't in the price
      transfersTotal += (a.activity.transferCost ?? 0) * travellers;
    }

    return {
      city,
      nights,
      dayStart,
      dayEnd,
      hotelName: hotelFor(city, input.tier, input.hotelOverride?.[city.name]),
      hotelNightly: nightly,
      hotelSubtotal,
      activities: baseActs,
      dayTrips,
    };
  });

  const transfers: Transfer[] = [];
  for (let i = 0; i < bases.length - 1; i++) {
    const t = transferBetween(bases[i], bases[i + 1], travellers);
    transfers.push(t);
    transfersTotal += t.cost;
  }

  // International arrival + departure are quoted live at booking; keep a
  // clearly-labelled placeholder so the total isn't pretending they're free.
  const flightsEstimate = 0;

  const subtotal = Math.round(hotelsTotal + activitiesTotal + transfersTotal);
  const gst = Math.round((subtotal * GST_PCT) / 100);
  const tcs = Math.round((subtotal * TCS_PCT) / 100);
  const grandTotal = subtotal + gst + tcs;

  return {
    input: { ...input, cities, satModes },
    season,
    seasonLabel: SEASON_LABEL[season],
    seasonAssumed,
    pricedMonth,
    travellers,
    rooms,
    stops,
    transfers,
    totalDays: dayCursor - 1,
    days: dayCursor, // nights + 1: arrival day through departure day

    hotelsTotal,
    activitiesTotal,
    transfersTotal,
    flightsEstimate,
    subtotal,
    gst,
    tcs,
    grandTotal,
    perPerson: Math.round(grandTotal / Math.max(1, travellers)),
    depositDue: Math.round((grandTotal * DEPOSIT_PCT) / 100),
    warnings,
  };
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
