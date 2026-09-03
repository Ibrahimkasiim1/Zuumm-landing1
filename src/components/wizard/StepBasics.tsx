"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SmartNote, StepProps } from "@/lib/planner/wizard";
import {
  ORIGINS,
  countryPatch,
  isAnswered,
  markAnswered,
  notesAt,
} from "@/lib/planner/wizard";
import { CREWS, MONTHS, VIBES, crewForParty } from "@/lib/planner/options";
import {
  DESTINATIONS,
  LIVE_DESTINATIONS,
  searchDestinations,
} from "@/lib/planner/destinations";
import { guideByDestinationName, guideImage } from "@/lib/guides";
import SmartNotes from "./SmartNotes";
import DateRangePicker from "./DateRangePicker";
import {
  Calendar,
  Check,
  MapPin,
  Minus,
  Plus,
  Search,
  Sparkle,
  Users,
  X,
} from "@/components/plan/icons";
import { Users as UsersIcon } from "@/components/Icons";

/* Trip details fields. Who's going and Where to are whole pages of their
   own (WizardRoot renders WhoField / ToField directly under the page H1);
   StepBasicsWhen pairs the two lighter questions — when, and what kind of
   trip — on one airy page. Origin and exact dates stay smart defaults,
   edited later from the plan. */


/** Trip details, last page — when, and what kind of trip. */
export function StepBasicsWhen({ state, patch, notes }: StepProps) {
  return (
    <div>
      <WhenField state={state} patch={patch} notes={notesAt(notes, "when")} />
      <div aria-hidden className="my-9 border-t border-line" />
      <FromField state={state} patch={patch} />
      <div aria-hidden className="my-9 border-t border-line" />
      <StyleField state={state} patch={patch} notes={notesAt(notes, "style")} />
    </div>
  );
}

export default function StepBasics({ state, patch, notes }: StepProps) {
  return (
    <div className="space-y-8">
      <WhoField state={state} patch={patch} notes={notesAt(notes, "who")} />
      <ToField state={state} patch={patch} notes={notesAt(notes, "to")} />
      <WhenField state={state} patch={patch} notes={notesAt(notes, "when")} />
      <StyleField state={state} patch={patch} notes={notesAt(notes, "style")} />
    </div>
  );
}

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* In the focus flow each field IS the screen and the H1 already asks
          the question, so the small label row would just repeat it. The
          shell sets data-focus-flow; the label renders only in multi-field
          contexts (the legacy all-in-one StepBasics). */}
      <div className="mb-2.5 flex items-baseline justify-between gap-3 [main[data-focus-flow]_&]:hidden">
        <p className="flex items-center gap-1.5 text-[0.82rem] font-bold uppercase tracking-wider text-ink">
          <span aria-hidden>{icon}</span>
          {label}
        </p>
        {hint && <p className="text-[0.74rem] text-ink-3">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

type FieldProps = Pick<StepProps, "state" | "patch"> & { notes?: SmartNote[] };

/* ---------------------------------------------- the grouped-row language

   Every question on the prefs page speaks one form: a hairline-divided
   group of rows, label on the left, a single control on the right — a
   text box, or a value between − and +. One shape to learn, then three
   answers to give. */

function RowGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(22,18,31,0.04)]">
      {children}
    </div>
  );
}

/* ------------------------------------------------- where from */

