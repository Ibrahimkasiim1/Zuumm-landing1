import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin } from "@/components/Icons";
import { GUIDES, guideBySlug, guideImage } from "@/lib/guides";
import { wizardHref } from "@/lib/planner/openPlanner";

/* One highlight, told in full: the ranked card's detail page. The copy is
   the guide's `detail` field; the photography is the highlight's own shot
   with the destination's hero and neighbouring highlights around it. */

export function generateStaticParams() {
  return GUIDES.flatMap((g) =>
    g.highlights.map((h) => ({ slug: g.slug, experience: h.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; experience: string }>;
}): Promise<Metadata> {
  const { slug, experience } = await params;
  const g = guideBySlug(slug);
  const h = g?.highlights.find((x) => x.id === experience);
  if (!g || !h) return {};
  return {
    title: `${h.name} — ${g.name}`,
    description: h.blurb,
    alternates: { canonical: `/destinations/${g.slug}/${h.id}` },
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string; experience: string }>;
}) {
  const { slug, experience } = await params;
  const g = guideBySlug(slug);
  const h = g?.highlights.find((x) => x.id === experience);
  if (!g || !h) notFound();

  const others = g.highlights.filter((x) => x.id !== h.id).slice(0, 4);
  const planHref = wizardHref({ fresh: true });

  return (
    <div className="bg-paper">
      {/* hero: the highlight's own photograph */}
      <section className="container-x pt-24 md:pt-28">
        <div className="relative flex min-h-[440px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_40px_120px_-48px_rgba(22,18,31,0.55)] md:min-h-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
          <img src={guideImage(g.slug, h.id)} alt={h.image.alt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/30" />
          <div className="grain absolute inset-0" />
          <div className="relative p-6 pb-8 md:p-12">
            <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/70">
              <Link href="/destinations" className="hover:text-white">Destinations</Link>
              {" · "}
              <Link href={`/destinations/${g.slug}`} className="hover:text-white">{g.name}</Link>
              {" · "}#{h.rank} · {h.category}
            </p>
            <h1 className="display mt-3 max-w-3xl text-[clamp(2.1rem,5.5vw,3.8rem)] leading-[1.02] text-white">
              {h.name}.
            </h1>
            <p className="mt-3 max-w-xl text-lg text-white/85 [text-shadow:0_1px_14px_rgba(13,10,21,0.6)]">
              {h.blurb}
            </p>
          </div>
        </div>
      </section>

      {/* the full brief */}
      <section className="container-x grid gap-10 py-14 md:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div>
          <h2 className="display text-2xl text-ink md:text-[1.9rem]">How to do it well.</h2>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">{h.detail}</p>
          <a
            href={planHref}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 text-[0.95rem] font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Put this in my {g.name} trip
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-paper-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
            <img src={guideImage(g.slug, "hero")} alt={g.heroAlt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="rounded-3xl border border-line bg-paper-2 px-5 py-4">
            <p className="flex items-start gap-2.5 text-[0.86rem] leading-relaxed text-ink-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-coral" />
              {g.weather.bestTime} is {g.name}&rsquo;s best window — see the{" "}
              <Link href={`/destinations/${g.slug}`} className="font-semibold text-coral-deep underline-offset-2 hover:underline">
                full {g.name} guide
              </Link>{" "}
              for seasons, visas and trip shapes.
            </p>
          </div>
        </div>
      </section>

      {/* the rest of the top 10 */}
      <section className="pb-20 md:pb-24" aria-label="More highlights">
        <div className="container-x">
          <h2 className="display text-2xl text-ink md:text-[1.9rem]">Also in the top 10.</h2>
        </div>
        <div className="no-scrollbar mt-7 flex snap-x gap-5 overflow-x-auto px-6 pb-4 md:px-10">
          {others.map((o) => (
            <Link key={o.id} href={`/destinations/${g.slug}/${o.id}`} className="group w-[240px] shrink-0 snap-start">
              <span className="relative block aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
                <img
                  src={guideImage(g.slug, o.id)}
                  alt={o.image.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2 py-0.5 font-mono text-[0.62rem] font-bold text-white backdrop-blur-sm">
                  #{o.rank}
                </span>
              </span>
              <span className="mt-2.5 block text-[0.95rem] font-bold text-ink">{o.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
