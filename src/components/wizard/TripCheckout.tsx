"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { TripPlan } from "@/lib/planner/engine";
import { inr } from "@/lib/planner/engine";
import type { WizardState } from "@/lib/planner/wizard";
import { guideByDestinationName } from "@/lib/guides";
import { track } from "@/lib/analytics";
import { Check, Clock, Sparkle, Ticket } from "@/components/plan/icons";

/* Everything after the itinerary: share it, understand what's payable, and
   tell the expert what else to sort out on the call.

   The add-on copy is not invented marketing. Visa type, cost and how long
   it takes come from the destination's own guide (lib/guides), the same
   record the destination pages publish; the currency line comes from that
   guide's quickFacts. Insurance is the one card with no dataset behind it,
   so it describes the cover in general terms and promises no price. */

/* The policy pages and the contact route live on the full site; this build
   renders the same links and goes nowhere. */
const POLICY = {
  cancellation: "#",
  payment: "#",
  terms: "#",
};
const CONTACT = "#";

export type AddOnKey = "visa" | "insurance" | "forex";

export default function TripCheckout({
  state,
  plan,
  onPatch,
  onPrint,
}: {
  state: WizardState;
  plan: TripPlan;
  onPatch: (p: Partial<WizardState>) => void;
  /** hand the whole plan to the browser's print/save-as-PDF flow */
  onPrint: () => void;
}) {
  const [mode, setMode] = useState<"full" | "part">("part");
  const guide = guideByDestinationName(state.country);
  const chosen = new Set(state.addOns);

  const toggle = (key: AddOnKey) => {
    const next = new Set(chosen);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    track("reveal_addon", { key, on: !chosen.has(key) });
    onPatch({ addOns: [...next] });
  };

  /* what the expert is asked to cover, in one line for the email.
     Sharing hands the trip to the visitor's own mail client — no service
     behind it — so it works here exactly as it does in the full product,
     minus the live link back into the planner. */
  const summary =
    `${state.country} · ${plan.days} days · ${plan.travellers} traveller` +
    `${plan.travellers > 1 ? "s" : ""} · ${inr(plan.grandTotal)} all-in`;
  const mailto =
    `mailto:?subject=${encodeURIComponent(`My ${state.country} trip — ${inr(plan.grandTotal)}`)}` +
    `&body=${encodeURIComponent(
      `Here's the trip I built on Zuumm.\n\n${summary}\n\n` +
        plan.stops
          .map((s) => `${s.city.name} — ${s.nights} night${s.nights > 1 ? "s" : ""}`)
          .join("\n")
    )}`;

  return (
    <div className="mt-8 space-y-5" data-print-section>
      {/* ---------- share ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3 rounded-[1.4rem] border border-line bg-white p-4 sm:flex-row sm:items-center"
        data-print-hide
      >
        <div className="flex flex-1 gap-2">
          <button
            onClick={onPrint}
            className="flex min-h-[46px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 text-[0.86rem] font-bold text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          >
            Save as PDF
          </button>
          <a
            href={mailto}
            onClick={() => track("reveal_share", { via: "email" })}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-[0.86rem] font-bold text-ink-2 transition-colors hover:border-ink hover:text-ink"
          >
            Share via email
          </a>
        </div>
        <a
          href={POLICY.cancellation}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-center text-[0.78rem] font-semibold text-violet underline-offset-2 hover:underline"
        >
          Cancellation policy
        </a>
      </motion.section>

      {/* ---------- payment ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.4 }}
        className="rounded-[1.4rem] border border-line bg-white p-5"
        aria-label="Payment details"
      >
        <h2 className="text-[1rem] font-bold text-ink">Payment details</h2>

        <div
          role="tablist"
          aria-label="How you'd like to pay"
          className="mt-3 flex rounded-full bg-violet-soft/60 p-1"
          data-print-hide
        >
          {(
            [
              ["full", "Pay in full"],
              ["part", "Part payment"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={mode === k}
              onClick={() => setMode(k)}
              className={`min-h-[40px] flex-1 cursor-pointer rounded-full text-[0.86rem] font-semibold transition-colors ${
                mode === k ? "bg-white text-ink shadow-sm" : "text-ink-2 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <dl className="mt-4 space-y-2.5 text-[0.88rem]">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-2">Estimated trip cost</dt>
            <dd className="font-mono font-semibold text-ink">{inr(plan.grandTotal)}</dd>
          </div>
          <div className="border-t border-dashed border-line pt-2.5">
            {mode === "part" ? (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-bold text-ink">Due now (20% booking amount)</dt>
                  <dd className="font-mono font-bold text-coral-deep">
                    {inr(plan.depositDue)}
                  </dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <dt className="text-ink-2">Balance (before travel date)</dt>
                  <dd className="font-mono font-semibold text-ink">
                    {inr(plan.grandTotal - plan.depositDue)}
                  </dd>
                </div>
              </>
            ) : (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-bold text-ink">Due now</dt>
                <dd className="font-mono font-bold text-coral-deep">
                  {inr(plan.grandTotal)}
                </dd>
              </div>
            )}
          </div>
        </dl>

        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.82rem] leading-relaxed text-ink-2">
            <span className="font-bold text-ink">Prefer to split it further?</span> Ask
            your travel expert about no-cost EMI on your card or through our
            financing partners.
          </p>
          <a
            href={CONTACT}
            className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-center text-[0.8rem] font-bold text-white transition-transform duration-150 hover:scale-[1.02]"
            data-print-hide
          >
            Ask about EMI →
          </a>
        </div>

        <p className="mt-3 text-center text-[0.74rem] text-ink-3">
          By proceeding you agree to our{" "}
          <a href={POLICY.payment} className="font-semibold text-violet hover:underline">
            Payment &amp; Refund Policy
          </a>{" "}
          and{" "}
          <a href={POLICY.terms} className="font-semibold text-violet hover:underline">
            Terms &amp; Conditions
          </a>
          .
        </p>
      </motion.section>

      {/* ---------- add-ons ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.4 }}
        className="rounded-[1.4rem] bg-violet-soft/40 p-5"
        aria-label="Extras your expert can help with"
      >
        <h2 className="text-[1rem] font-bold text-ink">
          Need help with more than the trip?
        </h2>
        <p className="mt-1 text-[0.82rem] text-ink-2">
          Tick what you&rsquo;d like your expert to cover when they call — no extra
          charge to ask.
        </p>

        <div className="mt-3.5 space-y-2.5">
          <AddOn
            id="visa"
            label="Visa assistance"
            on={chosen.has("visa")}
            onToggle={() => toggle("visa")}
            lines={
              guide
                ? /* no cost line here — the visa fee is the expert's to
                     quote on the call, not the reveal's */
                  [
                    ["Visa type", guide.visa.headline],
                    [
                      "How long it takes",
                      guide.visa.processing ?? "Confirmed with your expert",
                    ],
                  ]
                : [["Visa type", "Your expert confirms the route for this destination"]]
            }
            body={guide?.visa.body}
          />
          <AddOn
            id="insurance"
            label="Travel insurance"
            on={chosen.has("insurance")}
            onToggle={() => toggle("insurance")}
            lines={[
              ["Covers", "Medical emergencies and hospital cover abroad"],
              ["Also covers", "Trip cancellation, delays and lost baggage"],
              ["Documents", "Passport loss and emergency travel papers"],
            ]}
            body="Your expert quotes cover for the exact dates of this trip — we don't price it here, because the premium depends on your age, dates and any add-ons you want."
          />
          <AddOn
            id="forex"
            label="Forex / currency exchange"
            on={chosen.has("forex")}
            onToggle={() => toggle("forex")}
            lines={[
              [
                "Currency",
                guide
                  ? `${guide.quickFacts.currency.name} (${guide.quickFacts.currency.code})`
                  : "Local currency",
              ],
              ...(guide
                ? ([["Today's rate", guide.quickFacts.currency.inr]] as [string, string][])
                : []),
              ["How it works", "Load the card in rupees, spend in local currency abroad"],
            ]}
            body="A forex card locks your rate when you load it, so what you spend abroad doesn't move with the market. Your expert arranges it alongside the booking."
          />
        </div>

        {chosen.size > 0 && (
          <p className="mt-3.5 flex items-start gap-2 text-[0.8rem] leading-relaxed text-ink-2">
            <Sparkle size={13} className="mt-0.5 shrink-0 text-violet" aria-hidden />
            <span>
              We&rsquo;ll bring {[...chosen].length === 1 ? "this" : "these"} up on
              your call — nothing is charged for asking.
            </span>
          </p>
        )}
      </motion.section>
    </div>
  );
}

