"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DerivedTrip, WizardState } from "@/lib/planner/wizard";
import { CREWS, MONTHS_LONG, VIBES } from "@/lib/planner/options";
import { inr } from "@/lib/planner/engine";
import { Users, Calendar, Ticket } from "@/components/plan/icons";

/* The live trip readout: the wizard's version of the home page's ops deck,
   an ink instrument laid on the paper page. Top half is the route drawn as
   a living line — home dot, then every hub with its nights, the newest stop
   pulsing — and the bottom half is the money, animated on every change and
   honestly labelled while dates are still assumed.

   Desktop: sticky rail beside the question screens. Mobile: `compact`
   strip above the step. */

function crewLabel(state: WizardState): string {
  const crew = CREWS.find((c) => c.key === state.crew);
  const heads = state.adults + state.children;
  /* infants ride along uncounted in the headcount, named separately so a
     parent can see we know about them */
  const infants = state.infants
    ? ` + ${state.infants} infant${state.infants === 1 ? "" : "s"}`
    : "";
  return crew
    ? `${crew.label} · ${heads}${infants}`
    : `${heads} traveller${heads === 1 ? "" : "s"}${infants}`;
}

function monthLabel(state: WizardState, derived: DerivedTrip): string {
  if (state.startDate) return state.startDate;
  if (state.flexMonth != null) return MONTHS_LONG[state.flexMonth] ?? "";
  return `${MONTHS_LONG[derived.plan.pricedMonth] ?? "October"} assumed`;
}

function Price({ value }: { value: number }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.21, 0.6, 0.35, 1] }}
        className="inline-block tabular-nums"
      >
        {inr(value)}
      </motion.span>
    </AnimatePresence>
  );
}

/* the route as a living line: home, then each hub, newest stop pulsing */
function RouteLine({ state, derived }: { state: WizardState; derived: DerivedTrip }) {
  const reduce = useReducedMotion();
  const stops = derived.plan.stops;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute bottom-[10px] left-[5px] top-[10px] w-px bg-white/15"
      />
      <ol className="relative space-y-2.5">
        <li className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-[11px] w-[11px] shrink-0 rounded-full border-2 border-white/70 bg-transparent"
          />
          <span className="text-[0.8rem] font-medium text-white/70">
            {state.origin || "Home"}
          </span>
          <span className="ml-auto font-mono text-[0.6rem] uppercase tracking-wider text-white/40">
            fly out
          </span>
        </li>
        <AnimatePresence initial={false}>
          {stops.map((s, i) => {
            const last = i === stops.length - 1;
            return (
              <motion.li
                key={s.city.name}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: [0.21, 0.6, 0.35, 1] }}
                className="flex items-center gap-3"
              >
                <span className="relative flex h-[11px] w-[11px] shrink-0 items-center justify-center">
                  {last && !reduce && (
                    <span
                      aria-hidden
                      className="absolute inline-flex h-[18px] w-[18px] animate-ping rounded-full bg-coral opacity-40"
                    />
                  )}
                  <span aria-hidden className="relative h-[11px] w-[11px] rounded-full bg-coral" />
                </span>
                <span className="min-w-0 truncate text-[0.84rem] font-semibold text-white">
                  {s.city.name}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[0.66rem] text-white/55">
                  {s.nights}N
                  {s.dayTrips.length > 0 && (
                    <span className="text-sun"> · +{s.dayTrips.length} trips</span>
                  )}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}

export default function TripReadout({
  state,
  derived,
  compact = false,
}: {
  state: WizardState;
  derived: DerivedTrip;
  compact?: boolean;
}) {
  const { plan } = derived;
  const chosenVibes = VIBES.filter((v) => state.vibes.includes(v.key));

  if (compact) {
    return (
      <div className="grain relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-ink px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate font-mono text-[0.68rem] uppercase tracking-widest text-white/55">
            {plan.stops.map((s) => s.city.name).join(" → ") || state.country} ·{" "}
            {state.nights}N · {crewLabel(state)}
          </p>
          <p className="mt-0.5 font-mono text-[1.05rem] font-semibold">
            <Price value={plan.grandTotal} />
            <span className="ml-1.5 text-[0.68rem] font-normal text-white/60">
              all-in{plan.seasonAssumed ? " · ±20% until dates" : ""}
            </span>
          </p>
        </div>
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
        </span>
      </div>
    );
  }

  return (
    <section
      aria-label="Your trip so far"
      className="grain relative overflow-hidden rounded-[24px] bg-ink p-5 text-white shadow-[0_30px_80px_-36px_rgba(22,18,31,0.6)]"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet/25 blur-3xl"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[0.9rem] font-semibold">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            Your trip, live
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-widest text-white/50">
            engine-priced
          </p>
        </div>

        {/* the route, drawn */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
          <RouteLine state={state} derived={derived} />
        </div>

        {/* the facts */}
        <dl className="mt-3.5 space-y-2 text-[0.8rem]">
          <div className="flex items-center gap-2.5">
            <dt className="text-white/50">
              <Users size={13} />
              <span className="sr-only">Travellers</span>
            </dt>
            <dd className="font-medium">{crewLabel(state)}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <dt className="text-white/50">
              <Calendar size={13} />
              <span className="sr-only">When</span>
            </dt>
            <dd className="font-medium">
              {monthLabel(state, derived)}
              <span className="text-white/55"> · {state.nights} nights</span>
            </dd>
          </div>
          {state.pinned.length > 0 && (
            <div className="flex items-center gap-2.5">
              <dt className="text-white/50">
                <Ticket size={13} />
                <span className="sr-only">Your picks</span>
              </dt>
              <dd className="font-medium">
                {state.pinned.length} pick{state.pinned.length === 1 ? "" : "s"} of yours
              </dd>
            </div>
          )}
        </dl>

        {/* chosen styles as chips, not a count */}
        {chosenVibes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chosenVibes.map((v) => (
              <span
                key={v.key}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-white/85"
              >
                {v.short}
              </span>
            ))}
          </div>
        )}

        {/* the money */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[0.8rem] text-white/60">All-in total</p>
            <p className="font-mono text-[1.35rem] font-semibold">
              <Price value={plan.grandTotal} />
            </p>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <p className="text-[0.8rem] text-white/60">Per person</p>
            <p className="font-mono text-[0.95rem] font-medium text-white/85">
              <Price value={plan.perPerson} />
            </p>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <p className="text-[0.8rem] text-white/60">Hold it with 20%</p>
            <p className="font-mono text-[0.85rem] font-medium text-white/75">
              <Price value={plan.depositDue} />
            </p>
          </div>
          <p className="mt-3 text-[0.7rem] leading-relaxed text-white/50">
            {plan.seasonAssumed
              ? `Priced at ${plan.seasonLabel} rates until you pick dates; real dates can move this ±20%.`
              : `Priced at ${plan.seasonLabel} rates for your dates.`}{" "}
            Taxes and transfers included. Flights quoted live at booking.
          </p>
        </div>
      </div>
    </section>
  );
}
