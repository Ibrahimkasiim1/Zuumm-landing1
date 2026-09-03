/* The guided wizard's state + smart-notes brain.

   The wizard is a second front door to the same deterministic planner the
   canvas uses: identical PlanState fields (so a finished wizard trip hands
   off to /plan losslessly via the shared draft), plus the two things only
   the wizard asks — where the trip starts from, and whether the traveller
   chose their hubs or wants the route derived from their experience picks.

   "Smart notes" are computed here, not by an LLM: every note restates a
   fact the engine/scheduler already knows (nights vs stops, hours vs days,
   season vs price). Hard blocks stop impossible trips; soft notes suggest
   one-tap fixes and always carry the patch that applies them. */

import { buildInput } from "@/components/plan/PlanContext";
import type { PlannerInput, TripPlan } from "./engine";
import { planTrip, seasonForMonth, SEASON_LABEL } from "./engine";
import { buildSchedule, type Schedule } from "./schedule";
import { attractionById, type Attraction } from "./attractions";
import { CITIES, SATELLITES_BY_GATEWAY } from "./data";
import { initialPlanState, type PlanState } from "./tripStore";
import { MONTHS_LONG } from "./options";

/* ------------------------------------------------------------ state */

export type RouteMode = "manual" | "auto";

/** the fork: explorer = "suggest a route for me" · architect = "I'll build it" */
export type PlanMode = "explorer" | "architect";

export interface WizardState extends PlanState {
  /** departure city — only used for the flight legs of the itinerary */
  origin: string;
  /** manual = chose hubs on step 2 · auto = experiences-first, engine routes */
  routeMode: RouteMode;
  /** which side of the fork the traveller took; null until they choose */
  planMode: PlanMode | null;
  /** the nights the traveller asked for on step 1. Fix buttons and pick
      dialogs may add nights along the way — this baseline is what lets every
      later step warn "your trip grew" instead of growing it silently. */
  baseNights: number;
  /** Questions the traveller has actually answered.

      The engine's state can never be empty — `crew`, `country` and `nights`
      carry working values so a plan is always renderable (see
      initialPlanState). That makes them useless for telling "chose a
      couple" apart from "hasn't been asked yet", so the form reads this
      list instead: nothing is shown as picked, and nothing is accepted as
      answered, until the traveller puts it here. */
  answered: AnswerKey[];
}

/** the questions the wizard requires an explicit answer to */
export type AnswerKey = "crew" | "country" | "dates" | "origin" | "vibes";

export const initialWizardState: WizardState = {
  ...initialPlanState,
  origin: "",
  routeMode: "manual",
  planMode: null,
  baseNights: initialPlanState.nights,
  answered: [],
};

/** mark a question answered without disturbing the rest of the state */
export function markAnswered(
  state: WizardState,
  ...keys: AnswerKey[]
): Pick<WizardState, "answered"> {
  const next = new Set(state.answered);
  for (const k of keys) next.add(k);
  return { answered: [...next] };
}

/** Has this question been answered? Emptiness settles it where the field
    can actually be empty; the rest fall back to the answered list. */
export function isAnswered(state: WizardState, key: AnswerKey): boolean {
  switch (key) {
    case "dates":
      return Boolean(state.startDate);
    case "origin":
      return state.origin.trim().length > 0;
    case "vibes":
      return state.vibes.length > 0;
    default:
      return state.answered.includes(key);
  }
}

/** what each screen refuses to move on without, in the words the form uses */
const REQUIRED: Record<string, { key: AnswerKey; label: string }[]> = {
  crew: [{ key: "crew", label: "who's going" }],
  prefs: [
    { key: "dates", label: "your travel dates" },
    { key: "origin", label: "where you're flying from" },
    { key: "vibes", label: "what kind of trip" },
  ],
  destination: [{ key: "country", label: "a destination" }],
  origin: [{ key: "origin", label: "where you're flying from" }],
  when: [{ key: "dates", label: "your travel dates" }],
  vibes: [{ key: "vibes", label: "what kind of trip" }],
};

/** the still-empty answers this screen needs, named for the traveller */
export function missingFor(screen: string, state: WizardState): string[] {
  return (REQUIRED[screen] ?? [])
    .filter((r) => !isAnswered(state, r.key))
    .map((r) => r.label);
}

