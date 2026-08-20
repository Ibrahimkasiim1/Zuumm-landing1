"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* SSR-safe reduced-motion. Framer's useReducedMotion() is false on the
   server but true on the first client render for users with the OS
   setting on — any render branch on it then mismatches at hydration and
   React regenerates the whole tree (observed breaking sections on
   mobile). This variant reports false until after mount, so server HTML
   and first client render always agree; the real preference applies from
   the second render, and the global CSS reduced-motion kill switch
   covers the first frames. */
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!reduce : false;
}
