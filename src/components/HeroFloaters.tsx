"use client";

import { motion} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { Plane, Check, Star } from "./Icons";

/* Hero atmosphere: product artifacts floating around the headline —
   a visa stamp, a PNR, a booked total and a rating. Decorative only,
   desktop only, never intercepts the pointer. */

const pop = (delay: number) => ({
  initial: { opacity: 0, scale: 0.7, y: 24 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: {
    type: "spring" as const,
    stiffness: 160,
    damping: 15,
    delay,
  },
});

export default function HeroFloaters() {
  const reduce = useReducedMotionSafe();
  if (reduce) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden xl:block"
    >
      {/* visa stamp — left top */}
      <motion.div {...pop(0.5)} className="absolute left-[4%] top-[32%]">
        <div
          className="floaty -rotate-6 rounded-2xl border border-line bg-white/90 p-4 shadow-[0_18px_50px_-20px_rgba(15,163,107,0.4)] backdrop-blur-sm"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="font-mono text-[0.58rem] uppercase tracking-widest text-ink-3">
            Schengen · 2 travellers
          </p>
          <span className="stamp mt-2 inline-block -rotate-3 text-[0.66rem] text-mint">
            Approved
          </span>
        </div>
      </motion.div>

      {/* PNR — right top */}
      <motion.div {...pop(0.65)} className="absolute right-[3.5%] top-[26%]">
        <div
          className="floaty rotate-3 flex items-center gap-3 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-[0_18px_50px_-20px_rgba(255,59,92,0.4)] backdrop-blur-sm"
          style={{ animationDelay: "1.6s" }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-soft text-coral">
            <Plane size={15} />
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[0.68rem] font-semibold text-ink">
              PNR ZM4K7
            </p>
            <p className="text-[0.62rem] text-ink-3">BLR → DPS · sat 06:20</p>
          </div>
        </div>
      </motion.div>

      {/* booked total — left bottom */}
      <motion.div {...pop(0.8)} className="absolute left-[6%] top-[64%]">
        <div
          className="floaty rotate-2 flex items-center gap-2.5 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-[0_18px_50px_-20px_rgba(102,51,242,0.4)] backdrop-blur-sm"
          style={{ animationDelay: "2.4s" }}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-white">
            <Check size={13} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-[0.85rem] font-bold text-ink tabular-nums">
              ₹86,750
            </p>
            <p className="text-[0.62rem] text-ink-3">whole trip · one checkout</p>
          </div>
        </div>
      </motion.div>

      {/* rating — right bottom */}
      <motion.div {...pop(0.95)} className="absolute right-[6%] top-[62%]">
        <div
          className="floaty -rotate-2 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-[0_18px_50px_-20px_rgba(255,174,26,0.45)] backdrop-blur-sm"
          style={{ animationDelay: "3.1s" }}
        >
          <span className="flex text-sun">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} />
            ))}
          </span>
          <p className="mt-1 text-[0.62rem] font-medium text-ink-2">
            4.9 · Indian travellers
          </p>
        </div>
      </motion.div>
    </div>
  );
}