export function FromField({ state, patch }: FieldProps) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  /* the metros the rate card prices first, narrowed as the user types —
     a designed dropdown, because the native one can't be styled */
  const q = state.origin.trim().toLowerCase();
  const matches = ORIGINS.filter((c) => c.toLowerCase().includes(q));
  const suggestions = matches.length && !(matches.length === 1 && matches[0].toLowerCase() === q)
    ? matches
    : [];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (c: string) => {
    patch({ origin: c });
    setOpen(false);
    setHi(-1);
  };

  return (
    <Field label="Departing from" icon={<MapPin size={14} />} hint="for your flight legs">
      <RowGroup>
        {/* the header already asks the question — the row is just the answer */}
        <div className="relative px-4 py-3" ref={wrapRef}>
          <label className={`${BOX} w-full cursor-text focus-within:border-ink-3`}>
            <Search size={15} aria-hidden className="shrink-0 text-ink-3" />
            <input
              value={state.origin}
              onChange={(e) => {
                patch({ origin: e.target.value });
                setOpen(true);
                setHi(-1);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (!open || !suggestions.length) {
                  if (e.key === "Escape") setOpen(false);
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHi((h) => (h + 1) % suggestions.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHi((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
                } else if (e.key === "Enter" && hi >= 0) {
                  e.preventDefault();
                  pick(suggestions[hi]);
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              role="combobox"
              aria-controls="origin-suggestions"
              aria-expanded={open && suggestions.length > 0}
              aria-autocomplete="list"
              placeholder="Type your city"
              aria-label="Departure city"
              className="min-h-[44px] w-full bg-transparent font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-3"
            />
          </label>

          <AnimatePresence>
            {open && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, scale: 0.98, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.14, ease: [0.21, 0.6, 0.35, 1] }}
                style={{ transformOrigin: "top left" }}
                id="origin-suggestions"
                role="listbox"
                aria-label="Metro suggestions"
                className="absolute inset-x-4 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-[0_28px_70px_-24px_rgba(22,18,31,0.35)]"
              >
                {suggestions.map((c, i) => (
                  <li key={c}>
                    <button
                      /* pointerdown so the pick lands before the input blurs */
                      onPointerDown={(e) => {
                        e.preventDefault();
                        pick(c);
                      }}
                      role="option"
                      aria-selected={state.origin === c}
                      className={`flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-left text-[0.9rem] font-semibold transition-colors ${
                        i === hi ? "bg-paper-2 text-ink" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                      }`}
                    >
                      <MapPin size={13} className="shrink-0 text-ink-3" />
                      {c}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </RowGroup>
    </Field>
  );
}

/* ------------------------------------------------- where to */

/** The card photo, taken from the destination's own guide so a newly-live
    destination arrives with the right picture instead of inheriting a
    hand-kept map's fallback. The two originals stay as the backstop for a
    destination that goes live before its guide is written. */
const FALLBACK_PHOTOS: Record<string, string> = {
  Thailand: "/travel/thailand.jpg",
  Bali: "/travel/bali.jpg",
};

function destinationPhoto(name: string): string {
  const guide = guideByDestinationName(name);
  return guide ? guideImage(guide.slug, "hero") : (FALLBACK_PHOTOS[name] ?? "");
}

/* The destinations we lead with as cards: every one the planner can price
   end to end. This is derived, not a hand-kept list — a destination added
   to the registry as `live` shows up here on its own, and the grid below
   flows to however many there are. Everything not yet live stays one
   search away. */
const FEATURED_DESTINATIONS = LIVE_DESTINATIONS;

export function ToField({ state, patch, notes }: FieldProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const chosen = isAnswered(state, "country");

  const results = useMemo(() => {
    const list = searchDestinations(query);
    return [...list].sort((a, b) => a.name.localeCompare(b.name)).slice(0, query ? 8 : 6);
  }, [query]);

  return (
    <Field label="Going to" icon={<MapPin size={14} />}>
      {/* the headline destinations, as photo cards. Nothing reads as picked
          until the traveller picks it — the working country underneath is
          the engine's, not an answer they gave. */}
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(14rem,1fr))]">
        {FEATURED_DESTINATIONS.map((d) => {
          const active = chosen && state.country === d.name;
          return (
            <button
              key={d.name}
              onClick={() =>
                patch({ ...countryPatch(state, d.name), ...markAnswered(state, "country") })
              }
              aria-pressed={active}
              className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
                active
                  ? "border-coral shadow-[0_18px_44px_-22px_rgba(255,59,92,0.45)]"
                  : "border-line hover:-translate-y-0.5 hover:border-ink-3"
              }`}
            >
              <span className="relative block aspect-[16/8]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
                <img
                  src={destinationPhoto(d.name)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgba(22,18,31,0.55),transparent_60%)]"
                />
                {active && (
                  <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white shadow">
                    <Check size={13} />
                  </span>
                )}
                <span className="absolute bottom-2 left-3 right-3 block truncate text-[0.98rem] font-bold text-white">
                  {d.emoji} {d.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="mt-2 cursor-pointer text-[0.82rem] font-semibold text-ink-3 underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        {`Somewhere else? Search ${DESTINATIONS.length} destinations`}
      </button>

      {expanded && (
        <div className="mt-2 rounded-2xl border border-line bg-white p-2.5">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${DESTINATIONS.length} destinations`}
              aria-label="Search destinations"
              className="min-h-[44px] w-full rounded-xl bg-paper-2 pl-9 pr-3 text-[0.88rem] text-ink outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-violet/30"
            />
          </div>
          <ul className="mt-2 space-y-0.5">
            {results.map((d) => (
              <li key={d.name}>
                <button
                  onClick={() => {
                    // switching country clears route-shaped state (it names
                    // the old country's cities)
                    patch({
                      ...countryPatch(state, d.name),
                      ...markAnswered(state, "country"),
                    });
                    setExpanded(false);
                    setQuery("");
                  }}
                  className={`flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-[0.88rem] transition-colors hover:bg-paper-2 ${
                    chosen && state.country === d.name ? "font-semibold text-ink" : "text-ink-2"
                  }`}
                >
                  <span className="flex-1">{d.name}</span>
                  {chosen && state.country === d.name && <Check size={14} className="text-ink" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SmartNotes inline notes={notes ?? []} onApply={patch} />
    </Field>
  );
}

/* ------------------------------------------------- when + how long */

/** the image-language field shell: a soft contained box the control sits in */
const BOX =
  "flex min-h-[46px] items-center gap-2 rounded-xl border border-line bg-paper-2/50 px-3.5 text-[0.9rem] font-semibold text-ink transition-colors duration-150 hover:border-ink-3";

/** "29 Aug – 4 Sep 2026" — start + nights, the month elided when shared */
const fmtRange = (isoStart: string, nights: number): string => {
  const [y, m, d] = isoStart.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1, d + nights));
  const sameMonth = end.getUTCMonth() === m - 1 && end.getUTCFullYear() === y;
  const from = sameMonth ? `${d}` : `${d} ${MONTHS[m - 1]}`;
  return `${from} – ${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
};

export function WhenField({ state, patch, notes }: FieldProps) {
  const hasDate = Boolean(state.startDate);
  /* one question, one row: the dates. The calendar is the only length
     control — picking both ends sets the nights, so there is no separate
     stepper to disagree with it. The count reads out above the row.
     Leaving the dates unset still prices — the engine falls back to
     shoulder-season rates at the default length. */
  const [calOpen, setCalOpen] = useState(false);

  return (
    <Field label="When" icon={<Calendar size={14} />}>
      {/* the length, once there is one — never a number they didn't choose */}
      <p className="mb-2.5 text-[0.86rem] text-ink-2">
        {hasDate ? (
          <>
            <span className="font-bold text-ink">
              {state.nights} night{state.nights === 1 ? "" : "s"}
            </span>
            {" — your dates below."}
          </>
        ) : (
          "Pick your travel dates — the nights come from the range you choose."
        )}
      </p>

      <RowGroup>
        <div className="flex min-h-[64px] items-center justify-between gap-4 px-4">
          <span className="shrink-0 py-2 leading-tight">
            <span className="block text-[0.9rem] font-semibold text-ink">Dates</span>
          </span>
          <span className="relative flex items-center gap-2">
            <button
              onClick={() => setCalOpen((o) => !o)}
              aria-expanded={calOpen}
              aria-haspopup="dialog"
              className={`${BOX} cursor-pointer ${hasDate ? "" : "text-ink-3"}`}
            >
              <Calendar size={15} className="shrink-0 text-ink-3" />
              {hasDate ? (
                <span className="font-mono text-[0.85rem]">
                  {fmtRange(state.startDate, state.nights)}
                  {state.dateFlex > 0 && (
                    <span className="text-ink-3"> · ±{state.dateFlex}d</span>
                  )}
                </span>
              ) : (
                "Choose dates"
              )}
            </button>
            {hasDate && (
              <button
                onClick={() => patch({ startDate: "", dateFlex: 0 })}
                aria-label="Clear the dates"
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-paper-2 text-ink-3 transition-[transform,color] duration-100 hover:text-ink active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              >
                <X size={12} />
              </button>
            )}
            <AnimatePresence>
              {calOpen && (
                <DateRangePicker
                  value={state.startDate}
                  nights={state.nights}
                  flex={state.dateFlex}
                  onFlex={(days) => patch({ dateFlex: days })}
                  /* the range sets the length too — baseNights moves with
                     it, since this is the traveller stating the trip, not
                     a downstream fix adding nights */
                  onPickRange={(d, n) =>
                    patch({
                      startDate: d,
                      nights: n,
                      baseNights: n,
                      flexMonth: null,
                    })
                  }
                  onClear={() => patch({ startDate: "", dateFlex: 0 })}
                  onClose={() => setCalOpen(false)}
                />
              )}
            </AnimatePresence>
          </span>
        </div>
      </RowGroup>

      <SmartNotes inline notes={notes ?? []} onApply={patch} />
    </Field>
  );
}

/* ------------------------------------------------- who */

/* little people, not glyphs: filled heads over stroked shoulders so each
   card reads as the actual party at a glance */
type ArtProps = { size?: number };

const ArtSolo = ({ size = 19 }: ArtProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="6.8" r="3" fill="currentColor" />
    <path
      d="M5.6 19.8c.6-4.4 3-6.7 6.4-6.7s5.8 2.3 6.4 6.7"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>
);

const ArtCouple = ({ size = 19 }: ArtProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="7.4" cy="8" r="3" fill="currentColor" />
    <circle cx="16.6" cy="8" r="3" fill="currentColor" />
    <path
      d="M1.9 20.4c.5-3.9 2.4-5.9 5.5-5.9s5 2 5.5 5.9M11.1 20.4c.5-3.9 2.4-5.9 5.5-5.9s5 2 5.5 5.9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ArtFamily = ({ size = 19 }: ArtProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="6.4" cy="7" r="2.9" fill="currentColor" />
    <circle cx="17.6" cy="7" r="2.9" fill="currentColor" />
    <path
      d="M1.4 19c.5-3.6 2.2-5.5 5-5.5s4.5 1.9 5 5.5M12.6 19c.5-3.6 2.2-5.5 5-5.5s4.5 1.9 5 5.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="14.6" r="2.2" fill="currentColor" />
    <path
      d="M8.4 22c.4-2.9 1.8-4.4 3.6-4.4s3.2 1.5 3.6 4.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ArtFriends = ({ size = 19 }: ArtProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="4.9" cy="9.2" r="2.5" fill="currentColor" />
    <circle cx="19.1" cy="9.2" r="2.5" fill="currentColor" />
    <circle cx="12" cy="7.2" r="3" fill="currentColor" />
    <path
      d="M1 19.6c.4-3.2 1.7-4.9 3.9-4.9M23 19.6c-.4-3.2-1.7-4.9-3.9-4.9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6.2 21.4c.5-4.1 2.4-6.2 5.8-6.2s5.3 2.1 5.8 6.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CREW_ART: Record<string, React.ComponentType<{ size?: number }>> = {
  solo: ArtSolo,
  couple: ArtCouple,
  family: ArtFamily,
  friends: ArtFriends,
};

export function WhoField({ state, patch, notes }: FieldProps) {
  /* the counters own the truth; the crew card follows what they say, so the
     two halves of this question can never contradict each other */
  const chosen = isAnswered(state, "crew");
  /* touching the counters is itself an answer to "who's going" */
  const setParty = (p: { adults?: number; children?: number; infants?: number }) => {
    const adults = p.adults ?? state.adults;
    const children = p.children ?? state.children;
    patch({
      ...p,
      crew: crewForParty(adults, children),
      ...markAnswered(state, "crew"),
    });
  };

  return (
    <Field label="Who's going" icon={<Users size={14} />}>
      <div className="grid grid-cols-2 gap-2.5">
        {CREWS.map((c) => {
          const active = chosen && state.crew === c.key;
          const Art = CREW_ART[c.key] ?? UsersIcon;
          return (
            <button
              key={c.key}
              onClick={() =>
                /* one tap fills the whole party — the counters refine it */
                patch({
                  crew: c.key,
                  adults: c.adults,
                  children: c.children,
                  infants: c.infants,
                  ...markAnswered(state, "crew"),
                })
              }
              aria-pressed={active}
              className={`group flex min-h-[76px] cursor-pointer items-center gap-3.5 rounded-2xl border-2 px-4 py-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
                active
                  ? "border-ink bg-ink text-white shadow-[0_14px_36px_-18px_rgba(22,18,31,0.55)]"
                  : "border-line bg-white text-ink-2 hover:-translate-y-0.5 hover:border-ink-3"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  active ? "bg-coral text-white" : "bg-paper-2 text-ink-2 group-hover:bg-coral-soft group-hover:text-coral"
                }`}
              >
                <Art size={19} />
              </span>
              <span>
                <span className={`block text-[0.95rem] font-bold ${active ? "text-white" : "text-ink"}`}>
                  {c.label}
                </span>
                <span className={`block text-[0.74rem] ${active ? "text-white/70" : "text-ink-3"}`}>
                  {c.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* three counters, one row each width — never a ragged wrap */}
      <div className="mt-4 rounded-2xl border border-line bg-white px-4 py-3.5">
        <p className="mb-3 text-[0.8rem] font-semibold text-ink-3">Exact headcount</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          <Counter
            label="Adults"
            hint="12+"
            value={state.adults}
            min={1}
            max={9}
            onChange={(v) => setParty({ adults: v })}
          />
          <Counter
            label="Children"
            hint="2–12"
            value={state.children}
            min={0}
            max={6}
            onChange={(v) => setParty({ children: v })}
          />
          <Counter
            label="Infants"
            hint="under 2"
            value={state.infants}
            min={0}
            max={4}
            onChange={(v) => setParty({ infants: v })}
          />
        </div>
      </div>

      <SmartNotes inline notes={notes ?? []} onApply={patch} />
    </Field>
  );
}

function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  /** age band, shown under the label ("12+", "2–12", "under 2") */
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="leading-tight">
        <span className="block text-[0.85rem] font-semibold text-ink-2">{label}</span>
        {hint && <span className="block text-[0.68rem] text-ink-3">{hint}</span>}
      </span>
      <div className="flex items-center gap-1 rounded-full bg-paper-2 px-1 py-1">
        <RoundBtn label={`One ${label.toLowerCase()} fewer`} onClick={() => onChange(Math.max(min, value - 1))}>
          <Minus size={13} />
        </RoundBtn>
        <span className="min-w-[1.6rem] text-center text-[0.88rem] font-bold text-ink">{value}</span>
        <RoundBtn label={`One ${label.toLowerCase()} more`} onClick={() => onChange(Math.min(max, value + 1))}>
          <Plus size={13} />
        </RoundBtn>
      </div>
    </div>
  );
}

/* ------------------------------------------------- trip style */

/* What each vibe means for the trip — the photo that shows it, a felt line
   on the card, a routing fragment the live sentence composes from, and an
   ambient glow the page answers with. Every fragment is something the
   engine genuinely does with the pick (vibes steer routing and experience
   suggestions).

   The photos live in /public/vibes, cut down from the guide library's
   credited originals (see vibes/CREDITS.json) — copied rather than linked
   because several guide files are named for a place they don't actually
   show, so a path into that library is not a stable promise about what
   the picture is. */
const VIBE_META: Record<
  string,
  {
    photo: string;
    alt: string;
    /** object-position, where the interesting part isn't the centre */
    focus?: string;
    sub: string;
    dna: string;
    glow: string;
  }
> = {
  beaches: {
    photo: "/vibes/beaches.jpg",
    alt: "A white sandbank curving into turquoise shallows, a palm islet beyond",
    focus: "center 62%",
    sub: "Slow mornings, island afternoons",
    dna: "route you beach-first, island to island",
    glow: "rgba(255,174,26,0.16)",
  },
  culture: {
    photo: "/vibes/culture.jpg",
    alt: "A golden stupa strung with prayer flags against a blue sky",
    sub: "Old towns, temples before the heat",
    dna: "start your days early, at the temples",
    glow: "rgba(102,51,242,0.12)",
  },
  food: {
    photo: "/vibes/food.jpg",
    alt: "A narrow night alley lit by a red paper lantern and neon signs",
    sub: "Night markets, street-side counters",
    dna: "hold your evenings for the night markets",
    glow: "rgba(255,59,92,0.12)",
  },
  nature: {
    photo: "/vibes/nature.jpg",
    alt: "Rice terraces stepping down green hillsides at golden hour",
    sub: "Waterfalls, green hills, wildlife",
    dna: "work in green detours and wildlife days",
    glow: "rgba(15,163,107,0.14)",
  },
  adventure: {
    photo: "/vibes/adventure.jpg",
    alt: "Climbers roped down a waterfall in a jungle canyon",
    /* the climbers are up at the lip — a centred crop finds only foliage */
    focus: "center 22%",
    sub: "Reefs, ridges, one big rush a day",
    dna: "plan one adrenaline moment per stop",
    glow: "rgba(14,116,144,0.14)",
  },
  wellness: {
    photo: "/vibes/wellness.jpg",
    alt: "Two empty sun loungers on a deck above still turquoise water",
    sub: "Spa days, unhurried pacing",
    dna: "keep the pace gentle, with room to breathe",
    glow: "rgba(225,29,72,0.10)",
  },
};

/* where each vibe's glow lives behind the grid — fixed homes, so a pick
   lights the same corner every time */
const GLOW_SPOTS: Record<string, string> = {
  beaches: "left-[8%] top-[-10%]",
  culture: "right-[6%] top-[-6%]",
  food: "left-[38%] top-[30%]",
  nature: "left-[-4%] bottom-[-12%]",
  adventure: "right-[-4%] bottom-[-8%]",
  wellness: "right-[34%] bottom-[-14%]",
};

/** the picks, spoken back as one plan — in the order they were chosen */
function vibeSentence(picked: string[]): string | null {
  const frags = picked.map((k) => VIBE_META[k]?.dna).filter(Boolean).slice(0, 3);
  if (!frags.length) return null;
  if (frags.length === 1) return `We'll ${frags[0]}.`;
  if (frags.length === 2) return `We'll ${frags[0]}, and ${frags[1]}.`;
  return `We'll ${frags[0]}, ${frags[1]} — and ${frags[2]}.`;
}

export function StyleField({ state, patch, notes }: FieldProps) {
  const reduce = useReducedMotion();
  const toggle = (key: string) =>
    patch({
      vibes: state.vibes.includes(key)
        ? state.vibes.filter((v) => v !== key)
        : [...state.vibes, key],
    });

  const sentence = vibeSentence(state.vibes);

  return (
    <Field
      label="What kind of trip"
      icon={<Sparkle size={14} />}
      hint="pick as many as you like"
    >
      <div className="relative">
        {/* the page answers each pick: that vibe's colour warms the air
            behind the grid — colour only, so reduced motion is respected */}
        <div aria-hidden className="pointer-events-none absolute -inset-6">
          {VIBES.map((v) => (
            <span
              key={v.key}
              className={`absolute h-44 w-44 rounded-full blur-3xl transition-opacity duration-500 ${GLOW_SPOTS[v.key] ?? "left-1/2 top-1/2"}`}
              style={{
                backgroundColor: VIBE_META[v.key]?.glow,
                opacity: state.vibes.includes(v.key) ? 1 : 0,
              }}
            />
          ))}
        </div>

        {/* each vibe shows itself: the photo is the card, the words ride a
            scrim across its left so they stay legible on any picture */}
        <div className="relative grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {VIBES.map((v) => {
            const meta = VIBE_META[v.key];
            const active = state.vibes.includes(v.key);
            return (
              <motion.button
                key={v.key}
                onClick={() => toggle(v.key)}
                aria-pressed={active}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className={`group relative flex min-h-[7rem] cursor-pointer items-end overflow-hidden rounded-2xl text-left transition-[transform,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
                  active
                    ? "shadow-[0_18px_44px_-20px_rgba(255,59,92,0.5)]"
                    : "hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-22px_rgba(22,18,31,0.45)]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
                <img
                  src={meta?.photo ?? ""}
                  alt=""
                  loading="lazy"
                  style={{ objectPosition: meta?.focus ?? "center" }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_right,rgba(22,18,31,0.86),rgba(22,18,31,0.46)_54%,rgba(22,18,31,0.04))]"
                />
                {/* the chosen ones wear a coral edge, drawn over the photo */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 rounded-2xl ring-inset transition-all duration-150 ${
                    active ? "ring-2 ring-coral" : "ring-1 ring-white/15"
                  }`}
                />
                <span className="relative z-10 min-w-0 px-4 py-3.5">
                  <span className="block text-[0.95rem] font-bold text-white">
                    {v.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.74rem] text-white/75">
                    {meta?.sub}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-[transform,background-color,color] duration-150 ${
                    active
                      ? "bg-coral text-white"
                      : "bg-white/20 text-white/80 backdrop-blur group-hover:bg-white/35"
                  }`}
                >
                  {active ? <Check size={15} /> : <Plus size={15} />}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* the picks, spoken back — proof the choice steers the plan */}
        <AnimatePresence mode="wait" initial={false}>
          {sentence && (
            <motion.p
              key={sentence}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -3 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="relative mt-4 flex items-start gap-2 px-1 text-[0.88rem] font-medium leading-relaxed text-ink-2"
            >
              <Sparkle size={14} aria-hidden className="mt-1 shrink-0 text-violet" />
              <span>{sentence}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <SmartNotes inline notes={notes ?? []} onApply={patch} />
    </Field>
  );
}

/* ------------------------------------------------- primitives */

function RoundBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-ink-2 shadow-sm transition-[transform,color] duration-100 hover:text-ink active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
    >
      {children}
    </button>
  );
}
