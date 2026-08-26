import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import WatchFilm from "@/components/guides/WatchFilm";
import CardRail from "@/components/guides/CardRail";
import {
  ArrowRight,
  Building,
  Check,
  Globe,
  MapPin,
  Passport,
  Plane,
  Shield,
  Spark,
  TrendUp,
  Wallet,
  Zap,
} from "@/components/Icons";
import {
  EditorialHero,
  WhereToNext,
  shortSeason,
  guideFromPrice,
  type DestCardData,
} from "@/components/guides/EditorialHero";
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

/* Quick facts read at a glance: the value that answers the question first,
   the caveat beneath it in a quieter voice. Guide copy separates the two
   with an em dash, a semicolon or a middot, in that order of strength. */
function splitFact(v: string): { primary: string; secondary?: string } {
  for (const sep of [" — ", "; ", " · "]) {
    const i = v.indexOf(sep);
    if (i > 0) {
      return { primary: v.slice(0, i), secondary: v.slice(i + sep.length) };
    }
  }
  return { primary: v };
}

function quickFacts(g: DestinationGuide) {
  const q = g.quickFacts;
  return [
    { label: "Capital", Icon: Building, primary: q.capital },
    {
      label: "Currency",
      Icon: Wallet,
      primary: q.currency.code,
      secondary: q.currency.inr,
    },
    { label: "Time zone", Icon: Globe, ...splitFact(q.timezone) },
    { label: "From India", Icon: Plane, ...splitFact(q.flightFromIndia) },
    { label: "Power", Icon: Zap, ...splitFact(q.plug) },
    { label: "Data", Icon: Spark, ...splitFact(q.sim) },
  ] satisfies {
    label: string;
    Icon: typeof Building;
    primary: string;
    secondary?: string;
  }[];
}

