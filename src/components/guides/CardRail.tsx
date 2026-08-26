"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, ChevronLeft, ChevronRight } from "@/components/Icons";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/* The guide page's horizontal rail, in two keys. Every card carries its
   own ground: rank (when ranked), the brief, then the photograph with a
   frosted name plate sitting on it. Light cards for the ranked top ten,
   ink cards for the bases.

   Only one rail on the page may autoplay — the house One Ticker rule —
   so `autoplay` is opt-in and the bases rail is driven by hand. */

export type RailItem = {
  /** omit for a non-interactive card */
  href?: string;
  img: string;
  alt: string;
  rank?: number;
  name: string;
  category?: string;
  blurb: string;
};

const TONES = {
  light: {
    card: "border border-line bg-white shadow-[0_24px_70px_-48px_rgba(22,18,31,0.45)]",
    rank: "text-ink",
    blurb: "text-ink-2",
    fade: "bg-gradient-to-b from-white via-white/55 to-transparent",
    chip: "bg-ink/60 text-white",
    plate: "border-white/25 bg-ink/35",
  },
  dark: {
    card: "grain bg-ink ring-1 ring-white/10 shadow-[0_34px_90px_-46px_rgba(22,18,31,0.7)]",
    rank: "text-white",
    blurb: "text-white/70",
    fade: "bg-gradient-to-b from-ink via-ink/55 to-transparent",
    chip: "bg-black/50 text-white",
    plate: "border-white/20 bg-black/45",
  },
} as const;

const GAPS = {
  20: { cls: "gap-5", px: 20 },
  32: { cls: "gap-8", px: 32 },
} as const;