/** one extra: a tick, and the facts behind it once it's ticked */
function AddOn({
  id,
  label,
  on,
  onToggle,
  lines,
  body,
}: {
  id: string;
  label: string;
  on: boolean;
  onToggle: () => void;
  /** the concrete facts, label → value */
  lines: [string, string][];
  body?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.1rem] border bg-white transition-colors ${
        on ? "border-violet" : "border-line"
      }`}
    >
      <button
        onClick={onToggle}
        aria-pressed={on}
        aria-controls={`${id}-detail`}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet"
      >
        <span
          aria-hidden
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[0.4rem] border transition-colors ${
            on ? "border-violet bg-violet text-white" : "border-ink-3/50 bg-white"
          }`}
        >
          {on && <Check size={12} />}
        </span>
        <span className="flex-1 text-[0.88rem] font-bold text-ink">{label}</span>
        <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-ink-3">
          {on ? "Added" : "Tell me more"}
        </span>
      </button>

      {on && (
        <div id={`${id}-detail`} className="border-t border-line px-4 py-3">
          <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-3">
            {lines.map(([k, v]) => (
              <div key={k}>
                <dt className="flex items-center gap-1 font-mono text-[0.58rem] font-bold uppercase tracking-wider text-ink-3">
                  {k === "Cost" ? (
                    <Ticket size={9} aria-hidden />
                  ) : k === "How long it takes" ? (
                    <Clock size={9} aria-hidden />
                  ) : null}
                  {k}
                </dt>
                <dd className="mt-0.5 text-[0.8rem] font-semibold leading-snug text-ink">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          {body && (
            <p className="mt-2.5 text-[0.78rem] leading-relaxed text-ink-2">{body}</p>
          )}
        </div>
      )}
    </div>
  );
}
