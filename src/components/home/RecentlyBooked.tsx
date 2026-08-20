"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Bed, MapPin, Users } from "@/components/Icons";
import { wizardHref } from "@/lib/planner/openPlanner";

/* Real trips confirmed recently, rendered as full-bleed destination cards.
   Every card is a live entry point: destinations on the deterministic engine
   (Thailand, Bali) deep-link into the wizard with the whole trip preloaded —
   crew, nights, route, signature experiences — landing straight on the
   suggested itinerary with nothing left to answer. Other destinations open
   the AI planner with the trip described.

   The photograph owns the whole card; every fact sits on it — frosted chips
   up top, an ink scrim carrying the trip's story at the bottom. Photos are
   unique to this section, in /public/travel/booked (Unsplash license, free
   to use).

   Trip data is a curated sample of recent confirmed bookings — first names
   only, with the traveller's consent. Update TRIPS as new bookings land. */

type Trip = {
  destination: string;
  nights: string;
  crew: string;
  /** who travelled — first names only, shown on the pass */
  party: string;
  /** the stays that made the trip, one per major stop */
  hotels: string;
  route: { city: string; n: number }[];
  price: string;
  highlights: string[];
  href: string;
  /** corner colour wash over the photo — the trip's hue */
  hue: string;
  photo: string;
  photoAlt: string;
  iata: string;
  featured?: boolean;
};

const TRIPS: Trip[] = [
  {
    destination: "Vietnam",
    nights: "8 nights",
    crew: "Family of 4",
    party: "The Sharma family",
    hotels: "La Siesta Premium, Hanoi · Little Riverside, Hoi An",
    route: [
      { city: "Hanoi", n: 2 },
      { city: "Ha Long Bay", n: 1 },
      { city: "Hoi An", n: 3 },
      { city: "Ho Chi Minh", n: 2 },
    ],
    price: "₹38,200",
    highlights: [
      "Overnight cruise on Ha Long Bay",
      "Cu Chi Tunnels",
      "Lantern boat ride in Hoi An",
      "Mekong Delta day out",
    ],
    href: "#",
    hue: "from-teal/50",
    photo: "/travel/booked/vietnam.jpg",
    photoAlt: "Limestone karsts and cruise boats on Ha Long Bay",
    iata: "HAN",
    featured: true,
  },
  {
    destination: "Bali",
    nights: "6 nights",
    crew: "Couple",
    party: "Sanjeev & Ritu",
    hotels: "The Anvaya, Kuta · Alaya Resort, Ubud",
    route: [
      { city: "Kuta", n: 3 },
      { city: "Ubud", n: 3 },
    ],
    price: "₹47,500",
    highlights: [
      "Gorilla Face ATV ride",
      "Nusa Penida, east & west",
      "Uluwatu Kecak fire dance",
      "Potato Head sunset",
    ],
    href: wizardHref({
      crew: "couple",
      to: "Bali",
      nights: 6,
      cities: ["Kuta", "Ubud"],
      pins: [
        "ubud--gorilla-face-atv-quad-bike-adventure-with-lunch-in-ubud",
        "kuta--east-west-highlights-full-day-tour-in-nusa-penida",
        "kuta--uluwatu-kecak-and-fire-dance-show-entry-ticket",
        "kuta--sunset-cocktails-at-potato-head-beach-club",
      ],
      q: "suggested",
      fresh: true,
    }),
    hue: "from-coral/45",
    photo: "/travel/booked/bali.jpg",
    photoAlt: "Ulun Danu Bratan water temple on Lake Bratan, Bali",
    iata: "DPS",
  },
  {
    destination: "Dubai",
    nights: "4 nights",
    crew: "Friends group",
    party: "Ravi & friends",
    hotels: "Rove Downtown · Atlantis The Palm",
    route: [
      { city: "Downtown", n: 2 },
      { city: "Palm Jumeirah", n: 2 },
    ],
    price: "₹52,000",
    highlights: [
      "Burj Khalifa at sunset",
      "Desert safari, dune bashing",
      "Atlantis Aquaventure",
      "Sky Views Edge Walk",
    ],
    href: "#",
    hue: "from-sun/45",
    photo: "/travel/booked/dubai.jpg",
    photoAlt: "Dubai skyline and the Burj Khalifa at sunset",
    iata: "DXB",
  },
  {
    destination: "Thailand",
    nights: "5 nights",
    crew: "Solo",
    party: "Aisha, solo",
    hotels: "Amara Bangkok · The Marina, Phuket",
    route: [
      { city: "Bangkok", n: 2 },
      { city: "Phuket", n: 3 },
    ],
    price: "₹31,500",
    highlights: [
      "Grand Palace",
      "Phi Phi Islands speedboat",
      "James Bond Island",
      "Bangla Road nightlife",
    ],
    href: wizardHref({
      crew: "solo",
      to: "Thailand",
      nights: 5,
      cities: ["Bangkok", "Phuket"],
      q: "suggested",
      fresh: true,
    }),
    hue: "from-violet/45",
    photo: "/travel/booked/thailand.jpg",
    photoAlt: "Longtail boats on Railay beach, Thailand",
    iata: "BKK",
  },
  {
    destination: "Singapore",
    nights: "4 nights",
    crew: "Couple",
    party: "Karan & Meera",
    hotels: "Hotel Boss · Marina Bay Sands, one splurge night",
    route: [
      { city: "Bugis", n: 3 },
      { city: "Marina Bay", n: 1 },
    ],
    price: "₹58,000",
    highlights: [
      "Gardens by the Bay light show",
      "Sentosa cable car day",
      "Hawker trail, Lau Pa Sat",
      "Infinity pool sunrise",
    ],
    href: "#",
    hue: "from-violet/45",
    photo: "/travel/booked/singapore.jpg",
    photoAlt: "Marina Bay Sands and the ArtScience Museum from above at dusk",
    iata: "SIN",
  },
  {
    destination: "Maldives",
    nights: "4 nights",
    crew: "Couple",
    party: "Arjun & Naina",
    hotels: "Adaaran Club Rannalhi, water villa",
    route: [
      { city: "Malé", n: 1 },
      { city: "Rannalhi", n: 3 },
    ],
    price: "₹74,000",
    highlights: [
      "Water villa, all meals in",
      "Snorkelling the house reef",
      "Sunset dolphin cruise",
      "Sandbank picnic",
    ],
    href: "#",
    hue: "from-teal/50",
    photo: "/travel/booked/maldives.jpg",
    photoAlt: "Overwater villas winding across a Maldives lagoon",
    iata: "MLE",
  },
  {
    destination: "Kerala",
    nights: "4 nights",
    crew: "Family of 5",
    party: "The Menon family",
    hotels: "Spice Tree, Munnar · premium houseboat, Alleppey",
    route: [
      { city: "Munnar", n: 2 },
      { city: "Alleppey", n: 2 },
    ],
    price: "₹24,500",
    highlights: [
      "Overnight backwater houseboat",
      "Tea plantation walk",
      "Kathakali evening show",
      "Periyar spice gardens",
    ],
    href: "#",
    hue: "from-mint/45",
    photo: "/travel/booked/kerala.jpg",
    photoAlt: "A houseboat drifting the Alleppey backwaters, Kerala",
    iata: "COK",
  },
];