/** one plain-English sentence naming everything still missing */
export function missingSentence(missing: string[]): string {
  if (missing.length <= 1) return missing[0] ?? "";
  return `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`;
}

/** Departure-city suggestions — the metros the rate card prices for first. */
export const ORIGINS = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
  "Goa",
  "Lucknow",
] as const;

/** IATA code per departure metro — the airport the flight leg actually
    leaves from, so the itinerary can name both ends the way a ticket does.
    Destination-side codes come off the dataset's own City.code. */
export const ORIGIN_CODES: Record<string, string> = {
  Mumbai: "BOM",
  Delhi: "DEL",
  Bengaluru: "BLR",
  Hyderabad: "HYD",
  Chennai: "MAA",
  Kolkata: "CCU",
  Pune: "PNQ",
  Ahmedabad: "AMD",
  Jaipur: "JAI",
  Kochi: "COK",
  Goa: "GOI",
  Lucknow: "LKO",
};

export const originCode = (city: string): string | null =>
  ORIGIN_CODES[city.trim()] ?? null;

/** One line of character per hub — why this dot on the map is worth a night. */
export const HUB_BLURBS: Record<string, string> = {
  Bangkok: "The capital and everyone's arrival city — grand palaces, canal markets, legendary street food.",
  "Chiang Mai": "Fan favourite of the north — old-city temples, night bazaars and ethical elephant sanctuaries.",
  "Chiang Rai": "Home of the White Temple, misty mountain villages and the Golden Triangle.",
  "Khon Kaen": "Isaan's easy-going university city — silk-weaving villages, well off the tourist trail.",
  "Udon Thani": "Gateway to the Red Lotus Sea and the ancient Ban Chiang heritage site.",
  Buriram: "Khmer temple country — Phanom Rung's hilltop sanctuary is the north-east's showpiece.",
  "Koh Samui": "Palm-fringed resort island — arguably Thailand's most-loved beach base.",
  Krabi: "Limestone cliffs over emerald water — the launchpad for Railay and Phi Phi.",
  Phuket: "Thailand's biggest island — full-service beaches, a charming old town, big nightlife.",
  "Surat Thani": "The mainland springboard to Koh Samui, Koh Phangan and Khao Sok's jungle lake.",
  "Hat Yai": "The deep-south food city near the Malaysian border — markets, dim sum, few crowds.",
  Kuta: "Bali's beach-and-nightlife heart by the airport — surf schools, Waterbom, Uluwatu sunsets nearby.",
  Ubud: "The island's cultural soul — rice terraces, the Monkey Forest, water temples and jungle adventure.",
};

/** Switching country invalidates everything route-shaped: cities, night
    pins and per-activity pins all name the old country's places. One
    helper so every surface clears them the same way. */
export function countryPatch(state: WizardState | PlanState, country: string): Partial<PlanState> {
  if (country === state.country) return { country };
  return {
    country,
    cities: [],
    satModes: {},
    nightsOverride: {},
    pinned: [],
    removed: [],
  };
}

export const WIZARD_DRAFT_KEY = "zuumm_wizard_draft_v1";

export function loadWizardDraft(): WizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WIZARD_DRAFT_KEY);
    if (!raw) return null;
    /* `answered` never comes back from storage — see saveWizardDraft. The
       override also scrubs it from drafts written before that was true, so
       a stored pick can't keep re-selecting itself. */
    return {
      ...initialWizardState,
      ...(JSON.parse(raw) as Partial<WizardState>),
      answered: [],
    };
  } catch {
    return null;
  }
}

export function saveWizardDraft(state: WizardState) {
  if (typeof window === "undefined") return;
  try {
    /* Everything the traveller built persists — except which questions
       they answered, which is deliberately per-visit. Arriving at a
       question should always find it open, so nothing reads as chosen
       until it's chosen in front of you. The engine's values still
       restore underneath; only the "this was picked" marks reset. */
    const persisted: Partial<WizardState> = { ...state };
    delete persisted.answered;
    localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(persisted));
  } catch {
    /* storage blocked — in-memory state still works */
  }
}

