import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "@/components/Icons";
import { guidesByRegion, guideImage, HUBS } from "@/lib/guides";
import { wizardHref } from "@/lib/planner/openPlanner";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Every destination Zuumm plans — best seasons, visas for Indians, top experiences and sample trips, researched and priced.",
  alternates: { canonical: "/destinations" },
};

/* The atlas: every guide on one page, grouped by region — the long-form
   version of the nav dropdown. */

export default function DestinationsIndex() {
  const regions = guidesByRegion();

  return (
    <div className="bg-paper">
      <section className="container-x pb-4 pt-28 md:pt-32">
        <Reveal>
          <p className="eyebrow text-coral">The atlas</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(2.4rem,6vw,4rem)] text-ink">
            Where do you want to go?
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-2">
            Every guide below is researched the way we plan: seasons, visas
            for Indian passports, real budgets, and the experiences worth
            queueing for.
          </p>
        </Reveal>
      </section>

      {regions.map((r) => (
        <section key={r.key} className="container-x py-8 md:py-10" aria-label={r.label}>
          <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-3">
            {r.label}
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {r.guides.map((g) => (
              <Link
                key={g.slug}
                href={`/destinations/${g.slug}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-[0_24px_70px_-48px_rgba(22,18,31,0.45)] transition-transform duration-300 hover:-translate-y-1.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                <img
                  src={guideImage(g.slug, "hero")}
                  alt={g.heroAlt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                <span className="relative flex items-end justify-between gap-2 p-4">
                  <span>
                    <span className="font-display text-[1.25rem] font-bold text-white">
                      {g.flag} {g.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-widest text-white/70">
                      Best {g.weather.bestTime}
                    </span>
                  </span>
                  <ArrowRight size={16} className="mb-1 shrink-0 text-white/80 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* region hubs */}
      <section className="container-x py-10" aria-label="Regions">
        <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-3">
          Or browse by region
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {HUBS.map((h) => (
            <Link
              key={h.slug}
              href={`/destinations/${h.slug}`}
              className="group relative flex aspect-[16/9] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-paper-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
              <img
                src={`/guides/hubs/${h.slug}.jpg`}
                alt={h.heroImage.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
              />
              <span className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink/85 to-transparent" />
              <span className="relative p-5">
                <span className="font-display text-[1.4rem] font-bold text-white">{h.name}</span>
                <span className="mt-0.5 block text-[0.82rem] text-white/80">{h.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pb-24 pt-8 text-center">
        <Reveal>
          <p className="text-[1.02rem] text-ink-2">Somewhere else in mind?</p>
          <a
            href={wizardHref({ fresh: true })}
            className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-coral px-9 py-4 text-[1.05rem] font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Plan my trip
            <ArrowRight size={18} />
          </a>
        </Reveal>
      </section>
    </div>
  );
}
