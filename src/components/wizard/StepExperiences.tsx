"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SmartNote, StepProps } from "@/lib/planner/wizard";
import { notesAt, tryPin } from "@/lib/planner/wizard";
import SmartNotes from "./SmartNotes";
import {
  catalogForCountry,
  catalogForRoute,
  sortRecommended,
  priceFor,
  type Attraction,
} from "@/lib/planner/attractions";
import { contentFor, isZuummPick } from "@/lib/planner/content";
import { inr } from "@/lib/planner/engine";
import { track } from "@/lib/analytics";
import CityPhoto from "@/components/plan/CityPhoto";
import {
  AlertTriangle,
  Check,
  Clock,
  Loop,
  MapPin,
  Moon,
  Pin,
  Plus,
  Search,
  Sparkle,
  X,
} from "@/components/plan/icons";

/* Add experiences.

   One search bar on top, one filter rail on the left, one grid. The card
   itself is the door — tap anywhere on it for the whole picture (photo,
   why, inclusions, timing) with the Add decision pinned to the sheet's
   bottom edge. On the card only one quick action lives: Add ⇄ Added, the
   same toggle everywhere.

   The rail holds every lever — area, length, price, sort — as quiet radio
   lists; the grid opens vibe-ranked so the default view is already "picked
   for you". Adding runs through tryPin(): a pick that physically can't fit
   is blocked with the arithmetic and a one-tap repair, not silently
   accepted. */

type Sort = "recommended" | "price" | "duration";

const FLAT_CAP = 12;

const LENGTHS = [
  { key: "any", label: "Any length", test: (_h: number) => true },
  { key: "short", label: "Under 3 hrs", test: (h: number) => h < 3 },
  { key: "half", label: "Half day · 3–6 hrs", test: (h: number) => h >= 3 && h <= 6 },
  { key: "full", label: "Full day · 6 hrs +", test: (h: number) => h > 6 },
] as const;
type LengthKey = (typeof LENGTHS)[number]["key"];

const PRICES = [
  { key: "any", label: "Any price", test: (_p: number) => true },
  { key: "low", label: "Under ₹2,000", test: (p: number) => p < 2000 },
  { key: "mid", label: "₹2,000 – ₹5,000", test: (p: number) => p >= 2000 && p <= 5000 },
  { key: "high", label: "₹5,000 +", test: (p: number) => p > 5000 },
] as const;
type PriceKey = (typeof PRICES)[number]["key"];

const SORTS: { key: Sort; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "price", label: "Price · low to high" },
  { key: "duration", label: "Duration · short first" },
];

