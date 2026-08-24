"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/Icons";
import { HERO_DESTINATIONS } from "@/lib/destinations";
import { track } from "@/lib/analytics";
import { TiltCard } from "@/components/ScrollFX";
import HeroCanvas from "./HeroCanvas";

/* The cinematic destination hero.

   The scene lives inside an inset, softly-rounded card floating on paper —
   the way the reference mockup framed it. The card holds everything the
   viewer looks at (photograph, title, copy, CTAs, the queue of cards); the
   navigation chrome — the progress rail on the left and the arrows and
   counter below — sits outside it on the paper, in ink rather than white.

   The signature transition: the front card fades toward the background
   while the background crossfades to that card's destination — the card
   "becomes" the page. One master goTo() drives seven layers on the house
   curve: bg crossfade+settle · title reel roll · copy roll · deck spring
   shift · rail badge spring (shared layoutId) · counter odometer · ghost
   watermark crossfade.

   The promise sentence around the title ("Your dream vacation to / CITY /
   — planned, priced and booked.") stays fixed while the name rolls — the
   static frame is what makes the roll read. The title names the CITY; the
   ghost watermark under it names the COUNTRY.

   Autoplay: DWELL_MS per slide, rolling continuously on every device. It
   rests only for keyboard focus (a11y) and a hidden tab. Reduced motion
   does NOT stop the reel — the hero is the page's headline and has to keep
   moving through it; what it drops is the movement, so every layer
   crossfades in place instead of sliding, and the WebGL Ken Burns drift
   stays off.

   Layout: the two-column stage (copy left, queued deck right) only exists
   from `lg` up, where the deck column is genuinely wide enough for it.
   Below that everything stacks and the deck becomes a swipe rail, so the
   cards can never come to rest on top of the title or the CTAs.

   HeroCanvas paints the background in WebGL (displacement crossfade + Ken
   Burns) once its textures are up; the DOM image stack is the fallback. */

const DESTS = HERO_DESTINATIONS;
const COUNT = DESTS.length;
const EASE = [0.21, 0.6, 0.35, 1] as const;
const BG_DUR = 0.7;
const DWELL_MS = 4200;

const pad = (n: number) => String(n + 1).padStart(2, "0");

/* the card's inset from the page edge, shared by the bottom chrome row so
   arrows and counter line up with the card they belong to */
const INSET = "mx-4 md:mx-10 lg:mx-24";

/* Deck slot sizing. The row is exactly as wide as its grid column plus the
   card's own right padding, and the cards flex-grow to fill it — so the
   queue always ends flush with the card's right edge and can never reach
   back across the copy, at any viewport. Three cards once the column can hold
   them near full size (~1800px up), two below that. */
const SLOT_GROW: Record<number, number[]> = {
  2: [5.5, 4.5],
  3: [3.95, 3.35, 2.7],
};
const SLOT_MAX = ["max-w-[300px]", "max-w-[252px]", "max-w-[212px]"];
const SLOT_OFFSETS = ["lg:mt-0", "lg:mt-10", "lg:mt-20"];

