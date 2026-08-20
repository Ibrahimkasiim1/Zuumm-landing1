"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { Check } from "@/components/plan/icons";
import { ArrowRight, Shield, Star } from "@/components/Icons";
import { wizardHref } from "@/lib/planner/openPlanner";
import { track } from "@/lib/analytics";

/* Why Zuumm Holidays — four promises as a bento of the page's own two
   materials, all visible in one desktop viewport, each demo animated in
   its own grammar so a glance tells you what each system does:

     · Tracked        → a WhatsApp exchange playing out (sequence)
     · Handpicked     → the shortlist vetting itself, misses skipped (stagger)
     · One price      → the quote itemising itself, receipt-style (stagger)
     · Not a template → an itinerary reshuffling and re-pricing (layout FLIP)

   No destination photography here (that belongs to the hero slider alone):
   the two operational promises live on dark ink deck panels with grain and
   ambient blobs, the two pricing promises on white pillar panels with soft
   tint washes — travel is evoked through the artifacts themselves (a
   perforated receipt, a vetting stamp, an IATA watermark). Every demo
   plays ONCE on scroll into view and settles on its finished frame — the
   hero slider stays the page's one ticker. Reduced motion renders each
   tile's finished state. */

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const VIEW_MARGIN = "-15% 0px" as const;

/* ---------------------------------------------------------------- tiles */

