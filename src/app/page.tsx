import type { Metadata } from "next";
import DestinationHero from "@/components/home/hero-slider/DestinationHero";
import BriefBand from "@/components/home/BriefBand";
import MetricsBand from "@/components/home/MetricsBand";
import RecentlyBooked from "@/components/home/RecentlyBooked";
import WhyPillars from "@/components/home/WhyPillars";
import TrendingSearches from "@/components/home/TrendingSearches";
import DoorsBand from "@/components/DoorsBand";
import FAQ from "@/components/FAQ";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Zuumm: Your trip, built to spec. Planned, priced and tracked.",
  description:
    "Zuumm's guided trip wizard turns your answers into a fully priced holiday: real hotels at seasonal rates, visas with a 99.7% approval engine, one all-in price, and a ground team on WhatsApp for the entire trip.",
  alternates: { canonical: "/" },
};

/* The home page opens as a cinema and continues as a command deck. The
   hero is the one place destination photography is allowed: a full-viewport
   slider where picking a place drops you into the wizard with that answer
   filled in. Everything after it is the machinery working on white paper.
   Section order tells that story:

     hero (pick a place) → the numbers → why (four promises, each
     demoed) → proof (travelled & loved) → demand (trending searches)
     → other doors → FAQ → close (describe it, or take a guided door).  */

const faqs = [
  {
    q: "How does the trip wizard work?",
    a: "You answer three quick questions: who's going, where to, and what kind of trip. A deterministic engine then builds the itinerary from curated rate cards: real hotels, real seasonal prices, day trips and transfers sequenced. Everything else — dates, nights, departure city, hotel comfort — starts from sensible defaults you edit right on the finished plan. Nothing in the price is AI-guessed, and every answer you give shapes the plan, so nothing gets lost the way it can in a one-line chat prompt.",
  },
  {
    q: "Are the prices real and bookable?",
    a: "Yes. The planner uses contracted seasonal rate cards, with a travel expert confirming live availability before you pay. Flights are searched across 300+ airlines and hotels across 600,000+ properties at booking time. Your approved quote is the amount you pay, with taxes, transfers, tips, and visa fees included. Activities and transfers are intelligently optimized around your route, timings, and location, while the itinerary can be customized to suit your preferences. You also get expert-checked planning and support if your plans change.",
  },
  {
    q: "What does 99.7% visa approval actually mean?",
    a: "We built our visa system in-house. It pre-validates your documents against each country's current rules, flags errors before anything is submitted, and tracks the decision in real time. That pre-validation step is why 99.7% of applications we file get approved, across 130+ countries.",
  },
  {
    q: "Who is tracking my trip while I travel?",
    a: "A real ground team, on WhatsApp, 24×7. They reconfirm pickups the night before, verify hotel check-ins in writing, and catch issues (weather, delays, closures) before they reach you. Every Zuumm trip runs through this desk.",
  },
  {
    q: "Can I customise a trip before booking?",
    a: "Fully. Start from your own brief, a quick-start plan, or any recently booked trip on this page. Swap hotels, stretch nights, add or drop experiences: the price recalculates as you edit, and you book the version you shaped.",
  },
  {
    q: "Is Zuumm free to use?",
    a: "Yes, it's completely free to use. Signing up lets you save and revisit your trips, personalize recommendations, keep your travel history, bookmark favourites, and pick up where you left off. Your profile also helps ZUUMM make your travel experience more relevant over time.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Home() {
  return (
    <div className="bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 01 · hero: the cinematic destination switcher — pick a place,
          land in the wizard with it pre-answered */}
      <DestinationHero />

      {/* 02 · proof strip: the numbers Zuumm runs on, right off the hero */}
      <MetricsBand />

      {/* 03 · why: four promises, each demonstrated */}
      <WhyPillars />

      {/* 04 · proof: real trips confirmed this week */}
      <RecentlyBooked />

      {/* 05 · demand: what India is searching */}
      <TrendingSearches />

      {/* 06 · other doors: visas solo, partners, corporate */}
      <DoorsBand />

      {/* 07 · FAQ — the white sheet is a paper object on the deck */}
      <section className="container-x pb-24 pt-8" id="faq">
        <Reveal>
          <h2 className="display text-center text-3xl text-ink md:text-[2.5rem]">
            Everything else you&rsquo;d ask.
          </h2>
        </Reveal>
        <div className="mt-12">
          <FAQ items={faqs} />
        </div>
      </section>

      {/* 08 · close: the last ask — describe it in your own words, or
          take a guided door. BriefBand is the merged finale. */}
      <BriefBand />
    </div>
  );
}
