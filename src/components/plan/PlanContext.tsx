"use client";

/* Single source of truth for the planner.

   One reducer owns the state; the engine and scheduler derive the plan and
   its feasibility on every change (both synchronous and instant — that is
   the product's edge, and the whole canvas is built to exploit it). The
   copilot edits the trip through the exact same events the buttons use, so
   AI edits and human edits are indistinguishable, visible and undoable.

   Two things here are deliberate and worth not "simplifying" later:

   · History is an event log replayed over a base state, not a stack of
     snapshots. That is what makes Undo scoped: undoing the AI's third-oldest
     edit drops *that* event and replays the rest, instead of popping the
     newest change like a snapshot stack would.
   · There is no manual/auto activities mode. Pins and removals are per-item
     constraints the engine plans around, so opening the experience browser
     can no longer silently freeze the itinerary. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  planTrip,
  defaultSatMode,
  type Crew,
  type PlannerInput,
  type TripPlan,
} from "@/lib/planner/engine";
import { CITIES } from "@/lib/planner/data";
import { buildSchedule, type FixOption, type Schedule } from "@/lib/planner/schedule";
import {
  attractionById,
  attractionByKey,
  catalogForRoute,
  type Attraction,
} from "@/lib/planner/attractions";

import {
  clearDraft,
  draftHasProgress,
  initialPlanState,
  loadDraft,
  saveDraft,
  syncTrip,
  type PlanState,
  type Surface,
} from "@/lib/planner/tripStore";
import type { UIAction } from "@/lib/planner/uiActions";
import { destinationByName } from "@/lib/planner/destinations";
import { track } from "@/lib/analytics";

/* ------------------------------------------------ events */

export type PlanEvent =
  | { type: "HYDRATE"; state: Partial<PlanState> }
  | { type: "SET"; field: keyof PlanState; value: unknown }
  | { type: "SET_CREW"; crew: Crew }
  | { type: "TOGGLE_VIBE"; vibe: string }
  | { type: "TOGGLE_CITY"; city: string }
  | { type: "SET_SAT_MODE"; city: string; mode: "daytrip" | "stay" }
  /** ⭐ keep — force an experience in; off releases it back to auto-planning */
  | { type: "PIN"; key: string; on: boolean }
  /** ✕ — force an experience out; off allows the engine to suggest it again */
  | { type: "DROP"; key: string; on: boolean }
  /** ⇄ — one gesture, so it undoes as one thing */
  | { type: "SWAP"; from: string; to: string }
  | { type: "ADD_NIGHT"; city?: string; currentCityNights?: number; count?: number }
  | { type: "REMOVE_NIGHT"; city: string; currentCityNights: number }
  | { type: "SET_SURFACE"; surface: Surface };

/** Events that represent a user intention worth undoing on its own. */
const UNDOABLE = new Set<PlanEvent["type"]>([
  "SET",
  "SET_CREW",
  "TOGGLE_VIBE",
  "TOGGLE_CITY",
  "SET_SAT_MODE",
  "PIN",
  "DROP",
  "SWAP",
  "ADD_NIGHT",
  "REMOVE_NIGHT",
]);

const without = (list: string[], key: string) => list.filter((k) => k !== key);
const withKey = (list: string[], key: string) =>
  list.includes(key) ? list : [...list, key];