export function clearWizardDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WIZARD_DRAFT_KEY);
}

/* ------------------------------------------------------------ derivation */

export interface DerivedTrip {
  input: PlannerInput;
  plan: TripPlan;
  schedule: Schedule;
}

/** Same pipeline as the canvas: state → input → plan → schedule. Falls back
    to a cleared route rather than returning nothing — the itinerary step can
    always render. */
export function deriveTrip(state: WizardState): DerivedTrip {
  const input = buildInput(state);
  const plan =
    planTrip(input) ?? planTrip({ ...input, cities: [], pinned: [], removed: [] })!;
  const schedule = buildSchedule(plan, plan.input);
  return { input, plan, schedule };
}

/** Contract every step component receives from WizardRoot. */
export interface StepProps {
  state: WizardState;
  patch: (p: Partial<WizardState>) => void;
  derived: DerivedTrip;
  /** this step's smart notes — each step places them under their anchor */
  notes: SmartNote[];
  next: () => void;
  goStep: (n: number) => void;
  /** open a pre-answered question (origin / when) as a detour that returns
      to the current screen when done */
  goScreen?: (id: string) => void;
  /** open the experience browser scoped to one destination */
  goExperiences?: (city: string) => void;
  /** the destination the experience browser is scoped to, when set */
  expCity?: string | null;
}

/* ------------------------------------------------------------ smart notes */

export type NoteSeverity = "block" | "warn" | "tip";

export interface NoteAction {
  label: string;
  patch: Partial<WizardState>;
}

/** which control a note belongs to — notes render as a box directly under
    their anchor, never in a detached sidebar */
export type NoteAnchor = "to" | "when" | "who" | "style" | "route" | "picks" | "trip";

export interface SmartNote {
  id: string;
  severity: NoteSeverity;
  title: string;
  detail: string;
  anchor: NoteAnchor;
  actions?: NoteAction[];
}

export const notesAt = (notes: SmartNote[], anchor: NoteAnchor) =>
  notes.filter((n) => n.anchor === anchor);

const sevRank: Record<NoteSeverity, number> = { block: 0, warn: 1, tip: 2 };

/** The anti-silent-growth guard, streamed on every step after the first:
    the moment nights ≠ what was asked for on step 1, say so — with one tap
    to bless the new length or snap back to the original. */
function nightsChangedNote(state: WizardState, anchor: NoteAnchor): SmartNote | null {
  if (state.nights === state.baseNights) return null;
  const grew = state.nights > state.baseNights;
  return {
    id: "nights-changed",
    anchor,
    severity: "warn",
    title: `Your trip is now ${state.nights} nights — you asked for ${state.baseNights}`,
    detail: grew
      ? "Fixes and picks along the way added nights so everything fits. Keep the longer trip if that works, or go back to your original length and we'll flag whatever no longer fits."
      : "You've trimmed below your original length — hotels and picks re-planned to match.",
    actions: [
      { label: `Keep ${state.nights} nights`, patch: { baseNights: state.nights } },
      {
        label: `Back to ${state.baseNights} nights`,
        patch: { nights: state.baseNights, nightsOverride: {} },
      },
    ],
  };
}

function monthOf(state: WizardState): number | null {
  if (state.startDate) return new Date(state.startDate + "T00:00:00").getMonth();
  return state.flexMonth;
}

/** Step 1 — basics. Nothing here blocks: defaults make every answer optional
    except a destination we can actually price. */
function basicsNotes(state: WizardState): SmartNote[] {
  const notes: SmartNote[] = [];

  const m = monthOf(state);
  if (m !== null) {
    const season = seasonForMonth(m);
    notes.push({
      id: "season",
      anchor: "when",
      severity: "tip",
      title: `${MONTHS_LONG[m]} is ${SEASON_LABEL[season]}`,
      detail:
        season === "peak"
          ? "Expect the best weather and the highest hotel rates — book early."
          : season === "low"
            ? "Short daily showers, lush landscapes, and hotel rates at their lowest."
            : "A great balance: good weather, sensible prices, thinner crowds.",
    });
  }
  /* no note when the dates are unset — the empty field says it already */

  if (state.children > 0 && state.pace !== "relaxed") {
    notes.push({
      id: "kids-pace",
      anchor: "who",
      severity: "tip",
      title: "Travelling with kids",
      detail:
        "We'll favour shorter, gentler experiences. A relaxed pace — one main thing a day — tends to work best with children.",
      actions: [{ label: "Set a relaxed pace", patch: { pace: "relaxed" } }],
    });
  }

  /* no "pick a style" tip: it is a required answer now, and the Continue
     guard says so in the one place the traveller is looking */

  return notes;
}

