"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MONTHS_LONG } from "@/lib/planner/options";
import { ChevronRight } from "@/components/plan/icons";

/* A designed calendar, not the browser's: two months side by side, both
   ends of the stay circled in ink and the nights between them shaded as a
   band. This picker sets the trip's length — there is no separate nights
   control — so it reads as a range: the first tap starts the stay, the
   second ends it, and the nights between are what the plan is priced on.

   While a start is pending, only a same-day return is disabled — a trip
   runs as long as the traveller says it does. Clear empties, Save closes;
   outside click and Escape close too. Past days are quietly disabled. A
   footer row of chips (Exact dates … ± 7 days) records how flexible the
   dates are. */

/** a stay has to span at least one night */
const MIN_NIGHTS = 1;

const FLEX_CHIPS: { label: string; days: number }[] = [
  { label: "Exact dates", days: 0 },
  { label: "± 1 day", days: 1 },
  { label: "± 2 days", days: 2 },
  { label: "± 3 days", days: 3 },
  { label: "± 7 days", days: 7 },
];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseIso(s: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = s.split("-").map(Number);
  return y && m && d ? { y, m: m - 1, d } : null;
}

/** days since an arbitrary epoch — cheap, timezone-proof day arithmetic */
function dayNum(y: number, m: number, d: number): number {
  return Math.round(new Date(Date.UTC(y, m, d)).getTime() / 86400000);
}

