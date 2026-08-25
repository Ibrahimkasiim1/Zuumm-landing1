import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import WatchFilm from "@/components/guides/WatchFilm";
import { ArrowRight, Check, MapPin, Shield } from "@/components/Icons";
import { GUIDES, HUBS, guideBySlug, hubBySlug, guideImage, REGIONS } from "@/lib/guides";
import type { DestinationGuide, RegionHub } from "@/lib/guides/types";
import { wizardHref } from "@/lib/planner/openPlanner";

/* One template, every destination. The guide data carries all the words;
   this file carries the room they're arranged in. Region hubs (Europe,
   Africa, South America) share the route and render the lighter hub
   layout. */

export function generateStaticParams() {
  return [
    ...GUIDES.map((g) => ({ slug: g.slug })),
    ...HUBS.map((h) => ({ slug: h.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (g) {
    return {
      title: `${g.name} travel guide`,
      description: `${g.tagline} Best time to visit, visa for Indians, top experiences, sample trips and real prices for ${g.displayName}.`,
      alternates: { canonical: `/destinations/${g.slug}` },
    };
  }
  const h = hubBySlug(slug);
  if (h) {
    return {
      title: `${h.name} destinations`,
      description: h.tagline,
      alternates: { canonical: `/destinations/${h.slug}` },
    };
  }
  return {};
}

const toneStyles: Record<string, { chip: string; label: string }> = {
  high: { chip: "bg-mint/12 text-mint-deep", label: "Best" },
  shoulder: { chip: "bg-sun/15 text-amber-700", label: "Smart value" },
  low: { chip: "bg-paper-2 text-ink-3", label: "Off-season" },
};

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (guide) return <GuidePage g={guide} />;
  const hub = hubBySlug(slug);
  if (hub) return <HubPage h={hub} />;
  notFound();
}

/* ---------------------------------------------------------------- guide */

function GuidePage({ g }: { g: DestinationGuide }) {
  const img = (id: string) => guideImage(g.slug, id);
  const region = REGIONS.find((r) => r.key === g.region);
  const planHref = wizardHref({ fresh: true });

  return (
    <div className="bg-paper">
      {/* ============ hero: the cinema card ============ */}
      <section className="container-x pt-24 md:pt-28">
        <div className="relative flex min-h-[520px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_40px_120px_-48px_rgba(22,18,31,0.55)] md:min-h-[600px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
          <img
            src={img("hero")}
            alt={g.heroAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/30" />
          <div className="grain absolute inset-0" />

          <div className="relative p-6 pb-8 md:p-12">
            <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/70">
              <Link href="/destinations" className="hover:text-white">
                Destinations
              </Link>
              {region ? ` · ${region.label}` : ""} · {g.flag} {g.country}
            </p>
            <h1 className="display mt-3 text-[clamp(2.6rem,7vw,5rem)] leading-[0.98] text-white">
              Discover {g.name}.
            </h1>
            <p className="mt-3 max-w-xl text-lg text-white/85 [text-shadow:0_1px_14px_rgba(13,10,21,0.6)]">
              {g.tagline}
            </p>

            {/* the trip-shaping facts, right on the poster */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                ["Best time", g.weather.bestTime],
                ["Ideal stay", `${g.idealDuration.nights} nights`],
                ["Visa", g.visa.headline],
              ].map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[0.8rem] font-medium backdrop-blur-md"
                >
                  <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-white/60">
                    {k}
                  </span>{" "}
                  <span className="ml-1 font-semibold text-white">{v}</span>
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={planHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-coral px-7 py-3 text-[0.95rem] font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                Plan a trip to {g.name}
                <ArrowRight size={16} />
              </a>
              <WatchFilm name={g.name} poster={img("hero")} />
            </div>
          </div>
        </div>
      </section>

      {/* ============ quick facts strip ============ */}
      <section aria-label="Quick facts" className="container-x mt-10">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line bg-paper-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Capital", g.quickFacts.capital],
            ["Currency", `${g.quickFacts.currency.code} · ${g.quickFacts.currency.inr}`],
            ["Time zone", g.quickFacts.timezone],
            ["From India", g.quickFacts.flightFromIndia],
            ["Power", g.quickFacts.plug],
            ["Data", g.quickFacts.sim],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`px-4 py-5 ${i < 5 ? "lg:border-r lg:border-dashed lg:border-line" : ""}`}
            >
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
                {k}
              </p>
              <p className="mt-1 text-[0.85rem] font-semibold leading-snug text-ink">
                {v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ overview + duration/budget ============ */}
      <section className="container-x grid gap-10 py-16 md:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
        <Reveal>
          <div>
            <h2 className="display text-3xl text-ink md:text-[2.3rem]">
              The shape of the place.
            </h2>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">
              {g.overview}
            </p>
            <p className="mt-6 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">
              Languages · {g.quickFacts.languages.join(" · ")}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-[0_24px_70px_-40px_rgba(22,18,31,0.35)]">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
              Trip maths
            </p>
            <div className="mt-4 flex items-baseline justify-between border-b border-dashed border-line pb-4">
              <span className="text-[0.9rem] font-semibold text-ink">Ideal stay</span>
              <span className="font-mono text-lg font-bold tabular-nums text-ink">
                {g.idealDuration.nights} <span className="text-[0.75rem] font-semibold text-ink-3">nights</span>
              </span>
            </div>
            <p className="mt-3 text-[0.84rem] leading-relaxed text-ink-2">{g.idealDuration.note}</p>
            <div className="mt-5 space-y-2.5">
              {g.budget.perDay.map((b) => (
                <div key={b.tier} className="flex items-baseline justify-between gap-3">
                  <span className="text-[0.84rem] font-semibold text-ink">{b.tier}</span>
                  <span aria-hidden className="flex-1 border-b border-dotted border-line" />
                  <span className="font-mono text-[0.88rem] font-semibold tabular-nums text-ink">
                    {b.inr}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[0.76rem] leading-relaxed text-ink-3">{g.budget.note}</p>
          </div>
        </Reveal>
      </section>

      {/* ============ weather & when to go ============ */}
      <section className="border-y border-line bg-paper-2 py-16 md:py-20" aria-label="When to go">
        <div className="container-x">
          <Reveal>
            <h2 className="display text-3xl text-ink md:text-[2.3rem]">When to go.</h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-ink-2">
              {g.weather.summary}
            </p>
          </Reveal>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {g.weather.seasons.map((s, i) => {
              const t = toneStyles[s.tone];
              return (
                <Reveal key={s.label} delay={i * 0.06}>
                  <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-6">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] ${t.chip}`}>
                        {t.label}
                      </span>
                      <span className="font-mono text-[0.8rem] font-semibold tabular-nums text-ink">
                        {s.temp}
                      </span>
                    </div>
                    <h3 className="mt-4 text-[1.05rem] font-bold text-ink">{s.label}</h3>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-3">
                      {s.months}
                    </p>
                    <p className="mt-3 text-[0.86rem] leading-relaxed text-ink-2">{s.notes}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.1}>
            <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-line bg-white px-6 py-5 md:flex-row md:items-center md:gap-8">
              <p className="text-[0.88rem]">
                <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-coral-deep">Prices peak</span>{" "}
                <span className="font-semibold text-ink">{g.booking.high}</span>
              </p>
              <p className="text-[0.88rem]">
                <span className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-mint-deep">Prices dip</span>{" "}
                <span className="font-semibold text-ink">{g.booking.low}</span>
              </p>
              <p className="text-[0.84rem] leading-relaxed text-ink-2 md:flex-1">{g.booking.note}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ top 10 ============ */}
      <section className="py-16 md:py-20" aria-label={`Top experiences in ${g.name}`}>
        <div className="container-x">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="display text-3xl text-ink md:text-[2.3rem]">
                  The top 10, ranked.
                </h2>
                <p className="mt-3 max-w-xl text-[1.02rem] text-ink-2">
                  What we&rsquo;d actually queue for — tap any card for the full brief.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="no-scrollbar mt-9 flex snap-x gap-5 overflow-x-auto px-6 pb-4 md:px-10">
          {g.highlights.map((h) => (
            <Link
              key={h.id}
              href={`/destinations/${g.slug}/${h.id}`}
              className="group w-[280px] shrink-0 snap-start md:w-[320px]"
            >
              <p className="flex min-h-[3.6rem] items-start gap-2.5 pr-4">
                <span className="font-display text-[1.6rem] font-bold leading-none text-ink/20">
                  {h.rank}
                </span>
                <span className="text-[0.85rem] font-medium leading-snug text-ink-2">
                  {h.blurb}
                </span>
              </p>
              <span className="relative mt-3 block aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                <img
                  src={img(h.id)}
                  alt={h.image.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                  {h.category}
                </span>
              </span>
              <span className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[1.02rem] font-bold text-ink">{h.name}</span>
                <ArrowRight size={15} className="shrink-0 text-coral-deep transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ cities ============ */}
      <section className="py-4 md:py-6" aria-label={`Where to base in ${g.name}`}>
        <div className="container-x">
          <Reveal>
            <h2 className="display text-3xl text-ink md:text-[2.3rem]">Where to base.</h2>
          </Reveal>
        </div>
        <div className="no-scrollbar mt-8 flex snap-x gap-5 overflow-x-auto px-6 pb-4 md:px-10">
          {g.cities.map((c) => (
            <div key={c.id} className="group w-[240px] shrink-0 snap-start md:w-[260px]">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                <img
                  src={img(c.id)}
                  alt={c.image.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="absolute inset-x-4 bottom-4 font-display text-[1.3rem] font-bold text-white">
                  {c.name}
                </span>
              </span>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-2">{c.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ sample trips ============ */}
      <section className="py-16 md:py-20" aria-label={`Sample ${g.name} trips`}>
        <div className="container-x">
          <Reveal>
            <h2 className="display text-3xl text-ink md:text-[2.3rem]">
              Trips we&rsquo;d actually book.
            </h2>
            <p className="mt-3 max-w-xl text-[1.02rem] text-ink-2">
              Real shapes with real splits — take one as-is or bend it in the planner.
            </p>
          </Reveal>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {g.trips.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.06}>
                <a
                  href={planHref}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_70px_-45px_rgba(22,18,31,0.4)] transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <span className="relative block aspect-[16/9] overflow-hidden bg-paper-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                    <img
                      src={img(t.id)}
                      alt={t.image.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[0.62rem] font-bold text-white backdrop-blur-sm">
                      {t.nights}N
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="text-[1.1rem] font-bold leading-snug text-ink">{t.title}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[0.7rem] font-semibold text-ink-2">
                      {t.route.map((leg, j) => (
                        <span key={leg.place} className="flex items-center gap-1.5">
                          {j > 0 && <span className="text-ink-3">→</span>}
                          {leg.place}
                          <span className="text-ink-3">{leg.nights}N</span>
                        </span>
                      ))}
                    </span>
                    <span className="mt-3 text-[0.85rem] leading-relaxed text-ink-2">{t.summary}</span>
                    <span className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      {t.priceFrom ? (
                        <span className="font-mono text-[0.95rem] font-bold tabular-nums text-ink">
                          {t.priceFrom}
                          <span className="ml-1 font-sans text-[0.68rem] font-normal text-ink-3">/person est.</span>
                        </span>
                      ) : <span />}
                      <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold text-coral-deep">
                        Make it yours
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ activities ============ */}
      <section className="pb-16 md:pb-20" aria-label={`Things to do in ${g.name}`}>
        <div className="container-x">
          <Reveal>
            <h2 className="display text-3xl text-ink md:text-[2.3rem]">And between the icons.</h2>
          </Reveal>
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.activities.map((a) => (
              <div key={a.id} className="group overflow-hidden rounded-3xl border border-line bg-white">
                <span className="relative block aspect-[16/10] overflow-hidden bg-paper-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                  <img
                    src={img(a.id)}
                    alt={a.image.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                </span>
                <div className="p-5">
                  <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-3">
                    {a.category}
                  </p>
                  <h3 className="mt-1 text-[1rem] font-bold text-ink">{a.name}</h3>
                  <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-2">{a.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ visa + safety: the ink band ============ */}
      <section className="container-x pb-16 md:pb-20" aria-label="Visa and safety">
        <div className="grain relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink p-7 text-white md:p-10">
          <div aria-hidden className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-coral/15 blur-3xl" />
          <div aria-hidden className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
          <div className="relative grid gap-9 md:grid-cols-2 md:gap-12">
            <div>
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/50">
                Visa for Indian passports
              </p>
              <h3 className="display mt-3 text-[1.5rem]">{g.visa.headline}.</h3>
              <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-white/75">{g.visa.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.visa.cost && (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[0.72rem] font-semibold tabular-nums">
                    {g.visa.cost}
                  </span>
                )}
                {g.visa.processing && (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[0.72rem] font-semibold">
                    {g.visa.processing}
                  </span>
                )}
              </div>
              <a
                href="#"
                className="mt-5 inline-flex items-center gap-1.5 text-[0.88rem] font-bold text-white underline-offset-4 hover:underline"
              >
                Our visa team files it for you
                <ArrowRight size={14} />
              </a>
            </div>
            <div>
              <p className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/50">
                <Shield size={13} className="text-mint" />
                Safety · {g.safety.score}/5
              </p>
              <h3 className="display mt-3 text-[1.5rem]">{g.safety.headline}.</h3>
              <ul className="mt-4 space-y-2.5">
                {g.safety.tips.slice(0, 5).map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5 text-[0.86rem] leading-relaxed text-white/80">
                    <Check size={14} className="mt-0.5 shrink-0 text-mint" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ good to know ============ */}
      <section className="container-x pb-16 md:pb-20" aria-label="Good to know">
        <Reveal>
          <h2 className="display text-3xl text-ink md:text-[2.3rem]">Good to know.</h2>
        </Reveal>
        <ul className="mt-8 grid gap-x-10 gap-y-4 md:grid-cols-2">
          {g.goodToKnow.map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-ink-2">
              <MapPin size={15} className="mt-1 shrink-0 text-coral" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* ============ FAQ + closer ============ */}
      <section className="container-x pb-20 md:pb-24" aria-label="FAQs">
        <Reveal>
          <h2 className="display text-center text-3xl text-ink md:text-[2.3rem]">
            {g.name}, asked and answered.
          </h2>
        </Reveal>
        <div className="mt-10">
          <FAQ items={g.faqs} />
        </div>
        <Reveal>
          <div className="mt-14 text-center">
            <a
              href={planHref}
              className="inline-flex items-center gap-2.5 rounded-full bg-coral px-9 py-4 text-[1.05rem] font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Plan my {g.name} trip
              <ArrowRight size={18} />
            </a>
            <p className="mt-3 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-ink-3">
              Free to plan · priced from real rates
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ region hub */

function HubPage({ h }: { h: RegionHub }) {
  const members = h.members
    .map((slug) => guideBySlug(slug))
    .filter((g): g is DestinationGuide => Boolean(g));

  return (
    <div className="bg-paper">
      <section className="container-x pt-24 md:pt-28">
        <div className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_40px_120px_-48px_rgba(22,18,31,0.55)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
          <img src={`/guides/hubs/${h.slug}.jpg`} alt={h.heroImage.alt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/30" />
          <div className="grain absolute inset-0" />
          <div className="relative p-6 pb-8 md:p-12">
            <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/70">
              <Link href="/destinations" className="hover:text-white">Destinations</Link> · region
            </p>
            <h1 className="display mt-3 text-[clamp(2.6rem,7vw,5rem)] leading-[0.98] text-white">
              Discover {h.name}.
            </h1>
            <p className="mt-3 max-w-xl text-lg text-white/85">{h.tagline}</p>
          </div>
        </div>
      </section>

      <section className="container-x py-14 md:py-16">
        <p className="max-w-3xl text-[1.05rem] leading-relaxed text-ink-2">{h.overview}</p>
      </section>

      {members.length > 0 && (
        <section className="container-x pb-16 md:pb-20" aria-label={`${h.name} destinations`}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((g) => (
              <Link
                key={g.slug}
                href={`/destinations/${g.slug}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-[0_24px_70px_-45px_rgba(22,18,31,0.4)] transition-transform duration-300 hover:-translate-y-1.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                <img
                  src={guideImage(g.slug, "hero")}
                  alt={g.heroAlt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 to-transparent" />
                <span className="relative p-5">
                  <span className="font-display text-[1.5rem] font-bold text-white">
                    {g.flag} {g.name}
                  </span>
                  <span className="mt-1 block text-[0.85rem] text-white/80">{g.tagline}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {h.teasers && h.teasers.length > 0 && (
        <section className="container-x pb-20" aria-label="Plan with AI">
          <h2 className="display text-2xl text-ink md:text-[1.8rem]">
            Built one conversation at a time.
          </h2>
          <p className="mt-3 max-w-xl text-[0.98rem] text-ink-2">
            No set itineraries here yet — describe the trip and the AI planner shapes it with an expert behind it.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.teasers.map((t, i) => (
              <a
                key={t.name}
                href="#"
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-paper-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                <img
                  src={`/guides/hubs/${h.slug}-t${i + 1}.jpg`}
                  alt={t.image.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 to-transparent" />
                <span className="relative p-5">
                  <span className="font-display text-[1.3rem] font-bold text-white">{t.name}</span>
                  <span className="mt-1 block text-[0.8rem] leading-snug text-white/80">{t.blurb}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
