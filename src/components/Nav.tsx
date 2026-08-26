"use client";
import { APP_URL, waLink } from "@/lib/env";
import { wizardHref } from "@/lib/planner/openPlanner";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isChromeless } from "@/lib/chrome";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, WhatsApp } from "./Icons";
import { guidesByRegion, HUBS } from "@/lib/guides";

/* The island carries exactly the doors a traveller needs: where to go, the
   two business lines, a human on WhatsApp, and their account. Planning CTAs
   live on the page itself — the wizard's first question is the hero. */

/* Only /destinations exists in this static build; the business-line doors
   render exactly as they do in the product but are inert. */
const links = [
  { href: "/destinations", label: "Destinations" },
  { href: "#", label: "For Partners" },
  { href: "#", label: "Corporate Travel" },
];

const WA_HREF = waLink("Hi Zuumm! I'd like help planning a trip.");

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile
  const [hovered, setHovered] = useState<string | null>(null);
  /* the Destinations mega panel; a close timer bridges the pointer's hop
     from the link to the panel so it doesn't blink shut on the way */
  const [destOpen, setDestOpen] = useState(false);
  /* the same destinations list on phones, as an accordion inside the sheet */
  const [mobileDestOpen, setMobileDestOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const openDest = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDestOpen(true);
  };
  const scheduleCloseDest = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDestOpen(false), 140);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDestOpen(false);
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
              const isDest = l.href === "/destinations";
              const lit =
                hovered === l.href ||
                (isDest && destOpen) ||
                (hovered === null && active);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={() => {
                    setHovered(l.href);
                    if (isDest) openDest();
                    else setDestOpen(false);
                  }}
                  onMouseLeave={() => {
                    if (isDest) scheduleCloseDest();
                  }}
                  onFocus={() => isDest && openDest()}
                  aria-haspopup={isDest || undefined}
                  aria-expanded={isDest ? destOpen : undefined}
                  className={`relative inline-flex items-center gap-1 rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors duration-200 ${
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
                  {isDest && (
                    <ChevronDown
                      size={14}
                      aria-hidden
                      className={`transition-transform duration-200 motion-reduce:transition-none ${
                        destOpen ? "-rotate-180" : ""
                      } ${lit ? "text-ink-2" : "text-ink-3"}`}
                    />
                  )}
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
              href={APP_URL}
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

        {/* -------- destinations mega panel (desktop) -------- */}
        <AnimatePresence>
          {destOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.21, 0.6, 0.35, 1] }}
              onMouseEnter={openDest}
              onMouseLeave={scheduleCloseDest}
              className="pointer-events-auto mx-auto mt-2 hidden max-w-5xl rounded-3xl border border-line bg-white/95 p-7 shadow-[0_32px_90px_-24px_rgba(22,18,31,0.35)] backdrop-blur-xl md:block"
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                <p className="display text-[1.15rem] text-ink">
                  Where do you want to go?
                </p>
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-coral-deep hover:underline"
                >
                  View all destinations
                  <ArrowRight size={13} />
                </Link>
              </div>
              <div className="mt-5 grid max-h-[60vh] grid-cols-4 gap-x-8 gap-y-6 overflow-y-auto">
                {guidesByRegion().map((r) => (
                  <div key={r.key} className="break-inside-avoid">
                    <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-3">
                      {r.label}
                    </p>
                    <ul className="mt-2.5 space-y-1">
                      {r.guides.map((g) => (
                        <li key={g.slug}>
                          <Link
                            href={`/destinations/${g.slug}`}
                            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-[0.88rem] font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                          >
                            <span aria-hidden className="text-[1rem] leading-none">
                              {g.flag}
                            </span>
                            {g.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-3">
                    By region
                  </p>
                  <ul className="mt-2.5 space-y-1">
                    {HUBS.map((h) => (
                      <li key={h.slug}>
                        <Link
                          href={`/destinations/${h.slug}`}
                          className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-[0.88rem] font-semibold text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                        >
                          {h.name}
                          <ArrowRight size={13} className="text-ink-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  {l.href === "/destinations" ? (
                    <>
                      {/* the row splits: tap the label to browse, the chevron
                          to open the list without leaving the page */}
                      <div className="flex items-center justify-between border-b border-line/60">
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="flex-1 py-3.5 text-[1.02rem] font-medium text-ink"
                        >
                          {l.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileDestOpen((v) => !v)}
                          aria-expanded={mobileDestOpen}
                          aria-controls="mobile-destinations"
                          aria-label={
                            mobileDestOpen
                              ? "Hide all destinations"
                              : "Show all destinations"
                          }
                          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
                        >
                          <ChevronDown
                            size={17}
                            className={`transition-transform duration-200 motion-reduce:transition-none ${
                              mobileDestOpen ? "-rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {mobileDestOpen && (
                          <motion.div
                            id="mobile-destinations"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: [0.21, 0.6, 0.35, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="max-h-[52vh] space-y-4 overflow-y-auto overscroll-contain py-3 pl-1">
                              {guidesByRegion().map((r) => (
                                <div key={r.key}>
                                  <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-ink-3">
                                    {r.label}
                                  </p>
                                  <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5">
                                    {r.guides.map((g) => (
                                      <li key={g.slug}>
                                        <Link
                                          href={`/destinations/${g.slug}`}
                                          onClick={() => setOpen(false)}
                                          className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-[0.9rem] font-medium text-ink-2"
                                        >
                                          <span aria-hidden className="text-[1rem] leading-none">
                                            {g.flag}
                                          </span>
                                          <span className="truncate">{g.name}</span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                              <div>
                                <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-ink-3">
                                  By region
                                </p>
                                <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5">
                                  {HUBS.map((h) => (
                                    <li key={h.slug}>
                                      <Link
                                        href={`/destinations/${h.slug}`}
                                        onClick={() => setOpen(false)}
                                        className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-[0.9rem] font-semibold text-ink-2"
                                      >
                                        <span className="truncate">{h.name}</span>
                                        <ArrowRight size={13} className="shrink-0 text-ink-3" />
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <Link
                                href="/destinations"
                                onClick={() => setOpen(false)}
                                className="inline-flex min-h-11 items-center gap-1.5 px-2 text-[0.88rem] font-bold text-coral-deep"
                              >
                                View all destinations
                                <ArrowRight size={14} />
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-line/60 py-3.5 text-[1.02rem] font-medium text-ink"
                    >
                      {l.label}
                      <ArrowRight size={16} className="text-ink-3" />
                    </Link>
                  )}
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
                  href={APP_URL}
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