export function applyEvent(s: PlanState, e: PlanEvent): PlanState {
  switch (e.type) {
    case "HYDRATE":
      return { ...s, ...e.state };
    case "SET":
      return { ...s, [e.field]: e.value };
    case "SET_SURFACE":
      return { ...s, surface: e.surface };
    case "SET_CREW": {
      const next = { ...s, crew: e.crew };
      if (e.crew === "solo") return { ...next, adults: 1, children: 0, infants: 0 };
      if (e.crew === "couple") return { ...next, adults: 2, children: 0 };
      if (e.crew === "family")
        return { ...next, adults: Math.max(2, s.adults), children: Math.max(1, s.children) };
      /* friends is 1+ travellers — it never forces the count up */
      return { ...next, adults: Math.max(1, s.adults), children: 0 };
    }
    case "TOGGLE_VIBE":
      return {
        ...s,
        vibes: s.vibes.includes(e.vibe)
          ? s.vibes.filter((v) => v !== e.vibe)
          : [...s.vibes, e.vibe],
      };
    case "TOGGLE_CITY": {
      const on = !s.cities.includes(e.city);
      if (!on) {
        /* Dropping a city takes its pins with it — leaving them behind would
           silently re-add the city on the next recompute (see planTrip). */
        const prefix = e.city + "|";
        return {
          ...s,
          cities: without(s.cities, e.city),
          pinned: s.pinned.filter((k) => !k.startsWith(prefix)),
        };
      }
      const city = CITIES[e.city];
      const satModes =
        city?.gateway && !s.satModes[e.city]
          ? { ...s.satModes, [e.city]: defaultSatMode(city) }
          : s.satModes;
      return { ...s, cities: [...s.cities, e.city], satModes };
    }
    case "SET_SAT_MODE":
      return { ...s, satModes: { ...s.satModes, [e.city]: e.mode } };
    /* Pin and drop are opposite ends of one axis, so setting either always
       clears the other — an item can't be both required and forbidden. */
    case "PIN":
      return e.on
        ? { ...s, pinned: withKey(s.pinned, e.key), removed: without(s.removed, e.key) }
        : { ...s, pinned: without(s.pinned, e.key) };
    case "DROP":
      return e.on
        ? { ...s, removed: withKey(s.removed, e.key), pinned: without(s.pinned, e.key) }
        : { ...s, removed: without(s.removed, e.key) };
    case "SWAP":
      return {
        ...s,
        removed: withKey(without(s.removed, e.to), e.from),
        pinned: withKey(without(s.pinned, e.from), e.to),
      };
    case "ADD_NIGHT": {
      const nights = s.nights + (e.count ?? 1);
      if (!e.city) return { ...s, nights };
      return {
        ...s,
        nights,
        nightsOverride: {
          ...s.nightsOverride,
          [e.city]: (e.currentCityNights ?? s.nightsOverride[e.city] ?? 1) + 1,
        },
      };
    }
    case "REMOVE_NIGHT": {
      if (s.nights <= 2 || e.currentCityNights <= 1) return s;
      return {
        ...s,
        nights: s.nights - 1,
        nightsOverride: { ...s.nightsOverride, [e.city]: e.currentCityNights - 1 },
      };
    }
    default:
      return s;
  }
}

/* ------------------------------------------------ replayable history */

interface Entry {
  token: number;
  event: PlanEvent;
  undoable: boolean;
}

interface History {
  base: PlanState;
  log: Entry[];
  present: PlanState;
  seq: number;
}

const MAX_LOG = 60;

type HistoryAction =
  | { kind: "dispatch"; event: PlanEvent }
  | { kind: "undo"; token: number }
  | { kind: "reset"; state: PlanState };

const replay = (base: PlanState, log: Entry[]) =>
  log.reduce((s, entry) => applyEvent(s, entry.event), base);

function historyReducer(h: History, a: HistoryAction): History {
  switch (a.kind) {
    case "reset":
      return { base: a.state, log: [], present: a.state, seq: h.seq };
    case "dispatch": {
      const present = applyEvent(h.present, a.event);
      if (present === h.present) return h; // no-op event, don't pollute history
      const entry: Entry = {
        token: h.seq,
        event: a.event,
        undoable: UNDOABLE.has(a.event.type),
      };
      let base = h.base;
      let log = [...h.log, entry];
      if (log.length > MAX_LOG) {
        // fold the oldest entries into the base; they're past undo reach anyway
        const fold = log.slice(0, log.length - MAX_LOG);
        base = replay(base, fold);
        log = log.slice(fold.length);
      }
      return { base, log, present, seq: h.seq + 1 };
    }
    case "undo": {
      const log = h.log.filter((e) => e.token !== a.token);
      if (log.length === h.log.length) return h; // already undone or folded away
      return { ...h, log, present: replay(h.base, log) };
    }
  }
}

