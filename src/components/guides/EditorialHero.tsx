import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "@/components/Icons";
import type { DestinationGuide } from "@/lib/guides/types";

/* The editorial hero — the destination-page template. Paper-white ground,
   the destination photograph owning the right half behind a soft white
   wash, the house display face in ink, coral for the consumer CTA, and a
   row of dark ink cards overlapping the hero's foot. One component, every
   destination surface: the atlas index, each guide, each region hub.

   Everything speaks the site's own system — Bricolage display, Instrument
   body, JetBrains Mono on labels and numbers, grain on ink panels. */

/** "December – March for winter Lapland; …" → "December – March" */
export function shortSeason(s: string): string {
  return s.split(/[;(·]| for | and |&/)[0].trim();
}

/** the cheapest authored trip price, e.g. "₹47,500" */
export function guideFromPrice(g: DestinationGuide): string | undefined {
  const priced = g.trips
    .map((t) => t.priceFrom)
    .filter((p): p is string => Boolean(p))
    .map((p) => [p, parseInt(p.replace(/[^\d]/g, ""), 10)] as const)
    .sort((a, b) => a[1] - b[1]);
  return priced[0]?.[0];
}

function CirclePlus({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

/* ------------------------------------------------------------ dest card */

export type DestCardData = {
  /** omit for a non-interactive card (e.g. the guide hero's city cards) */
  href?: string;
  img: string;
  alt?: string;
  /** circular badge over the image: a flag emoji or a mono tag like "6N" */
  badge?: ReactNode;
  title: string;
  /** small label over the meta value; omit for plain-prose meta */
  metaLabel?: string;
  metaValue: string;
  priceLabel?: string;
  priceValue?: string;
};

/* One photograph owns the card; the text sits in a blur that melts up
   into the image — no separate panel, no button dressing. */
export function DestCard({ card }: { card: DestCardData }) {
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
      <img
        src={card.img}
        alt={card.alt ?? ""}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover ${
          card.href
            ? "transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
            : ""
        }`}
      />
      {/* the bottom band: the photograph fades into solid black, and the
          text lives on that black ground */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black from-[28%] via-black/60 via-[62%] to-transparent"
      />
      {card.badge != null && (
        <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-ink/60 font-mono text-[0.85rem] font-semibold text-white backdrop-blur-md">
          {card.badge}
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 flex flex-col p-5">
        <span className="font-display text-[1.45rem] font-bold leading-tight text-white">
          {card.title}
        </span>
        {card.priceValue ? (
          <span className="mt-2.5 flex items-end justify-between gap-3">
            <span>
              {card.metaLabel && (
                <span className="block text-[0.78rem] font-medium text-white/70">
                  {card.metaLabel}
                </span>
              )}
              <span className="mt-0.5 block text-[0.86rem] font-semibold leading-snug text-white">
                {card.metaValue}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-[0.78rem] font-medium text-white/70">
                {card.priceLabel ?? "From"}
              </span>
              <span className="mt-0.5 block font-mono text-[0.95rem] font-semibold tabular-nums text-sun">
                {card.priceValue}
              </span>
            </span>
          </span>
        ) : (
          <span className="mt-1.5 line-clamp-2 text-[0.8rem] leading-snug text-white/80">
            {card.metaValue}
          </span>
        )}
      </span>
    </>
  );

  const shell =
    "relative block aspect-[9/10] overflow-hidden rounded-[22px] shadow-[0_30px_80px_-42px_rgba(22,18,31,0.6)] ring-1 ring-white/15";

  if (!card.href) return <div className={shell}>{inner}</div>;

  const El = card.href.startsWith("/destinations") ? Link : "a";
  return (
    <El
      href={card.href}
      className={`${shell} group transition-transform duration-300 hover:-translate-y-1.5 motion-reduce:transition-none`}
    >
      {inner}
    </El>
  );
}

/* ---------------------------------------------------------------- hero */

export function EditorialHero({
  image,
  imageAlt,
  eyebrow,
  title,
  sub,
  primary,
  secondary,
  facts,
  cards,
}: {
  image: string;
  imageAlt: string;
  eyebrow: ReactNode;
  title: ReactNode;
  sub: string;
  primary: { href: string; label: string };
  secondary?: ReactNode;
  /** small mono facts under the CTAs, e.g. best season · nights · visa */
  facts?: string[];
  cards?: DestCardData[];
}) {
  return (
    <section className="relative overflow-hidden bg-paper text-ink">
      {/* the photograph, owning the right; a white wash carries the copy */}
      <div aria-hidden className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- local guide asset */}
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover object-[72%_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper from-[18%] via-paper/80 via-[52%] to-paper/15 lg:from-[10%] lg:via-paper/70 lg:via-[38%] lg:to-transparent lg:to-[64%]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-paper/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-paper via-paper/55 to-transparent" />
      </div>

      <div className="container-x relative pb-14 pt-28 md:pb-20 md:pt-36">
        <Reveal>
          <p className="flex max-w-xl flex-wrap items-center gap-2.5 text-coral">
            <CirclePlus size={17} />
            <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.22em]">
              {eyebrow}
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="display mt-5 max-w-2xl text-[clamp(2.7rem,6.2vw,4.8rem)] text-ink">
            {title}
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-ink-2">
            {sub}
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href={primary.href}
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-coral px-7 py-3 text-[0.94rem] font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98] motion-reduce:transition-none"
            >
              {primary.label}
              <ArrowRight size={16} />
            </a>
            {secondary}
          </div>
        </Reveal>

        {facts && facts.length > 0 && (
          <Reveal delay={0.24}>
            <p className="mt-7 flex max-w-xl flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
              {facts.map((f, i) => (
                <span key={f} className="flex items-center gap-3">
                  {i > 0 && (
                    <span aria-hidden className="h-1 w-1 rounded-full bg-coral" />
                  )}
                  {f}
                </span>
              ))}
            </p>
          </Reveal>
        )}

        {cards && cards.length > 0 && (
          <div
            className={`mt-16 grid gap-4 sm:grid-cols-2 md:mt-24 ${
              cards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {cards.map((c, i) => (
              <Reveal key={c.title} delay={0.08 + i * 0.06} className="h-full">
                <DestCard card={c} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------- section crossheads */

export function WhereToNext({
  eyebrow = "Where to next",
  title,
  href,
  hrefLabel,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="relative text-center">
      <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-coral">
        {eyebrow}
      </p>
      <h2 className="display mt-2.5 text-[clamp(1.9rem,4vw,2.7rem)] text-ink">
        {title}
      </h2>
      {href && hrefLabel && (
        <Link
          href={href}
          className="group mt-3 inline-flex min-h-11 items-center gap-1.5 px-1 text-[0.88rem] font-bold text-ink underline decoration-coral decoration-2 underline-offset-8 hover:decoration-coral-deep lg:absolute lg:-bottom-1.5 lg:right-0 lg:mt-0"
        >
          {hrefLabel}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
