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
import { ArrowRight } from "@/components/Icons";

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

     hero (pick a place) → the numbers → where next (search anywhere)
     → why (four promises, each demoed) → proof (travelled & loved)
     → demand (trending searches) → other doors → FAQ → close.            */

const faqs = [
  {
    q: "How does the trip wizard work?",
    a: "You answer three quick questions: who's going, where to, and what kind of trip. A deterministic engine then builds the itinerary from curated rate cards: real hotels, real seasonal prices, day trips and transfers sequenced. Everything else — dates, nights, departure city, hotel comfort — starts from sensible defaults you edit right on the finished plan. Nothing in the price is AI-guessed, and every answer you give shapes the plan, so nothing gets lost the way it can in a one-line chat prompt.",
  },
  {
    q: "Are the prices real and bookable?",
    a: "Yes. The planner prices from contracted seasonal rate cards, and a travel expert confirms live availability before you pay. Flights are searched across 400+ airlines and 6,00,000+ hotels at booking time. The quote you approve is the amount you pay: taxes, transfers, tips and visa fees included.",
  },
  {
    q: "What does 99.7% visa approval actually mean?",
    a: "We built our visa system in-house. It pre-validates your documents against each country's current rules, flags errors before anything is submitted, and tracks the decision in real time. That pre-validation step is why 99.7% of applications we file get approved, across 73 countries.",
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
    a: "Building and viewing your trip plan is completely free, with no sign-up needed. You only pay when you book, and signup exists so your plans are saved, never as a gate in front of a price.",
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

      {/* 03 · the second door: describe the trip in one line instead */}
      <BriefBand />

      {/* 04 · why: four promises, each demonstrated */}
      <WhyPillars />

      {/* 05 · proof: real trips confirmed this week */}
      <RecentlyBooked />

      {/* 06 · demand: what India is searching */}
      <TrendingSearches />

      {/* 07 · other doors: visas solo, partners, corporate */}
      <DoorsBand />

      {/* 08 · FAQ — the white sheet is a paper object on the deck */}
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

      {/* 09 · close */}
      <section className="container-x pb-24">
        <Reveal>
          {/* the closer sits on the same paper as the rest of the page:
              a white card with a soft sunset wash, coral only on the CTA */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-white px-8 py-16 text-center shadow-[0_28px_80px_-48px_rgba(22,18,31,0.3)] md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-sun/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -right-28 h-96 w-96 rounded-full bg-coral/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="display mx-auto max-w-2xl text-3xl text-ink md:text-[2.8rem]">
                Your next trip is a few answers away.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
                Free to plan, priced from real rates, watched by real humans
                from pickup to touchdown.
              </p>
              {/* both doors into the planner: hands-on, or AI-led */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-coral px-8 py-4 text-lg font-bold text-white shadow-[0_18px_50px_-18px_rgba(255,59,92,0.6)] transition-transform hover:scale-[1.04] active:scale-[0.98]"
                >
                  Build it myself
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-8 py-4 text-lg font-bold text-ink-2 transition-all hover:scale-[1.04] hover:border-ink-3 hover:text-ink active:scale-[0.98]"
                >
                  Let AI plan it
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
