"use client";
import { SITE_URL } from "@/lib/env";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isChromeless } from "@/lib/chrome";
import { useState } from "react";
import { Star } from "./Icons";

const cols = [
  {
    h: "Product",
    items: [
      { label: "Everything Zuumm does", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Plan a trip", href: "#" },
      {
        label: "Explore packages",
        href: "#",
      },
    ],
  },
  {
    h: "For business",
    items: [
      { label: "For Partners", href: "#" },
      { label: "Corporate travel", href: "#" },
      { label: "Get started", href: "#" },
    ],
  },
  {
    h: "Company",
    items: [
      { label: "About Zuumm", href: "#" },
      { label: "Wander Notes", href: "#" },
      { label: "Technical documents", href: "#" },
      { label: "Contact us", href: "#" },
    ],
  },
  {
    h: "Legal",
    items: [
      { label: "Terms & Conditions", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (isChromeless(pathname)) return null;

  return (
    <footer className="bg-ink text-white/80 mt-0">
      <div className="container-x py-16">
        {/* newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <p className="eyebrow text-coral mb-3">Wander Notes weekly</p>
            <h2 className="display text-white text-2xl md:text-3xl max-w-md">
              Trip ideas and fare drops, once a week.
            </h2>
          </div>
          {done ? (
            <p className="text-mint font-medium">
              Subscribed — see you in your inbox.
            </p>
          ) : (
            <form
              className="flex w-full max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setDone(true);
              }}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-full bg-white/10 border border-white/15 px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-coral"
              />
              <button
                type="submit"
                className="grad-bg shrink-0 rounded-full px-5 py-3 font-semibold text-white hover:opacity-90 transition-opacity sm:px-6"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 py-12">
          <div className="col-span-2">
            <Image
              src="/brand/logo.png"
              alt="Zuumm"
              width={140}
              height={28}
              className="h-7 w-auto brightness-0 invert"
            />
            <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-xs">
              One AI travel engine. Plan it, book it, or run your own travel
              business on it.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex text-sun" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} />
                ))}
              </span>
              <span className="text-white/70">4.9 on Google · 39 reviews</span>
            </div>
          </div>
          {cols.map((c) => (
            <nav key={c.h} aria-label={c.h}>
              <h3 className="eyebrow text-white/50 mb-4">{c.h}</h3>
              <ul className="space-y-2.5 text-sm">
                {c.items.map((i) =>
                  i.href.startsWith("/") ? (
                    <li key={i.label}>
                      <Link
                        href={i.href}
                        className="hover:text-white transition-colors"
                      >
                        {i.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={i.label}>
                      <a
                        href={i.href}
                        className="hover:text-white transition-colors"
                      >
                        {i.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>
          ))}
        </div>

        {/* recognition + app */}
        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 py-8 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-white/15 px-3 py-2 text-[0.72rem] font-medium text-white/70">
              Recognised by DIPP&nbsp;121477
            </span>
            <span className="rounded-lg border border-white/15 px-3 py-2 text-[0.72rem] font-medium text-white/70">
              MSME UDYAM-KR-03-0235560
            </span>
            <span className="rounded-lg border border-white/15 px-3 py-2 text-[0.72rem] font-medium text-white/70">
              Startup India recognised
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[0.78rem] font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
            Mobile app — coming 2026
          </span>
        </div>

        {/* entities */}
        <div className="border-t border-white/10 pt-8 grid grid-cols-1 gap-6 md:grid-cols-3 text-xs text-white/45 leading-relaxed">
          <p>
            ZUUMM Inc., 131 Continental Dr, Newark, Delaware 19713, USA
            <br />
            ZUUMM Canada, Toronto, ON L1T 3S2
          </p>
          <p>
            IncBuddy Technologies Pvt. Ltd., 1005 Prestige Meridian 2, MG Road,
            Bangalore, India
            <br />
            DIPP121477 · MSME UDYAM-KR-03-0235560
          </p>
          <p className="md:text-right">
            contact@zuumm.ai · +91 63660 92532
            <br />© {new Date().getFullYear()} ZUUMM Inc. Developed with IncBuddy
            Technologies Pvt. Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
