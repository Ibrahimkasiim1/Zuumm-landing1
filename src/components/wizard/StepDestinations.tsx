"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { StepProps } from "@/lib/planner/wizard";
import { HUB_BLURBS, dayTripsForHub } from "@/lib/planner/wizard";
import {
  CITIES,
  SATELLITES_BY_GATEWAY,
  gatewayOrderFor,
  type City,
} from "@/lib/planner/data";
import { nightlyRate, inr, VIBE_THEMES } from "@/lib/planner/engine";
import { VIBES } from "@/lib/planner/options";
import { catalogForRoute, sortRecommended, priceFor } from "@/lib/planner/attractions";
import { track } from "@/lib/analytics";
import CityPhoto from "@/components/plan/CityPhoto";
import {
  Bed,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Minus,
  Moon,
  Plus,
  Ticket,
  X,
} from "@/components/plan/icons";

/* Choose destinations.

   One decision per card: is this stop in the trip? The photo stays clean,
   the facts sit on one quiet meta line (experience count, nightly rate),
   and a short blurb says what the place is about. The engine pre-selects
   the best-fit stops for the traveller's vibe, so this page is a tweak,
   not a build. Selecting a stop reveals its nights stepper and day trips.
   Constraints (too many stops for the nights) surface in the bottom bar,
   never as a dialog. */