/* ------------------------------------------------ context */

export interface BrowserRequest {
  /** preselect this city's filter pill; undefined = start unfiltered */
  city?: string;
  /** Hard scope: only show what hangs off this gateway.

      Swapping is "give me a different version of this part of the trip", and
      what's actually substitutable without re-routing is the gateway's whole
      cluster — not the one satellite the item sits in. Scoping to the city
      alone is how ⇄ on an Ayutthaya day trip ended up offering nothing: the
      city has exactly one activity, and it's the one being replaced. */
  gateway?: string;
  /** the day the user tapped "add" on, for the sheet's title */
  day?: number;
  /** set when opened by ⇄ — picking something swaps it for this key */
  swapFor?: string;
}

/** What Door A read out of the traveller's sentence, carried onto the canvas
    so the plan can show its work — and one optional follow-up, asked beside a
    rendered itinerary rather than in front of one. */
export interface BriefEcho {
  understood: string[];
  followUp: string | null;
}

export interface ExperienceFilters {
  city: string; // "all" or a city name
  vibe: string | null;
  query: string;
  sort: "recommended" | "price" | "duration";
}

export const initialFilters: ExperienceFilters = {
  city: "all",
  vibe: null,
  query: "",
  sort: "recommended",
};

export interface PlanCtx {
  state: PlanState;
  dispatch: (e: PlanEvent) => void;
  plan: TripPlan;
  input: PlannerInput;
  schedule: Schedule;
  catalog: Attraction[];
  /** engine keys currently in the itinerary, whether pinned or auto-picked */
  inPlan: Set<string>;
  /** true when this destination has a priced dataset behind it */
  destinationLive: boolean;
  surface: Surface;
  go: (surface: Surface) => void;

  /** undo one specific past action, leaving everything after it intact */
  undo: (token: number) => void;
  /** token of the action a dispatch just produced, for scoped undo */
  lastToken: () => number | null;
  canUndo: boolean;

  draftAvailable: boolean;
  resumeDraft: () => void;
  discardDraft: () => void;

  briefEcho: BriefEcho | null;
  setBriefEcho: (e: BriefEcho | null) => void;

  filters: ExperienceFilters;
  setFilters: (patch: Partial<ExperienceFilters>) => void;
  browser: BrowserRequest | null;
  openBrowser: (req?: BrowserRequest) => void;
  closeBrowser: () => void;

  applyFix: (f: FixOption) => void;
  previewAction: (a: UIAction) => number | null;
  applyUIAction: (a: UIAction) => void;

  registerTarget: (id: string, el: HTMLElement | null) => void;
  scrollToTarget: (id: string) => void;
  highlightId: string | null;
  flashHighlight: (id: string) => void;

  saveLead: (channel: "email" | "whatsapp", value: string) => Promise<boolean>;
}

const Ctx = createContext<PlanCtx | null>(null);

export function usePlan(): PlanCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlan outside PlanProvider");
  return ctx;
}

export function buildInput(s: PlanState): PlannerInput {
  return {
    country: s.country,
    crew: s.crew,
    adults: s.adults,
    children: s.children,
    infants: s.infants,
    tier: s.tier,
    nights: s.nights,
    startDate: s.startDate || undefined,
    flexibleMonth: s.flexMonth ?? undefined,
    arrivalTime: s.arrivalTime ?? undefined,
    budgetMax: s.budgetMax ?? undefined,
    vibes: s.vibes,
    pace: s.pace,
    cities: s.cities,
    satModes: s.satModes,
    nightsOverride: s.nightsOverride,
    hotelOverride: s.hotelOverride,
    pinned: s.pinned,
    removed: s.removed,
  };
}

