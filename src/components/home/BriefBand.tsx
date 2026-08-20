"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Search } from "@/components/Icons";
import { wizardHref } from "@/lib/planner/openPlanner";
import { track } from "@/lib/analytics";

/* Section: "Where next?" — the open-ended door under the hero.

   One giant centered question, a one-line promise of what the platform
   does with the answer, and a search-style pill that takes the dream trip
   described in the visitor's own words (handed to /chat?q=, the AI
   planner). Below it, a quiet second door into the guided trip wizard.
   Loose clusters of rounded photo tiles float on either side — reusing
   the hero's destination photography, desktop only. */

/* The side mosaics — the wider world Zuumm plans for, deliberately none of
   the five destinations the hero already shows. Sources are 1200×1600 so
   the tiles stay crisp on retina; lg+ only.

   Positions are inline styles (not arbitrary Tailwind classes) so they can
   never be dropped by the JIT scan, and each side runs two vertical lanes —
   an outer and an inner — with tops spaced further apart than any tile is
   tall, so tiles cannot overlap at any section height. */
const TILES: { style: React.CSSProperties; size: string; src: string }[] = [
  /* left, outer lane */
  { style: { left: "2%", top: "6%" }, size: "h-36 w-28", src: "/destinations/mosaic-santorini.jpg" },
  { style: { left: "3%", top: "56%" }, size: "h-40 w-32", src: "/destinations/mosaic-swiss.jpg" },
  /* left, inner lane */
  { style: { left: "11%", top: "32%" }, size: "h-32 w-36", src: "/destinations/mosaic-maldives.jpg" },
  { style: { left: "14%", top: "80%" }, size: "h-24 w-24", src: "/destinations/mosaic-rome.jpg" },
  /* right, outer lane */
  { style: { right: "2%", top: "6%" }, size: "h-40 w-32", src: "/destinations/mosaic-fuji.jpg" },
  { style: { right: "3%", top: "58%" }, size: "h-36 w-28", src: "/destinations/mosaic-paris.jpg" },
  /* right, inner lane */
  { style: { right: "12%", top: "34%" }, size: "h-32 w-36", src: "/destinations/mosaic-iceland.jpg" },
  { style: { right: "15%", top: "82%" }, size: "h-24 w-24", src: "/destinations/mosaic-singapore.jpg" },
];

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
      className="relative overflow-hidden py-20 md:py-28"
      aria-label="Search any destination"
    >
      {/* floating photo tiles — full-strength photography, no wash over it */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        {TILES.map((t) => (
          <div
            key={t.src}
            style={t.style}
            className={`absolute ${t.size} overflow-hidden rounded-[20px] shadow-[0_18px_50px_-24px_rgba(22,18,31,0.35)]`}
          >
            <Image
              src={t.src}
              alt=""
              fill
              sizes="240px"
              quality={90}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="container-x relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="display text-5xl text-ink md:text-[4.2rem]">
              Where next?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
              Describe your dream trip and watch us build it — planned,
              priced and ready to book.
            </p>

            <form onSubmit={submit} className="mt-8">
              <label htmlFor="brief-band-input" className="sr-only">
                Search a destination or describe your trip
              </label>
              <div className="flex items-center gap-3 rounded-full border border-line bg-white py-2 pl-5 pr-2 shadow-[0_18px_60px_-24px_rgba(22,18,31,0.18)] transition-shadow focus-within:ring-2 focus-within:ring-coral/35">
                <Search size={18} className="shrink-0 text-ink-3" />
                <input
                  id="brief-band-input"
                  type="text"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe your dream trip…"
                  className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-ink-3"
                />
                <button
                  type="submit"
                  aria-label="Plan it"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white shadow-[0_10px_28px_-12px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.06] active:scale-[0.96]"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>

            {/* the hands-on door, for people who'd rather answer questions */}
            <div className="mt-6">
              <a
                href={wizardHref()}
                onClick={() => track("brief_band_wizard")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-[0.92rem] font-semibold text-ink-2 transition-all hover:border-ink-3 hover:text-ink"
              >
                Use our trip planner instead
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