function Tile({
  title,
  line,
  tag,
  span,
  dark,
  wash,
  glow,
  watermark,
  children,
}: {
  title: string;
  line: string;
  /** mono micro-label naming the artifact, ops-deck style */
  tag: string;
  span: string;
  /** ink deck panel (true) or white pillar panel (false) */
  dark?: boolean;
  /** light tiles: the 135deg white → soft-tint wash */
  wash?: string;
  /** dark tiles: ambient blur blobs */
  glow?: React.ReactNode;
  /** oversized IATA code behind the demo */
  watermark?: string;
  children: React.ReactNode;
}) {
  return (
    <StaggerItem className={`h-full ${span}`}>
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-[28px] p-6 lg:h-[clamp(245px,calc(50vh-145px),330px)] ${
          dark
            ? "grain border border-white/10 bg-ink text-white shadow-[0_40px_120px_-40px_rgba(22,18,31,0.55)]"
            : `border border-line text-ink shadow-[0_24px_70px_-40px_rgba(22,18,31,0.35)] ${wash ?? "bg-white"}`
        }`}
      >
        {glow}
        {watermark && (
          <span
            aria-hidden
            className={`display pointer-events-none absolute -right-3 top-2 select-none text-[4.6rem] ${
              dark ? "text-white/[0.05]" : "text-ink/[0.05]"
            }`}
          >
            {watermark}
          </span>
        )}
        <p
          className={`relative font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${
            dark ? "text-white/50" : "text-ink-3"
          }`}
        >
          {tag}
        </p>
        <div className="relative flex min-h-[150px] flex-1 items-center justify-center py-2">
          {children}
        </div>
        <div className="relative">
          <h3 className="display text-[1.2rem] leading-tight">{title}</h3>
          <p
            className={`mt-1 text-[0.82rem] leading-snug ${
              dark ? "text-white/75" : "text-ink-2"
            }`}
          >
            {line}
          </p>
        </div>
      </div>
    </StaggerItem>
  );
}

/* ---- 1 · Tracked: a WhatsApp exchange, playing once as it scrolls in ---- */

function ChatDemo() {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: VIEW_MARGIN });
  const [phase, setPhase] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce) {
      /* preference lands after mount: skip straight to the finished frame */
      setPhase(3);
      return;
    }
    if (!inView) return;
    /* you → typing → reply, then hold the finished frame */
    const timers = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3100),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  return (
    <div ref={ref} className="w-full max-w-[240px] space-y-2" aria-hidden>
      {phase >= 1 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, transform: "translateY(10px) scale(0.96)" }}
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="ml-auto w-fit rounded-2xl rounded-br-md bg-mint px-3.5 py-2 text-[0.8rem] font-medium text-white"
        >
          Just landed ✈️
        </motion.div>
      )}
      <AnimatePresence initial={false} mode="wait">
        {phase === 2 && (
          <motion.div
            key="typing"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3.5 py-2.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white/85"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </motion.div>
        )}
        {phase === 3 && (
          <motion.div
            key="reply"
            initial={reduce ? false : { opacity: 0, transform: "translateY(10px) scale(0.96)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="w-fit rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[0.8rem] leading-snug text-white"
          >
            Driver&rsquo;s outside — white Innova, 2&nbsp;min
            <span className="mt-0.5 block font-mono text-[0.58rem] uppercase tracking-widest text-white/60">
              Zuumm ground team · 24×7
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* reserve the exchange's height before it plays */}
      {phase < 3 && <div className={phase === 0 ? "h-[104px]" : "h-[64px]"} />}
    </div>
  );
}

/* ---- 2 · Handpicked: the shortlist vets itself — good stays get the
        stamp, the unrated one is skipped in front of you ---- */

const SHORTLIST: {
  name: string;
  rating: string;
  meta: string;
  ok: boolean;
}[] = [
  { name: "The Anvaya, Kuta", rating: "4.7", meta: "1,850 reviews", ok: true },
  { name: "Unrated guesthouse", rating: "3.1", meta: "no inspection", ok: false },
  { name: "Nusa Penida day trip", rating: "4.8", meta: "licensed crew", ok: true },
];

function HandpickedList() {
  const reduce = useReducedMotionSafe();
  return (
    <ul className="w-full max-w-[250px] space-y-1.5" aria-hidden>
      {SHORTLIST.map((s, i) => (
        <motion.li
          key={s.name}
          initial={reduce ? false : { opacity: 0, x: 26 }}
          whileInView={s.ok ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
          viewport={{ once: true, margin: VIEW_MARGIN }}
          transition={{
            duration: 0.45,
            ease: EASE_OUT,
            delay: reduce ? 0 : 0.25 + i * 0.3,
          }}
          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
            s.ok
              ? "border-line bg-white shadow-[0_10px_30px_-18px_rgba(22,18,31,0.25)]"
              : "border-line bg-paper-2"
          }`}
        >
          <span
            className={`flex items-center gap-1 font-mono text-[0.68rem] font-bold tabular-nums ${
              s.ok ? "text-ink" : "text-ink-3"
            }`}
          >
            <Star
              size={11}
              fill="currentColor"
              className={s.ok ? "text-sun" : "text-ink-3/60"}
            />
            {s.rating}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span
              className={`block truncate text-[0.78rem] font-semibold ${
                s.ok ? "text-ink" : "text-ink-3 line-through"
              }`}
            >
              {s.name}
            </span>
            <span className="block font-mono text-[0.54rem] uppercase tracking-widest text-ink-3">
              {s.meta}
            </span>
          </span>
          {s.ok ? (
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -18 }}
              whileInView={{ scale: 1, rotate: -6 }}
              viewport={{ once: true, margin: VIEW_MARGIN }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 18,
                delay: reduce ? 0 : 0.55 + i * 0.3,
              }}
              className="shrink-0 rounded-md border-2 border-mint/70 px-1.5 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-[0.14em] text-mint-deep"
            >
              vetted
            </motion.span>
          ) : (
            <span className="shrink-0 font-mono text-[0.5rem] font-bold uppercase tracking-[0.14em] text-ink-3">
              skipped
            </span>
          )}
        </motion.li>
      ))}
    </ul>
  );
}

/* ---- 3 · One price: the split, itemised — no other OTA shows this.
        The quote writes itself out line by line like a till receipt,
        then the all-in total locks it shut below the perforation. ---- */