/** Step 2 — destinations. This is where the only true hard block lives:
    more overnight stops than nights is not a preference, it's arithmetic. */
function destinationsNotes(state: WizardState, d: DerivedTrip): SmartNote[] {
  const notes: SmartNote[] = [];
  const chosen = state.cities.length > 0;
  const bases = d.plan.stops.length;

  const changed = nightsChangedNote(state, "route");
  if (changed) notes.push(changed);

  /* nothing chosen yet: the skip-to-experiences door on the page says it all */
  if (!chosen) return notes;

  if (state.nights < bases) {
    const deficit = bases - state.nights;
    notes.push({
      id: "nights-deficit",
      anchor: "route",
      severity: "block",
      title: "More stops than nights",
      detail: `${bases} overnight stops need at least ${bases} nights — you have ${state.nights}. Add night${deficit > 1 ? "s" : ""} or drop a stop to continue.`,
      actions: [
        {
          label: `Add ${deficit} night${deficit > 1 ? "s" : ""}`,
          patch: { nights: state.nights + deficit },
        },
      ],
    });
  } else if (bases > Math.max(1, Math.ceil(state.nights / 2))) {
    notes.push({
      id: "many-stops",
      anchor: "route",
      severity: "warn",
      title: "That's a lot of ground",
      detail: `${bases} hubs in ${state.nights} nights means changing hotels every ~${Math.max(1, Math.round(state.nights / bases))} days. Two nights per stop is the comfortable floor.`,
      actions: [{ label: "Add 2 nights", patch: { nights: state.nights + 2 } }],
    });
  }

  /* every hub's nights pinned but they don't add up to the trip → the rest
     is unplaced. Not a block: the next step can place them around picks. */
  const allocated = d.plan.stops.reduce((s, x) => s + x.nights, 0);
  if (allocated < state.nights) {
    const spare = state.nights - allocated;
    notes.push({
      id: "nights-unplaced",
      anchor: "route",
      severity: "warn",
      title: `${spare} of your ${state.nights} nights ${spare === 1 ? "isn't" : "aren't"} placed yet`,
      detail:
        "Give them to a hub with the +/− steppers, spread them evenly — or just continue and choose the rest of the days based off experiences: what you pick next fills them in.",
      actions: [{ label: "Spread them evenly", patch: { nightsOverride: {} } }],
    });
  }

  notes.push({
    id: "hybrid",
    anchor: "route",
    severity: "tip",
    title: "You don't have to decide everything here",
    detail:
      "Keep our picks or change them — on the next page you can add experiences to any stop, and anything you add can still grow the route later.",
  });

  const flights = d.plan.transfers.filter((t) => !t.direct).length;
  if (flights > 0) {
    notes.push({
      id: "domestic-flights",
      anchor: "route",
      severity: "tip",
      title: `${flights} domestic flight${flights > 1 ? "s" : ""} in this route`,
      detail:
        "Crossing regions (e.g. north to the islands) means a short domestic flight, ~₹3,500 per person each — already in your total.",
    });
  }

  return notes;
}

/** Step 3 — experiences. Feasibility comes straight from the scheduler:
    every overpacked day / overfull trip becomes a note with its fix. */
