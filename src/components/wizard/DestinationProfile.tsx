"use client";

import { useMemo, useState } from "react";
import { guideByDestinationName, guideImage } from "@/lib/guides";
import type { DestinationGuide } from "@/lib/guides/types";
import { catalogForCountry } from "@/lib/planner/attractions";
import { destinationByName } from "@/lib/planner/destinations";
import {
  Bed,
  Calendar,
  Check,
  Clock,
  MapPin,
  Ticket,
} from "@/components/plan/icons";

/* The destination panel on "Where to?".

   It shows the destination the traveller just picked, and it shows the
   same researched content their destination page does: this reads the
   guide registry (lib/guides) rather than keeping a second, drifting copy
   of the prose and the facts. Photos come from /guides/<slug>/ on disk, so
   nothing here depends on a photo API guessing what a place looks like.

   Laid out to the reference: a photo collage, a pill nav, the name and
   where it is, the prose behind a "See more", and a facts card. Every
   number is read off the guide or the priced catalog — none are invented.

   Destinations without a guide yet still render: they fall back to the
   planner registry's own line about the place. */

type Tab = { key: string; label: string };

const TABS: Tab[] = [
  { key: "overview", label: "Overview" },
  { key: "cities", label: "Cities" },
  { key: "highlights", label: "Highlights" },
  { key: "essentials", label: "Essentials" },
];

/** every photo the guide can show, hero first — what "Show all photos" opens */
function galleryFor(g: DestinationGuide): { id: string; alt: string }[] {
  return [
    { id: "hero", alt: g.heroAlt || g.heroImage.alt },
    ...g.cities.map((c) => ({ id: c.id, alt: c.image.alt })),
    ...g.highlights.map((h) => ({ id: h.id, alt: h.image.alt })),
  ];
}

