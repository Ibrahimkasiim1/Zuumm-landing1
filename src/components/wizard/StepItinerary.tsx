"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { StepProps } from "@/lib/planner/wizard";
import { originCode, waLink } from "@/lib/planner/wizard";
import { inr, hotelsFor, GST_PCT, TCS_PCT, type Season } from "@/lib/planner/engine";
import type { City } from "@/lib/planner/data";
import type { DayPlan, DayItem } from "@/lib/planner/schedule";
import { saveDraft, syncTripNow } from "@/lib/planner/tripStore";
import { attractionById, priceFor } from "@/lib/planner/attractions";
import { MONTHS, crewLabel } from "@/lib/planner/options";
import { guideByDestinationName } from "@/lib/guides";
import { WIZARD_SECTIONS } from "@/lib/planner/sections";
import { track } from "@/lib/analytics";
import FlowArrow from "./FlowArrow";
import SmartNotes from "./SmartNotes";
import TripMapAtlas from "./TripMapAtlas";
import TripCheckout from "./TripCheckout";
import { Bed, Check, Clock, Loop, Plus, Ticket } from "@/components/plan/icons";
import { Plane } from "@/components/Icons";
import CityPhoto from "@/components/plan/CityPhoto";

/* Step 4 — the reveal.

   Everything the traveller chose (and everything the engine filled in)
   assembled into one continuous journey: land here, drive there, sleep
   here, do this — each leg connected by an arrow that draws itself as the
   page scrolls. Every section carries an edit button back into the wizard;
   the deep edits live in the advanced canvas, one click away with the
   whole trip carried across. */

/* dataset labels carry map-emoji ("Day trip · 🏔 Pai") — the reveal draws
   its own icons, so strip pictographs at render */
const deEmoji = (s: string) =>
  s.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").replace(/\s{2,}/g, " ").trim();

/* Stand-in for the signed-in traveller. There is no auth yet, so this is
   the one place to change when there is: read these off the account
   instead of the constant. Nothing else in the reveal invents identity. */
const TRAVELLER = {
  name: "Aditi Rao",
  email: "aditi.rao@email.com",
  phone: "+91 98765 43210",
};

const SLIDE = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.45, ease: [0.21, 0.6, 0.35, 1] as const },
};

