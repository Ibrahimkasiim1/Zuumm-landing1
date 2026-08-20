"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

const parent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const child: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.6, 0.35, 1] },
  },
};

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotionSafe();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={parent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={child} className={className}>
      {children}
    </motion.div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  tone = "coral",
  align = "center",
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  tone?: "coral" | "violet" | "teal";
  align?: "center" | "left";
}) {
  const toneClass =
    tone === "violet"
      ? "text-violet"
      : tone === "teal"
        ? "text-teal"
        : "text-coral";
  return (
    <Reveal
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""} mb-12 md:mb-16`}
    >
      <p className={`eyebrow ${toneClass} mb-3`}>{eyebrow}</p>
      <h2 className="display text-3xl md:text-[2.6rem] text-ink">{title}</h2>
      {lede && (
        <p className="mt-4 text-lg text-ink-2 leading-relaxed">{lede}</p>
      )}
    </Reveal>
  );
}