function experiencesNotes(state: WizardState, d: DerivedTrip): SmartNote[] {
  const notes: SmartNote[] = [];

  const changed = nightsChangedNote(state, "picks");
  if (changed) notes.push(changed);

  for (const issue of d.schedule.issues) {
    if (issue.id === "nights-deficit") {
      const deficit = d.plan.stops.length - state.nights;
      notes.push({
        id: issue.id,
        anchor: "picks",
        severity: "block",
        title: issue.title,
        detail: issue.detail,
        actions: [
          {
            label: `Add ${deficit} night${deficit > 1 ? "s" : ""}`,
            patch: { nights: state.nights + Math.max(1, deficit) },
          },
        ],
      });
      continue;
    }

    if (issue.id.startsWith("overpacked-")) {
      const city = issue.id.replace("overpacked-", "");
      const actions: NoteAction[] = [
        {
          label: `Add 1 night in ${city}`,
          patch: {
            nights: state.nights + 1,
            nightsOverride: {
              ...state.nightsOverride,
              [city]:
                (state.nightsOverride[city] ??
                  d.plan.stops.find((s) => s.city.name === city)?.nights ??
                  1) + 1,
            },
          },
        },
      ];
      // offer removing an overflowing pinned pick, if there is one
      const pinnedOverflow = (issue.attractionIds ?? [])
        .map((id) => attractionById(id)?.key)
        .filter((k): k is string => !!k && state.pinned.includes(k));
      if (pinnedOverflow[0]) {
        const label = pinnedOverflow[0].split("|")[1];
        actions.push({
          label: `Drop “${label.length > 26 ? label.slice(0, 26) + "…" : label}”`,
          patch: { pinned: state.pinned.filter((k) => k !== pinnedOverflow[0]) },
        });
      }
      notes.push({
        id: issue.id,
        anchor: "picks",
        severity: "warn",
        title: issue.title,
        detail: issue.detail,
        actions,
      });
      continue;
    }

    if (issue.id === "trip-overfull") {
      notes.push({
        id: issue.id,
        anchor: "picks",
        severity: "warn",
        title: issue.title,
        detail: issue.detail,
        actions: [
          { label: "Add a night", patch: { nights: state.nights + 1 } },
        ],
      });
      continue;
    }

    if (issue.id.startsWith("overnight-")) {
      notes.push({
        id: issue.id,
        anchor: "picks",
        severity: "tip",
        title: issue.title,
        detail: issue.detail,
      });
    }
  }

  if (!notes.length) {
    const picks =
      d.plan.stops.reduce(
        (n, s) => n + s.activities.length + s.dayTrips.reduce((m, t) => m + t.activities.length, 0),
        0
      );
    notes.push({
      id: "fits",
      anchor: "picks",
      severity: "tip",
      title: "This plan breathes",
      detail: `${picks} experience${picks === 1 ? "" : "s"} across ${d.plan.days} days — everything fits in real waking hours, with room to wander.`,
    });
  }

  return notes;
}

/** Step 4 — the built trip. Anything still unresolved becomes a
    "before you book" suggestion. */
function itineraryNotes(state: WizardState, d: DerivedTrip): SmartNote[] {
  const notes = experiencesNotes(state, d).filter(
    (n) => n.severity !== "tip" || n.id === "fits"
  );
  if (state.startDate && !state.arrivalTime) {
    notes.push({
      id: "arrival-unset",
      anchor: "trip",
      severity: "tip",
      title: "When do you land?",
      detail: "Day 1 assumes an afternoon arrival. Set your landing time so the first day plans itself honestly.",
      actions: [
        { label: "Morning", patch: { arrivalTime: "morning" } },
        { label: "Afternoon", patch: { arrivalTime: "afternoon" } },
        { label: "Evening", patch: { arrivalTime: "evening" } },
      ],
    });
  }
  if (d.plan.seasonAssumed) {
    notes.push({
      id: "season-assumed",
      anchor: "trip",
      severity: "tip",
      title: "Priced for October",
      detail:
        "You haven't picked dates, so this is priced at shoulder-season rates. Real dates can move the total ±20%.",
    });
  }
  return notes;
}

export function notesForStep(
  step: number,
  state: WizardState,
  derived: DerivedTrip
): SmartNote[] {
  const notes =
    step === 1
      ? basicsNotes(state)
      : step === 2
        ? destinationsNotes(state, derived)
        : step === 3
          ? experiencesNotes(state, derived)
          : itineraryNotes(state, derived);
  return notes.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
}

