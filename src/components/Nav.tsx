"use client";
import { APP_URL, waLink } from "@/lib/env";
import { wizardHref } from "@/lib/planner/openPlanner";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isChromeless } from "@/lib/chrome";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, WhatsApp } from "./Icons";

/* The island carries exactly the doors a traveller needs: where to go, the
   two business lines, a human on WhatsApp, and their account. Planning CTAs
   live on the page itself — the wizard's first question is the hero. */

const links = [
  { href: "/#destinations", label: "Destinations" },
  { href: "#", label: "For Partners" },
  { href: "#", label: "Corporate Travel" },
];

const WA_HREF = "#";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isChromeless(pathname)) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      {/* -------- floating island -------- */}
      <div className="container-x pointer-events-none">
        <nav
          className={`pointer-events-auto mx-auto mt-3 flex h-14 max-w-4xl items-center justify-between gap-2 rounded-full border pl-5 pr-2 transition-all duration-300 md:mt-4 ${
            scrolled || open
              ? "border-line bg-white/95 shadow-[0_12px_40px_-12px_rgba(22,18,31,0.28)] backdrop-blur-xl"
              : "border-line/70 bg-white/90 shadow-[0_8px_30px_-16px_rgba(22,18,31,0.2)] backdrop-blur-md"
          }`}
        >
          <Link
            href="/"
            aria-label="Zuumm home"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/brand/logo.png"
              alt="Zuumm"
              width={118}
              height={24}
              priority
              className="h-[22px] w-auto"
            />
          </Link>

          {/* desktop links */}
          <div
            className="relative hidden items-center md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {links.map((l) => {
              const active = pathname === l.href;
              const lit = hovered === l.href || (hovered === null && active);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={() => setHovered(l.href)}
                  className={`relative rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors duration-200 ${
                    lit ? "text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {lit && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-paper-2"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* right cluster: a human on WhatsApp, then the account door */}
          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            {/* neutral so the coral CTA keeps the header's only loud voice */}
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Zuumm on WhatsApp"
              title="Chat on WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper-2 text-ink-2 transition-all duration-200 ease-out hover:scale-[1.06] hover:text-ink active:scale-[0.96]"
            >
              <WhatsApp size={19} />
            </a>
            <a
              href="#"
              className="rounded-full px-4 py-2 text-[0.9rem] font-semibold text-ink transition-colors hover:text-coral-deep"
            >
              Log in
            </a>
            <a
              href={wizardHref()}
              className="inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2.5 text-[0.9rem] font-bold text-white shadow-[0_14px_40px_-18px_rgba(255,59,92,0.55)] transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.97]"
            >
              Plan my trip
            </a>
          </div>

          {/* mobile burger */}
          <button
            className="p-2.5 text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M3 7h18M3 12h18M3 17h18" />
              )}
            </svg>
          </button>
        </nav>

        {/* -------- mobile menu -------- */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto mx-auto mt-2 rounded-3xl border border-line bg-white p-5 shadow-[0_24px_70px_-20px_rgba(22,18,31,0.3)] md:hidden"
            >
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-line/60 py-3.5 text-[1.02rem] font-medium text-ink"
                  >
                    {l.label}
                    <ArrowRight size={16} className="text-ink-3" />
                  </Link>
                </motion.div>
              ))}
              <a
                href={wizardHref()}
                className="mt-4 block rounded-full bg-coral px-5 py-3 text-center font-bold text-white shadow-[0_14px_40px_-18px_rgba(255,59,92,0.55)]"
              >
                Plan my trip
              </a>
              <div className="flex items-center gap-3 pt-3">
                <a
                  href="#"
                  className="flex-1 rounded-full border border-line px-5 py-3 text-center font-medium"
                >
                  Log in
                </a>
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-paper-2 px-5 py-3 text-center font-semibold text-ink-2"
                >
                  <WhatsApp size={17} />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
