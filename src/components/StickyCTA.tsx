"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isChromeless } from "@/lib/chrome";
import { AnimatePresence, motion } from "framer-motion";
import { waLink } from "@/lib/env";

/* Mobile-only sticky action bar — travel-industry standard.
   Appears after the hero scrolls away; never on the wizard. */
export default function StickyCTA() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isChromeless(pathname) || pathname?.startsWith("/chat")) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.21, 0.6, 0.35, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 md:hidden"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white/95 p-2 shadow-[0_16px_50px_-12px_rgba(22,18,31,0.35)] backdrop-blur-lg">
            <Link
              href="#"
              className="grad-bg flex-1 rounded-xl py-3 text-center text-[0.95rem] font-semibold text-white"
            >
              Build my trip
            </Link>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Plan on WhatsApp"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-mint"
            >
              {/* WhatsApp glyph */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.3-.2z" />
              </svg>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