export function PlanProvider({
  preset,
  children,
}: {
  preset?: Partial<PlanState>;
  children: React.ReactNode;
}) {
  const [h, hDispatch] = useReducer(historyReducer, undefined, () => {
    const state = { ...initialPlanState, ...(preset ?? {}) };
    return { base: state, log: [], present: state, seq: 1 } as History;
  });
  const state = h.present;

  /* ---------------- the plan itself ----------------
     planTrip only returns null when no route can be built at all, which the
     defaults make unreachable — but the canvas is built on "there is always a
     plan", so we fall back to the default route rather than render an empty
     page and make the user go find the problem. */
  const input = useMemo(() => buildInput(state), [state]);
  const plan = useMemo(() => {
    const p = planTrip(input);
    if (p) return p;
    return planTrip({ ...input, cities: [], pinned: [], removed: [] })!;
  }, [input]);
  const schedule = useMemo(() => buildSchedule(plan, plan.input), [plan]);
  const catalog = useMemo(() => catalogForRoute(plan.input.cities), [plan]);

  const inPlan = useMemo(() => {
    const set = new Set<string>();
    for (const s of plan.stops) {
      for (const a of s.activities) set.add(`${s.city.name}|${a.activity.name}`);
      for (const d of s.dayTrips) {
        for (const a of d.activities) set.add(`${d.city.name}|${a.activity.name}`);
      }
    }
    return set;
  }, [plan]);

  const destinationLive = destinationByName(state.country)?.status === "live";

  const lastTokenRef = useRef<number | null>(null);
  const dispatch = useCallback((e: PlanEvent) => {
    lastTokenRef.current = UNDOABLE.has(e.type) ? null : lastTokenRef.current;
    hDispatch({ kind: "dispatch", event: e });
  }, []);
  const lastToken = useCallback(() => lastTokenRef.current, []);
  const undo = useCallback((token: number) => hDispatch({ kind: "undo", token }), []);

  /* Track the token a mutating dispatch produced so the copilot can undo
     exactly its own card later, even after the user has changed other things. */
  useEffect(() => {
    const last = h.log[h.log.length - 1];
    lastTokenRef.current = last?.undoable ? last.token : null;
  }, [h.log]);

  const go = useCallback(
    (surface: Surface) => {
      hDispatch({ kind: "dispatch", event: { type: "SET_SURFACE", surface } });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
    },
    []
  );

  /* ---------------- drafts ---------------- */
  const [draft, setDraft] = useState<PlanState | null>(null);
  const hydratedFromPreset = useRef(Boolean(preset && Object.keys(preset).length));
  useEffect(() => {
    // localStorage is client-only; read after mount so hydration stays stable
    const t = setTimeout(() => {
      if (hydratedFromPreset.current) return; // arrived with an explicit intent
      const d = loadDraft();
      if (d && draftHasProgress(d)) setDraft(d);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const resumeDraft = useCallback(() => {
    if (!draft) return;
    track("draft_resumed");
    hDispatch({ kind: "reset", state: draft });
    setDraft(null);
  }, [draft]);

  const discardDraft = useCallback(() => {
    track("draft_discarded");
    clearDraft();
    setDraft(null);
  }, []);

  /* Persist from the very first interaction — a refresh on the start screen
     used to lose everything (friction #9). Server sync only once there's a
     real trip forming, so we don't create empty Trip rows. */
  useEffect(() => {
    if (state.surface === "canvas") syncTrip({ state, plan });
    else saveDraft(state);
  }, [state, plan]);

  /* ---------------- content bundle (photos) ----------------
     The full product fetches a live content bundle here. This build has no
     content API — imagery is cosmetic and the plan is already complete
     without it, so nothing is requested. */

  /* ---------------- funnel ---------------- */
  const firstRender = useRef(false);
  useEffect(() => {
    if (state.surface !== "canvas" || firstRender.current) return;
    firstRender.current = true;
    track("plan_first_render_ms", {
      ms: Math.round(performance.now()),
      country: state.country,
      nights: state.nights,
      total: plan.grandTotal,
    });
  }, [state.surface, state.country, state.nights, plan.grandTotal]);

  const [briefEcho, setBriefEcho] = useState<BriefEcho | null>(null);

  /* ---------------- filters + browser ---------------- */
  const [filters, setFiltersState] = useState<ExperienceFilters>(initialFilters);
  const setFilters = useCallback((patch: Partial<ExperienceFilters>) => {
    setFiltersState((f) => ({ ...f, ...patch }));
  }, []);

  const [browser, setBrowser] = useState<BrowserRequest | null>(null);
  const openBrowser = useCallback(
    (req: BrowserRequest = {}) => {
      track("browser_open", { city: req.city ?? "all", swap: Boolean(req.swapFor) });
      setFiltersState((f) => ({ ...f, city: req.city ?? "all", query: "" }));
      setBrowser(req);
    },
    []
  );
  const closeBrowser = useCallback(() => setBrowser(null), []);

  /* ---------------- scroll / highlight registry ---------------- */
  const targets = useRef(new Map<string, HTMLElement>());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const hlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerTarget = useCallback((id: string, el: HTMLElement | null) => {
    if (el) targets.current.set(id, el);
    else targets.current.delete(id);
  }, []);

  const scrollToTarget = useCallback((id: string) => {
    targets.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const flashHighlight = useCallback((id: string) => {
    setHighlightId(id);
    if (hlTimer.current) clearTimeout(hlTimer.current);
    hlTimer.current = setTimeout(() => setHighlightId(null), 2600);
  }, []);

  useEffect(() => () => {
    if (hlTimer.current) clearTimeout(hlTimer.current);
  }, []);

  /* ---------------- fixes ---------------- */
  const applyFix = useCallback(
    (f: FixOption) => {
      track("fix_applied", { kind: f.kind, ...f.payload });
      switch (f.kind) {
        case "add_night": {
          const city = f.payload?.city;
          const cur = plan.stops.find((s) => s.city.name === city)?.nights;
          dispatch({ type: "ADD_NIGHT", city, currentCityNights: cur });
          break;
        }
        case "add_nights":
          dispatch({ type: "ADD_NIGHT", count: f.payload?.count ?? 1 });
          break;
        case "remove_activity": {
          const key = attractionById(f.payload?.attractionId ?? "")?.key;
          if (key) dispatch({ type: "DROP", key, on: true });
          break;
        }
        case "lower_tier":
          dispatch({ type: "SET", field: "tier", value: state.tier === "5" ? "4" : "3" });
          break;
        case "set_arrival":
          dispatch({ type: "SET", field: "arrivalTime", value: f.payload?.value ?? "afternoon" });
          break;
        case "trim_to_fit": {
          const ids = new Set(
            schedule.issues.flatMap((i) =>
              i.id.startsWith("overpacked") || i.id === "trip-overfull" ? (i.attractionIds ?? []) : []
            )
          );
          for (const id of ids) {
            const key = attractionById(id)?.key;
            if (key) dispatch({ type: "DROP", key, on: true });
          }
          break;
        }
      }
    },
    [dispatch, plan, schedule, state.tier]
  );

  /* ---------------- copilot actions ---------------- */

  const translate = useCallback(
    (a: UIAction): PlanEvent[] => {
      const keyOf = (id: string) => attractionById(id)?.key;
      switch (a.type) {
        case "pin_item": {
          const key = keyOf(a.id);
          return key ? [{ type: "PIN", key, on: a.on }] : [];
        }
        case "remove_item": {
          const key = keyOf(a.id);
          return key ? [{ type: "DROP", key, on: a.on }] : [];
        }
        case "swap_item": {
          const from = keyOf(a.from);
          const to = keyOf(a.to);
          return from && to ? [{ type: "SWAP", from, to }] : [];
        }
        case "set_field": {
          const f = a.field;
          if (f === "crew") return [{ type: "SET_CREW", crew: a.value as Crew }];
          if (f === "vibes" && Array.isArray(a.value))
            return [{ type: "SET", field: "vibes", value: a.value }];
          const numeric = ["nights", "adults", "children", "budgetMax", "flexMonth"];
          const value = numeric.includes(f) ? Number(a.value) : a.value;
          const fieldMap: Record<string, keyof PlanState> = {
            nights: "nights",
            startDate: "startDate",
            flexMonth: "flexMonth",
            tier: "tier",
            pace: "pace",
            adults: "adults",
            children: "children",
            arrivalTime: "arrivalTime",
            budgetMax: "budgetMax",
            vibes: "vibes",
            country: "country",
          };
          const field = fieldMap[f];
          return field ? [{ type: "SET", field, value }] : [];
        }
        case "add_night": {
          const cur = plan.stops.find((s) => s.city.name === a.city)?.nights;
          return [{ type: "ADD_NIGHT", city: a.city, currentCityNights: cur }];
        }
        case "remove_night": {
          const cur = plan.stops.find((s) => s.city.name === a.city)?.nights ?? 1;
          return [{ type: "REMOVE_NIGHT", city: a.city, currentCityNights: cur }];
        }
        default:
          return [];
      }
    },
    [plan]
  );

  const previewAction = useCallback(
    (a: UIAction): number | null => {
      if (a.type === "propose_fix") return null; // fix cards carry their own copy
      const events = translate(a);
      if (!events.length) return null;
      let next = state;
      for (const e of events) next = applyEvent(next, e);
      const nextPlan = planTrip(buildInput(next));
      if (!nextPlan) return null;
      return nextPlan.grandTotal - plan.grandTotal;
    },
    [plan, state, translate]
  );

  const applyUIAction = useCallback(
    (a: UIAction) => {
      track("copilot_action_applied", { action: a.type });
      switch (a.type) {
        case "set_filter":
          setFilters({
            ...(a.city ? { city: a.city } : {}),
            ...(a.vibe !== undefined ? { vibe: a.vibe } : {}),
            ...(a.query ? { query: a.query } : {}),
            ...(a.sort ? { sort: a.sort } : {}),
          });
          setBrowser((b) => b ?? {});
          return;
        case "open_browser":
          openBrowser({ city: a.city, day: a.day });
          return;
        case "scroll_to":
        case "highlight":
          scrollToTarget(a.target);
          flashHighlight(a.target);
          return;
        case "propose_fix": {
          const f = schedule.issues.flatMap((i) => i.fixes).find((x) => x.id === a.fix_id);
          if (f) applyFix(f);
          return;
        }
        default: {
          for (const e of translate(a)) dispatch(e);
          // make the AI's edit visible where it happened
          const id =
            a.type === "pin_item" || a.type === "remove_item"
              ? a.id
              : a.type === "swap_item"
                ? a.to
                : null;
          if (id) {
            requestAnimationFrame(() => {
              scrollToTarget(id);
              flashHighlight(id);
            });
          }
        }
      }
    },
    [applyFix, dispatch, flashHighlight, openBrowser, schedule, scrollToTarget, setFilters, translate]
  );

  /* ---------------- lead capture ---------------- */
  /* The full product POSTs the lead to the planner API. Here it is kept
     locally and reported as captured — lead delivery is one of the things
     still to wire. */
  const saveLead = useCallback(
    async (channel: "email" | "whatsapp", value: string) => {
      dispatch({ type: "SET", field: "lead", value: { channel, value } });
      track("lead_captured", { channel, country: state.country });
      return true;
    },
    [dispatch, state.country]
  );

  const value: PlanCtx = {
    state,
    dispatch,
    plan,
    input,
    schedule,
    catalog,
    inPlan,
    destinationLive,
    surface: state.surface,
    go,
    undo,
    lastToken,
    canUndo: h.log.some((e) => e.undoable),
    draftAvailable: draft !== null,
    resumeDraft,
    discardDraft,
    briefEcho,
    setBriefEcho,
    filters,
    setFilters,
    browser,
    openBrowser,
    closeBrowser,
    applyFix,
    previewAction,
    applyUIAction,
    registerTarget,
    scrollToTarget,
    highlightId,
    flashHighlight,
    saveLead,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Resolve an engine key to its catalog entry — the canvas works in keys,
    the copilot and analytics work in ids. */
export const keyToAttraction = attractionByKey;