function Month({
  y,
  m,
  todayN,
  startN,
  endN,
  pendingN,
  onPick,
}: {
  y: number;
  m: number;
  todayN: number;
  startN: number | null;
  endN: number | null;
  /** a started-but-unfinished range: only lengths it allows stay tappable */
  pendingN: number | null;
  onPick: (isoDate: string) => void;
}) {
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-[16.4rem]">
      <p className="mb-3 text-[1rem] font-bold text-ink">
        {MONTHS_LONG[m]} {y}
      </p>
      <div className="grid grid-cols-7">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <span
            key={w}
            className="pb-2 text-center text-[0.68rem] font-semibold text-ink-3"
          >
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`b${i}`} />;
          const n = dayNum(y, m, d);
          /* while a return date is awaited, only days before the start are
             dead — the start itself stays tappable so a mis-tap can be
             moved, and the stay runs as long as it needs to */
          const outOfRange =
            pendingN !== null && n !== pendingN && n - pendingN < MIN_NIGHTS;
          const disabled = n < todayN || outOfRange;
          const isStart = n === startN;
          const isEnd = n === endN;
          const inStay = startN !== null && endN !== null && n > startN && n < endN;
          const isToday = n === todayN;
          return (
            <span
              key={d}
              className={`flex h-9 items-center justify-center ${
                inStay || ((isStart || isEnd) && startN !== endN)
                  ? `bg-paper-2 ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`
                  : ""
              }`}
            >
              <button
                onClick={() => !disabled && onPick(iso(y, m, d))}
                disabled={disabled}
                aria-label={`${d} ${MONTHS_LONG[m]} ${y}`}
                aria-pressed={isStart || isEnd}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[0.84rem] font-semibold transition-[transform,background-color,color] duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet ${
                  isStart || isEnd
                    ? "bg-ink text-white"
                    : disabled
                      ? "cursor-default text-ink-3/45"
                      : `cursor-pointer text-ink hover:bg-paper-2 active:scale-90 ${
                          isToday ? "border border-ink" : ""
                        }`
                }`}
              >
                {d}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  value,
  nights,
  flex,
  onPickRange,
  onFlex,
  onClear,
  onClose,
}: {
  /** ISO start date, or "" */
  value: string;
  /** stay length — paints the band and the return-day circle */
  nights: number;
  /** ± days of flexibility (0 = exact) */
  flex: number;
  /** both ends at once: this picker owns the trip's length */
  onPickRange: (isoDate: string, nights: number) => void;
  onFlex: (days: number) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  const todayN = dayNum(now.getFullYear(), now.getMonth(), now.getDate());
  const start = value ? parseIso(value) : null;

  /* a range being drawn: the first tap lands here and waits for its
     return date, so the committed dates stay untouched until both ends
     are known */
  const [pending, setPending] = useState<{ isoDate: string; n: number } | null>(null);

  const committedStartN = start ? dayNum(start.y, start.m, start.d) : null;
  const startN = pending ? pending.n : committedStartN;
  const endN = pending ? null : committedStartN !== null ? committedStartN + nights : null;

  const pickDay = (isoDate: string) => {
    const p = parseIso(isoDate);
    if (!p) return;
    const n = dayNum(p.y, p.m, p.d);
    if (!pending) {
      setPending({ isoDate, n });
      return;
    }
    const len = n - pending.n;
    if (len < MIN_NIGHTS) {
      /* tapping the start again, or a day before it, restarts the range */
      setPending({ isoDate, n });
      return;
    }
    onPickRange(pending.isoDate, len);
    setPending(null);
  };

  /* open on the picked month, else the current one */
  const [view, setView] = useState<{ y: number; m: number }>(() =>
    start ? { y: start.y, m: start.m } : { y: now.getFullYear(), m: now.getMonth() }
  );
  const shift = (by: number) =>
    setView(({ y, m }) => {
      const t = m + by;
      return { y: y + Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
    });
  const second = { y: view.y + Math.floor((view.m + 1) / 12), m: (view.m + 1) % 12 };

  /* dismiss: outside pointer, or Escape */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label="Pick your start date"
      initial={reduce ? false : { opacity: 0, scale: 0.96, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.97, y: -4 }}
      transition={{ duration: 0.18, ease: [0.21, 0.6, 0.35, 1] }}
      style={{ transformOrigin: "top right" }}
      className="absolute right-0 top-full z-30 mt-2 rounded-3xl border border-line bg-white p-5 shadow-[0_36px_90px_-28px_rgba(22,18,31,0.4)] sm:p-6"
    >
      {/* month headers' shared chevrons, like a spread of two pages */}
      <div className="absolute right-5 top-5 flex gap-1 sm:right-6 sm:top-6">
        <button
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-[transform,background-color] duration-100 hover:bg-paper-2 active:scale-90 focus-visible:outline-2 focus-visible:outline-violet"
        >
          <ChevronRight size={15} className="rotate-180" />
        </button>
        <button
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-[transform,background-color] duration-100 hover:bg-paper-2 active:scale-90 focus-visible:outline-2 focus-visible:outline-violet"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="flex gap-8">
        <Month
          {...view}
          todayN={todayN}
          startN={startN}
          endN={endN}
          pendingN={pending?.n ?? null}
          onPick={pickDay}
        />
        <div className="hidden sm:block">
          <Month
            {...second}
            todayN={todayN}
            startN={startN}
            endN={endN}
            pendingN={pending?.n ?? null}
            onPick={pickDay}
          />
        </div>
      </div>

      {/* how flexible the dates are — the reference's footer chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {FLEX_CHIPS.map((c) => {
          const active = flex === c.days;
          return (
            <button
              key={c.days}
              onClick={() => onFlex(c.days)}
              aria-pressed={active}
              className={`min-h-[38px] cursor-pointer rounded-full border px-3.5 text-[0.8rem] font-semibold transition-[transform,color,border-color] duration-100 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
                active
                  ? "border-ink text-ink ring-1 ring-inset ring-ink"
                  : "border-line text-ink-2 hover:border-ink-3 hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <p
          aria-live="polite"
          className="mr-auto font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-ink-3"
        >
          {pending
            ? "Now pick your return date"
            : startN !== null
              ? `${nights} night${nights > 1 ? "s" : ""} · shaded`
              : "Tap your first day"}
        </p>
        <button
          onClick={() => {
            setPending(null);
            onClear();
          }}
          className="min-h-[42px] cursor-pointer rounded-full bg-paper-2 px-5 text-[0.86rem] font-semibold text-ink-2 transition-[transform,color] duration-100 hover:text-ink active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className="min-h-[42px] cursor-pointer rounded-full bg-ink px-6 text-[0.86rem] font-bold text-white shadow-[0_10px_30px_-14px_rgba(22,18,31,0.55)] transition-transform duration-100 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          Save
        </button>
      </div>
    </motion.div>
  );
}