export default function CardRail({
  heading,
  sub,
  ariaLabel,
  items,
  tone = "light",
  gap = 20,
  autoplay = false,
  variant = "brief",
  edgeFade = true,
  className = "py-16 md:py-20",
}: {
  heading: string;
  sub?: string;
  ariaLabel: string;
  items: RailItem[];
  tone?: keyof typeof TONES;
  gap?: keyof typeof GAPS;
  autoplay?: boolean;
  /** brief = copy up top, photo below · overlay = photo fading into black, copy on it */
  variant?: "brief" | "overlay";
  edgeFade?: boolean;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotionSafe();
  const t = TONES[tone];
  const g = GAPS[gap];

  /* Always land on an exact card multiple: scrollLeft = i · step keeps the
     track's inline padding showing as a gutter on the leading edge, so the
     rail never sits flush against the viewport. */
  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const dx = (card?.offsetWidth ?? 320) + g.px;
    const index = Math.round(el.scrollLeft / dx);
    const last = Math.max(0, Math.ceil((el.scrollWidth - el.clientWidth) / dx));
    let next = index + dir;
    if (next > last) next = 0;
    if (next < 0) next = last;
    el.scrollTo({ left: next * dx, behavior: "smooth" });
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay || reduce || paused || !inView) return;
    const id = setInterval(() => {
      if (!document.hidden) step(1);
    }, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- step reads live refs
  }, [autoplay, reduce, paused, inView]);

  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-coral/35 bg-white text-coral-deep shadow-[0_8px_26px_-8px_rgba(255,59,92,0.55)] transition-all hover:border-coral hover:shadow-[0_10px_30px_-8px_rgba(255,59,92,0.75)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet active:scale-95 motion-reduce:transition-none";

  return (
    <section
      ref={sectionRef}
      className={className}
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="container-x">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="display text-3xl text-ink md:text-[2.3rem]">{heading}</h2>
              {sub && <p className="mt-3 max-w-xl text-[1.02rem] text-ink-2">{sub}</p>}
            </div>
            <div className="hidden shrink-0 gap-2.5 sm:flex">
              <button
                type="button"
                aria-label={`Previous — ${ariaLabel}`}
                onClick={() => step(-1)}
                className={btn}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label={`Next — ${ariaLabel}`}
                onClick={() => step(1)}
                className={btn}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative mt-9">
        {/* the gutters fade the neighbouring cards out instead of cutting
            them at the viewport edge */}
        {edgeFade && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[calc(max(0px,(100%-76rem)/2)+1.5rem)] bg-gradient-to-r from-paper via-paper/85 to-transparent md:w-[calc(max(0px,(100%-76rem)/2)+2.5rem)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[calc(max(0px,(100%-76rem)/2)+1.5rem)] bg-gradient-to-l from-paper via-paper/85 to-transparent md:w-[calc(max(0px,(100%-76rem)/2)+2.5rem)]"
            />
          </>
        )}
        {/* gutters track .container-x: the rail's first card lines up with
            the heading at every width, and never touches the viewport edge */}
        <div
          ref={trackRef}
          className={`no-scrollbar flex snap-x ${g.cls} overflow-x-auto px-[calc(max(0px,(100%-76rem)/2)+1.5rem)] pb-4 [scroll-padding-left:calc(max(0px,(100%-76rem)/2)+1.5rem)] md:px-[calc(max(0px,(100%-76rem)/2)+2.5rem)] md:[scroll-padding-left:calc(max(0px,(100%-76rem)/2)+2.5rem)]`}
        >
          {items.map((item) => {
            /* overlay: one photograph fading into solid black, the name and
               its brief sitting on that black footing */
            const body = variant === "overlay" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                <img
                  src={item.img}
                  alt={item.alt}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover ${
                    item.href
                      ? "transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                      : ""
                  }`}
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black from-[38%] via-black/75 via-[68%] to-transparent"
                />
                {item.category && (
                  <span className="absolute left-4 top-4 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                    {item.category}
                  </span>
                )}
                <span className="relative p-5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-[1.35rem] font-bold leading-tight text-white">
                      {item.name}
                    </span>
                    {item.href && (
                      <ArrowRight
                        size={15}
                        className="shrink-0 text-white/90 transition-transform group-hover:translate-x-0.5"
                      />
                    )}
                  </span>
                  {/* a fixed four-line well keeps every name on the same
                      baseline across the rail */}
                  <span className="mt-2 line-clamp-4 min-h-[5.35rem] text-[0.82rem] leading-relaxed text-white/75">
                    {item.blurb}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="relative flex flex-col gap-2.5 p-5 pb-4">
                  {item.rank != null && (
                    <span className={`font-display text-[1.9rem] font-bold leading-none ${t.rank}`}>
                      {String(item.rank).padStart(2, "0")}
                    </span>
                  )}
                  <span className={`line-clamp-4 text-[0.84rem] leading-relaxed ${t.blurb}`}>
                    {item.blurb}
                  </span>
                </span>

                <span className="relative mt-auto block aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                  <img
                    src={item.img}
                    alt={item.alt}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover ${
                      item.href
                        ? "transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                        : ""
                    }`}
                  />
                  {/* the card's own ground dissolving down into the photograph */}
                  <span aria-hidden className={`absolute inset-x-0 top-0 h-20 ${t.fade}`} />
                  {item.category && (
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-widest backdrop-blur-sm ${t.chip}`}
                    >
                      {item.category}
                    </span>
                  )}
                  {/* the frosted name plate */}
                  <span
                    className={`absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 backdrop-blur-md ${t.plate}`}
                  >
                    <span className="text-[0.95rem] font-bold leading-snug text-white">
                      {item.name}
                    </span>
                    {item.href && (
                      <ArrowRight
                        size={15}
                        className="shrink-0 text-white/90 transition-transform group-hover:translate-x-0.5"
                      />
                    )}
                  </span>
                </span>
              </>
            );

            const shell =
              variant === "overlay"
                ? "relative flex h-[420px] w-[280px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl bg-black shadow-[0_34px_90px_-46px_rgba(22,18,31,0.7)] ring-1 ring-white/10 md:h-[440px] md:w-[320px]"
                : `relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl md:w-[320px] ${t.card}`;

            if (!item.href) {
              return (
                <div key={item.name} data-card className={shell}>
                  {body}
                </div>
              );
            }
            const El = item.href.startsWith("/") ? Link : "a";
            return (
              <El
                key={item.name}
                href={item.href}
                data-card
                className={`${shell} group transition-transform duration-300 hover:-translate-y-1.5 motion-reduce:transition-none`}
              >
                {body}
              </El>
            );
          })}
        </div>
      </div>
    </section>
  );
}