export default function DestinationProfile({ country }: { country: string }) {
  const [tab, setTab] = useState("overview");
  const [allPhotos, setAllPhotos] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const guide = useMemo(() => guideByDestinationName(country), [country]);
  const reg = useMemo(() => destinationByName(country), [country]);
  const catalog = useMemo(() => catalogForCountry(country), [country]);

  /* a destination we haven't written a guide for yet still deserves a
     panel — the registry knows its region and what it is */
  if (!guide) {
    return (
      <div>
        <h2 className="text-[1.35rem] font-bold leading-tight text-ink">{country}</h2>
        <p className="mt-1 flex items-center gap-1 font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-ink-3">
          <MapPin size={11} aria-hidden /> {reg?.region ?? "Worldwide"}
        </p>
        <p className="mt-3 text-[0.86rem] leading-relaxed text-ink-2">
          {reg?.blurb ??
            `We plan ${country} with a travel expert rather than an instant price — tell us your dates and we'll come back with a costed itinerary.`}
        </p>
      </div>
    );
  }

  const gallery = galleryFor(guide);
  const shots = gallery.slice(0, 3);
  const overview = guide.overview;
  const long = overview.length > 260;
  const shown = expanded || !long ? overview : `${overview.slice(0, 250).trimEnd()}… `;

  return (
    <div>
      {/* ---- photo collage: hero left, two stacked right ---- */}
      {allPhotos ? (
        <div>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-[0.9rem] bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- static guide asset */}
                <img
                  src={guideImage(guide.slug, p.id)}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setAllPhotos(false)}
            className="mt-2 cursor-pointer text-[0.74rem] font-semibold text-ink-3 underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            Show fewer photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[1.6fr_1fr] grid-rows-2 gap-2">
          <div className="relative row-span-2 overflow-hidden rounded-[1.1rem] bg-paper-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- static guide asset */}
            <img
              src={guideImage(guide.slug, shots[0].id)}
              alt={shots[0].alt}
              className="h-full min-h-[15rem] w-full object-cover"
            />
          </div>
          <div className="relative overflow-hidden rounded-[1.1rem] bg-paper-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- static guide asset */}
            <img
              src={guideImage(guide.slug, shots[1].id)}
              alt={shots[1].alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <button
            onClick={() => setAllPhotos(true)}
            className="group relative cursor-pointer overflow-hidden rounded-[1.1rem] bg-paper-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
            aria-label={`Show all ${gallery.length} photos of ${guide.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static guide asset */}
            <img
              src={guideImage(guide.slug, shots[2].id)}
              alt=""
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-[0.78rem] font-bold text-white transition-colors group-hover:bg-ink/60">
              Show all photos
            </span>
          </button>
        </div>
      )}

      {/* ---- the pill nav, the reference's row ---- */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`min-h-[36px] shrink-0 cursor-pointer rounded-full border px-4 text-[0.8rem] font-semibold transition-[transform,color,border-color,background-color] duration-100 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet ${
              tab === t.key
                ? "border-violet bg-violet-soft/50 text-violet-deep"
                : "border-line bg-white text-ink-2 hover:border-ink-3 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---- title block, shared by every tab ---- */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <h2 className="text-[1.35rem] font-bold leading-tight text-ink">
          <span aria-hidden>{guide.flag} </span>
          {guide.name}
        </h2>
        <p className="shrink-0 pt-1 font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-ink-3">
          {catalog.length > 0
            ? `${catalog.length} experiences`
            : `${guide.highlights.length} highlights`}
        </p>
      </div>
      <p className="mt-1 flex items-center gap-1 font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-ink-3">
        <MapPin size={11} aria-hidden /> {reg?.region ?? guide.country}
      </p>

      {tab === "overview" && (
        <>
          <p className="mt-3 text-[0.86rem] leading-relaxed text-ink-2">
            {shown}
            {long && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="cursor-pointer font-semibold text-violet underline-offset-2 hover:underline"
              >
                {expanded ? " See less" : "See more"}
              </button>
            )}
          </p>

          {/* the reference's details card, carrying our real facts */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-[1.1rem] bg-paper-2/60 p-4">
            <Fact icon={<Calendar size={10} />} label="Best time" value={guide.weather.bestTime} />
            <Fact
              icon={<Bed size={10} />}
              label="Ideal length"
              value={`${guide.idealDuration.nights} nights`}
            />
            <Fact icon={<Check size={10} />} label="Visa" value={guide.visa.headline} />
            <Fact
              icon={<Ticket size={10} />}
              label="Currency"
              value={`${guide.quickFacts.currency.code} · ${guide.quickFacts.currency.inr}`}
            />
          </dl>

          <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] leading-relaxed text-ink-3">
            <Clock size={11} className="shrink-0 text-violet" aria-hidden />
            {guide.quickFacts.flightFromIndia}
          </p>
        </>
      )}

      {tab === "cities" && (
        <ul className="mt-3 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))]">
          {guide.cities.map((c) => (
            <li
              key={c.id}
              className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-paper-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static guide asset */}
              <img
                src={guideImage(guide.slug, c.id)}
                alt={c.image.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent"
              />
              {/* the name only: at this size a sentence over a photo is
                  clutter, and the blurb has a home on the guide page */}
              <span className="absolute inset-x-3 bottom-3 block">
                <span className="block text-[0.95rem] font-bold leading-tight text-white">
                  {c.name}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab === "highlights" && (
        <ul className="mt-3 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))]">
          {guide.highlights.map((h) => (
            <li
              key={h.id}
              className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-paper-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static guide asset */}
              <img
                src={guideImage(guide.slug, h.id)}
                alt={h.image.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent"
              />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-1 font-mono text-[0.58rem] font-bold uppercase tracking-wider text-ink backdrop-blur">
                {h.category}
              </span>
              <span className="absolute inset-x-3 bottom-3 block">
                <span className="block text-[0.92rem] font-bold leading-tight text-white">
                  {h.name}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab === "essentials" && (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-[1.1rem] bg-paper-2/60 p-4">
            <Fact icon={<MapPin size={10} />} label="Capital" value={guide.quickFacts.capital} />
            <Fact icon={<Clock size={10} />} label="Time zone" value={guide.quickFacts.timezone} />
            <Fact
              icon={<Ticket size={10} />}
              label="Languages"
              value={guide.quickFacts.languages.join(", ")}
            />
            <Fact icon={<Check size={10} />} label="SIM" value={guide.quickFacts.sim} />
          </dl>

          <p className="mt-4 text-[0.82rem] font-bold text-ink">{guide.visa.headline}</p>
          <p className="mt-1 text-[0.84rem] leading-relaxed text-ink-2">{guide.visa.body}</p>

          <p className="mt-4 text-[0.82rem] font-bold text-ink">Good to know</p>
          <ul className="mt-1.5 space-y-1.5">
            {guide.goodToKnow.slice(0, 5).map((line) => (
              <li key={line} className="flex gap-2 text-[0.82rem] leading-relaxed text-ink-2">
                <Check size={12} className="mt-1 shrink-0 text-mint" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** one labelled fact in the details card */
function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[0.66rem] font-bold uppercase tracking-wider text-ink-3">
        <span aria-hidden>{icon}</span> {label}
      </dt>
      <dd className="mt-0.5 text-[0.82rem] font-semibold leading-snug text-ink">{value}</dd>
    </div>
  );
}
