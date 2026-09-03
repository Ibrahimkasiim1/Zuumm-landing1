"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SmartNote, WizardState } from "@/lib/planner/wizard";
import { AlertTriangle, Check, X } from "@/components/plan/icons";

/* The constraint bar — the funnel's one interruption surface.

   Docks above the wizard's sticky footer and never covers content. Every
   message carries its fix as one-tap chips (the smart-note actions), so a
   constraint is a decision, not a dead end:

     · block (coral)  — arithmetic impossibility; persistent, the footer's
       Continue is disabled while one is present
     · warn (amber)   — over-packed but possible; dismissible, Continue
       stays enabled

   Replaces the old centered warn-gate modal: research is unambiguous that
   mid-funnel modals kill momentum, while inline fixes keep it. */

export default function ConstraintBar({
  notes,
  onApply,
  onDismiss,
}: {
  notes: SmartNote[];
  onApply: (patch: Partial<WizardState>) => void;
  onDismiss: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  /* one at a time, most severe first — a stack of bars is its own overload */
  const note = notes[0];

  return (
    <div className="container-x">
      <AnimatePresence initial={false}>
        {note && (
          <motion.div
            key={note.id}
            role={note.severity === "block" ? "alert" : "status"}
            initial={reduce ? false : { opacity: 0, transform: "translateY(12px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={reduce ? undefined : { opacity: 0, transform: "translateY(12px)" }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className={`mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border px-4 py-2.5 shadow-[0_14px_40px_-20px_rgba(22,18,31,0.35)] ${
              note.severity === "block"
                ? "border-coral/40 bg-coral-soft"
                : "border-sun/40 bg-[#fff8ea]"
            }`}
          >
            <AlertTriangle
              size={15}
              className={`shrink-0 ${note.severity === "block" ? "text-coral-deep" : "text-[#b97908]"}`}
            />
            <p className="min-w-0 flex-1 text-[0.84rem] leading-snug text-ink">
              <span className="font-bold">{note.title}.</span>{" "}
              <span className="hidden text-ink-2 sm:inline">{note.detail}</span>
            </p>
            <span className="flex shrink-0 items-center gap-1.5">
              {note.actions?.map((a) => (
                <button
                  key={a.label}
                  onClick={() => onApply(a.patch)}
                  className="cursor-pointer whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[0.78rem] font-bold text-white transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97]"
                >
                  {a.label}
                </button>
              ))}
              {note.severity !== "block" && (
                <button
                  onClick={() => onDismiss(note.id)}
                  aria-label="Dismiss this warning"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-white hover:text-ink"
                >
                  <X size={14} />
                </button>
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Brief mint confirmation after a fix lands — auto-dismissed by the caller. */
export function FixedFlash({ show, label }: { show: boolean; label: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="container-x">
      <AnimatePresence>
        {show && (
          <motion.p
            initial={reduce ? false : { opacity: 0, transform: "translateY(10px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mb-2 flex items-center gap-2 rounded-2xl border border-mint/40 bg-mint/12 px-4 py-2 text-[0.82rem] font-semibold text-mint-deep"
            role="status"
          >
            <Check size={14} className="text-mint" />
            {label}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