const SPLIT = [
  { label: "flights", value: "₹18,400" },
  { label: "hotels", value: "₹14,200" },
  { label: "activities", value: "₹6,800" },
  { label: "transfers", value: "₹3,100" },
  { label: "visa", value: "₹3,500" },
  { label: "taxes & tips", value: "₹1,500" },
];

function PriceSplit() {
  const reduce = useReducedMotionSafe();
  return (
    <div
      className="ticket-mask w-full max-w-[250px] rounded-2xl border border-line bg-white p-3 pb-2.5 shadow-[0_18px_50px_-28px_rgba(22,18,31,0.35)]"
      style={{ "--notch-y": "calc(100% - 60px)" } as React.CSSProperties}
      aria-hidden
    >
      <ul className="space-y-1">
        {SPLIT.map((row, i) => (
          <motion.li
            key={row.label}
            initial={reduce ? false : { opacity: 0, transform: "translateY(8px)" }}
            whileInView={{ opacity: 1, transform: "translateY(0px)" }}
            viewport={{ once: true, margin: VIEW_MARGIN }}
            transition={{
              duration: 0.4,
              ease: EASE_OUT,
              delay: reduce ? 0 : 0.2 + i * 0.12,
            }}
            className="flex items-baseline justify-between gap-2 font-mono text-[0.68rem] leading-[1.3]"
          >
            <span className="uppercase tracking-widest text-ink-3">
              {row.label}
            </span>
            <span
              aria-hidden
              className="min-w-4 flex-1 border-b border-dotted border-line"
            />
            <span className="font-semibold tabular-nums text-ink">
              {row.value}
            </span>
          </motion.li>
        ))}
      </ul>
      <motion.div
        initial={reduce ? false : { opacity: 0, transform: "translateY(8px)" }}
        whileInView={{ opacity: 1, transform: "translateY(0px)" }}
        viewport={{ once: true, margin: VIEW_MARGIN }}
        transition={{
          duration: 0.45,
          ease: EASE_OUT,
          delay: reduce ? 0 : 0.2 + SPLIT.length * 0.12,
        }}
        className="perf mt-2 pt-2"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-widest text-ink-3">
            <Shield size={12} className="text-mint" />
            all-in / person
          </span>
          <span className="font-mono text-[1.02rem] font-bold tabular-nums text-ink">
            ₹47,500
          </span>
        </div>
        <div className="barcode mt-1.5 h-3 text-ink/50" />
      </motion.div>
    </div>
  );
}

/* ---- 4 · Not a template: the itinerary reshuffles twice as it scrolls
        in, the price follows, then it settles on the version you kept ---- */

const DAYS = [
  { id: "surf", label: "Surf morning", dot: "bg-teal" },
  { id: "temple", label: "Temple + rice terraces", dot: "bg-violet" },
  { id: "spa", label: "Spa · slow day", dot: "bg-coral" },
];
const ORDERS = [
  ["surf", "temple", "spa"],
  ["temple", "spa", "surf"],
  ["spa", "surf", "temple"],
];
const PRICES = ["₹46,900", "₹47,500", "₹47,100"];

