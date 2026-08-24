"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Search } from "@/components/Icons";
import { wizardHref } from "@/lib/planner/openPlanner";
import { track } from "@/lib/analytics";

/* The closing band — the page's last ask, set in the system's own closing
   material: an ink deck panel floating on paper, the same object the page
   opened with. No photography here (the hero slider owns that); the band's
   presence *is* the finale.

   Inside it, exactly one thing is bright: the brief field. It's the only
   white surface on the ink, so the eye lands on it without being told.
   The two guided doors are ghost pills in the hero's own dark-ghost recipe,
   and the honesty footnote signs the page off in mono.

   One Reveal wraps the whole band — it enters once, then holds still. */

export default function BriefBand() {
  const [brief, setBrief] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = brief.trim();
    track("brief_band_submit", { hasText: q.length > 0 });
    /* static landing build: the brief goes nowhere */
  };

  return (
    <section
      className="container-x py-16 md:py-24"
      aria-label="Plan your next trip"
    >
      <Reveal>
        <div className="grain relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink px-6 py-16 text-white shadow-[0_40px_120px_-40px_rgba(22,18,31,0.55)] md:px-12 md:py-20 lg:py-24">
          {/* band atmosphere: two ambient blobs glowing through the ink */}
          <div
            aria-hidden
            className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-coral/15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-sun/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="display text-[2.35rem] leading-[1.02] tracking-[-0.034em] md:text-[3.25rem]">
              Your next trip is a few answers away.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[1.02rem] leading-relaxed text-white/70">
              Describe it in your own words and see it priced in seconds —
              from real rates, watched by real humans.
            </p>

            {/* the one bright surface on the band */}
            <form onSubmit={submit} className="mx-auto mt-10 max-w-xl">
              <label htmlFor="brief-band-input" className="sr-only">
                Describe your trip
              </label>
              <div className="flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 shadow-[0_24px_70px_-32px_rgba(13,10,21,0.8)] transition-shadow duration-200 ease-out focus-within:ring-2 focus-within:ring-coral/45">
                <Search size={18} className="shrink-0 text-ink-3" />
                <input
                  id="brief-band-input"
                  type="text"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Bali, 6 nights, couple, under ₹50k/person…"
                  className="min-w-0 flex-1 bg-transparent py-1.5 text-[0.98rem] text-ink outline-none placeholder:text-ink-3"
                />
                <button
                  type="submit"
                  aria-label="See it priced"
                  className="flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-coral text-[0.92rem] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-coral-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.97] motion-reduce:transition-none sm:w-auto sm:px-5"
                >
                  <span className="hidden sm:inline">See it priced</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            {/* the two guided doors — the hero's dark-ghost recipe */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={wizardHref()}
                onClick={() => track("brief_band_wizard")}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-6 text-[0.92rem] font-semibold text-white/90 backdrop-blur-sm transition-colors duration-200 ease-out hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] motion-reduce:transition-none"
              >
                Plan it myself
                <ArrowRight size={14} />
              </a>
              <a
                href="#"
                onClick={() => track("brief_band_ai")}
                className="inline-flex min-h-11 items-center rounded-full border border-white/25 bg-white/10 px-6 text-[0.92rem] font-semibold text-white/90 backdrop-blur-sm transition-colors duration-200 ease-out hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] motion-reduce:transition-none"
              >
                Plan it with AI
              </a>
            </div>

            <p className="mt-8 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-white/55">
              Free to plan · priced from real rates
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
