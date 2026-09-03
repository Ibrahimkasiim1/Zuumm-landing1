"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "@/components/plan/icons";

/* The current section, drawn as a route: its name up top, then only its
   own pages as stops on a vertical line — answered stops are lit, the
   current one pulses like a live location marker. The other sections live
   in the header's segmented bar; this rail keeps the traveller's eyes on
   what this section still asks. Desktop only, the mobile flow keeps its
   compact chips. */

export interface RailStop {
  id: string;
  label: string;
  state: "done" | "current" | "todo";
}

export interface RailGroup {
  label: string;
  stops: RailStop[];
}

export default function JourneyRail({
  group,
  onJump,
}: {
  group: RailGroup;
  onJump: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const stops = group.stops;
  const currentIdx = Math.max(0, stops.findIndex((s) => s.state === "current"));
  const fillPct = stops.length > 1 ? (currentIdx / (stops.length - 1)) * 100 : 0;

  return (
    <nav aria-label={`${group.label} progress`} className="relative pl-1">
      <p className="mb-4 pl-10 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-3">
        {group.label}
      </p>

      <div className="relative">
        {stops.length > 1 && (
          <>
            {/* the route line runs stop to stop */}
            <div
              aria-hidden
              className="absolute bottom-[14px] left-[13px] top-[14px] w-0.5 rounded-full bg-line"
            />
            <motion.div
              aria-hidden
              className="absolute left-[13px] top-[14px] w-0.5 origin-top rounded-full bg-[linear-gradient(180deg,var(--coral),var(--violet))]"
              style={{ height: "calc(100% - 28px)" }}
              initial={false}
              animate={{ scaleY: fillPct / 100 }}
              transition={
                reduce ? { duration: 0 } : { duration: 0.6, ease: [0.21, 0.6, 0.35, 1] }
              }
            />
          </>
        )}

        <ol className="relative flex flex-col gap-6">
          {stops.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => s.state === "done" && onJump(s.id)}
                disabled={s.state !== "done"}
                aria-current={s.state === "current" ? "step" : undefined}
                className={`group flex items-center gap-3 ${
                  s.state === "done" ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span className="relative flex h-[26px] w-[26px] shrink-0 items-center justify-center">
                  {s.state === "current" && !reduce && (
                    <span
                      aria-hidden
                      className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-30"
                    />
                  )}
                  <span
                    className={`relative flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors ${
                      s.state === "done"
                        ? "border-mint bg-mint text-white"
                        : s.state === "current"
                          ? "border-coral bg-white"
                          : "border-line bg-white"
                    }`}
                  >
                    {s.state === "done" && <Check size={10} />}
                    {s.state === "current" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden />
                    )}
                  </span>
                </span>
                <span
                  className={`text-[0.78rem] font-semibold transition-colors ${
                    s.state === "current"
                      ? "text-ink"
                      : s.state === "done"
                        ? "text-ink-2 group-hover:text-ink"
                        : "text-ink-3"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
