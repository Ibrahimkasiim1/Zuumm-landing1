/* Day-by-day feasibility scheduler.
   Takes the engine's TripPlan and answers the questions the engine doesn't:
   which day does each experience land on, does each day actually fit in
   waking hours, and — when something doesn't fit — exactly which one-tap
   fixes repair it. Deterministic, no LLM. */

import type { PlannerInput, TripPlan } from "./engine";
import { attractionId, parseHours } from "./attractions";
import { CITIES } from "./data";

export type IssueSeverity = "blocker" | "warning" | "note";

export type FixKind =
  | "add_night" // +1 total night, pinned to a city
  | "add_nights" // +N total nights, unpinned
  | "remove_activity"
  | "lower_tier"
  | "set_arrival"
  | "trim_to_fit"; // drop lowest-priority picks until the schedule fits

export interface FixOption {
  id: string;
  kind: FixKind;
  label: string;
  payload?: { city?: string; attractionId?: string; count?: number; value?: string };
}

export interface Issue {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail: string;
  fixes: FixOption[];
  /** attraction cards this issue is anchored to (for inline chips) */
  attractionIds?: string[];
}

export interface DayItem {
  type: "arrive" | "hotel" | "activity" | "daytrip" | "transfer" | "depart";
  label: string;
  sub?: string;
  hours?: number;
  attractionId?: string;
  /** every attraction on this item — a day trip can carry several, and the
      canvas needs each one individually actionable (pin / swap / remove) */
  attractionIds?: string[];
  city?: string;
  overflow?: boolean;
}

export interface DayPlan {
  day: number; // 1-based
  city: string;
  icon: string;
  items: DayItem[];
  usedHours: number;
  budgetHours: number;
  overflow: boolean;
}

export interface Schedule {
  days: DayPlan[];
  issues: Issue[];
  /** attractionId → day it landed on */
  assignment: Record<string, number>;
}

const BASE_DAY_HOURS = 9; // realistic waking hours for planned experiences
/* Datasets that count travel time into every activity (City.dayBudgetHours,
   e.g. Bali's 14h-including-transfers rule) get their own budget; arrival-day
   fractions scale with it so "morning arrival" means the same share of the
   day everywhere. */
const dayBudgetFor = (city: { dayBudgetHours?: number }) =>
  city.dayBudgetHours ?? BASE_DAY_HOURS;
const ARRIVAL_HOURS: Record<string, number> = {
  morning: 7,
  afternoon: 4,
  evening: 1,
};
const GROUND_TRANSFER_HOURS = 3;
const FLIGHT_TRANSFER_HOURS = 4;
/** activities this long own their whole day */
const FULL_DAY_THRESHOLD = 8;

let fixSeq = 0;
const fix = (kind: FixKind, label: string, payload?: FixOption["payload"]): FixOption => ({
  id: `${kind}-${payload?.city ?? payload?.attractionId ?? payload?.count ?? "x"}-${fixSeq++}`,
  kind,
  label,
  payload,
});