function Reshuffle() {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: VIEW_MARGIN });
  const [round, setRound] = useState(reduce ? ORDERS.length - 1 : 0);

  useEffect(() => {
    if (reduce) {
      /* preference lands after mount: settle on the final arrangement */
      setRound(ORDERS.length - 1);
      return;
    }
    if (!inView) return;
    /* two swaps, then hold — the version you shaped */
    const timers = [
      setTimeout(() => setRound(1), 900),
      setTimeout(() => setRound(2), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  const order = ORDERS[round];

  return (
    <div ref={ref} className="w-full max-w-[260px]" aria-hidden>
      <ul className="space-y-1.5">
        {order.map((id, i) => {
          const d = DAYS.find((x) => x.id === id)!;
          return (
            <motion.li
              key={d.id}
              layout={!reduce}
              transition={{ type: "spring", duration: 0.55, bounce: 0.22 }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5"
            >
              <span className="font-mono text-[0.58rem] font-bold uppercase tracking-widest text-white/60">
                day {i + 1}
              </span>
              <span className={`h-1.5 w-1.5 rounded-full ${d.dot}`} />
              <span className="truncate text-[0.76rem] font-medium text-white">
                {d.label}
              </span>
            </motion.li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5">
        <span className="font-mono text-[0.58rem] uppercase tracking-widest text-white/60">
          re-priced live
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={PRICES[round]}
            initial={reduce ? false : { opacity: 0, transform: "translateY(6px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={reduce ? undefined : { opacity: 0, transform: "translateY(-6px)" }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="flex items-center gap-1 font-mono text-[0.82rem] font-bold tabular-nums text-white"
          >
            <Check size={11} className="text-mint" />
            {PRICES[round]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- section */

export default function WhyPillars() {
  return (
    <section className="relative py-16 lg:py-12" aria-label="Why Zuumm Holidays">
      {/* section aurora */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-16 -z-10 h-[560px] bg-[radial-gradient(45%_60%_at_20%_30%,rgba(255,174,26,0.12),transparent_70%),radial-gradient(45%_60%_at_80%_70%,rgba(255,59,92,0.09),transparent_70%)]"
      />

      <div className="container-x">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="display text-3xl text-ink lg:text-[2rem]">
              Why Zuumm Holidays
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-2 lg:mt-2 lg:text-[0.95rem]">
              Four promises we keep on every trip — watch the systems behind
              them work.
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-7 lg:grid-cols-12 lg:gap-4">
          <Tile
            span="lg:col-span-7"
            dark
            tag="whatsapp · 24×7"
            glow={
              <>
                <div
                  aria-hidden
                  className="absolute -left-20 -top-24 h-60 w-60 rounded-full bg-mint/15 blur-3xl"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-coral/20 blur-3xl"
                />
              </>
            }
            title="Tracked, every step."
            line="A real ground team rides along on WhatsApp, 24×7 — pickups reconfirmed, problems caught before they reach you."
          >
            <ChatDemo />
          </Tile>
          <Tile
            span="lg:col-span-5"
            tag="vetting"
            wash="bg-[linear-gradient(135deg,#ffffff_55%,#ffedf0_140%)]"
            watermark="DPS"
            title="Only handpicked, rated hotels & activities."
            line="Every stay and experience is vetted and rated before the engine can price it — the rest never make the list."
          >
            <HandpickedList />
          </Tile>
          <Tile
            span="lg:col-span-5"
            tag="quote"
            wash="bg-[linear-gradient(135deg,#ffffff_55%,rgba(15,163,107,0.1)_140%)]"
            title="One price. Zero surprises."
            line="The only ones to show the full split — flights, hotels, activities, transfers, visa, taxes — itemised before you pay."
          >
            <PriceSplit />
          </Tile>
          <Tile
            span="lg:col-span-7"
            dark
            tag="re-routed live"
            glow={
              <>
                <div
                  aria-hidden
                  className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sun/15 blur-3xl"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-coral/20 blur-3xl"
                />
              </>
            }
            title="Your trip, not a template."
            line="Swap days, hotels and pace — the engine re-routes and re-prices in real time, and you book the version you shaped."
          >
            <Reshuffle />
          </Tile>
        </Stagger>

        {/* the decision moment: they've watched the systems run */}
        <Reveal>
          <div className="mt-10 text-center lg:mt-7">
            <a
              href={wizardHref()}
              onClick={() => track("home_why_cta")}
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-9 py-4 text-[1.05rem] font-bold text-white shadow-[0_22px_54px_-20px_rgba(22,18,31,0.5)] transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]"
            >
              Build my trip
              <ArrowRight size={18} />
            </a>
            <p className="mt-2.5 text-[0.78rem] text-ink-3">
              Free to plan · no sign-up · priced from real rates
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