const toneStyles: Record<string, { chip: string; label: string; glow: string }> = {
  high: { chip: "bg-mint/12 text-mint-deep", label: "Best", glow: "bg-mint/25" },
  shoulder: { chip: "bg-sun/15 text-amber-700", label: "Smart value", glow: "bg-sun/30" },
  low: { chip: "bg-ink/[0.05] text-ink-3", label: "Off-season", glow: "bg-violet/15" },
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

  /* the hero's card row: the destination's most popular bases. Plain
     cards, not buttons — and only the blurb's first sentence, so the
     copy sits inside the blur band. */
  const heroCards: DestCardData[] = g.cities.slice(0, 4).map((c) => {
    const first = c.blurb.split(/(?<=[.!?])\s/)[0];
    return {
      img: img(c.id),
      alt: c.image.alt,
      title: c.name,
      metaValue: first,
    };
  });

  return (
    <div className="bg-paper">
      {/* ============ hero: the editorial spread ============ */}
      <EditorialHero
        image={img("hero")}
        imageAlt={g.heroAlt}
        eyebrow={
          <>
            <Link href="/destinations" className="hover:text-[#1c2749]">
              Curated travel experiences
            </Link>
            {region ? ` · ${region.label}` : ""} · {g.flag} {g.country}
          </>
        }
        title={<>Discover {g.name}.</>}
        sub={g.tagline}
        primary={{ href: planHref, label: `Plan a trip to ${g.name}` }}
        secondary={<WatchFilm name={g.name} poster={img("hero")} variant="light" />}
        facts={[
          `Best ${shortSeason(g.weather.bestTime)}`,
          `${g.idealDuration.nights} nights ideal`,
          g.visa.headline,
        ]}
        cards={heroCards}
      />

      {/* ============ quick facts: the liquid-glass band ============ */}
      <section aria-label="Quick facts" className="container-x relative mt-10">
        {/* one quiet tint behind the glass, so the blur has something to catch */}
        <div aria-hidden className="pointer-events-none absolute -inset-2 overflow-hidden">
          <div className="absolute -left-6 -top-10 h-44 w-[28rem] rounded-full bg-violet/[0.09] blur-3xl" />
          <div className="absolute -right-6 bottom-0 h-40 w-80 rounded-full bg-coral/[0.06] blur-3xl" />
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/60 p-7 shadow-[0_30px_80px_-46px_rgba(22,18,31,0.35)] backdrop-blur-2xl backdrop-saturate-150 md:p-9">
          {/* the specular edge — the "liquid" part of the glass */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
          />

          <dl className="relative grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {quickFacts(g).map(({ label, Icon, primary, secondary }) => (
              <div key={label} className="flex gap-3.5">
                <Icon size={16} className="mt-0.5 shrink-0 text-ink-3" />
                <div className="min-w-0">
                  <dt className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {label}
                  </dt>
                  <dd className="mt-2 text-[0.98rem] font-semibold leading-snug text-ink">
                    {primary}
                  </dd>
                  {secondary && (
                    <dd className="mt-1.5 text-[0.83rem] leading-relaxed text-ink-3">
                      {secondary}
                    </dd>
                  )}
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ overview + duration/budget ============ */}
      <section className="container-x grid gap-10 py-16 md:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
        <Reveal>
          <div>
            <h2 className="display text-3xl text-ink md:text-[2.3rem]">
              The status of {g.name}.
            </h2>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">
              {g.overview}
            </p>
            <p className="mt-6 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">
              Languages · {g.quickFacts.languages.join(" · ")}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 h-36 w-64 rounded-full bg-sun/15 blur-3xl"
          />
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_24px_70px_-40px_rgba(22,18,31,0.35)] backdrop-blur-2xl backdrop-saturate-150">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
            />
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
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {g.weather.seasons.map((s, i) => {
              const t = toneStyles[s.tone];
              return (
                <Reveal key={s.label} delay={i * 0.06} className="h-full">
                  <div className="relative h-full">
                    {/* the tone's glow, breathing around the glass */}
                    <div
                      aria-hidden
                      className={`absolute -inset-1.5 rounded-[30px] ${t.glow} blur-2xl`}
                    />
                    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_28px_70px_-42px_rgba(22,18,31,0.4)] backdrop-blur-2xl backdrop-saturate-150">
                      <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                      />
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
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* the booking calendar: peak over dip, note alongside */}
          <Reveal delay={0.1}>
            <div className="relative mt-6">
              <div
                aria-hidden
                className="absolute -inset-1.5 rounded-[30px] bg-gradient-to-r from-coral/15 via-transparent to-mint/15 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-[0_28px_70px_-42px_rgba(22,18,31,0.4)] backdrop-blur-2xl backdrop-saturate-150">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                />
                <div className="grid md:grid-cols-[1fr_1.1fr]">
                  <div className="flex flex-col justify-center px-6 py-4 md:px-7">
                    <div className="flex items-center gap-4 py-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-soft text-coral-deep">
                        <TrendUp size={17} />
                      </span>
                      <div>
                        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-coral-deep">
                          Prices peak
                        </p>
                        <p className="mt-1 text-[0.92rem] font-semibold leading-snug text-ink">
                          {g.booking.high}
                        </p>
                      </div>
                    </div>
                    <div aria-hidden className="border-t border-dashed border-ink/10" />
                    <div className="flex items-center gap-4 py-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-mint-deep">
                        <TrendUp size={17} className="-scale-y-100" />
                      </span>
                      <div>
                        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-mint-deep">
                          Prices dip
                        </p>
                        <p className="mt-1 text-[0.92rem] font-semibold leading-snug text-ink">
                          {g.booking.low}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center border-t border-ink/[0.06] px-6 py-5 md:border-l md:border-t-0 md:px-7">
                    <p className="text-[0.88rem] leading-relaxed text-ink-2">
                      {g.booking.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ top 10: the self-driving rail ============ */}
      <CardRail
        heading="The top 10, ranked."
        sub={"What we’d actually queue for — tap any card for the full brief."}
        ariaLabel={`Top experiences in ${g.name}`}
        autoplay
        items={g.highlights.map((h) => ({
          href: `/destinations/${g.slug}/${h.id}`,
          img: img(h.id),
          alt: h.image.alt,
          rank: h.rank,
          name: h.name,
          category: h.category,
          blurb: h.blurb,
        }))}
      />

      {/* ============ cities: the ink rail ============ */}
      <CardRail
        heading={`Travel bases in ${g.name}.`}
        ariaLabel={`Where to base in ${g.name}`}
        variant="overlay"
        edgeFade={false}
        gap={32}
        className="pb-8 pt-4 md:pb-10 md:pt-6"
        items={g.cities.map((c) => ({
          img: img(c.id),
          alt: c.image.alt,
          name: c.name,
          blurb: c.blurb,
        }))}
      />

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
            <h2 className="display text-3xl text-ink md:text-[2.3rem]">
              Must-sees in {g.name}.
            </h2>
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

      {/* ============ visa: its own ink band ============ */}
      <section className="container-x pb-10 md:pb-14" aria-label="Visa">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[3rem] border border-white/10 bg-ink p-7 text-white md:rounded-[3.5rem] md:p-11">
            <div aria-hidden className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-coral/15 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet/15 blur-3xl" />
            <div className="relative grid gap-7 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pl-2.5 pr-3.5 backdrop-blur-sm">
                  <Passport size={13} className="text-white/70" />
                  <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                    Visa · Indian passports
                  </span>
                </span>
                <h3 className="display mt-4 text-[1.3rem] leading-[1.15] md:text-[1.5rem]">
                  {g.visa.headline}.
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
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
              </div>
              <div>
                <p className="text-[0.92rem] leading-relaxed text-white/75">{g.visa.body}</p>
                <a
                  href="#"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-coral px-6 py-3 text-[0.9rem] font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98] motion-reduce:transition-none"
                >
                  Have our visa team handle it
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ safety: the glass band over mint glow ============ */}
      <section className="container-x pb-24 md:pb-32" aria-label="Safety">
        <Reveal>
          <div className="relative">
            {/* the green light the glass sits in — blurred by the card above */}
            <div aria-hidden className="pointer-events-none absolute -inset-2 overflow-hidden">
              <div className="absolute -left-4 -top-6 h-48 w-[24rem] rounded-full bg-mint/25 blur-3xl" />
              <div className="absolute bottom-2 left-1/3 h-44 w-[26rem] rounded-full bg-mint/20 blur-3xl" />
              <div className="absolute right-2 top-1/4 h-52 w-72 rounded-full bg-teal/[0.14] blur-3xl" />
            </div>

            <div className="relative overflow-hidden rounded-[3rem] border border-white/70 bg-white/55 p-7 shadow-[0_30px_80px_-42px_rgba(11,125,83,0.45)] backdrop-blur-2xl backdrop-saturate-150 md:rounded-[3.5rem] md:p-11">
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 py-1.5 pl-2.5 pr-3.5">
                  <Shield size={13} className="text-mint-deep" />
                  <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-mint-deep">
                    Safety
                  </span>
                  <span aria-hidden className="h-2.5 w-px bg-mint-deep/25" />
                  <span className="font-mono text-[0.62rem] font-bold tabular-nums text-mint-deep">
                    {g.safety.score}/5
                  </span>
                </span>
                <h3 className="display mt-4 max-w-xl text-[1.3rem] leading-[1.15] text-ink md:text-[1.5rem]">
                  {g.safety.headline}.
                </h3>
                <ul className="mt-7 grid gap-x-10 gap-y-4 md:grid-cols-2">
                  {g.safety.tips.slice(0, 5).map((tip) => (
                    <li key={tip} className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-ink-2">
                      <Check size={14} className="mt-1 shrink-0 text-mint-deep" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
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

  const planHref = wizardHref({ fresh: true });
  const heroCards: DestCardData[] = members.slice(0, 4).map((g) => ({
    href: `/destinations/${g.slug}`,
    img: guideImage(g.slug, "hero"),
    alt: g.heroAlt,
    badge: g.flag,
    title: g.name,
    metaLabel: "Best season",
    metaValue: shortSeason(g.weather.bestTime),
    priceValue: guideFromPrice(g),
  }));

  return (
    <div className="bg-paper">
      <EditorialHero
        image={`/guides/hubs/${h.slug}.jpg`}
        imageAlt={h.heroImage.alt}
        eyebrow={
          <>
            <Link href="/destinations" className="hover:text-[#1c2749]">
              Curated travel experiences
            </Link>
            {" · region"}
          </>
        }
        title={<>Discover {h.name}.</>}
        sub={h.tagline}
        primary={{ href: planHref, label: `Plan a ${h.name} trip` }}
        cards={heroCards}
      />

      <section className="container-x py-14 md:py-16">
        <p className="max-w-3xl text-[1.05rem] leading-relaxed text-ink-2">{h.overview}</p>
      </section>

      {members.length > 0 && (
        <section className="container-x pb-16 md:pb-20" aria-label={`${h.name} destinations`}>
          <WhereToNext title={`All ${h.name} destinations`} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
