"use client";

import { usePathname } from "next/navigation";
import { isWhiteLabel } from "@/lib/branding";

/* The two site-wide notes the root layout used to inline: the organisation
   schema search engines read, and the design contract this build was made
   against. Both name the company, so both sit out on white-label routes. */

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zuumm",
  url: "https://www.zuumm.ai",
  logo: "https://www.zuumm.ai/brand/logo.png",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@zuumm.ai",
    telephone: "+91-63660-92532",
    contactType: "customer support",
  },
};

const DESIGN_CONTRACT = `
THESIS: The OTA homepage that shows its machinery working, live bookings, visas moving, a ground team answering, and refuses the category default of a wall of destination stock photos.
OWN-WORLD: Deep-ink command deck ground with aurora glows; white paper objects (tickets, demo cards, FAQ sheet) laid on the desk; coral primary, violet and teal reserved for the partner and corporate doors; Bricolage display, Instrument body, JetBrains mono on every number; pill controls, 24-28px card radii, ticket perforations, film grain.
STORY: A traveller sees real operations running, believes plans are computed and watched rather than imagined, and answers the wizard's first question right on the hero.
FIRST VIEWPORT: Left: headline, "who's going?" crew chips feeding the trip wizard, primary wizard CTA, demoted one-line-brief link. Right: live-operations deck with a ticking event feed.
FORM: Live-ops command deck, candidate 3 of 7, seed ba2d3e62.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md`;

export default function SiteSchema() {
  if (isWhiteLabel(usePathname())) return null;
  return (
    <>
      <script
        type="text/x-design-contract"
        dangerouslySetInnerHTML={{ __html: DESIGN_CONTRACT }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
    </>
  );
}
