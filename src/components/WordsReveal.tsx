"use client";

import { motion, type Variants } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/* Word-by-word clip reveal for headlines. Renders inline inside an <h1>/<h2>.
   `accent` words get the accent class (defaults to the brand gradient).

   The in-view trigger lives on the OUTER span (never transformed); the words
   animate via variant propagation. Observing the words themselves would fail:
   they start translated fully outside their overflow-hidden wrappers, so the
   IntersectionObserver would never see them. */

const parent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const word: Variants = {
  hidden: { y: "115%" },
  show: {
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.6, 0.35, 1] },
  },
};

export default function WordsReveal({
  text,
  accent,
  accentClass = "grad-text",
}: {
  text: string;
  accent?: string;
  accentClass?: string;
}) {
  const reduce = useReducedMotionSafe();
  const parts = [
    ...text.split(" ").map((w) => ({ w, a: false })),
    ...(accent ? accent.split(" ").map((w) => ({ w, a: true })) : []),
  ];

  if (reduce)
    return (
      <>
        {text}
        {accent && (
          <>
            {" "}
            <span className={accentClass}>{accent}</span>
          </>
        )}
      </>
    );

  return (
    <motion.span
      variants={parent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {parts.map((p, i) => (
        <span
          key={`${p.w}-${i}`}
          className={`inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em] ${
            i < parts.length - 1 ? "me-[0.26em]" : ""
          }`}
        >
          <motion.span
            variants={word}
            className={`inline-block ${p.a ? accentClass : ""}`}
          >
            {p.w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