export default function StepDestinations({
  state,
  patch,
  derived,
  onBrowse,
}: StepProps & {
  /** desktop: open the side panel's experience browser for a stop */
  onBrowse?: (hub: string) => void;
}) {
  const reduce = useReducedMotion();
  const chosen = state.cities.filter((c) => !CITIES[c]?.gateway);

  /* a look at a stop's experiences: the side panel on desktop, a sheet on
     small screens where there is no panel */
  const [peek, setPeek] = useState<string | null>(null);
  const browse = (hub: string) => {
    track("exp_peek", { hub });
    if (onBrowse && window.matchMedia("(min-width: 1024px)").matches) onBrowse(hub);
    else setPeek(hub);
  };

  /* the page starts empty on purpose: no pre-selected cities — every stop
     in the route is one the traveller chose */
  const toggleHub = (hub: string) => {
    const selected = state.cities.includes(hub);
    if (selected) {
      // dropping a hub also drops its day-trip satellites and its night pin
      const sats = new Set(SATELLITES_BY_GATEWAY[hub] ?? []);
      const nightsOverride = { ...state.nightsOverride };
      delete nightsOverride[hub];
      patch({
        cities: state.cities.filter((c) => c !== hub && !sats.has(c)),
        nightsOverride,
        routeMode: "manual",
      });
    } else {
      patch({ cities: [...state.cities, hub], routeMode: "manual" });
    }
  };

  const toggleDayTrip = (sat: string) => {
    const selected = state.cities.includes(sat);
    patch({
      cities: selected ? state.cities.filter((c) => c !== sat) : [...state.cities, sat],
      satModes: { ...state.satModes, [sat]: "daytrip" },
    });
  };

  const setNights = (hub: string, value: number) => {
    patch({
      nightsOverride: { ...state.nightsOverride, [hub]: Math.max(1, value) },
    });
  };

  return (
    <div>
      <header>
        <p className="font-mono text-[0.66rem] font-bold uppercase tracking-widest text-violet">
          The last step before your plan is built
        </p>
        <h1 className="display mt-2 text-[1.9rem] leading-[1.08] text-ink md:text-[2.5rem]">
          Where in {state.country}?
        </h1>
        <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-ink-2">
          Pick the cities for this trip — tap a card to add it, then set the
          nights on each.
        </p>
      </header>

      {/* live route preview */}
      {chosen.length > 0 && (
        <motion.div
          layout={!reduce}
          className="mt-5 flex flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-white px-4 py-3"
        >
          <span className="mr-1 text-[0.72rem] font-bold uppercase tracking-wider text-ink-3">
            Your route
          </span>
          {derived.plan.stops.map((s, i) => (
            <span key={s.city.name} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={13} className="text-ink-3" aria-hidden />}
              <span className="flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-[0.8rem] font-semibold text-ink">
                {s.city.name}
                <span className="flex items-center gap-0.5 text-[0.72rem] font-bold text-ink-3">
                  <Moon size={10} /> {s.nights}
                </span>
              </span>
            </span>
          ))}
        </motion.div>
      )}

      {/* Hub cards — route advice arrives as notifications, not boxes here.
          Wrapping flex rather than a grid so a short list (Bali has two)
          sits centred in the space instead of hugging the left edge, and a
          long one still fills the rows. */}
      <div className="mt-6 flex flex-wrap justify-center gap-5">
        {gatewayOrderFor(state.country).map((hub) => {
          const city = CITIES[hub];
          const selected = state.cities.includes(hub);
          const stop = derived.plan.stops.find((s) => s.city.name === hub);
          const sats = SATELLITES_BY_GATEWAY[hub] ?? [];
          const expCount =
            city.activities.length +
            sats.reduce((n, s) => n + CITIES[s].activities.length, 0);
          const nightly = nightlyRate(city, state.tier, derived.plan.season);
          const trips = dayTripsForHub(hub);

          return (
            <motion.article
              key={hub}
              layout={!reduce}
              className={`w-[19rem] max-w-full overflow-hidden rounded-[1.5rem] border bg-white p-2 transition-shadow ${
                selected
                  ? "border-coral shadow-[0_18px_50px_-24px_rgba(255,59,92,0.35)]"
                  : "border-line hover:shadow-[0_14px_40px_-28px_rgba(22,18,31,0.35)]"
              }`}
            >
              <button
                onClick={() => toggleHub(hub)}
                aria-pressed={selected}
                className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              >
                {/* the hero carries the identity: name and place on the
                    photo, a slideshow of the stop and its real experiences */}
                <HubHero hub={hub} city={city} selected={selected} />

                <div className="px-2 pb-2 pt-2.5">
                  {/* every fact on one quiet line */}
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.76rem] font-semibold text-ink-3">
                    <span className="flex items-center gap-1">
                      <Ticket size={11} /> {expCount} experiences
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed size={11} /> from {inr(nightly)}/night
                    </span>
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[0.8rem] leading-relaxed text-ink-2">
                    {HUB_BLURBS[hub] ?? city.theme}
                  </p>
                </div>
              </button>

              {/* a proper door, not a footnote: browse this stop's catalog */}
              <button
                onClick={() => browse(hub)}
                className="mt-0.5 flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-violet-soft text-[0.8rem] font-bold text-violet-deep transition-[transform,background-color,color] duration-100 hover:bg-violet hover:text-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              >
                <Ticket size={14} /> Look at experiences
                <ChevronRight size={14} aria-hidden />
              </button>

              {/* selected: nights + day trips */}
              {selected && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 rounded-[1.1rem] bg-paper-2/60 px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-ink-2">
                      <Moon size={13} /> Nights here
                    </span>
                    <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 shadow-sm">
                      <button
                        onClick={() => setNights(hub, (stop?.nights ?? 1) - 1)}
                        disabled={(stop?.nights ?? 1) <= 1}
                        aria-label={`One night fewer in ${hub}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-[0.9rem] font-bold text-ink">
                        {stop?.nights ?? "–"}
                      </span>
                      <button
                        onClick={() => setNights(hub, (stop?.nights ?? 1) + 1)}
                        disabled={(stop?.nights ?? 0) >= state.nights}
                        aria-label={`One night more in ${hub}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {trips.length > 0 && (
                    <div className="mt-2.5">
                      <p className="text-[0.72rem] font-bold uppercase tracking-wider text-ink-3">
                        Day trips from here
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {trips.map((sat) => {
                          const s = CITIES[sat];
                          const on = state.cities.includes(sat);
                          return (
                            <button
                              key={sat}
                              onClick={() => toggleDayTrip(sat)}
                              aria-pressed={on}
                              title={`${s.hopLabel} from ${hub} — back the same evening`}
                              className={`flex min-h-[36px] cursor-pointer items-center gap-1 rounded-full border px-3 text-[0.76rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
                                on
                                  ? "border-coral bg-coral-soft text-coral-deep"
                                  : "border-line bg-white text-ink-2 hover:border-ink-3"
                              }`}
                            >
                              {on && <Check size={12} />}
                              {s.name}
                              <span className="font-normal text-ink-3">· {s.hopLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.article>
          );
        })}
      </div>

      {/* ----- the experiences peek: a ranked list, one stop at a time ----- */}
      <AnimatePresence>
        {peek && (
          <ExperiencesPeek
            hub={peek}
            vibes={state.vibes}
            season={derived.plan.season}
            onClose={() => setPeek(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* The card's hero, the reference way: the photo owns the card — vibe pill
   top-left, the add/remove toggle top-right, dots, then the city's name
   and country on the image itself. The photo rotates through the city and
   its top real experiences; each experience frame is captioned with its
   name (honest dots, honest frames), and rotation stops entirely under
   reduced motion. */
function HubHero({
  hub,
  city,
  selected,
}: {
  hub: string;
  city: City;
  selected: boolean;
}) {
  const reduce = useReducedMotion();
  const vibe = cityVibe(city);
  /* dataset-derived and stable per hub — safe to rebuild each render */
  const top = sortRecommended(catalogForRoute([hub]), [], [hub]).slice(0, 3);
  const slides = [
    {
      key: "__city",
      query: `${city.name} ${city.country ?? "Thailand"} ${city.theme}`,
      theme: city.theme,
      label: null as string | null,
    },
    ...top.map((a) => ({
      key: a.id,
      query: `${a.activity.name} ${a.city} ${a.country}`,
      theme: a.cityTheme,
      label: a.activity.name,
    })),
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % slides.length), 4200);
    return () => window.clearInterval(id);
  }, [reduce, slides.length]);
  const current = slides[i] ?? slides[0];

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.05rem]">
      {slides.map((s, si) => (
        <div
          key={s.key}
          aria-hidden={si !== i}
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: si === i ? 1 : 0 }}
        >
          <CityPhoto query={s.query} theme={s.theme} alt="" className="h-full w-full" />
        </div>
      ))}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/80 to-transparent"
      />
      {vibe && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-wider text-ink backdrop-blur">
          {vibe}
        </span>
      )}
      {/* the card is the button; this names what tapping it does */}
      <span
        aria-hidden
        className={`absolute right-2.5 top-2.5 flex min-h-[32px] items-center gap-1.5 rounded-full px-3 text-[0.72rem] font-bold shadow transition-colors ${
          selected
            ? "bg-coral text-white"
            : "bg-white/90 text-ink backdrop-blur group-hover:bg-ink group-hover:text-white"
        }`}
      >
        {selected ? <Check size={13} /> : <Plus size={13} />}
        {selected ? "Selected" : "Select"}
      </span>
      <span className="absolute inset-x-3.5 bottom-3.5 block">
        {current.label && (
          <span className="mb-1 block truncate text-center text-[0.66rem] font-semibold text-white/85">
            {current.label}
          </span>
        )}
        {slides.length > 1 && (
          <span aria-hidden className="mb-2 flex justify-center gap-1">
            {slides.map((s, si) => (
              <span
                key={s.key}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  si === i ? "w-4 bg-white" : "w-1.5 bg-white/55"
                }`}
              />
            ))}
          </span>
        )}
        <span className="block text-[1.05rem] font-bold leading-tight text-white">
          {city.name}
        </span>
        <span className="mt-1 flex items-center gap-1 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-white/80">
          <MapPin size={10} aria-hidden /> {city.country ?? "Thailand"}
        </span>
      </span>
    </div>
  );
}

/** the vibe this city answers to, via the engine's own theme keywords */
function cityVibe(city: City): string | null {
  for (const v of VIBES) {
    for (const kw of VIBE_THEMES[v.key] ?? []) {
      if (city.theme.toLowerCase().includes(kw.toLowerCase())) return v.short;
    }
  }
  return null;
}

/* What travellers actually do around a stop — the dataset's experiences,
   ranked for this traveller's vibe, as a quick modern list. Read-only by
   design: picking happens later, once the plan exists. */
function ExperiencesPeek({
  hub,
  vibes,
  season,
  onClose,
}: {
  hub: string;
  vibes: string[];
  season: "low" | "shoulder" | "peak";
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const all = sortRecommended(catalogForRoute([hub]), vibes, [hub]);
  const shown = all.slice(0, 8);
  const city = CITIES[hub];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-[2px] sm:items-center"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="peek-title"
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? false : { y: 28, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={reduce ? undefined : { y: 28, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.21, 0.6, 0.35, 1] }}
        className="max-h-[84vh] w-full max-w-md overflow-y-auto rounded-[1.4rem] bg-white shadow-[0_40px_120px_-30px_rgba(22,18,31,0.5)]"
      >
        <div className="relative">
          <CityPhoto
            query={`${city?.name ?? hub} ${city?.country ?? ""} ${city?.theme ?? ""}`}
            theme={city?.theme ?? ""}
            alt=""
            className="aspect-[16/6]"
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(22,18,31,0.6),transparent_65%)]"
            />
            <span className="absolute bottom-2.5 left-4 right-12">
              <span className="block font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white/70">
                {vibes.length > 0 ? "Ranked for your style" : "What travellers do here"}
              </span>
              <span id="peek-title" className="block text-[1.1rem] font-bold text-white">
                Experiences around {hub}
              </span>
            </span>
          </CityPhoto>
          <button
            onClick={onClose}
            aria-label="Close experiences peek"
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition-colors hover:bg-ink"
          >
            <X size={15} />
          </button>
        </div>

        <ol className="divide-y divide-line px-5">
          {shown.map((a, i) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <span className="w-5 shrink-0 font-mono text-[0.78rem] font-bold text-ink-3">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.86rem] font-semibold text-ink">
                  {a.activity.name}
                </span>
                <span className="mt-0.5 flex items-center gap-2.5 text-[0.72rem] text-ink-3">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {a.activity.duration}
                  </span>
                  {a.city !== hub && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {a.city}
                    </span>
                  )}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[0.8rem] font-bold text-ink">
                {inr(priceFor(a, season))}
                <span className="text-[0.62rem] font-semibold text-ink-3">/pp</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="border-t border-line px-5 py-3 text-[0.76rem] text-ink-3">
          {all.length > shown.length && (
            <span className="font-semibold text-ink-2">
              +{all.length - shown.length} more here.{" "}
            </span>
          )}
          You&rsquo;ll pick your favourites after we build your plan.
        </p>
      </motion.div>
    </motion.div>
  );
}