export default function DestinationHero() {
  const reduce = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  /* keyboard focus inside the reel — the only interaction that parks it */
  const [keyFocus, setKeyFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  /* WebGL took over the background: drop the DOM image stack */
  const [glReady, setGlReady] = useState(false);
  /* three queued cards only where the column can hold them */
  const [slots, setSlots] = useState(2);
  /* swallow the click a drag release would otherwise fire on a card */
  const dragging = useRef(false);

  const active = DESTS[index];
  /* the deck queues the upcoming destinations, in order */
  const upcoming = Array.from({ length: slots }, (_, k) => (index + k + 1) % COUNT);
  const mobileUpcoming = [1, 2, 3].map((step) => (index + step) % COUNT);

  /* reduced motion crossfades every layer in place rather than sliding it */
  const xf = reduce;

  const goTo = useCallback((i: number, via: string) => {
    setIndex(((i % COUNT) + COUNT) % COUNT);
    track("hero_slide_change", { via });
  }, []);

  /* the reel keeps rolling under the pointer and under reduced motion; it
     only rests for keyboard focus (a11y) or a hidden tab. Mouse clicks blur
     their button on release so focus never lingers. */
  const autoplay = !keyFocus && !hidden;

  /* dwell per slide; depending on `index` restarts the clock after manual nav */
  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => goTo(index + 1, "auto"), DWELL_MS);
    return () => clearTimeout(t);
  }, [autoplay, index, goTo]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1800px)");
    const apply = () => setSlots(mq.matches ? 3 : 2);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1, "key");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1, "key");
    }
  };

  const onDragEnd = (offsetX: number) => {
    if (offsetX < -60) goTo(index + 1, "drag");
    else if (offsetX > 60) goTo(index - 1, "drag");
    /* let the release's click event pass before re-arming card clicks */
    setTimeout(() => (dragging.current = false), 80);
  };

  const cardClick = (destIdx: number) => {
    if (dragging.current) return;
    goTo(destIdx, "card");
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured destinations"
      onKeyDown={onKeyDown}
      onFocusCapture={(e) => {
        /* only a keyboard traveller parks the reel — a tap or a click puts
           focus on a button too, and that must not stop it on mobile */
        const t = e.target as HTMLElement;
        if (typeof t.matches === "function" && t.matches(":focus-visible")) {
          setKeyFocus(true);
        }
      }}
      onBlurCapture={() => setKeyFocus(false)}
      onMouseUpCapture={(e) => {
        /* release pointer-driven focus so autoplay resumes after clicks */
        const t = e.target as HTMLElement;
        t.closest("button")?.blur();
      }}
      className="relative flex flex-col bg-paper pb-5 pt-24 lg:h-svh lg:min-h-[760px] lg:pt-28"
    >
      {/* ---- progress rail: outside the card, in the left gutter, inked
              for the paper ground. The badge springs between fixed cells. */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-1 z-20 hidden w-16 flex-col items-center lg:flex lg:left-4"
      >
        <div className="mt-32 flex flex-1 flex-col items-center">
          <div className="w-px flex-1 bg-ink/20" />
          <div className="flex flex-col items-center gap-4 py-6">
            {DESTS.map((d, i) => (
              <div
                key={d.slug}
                className="relative flex h-9 w-9 items-center justify-center"
              >
                {i === index && (
                  <motion.span
                    layoutId="hero-rail-badge"
                    transition={
                      xf
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 500, damping: 35 }
                    }
                    className="absolute inset-0 rounded-full bg-ink shadow-[0_8px_22px_-8px_rgba(22,18,31,0.55)]"
                  />
                )}
                {i === index ? (
                  <motion.span
                    key={`n-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative font-mono text-xs font-semibold text-white"
                  >
                    {i + 1}
                  </motion.span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-ink/35" />
                )}
              </div>
            ))}
          </div>
          <div className="w-px flex-1 bg-ink/20" />
        </div>
        <span className="mb-8 mt-4 flex font-mono text-[0.66rem] font-semibold tracking-[0.16em] text-ink-2 [writing-mode:vertical-rl] tabular-nums">
          <RollText value={pad(index)} vertical />
          /{pad(COUNT - 1)}
        </span>
      </div>

      {/* ================= the card ================= */}
      <div
        className={`${INSET} relative flex-1 overflow-hidden rounded-[24px] bg-ink text-white shadow-[0_40px_120px_-48px_rgba(22,18,31,0.55)] md:rounded-[28px]`}
      >
        {/* ---- background stage. The DOM image stack paints first (and is
                the only background under reduced motion or without WebGL);
                once HeroCanvas has every texture on the GPU it takes over
                with the displacement crossfade + Ken Burns drift. ---- */}
        <div aria-hidden className="absolute inset-0">
          {!glReady &&
            DESTS.map((d, i) => (
              <motion.div
                key={d.slug}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: i === index ? 1 : 0,
                  scale: xf || i === index ? 1 : 1.06,
                }}
                transition={{ duration: xf ? 0.45 : BG_DUR, ease: EASE }}
              >
                <Image
                  src={d.heroImage}
                  alt=""
                  fill
                  sizes="100vw"
                  preload={i === 0}
                  className="object-cover brightness-[1.12]"
                />
              </motion.div>
            ))}
          {!reduce && <HeroCanvas index={index} onReady={() => setGlReady(true)} />}
          {/* ink scrims — light enough to keep the photograph bright, with
              text-shadows on the copy doing the rest of the legibility work */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/72 via-ink/32 to-ink/[0.08]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/45 to-transparent" />
          <div className="grain absolute inset-0" />
        </div>

        {/* ---- ghost echo: the country, peeking from the bottom edge ---- */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-5 left-8 hidden select-none lg:block"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={active.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: xf ? 0.4 : 0.6, ease: EASE, delay: xf ? 0 : 0.3 }}
              className="inline-block font-display text-[7rem] font-extrabold uppercase leading-none tracking-tight text-white/[0.07]"
            >
              {active.country}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ---- content ---- */}
        <div className="relative z-10 h-full px-6 pb-14 pt-12 md:px-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:px-16 lg:py-10">
          {/* left: the destination, spoken large. min-w-0 keeps the fr split
              stable — otherwise the title's min-content resizes the columns
              per slide and the deck jumps. */}
          <div aria-live="polite" className="relative z-[1] min-w-0">
            {/* the promise sentence: fixed frame, rolling middle */}
            <p className="font-display text-base font-medium text-white/95 [text-shadow:0_1px_16px_rgba(13,10,21,0.7)] md:text-xl">
              Your dream vacation to
            </p>

            {/* relative: popLayout exits are absolute — overflow only clips
                them when the container is positioned */}
            <div className="relative overflow-hidden py-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h1
                  key={active.slug}
                  initial={xf ? { opacity: 0 } : { y: "115%" }}
                  animate={xf ? { opacity: 1 } : { y: 0 }}
                  exit={xf ? { opacity: 0 } : { y: "-115%" }}
                  transition={{
                    duration: xf ? 0.4 : 0.5,
                    ease: EASE,
                    delay: xf ? 0 : 0.06,
                  }}
                  className={`whitespace-nowrap font-display font-extrabold uppercase leading-[0.95] tracking-tight text-white [text-shadow:0_2px_32px_rgba(13,10,21,0.7)] ${
                    /* long names (SINGAPORE, MAURITIUS) step down a size
                       so they never run under the deck */
                    active.city.length > 7
                      ? "text-[clamp(2.1rem,4.4vw,4.2rem)]"
                      : "text-[clamp(2.5rem,5.2vw,5rem)]"
                  }`}
                >
                  {active.city}
                </motion.h1>
              </AnimatePresence>
            </div>

            <p className="font-display text-base font-medium text-white/95 [text-shadow:0_1px_16px_rgba(13,10,21,0.7)] md:text-xl">
              — planned, priced and booked.
            </p>

            {/* per-destination copy rolls beneath the fixed sentence */}
            <div className="mt-5 min-h-[6rem] md:min-h-[4.75rem]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active.slug}
                  initial={xf ? { opacity: 0 } : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={xf ? { opacity: 0 } : { opacity: 0, y: -22 }}
                  transition={{
                    duration: xf ? 0.4 : 0.45,
                    ease: EASE,
                    delay: xf ? 0 : 0.12,
                  }}
                >
                  <p className="max-w-sm text-sm leading-relaxed text-white/90 [text-shadow:0_1px_16px_rgba(13,10,21,0.7)] md:text-[0.95rem]">
                    {active.blurb}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* both doors into the planner: hands-on, or AI-led */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={active.planHref}
                onClick={() => track("hero_plan_cta", { destination: active.slug })}
                className="grad-bg inline-flex min-h-11 items-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.04] active:scale-[0.98]"
              >
                Plan it myself
                <ArrowRight size={17} />
              </a>
              <a
                href="#"
                onClick={() => track("hero_chat_cta", { destination: active.slug })}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-[0.95rem] font-bold text-white/90 backdrop-blur-sm transition-all hover:scale-[1.04] hover:bg-white/20 hover:text-white active:scale-[0.98]"
              >
                Plan it with AI
              </a>
            </div>
          </div>

          {/* right: the deck — a queue of what's next (lg and up). The row
              spans its own column plus the card's right padding and the
              cards flex to fill it, so the queue ends flush with the card's
              edge and never crosses back over the copy. Slots are fixed;
              cards spring between them as the queue advances, the front card
              fades toward the background it becomes, and the new arrival
              slides in from the card's right edge. Draggable. */}
          <div className="relative z-[2] hidden min-w-0 lg:block">
            <motion.div
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragStart={() => (dragging.current = true)}
              onDragEnd={(_, info) => onDragEnd(info.offset.x)}
              className="flex w-[calc(100%_+_4rem)] cursor-grab items-start justify-end gap-5 active:cursor-grabbing"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {upcoming.map((destIdx, slot) => {
                  const d = DESTS[destIdx];
                  return (
                    <motion.div
                      key={d.slug}
                      layout
                      initial={xf ? { opacity: 0 } : { opacity: 0, x: 120 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={
                        xf
                          ? { opacity: 0 }
                          : { opacity: 0, x: -48, scale: 1.12 }
                      }
                      transition={
                        xf
                          ? { duration: 0.4, ease: EASE, layout: { duration: 0 } }
                          : {
                              layout: { type: "spring", stiffness: 260, damping: 30 },
                              duration: 0.45,
                              ease: EASE,
                            }
                      }
                      style={{ flex: `${SLOT_GROW[slots][slot]} 1 0%` }}
                      className={`${SLOT_MAX[slot]} ${SLOT_OFFSETS[slot]} min-w-0`}
                    >
                      <p className="mb-2.5 flex items-center justify-between gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white [text-shadow:0_1px_10px_rgba(13,10,21,0.85)]">
                        <span className="truncate">{d.cardLabel}</span>
                        <span aria-hidden className="flex shrink-0 gap-1">
                          <span className="h-1 w-1 rounded-full bg-white" />
                          <span className="h-1 w-1 rounded-full bg-white/30" />
                          <span className="h-1 w-1 rounded-full bg-white/30" />
                          <span className="h-1 w-1 rounded-full bg-white/30" />
                        </span>
                      </p>
                      {/* pointer tilt on the frame; hover lift stays on the
                          button so the two transforms never fight */}
                      <TiltCard max={4}>
                        <button
                          type="button"
                          onClick={() => cardClick(destIdx)}
                          aria-label={`Show ${d.city}`}
                          className="group relative block w-full rounded-[22px] border border-white/20 bg-white/10 p-2 shadow-[0_40px_120px_-40px_rgba(13,10,21,0.8)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet motion-reduce:transition-none"
                        >
                          <span className="relative block aspect-[32/43] overflow-hidden rounded-[15px]">
                            {/* eager: a queued card must never reveal as an empty frame */}
                            <Image
                              src={d.cardImage}
                              alt={d.cardLabel}
                              fill
                              sizes="(min-width: 1024px) 22vw, 45vw"
                              loading="eager"
                              draggable={false}
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                            />
                          </span>
                        </button>
                      </TiltCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* right: the deck, as a swipeable rail (below lg) */}
          <div className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-6 px-6 md:-mx-10 md:scroll-pl-10 md:px-10 lg:hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              {mobileUpcoming.map((destIdx) => {
                const d = DESTS[destIdx];
                return (
                  <motion.button
                    key={d.slug}
                    layout
                    initial={xf ? { opacity: 0 } : { opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={xf ? { opacity: 0 } : { opacity: 0, x: -32 }}
                    transition={
                      xf
                        ? { duration: 0.4, ease: EASE, layout: { duration: 0 } }
                        : {
                            layout: { type: "spring", stiffness: 260, damping: 30 },
                            duration: 0.4,
                            ease: EASE,
                          }
                    }
                    type="button"
                    onClick={() => cardClick(destIdx)}
                    aria-label={`Show ${d.city}`}
                    className="w-36 shrink-0 snap-start text-left sm:w-44 md:w-52"
                  >
                    <span className="relative block rounded-[18px] border border-white/20 bg-white/10 p-1.5 backdrop-blur-md">
                      <span className="relative block aspect-[32/43] overflow-hidden rounded-[13px]">
                        <Image
                          src={d.cardImage}
                          alt={d.cardLabel}
                          fill
                          sizes="45vw"
                          loading="eager"
                          draggable={false}
                          className="object-cover"
                        />
                      </span>
                    </span>
                    <span className="mt-2 block truncate font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/95 [text-shadow:0_1px_10px_rgba(13,10,21,0.85)]">
                      {d.cardLabel}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* =============== /the card =============== */}

      {/* ---- navigation chrome, outside the card on the paper ---- */}
      <div className={`${INSET} mt-4 flex items-center md:mt-5`}>
        <span className="flex-1" />
        <DeckArrows
          onPrev={() => goTo(index - 1, "arrow")}
          onNext={() => goTo(index + 1, "arrow")}
        />
        <span className="flex flex-1 justify-end">
          <Counter index={index} autoplay={autoplay} />
        </span>
      </div>
    </section>
  );
}

/* single-value odometer roll, used by the counters. Under reduced motion it
   crossfades in place rather than rolling. */
function RollText({ value, vertical = false }: { value: string; vertical?: boolean }) {
  const reduce = useReducedMotionSafe();
  return (
    <span
      className={`relative inline-flex overflow-hidden ${vertical ? "" : "h-[1.3em] items-center"}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduce ? 0.3 : 0.4, ease: EASE }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function DeckArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const cls =
    "flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-[0_10px_26px_-12px_rgba(22,18,31,0.5)] transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet";
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onPrev} aria-label="Previous destination" className={cls}>
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={onNext} aria-label="Next destination" className={cls}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* current/total, with a coral fill showing the autoplay dwell */
function Counter({ index, autoplay }: { index: number; autoplay: boolean }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[0.7rem] font-semibold tracking-[0.16em] text-ink-2 tabular-nums">
      <span className="text-ink">
        <RollText value={pad(index)} />
      </span>
      <span aria-hidden className="relative h-[3px] w-10 overflow-hidden rounded bg-ink/15">
        {autoplay && (
          <motion.span
            key={index}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: DWELL_MS / 1000, ease: "linear" }}
            className="absolute inset-0 origin-left bg-coral"
          />
        )}
      </span>
      <span>{pad(COUNT - 1)}</span>
    </p>
  );
}
