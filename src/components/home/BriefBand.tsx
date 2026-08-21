"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Search } from "@/components/Icons";
import { wizardHref } from "@/lib/planner/openPlanner";
import { track } from "@/lib/analytics";

/* The closing section — the page's last ask, and its biggest.

   By the time a visitor reaches this band they've watched the systems run:
   promises demoed, real trips confirmed, prices itemised. The finale hands
   them the microphone. One warm, open stage (the floating photo mosaics —
   the wider world Zuumm plans for), the closer's peak-end headline, and the
   brief input as the primary act: describe the trip in your own words, see
   it priced. The two guided doors sit beneath as equal-weight alternatives,
   and the honesty footnote signs the page off.

   The side mosaics are 1200×1600 sources so the tiles stay crisp on
   retina; lg+ only. Positions are inline styles (not arbitrary Tailwind
   classes) so they can never be dropped by the JIT scan, and each side
   runs two vertical lanes with tops spaced further apart than any tile is
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
      className="relative overflow-hidden py-24 md:py-32"
      aria-label="Plan your next trip"
    >
      {/* the send-off warmth: the closer card's sunset washes, now the
          whole stage's atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_55%_at_12%_18%,rgba(255,174,26,0.14),transparent_70%),radial-gradient(40%_55%_at_88%_78%,rgba(255,59,92,0.1),transparent_70%)]"
      />

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
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="display text-4xl text-ink md:text-[3.6rem]">
              Your next trip is a few answers away.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
              Describe it in your own words and see it priced in seconds —
              from real rates, watched by real humans from pickup to
              touchdown.
            </p>

            <form onSubmit={submit} className="mx-auto mt-9 max-w-2xl">
              <label htmlFor="brief-band-input" className="sr-only">
                Describe your trip
              </label>
              <div className="flex items-center gap-3 rounded-full border border-line bg-white py-2.5 pl-6 pr-2.5 shadow-[0_24px_70px_-28px_rgba(22,18,31,0.25)] transition-shadow focus-within:ring-2 focus-within:ring-coral/35">
                <Search size={20} className="shrink-0 text-ink-3" />
                <input
                  id="brief-band-input"
                  type="text"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Bali, 6 nights, couple, under ₹50k/person…"
                  className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3 md:text-[1.05rem]"
                />
                <button
                  type="submit"
                  className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-coral px-6 text-[0.98rem] font-bold text-white shadow-[0_14px_40px_-14px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.04] active:scale-[0.96]"
                >
                  See it priced
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* the two guided doors, equal weight under the open mic */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={wizardHref()}
                onClick={() => track("brief_band_wizard")}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-[1.02rem] font-bold text-white shadow-[0_18px_44px_-18px_rgba(22,18,31,0.55)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                Plan it myself
                <ArrowRight size={17} />
              </a>
              <a
                href="#"
                onClick={() => track("brief_band_ai")}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-8 py-4 text-[1.02rem] font-bold text-ink-2 transition-all hover:scale-[1.03] hover:border-ink-3 hover:text-ink active:scale-[0.98]"
              >
                Plan it with AI
              </a>
            </div>

            <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-3">
              Free to plan · no sign-up · priced from real rates
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
