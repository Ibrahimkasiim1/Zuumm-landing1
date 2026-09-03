/* Trip draft persistence.
   Local-first: the draft always lives in localStorage so refresh/back never
   loses work — from the very first interaction, not once the trip is "real
   enough" (a refresh on the start screen used to lose everything).

   In the full product the draft also syncs to an anonymous server Trip that
   the main app claims after signup. This static build has no API behind it,
   so the sync is a no-op: saving a trip still writes the local draft and
   still confirms, and nothing leaves the page. The account handoff is one of
   the things still to wire. */

import { deviceId } from "../analytics";
import type { Crew, Pace, SatMode, TripPlan } from "./engine";
import type { HotelTierKey } from "./thailand-data";

/** The two surfaces of the planner. There are no steps any more: `start` is
    the one screen that gets you a plan, `canvas` is the plan itself. */
export type Surface = "start" | "canvas";

export interface PlanState {
  surface: Surface;
  country: string;
  crew: Crew;
  /** 12+ — the headcount rooms and pricing are built on */
  adults: number;
  /** ages 2–12 */
  children: number;
  /** under 2 — recorded for the expert (bassinets, cots), never priced */
  infants: number;
  nights: number;
  startDate: string;
  flexMonth: number | null;
  /** ± days of wiggle around the picked dates (0 = exact) — a stated
      preference the expert sees; pricing always uses the picked dates */
  dateFlex: number;
  /** shapes how much day 1 can hold. Never asked as a question — it surfaces
      as an inline fix once a date exists (see schedule.ts "arrival-unset"). */
  arrivalTime: "morning" | "afternoon" | "evening" | null;
  budgetMax: number | null;
  tier: HotelTierKey;
  vibes: string[];
  pace: Pace;
  cities: string[];
  satModes: Record<string, SatMode>;
  nightsOverride: Record<string, number>;
  /** per-city hotel pick, by city name → hotel name. Empty means "the one
      we recommend"; a value is the traveller having chosen another from
      that city's real list for their tier. */
  hotelOverride: Record<string, string>;
  /** engine keys "City|Activity" forced into the plan */
  pinned: string[];
  /** engine keys "City|Activity" forced out of the plan */
  removed: string[];
  /** per-activity transfer vehicle, by attraction id. Absent means the
      default, a private car; "shared" is the traveller opting into the
      shared van instead. A stated preference the expert sees — the priced
      fare is the dataset's transfer fare either way. */
  transferModes: Record<string, "private" | "shared">;
  /** contact captured for a destination we can't price yet */
  lead: { channel: "email" | "whatsapp"; value: string } | null;
  /** extras the traveller asked the expert to cover on the call — visa,
      insurance, forex. Nothing is charged for these; they ride along to
      the handoff so the expert arrives already knowing. */
  addOns: string[];
}

/* Defaults are the product: a couple, 7 nights, 4★, balanced. The user edits
   a good trip instead of building one from nothing — and crucially `crew` is
   never null, so nothing blocks a plan from rendering. */
export const initialPlanState: PlanState = {
  surface: "start",
  country: "Thailand",
  crew: "couple",
  adults: 2,
  children: 0,
  infants: 0,
  nights: 7,
  startDate: "",
  flexMonth: null,
  dateFlex: 0,
  arrivalTime: null,
  budgetMax: null,
  tier: "4",
  vibes: [],
  pace: "balanced",
  cities: [],
  satModes: {},
  nightsOverride: {},
  hotelOverride: {},
  pinned: [],
  removed: [],
  transferModes: {},
  lead: null,
  addOns: [],
};

const DRAFT_KEY = "zuumm_trip_draft_v2";
const TRIP_ID_KEY = "zuumm_trip_id_v1";

export function loadDraft(): PlanState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlanState>;
    return { ...initialPlanState, ...parsed };
  } catch {
    return null;
  }
}

export function saveDraft(state: PlanState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    /* storage full/blocked — draft stays in memory */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(TRIP_ID_KEY);
}

export function storedTripId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TRIP_ID_KEY);
}

/** Is this draft worth offering as "resume", or is it just the defaults? */
export function draftHasProgress(d: PlanState): boolean {
  return (
    d.surface === "canvas" ||
    d.pinned.length > 0 ||
    d.removed.length > 0 ||
    d.vibes.length > 0 ||
    d.cities.length > 0 ||
    d.startDate !== "" ||
    d.flexMonth !== null
  );
}

/* ---------------- server sync (best-effort) ---------------- */

type SyncOpts = {
  state: PlanState;
  plan: TripPlan | null;
  changeSource?: "user" | "ai" | "engine";
  changeSummary?: string;
};

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncing = false;

function tripBody({ state, plan, changeSource, changeSummary }: SyncOpts) {
  return {
    device_id: deviceId(),
    destination_country: state.country,
    title: plan
      ? `${plan.stops.map((s) => s.city.name).join(" → ")} · ${state.nights}n`
      : `${state.country} draft`,
    start_date: state.startDate || null,
    flex_month: state.flexMonth === null ? null : state.flexMonth + 1,
    nights: state.nights,
    party: {
      crew: state.crew,
      adults: state.adults,
      children: state.children,
      infants: state.infants,
    },
    preferences: {
      vibes: state.vibes,
      tier: state.tier,
      pace: state.pace,
      budget_max: state.budgetMax,
      arrival_time: state.arrivalTime,
    },
    plan,
    wizard_state: state,
    change_source: changeSource ?? "user",
    change_summary: changeSummary ?? "",
  };
}

/* The full product PATCHes/POSTs tripBody() to the Django trips API here.
   This build keeps the call site and the body builder — so the shape stays
   in step with the real thing — and sends nothing. */
async function doSync(_opts: SyncOpts) {
  if (syncing || typeof window === "undefined") return;
  syncing = false;
}

/** Debounced server sync — call freely on every state change. */
export function syncTrip(opts: SyncOpts, delayMs = 1600) {
  saveDraft(opts.state);
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void doSync(opts);
  }, delayMs);
}

/** Immediate sync (save button / before navigation). */
export function syncTripNow(opts: SyncOpts) {
  saveDraft(opts.state);
  if (syncTimer) clearTimeout(syncTimer);
  return doSync(opts);
}

/** In the full product this deep-links into the app so it can claim this
    device's trips after signup. There is no account door in this build. */
export function claimUrl(): string {
  return "#";
}
