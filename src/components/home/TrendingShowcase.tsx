"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import CountUp from "@/components/CountUp";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/Icons";

/* The trending exhibit: one destination enlarged on the left, the rest
   queued as numbered cards beside it. The arrows walk the queue — the next
   destination slides up into the big frame, the leaderboard rank travels
   with each card. Client-side selection only; counts are computed on the
   server and passed down.

   It also walks itself: once the panel is on screen the queue advances
   every DWELL_MS, and the dwell bar beside the counter shows the clock
   running so the movement reads as deliberate. It holds while the pointer
   is on the panel, while a keyboard traveller is inside it, when the tab
   is hidden, and whenever the panel scrolls away. Reduced motion doesn't
   stop the walk — it drops the scale, so slides crossfade in place. */

export type TrendCard = {
  rank: number;
  destination: string;
  /** this week's jittered search figure, computed server-side */
  count: number;
  budget: string;
  season: string;
  vibe: string;
  photo: string;
  alt: string;
  href: string;
};

const EASE = [0.21, 0.6, 0.35, 1] as const;
const DWELL_MS = 5000;

export default function TrendingShowcase({
  trends,
  budgets,
}: {
  trends: TrendCard[];
  budgets: { label: string; brief: string }[];
}) {
  const reduce = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  /* not `once`: the walk should stop again when the panel scrolls away */
  const inView = useInView(ref, { margin: "-15% 0px" });
  const [held, setHeld] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const featured = trends[index];
  const queue = Array.from(
    { length: trends.length - 1 },
    (_, i) => trends[(index + 1 + i) % trends.length]
  );

  const step = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + trends.length) % trends.length);

  const autoplay = inView && !held && !tabHidden;

  /* depending on `index` restarts the clock after a manual pick */
  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % trends.length),
      DWELL_MS
    );
    return () => clearTimeout(t);
  }, [autoplay, index, trends.length]);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={(e) => {
        /* a keyboard traveller parks it; a tap or click must not, or it
           would never resume on a phone */
        const t = e.target as HTMLElement;
        if (typeof t.matches === "function" && t.matches(":focus-visible")) {
          setHeld(true);
        }
      }}
      onBlurCapture={() => setHeld(false)}
      className="grain relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink p-6 text-white shadow-[0_40px_120px_-40px_rgba(22,18,31,0.55)] md:p-10 lg:p-12"
    >
      {/* band atmosphere */}
      <div
        aria-hidden
        className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-coral/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet/15 blur-3xl"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        {/* ---- the featured destination, enlarged ---- */}
        <div className="relative h-[420px] overflow-hidden rounded-3xl md:h-[500px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.a
              key={featured.destination}
              href={featured.href}
              aria-label={`Plan a ${featured.destination} trip`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.4 : 0.5, ease: EASE }}
              className="group absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img
                src={featured.photo}
                alt={featured.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/55 to-transparent"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink/90 via-ink/40 to-transparent"
              />

              <span className="absolute left-5 top-5 font-mono text-[0.8rem] font-bold tracking-[0.16em] text-white/85">
                0{featured.rank}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <p className="display text-[2.1rem] leading-none md:text-[2.6rem]">
                  {featured.destination}
                </p>
                <p className="mt-2 text-[0.9rem] text-white/80">
                  Best {featured.season} · {featured.vibe}
                </p>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <p className="font-mono text-[1.05rem] font-bold tabular-nums">
                    <CountUp to={featured.count} />
                    <span className="ml-1.5 text-[0.6rem] font-semibold uppercase tracking-widest text-white/60">
                      searches this week
                    </span>
                    <span className="mt-1 block text-[0.72rem] font-normal tracking-normal text-white/65">
                      avg budget {featured.budget} pp
                    </span>
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-[0.84rem] font-bold text-white shadow-[0_12px_32px_-14px_rgba(255,59,92,0.6)] transition-transform duration-200 ease-out group-hover:scale-[1.05]">
                    Plan this trip
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </motion.a>
          </AnimatePresence>
        </div>

        {/* ---- the ask, the controls, the queue ---- */}
        <div className="flex flex-col">
          <div className="max-w-xl">
            <h2 className="display text-3xl md:text-[2.5rem]">
              What&rsquo;s trending with travellers right now.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              Top searches on Zuumm this week — a look at what travellers are
              planning.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous destination"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white transition-colors duration-200 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next destination"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white transition-colors duration-200 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
            >
              <ChevronRight size={18} />
            </button>
            <span className="ml-1 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-widest text-white/50">
              0{featured.rank} / 0{trends.length}
              {/* the dwell clock, so the walk reads as deliberate */}
              <span
                aria-hidden
                className="relative h-[3px] w-10 overflow-hidden rounded bg-white/15"
              >
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
            </span>
          </div>

          {/* the queue: tap a card to bring it up front */}
          <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4 lg:mt-auto">
            <AnimatePresence initial={false} mode="popLayout">
              {queue.map((t) => (
                <motion.button
                  key={t.destination}
                  type="button"
                  layout
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  transition={
                    reduce
                      ? { duration: 0.35, ease: EASE, layout: { duration: 0 } }
                      : { duration: 0.4, ease: EASE }
                  }
                  onClick={() => setIndex(trends.indexOf(t))}
                  aria-label={`Show ${t.destination}`}
                  className="group relative h-36 overflow-hidden rounded-2xl text-left md:h-44 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
                  <img
                    src={t.photo}
                    alt={t.alt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-ink/55 to-transparent"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 to-transparent"
                  />
                  <span className="absolute left-3 top-3 font-mono text-[0.66rem] font-bold tracking-[0.16em] text-white/85">
                    0{t.rank}
                  </span>
                  <span className="absolute inset-x-3 bottom-3 text-[0.9rem] font-bold leading-tight text-white">
                    {t.destination}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ---- the budget-first door, on the same deck ---- */}
      <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/10 pt-6 md:mt-10">
        <p className="text-[0.95rem] font-semibold text-white/85">
          Or start from a budget —
        </p>
        <div className="flex flex-wrap gap-2.5">
          {budgets.map((b) => (
            <a
              key={b.label}
              href="#"
              className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[0.86rem] font-semibold text-white/85 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-coral/60 hover:text-white active:translate-y-0 active:scale-[0.98]"
            >
              {b.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