function TicketCard({ trip }: { trip: Trip }) {
  return (
    <a
      href={trip.href}
      className="group relative flex h-[480px] flex-col justify-end overflow-hidden rounded-3xl shadow-[0_24px_70px_-40px_rgba(22,18,31,0.45)] transition-transform duration-300 hover:-translate-y-1.5 md:h-[520px]"
    >
      {/* ---- the photograph owns the whole card ---- */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset, no remote loader needed */}
      <img
        src={trip.photo}
        alt={trip.photoAlt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />

      {/* legibility scrims: a light cap up top, a deep ink bed below */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/50 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-ink/90 via-ink/45 to-transparent"
      />

      {/* ---- frosted chips: who travelled ---- */}
      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-[0.74rem] font-semibold text-white backdrop-blur-lg">
        <Users size={13} />
        {trip.crew}
      </span>
      <span className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 font-display text-[0.85rem] font-bold text-white backdrop-blur-lg">
        {trip.party}
      </span>

      {/* ---- the trip's story, on the scrim ---- */}
      <div className="relative flex flex-col gap-2 p-5 pb-5 md:p-6">
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/70">
          booked this week
        </p>

        <p className="display text-[1.9rem] leading-none text-white">
          {trip.destination}
          <span className="ml-2.5 align-middle text-[0.95rem] font-semibold tracking-normal text-white/85">
            {trip.nights}
          </span>
        </p>

        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[0.72rem] font-semibold tracking-wide text-white/85">
          {trip.route.map((leg, i) => (
            <span key={leg.city} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden className="text-white/50">
                  →
                </span>
              )}
              {leg.city}
              <span className="text-white/55">{leg.n}N</span>
            </span>
          ))}
        </p>

        {/* the stays, named — hotels are part of the trip, not a surprise */}
        <p className="flex items-start gap-2 text-[0.8rem] leading-snug text-white/80">
          <Bed size={14} className="mt-0.5 shrink-0 text-white/60" />
          {trip.hotels}
        </p>

        <ul className="mt-0.5 flex flex-wrap gap-1.5">
          {trip.highlights.slice(0, 2).map((h) => (
            <li
              key={h}
              className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[0.74rem] font-medium text-white backdrop-blur-md"
            >
              <MapPin size={11} className="shrink-0 text-coral" />
              {h}
            </li>
          ))}
          <li className="flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[0.74rem] font-medium text-white/85 backdrop-blur-md">
            +{trip.highlights.length - 2} more
          </li>
        </ul>

        <div className="mt-2.5 flex items-center justify-between gap-4 border-t border-white/15 pt-3.5">
          <p className="font-mono text-[0.95rem] font-semibold leading-tight text-white">
            {trip.price}
            <span className="block font-sans text-[0.68rem] font-normal text-white/65">
              /person · all-in
            </span>
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-[0.84rem] font-bold text-white shadow-[0_12px_32px_-14px_rgba(255,59,92,0.6)] transition-transform duration-200 ease-out group-hover:scale-[1.05]">
            Make it yours
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function RecentlyBooked() {
  const ordered = [
    TRIPS.find((t) => t.featured)!,
    ...TRIPS.filter((t) => !t.featured),
  ];
  const railRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* hold the drift, then let it resume a beat after the interaction ends */
  const pauseFor = (ms: number) => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), ms);
  };

  /* the slow drift: ~30px/s via rAF on scrollLeft. The list renders twice,
     so when the first copy has fully passed we jump back by exactly one
     set width — an invisible seam, an endless counter of passes. */
  useEffect(() => {
    if (reduce || paused) return;
    const rail = railRef.current;
    if (!rail) return;
    let raf = 0;
    let last = performance.now();
    /* float accumulator: assigning scrollLeft rounds, so reading it back
       every frame drops the fraction and the drift ticks instead of
       gliding. Keep the true position here and only write it out. */
    let pos = rail.scrollLeft;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const kids = rail.children[0]?.children as HTMLCollectionOf<HTMLElement>;
      if (!kids || kids.length < ordered.length + 1) return;
      const setWidth = kids[ordered.length].offsetLeft - kids[0].offsetLeft;
      pos += 30 * dt;
      if (pos >= setWidth) pos -= setWidth;
      rail.scrollLeft = pos;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, paused, ordered.length]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);


  return (
    <section
      id="destinations"
      className="relative scroll-mt-24 py-16 md:py-24"
      aria-label="Trips travelled and loved"
    >
      {/* soft colour atmosphere so the tickets sit on warmth, not blank white */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-10 -z-10 h-[640px] bg-[radial-gradient(44%_52%_at_16%_22%,rgba(255,59,92,0.07),transparent_70%),radial-gradient(40%_48%_at_86%_60%,rgba(102,51,242,0.07),transparent_70%),radial-gradient(36%_44%_at_55%_95%,rgba(255,174,26,0.06),transparent_70%)]"
      />

      <div className="container-x">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="display text-3xl text-ink md:text-[2.5rem]">
                Travelled &amp; loved.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">
                Real trips confirmed in the last few days. Tap any pass to make
                it yours — change the route, hotels, activities, or just
                stretch the nights. The price follows.
              </p>
            </div>
          </div>
        </Reveal>

      </div>

      {/* the rail: true full width from the first frame — a small equal
          gutter each side, and the per-view card count steps up with the
          viewport (2 → 3 → 4 → 5) so passes fill the whole screen at rest.
          It drifts slowly on its own (the list is doubled for a seamless
          loop), holds while the pointer is on it, and the scrollbar stays
          hidden. */}
      <div
        ref={railRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => pauseFor(2500)}
        className="mt-10 w-full overflow-x-auto px-6 pb-4 pt-2 [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {/* cards render visible unconditionally — no in-view opacity gate.
            Inside a horizontal scroller the observer can fail to fire on
            some mobile browsers, which left the whole rail blank. The
            drift is the entrance. */}
        <div className="flex gap-5">
          {[...ordered, ...ordered].map((t, i) => (
            <div
              key={`${t.destination}-${i}`}
              aria-hidden={i >= ordered.length || undefined}
              className="w-[85%] shrink-0 sm:w-[64%] md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] 2xl:w-[calc((100%-3.75rem)/4)]"
            >
              <TicketCard trip={t} />
            </div>
          ))}
        </div>
      </div>

      <div className="container-x">
        <Reveal>
          <p className="mt-8 text-center text-[0.95rem] text-ink-2">
            Your trip could be the next pass here —{" "}
            <a
              href="#"
              className="inline-flex items-center gap-1 font-bold text-coral-deep underline-offset-4 transition-colors hover:text-coral hover:underline"
            >
              build my trip
              <ArrowRight size={14} />
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
