import { Reveal } from "@/components/Reveal";
import CountUp from "@/components/CountUp";

/* The numbers Zuumm runs on — a full-width proof strip directly under the
   hero. Counting is still the point (these are operational quantities, not
   slogans), but the strip stays quiet: no icons, no accent color. Each cell
   stacks the figure over its description, centered, so the numbers read
   first. Keep these in sync with the FAQ copy and PRODUCT.md's claims. */

const METRICS: {
  to: number;
  decimals?: number;
  suffix: string;
  label: string;
}[] = [
  { to: 600000, suffix: "+", label: "bookable hotels worldwide" },
  { to: 30000, suffix: "+", label: "curated activities" },
  { to: 400, suffix: "+", label: "airlines, live fares" },
  { to: 99.7, decimals: 1, suffix: "%", label: "visa approvals, our own engine" },
];

export default function MetricsBand() {
  return (
    <section className="w-full border-y border-line" aria-label="Zuumm in numbers">
      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="px-6 py-8 text-center md:py-10">
              <p className="font-mono text-[1.6rem] font-medium leading-none tabular-nums text-ink md:text-[2rem]">
                <CountUp to={m.to} decimals={m.decimals} />
                {m.suffix}
              </p>
              <p className="mt-2.5 text-[0.82rem] font-normal leading-snug text-ink-2 md:text-[0.88rem]">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
