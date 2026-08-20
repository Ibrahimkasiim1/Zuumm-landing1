import Link from "next/link";
import { ArrowRight, Building, Users, Passport } from "./Icons";
import { Reveal } from "./Reveal";

/* The gates band: three ways into Zuumm beyond the planner, as departure
   gates on the deck. On desktop the row is a flex strip where the hovered
   gate widens and its body copy fades in; the visa gate boards first (wider
   by default, coral, B2C). On mobile they stack as full cards with the copy
   always visible. */

const GATES: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  gate: string;
  title: string;
  body: string;
  cta: string;
  base: string;
  glow: string;
  featured?: boolean;
}[] = [
  {
    href: "#",
    icon: Passport,
    gate: "V-01",
    title: "Need just the visa?",
    body: "The engine behind our 99.7% approval rate works solo: documents pre-validated, errors flagged before submission, the decision tracked live. 73 countries.",
    cta: "Request visa",
    base: "bg-[linear-gradient(160deg,rgba(255,59,92,0.32),rgba(255,59,92,0.08))]",
    glow: "bg-coral/40",
    featured: true,
  },
  {
    href: "#",
    icon: Users,
    gate: "P-02",
    title: "Run a travel business?",
    body: "Launch your own branded AI travel platform in minutes: your domain, your margins, our engine and inventory.",
    cta: "See the partner platform",
    base: "bg-[linear-gradient(160deg,rgba(102,51,242,0.32),rgba(102,51,242,0.08))]",
    glow: "bg-violet/40",
  },
  {
    href: "#",
    icon: Building,
    gate: "C-03",
    title: "Manage company travel?",
    body: "Policy built into the AI, approval flows, one corporate wallet and GST-ready invoices: travel your CFO will actually like.",
    cta: "See corporate travel",
    base: "bg-[linear-gradient(160deg,rgba(14,116,144,0.38),rgba(14,116,144,0.1))]",
    glow: "bg-teal/40",
  },
];

export default function DoorsBand() {
  return (
    <section className="container-x py-16 md:py-24" aria-label="More from Zuumm">
      <Reveal>
        <div className="flex flex-col gap-5 lg:h-[400px] lg:flex-row">
          {GATES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className={`group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-ink p-7 transition-all duration-500 ease-[cubic-bezier(0.21,0.6,0.35,1)] hover:border-white/25 md:p-8 lg:min-h-0 ${g.base} ${
                g.featured ? "lg:flex-[1.5]" : "lg:flex-1"
              } lg:hover:flex-[1.9]`}
            >
              <span
                aria-hidden
                className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${g.glow} blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-90`}
              />

              <div className="relative flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-white backdrop-blur-sm">
                  <g.icon size={21} />
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-widest text-white/70">
                  gate {g.gate}
                </span>
              </div>

              <div className="relative">
                <h3 className="display text-[1.5rem] leading-tight text-white md:text-[1.7rem]">
                  {g.title}
                </h3>
                <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-white/75 transition-all duration-500 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-40 lg:group-hover:opacity-100">
                  {g.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.95rem] font-semibold text-white">
                  {g.cta}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