/** Does anything stop the user moving past this step? */
export function stepBlocked(
  step: number,
  state: WizardState,
  derived: DerivedTrip
): SmartNote | null {
  return notesForStep(step, state, derived).find((n) => n.severity === "block") ?? null;
}

/* ------------------------------------------------------------ pin guard */

export interface PinVerdict {
  ok: boolean;
  note?: SmartNote;
}

const HOURS_HARD_LIMIT = 8; // a full extra day of overflow → physically impossible

/** Simulate adding an experience before committing it. Three outcomes:
    · fits → ok
    · fixable (new stop needs a night) → blocked, but the note carries the
      one-tap "add a night and include it" patch
    · impossible (overflow beyond a full day even for this city) → blocked
      with the arithmetic spelled out. */
export function tryPin(state: WizardState, a: Attraction): PinVerdict {
  if (state.pinned.includes(a.key)) return { ok: true };
  const next: WizardState = {
    ...state,
    pinned: [...state.pinned, a.key],
    removed: state.removed.filter((k) => k !== a.key),
  };
  const d = deriveTrip(next);

  // adding this city created more stops than nights
  if (d.plan.stops.length > next.nights) {
    const deficit = d.plan.stops.length - next.nights;
    return {
      ok: false,
      note: {
        id: `pin-needs-night-${a.id}`,
        anchor: "picks",
        severity: "block",
        title: `${a.city} needs its own night`,
        detail: `${a.activity.name} is in ${a.city}, ${a.hopLabel ?? "far"} from ${a.gateway} — too far to loop back the same day. Your ${next.nights} nights are already spoken for.`,
        actions: [
          {
            label: `Add ${deficit} night${deficit > 1 ? "s" : ""} & include it`,
            patch: {
              nights: next.nights + deficit,
              pinned: next.pinned,
              removed: next.removed,
            },
          },
        ],
      },
    };
  }

  // total appetite vs total capacity — beyond a full day over is a hard no
  const capacity = d.schedule.days.reduce((s, day) => s + day.budgetHours, 0);
  const appetite = d.schedule.days.reduce((s, day) => s + day.usedHours, 0);
  const overflow = appetite - capacity;
  if (overflow > HOURS_HARD_LIMIT) {
    const stop = d.plan.stops.find((s) => s.city.name === a.city || s.city.name === a.gateway);
    return {
      ok: false,
      note: {
        id: `pin-overfull-${a.id}`,
        anchor: "picks",
        severity: "block",
        title: "That won't fit this trip",
        detail: `Your picks would need ~${Math.round(appetite)}h against ~${Math.round(capacity)}h of usable daytime${stop ? ` (${stop.city.name} has ${stop.nights} night${stop.nights > 1 ? "s" : ""})` : ""}. Add a night or swap something out first.`,
        actions: [
          {
            label: `Add a night${stop ? ` in ${stop.city.name}` : ""} & include it`,
            patch: {
              nights: next.nights + 1,
              ...(stop
                ? {
                    nightsOverride: {
                      ...next.nightsOverride,
                      [stop.city.name]: stop.nights + 1,
                    },
                  }
                : {}),
              pinned: next.pinned,
              removed: next.removed,
            },
          },
        ],
      },
    };
  }

  return { ok: true };
}

/* ------------------------------------------------------------ misc helpers */

/** Top day-trippable satellites for a hub, most popular first. */
export function dayTripsForHub(hub: string, max = 3): string[] {
  const POP: Record<string, number> = {
    "Very Popular": 4,
    Popular: 3,
    Rising: 2,
    "Hidden Gem": 1,
  };
  return (SATELLITES_BY_GATEWAY[hub] ?? [])
    .filter((n) => (CITIES[n].hopHours ?? 99) <= 3)
    .sort((x, y) => (POP[CITIES[y].pop] ?? 0) - (POP[CITIES[x].pop] ?? 0))
    .slice(0, max);
}

export function pinsCount(state: WizardState): number {
  return state.pinned.length;
}

/** WhatsApp handoff for the built trip. The full product opens WhatsApp
    with the trip prefilled; this static build renders the same control and
    goes nowhere — the expert handoff is one of the things still to wire. */
export function waLink(_state: WizardState, _plan: TripPlan): string {
  return "#";
}
