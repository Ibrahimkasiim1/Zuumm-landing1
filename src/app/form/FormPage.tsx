"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  ArrowRight,
  Bed,
  Check,
  Compass,
  MessageDot,
  Passport,
  Plane,
  Receipt,
  Repeat,
  Star,
  Sun,
  Ticket,
  Users,
  WhatsApp,
} from "@/components/Icons";

/* /form — the classic OTA booking desk, rebuilt in the site's own material.

   The page follows the reference skeleton exactly — nav · hero with a
   departures board · the ticket widget (seven services, one panel each) ·
   stats strip · why grid · Zippy chat band · footer · the Zippy popup —
   but every surface speaks the landing page's language: paper ground,
   hairline --line borders, ink actives, coral conversion buttons, mono on
   every number and label, violet reserved for the AI voice and mint for
   live operational truth.

   Entirely static: tabs, toggles and steppers work as UI, but no submit,
   search or chat goes anywhere.

   The departures board is this page's One Ticker — every few seconds one
   row swaps to the next destination with the house odometer roll. It rests
   under reduced motion and when the tab is hidden. */

const EASE = [0.21, 0.6, 0.35, 1] as const;

/* ---------------------------------------------------------- small icons
   (strokes match components/Icons.tsx: 24 viewBox, stroke-width 2) */

type P = React.SVGProps<SVGSVGElement> & { size?: number };
const svg = (p: P) => ({
  width: p.size ?? 16,
  height: p.size ?? 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});
const SwapIcon = (p: P) => (
  <svg {...svg(p)}>
    <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);
