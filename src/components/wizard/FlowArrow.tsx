"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* The connective tissue of the itinerary: a hand-drawn-feeling arrow that
   sketches itself in as it scrolls into view (background dashed guide +
   an animated deep-brand-gradient stroke over it), alternating its curve so
   the journey reads like a route doodled on a map. Once drawn, a small dot
   keeps travelling the curve so the hop between places stays visibly in
   motion. A transfer label can ride in the middle of the arrow. */

export default function FlowArrow({
  index = 0,
  label,
  sub,
}: {
  /** alternates the curve direction */
  index?: number;
  /** e.g. "🚐 Car / van · 2.5 hr" */
  label?: string;
  /** e.g. "₹4,000 for the car, in your total" */
  sub?: string;
}) {
  const reduce = useReducedMotion();
  const flip = index % 2 === 1;
  // S-curve top→bottom; mirrored on odd rows
  const d = flip
    ? "M50 2 C 18 26, 82 58, 50 84"
    : "M50 2 C 82 26, 18 58, 50 84";
  // useId can contain ":" which breaks unquoted url(#…) references in SVG
  const gid = "flow" + useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <div className="relative mx-auto flex h-[92px] w-[110px] items-center justify-center" aria-hidden>
      <svg viewBox="0 0 100 92" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--coral-deep)" />
            <stop offset="100%" stopColor="var(--violet-deep)" />
          </linearGradient>
        </defs>
        {/* static guide */}
        <path
          d={d}
          fill="none"
          stroke="var(--ink-3)"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeDasharray="1 6"
          strokeLinecap="round"
        />
        {/* animated draw */}
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="3"
          strokeLinecap="round"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
        {/* arrowhead */}
        <motion.path
          d="M43 78 L50 88 L57 78"
          fill="none"
          stroke="var(--violet-deep)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: -4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ delay: reduce ? 0 : 0.55, duration: 0.25 }}
        />
        {/* the travelling pulse: a dot that keeps moving along the hop,
            so the journey between places never sits still */}
        {!reduce && (
          <circle r="3" fill="var(--ink)">
            <animateMotion
              dur="2.4s"
              repeatCount="indefinite"
              path={d}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.4 0 0.6 1"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.12;0.85;1"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>

      {label && (
        <motion.div
          className="absolute left-1/2 top-1/2 w-max max-w-[16rem] -translate-y-1/2 rounded-full border border-line bg-white px-3.5 py-1.5 text-center shadow-[0_10px_30px_-14px_rgba(22,18,31,0.3)]"
          style={{ x: flip ? "-104%" : "4%" }}
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ delay: reduce ? 0 : 0.3, duration: 0.25 }}
        >
          <p className="text-[0.76rem] font-bold text-ink">{label}</p>
          {sub && <p className="text-[0.66rem] text-ink-3">{sub}</p>}
        </motion.div>
      )}
    </div>
  );
}