export default function StepItinerary({
  state,
  patch,
  derived,
  goScreen,
  goExperiences,
  notes,
}: StepProps) {
  const reduce = useReducedMotion();
  const { plan, schedule } = derived;
  const [saved, setSaved] = useState(false);

  /* removing straight from the plan: a pinned pick unpins, an engine pick
     is forced out (it never comes back on recompute) */
  const removeAttraction = (attractionId: string) => {
    const key = attractionById(attractionId)?.key;
    if (!key) return;
    track("reveal_edit", { action: "remove" });
    if (state.pinned.includes(key)) {
      patch({ pinned: state.pinned.filter((k) => k !== key) });
    } else {
      patch({ removed: [...state.removed, key] });
    }
  };

  /* step to this city's next real hotel at the chosen tier, wrapping round.
     Only the dataset's own names — nothing invented. */
  const cycleHotel = (city: City, current: string) => {
    const names = hotelsFor(city, state.tier);
    if (names.length < 2) return;
    const next = names[(Math.max(0, names.indexOf(current)) + 1) % names.length];
    track("reveal_edit", { action: "hotel" });
    patch({ hotelOverride: { ...state.hotelOverride, [city.name]: next } });
  };

  /* the transfer vehicle on an experience: private car unless the
     traveller switches that experience to the shared van. A preference
     the expert confirms — the priced fare doesn't move with it. */
  const setTransferMode = (attractionId: string, mode: "private" | "shared") => {
    track("reveal_edit", { action: "transfer" });
    patch({ transferModes: { ...state.transferModes, [attractionId]: mode } });
  };

  const setStopNights = (city: string, value: number) => {
    track("reveal_edit", { action: "nights" });
    patch({
      nightsOverride: {
        ...state.nightsOverride,
        [city]: Math.max(1, Math.min(state.nights, value)),
      },
    });
  };

  const expCount = useMemo(
    () =>
      plan.stops.reduce(
        (n, s) => n + s.activities.length + s.dayTrips.reduce((m, t) => m + t.activities.length, 0),
        0
      ),
    [plan]
  );

  const firstCity = plan.stops[0]?.city;
  const lastCity = plan.stops[plan.stops.length - 1]?.city;
  const arrivalGateway = firstCity ? (firstCity.gateway ?? firstCity.name) : "Bangkok";
  const departGateway = lastCity ? (lastCity.gateway ?? lastCity.name) : "Bangkok";
  /* the airport each end of the trip actually uses, off the dataset */
  const arrivalCode = firstCity?.code ?? null;
  const departCode = lastCity?.code ?? null;
  /* the destination's guide — the country it sits in, and the visa and
     currency facts the checkout reads */
  const guide = guideByDestinationName(state.country);

  const dateFor = (day: number): string | null => {
    if (!state.startDate) return null;
    const d = new Date(state.startDate + "T00:00:00");
    d.setDate(d.getDate() + (day - 1));
    return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  const tripDays = schedule.days.filter((d) => d.day <= plan.totalDays);

  /* Reaching the reveal is the moment the trip is fully answered, so it
     gets written to the shared plan draft here — the same cache the
     canvas app reads. Until now the wizard only persisted its own draft,
     so a finished trip couldn't be picked up anywhere else. Local only;
     the server sync still waits for "Save my trip". */
  useEffect(() => {
    saveDraft(state);
  }, [state]);

  /* Save as PDF is the browser's own print-to-PDF: no bundled renderer, and
     what you get is exactly what the page says. print.css lays the page out
     for paper — the chrome, rails and buttons drop away and the itinerary
     runs top to bottom, one stop per page where it can. */
  const printPlan = () => {
    track("reveal_share", { via: "pdf" });
    window.print();
  };

  const save = async () => {
    track("wizard_save", { total: plan.grandTotal });
    await syncTripNow({ state, plan, changeSource: "user", changeSummary: "wizard finished" });
    setSaved(true);
  };

  let arrowIdx = 0;

  return (
    <div className="pb-24">
      {/* ---------- reveal header ---------- */}
      <section className="relative overflow-hidden border-b border-line bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,59,92,0.08),transparent_70%),radial-gradient(40%_60%_at_85%_20%,rgba(102,51,242,0.07),transparent_70%)]">
        <div aria-hidden className="dotgrid absolute inset-0 -z-10" />
        <div className="container-x py-10 text-center md:py-14">
          <motion.p
            className="eyebrow text-ink-3"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your plan
          </motion.p>
          <motion.h1
            className="display mt-2 text-[2.1rem] leading-[1.05] text-ink md:text-[3rem]"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
          >
            Your {state.country} trip, <span className="grad-text">built.</span>
          </motion.h1>

          <motion.div
            className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
          >
            {[
              `${plan.days} days`,
              `${plan.stops.length} hub${plan.stops.length > 1 ? "s" : ""}`,
              `${expCount} experiences`,
              `${plan.travellers} traveller${plan.travellers > 1 ? "s" : ""}`,
              `${inr(plan.grandTotal)} all-in`,
            ].map((chip) => (
              <motion.span
                key={chip}
                variants={{
                  hidden: reduce ? {} : { opacity: 0, scale: 0.9, y: 8 },
                  show: { opacity: 1, scale: 1, y: 0 },
                }}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[0.82rem] font-bold text-ink shadow-sm"
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            data-print-hide
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-[0.76rem] font-semibold uppercase tracking-wider text-ink-3">
              Edit:
            </span>
            {/* the same sections the header's progress bar names, so the two
                describe the trip identically. "Your plan" is this page, so
                it reads as where you are rather than somewhere to go. */}
            {WIZARD_SECTIONS.map((s) => {
              const here = s.screens.includes("reveal");
              return (
                <button
                  key={s.label}
                  onClick={() => !here && goScreen?.(s.screens[0])}
                  disabled={here}
                  aria-current={here ? "page" : undefined}
                  className={`min-h-[38px] rounded-full border px-4 text-[0.8rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
                    here
                      ? "cursor-default border-ink bg-ink text-white"
                      : "cursor-pointer border-line bg-white text-ink-2 hover:border-ink hover:text-ink"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
            {/* the questions the path never asked, pre-answered and editable
                right where their answers are finally visible */}
            {goScreen && (
              <>
                <button
                  onClick={() => goScreen("origin")}
                  className="min-h-[38px] cursor-pointer rounded-full border border-dashed border-line bg-white px-4 text-[0.8rem] font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                >
                  {state.origin ? `From ${state.origin}` : "Add departure city"}
                </button>
                <button
                  onClick={() => goScreen("when")}
                  className="min-h-[38px] cursor-pointer rounded-full border border-dashed border-line bg-white px-4 text-[0.8rem] font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                >
                  {state.nights}N ·{" "}
                  {state.startDate ||
                    (state.flexMonth != null ? MONTHS[state.flexMonth] : "dates open")}
                </button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ---------- the trip, made personal ---------- */}
      {/* placeholder until sign-in lands: TRAVELLER_NAME is the only thing
          to swap for the real account name. */}
      <section className="container-x mt-8" aria-label="Your trip is booked">
        <motion.div
          {...SLIDE}
          className="grad-bg relative overflow-hidden rounded-[28px] px-6 py-7 text-white shadow-[0_24px_70px_-40px_rgba(22,18,31,0.45)] md:px-9 md:py-8"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-10 h-64 w-64 rounded-full bg-white/10"
          />
          <div className="relative flex flex-wrap items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-[1.4rem] font-bold backdrop-blur">
              {TRAVELLER.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="display text-[1.5rem] leading-[1.12] md:text-[2rem]">
                {TRAVELLER.name.split(" ")[0]}, {guide?.country ?? state.country} awaits
                you…
              </h2>
              <p className="mt-1 text-[0.9rem] leading-relaxed text-white/80">
                Your quote, built just for you — details below, nothing to fill in.
              </p>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {(
                  [
                    ["Name", TRAVELLER.name],
                    ["Email", TRAVELLER.email],
                    ["Phone", TRAVELLER.phone],
                  ] as const
                ).map(([k, v]) => (
                  <span
                    key={k}
                    className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[0.8rem] backdrop-blur"
                  >
                    <span className="font-mono text-[0.58rem] font-bold uppercase tracking-widest text-white/60">
                      {k}
                    </span>
                    <span className="font-semibold">{v}</span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[0.72rem] text-white/60">
                Pulled from your Zuumm account — used for your PDF, itinerary and
                expert handoff.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  crewLabel(state.crew),
                  `${state.tier}★ · ${state.nights} night${state.nights === 1 ? "" : "s"}`,
                  `${expCount} experience${expCount === 1 ? "" : "s"}`,
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-white/90 px-3 py-1 text-[0.78rem] font-bold text-ink"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------- body ---------- */}
      {/* the rail carries the map now, so it earns a little more width */}
      <div className="container-x mt-8 grid gap-10 lg:grid-cols-[1fr_23rem]">
        {/* ----- the journey, grouped by destination ----- */}
        <div className="mx-auto w-full max-w-[38rem] min-w-0">
          {/* fly in */}
          <FlightCard
            fromCity={state.origin || null}
            fromCode={originCode(state.origin)}
            toCity={arrivalGateway}
            toCode={arrivalCode}
            sub="International fares are quoted live when you book — never guessed."
            date={dateFor(1)}
            onChange={goScreen ? () => goScreen("origin") : undefined}
          />

          {plan.stops.map((stop, si) => {
            const t = si > 0 ? plan.transfers[si - 1] : undefined;
            const stopDays = tripDays.filter(
              (d) => d.day >= stop.dayStart && d.day <= stop.dayEnd
            );
            const used = stopDays.reduce((s, d) => s + d.usedHours, 0);
            const budget = stopDays.reduce((s, d) => s + d.budgetHours, 0);
            const pct = budget > 0 ? Math.min(100, (used / budget) * 100) : 0;
            const overflow = stopDays.some((d) => d.overflow);
            return (
              <div key={stop.city.name}>
                <FlowArrow
                  index={arrowIdx++}
                  label={t ? deEmoji(t.label) : undefined}
                  sub={t && t.cost > 0 ? `${inr(t.cost)} for the party, in your total` : undefined}
                />

                {/* destination block: the place, its capacity, its days */}
                <motion.section
                  {...SLIDE}
                  className="overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-[0_18px_50px_-30px_rgba(22,18,31,0.35)]"
                  aria-label={`${stop.city.name}, ${stop.nights} night${stop.nights > 1 ? "s" : ""}`}
                >
                  <header className="relative">
                    <CityPhoto
                      query={`${stop.city.name} ${state.country} ${stop.city.theme}`}
                      theme={stop.city.theme}
                      alt=""
                      className="aspect-[16/5]"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(22,18,31,0.55),transparent_65%)]"
                      />
                      <span className="absolute bottom-2.5 left-4 flex items-baseline gap-2">
                        <span className="display text-[1.3rem] text-white">{stop.city.name}</span>
                        <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-widest text-white/80">
                          {stop.dayStart === stop.dayEnd
                            ? `day ${stop.dayStart}`
                            : `days ${stop.dayStart}-${stop.dayEnd}`}
                        </span>
                      </span>
                    </CityPhoto>
                  </header>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-paper-2/50 px-4 py-2.5">
                    {/* nights stepper */}
                    <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-ink-2">
                      Nights
                      <span data-print-hide className="flex items-center gap-0.5 rounded-full bg-white px-1 py-0.5 shadow-sm">
                        <button
                          onClick={() => setStopNights(stop.city.name, stop.nights - 1)}
                          disabled={stop.nights <= 1}
                          aria-label={`One night fewer in ${stop.city.name}`}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="min-w-[1.3rem] text-center text-[0.85rem] font-bold text-ink">
                          {stop.nights}
                        </span>
                        <button
                          onClick={() => setStopNights(stop.city.name, stop.nights + 1)}
                          disabled={stop.nights >= state.nights}
                          aria-label={`One night more in ${stop.city.name}`}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          +
                        </button>
                      </span>
                    </span>

                    {/* capacity at a glance */}
                    <span className="flex min-w-[7rem] flex-1 items-center gap-2">
                      <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-paper-2">
                        <span
                          className={`block h-full rounded-full ${overflow ? "bg-coral" : pct > 85 ? "bg-sun" : "bg-mint"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="shrink-0 font-mono text-[0.62rem] font-semibold uppercase tracking-wide text-ink-3">
                        {overflow ? "over-packed" : `${Math.round(used)}h / ${Math.round(budget)}h`}
                      </span>
                    </span>

                    {/* no "Add experiences" here — every day below has its
                        own Add, which is where the choice actually lands */}
                  </div>

                  <div className="space-y-3 px-3 py-3">
                    {stopDays.map((day) => (
                      <DayCard
                        key={day.day}
                        day={day}
                        country={state.country}
                        date={dateFor(day.day)}
                        season={plan.season}
                        hotel={
                          day.day === stop.dayStart
                            ? {
                                name: stop.hotelName,
                                nights: stop.nights,
                                nightly: stop.hotelNightly,
                                tier: state.tier,
                                /* recommended until the traveller picks
                                   another from this city's real list */
                                recommended: !state.hotelOverride[stop.city.name],
                                alternatives: hotelsFor(stop.city, state.tier).length,
                              }
                            : undefined
                        }
                        onAdd={() => goExperiences?.(stop.city.name)}
                        onRemoveItem={removeAttraction}
                        onChangeHotel={() => cycleHotel(stop.city, stop.hotelName)}
                        transferModes={state.transferModes}
                        onTransferMode={setTransferMode}
                      />
                    ))}
                  </div>
                </motion.section>
              </div>
            );
          })}

          {/* fly home */}
          <FlowArrow index={arrowIdx++} />
          <FlightCard
            fromCity={departGateway}
            fromCode={departCode}
            toCity={state.origin || "home"}
            toCode={originCode(state.origin)}
            sub={`Day ${plan.days} — departure day, no plans booked against it.`}
            date={dateFor(plan.days)}
            home
            onChange={goScreen ? () => goScreen("origin") : undefined}
          />

          {/* share, pay, and what else the expert should sort. It lives in
              this column rather than below the grid so it lines up with the
              itinerary — and so the rail beside it keeps its sticky run all
              the way to the bottom of the page. */}
          <TripCheckout
            state={state}
            plan={plan}
            onPatch={patch}
            onPrint={printPlan}
          />
        </div>

        {/* ----- rail: map, price, actions ----- */}
        <aside className="min-w-0">
          <div
            className="no-scrollbar space-y-6 lg:sticky lg:top-32 lg:-m-2 lg:max-h-[calc(100vh-8.5rem-var(--wiz-foot,0px))] lg:overflow-y-auto lg:p-2"
          >
            {/* the map rides the rail: sticky, so the route stays in view
                the whole way down the itinerary */}
            <motion.section
              {...SLIDE}
              className="relative overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-[0_18px_50px_-30px_rgba(22,18,31,0.35)]"
              aria-label="Your route on the map"
            >
              <div className="pointer-events-none absolute left-3.5 top-3.5 z-10 rounded-xl bg-ink/70 px-3 py-2 backdrop-blur">
                <p className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-white">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                  </span>
                  Your route
                </p>
              </div>
              <TripMapAtlas plan={plan} origin={state.origin} compact />
              <p className="border-t border-line px-3.5 py-2.5 font-mono text-[0.58rem] uppercase leading-relaxed tracking-wider text-ink-3">
                Stops in visit order · nights, hotel and experiences at each ·
                day trips in gold
              </p>
            </motion.section>

            {/* price breakdown */}
            <motion.section {...SLIDE} className="plan-card overflow-hidden">
              <div className="border-b border-line bg-paper-2/60 px-4 py-3">
                <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-ink-3">
                  The full price
                </p>
              </div>
              <dl className="space-y-2 px-4 py-3.5 text-[0.85rem]">
                <Row label={`Hotels · ${state.tier}★ · ${plan.rooms} room${plan.rooms > 1 ? "s" : ""}`} value={inr(plan.hotelsTotal)} />
                <Row label={`Experiences × ${plan.travellers}`} value={inr(plan.activitiesTotal)} />
                <Row label="Transfers & day trips" value={inr(plan.transfersTotal)} />
                <Row label={`GST ${GST_PCT}%`} value={inr(plan.gst)} muted />
                <Row label={`TCS ${TCS_PCT}%`} value={inr(plan.tcs)} muted />
                <div className="border-t border-line pt-2">
                  <Row label="Total" value={inr(plan.grandTotal)} bold />
                  <Row label="Per person" value={inr(plan.perPerson)} muted />
                  <Row label="Hold it with 20%" value={inr(plan.depositDue)} muted />
                </div>
              </dl>
              <p className="border-t border-dashed border-line px-4 py-2.5 text-[0.7rem] leading-relaxed text-ink-3">
                {plan.seasonAssumed
                  ? "Priced at October (shoulder) rates until you pick dates."
                  : `Priced for ${plan.seasonLabel}.`}{" "}
                International flights excluded — quoted live at booking.
              </p>
            </motion.section>

            {/* "Before you book" is gone, but anything the engine can't
                make fit still has to be said — warnings and blocks only,
                quietly, with their one-tap fixes. Tips stay unsaid here. */}
            <SmartNotes
              inline
              notes={notes.filter((n) => n.severity !== "tip")}
              onApply={patch}
            />

            {/* actions */}
            <motion.div {...SLIDE} className="space-y-2" data-print-hide>
              <a
                href={waLink(state, plan)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("wizard_whatsapp", { total: plan.grandTotal })}
                className="btn-coral w-full"
              >
                Book this with an expert →
              </a>
              <button onClick={save} disabled={saved} className="btn-primary w-full">
                {saved ? (
                  <>
                    <Check size={15} /> Trip saved
                  </>
                ) : (
                  "Save my trip"
                )}
              </button>
              <p className="pt-1 text-center text-[0.7rem] text-ink-3">
                Free to save · your expert confirms every rate before you pay
              </p>
            </motion.div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------- cards */

/* A flight leg, named the way a ticket names it: both airports by code,
   with the cities underneath. The code for the destination end is the
   dataset's own City.code; the home end comes from ORIGIN_CODES. Either
   can be missing (an origin we don't hold a code for), and the card falls
   back to city names rather than showing a blank. */
function FlightCard({
  fromCity,
  fromCode,
  toCity,
  toCode,
  sub,
  date,
  home,
  onChange,
}: {
  fromCity: string | null;
  fromCode: string | null;
  toCity: string;
  toCode: string | null;
  sub: string;
  date: string | null;
  home?: boolean;
  /** edit the departure city — the only end of this leg the traveller sets */
  onChange?: () => void;
}) {
  return (
    <motion.article
      {...SLIDE}
      className="relative overflow-hidden rounded-[1.4rem] bg-ink px-5 py-4 text-white shadow-[0_24px_60px_-24px_rgba(22,18,31,0.55)]"
    >
      <div aria-hidden className="grain absolute inset-0" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-widest text-white/60">
            {home ? "Departure" : "Arrival"} {date && `· ${date}`}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[1.05rem] font-bold">
            <span
              aria-hidden
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ${home ? "-scale-x-100" : ""}`}
            >
              <Plane size={15} />
            </span>
            {fromCode && toCode ? (
              <span className="flex items-center gap-2">
                <span className="font-mono tracking-wider">{fromCode}</span>
                <span aria-hidden className="text-white/40">
                  →
                </span>
                <span className="font-mono tracking-wider">{toCode}</span>
              </span>
            ) : (
              <span>
                {fromCity ? `${fromCity} → ${toCity}` : `Fly to ${toCity}`}
              </span>
            )}
          </p>
          {fromCode && toCode && (
            <p className="mt-0.5 text-[0.8rem] font-semibold text-white/75">
              {fromCity} → {toCity}
            </p>
          )}
          <p className="mt-0.5 text-[0.76rem] leading-relaxed text-white/60">{sub}</p>
        </div>
        {onChange && (
          <button
            onClick={onChange}
            data-print-hide
            className="shrink-0 cursor-pointer rounded-full bg-coral px-3 py-1.5 text-[0.74rem] font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {fromCity ? "Change" : "Add"}
          </button>
        )}
      </div>
    </motion.article>
  );
}

function DayCard({
  day,
  country,
  date,
  season,
  hotel,
  onAdd,
  onRemoveItem,
  onChangeHotel,
  transferModes,
  onTransferMode,
}: {
  day: DayPlan;
  country: string;
  date: string | null;
  /** which season the trip prices at — experience fares move with it */
  season: Season;
  hotel?: {
    name: string;
    nights: number;
    nightly: number;
    tier: string;
    /** the engine's own first pick. Once hotels come from the database
        this becomes that source's recommendation instead. */
    recommended: boolean;
    /** how many other hotels this city has at this tier */
    alternatives: number;
  };
  onAdd: () => void;
  onRemoveItem?: (attractionId: string) => void;
  onChangeHotel?: () => void;
  /** per-activity transfer vehicle picks (absent → private car) */
  transferModes?: Record<string, "private" | "shared">;
  onTransferMode?: (attractionId: string, mode: "private" | "shared") => void;
}) {
  const pct = day.budgetHours > 0 ? Math.min(100, (day.usedHours / day.budgetHours) * 100) : 0;
  const barColor = day.overflow ? "bg-coral" : pct > 85 ? "bg-sun" : "bg-mint";
  const rows = day.items.filter((it) => it.type !== "transfer");

  return (
    /* The day is named down the left edge rather than across the top: with
       the label on top, one day's footer and the next day's header stacked
       into a single grey band and the boundary disappeared. A left rail
       gives every day an unmistakable spine. */
    <motion.article {...SLIDE} className="plan-card overflow-hidden">
      <div className="flex">
        <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 border-r border-line bg-paper-2/60 px-2 py-3.5 text-center sm:w-[5.5rem]">
          <span className="font-mono text-[0.6rem] font-bold uppercase tracking-widest text-ink-3">
            Day
          </span>
          <span className="display text-[1.5rem] leading-none text-ink">{day.day}</span>
          {date && (
            <span className="mt-0.5 text-[0.66rem] font-semibold leading-tight text-ink-3">
              {date}
            </span>
          )}
          <CityPhoto
            query={`${day.city} ${country}`}
            theme=""
            alt=""
            className="mt-1.5 h-7 w-7 shrink-0 rounded-full"
          />
          <span className="text-[0.66rem] font-bold leading-tight text-ink-2">{day.city}</span>
        </div>

        <div className="min-w-0 flex-1 px-4 py-3">
        {hotel && (
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-violet-soft/50 px-3 py-2.5">
            <p className="flex min-w-0 items-center gap-2 text-[0.82rem] text-ink">
              <Bed size={15} className="shrink-0 text-violet" />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate font-bold">{hotel.name}</span>
                  {hotel.recommended && (
                    <span className="shrink-0 rounded-full bg-mint/15 px-1.5 py-px font-mono text-[0.56rem] font-bold uppercase tracking-wider text-mint-deep">
                      Recommended
                    </span>
                  )}
                </span>
                <span className="block text-[0.72rem] text-ink-2">
                  {hotel.tier}★ · {hotel.nights} night{hotel.nights > 1 ? "s" : ""} ·{" "}
                  {inr(hotel.nightly)}/night
                </span>
              </span>
            </p>
            {onChangeHotel && hotel.alternatives > 1 && (
              <button
                onClick={onChangeHotel}
                data-print-hide
                className="shrink-0 cursor-pointer rounded-full bg-coral px-3 py-1.5 text-[0.74rem] font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              >
                Change
              </button>
            )}
          </div>
        )}

        <ul className="relative space-y-1">
          {rows.length > 1 && (
            <span
              aria-hidden
              className="absolute bottom-3 left-[15px] top-3 w-0.5 rounded-full bg-[linear-gradient(180deg,var(--coral),var(--violet))] opacity-25"
            />
          )}
          {rows.map((it, i) => (
            <ItemRow
              key={`item-${i}`}
              item={it}
              season={season}
              onRemove={onRemoveItem}
              transferMode={
                it.attractionId ? (transferModes?.[it.attractionId] ?? "private") : "private"
              }
              onTransferMode={onTransferMode}
            />
          ))}
          {rows.length === 0 && (
            <li className="text-[0.8rem] italic text-ink-3">
              Free day — beach, pool, wander. Or add something below.
            </li>
          )}
        </ul>

        <div className="mt-3 flex items-center justify-between gap-3">
          {day.budgetHours > 0 ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-paper-2">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="shrink-0 text-[0.68rem] font-semibold text-ink-3">
                {Math.round(day.usedHours)}h of {Math.round(day.budgetHours)}h
              </span>
            </div>
          ) : (
            <span />
          )}
          <button
            onClick={onAdd}
            data-print-hide
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-coral px-3 py-1.5 text-[0.74rem] font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        </div>
      </div>
    </motion.article>
  );
}

/* A small arrow that sketches itself between one thing and the next inside
   a day — the same journey language as the big inter-day arrows, scaled to
   a single hop between experiences. */
function ItemArrow() {
  const reduce = useReducedMotion();
  return (
    <li aria-hidden className="flex justify-center py-0.5">
      <svg width="14" height="22" viewBox="0 0 14 22" className="overflow-visible">
        <motion.path
          d="M7 1 V13"
          fill="none"
          stroke="var(--coral-deep)"
          strokeOpacity="0.85"
          strokeWidth="2"
          strokeLinecap="round"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        <motion.path
          d="M3 12 L7 18 L11 12"
          fill="none"
          stroke="var(--coral-deep)"
          strokeOpacity="0.85"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: -3 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ delay: reduce ? 0 : 0.25, duration: 0.2 }}
        />
      </svg>
    </li>
  );
}

/** "0.5h travel" reads worse than "30 min" — say it the way people do */
function fmtHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} min`;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

function ItemRow({
  item,
  season,
  onRemove,
  transferMode = "private",
  onTransferMode,
}: {
  item: DayItem;
  season: Season;
  onRemove?: (attractionId: string) => void;
  /** the transfer vehicle for this experience — private car by default */
  transferMode?: "private" | "shared";
  onTransferMode?: (attractionId: string, mode: "private" | "shared") => void;
}) {
  const [open, setOpen] = useState(false);
  /* the booked experience behind this row, when there is one — its real
     hours, price, transfer and what the fare does and doesn't cover */
  const detail = useMemo(() => {
    const a = item.attractionId ? attractionById(item.attractionId) : null;
    if (!a) return null;
    return {
      activity: a.activity,
      price: priceFor(a, season),
      travelHours: a.activity.travelHours ?? 0,
      transferCost: a.activity.transferCost ?? 0,
      /* the dataset prices a shared transfer only where the fare doesn't
         already include hotel pickup — so its absence is the signal */
      pickupIncluded: (a.activity.transferCost ?? 0) === 0,
    };
  }, [item.attractionId, season]);

  const Icon =
    item.type === "arrive" || item.type === "depart"
      ? Plane
      : item.type === "daytrip"
        ? Loop
        : Ticket;
  const tint =
    item.type === "daytrip" ? "bg-sun/15 text-sun" : item.type === "arrive" || item.type === "depart" ? "bg-teal-soft text-teal" : "bg-coral-soft text-coral";
  const removable =
    onRemove && item.attractionId && (item.type === "activity" || item.type === "daytrip");
  return (
    <li
      className={`group relative flex items-start gap-2.5 rounded-lg px-1 py-1.5 text-[0.85rem] ${
        item.overflow ? "bg-coral-soft/70" : ""
      }`}
    >
      <span
        className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tint}`}
        aria-hidden
      >
        {<Icon size={13} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug text-ink">{deEmoji(item.label)}</span>
        {item.sub && <span className="block text-[0.74rem] text-ink-2">{deEmoji(item.sub)}</span>}
        {item.overflow && (
          <span className="block text-[0.7rem] font-semibold text-coral-deep">
            Tight fit — this day is fuller than its waking hours
          </span>
        )}
        {detail && (
          <>
            {/* the facts the dataset actually holds for this experience */}
            <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.7rem] font-semibold text-ink-3">
              <span className="flex items-center gap-1">
                <Clock size={10} aria-hidden /> {detail.activity.start}–{detail.activity.end} ·{" "}
                {detail.activity.duration}
              </span>
              <span className="flex items-center gap-1 text-ink-2">
                <Ticket size={10} aria-hidden /> {inr(detail.price)} pp
              </span>
              {detail.travelHours > 0 && (
                <span className="flex items-center gap-1">
                  <Loop size={10} aria-hidden /> {fmtHours(detail.travelHours)} travel
                </span>
              )}
              {detail.pickupIncluded ? (
                <span className="flex items-center gap-1 text-mint-deep">
                  <Bed size={10} aria-hidden /> Hotel pickup included
                </span>
              ) : (
                /* the vehicle is a choice, made right here: private car by
                   default, one tap to the shared van instead */
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1">
                    <Bed size={10} aria-hidden />
                    {transferMode === "shared" ? "Shared van" : "Private car"} transfer{" "}
                    {inr(detail.transferCost)} pp
                  </span>
                  {onTransferMode && item.attractionId && (
                    <button
                      onClick={() =>
                        onTransferMode(
                          item.attractionId!,
                          transferMode === "private" ? "shared" : "private"
                        )
                      }
                      data-print-hide
                      aria-label={`Switch this transfer to a ${
                        transferMode === "private" ? "shared van" : "private car"
                      }`}
                      className="cursor-pointer rounded-full bg-violet-soft px-2 py-0.5 text-[0.64rem] font-bold text-violet-deep transition-[background-color,color] duration-100 hover:bg-violet hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet"
                    >
                      Change
                    </button>
                  )}
                </span>
              )}
            </span>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              data-print-hide
              className="mt-1 cursor-pointer text-[0.7rem] font-bold text-violet underline-offset-2 hover:underline"
            >
              {open ? "Hide details" : "What's included"}
            </button>
            {open && (
              <span className="mt-1.5 block rounded-xl bg-paper-2/70 px-3 py-2.5">
                {detail.activity.about && (
                  <span className="block text-[0.76rem] leading-relaxed text-ink-2">
                    {detail.activity.about}
                  </span>
                )}
                {detail.activity.inclusions.length > 0 && (
                  <>
                    <span className="mt-2 block font-mono text-[0.58rem] font-bold uppercase tracking-wider text-ink-3">
                      Included
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {detail.activity.inclusions.map((t) => (
                        <li key={t} className="flex gap-1.5 text-[0.74rem] leading-snug text-ink-2">
                          <Check size={11} className="mt-0.5 shrink-0 text-mint" aria-hidden />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {detail.activity.exclusions.length > 0 && (
                  <>
                    <span className="mt-2 block font-mono text-[0.58rem] font-bold uppercase tracking-wider text-ink-3">
                      Not included
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {detail.activity.exclusions.map((t) => (
                        <li key={t} className="flex gap-1.5 text-[0.74rem] leading-snug text-ink-3">
                          <span aria-hidden className="mt-1 shrink-0 text-[0.6rem]">
                            ×
                          </span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </span>
            )}
          </>
        )}
      </span>
      {typeof item.hours === "number" && item.hours > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-[0.7rem] font-semibold text-ink-3">
          <Clock size={11} /> ~{Math.round(item.hours)}h
        </span>
      )}
      {removable && (
        <button
          onClick={() => onRemove!(item.attractionId!)}
          aria-label={`Remove ${deEmoji(item.label)}`}
          data-print-hide
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-3 opacity-0 transition-opacity hover:bg-coral-soft hover:text-coral-deep focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-violet group-hover:opacity-100 max-lg:opacity-100"
        >
          ×
        </button>
      )}
    </li>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={`${bold ? "font-bold text-ink" : muted ? "text-ink-3" : "text-ink-2"} text-[0.82rem]`}>
        {label}
      </dt>
      <dd className={`${bold ? "display text-[1.05rem] text-ink" : muted ? "text-ink-3" : "font-semibold text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