const SendIcon = (p: P) => (
  <svg {...svg(p)}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
  </svg>
);
const MailIcon = (p: P) => (
  <svg {...svg(p)}>
    <path d="M3 5h18v14H3z" />
    <path d="M3 5l9 7 9-7" />
  </svg>
);
const ChevronDown = (p: P) => (
  <svg {...svg(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ------------------------------------------------------------ the board */

type Departure = { code: string; city: string; status: "On time" | "Boarding" };
const DEPARTURES: Departure[] = [
  { code: "DPS", city: "Bali", status: "On time" },
  { code: "DXB", city: "Dubai", status: "Boarding" },
  { code: "SIN", city: "Singapore", status: "On time" },
  { code: "MLE", city: "Maldives", status: "On time" },
  { code: "HAN", city: "Vietnam", status: "Boarding" },
  { code: "CMB", city: "Sri Lanka", status: "On time" },
];
const BOARD_ROWS = 4;

/* one split-flap character; rolls on the house curve when it changes */
function Flap({ ch }: { ch: string }) {
  const reduce = useReducedMotionSafe();
  return (
    <span className="relative flex h-7 w-5 items-center justify-center overflow-hidden rounded-[4px] border border-line bg-gradient-to-b from-white to-paper-2 font-mono text-[0.9rem] font-semibold text-ink shadow-[0_1px_0_rgba(22,18,31,0.06)] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-ink/10 after:content-['']">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ch}
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduce ? 0.3 : 0.4, ease: EASE }}
          className="inline-block"
        >
          {ch}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function DeparturesBoard() {
  const reduce = useReducedMotionSafe();
  /* offset walks the list; each visible row shows offset+i */
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      if (!document.hidden) setOffset((o) => (o + 1) % DEPARTURES.length);
    }, 4000);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="min-w-[280px] rounded-3xl border border-line bg-white p-5 shadow-[0_24px_70px_-40px_rgba(22,18,31,0.35)]"
    >
      <div className="mb-3 flex items-center justify-between font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
        <span>Departures</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-mint" />
          Live
        </span>
      </div>
      {Array.from({ length: BOARD_ROWS }, (_, i) => {
        const d = DEPARTURES[(offset + i) % DEPARTURES.length];
        return (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-dashed border-line py-2 last:border-b-0"
          >
            <span className="flex gap-[3px]">
              {d.code.split("").map((ch, j) => (
                <Flap key={j} ch={ch} />
              ))}
            </span>
            <span className="min-w-[6rem] font-mono text-[0.72rem] text-ink-2">
              {d.city}
            </span>
            <span
              className={`ml-auto rounded-md px-2 py-0.5 font-mono text-[0.62rem] font-semibold tracking-wide ${
                d.status === "Boarding"
                  ? "bg-sun/15 text-amber-700"
                  : "bg-mint/12 text-mint-deep"
              }`}
            >
              {d.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------- form furniture */

function Field({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 rounded-2xl border border-line bg-white px-4 pb-2 pt-2.5 transition-colors focus-within:border-coral/50 focus-within:ring-2 focus-within:ring-coral/25">
      <label
        htmlFor={id}
        className="mb-0.5 block text-[0.78rem] font-medium text-ink-3"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-transparent text-[0.98rem] font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-3/70";

function SubmitBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-coral text-[0.95rem] font-bold text-white shadow-[0_14px_40px_-18px_rgba(255,59,92,0.55)] transition-[background-color,transform] duration-150 ease-out hover:bg-coral-deep active:scale-[0.99] motion-reduce:transition-none"
    >
      {children}
      <ArrowRight size={16} />
    </button>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-3">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------- services */

type ServiceKey =
  | "flight"
  | "hotel"
  | "activity"
  | "holiday"
  | "visa"
  | "quote"
  | "group";

const SERVICES: { key: ServiceKey; label: string; icon: React.ReactNode }[] = [
  { key: "flight", label: "Flights", icon: <Plane size={14} /> },
  { key: "hotel", label: "Hotels", icon: <Bed size={14} /> },
  { key: "activity", label: "Activities", icon: <Compass size={14} /> },
  { key: "holiday", label: "Holiday", icon: <Sun size={14} /> },
  { key: "visa", label: "Apply Visa", icon: <Passport size={14} /> },
  { key: "quote", label: "Get a Quote", icon: <MailIcon size={14} /> },
  { key: "group", label: "Group Tour", icon: <Users size={14} /> },
];

/* travellers stepper (hotels panel) */
type GuestKey = "adults" | "children" | "infants";
const GUEST_ROWS: { key: GuestKey; label: string; sub: string; min: number }[] = [
  { key: "adults", label: "Adults", sub: "12+ years", min: 1 },
  { key: "children", label: "Children", sub: "2–12 years", min: 0 },
  { key: "infants", label: "Infants", sub: "0–2 years", min: 0 },
];

/* ------------------------------------------------------------- the page */

export default function FormPage() {
  const [tab, setTab] = useState<ServiceKey>("flight");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stars, setStars] = useState<Set<string>>(new Set());
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [guests, setGuests] = useState<Record<GuestKey, number>>({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const [popupOpen, setPopupOpen] = useState(false);

  const noop = (e: React.FormEvent) => e.preventDefault();

  const toggleStar = (s: string) =>
    setStars((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const bump = (key: GuestKey, dir: 1 | -1) =>
    setGuests((g) => {
      const min = GUEST_ROWS.find((r) => r.key === key)!.min;
      const next = Math.min(9, Math.max(min, g[key] + dir));
      return { ...g, [key]: next };
    });

  const guestSummary = [
    `${guests.adults} Adult${guests.adults === 1 ? "" : "s"}`,
    guests.children > 0 &&
      `${guests.children} Child${guests.children === 1 ? "" : "ren"}`,
    guests.infants > 0 &&
      `${guests.infants} Infant${guests.infants === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-paper text-ink">
      {/* ================= nav ================= */}
      <nav className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="container-x flex items-center justify-between py-3">
          <a href="/form" className="flex items-center gap-2">
            <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-coral">
              ZUUMM
            </span>
            <span className="rounded-md bg-violet-soft px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold tracking-[0.08em] text-violet">
              AI
            </span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {(
              [
                ["Flights", "flight"],
                ["Hotels", "hotel"],
                ["Activities", "activity"],
              ] as const
            ).map(([label, service]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setTab(service);
                  document
                    .getElementById("book")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="text-[0.88rem] font-medium text-ink-2 transition-colors hover:text-ink"
              >
                {label}
              </button>
            ))}
            {[
              ["Why us", "#why"],
              ["Support", "#chat"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[0.88rem] font-medium text-ink-2 transition-colors hover:text-ink"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <span
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-mint/30 bg-mint/10 text-mint-deep"
            >
              <WhatsApp size={17} />
            </span>
            <button
              type="button"
              onClick={() => setPopupOpen((o) => !o)}
              className="flex min-h-9 items-center gap-1.5 rounded-full border border-violet/25 bg-violet-soft px-4 text-[0.84rem] font-semibold text-violet transition-colors hover:border-violet/50"
            >
              <MessageDot size={14} />
              Zippy
            </button>
            <button
              type="button"
              className="min-h-9 rounded-full bg-ink px-4.5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-ink-deep"
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* ================= hero + ticket ================= */}
      <section
        id="book"
        className="relative overflow-hidden border-b border-line pb-16 pt-12 md:pt-16"
      >
        {/* the landing page's warm radial atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(56rem_30rem_at_12%_-10%,rgba(255,174,26,0.10),transparent_60%),radial-gradient(44rem_30rem_at_100%_0%,rgba(255,59,92,0.07),transparent_55%)]"
        />

        <div className="container-x relative">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-10">
            <div className="max-w-[560px]">
              <p className="eyebrow text-coral">AI-powered travel desk</p>
              <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.4rem)] text-ink">
                Let&rsquo;s find your{" "}
                <em className="font-medium italic text-coral-deep">perfect</em>{" "}
                trip.
              </h1>
            </div>
            <div className="hidden md:block">
              <DeparturesBoard />
            </div>
          </div>

          {/* ---------------- the ticket ---------------- */}
          <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_24px_70px_-40px_rgba(22,18,31,0.35)]">
            {/* service selector */}
            <div
              role="tablist"
              aria-label="Booking services"
              className="flex flex-wrap gap-2 border-b border-line bg-paper-2 px-4 py-3.5"
            >
              {SERVICES.map((s) => {
                const active = tab === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(s.key)}
                    className={`flex min-w-[7.5rem] flex-1 items-center justify-center gap-2 rounded-2xl border px-2.5 py-2.5 transition-all duration-150 ${
                      active
                        ? "border-ink bg-ink"
                        : "border-line bg-white hover:-translate-y-px hover:border-ink-3/50"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                        active ? "bg-coral text-white" : "bg-paper-2 text-ink"
                      }`}
                    >
                      {s.icon}
                    </span>
                    <span
                      className={`whitespace-nowrap text-[0.8rem] font-semibold ${
                        active ? "text-white" : "text-ink-2"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 md:p-7">
              {/* ---------- flights ---------- */}
              {tab === "flight" && (
                <form onSubmit={noop}>
                  <div
                    role="radiogroup"
                    aria-label="Trip type"
                    className="mb-5 inline-flex gap-0.5 rounded-full bg-paper-2 p-1"
                  >
                    {(
                      [
                        ["oneway", "One way"],
                        ["roundtrip", "Round trip"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={tripType === key}
                        onClick={() => setTripType(key)}
                        className={`rounded-full px-4.5 py-2 text-[0.82rem] font-semibold transition-colors ${
                          tripType === key
                            ? "bg-ink text-white"
                            : "text-ink-2 hover:text-ink"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="mb-3.5 flex flex-col items-stretch gap-3.5 sm:flex-row sm:items-end">
                    <Field id="f-from" label="Where are you departing from?">
                      <input
                        id="f-from"
                        type="text"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        placeholder="e.g. Chennai (MAA)"
                        autoComplete="off"
                        className={inputCls}
                      />
                    </Field>
                    <button
                      type="button"
                      aria-label="Swap origin and destination"
                      onClick={() => {
                        setFrom(to);
                        setTo(from);
                      }}
                      className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-coral-deep transition-all duration-200 hover:rotate-180 hover:border-coral/50 sm:self-auto"
                    >
                      <SwapIcon size={16} />
                    </button>
                    <Field id="f-to" label="Where are you traveling to?">
                      <input
                        id="f-to"
                        type="text"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="e.g. Bali (DPS)"
                        autoComplete="off"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="mb-3.5 flex flex-col gap-3.5 sm:flex-row">
                    <Field id="f-depart" label="When do you want to start your trip?">
                      <input
                        id="f-depart"
                        type="text"
                        placeholder="DD/MM/YYYY"
                        className={inputCls}
                      />
                    </Field>
                    {tripType === "roundtrip" && (
                      <Field id="f-return" label="When do you want to return?">
                        <input
                          id="f-return"
                          type="text"
                          placeholder="DD/MM/YYYY"
                          className={inputCls}
                        />
                      </Field>
                    )}
                  </div>

                  <SubmitBtn>Find my flights</SubmitBtn>
                  <Hint>Live fares across 400+ airline partners</Hint>
                </form>
              )}

              {/* ---------- hotels ---------- */}
              {tab === "hotel" && (
                <form onSubmit={noop}>
                  <div className="mb-4 rounded-2xl border border-coral/20 bg-coral-soft px-4 py-3 text-[0.86rem] leading-relaxed text-ink-2">
                    Tell us your travel dates and guests so we can find rooms
                    that fit.
                  </div>

                  <div className="mb-3.5 flex">
                    <Field id="h-city" label="City">
                      <input
                        id="h-city"
                        type="text"
                        placeholder="e.g. Bali, Dubai, Singapore"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="mb-4 flex flex-col gap-3.5 sm:flex-row">
                    <Field id="h-in" label="Check-in">
                      <input
                        id="h-in"
                        type="text"
                        placeholder="DD/MM/YYYY"
                        className={inputCls}
                      />
                    </Field>
                    <Field id="h-out" label="Check-out">
                      <input
                        id="h-out"
                        type="text"
                        placeholder="DD/MM/YYYY"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <p className="mb-2.5 text-[0.82rem] font-medium text-ink-3">
                    Star category
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {["3", "4", "5"].map((s) => {
                      const active = stars.has(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleStar(s)}
                          className={`flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-[0.84rem] font-semibold transition-colors ${
                            active
                              ? "border-ink bg-ink text-white"
                              : "border-line bg-white text-ink-2 hover:border-coral/40 hover:text-ink"
                          }`}
                        >
                          <Star
                            size={12}
                            fill="currentColor"
                            className={active ? "text-sun" : "text-ink-3/60"}
                          />
                          {s} star
                        </button>
                      );
                    })}
                  </div>

                  {/* travellers */}
                  <button
                    type="button"
                    aria-expanded={guestsOpen}
                    onClick={() => setGuestsOpen((o) => !o)}
                    className="mb-2 flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-2.5 text-left transition-colors hover:border-ink-3/50"
                  >
                    <span>
                      <span className="mb-0.5 block text-[0.78rem] font-medium text-ink-3">
                        No. of travellers
                      </span>
                      <span className="text-[0.98rem] font-semibold text-ink">
                        {guestSummary}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-ink-3 transition-transform duration-200 ${
                        guestsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {guestsOpen && (
                    <div className="mb-4 rounded-2xl border border-line bg-white px-4">
                      {GUEST_ROWS.map((row) => (
                        <div
                          key={row.key}
                          className="flex items-center border-b border-line py-3 last:border-b-0"
                        >
                          <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper-2 text-ink">
                            <Users size={15} />
                          </span>
                          <span>
                            <span className="block text-[0.92rem] font-semibold text-ink">
                              {row.label}
                            </span>
                            <span className="block text-[0.76rem] text-ink-3">
                              {row.sub}
                            </span>
                          </span>
                          <span className="ml-auto flex items-center gap-4">
                            <button
                              type="button"
                              aria-label={`Decrease ${row.label.toLowerCase()}`}
                              disabled={guests[row.key] <= row.min}
                              onClick={() => bump(row.key, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-coral/50 hover:text-coral-deep disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink"
                            >
                              −
                            </button>
                            <span className="min-w-4 text-center font-mono text-[0.95rem] font-semibold tabular-nums">
                              {guests[row.key]}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${row.label.toLowerCase()}`}
                              disabled={guests[row.key] >= 9}
                              onClick={() => bump(row.key, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-coral/50 hover:text-coral-deep disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink"
                            >
                              +
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <SubmitBtn>Find my hotels</SubmitBtn>
                  <Hint>6,00,000+ properties, from boutique stays to resorts</Hint>
                </form>
              )}

              {/* ---------- activities ---------- */}
              {tab === "activity" && (
                <form onSubmit={noop}>
                  <div className="mb-3.5 flex">
                    <Field id="a-dest" label="Where do you want to explore?">
                      <input
                        id="a-dest"
                        type="text"
                        placeholder="City or landmark"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <SubmitBtn>Find my activities</SubmitBtn>
                  <Hint>30,000+ curated tours, experiences and day trips</Hint>
                </form>
              )}

              {/* ---------- holiday ---------- */}
              {tab === "holiday" && (
                <form onSubmit={noop}>
                  <div className="mb-3.5 flex flex-col gap-3.5 sm:flex-row">
                    <Field id="p-from" label="Departing from">
                      <input
                        id="p-from"
                        type="text"
                        placeholder="e.g. Chennai (MAA)"
                        autoComplete="off"
                        className={inputCls}
                      />
                    </Field>
                    <Field id="p-dest" label="Destination">
                      <input
                        id="p-dest"
                        type="text"
                        placeholder="e.g. Bali, Maldives, Dubai"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="mb-3.5 flex flex-col gap-3.5 sm:flex-row">
                    <Field id="p-start" label="Start date">
                      <input
                        id="p-start"
                        type="text"
                        placeholder="DD/MM/YYYY"
                        className={inputCls}
                      />
                    </Field>
                    <Field id="p-nights" label="Number of nights">
                      <input
                        id="p-nights"
                        type="number"
                        min={1}
                        max={60}
                        defaultValue={5}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="mb-3.5 flex">
                    <Field id="p-star" label="Star category">
                      <select id="p-star" className={inputCls} defaultValue="any">
                        <option value="any">Any category</option>
                        <option value="3">3 star</option>
                        <option value="4">4 star</option>
                        <option value="5">5 star</option>
                      </select>
                    </Field>
                  </div>
                  <SubmitBtn>Find holiday packages</SubmitBtn>
                  <Hint>
                    Priced from real seasonal rates — taxes, transfers and tips
                    included
                  </Hint>
                </form>
              )}

              {/* ---------- visa ---------- */}
              {tab === "visa" && (
                <div>
                  <h3 className="display text-[1.25rem] text-ink">
                    Visa assistance, handled for you.
                  </h3>
                  <p className="mb-6 mt-2 max-w-[460px] text-[0.9rem] leading-relaxed text-ink-2">
                    Our in-house visa engine pre-validates your documents,
                    flags errors before anything is submitted and tracks the
                    decision live — 99.7% of applications approved, across
                    130+ countries.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab("quote")}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-coral text-[0.95rem] font-bold text-white shadow-[0_14px_40px_-18px_rgba(255,59,92,0.55)] transition-[background-color,transform] duration-150 ease-out hover:bg-coral-deep active:scale-[0.99] motion-reduce:transition-none"
                  >
                    Get started
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ---------- quote ---------- */}
              {tab === "quote" && (
                <form onSubmit={noop}>
                  <div className="grain relative mb-5 overflow-hidden rounded-3xl bg-ink p-5 text-white">
                    <div
                      aria-hidden
                      className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-coral/20 blur-3xl"
                    />
                    <span className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <MailIcon size={17} />
                    </span>
                    <h3 className="display relative text-[1.2rem]">Get a quote.</h3>
                    <p className="relative mt-1 max-w-[440px] text-[0.84rem] leading-relaxed text-white/75">
                      Share your details and a holiday expert gets in touch —
                      every quote priced from real contracted rates.
                    </p>
                  </div>
                  <div className="mb-3.5 flex flex-col gap-3.5 sm:flex-row">
                    <Field id="q-dest" label="Destination *">
                      <input
                        id="q-dest"
                        type="text"
                        placeholder="e.g. Vietnam"
                        className={inputCls}
                      />
                    </Field>
                    <Field id="q-dep" label="Departure city *">
                      <input
                        id="q-dep"
                        type="text"
                        placeholder="e.g. New Delhi"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="mb-3.5 flex flex-col gap-3.5 sm:flex-row">
                    <Field id="q-name" label="Name *">
                      <input
                        id="q-name"
                        type="text"
                        placeholder="Your full name"
                        className={inputCls}
                      />
                    </Field>
                    <Field id="q-phone" label="Phone *">
                      <input
                        id="q-phone"
                        type="tel"
                        placeholder="Phone number"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="mb-4 flex">
                    <Field id="q-email" label="Email ID *">
                      <input
                        id="q-email"
                        type="email"
                        placeholder="you@email.com"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <label className="mb-4 flex cursor-pointer items-start gap-2.5 text-[0.8rem] leading-relaxed text-ink-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 h-4 w-4 shrink-0 accent-coral"
                    />
                    <span>
                      I have read and agree to the{" "}
                      <a href="#" className="font-semibold text-coral-deep underline underline-offset-2">
                        User Agreement
                      </a>{" "}
                      &amp;{" "}
                      <a href="#" className="font-semibold text-coral-deep underline underline-offset-2">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                  <SubmitBtn>Submit</SubmitBtn>
                </form>
              )}

              {/* ---------- group ---------- */}
              {tab === "group" && (
                <div>
                  <h3 className="display text-[1.25rem] text-ink">
                    Curated group departures.
                  </h3>
                  <p className="mb-6 mt-2 max-w-[460px] text-[0.9rem] leading-relaxed text-ink-2">
                    Fixed-date group tours with flights, stays and a trip lead
                    included. Pick a destination to see upcoming departures.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {["Bali", "Thailand", "Vietnam", "Singapore"].map((d) => (
                      <a
                        key={d}
                        href="#"
                        className="flex min-w-[10rem] flex-1 items-center justify-between gap-2 rounded-2xl border border-line bg-white px-4.5 py-3.5 text-[0.92rem] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-coral/40"
                      >
                        {d}
                        <ArrowRight size={15} className="text-coral-deep" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= stats strip ================= */}
      <section aria-label="Platform coverage" className="border-b border-line bg-paper-2">
        <div className="container-x grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["6,00,000+", "Hotels worldwide"],
            ["400+", "Airlines, live fares"],
            ["30,000+", "Activities & tours"],
            ["99.7%", "Visa approvals"],
            ["130+", "Countries covered"],
            ["24×7", "Ground team on WhatsApp"],
          ].map(([num, label], i) => (
            <div
              key={label}
              className={`px-4 py-6 text-center ${
                i < 5 ? "lg:border-r lg:border-dashed lg:border-line" : ""
              }`}
            >
              <span className="block font-mono text-[1.45rem] font-bold tabular-nums text-ink">
                {num}
              </span>
              <span className="mt-1 block text-[0.78rem] leading-snug text-ink-3">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= why ================= */}
      <section id="why" className="py-16 md:py-20">
        <div className="container-x">
          <div className="mb-9 max-w-[560px]">
            <p className="eyebrow text-coral">Why travellers choose us</p>
            <h2 className="display mt-4 text-3xl text-ink md:text-[2.4rem]">
              Why book with us.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <MessageDot size={17} />,
                chip: "bg-mint/15 text-mint-deep",
                t: "Tracked, every step",
                d: "A real ground team rides along on WhatsApp, 24×7 — pickups reconfirmed, problems caught before they reach you.",
              },
              {
                icon: <Star size={17} />,
                chip: "bg-sun/15 text-amber-700",
                t: "Only handpicked stays",
                d: "Every hotel and experience is vetted and rated before the engine can price it — the rest never make the list.",
              },
              {
                icon: <Receipt size={17} />,
                chip: "bg-coral-soft text-coral",
                t: "One price. Zero surprises",
                d: "Flights, hotels, activities, transfers, visa and taxes — the full split, itemised before you pay.",
              },
              {
                icon: <Repeat size={17} />,
                chip: "bg-violet-soft text-violet",
                t: "Your trip, not a template",
                d: "Swap days, hotels and pace — the engine re-routes and re-prices in real time, and you book the version you shaped.",
              },
              {
                icon: <Passport size={17} />,
                chip: "bg-teal-soft text-teal",
                t: "A visa team inside",
                d: "Documents pre-validated, appointments booked, decisions tracked live — 99.7% approvals across 130+ countries.",
              },
              {
                icon: <Ticket size={17} />,
                chip: "bg-paper-2 text-ink",
                t: "One trip, one place",
                d: "Flights, stays and experiences booked together land in a single itinerary you can actually follow.",
              },
            ].map((c) => (
              <div key={c.t} className="flex min-h-40 flex-col gap-3.5 bg-paper p-6">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.chip}`}
                >
                  {c.icon}
                </span>
                <h3 className="text-[1.02rem] font-bold text-ink">{c.t}.</h3>
                <p className="text-[0.86rem] leading-relaxed text-ink-2">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= chat band ================= */}
      <section id="chat" className="border-t border-line bg-paper-2 py-16 md:py-20">
        <div className="container-x grid items-center gap-11 md:grid-cols-2">
          <div>
            <p className="eyebrow text-violet">Talk to Zippy</p>
            <h2 className="display mt-4 text-[1.8rem] text-ink md:text-[2.1rem]">
              Skip the search bar. Just ask.
            </h2>
            <p className="mt-4 max-w-[420px] text-[0.95rem] leading-relaxed text-ink-2">
              Tell Zippy what you&rsquo;re after — &ldquo;Bali for 6 nights
              under ₹50k a person&rdquo; or &ldquo;cheapest flight to Dubai
              next weekend&rdquo; — and get real options in seconds, with a
              human on standby.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Answers pull live prices across flights, hotels and activities",
                "Hands off to a human expert on WhatsApp, any time",
                "Remembers your trip so you never repeat yourself",
              ].map((li) => (
                <li key={li} className="flex items-start gap-2.5 text-[0.9rem] text-ink">
                  <Check size={15} className="mt-0.5 shrink-0 text-mint" />
                  {li}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_70px_-40px_rgba(22,18,31,0.35)] md:justify-self-center">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet font-display text-[0.95rem] font-bold text-white">
                Z
              </span>
              <span>
                <span className="block text-[0.92rem] font-semibold text-ink">
                  Zippy
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[0.66rem] text-mint-deep">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                  Online now
                </span>
              </span>
            </div>
            <div className="flex min-h-[260px] flex-col gap-3 p-5">
              <div className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-paper-2 px-3.5 py-2.5 text-[0.86rem] leading-relaxed text-ink">
                Hi! I&rsquo;m Zippy, your AI travel concierge. Where are you
                headed?
              </div>
              <div className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-ink px-3.5 py-2.5 text-[0.86rem] font-medium leading-relaxed text-white">
                Bali for 6 nights, couple, under ₹50k a person.
              </div>
              <div className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-paper-2 px-3.5 py-2.5 text-[0.86rem] leading-relaxed text-ink">
                Easy — I have real itineraries from{" "}
                <span className="font-mono font-semibold tabular-nums">₹47,500</span>{" "}
                all-in: hotels, activities, transfers and visa included. Want
                the day-by-day?
              </div>
            </div>
            <div className="flex gap-2 border-t border-line px-4 py-3.5">
              {/* display-only: the demo conversation is the content — the
                  input renders but accepts nothing */}
              <input
                type="text"
                readOnly
                tabIndex={-1}
                aria-hidden
                placeholder="Ask about a flight, stay or activity…"
                className="pointer-events-none min-w-0 flex-1 select-none rounded-full border border-line bg-paper-2 px-4 py-2.5 text-[0.86rem] text-ink outline-none placeholder:text-ink-3"
              />
              <button
                type="button"
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet text-white transition-colors hover:bg-violet-deep"
              >
                <SendIcon size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= footer ================= */}
      <footer className="border-t border-line bg-paper-2 py-6 text-center">
        <p className="container-x font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">
          Flights, stays and experiences, planned together · 24×7 ground team
          · AI-enabled
        </p>
      </footer>

      {/* ================= Zippy popup (opened from the nav chip) ================= */}
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="fixed bottom-6 right-6 z-[100] w-80 max-w-[calc(100vw-3rem)] origin-bottom-right overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_70px_-32px_rgba(22,18,31,0.45)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet font-display text-[0.85rem] font-bold text-white">
                Z
              </span>
              <span>
                <span className="block text-[0.88rem] font-semibold text-ink">
                  Zippy
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[0.62rem] text-mint-deep">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                  Online now
                </span>
              </span>
            </div>
            <div className="min-h-[150px] p-4">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-paper-2 px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-ink">
                Hey, need help with a booking?
              </div>
            </div>
            <div className="flex gap-2 border-t border-line px-3.5 py-3">
              <input
                type="text"
                readOnly
                tabIndex={-1}
                aria-hidden
                placeholder="Type a message…"
                className="pointer-events-none min-w-0 flex-1 select-none rounded-full border border-line bg-paper-2 px-3.5 py-2 text-[0.82rem] text-ink outline-none placeholder:text-ink-3"
              />
              <button
                type="button"
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet text-white transition-colors hover:bg-violet-deep"
              >
                <SendIcon size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