export function buildSchedule(plan: TripPlan, input: PlannerInput): Schedule {
  fixSeq = 0;
  const issues: Issue[] = [];
  const assignment: Record<string, number> = {};
  const days: DayPlan[] = [];

  const month = input.startDate
    ? new Date(input.startDate + "T00:00:00").getMonth()
    : input.flexibleMonth;

  /* ---------- lay out the calendar: one DayPlan per night ---------- */
  for (const stop of plan.stops) {
    const stopBudget = dayBudgetFor(stop.city);
    for (let d = stop.dayStart; d <= stop.dayEnd; d++) {
      let budget = stopBudget;
      const items: DayItem[] = [];
      if (d === 1) {
        const slot = input.arrivalTime ?? "afternoon";
        budget = Math.round((stopBudget * ARRIVAL_HOURS[slot]) / BASE_DAY_HOURS);
        items.push({
          type: "arrive",
          label: `Land in ${stop.city.name}`,
          sub: `${slot} arrival`,
        });
      } else if (d === stop.dayStart) {
        // first day at a new base — the transfer eats part of it
        const idx = plan.stops.indexOf(stop);
        const t = plan.transfers[idx - 1];
        const hrs = t?.direct ? GROUND_TRANSFER_HOURS : FLIGHT_TRANSFER_HOURS;
        budget = stopBudget - hrs;
        items.push({
          type: "transfer",
          label: `${t?.mode ?? "Transfer"} to ${stop.city.name}`,
          hours: hrs,
        });
      }
      days.push({
        day: d,
        city: stop.city.name,
        icon: stop.city.icon,
        items,
        usedHours: 0,
        budgetHours: Math.max(0, budget),
        overflow: false,
      });
    }
  }
  // departure pseudo-day (no activity capacity, purely informational)
  const last = plan.stops[plan.stops.length - 1];
  if (last) {
    days.push({
      day: plan.totalDays + 1,
      city: last.city.name,
      icon: "✈️",
      items: [{ type: "depart", label: `Fly home from ${last.city.gateway ?? last.city.name}` }],
      usedHours: 0,
      budgetHours: 0,
      overflow: false,
    });
  }

  /* ---------- place experiences, biggest blocks first ---------- */
  for (const stop of plan.stops) {
    const range = days.filter(
      (d) => d.day >= stop.dayStart && d.day <= stop.dayEnd
    );
    const overflowIds: string[] = [];

    type Block = {
      hours: number;
      fullDay: boolean;
      apply: (day: DayPlan, overflow: boolean) => void;
      ids: string[];
    };
    const blocks: Block[] = [];

    for (const leg of stop.dayTrips) {
      const actHours = leg.activities.reduce(
        (s, a) => s + parseHours(a.activity.duration),
        0
      );
      const travel = (leg.city.hopHours ?? 1) * 2;
      const ids = leg.activities.map((a) => attractionId(leg.city.name, a.activity.name));
      blocks.push({
        hours: travel + actHours,
        fullDay: travel + actHours >= FULL_DAY_THRESHOLD,
        ids,
        apply: (day, overflow) => {
          day.items.push({
            type: "daytrip",
            label: `Day trip · ${leg.city.icon} ${leg.city.name}`,
            sub: leg.activities.map((a) => a.activity.name).join(" · ") || undefined,
            hours: travel + actHours,
            city: leg.city.name,
            attractionId: ids[0],
            attractionIds: ids,
            overflow,
          });
          ids.forEach((id) => (assignment[id] = day.day));
        },
      });
    }
    for (const a of stop.activities) {
      // travel to the activity area counts against the day, when known
      const hrs = parseHours(a.activity.duration) + (a.activity.travelHours ?? 0);
      const id = attractionId(stop.city.name, a.activity.name);
      blocks.push({
        hours: hrs,
        fullDay: hrs >= FULL_DAY_THRESHOLD,
        ids: [id],
        apply: (day, overflow) => {
          day.items.push({
            type: "activity",
            label: a.activity.name,
            sub: a.activity.travelHours
              ? `${a.activity.duration} + ${a.activity.travelHours}h travel`
              : a.activity.duration,
            hours: hrs,
            city: stop.city.name,
            attractionId: id,
            attractionIds: [id],
            overflow,
          });
          assignment[id] = day.day;
        },
      });
    }

    blocks.sort((a, b) => b.hours - a.hours);
    for (const block of blocks) {
      // best day: fits entirely; full-day blocks want an empty day
      const candidates = [...range].sort(
        (a, b) => b.budgetHours - b.usedHours - (a.budgetHours - a.usedHours)
      );
      const target =
        candidates.find((d) =>
          block.fullDay
            ? d.usedHours === 0 && d.budgetHours >= Math.min(block.hours, BASE_DAY_HOURS)
            : d.usedHours + block.hours <= d.budgetHours
        ) ?? candidates[0];
      if (!target) continue;
      const fits = block.fullDay
        ? target.usedHours === 0 && target.budgetHours > 0
        : target.usedHours + block.hours <= target.budgetHours;
      block.apply(target, !fits);
      target.usedHours += block.hours;
      if (!fits) {
        target.overflow = true;
        overflowIds.push(...block.ids);
      }
    }

    if (overflowIds.length) {
      const overDays = range.filter((d) => d.overflow).map((d) => d.day);
      issues.push({
        id: `overpacked-${stop.city.name}`,
        severity: "warning",
        title: `${stop.city.name} is over-packed`,
        detail: `Day ${overDays.join(" & ")} in ${stop.city.name} holds more than a day realistically fits (${stop.nights} night${stop.nights > 1 ? "s" : ""} there). Add a night or drop a pick.`,
        attractionIds: overflowIds,
        fixes: [
          fix("add_night", `Add 1 night in ${stop.city.name}`, { city: stop.city.name }),
          ...overflowIds.slice(0, 3).map((id) =>
            fix("remove_activity", "Remove this experience", { attractionId: id })
          ),
        ],
      });
    }
  }

  /* ---------- trip-level checks ---------- */

  // nights can't cover the overnight stops (engine already warns; make it actionable)
  if (input.nights < plan.stops.length) {
    const deficit = plan.stops.length - input.nights;
    issues.push({
      id: "nights-deficit",
      severity: "blocker",
      title: "More stops than nights",
      detail: `${plan.stops.length} overnight stops need at least ${plan.stops.length} nights — you have ${input.nights}.`,
      fixes: [
        fix("add_nights", `Add ${deficit} night${deficit > 1 ? "s" : ""}`, { count: deficit }),
      ],
    });
  }

  // total appetite vs total capacity
  const capacity = days.reduce((s, d) => s + d.budgetHours, 0);
  const appetite = days.reduce((s, d) => s + d.usedHours, 0);
  if (appetite > capacity && !issues.some((i) => i.id.startsWith("overpacked"))) {
    issues.push({
      id: "trip-overfull",
      severity: "warning",
      title: "The trip is fuller than the days allow",
      detail: `Your picks add up to ~${Math.round(appetite)}h of experiences and transfers against ~${Math.round(capacity)}h of usable time.`,
      fixes: [
        fix("add_nights", "Add a night", { count: 1 }),
        fix("trim_to_fit", "Trim to what fits"),
      ],
    });
  }

  // attractions that force an overnight stay (satellite >3h out)
  const overnightCities = new Set<string>();
  for (const stop of plan.stops) {
    const c = stop.city;
    if (c.gateway && (c.hopHours ?? 0) > 3) overnightCities.add(c.name);
  }
  for (const cityName of overnightCities) {
    const c = CITIES[cityName];
    const ids = plan.stops
      .find((s) => s.city.name === cityName)
      ?.activities.map((a) => attractionId(cityName, a.activity.name));
    issues.push({
      id: `overnight-${cityName}`,
      severity: "note",
      title: `${cityName} needs an overnight stay`,
      detail: `${cityName} is ${c.hopLabel ?? "too far"} from ${c.gateway} — too far to loop back the same day, so it holds its own hotel night${(plan.stops.find((s) => s.city.name === cityName)?.nights ?? 1) > 1 ? "s" : ""}.`,
      attractionIds: ids,
      fixes: [],
    });
  }

  // seasonal closures (mechanism — fires only if the dataset carries the field)
  if (month !== undefined) {
    for (const stop of plan.stops) {
      for (const a of stop.activities) {
        const closed = (a.activity as { monthsClosed?: number[] }).monthsClosed;
        if (closed?.includes(month)) {
          const id = attractionId(stop.city.name, a.activity.name);
          issues.push({
            id: `closed-${id}`,
            severity: "warning",
            title: `${a.activity.name} is closed in your month`,
            detail: "Shift your travel month or swap this experience.",
            attractionIds: [id],
            fixes: [fix("remove_activity", "Remove it", { attractionId: id })],
          });
        }
      }
    }
  }

  // budget ceiling
  if (input.budgetMax && plan.grandTotal > input.budgetMax) {
    const over = plan.grandTotal - input.budgetMax;
    issues.push({
      id: "over-budget",
      severity: "warning",
      title: "Over your budget",
      detail: `This build lands ₹${Math.round(over).toLocaleString("en-IN")} above your ₹${Math.round(input.budgetMax).toLocaleString("en-IN")} ceiling.`,
      fixes: [
        ...(input.tier !== "3"
          ? [fix("lower_tier", `Step hotels down to ${input.tier === "5" ? "4" : "3"}★`)]
          : []),
        fix("trim_to_fit", "Trim experiences"),
      ],
    });
  }

  // arrival time unset → day 1 is a guess
  if (input.startDate && !input.arrivalTime) {
    issues.push({
      id: "arrival-unset",
      severity: "note",
      title: "When do you land?",
      detail: "Day 1 assumes an afternoon arrival. Set your landing time so the first day plans itself honestly.",
      fixes: [
        fix("set_arrival", "I land in the morning", { value: "morning" }),
        fix("set_arrival", "Afternoon", { value: "afternoon" }),
        fix("set_arrival", "Evening", { value: "evening" }),
      ],
    });
  }

  // engine's own text warnings, mapped to notes (skip ones we upgraded)
  for (const w of plan.warnings) {
    if (w.includes("overnight stops but only")) continue; // upgraded above
    issues.push({
      id: `engine-${w.slice(0, 24)}`,
      severity: "note",
      title: w.length > 64 ? w.slice(0, 64) + "…" : w,
      detail: w,
      fixes: [],
    });
  }

  const order: IssueSeverity[] = ["blocker", "warning", "note"];
  issues.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return { days, issues, assignment };
}
