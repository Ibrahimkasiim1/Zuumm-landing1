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

   Autoplay: 6s per slide, rolling continuously like the reference; it
   rests only for keyboard focus, a hidden tab, or reduced motion.

   HeroCanvas paints the background in WebGL (displacement crossfade + Ken
   Burns) once its textures are up; the DOM image stack is the fallback. */

const DESTS = HERO_DESTINATIONS;
const COUNT = DESTS.length;
const EASE = [0.21, 0.6, 0.35, 1] as const;
const BG_DUR = 0.9;
const DWELL_MS = 6000;

const pad = (n: number) => String(n + 1).padStart(2, "0");

/* the card's inset from the page edge, shared by the bottom chrome row so
   arrows and counter line up with the card they belong to */
const INSET = "mx-4 md:mx-20 lg:mx-24";

/* deck slot sizing: front card largest, receding right */
const SLOT_WIDTHS = [
  "w-[clamp(200px,21vw,290px)]",
  "w-[clamp(170px,17.5vw,240px)]",
  "w-[clamp(145px,14.5vw,200px)]",
];
const SLOT_OFFSETS = ["md:mt-0", "md:mt-10", "md:mt-20"];

export default function DestinationHero() {
  const reduce = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  /* WebGL took over the background: drop the DOM image stack */
  const [glReady, setGlReady] = useState(false);
  /* swallow the click a drag release would otherwise fire on a card */
  const dragging = useRef(false);

  const active = DESTS[index];
  /* the deck queues the three upcoming destinations, in order */
  const upcoming = [1, 2, 3].map((step) => (index + step) % COUNT);

  const goTo = useCallback((i: number, via: string) => {
    setIndex(((i % COUNT) + COUNT) % COUNT);
    track("hero_slide_change", { via });
  }, []);

  /* like the reference, the reel keeps rolling under the pointer; it only
     rests for keyboard focus (a11y), a hidden tab, or reduced motion.
     Mouse clicks blur their button on release so focus never lingers. */
  const autoplay = !reduce && !focused && !hidden;

  /* 6s dwell; depending on `index` restarts the clock after manual nav */
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
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      onMouseUpCapture={(e) => {
        /* release pointer-driven focus so autoplay resumes after clicks */
        const t = e.target as HTMLElement;
        t.closest("button")?.blur();
      }}
      className="relative flex flex-col bg-paper pb-5 pt-24 md:h-svh md:min-h-[760px] md:pt-28"
    >
      {/* ---- progress rail: outside the card, in the left gutter, inked
              for the paper ground. The badge springs between fixed cells. */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-1 z-20 hidden w-16 flex-col items-center md:flex lg:left-4"
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
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 500, damping: 35 }
                    }
                    className="absolute inset-0 rounded-full bg-ink shadow-[0_8px_22px_-8px_rgba(22,18,31,0.55)]"
                  />
                )}
                {i === index ? (
                  <motion.span
                    key={`n-${i}`}
                    initial={reduce ? false : { opacity: 0 }}
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
                animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.06 }}
                transition={reduce ? { duration: 0 } : { duration: BG_DUR, ease: EASE }}
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
          className="pointer-events-none absolute -bottom-5 left-8 hidden select-none md:block"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={active.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: 0.3 }}
              className="inline-block font-display text-[7rem] font-extrabold uppercase leading-none tracking-tight text-white/[0.07]"
            >
              {active.country}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ---- content ---- */}
        <div className="relative z-10 h-full px-6 pb-14 pt-12 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-8 md:px-12 md:py-10 lg:px-16">
          {/* left: the destination, spoken large. min-w-0 keeps the fr split
              stable — otherwise the title's min-content resizes the columns
              per slide and the deck jumps. */}
          <div aria-live="polite" className="relative z-[1] min-w-0">
            {/* the promise sentence: fixed frame, rolling middle */}
            <p className="font-display text-lg font-medium text-white/95 [text-shadow:0_1px_16px_rgba(13,10,21,0.7)] md:text-xl">
              Your dream vacation to
            </p>

            {/* relative: popLayout exits are absolute — overflow only clips
                them when the container is positioned */}
            <div className="relative overflow-hidden py-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h1
                  key={active.slug}
                  initial={reduce ? false : { y: "115%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-115%" }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.62, ease: EASE, delay: 0.08 }
                  }
                  className={`whitespace-nowrap font-display font-extrabold uppercase leading-[0.95] tracking-tight text-white [text-shadow:0_2px_32px_rgba(13,10,21,0.7)] ${
                    /* long names (SINGAPORE, MAURITIUS) step down a size
                       so they never run under the deck */
                    active.city.length > 8
                      ? "text-[clamp(2.6rem,4.6vw,4.5rem)]"
                      : "text-[clamp(3rem,5.6vw,5.4rem)]"
                  }`}
                >
                  {active.city}
                </motion.h1>
              </AnimatePresence>
            </div>

            <p className="font-display text-lg font-medium text-white/95 [text-shadow:0_1px_16px_rgba(13,10,21,0.7)] md:text-xl">
              — planned, priced and booked.
            </p>

            {/* per-destination copy rolls beneath the fixed sentence */}
            <div className="mt-5 min-h-[6rem] md:min-h-[4.75rem]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active.slug}
                  initial={reduce ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.55, ease: EASE, delay: 0.16 }
                  }
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
                Build my trip
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

          {/* right: the deck — a queue of what's next (desktop). Slots are
              fixed; cards spring between them as the queue advances, the
              front card fades toward the background it becomes, and the
              new arrival slides in from the card's right edge. Draggable. */}
          <div className="relative z-[2] hidden min-w-0 md:block">
            <motion.div
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragStart={() => (dragging.current = true)}
              onDragEnd={(_, info) => onDragEnd(info.offset.x)}
              className="flex translate-x-6 cursor-grab items-start justify-end gap-5 active:cursor-grabbing lg:translate-x-16"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {upcoming.map((destIdx, slot) => {
                  const d = DESTS[destIdx];
                  return (
                    <motion.div
                      key={d.slug}
                      layout
                      initial={reduce ? false : { opacity: 0, x: 120 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={
                        reduce
                          ? { opacity: 0, transition: { duration: 0 } }
                          : { opacity: 0, x: -48, scale: 1.12 }
                      }
                      transition={
                        reduce
                          ? { duration: 0 }
                          : {
                              layout: { type: "spring", stiffness: 260, damping: 30 },
                              duration: 0.5,
                              ease: EASE,
                            }
                      }
                      className={`${SLOT_WIDTHS[slot]} ${SLOT_OFFSETS[slot]} shrink-0`}
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
                              sizes="(min-width: 768px) 22vw, 45vw"
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

          {/* right: the deck, as a swipeable rail (mobile) */}
          <div className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 md:hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              {upcoming.map((destIdx) => {
                const d = DESTS[destIdx];
                return (
                  <motion.button
                    key={d.slug}
                    layout
                    initial={reduce ? false : { opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      reduce
                        ? { opacity: 0, transition: { duration: 0 } }
                        : { opacity: 0, x: -32 }
                    }
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            layout: { type: "spring", stiffness: 260, damping: 30 },
                            duration: 0.4,
                            ease: EASE,
                          }
                    }
                    type="button"
                    onClick={() => cardClick(destIdx)}
                    aria-label={`Show ${d.city}`}
                    className="w-36 shrink-0 snap-start text-left"
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

/* single-value odometer roll, used by the counters */
function RollText({ value, vertical = false }: { value: string; vertical?: boolean }) {
  const reduce = useReducedMotionSafe();
  return (
    <span
      className={`relative inline-flex overflow-hidden ${vertical ? "" : "h-[1.3em] items-center"}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }}
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
