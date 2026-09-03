"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Info, Sparkle } from "@/components/plan/icons";
import type { NoteSeverity, SmartNote, WizardState } from "@/lib/planner/wizard";

/* The wizard's co-pilot rail. Every note is computed from the same
   deterministic engine that prices the trip — the rail explains what the
   numbers already know and hands the user the one-tap patch that fixes it.
   Severity is visual, not just verbal: blocks are unmissable, tips are calm. */

const STYLES: Record<
  NoteSeverity,
  { card: string; icon: React.ReactNode; chip: string }
> = {
  block: {
    card: "border-coral/40 bg-coral-soft",
    icon: <AlertTriangle size={15} className="text-coral-deep" />,
    chip: "bg-white text-coral-deep hover:bg-coral hover:text-white",
  },
  warn: {
    card: "border-sun/50 bg-[#fff8ea]",
    icon: <AlertTriangle size={15} className="text-[#b47a00]" />,
    chip: "bg-white text-[#8a5d00] hover:bg-sun hover:text-ink",
  },
  tip: {
    card: "border-line bg-violet-soft/60",
    icon: <Sparkle size={15} className="text-violet" />,
    chip: "bg-white text-violet-deep hover:bg-violet hover:text-white",
  },
};

export default function SmartNotes({
  notes,
  onApply,
  title = "Smart notes",
  inline = false,
}: {
  notes: SmartNote[];
  onApply: (patch: Partial<WizardState>) => void;
  title?: string;
  /** inline mode: a quiet box under the control it belongs to — no header,
      renders nothing at all when there's nothing to say */
  inline?: boolean;
}) {
  const reduce = useReducedMotion();
  if (inline && notes.length === 0) return null;
  return (
    <section aria-label={title} aria-live="polite" className={inline ? "mt-2.5" : undefined}>
      {!inline && (
        <p className="mb-2 flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-wider text-ink-3">
          <Sparkle size={13} className="text-violet" />
          {title}
          <Info size={12} className="text-ink-3" aria-hidden />
        </p>
      )}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {notes.map((n) => {
            const s = STYLES[n.severity];
            return (
              <motion.article
                key={n.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.21, 0.6, 0.35, 1] }}
                className={`rounded-2xl border p-3.5 ${s.card}`}
              >
                <p className="flex items-start gap-2 text-[0.85rem] font-semibold leading-snug text-ink">
                  <span className="mt-0.5 shrink-0">{s.icon}</span>
                  <span className="min-w-0 flex-1">{n.title}</span>
                </p>
                <p className="mt-1 pl-6 text-[0.78rem] leading-relaxed text-ink-2">{n.detail}</p>
                {n.actions && n.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                    {n.actions.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => onApply(a.patch)}
                        className={`min-h-[34px] cursor-pointer rounded-full border border-line px-3 text-[0.76rem] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${s.chip}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
        {!inline && notes.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line p-3.5 text-[0.78rem] text-ink-3">
            All clear — nothing to flag on this step.
          </p>
        )}
      </div>
    </section>
  );
}
