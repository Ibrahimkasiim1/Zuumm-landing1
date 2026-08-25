"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/* "Watch the film" — the hero's video door. Destination films are still in
   production, so the player is an honest placeholder: the hero still opens
   into a cinematic frame, labelled as coming soon, with the destination's
   photography as the poster. Swap the inner block for a <video> per
   destination as films land. */

export default function WatchFilm({
  name,
  poster,
}: {
  name: string;
  poster: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-[0.92rem] font-bold text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] motion-reduce:transition-none"
      >
        {/* play glyph */}
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
        Watch the film
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.25 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-deep/80 p-4 backdrop-blur-sm md:p-10"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} film`}
          >
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.3, ease: [0.21, 0.6, 0.35, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/15 bg-ink shadow-[0_60px_160px_-40px_rgba(0,0,0,0.8)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- poster placeholder */}
              <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/40" />
              <div className="relative flex h-full flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden>
                    <path d="M8 5.5v13l11-6.5z" />
                  </svg>
                </span>
                <p className="font-display text-xl font-bold text-white">
                  The {name} film is in production.
                </p>
                <p className="max-w-sm text-[0.9rem] text-white/70">
                  We&rsquo;re out shooting it. Until it lands, the photographs
                  below carry the brief.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
