"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CityPhoto from "@/components/plan/CityPhoto";
import { catalogForRoute, priceFor, sortRecommended } from "@/lib/planner/attractions";
import { inr, type Season } from "@/lib/planner/engine";
import { tryPin, type SmartNote, type WizardState } from "@/lib/planner/wizard";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Sparkle,
  Star,
  X,
} from "@/components/plan/icons";

/* The panel's experience browser: opened by a card's "Look at experiences",
   it takes over the sidebar instead of covering the page. One experience
   sits enlarged on top — real photo, real duration, real price, the
   dataset's own description — and the rest of the stop's catalog rides a
   horizontal rail underneath; tapping a card swaps it into the spotlight.

   "I like this experience" is a real commitment: it pins the pick into the
   plan the engine builds next. Every like runs through the same guard the
   plan uses (tryPin) — if the pick can't fit the trip, the refusal and its
   one-tap fix appear right here instead of a silent failure. */

export default function ExperienceBrowser({
  hub,
  state,
  season,
  initialFocus = null,
  onPatch,
  onBack,
}: {
  hub: string;
  state: WizardState;
  season: Season;
  /** land straight on one experience's detail (a tapped showcase card) */
  initialFocus?: string | null;
  onPatch: (p: Partial<WizardState>) => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const list = useMemo(
    () => sortRecommended(catalogForRoute([hub]), state.vibes, [hub]),
    [hub, state.vibes]
  );
  /* two levels: null = the full grid, an id = that experience's story */
  const [focusId, setFocusId] = useState<string | null>(initialFocus);
  /* How this browser was entered decides what Back means. Opened straight
     onto one experience — a card tapped in the main panel — it belongs to
     that panel, so Back returns there instead of stranding the traveller
     in a list they never asked to see. Opened as a list, Back steps out of
     the story and back into that list. Captured once: navigating the rail
     doesn't change where the traveller came from. */
  const [enteredOnStory] = useState(() => initialFocus !== null);
  const focused = focusId ? (list.find((a) => a.id === focusId) ?? null) : null;
  /* a like the trip can't absorb — the guard's note, shown in place */
  const [blockNote, setBlockNote] = useState<SmartNote | null>(null);

  if (!list.length) return null;

  const liked = focused ? state.pinned.includes(focused.key) : false;

  const toggleLike = () => {
    if (!focused) return;
    if (liked) {
      onPatch({ pinned: state.pinned.filter((k) => k !== focused.key) });
      setBlockNote(null);
      return;
    }
    const verdict = tryPin(state, focused);
    if (verdict.ok) {
      onPatch({
        pinned: [...state.pinned, focused.key],
        removed: state.removed.filter((k) => k !== focused.key),
      });
      setBlockNote(null);
    } else {
      setBlockNote(verdict.note ?? null);
    }
  };

  const focus = (id: string) => {
    setFocusId(id);
    setBlockNote(null);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {/* top bar: one step back on the left; in detail, the commitment right */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => (focused && !enteredOnStory ? setFocusId(null) : onBack())}
          className="flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-[0.82rem] font-semibold text-ink-2 transition-[transform,color,border-color] duration-100 hover:border-ink-3 hover:text-ink active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          <ArrowLeft size={14} /> Back
        </button>
        {!focused && (
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-ink-3">
            {list.length} experiences
          </p>
        )}
        {focused && <button
          onClick={toggleLike}
          aria-pressed={liked}
          className={`flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full px-4 text-[0.82rem] font-bold transition-[transform,background-color,color] duration-100 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
            liked
              ? "bg-coral text-white shadow-[0_10px_28px_-12px_rgba(255,59,92,0.6)]"
              : "border border-line bg-white text-ink hover:border-coral hover:text-coral-deep"
          }`}
        >
          {liked ? <Check size={14} /> : <Star size={14} />}
          {liked ? "Liked — in your plan" : "I like this experience"}
        </button>}
      </div>

      {/* ---- the grid: every experience around this stop, tappable ---- */}
      {!focused && (
        <div className="mt-4">
          <h2 className="text-[1.05rem] font-bold leading-snug text-ink">
            Experiences around {hub}
          </h2>
          <p className="mt-1 text-[0.78rem] leading-relaxed text-ink-2">
            {state.vibes.length
              ? "Ranked for your style — tap one for the full story."
              : "Tap one for the full story."}
          </p>
          <div className="mt-3 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))]">
            {list.map((a) => {
              const isLiked = state.pinned.includes(a.key);
              return (
                <button
                  key={a.id}
                  onClick={() => focus(a.id)}
                  className="group w-full cursor-pointer rounded-[1.35rem] border border-line bg-white p-1.5 text-left transition-[border-color,transform] duration-100 hover:border-ink-3 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                >
                  <span className="relative block aspect-square w-full overflow-hidden rounded-[0.95rem]">
                    <CityPhoto
                      query={`${a.activity.name} ${a.city} ${a.country}`}
                      theme={a.cityTheme}
                      alt=""
                      className="absolute inset-0 h-full w-full"
                    />
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 font-mono text-[0.6rem] font-bold text-ink backdrop-blur">
                      <Clock size={10} aria-hidden />~{Math.round(a.hours)}h
                    </span>
                    {isLiked && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-white">
                        <Check size={12} />
                      </span>
                    )}
                  </span>
                  <span className="block px-1 pb-1 pt-1.5">
                    <span className="line-clamp-2 block text-[0.78rem] font-bold leading-snug text-ink">
                      {a.activity.name}
                    </span>
                    <span className="mt-1 flex items-center gap-1 font-mono text-[0.56rem] font-semibold uppercase tracking-widest text-ink-3">
                      <MapPin size={9} aria-hidden /> {a.city}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[0.7rem] leading-relaxed text-ink-3">
            <Sparkle size={11} className="shrink-0 text-violet" aria-hidden />
            Open one and tap &ldquo;I like this experience&rdquo; — likes are
            folded into your plan.
          </p>
        </div>
      )}

      {/* ---- the spotlight ---- */}
      {focused && (<>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={focused.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.21, 0.6, 0.35, 1] }}
          className="mt-4"
        >
          <div className="relative overflow-hidden rounded-[1.2rem]">
            <CityPhoto
              query={`${focused.activity.name} ${focused.city} ${focused.country}`}
              theme={focused.cityTheme}
              alt=""
              className="aspect-[16/10] w-full"
            />
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[0.62rem] font-bold text-ink backdrop-blur">
              <Clock size={11} aria-hidden /> {focused.activity.duration}
            </span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <h2 className="text-[1.12rem] font-bold leading-snug text-ink">
              {focused.activity.name}
            </h2>
            <p className="shrink-0 pt-0.5 font-mono text-[0.95rem] font-bold text-ink">
              {inr(priceFor(focused, season))}
              <span className="text-[0.62rem] font-semibold text-ink-3">/pp</span>
            </p>
          </div>
          <p className="mt-1 flex items-center gap-1 font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-ink-3">
            <MapPin size={11} aria-hidden /> {focused.city}
            {focused.hopLabel && ` · ${focused.hopLabel} from ${focused.gateway}`}
          </p>
          <p className="mt-2.5 text-[0.84rem] leading-relaxed text-ink-2">
            {focused.activity.about}
          </p>

          {/* honest details, straight from the dataset */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-[1.1rem] bg-paper-2/60 p-4">
            <div>
              <dt className="text-[0.66rem] font-bold uppercase tracking-wider text-ink-3">
                Duration
              </dt>
              <dd className="mt-0.5 text-[0.82rem] font-semibold text-ink">
                {focused.activity.duration}
              </dd>
            </div>
            <div>
              <dt className="text-[0.66rem] font-bold uppercase tracking-wider text-ink-3">
                Typical hours
              </dt>
              <dd className="mt-0.5 text-[0.82rem] font-semibold text-ink">
                {focused.activity.start}–{focused.activity.end}
              </dd>
            </div>
            <div>
              <dt className="text-[0.66rem] font-bold uppercase tracking-wider text-ink-3">
                From
              </dt>
              <dd className="mt-0.5 font-mono text-[0.82rem] font-bold text-ink">
                {inr(priceFor(focused, season))}
                <span className="font-sans text-[0.66rem] font-semibold text-ink-3"> per person</span>
              </dd>
            </div>
            <div>
              <dt className="text-[0.66rem] font-bold uppercase tracking-wider text-ink-3">
                Getting there
              </dt>
              <dd className="mt-0.5 text-[0.82rem] font-semibold text-ink">
                {focused.hopLabel ? `${focused.hopLabel} from ${focused.gateway}` : `In ${focused.city}`}
              </dd>
            </div>
          </dl>

          {/* the guard said no — here's why, and the one-tap fix */}
          <AnimatePresence>
            {blockNote && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-3 rounded-[1.1rem] border border-coral/40 bg-coral-soft p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[0.84rem] font-bold text-ink">{blockNote.title}</p>
                  <button
                    onClick={() => setBlockNote(null)}
                    aria-label="Dismiss"
                    className="shrink-0 cursor-pointer text-ink-3 transition-colors hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-ink-2">
                  {blockNote.detail}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {blockNote.actions?.map((ac) => (
                    <button
                      key={ac.label}
                      onClick={() => {
                        onPatch(ac.patch);
                        setBlockNote(null);
                      }}
                      className="min-h-[36px] cursor-pointer rounded-full bg-white px-3.5 text-[0.78rem] font-bold text-coral-deep transition-[transform,background-color,color] duration-100 hover:bg-coral hover:text-white active:scale-[0.97]"
                    >
                      {ac.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* ---- the rest of the stop's catalog ---- */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[0.92rem] font-bold text-ink">More around {hub}</h3>
          <p className="shrink-0 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-ink-3">
            {list.length} total
          </p>
        </div>
        <div className="no-scrollbar -mx-8 mt-3 flex snap-x gap-3 overflow-x-auto px-8 pb-1">
          {list.map((a) => {
            const isFocus = a.id === focused.id;
            const isLiked = state.pinned.includes(a.key);
            return (
              <button
                key={a.id}
                onClick={() => focus(a.id)}
                aria-pressed={isFocus}
                className={`w-40 shrink-0 cursor-pointer snap-start rounded-[1.1rem] border bg-white p-1.5 text-left transition-[border-color,transform] duration-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
                  isFocus ? "border-ink" : "border-line hover:border-ink-3"
                }`}
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[0.75rem]">
                  <CityPhoto
                    query={`${a.activity.name} ${a.city} ${a.country}`}
                    theme={a.cityTheme}
                    alt=""
                    className="absolute inset-0 h-full w-full"
                  />
                  {isLiked && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white">
                      <Check size={11} />
                    </span>
                  )}
                </span>
                <span className="block px-1 pb-1 pt-1.5">
                  <span className="line-clamp-2 block text-[0.74rem] font-bold leading-snug text-ink">
                    {a.activity.name}
                  </span>
                  <span className="mt-1 block font-mono text-[0.56rem] font-semibold uppercase tracking-widest text-ink-3">
                    ~{Math.round(a.hours)}h · {a.city}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] leading-relaxed text-ink-3">
          <Sparkle size={11} className="shrink-0 text-violet" aria-hidden />
          Likes are folded into the plan we build next — you can change them any time.
        </p>
      </div>
      </>)}
    </motion.div>
  );
}
