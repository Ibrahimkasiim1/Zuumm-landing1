"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/* Number that counts up when it scrolls into view. */
export default function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
  decimals = 0,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  /** fractional digits to animate and display (e.g. 99.7) */
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotionSafe();
  const [val, setVal] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.21, 0.6, 0.35, 1],
      onUpdate: (v) => setVal(Number(v.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration, decimals]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {val.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