export default function StepExperiences({ state, patch, derived, notes, expCity }: StepProps) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string>("all");
  const [length, setLength] = useState<LengthKey>("any");
  const [price, setPrice] = useState<PriceKey>("any");
  const [sort, setSort] = useState<Sort>("recommended");
  const [blockNote, setBlockNote] = useState<SmartNote | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [detail, setDetail] = useState<Attraction | null>(null);
  const reduce = useReducedMotion();

  const routeCities = derived.plan.input.cities;
  const manual = state.routeMode === "manual" && state.cities.length > 0;

  /* scoped mode: opened from one destination block on the plan — only that
     stop's world (its experiences plus reachable day trips) */
  const catalog = useMemo(() => {
    if (expCity) return catalogForRoute([expCity]);
    return manual ? catalogForRoute(routeCities) : catalogForCountry(state.country);
  }, [expCity, manual, routeCities, state.country]);

  /* what's picked within this scope, for the running total */
  const scopedPicks = useMemo(() => {
    if (!expCity) return [];
    const keys = new Set(catalog.map((a) => a.key));
    return state.pinned.filter((k) => keys.has(k));
  }, [expCity, catalog, state.pinned]);
  const scopedTotal = useMemo(
    () =>
      scopedPicks.reduce((sum, k) => {
        const a = catalog.find((x) => x.key === k);
        return sum + (a ? priceFor(a, derived.plan.season) : 0);
      }, 0),
    [scopedPicks, catalog, derived.plan.season]
  );

  /* what the plan already contains (auto picks + pins) */
  const inPlan = useMemo(() => {
    const set = new Set<string>();
    for (const s of derived.plan.stops) {
      for (const a of s.activities) set.add(`${s.city.name}|${a.activity.name}`);
      for (const t of s.dayTrips)
        for (const a of t.activities) set.add(`${t.city.name}|${a.activity.name}`);
    }
    return set;
  }, [derived.plan]);

  const pinned = useMemo(() => new Set(state.pinned), [state.pinned]);

  const areas = useMemo(() => [...new Set(catalog.map((a) => a.gateway))], [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const lengthDef = LENGTHS.find((l) => l.key === length) ?? LENGTHS[0];
    const priceDef = PRICES.find((p) => p.key === price) ?? PRICES[0];
    let list = catalog.filter((a) => {
      if (area !== "all" && a.gateway !== area && a.city !== area) return false;
      if (!lengthDef.test(a.hours)) return false;
      if (!priceDef.test(priceFor(a, derived.plan.season))) return false;
      if (
        q &&
        !`${a.activity.name} ${a.city} ${a.activity.about}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    if (sort === "recommended") list = sortRecommended(list, state.vibes, routeCities);
    else if (sort === "price")
      list = [...list].sort(
        (a, b) => priceFor(a, derived.plan.season) - priceFor(b, derived.plan.season)
      );
    else list = [...list].sort((a, b) => a.hours - b.hours);
    return list;
  }, [catalog, query, area, length, price, sort, state.vibes, routeCities, derived.plan.season]);

  const filtersActive =
    area !== "all" ||
    length !== "any" ||
    price !== "any" ||
    sort !== "recommended" ||
    query.trim() !== "";
  const resetFilters = () => {
    setArea("all");
    setLength("any");
    setPrice("any");
    setSort("recommended");
    setQuery("");
    setShowAll(false);
  };

  /* ----- add / remove ----- */
  const add = (a: Attraction) => {
    const verdict = tryPin(state, a);
    if (!verdict.ok && verdict.note) {
      setBlockNote(verdict.note);
      return;
    }
    track("exp_added", { city: a.city, scoped: !!expCity });
    patch({
      pinned: [...state.pinned, a.key],
      removed: state.removed.filter((k) => k !== a.key),
    });
  };
  const unpin = (a: Attraction) => {
    patch({ pinned: state.pinned.filter((k) => k !== a.key) });
  };
  const dropAuto = (a: Attraction) => {
    patch({ removed: [...state.removed, a.key] });
  };

  const cardProps = (a: Attraction) => ({
    a,
    vibes: state.vibes,
    season: derived.plan.season,
    pinned: pinned.has(a.key),
    inPlan: inPlan.has(a.key),
    onAdd: () => add(a),
    onUnpin: () => unpin(a),
    onDrop: () => dropAuto(a),
    onDetails: () => setDetail(a),
  });

  return (
    <div className="mx-auto max-w-[80rem]">
      <header>
        <p className="eyebrow text-ink-3">
          {expCity ? `Add experiences · ${expCity}` : "Experiences"}
        </p>
        <h1 className="display mt-2 text-[1.9rem] leading-[1.08] text-ink md:text-[2.5rem]">
          {expCity ? `What can't you miss in ${expCity}?` : "What can't you miss?"}
        </h1>
        <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-ink-2">
          {expCity
            ? "Everything here is reachable from this stop — tap a card for the full picture."
            : "Tap a card for the full picture — picks land in your plan instantly."}
        </p>
        {expCity && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[0.8rem] font-semibold text-ink-2">
            <Check size={13} className="text-mint" />
            {scopedPicks.length} pick{scopedPicks.length === 1 ? "" : "s"} here
            {scopedPicks.length > 0 && (
              <span className="font-mono font-bold text-ink">
                {inr(scopedTotal)}/person
              </span>
            )}
          </p>
        )}
      </header>

      {/* feasibility advice, right under the trip it's about */}
      <SmartNotes inline notes={notesAt(notes, "picks")} onApply={patch} />

      {/* ----- search, front and centre ----- */}
      <div className="relative mt-6">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
          placeholder={
            expCity
              ? `Search ${catalog.length} experiences in ${expCity}…`
              : `Search ${catalog.length} experiences…`
          }
          aria-label="Search experiences"
          className="min-h-[54px] w-full rounded-2xl bg-white pl-12 pr-4 text-[0.95rem] font-medium text-ink shadow-[0_10px_30px_-24px_rgba(22,18,31,0.4)] outline-none ring-1 ring-line placeholder:text-ink-3 focus:ring-2 focus:ring-violet/40"
        />
      </div>

      {/* mobile filters: areas as pills, sort as a select */}
      <div className="mt-3 flex items-center gap-2 lg:hidden">
        {areas.length > 1 && (
          <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
            <FilterPill active={area === "all"} onClick={() => setArea("all")}>
              All areas
            </FilterPill>
            {areas.map((c) => (
              <FilterPill key={c} active={area === c} onClick={() => setArea(c)}>
                {c}
              </FilterPill>
            ))}
          </div>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort experiences"
          className="ml-auto min-h-[40px] shrink-0 cursor-pointer rounded-xl bg-paper-2 px-3 text-[0.8rem] font-semibold text-ink-2 outline-none focus:ring-2 focus:ring-violet/30"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10">
        {/* ----- the filter rail: every lever, one quiet column ----- */}
        <aside className="hidden lg:block" aria-label="Filter experiences">
          <div
            className="no-scrollbar sticky top-32 -m-2 space-y-5 overflow-y-auto p-2"
            style={{ maxHeight: "calc(100vh - 8.5rem - var(--wiz-foot, 0px))" }}
          >
            <div className="flex items-baseline justify-between">
              <p className="text-[0.9rem] font-bold text-ink">Filters</p>
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="cursor-pointer text-[0.76rem] font-semibold text-coral-deep underline-offset-2 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            {areas.length > 1 && (
              <RailGroup label="Area">
                <RailRow active={area === "all"} onClick={() => setArea("all")}>
                  All areas
                </RailRow>
                {areas.map((c) => (
                  <RailRow key={c} active={area === c} onClick={() => setArea(c)}>
                    {c}
                  </RailRow>
                ))}
              </RailGroup>
            )}
            <RailGroup label="Length">
              {LENGTHS.map((l) => (
                <RailRow key={l.key} active={length === l.key} onClick={() => setLength(l.key)}>
                  {l.label}
                </RailRow>
              ))}
            </RailGroup>
            <RailGroup label="Price per person">
              {PRICES.map((p) => (
                <RailRow key={p.key} active={price === p.key} onClick={() => setPrice(p.key)}>
                  {p.label}
                </RailRow>
              ))}
            </RailGroup>
            <RailGroup label="Sort by">
              {SORTS.map((s) => (
                <RailRow key={s.key} active={sort === s.key} onClick={() => setSort(s.key)}>
                  {s.label}
                </RailRow>
              ))}
            </RailGroup>
          </div>
        </aside>

        {/* ----- one grid, best matches first ----- */}
        <div className="min-w-0">
          <p className="text-[0.8rem] font-semibold text-ink-3">
            {filtered.length} experience{filtered.length === 1 ? "" : "s"}
            {expCity
              ? ` around ${expCity}`
              : area !== "all"
                ? ` around ${area}`
                : ""}
            {sort === "recommended" && filtered.length > 0 ? " · best matches first" : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center">
              <p className="text-[0.9rem] font-semibold text-ink-2">
                Nothing matches that combination.
              </p>
              <button onClick={resetFilters} className="btn-secondary mx-auto mt-3 flex">
                Clear the filters
              </button>
            </div>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {(showAll ? filtered : filtered.slice(0, FLAT_CAP)).map((a) => (
                  <ExpCompactCard key={a.id} {...cardProps(a)} />
                ))}
              </div>
              {!showAll && filtered.length > FLAT_CAP && (
                <button
                  onClick={() => setShowAll(true)}
                  className="btn-secondary mx-auto mt-6 flex"
                >
                  Show all {filtered.length} experiences
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ----- hard-block dialog ----- */}
      <AnimatePresence>
        {blockNote && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBlockNote(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="block-title"
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={reduce ? undefined : { y: 24, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.21, 0.6, 0.35, 1] }}
              className="w-full max-w-md rounded-[1.4rem] border border-coral/30 bg-white p-5 shadow-[0_30px_80px_-20px_rgba(22,18,31,0.4)]"
            >
              <p
                id="block-title"
                className="flex items-start gap-2 text-[1rem] font-bold text-ink"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-coral-deep" />
                {blockNote.title}
              </p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-2">{blockNote.detail}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {blockNote.actions?.map((act) => (
                  <button
                    key={act.label}
                    onClick={() => {
                      patch(act.patch);
                      setBlockNote(null);
                    }}
                    className="btn-coral"
                  >
                    {act.label}
                  </button>
                ))}
                <button onClick={() => setBlockNote(null)} className="btn-secondary">
                  Choose something else
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----- experience details, one at a time ----- */}
      <AnimatePresence>
        {detail && (
          <ExpDetailModal
            a={detail}
            season={derived.plan.season}
            pinned={pinned.has(detail.key)}
            inPlan={inPlan.has(detail.key)}
            vibes={state.vibes}
            onAdd={() => add(detail)}
            onUnpin={() => unpin(detail)}
            onDrop={() => dropAuto(detail)}
            onClose={() => setDetail(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------- cards */

/* the full state-aware action for the detail sheet */
export function ExpAction({
  a,
  pinned,
  inPlan,
  onAdd,
  onUnpin,
  onDrop,
  size = "sm",
}: {
  a: Attraction;
  pinned: boolean;
  inPlan: boolean;
  onAdd: () => void;
  onUnpin: () => void;
  onDrop: () => void;
  size?: "sm" | "lg";
}) {
  const h = size === "lg" ? "min-h-[46px]" : "min-h-[38px]";
  const autoAdded = inPlan && !pinned;
  if (pinned)
    return (
      <button
        onClick={onUnpin}
        className={`${h} flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-coral text-[0.8rem] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet`}
      >
        <Check size={14} /> Added — tap to remove
      </button>
    );
  if (autoAdded)
    return (
      <div className="flex w-full gap-1.5">
        <button
          onClick={onAdd}
          title="We added this to your starter plan — keep it even if the plan reshuffles"
          className={`${h} flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-ink bg-white text-[0.76rem] font-bold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet`}
        >
          <Pin size={12} /> Keep it
        </button>
        <button
          onClick={onDrop}
          aria-label={`Remove ${a.activity.name} from the plan`}
          className={`${h} flex w-[46px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-ink-3 transition-colors hover:border-coral hover:text-coral-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet`}
        >
          <X size={14} />
        </button>
      </div>
    );
  return (
    <button
      onClick={onAdd}
      className={`${h} flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-ink text-[0.8rem] font-bold text-white transition-colors hover:bg-coral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet`}
    >
      <Plus size={14} /> Add to trip
    </button>
  );
}

/* the card's one quick action: Add ⇄ Added (auto picks say Keep) */
function QuickAction({
  a,
  pinned,
  inPlan,
  onAdd,
  onUnpin,
}: {
  a: Attraction;
  pinned: boolean;
  inPlan: boolean;
  onAdd: () => void;
  onUnpin: () => void;
}) {
  const autoAdded = inPlan && !pinned;
  if (pinned)
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnpin();
        }}
        aria-label={`Remove ${a.activity.name} from your trip`}
        className="flex min-h-[34px] shrink-0 cursor-pointer items-center gap-1 rounded-full bg-coral px-3 text-[0.74rem] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
      >
        <Check size={12} /> Added
      </button>
    );
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      aria-label={
        autoAdded
          ? `Keep ${a.activity.name} in your trip`
          : `Add ${a.activity.name} to your trip`
      }
      title={autoAdded ? "In your starter plan — keep it even if the plan reshuffles" : undefined}
      className="flex min-h-[34px] shrink-0 cursor-pointer items-center gap-1 rounded-full border border-line bg-white px-3 text-[0.74rem] font-bold text-ink transition-colors hover:border-coral hover:text-coral-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
    >
      {autoAdded ? (
        <>
          <Pin size={11} /> Keep
        </>
      ) : (
        <>
          <Plus size={12} /> Add
        </>
      )}
    </button>
  );
}

/* The shelf card: the whole surface opens the detail sheet; one quick
   action (Add ⇄ Added) rides the price row. Everything else — about,
   inclusions, times, tags — lives in the sheet, so the shelf stays
   scannable: photo, name, one meta line, price. */
export function ExpCompactCard({
  a,
  season,
  pinned,
  inPlan,
  vibes,
  onAdd,
  onUnpin,
  onDrop, // kept in the contract for the detail sheet; the card itself stays two-state
  onDetails,
}: {
  a: Attraction;
  season: "low" | "shoulder" | "peak";
  pinned: boolean;
  inPlan: boolean;
  vibes: string[];
  onAdd: () => void;
  onUnpin: () => void;
  onDrop: () => void;
  onDetails: () => void;
}) {
  void onDrop;
  const price = priceFor(a, season);
  const zuummPick = isZuummPick(a, vibes);
  const autoAdded = inPlan && !pinned;

  return (
    <article
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.2rem] border bg-white transition-all hover:-translate-y-0.5 ${
        pinned
          ? "border-coral shadow-[0_16px_44px_-26px_rgba(255,59,92,0.4)]"
          : "border-line hover:shadow-[0_14px_40px_-28px_rgba(22,18,31,0.3)]"
      }`}
    >
      <button
        onClick={onDetails}
        className="flex flex-1 cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet"
        aria-label={`Details for ${a.activity.name}`}
      >
        <CityPhoto
          query={`${a.city} ${a.country} ${a.activity.name}`}
          theme={a.cityTheme}
          alt={`${a.activity.name} in ${a.city}`}
          className="aspect-[4/3]"
        >
          {zuummPick && (
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink/85 px-2 py-0.5 text-[0.62rem] font-bold text-white backdrop-blur">
              <Sparkle size={9} /> Zuumm&rsquo;s pick
            </span>
          )}
          {pinned && (
            <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white shadow">
              <Check size={13} />
            </span>
          )}
          {autoAdded && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-ink backdrop-blur">
              in plan
            </span>
          )}
        </CityPhoto>

        <div className="px-3 pt-2.5">
          <h3 className="line-clamp-2 text-[0.86rem] font-bold leading-snug text-ink">
            {a.activity.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.7rem] text-ink-3">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {a.activity.duration}
            </span>
            {a.city !== a.gateway && (
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {a.city}
              </span>
            )}
          </p>
        </div>
      </button>

      <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-3 pb-3 pt-2">
        <p className="min-w-0 truncate text-[0.82rem] font-bold text-ink">
          {inr(price)}
          <span className="text-[0.66rem] font-semibold text-ink-3">/pp</span>
        </p>
        <QuickAction a={a} pinned={pinned} inPlan={inPlan} onAdd={onAdd} onUnpin={onUnpin} />
      </div>
    </article>
  );
}

/* The whole picture, one experience at a time — where the density went.
   The Add decision is pinned to the sheet's bottom edge, always visible. */
export function ExpDetailModal({
  a,
  season,
  pinned,
  inPlan,
  vibes,
  onAdd,
  onUnpin,
  onDrop,
  onClose,
}: {
  a: Attraction;
  season: "low" | "shoulder" | "peak";
  pinned: boolean;
  inPlan: boolean;
  vibes: string[];
  onAdd: () => void;
  onUnpin: () => void;
  onDrop: () => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const content = contentFor(a);
  const price = priceFor(a, season);

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
        aria-labelledby="exp-detail-title"
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? false : { y: 28, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={reduce ? undefined : { y: 28, opacity: 0 }}
        transition={{ duration: 0.26, ease: [0.21, 0.6, 0.35, 1] }}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[1.4rem] bg-white shadow-[0_40px_120px_-30px_rgba(22,18,31,0.5)]"
      >
        <div className="relative">
          <CityPhoto
            query={`${a.city} ${a.country} ${a.activity.name}`}
            theme={a.cityTheme}
            alt={`${a.activity.name} in ${a.city}`}
            className="aspect-[16/8]"
          />
          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition-colors hover:bg-ink"
          >
            <X size={15} />
          </button>
          <div className="absolute bottom-2.5 left-3 flex flex-wrap gap-1.5">
            {a.dayTripable && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[0.64rem] font-bold text-ink backdrop-blur">
                <Loop size={10} /> day trip from {a.gateway}
              </span>
            )}
            {a.overnightRequired && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[0.64rem] font-bold text-ink backdrop-blur">
                <Moon size={10} /> needs a night
              </span>
            )}
          </div>
        </div>

        <div className="p-5 pb-3">
          <p className="flex items-center gap-1 text-[0.74rem] font-semibold text-ink-3">
            <MapPin size={11} /> {a.city}
            {a.city !== a.gateway && <> · via {a.gateway}</>}
          </p>
          <h3 id="exp-detail-title" className="mt-1 text-[1.15rem] font-bold leading-snug text-ink">
            {a.activity.name}
          </h3>
          <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-2">{content.why}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-ink-3">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {a.activity.duration}
            </span>
            <span>
              {a.activity.start}&ndash;{a.activity.end}
            </span>
            {content.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-violet-soft px-2 py-0.5 text-[0.66rem] font-semibold text-violet-deep"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-2">{a.activity.about}</p>

          <div className="mt-4 space-y-2 rounded-xl bg-paper-2/70 p-3.5 text-[0.78rem] leading-relaxed">
            {a.activity.inclusions.length > 0 && (
              <p className="text-ink-2">
                <span className="font-bold text-mint">Included:</span>{" "}
                {a.activity.inclusions.join(" · ")}
              </p>
            )}
            {a.activity.exclusions.length > 0 && (
              <p className="text-ink-2">
                <span className="font-bold text-coral-deep">Not included:</span>{" "}
                {a.activity.exclusions.join(" · ")}
              </p>
            )}
            {a.hopLabel && a.city !== a.gateway && (
              <p className="text-ink-3">
                {a.hopLabel} from {a.gateway}, back the same evening
              </p>
            )}
          </div>
        </div>

        {/* the decision, always in reach */}
        <div className="sticky bottom-0 flex items-center gap-4 border-t border-line bg-white/95 px-5 py-3.5 backdrop-blur">
          <p className="shrink-0 leading-tight">
            <span className="block text-[1.05rem] font-bold text-ink">{inr(price)}</span>
            <span className="block text-[0.66rem] font-semibold text-ink-3">per person</span>
          </p>
          <div className="min-w-0 flex-1">
            <ExpAction
              a={a}
              pinned={pinned}
              inPlan={inPlan}
              onAdd={onAdd}
              onUnpin={onUnpin}
              onDrop={onDrop}
              size="lg"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[36px] shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-[0.78rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
        active ? "bg-ink text-white" : "bg-paper-2 text-ink-2 hover:bg-line"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------- filter rail */

function RailGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <p className="px-2.5 pb-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-3">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function RailRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[36px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 text-left text-[0.82rem] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet ${
        active
          ? "bg-paper-2 font-bold text-ink"
          : "font-medium text-ink-2 hover:bg-paper-2/60 hover:text-ink"
      }`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {active && <Check size={13} className="shrink-0 text-coral" />}
    </button>
  );
}
