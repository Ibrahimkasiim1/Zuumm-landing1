import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StickyCTA from "@/components/StickyCTA";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zuumm.ai"),
  title: {
    default: "Zuumm — Describe your trip, see it priced in seconds",
    template: "%s · Zuumm",
  },
  description:
    "Zuumm is an AI travel platform for India. Plan flights, hotels, activities, holiday packages and visas in one conversation — then book at live prices.",
  keywords: [
    "AI travel planner",
    "holiday packages India",
    "flight booking",
    "hotel booking",
    "visa assistance India",
    "corporate travel management",
    "white label travel platform",
  ],
  openGraph: {
    type: "website",
    siteName: "Zuumm",
    title: "Zuumm — Your whole trip, planned and booked in one chat",
    description:
      "Flights, hotels, activities, packages and visas — planned by AI, booked at live prices.",
    url: "https://www.zuumm.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zuumm — AI travel, booked in one chat",
    description:
      "Flights, hotels, activities, packages and visas — planned by AI, booked at live prices.",
  },
  robots: { index: true, follow: true },
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="text/x-design-contract"
          dangerouslySetInnerHTML={{
            __html: `
THESIS: The OTA homepage that shows its machinery working, live bookings, visas moving, a ground team answering, and refuses the category default of a wall of destination stock photos.
OWN-WORLD: Deep-ink command deck ground with aurora glows; white paper objects (tickets, demo cards, FAQ sheet) laid on the desk; coral primary, violet and teal reserved for the partner and corporate doors; Bricolage display, Instrument body, JetBrains mono on every number; pill controls, 24-28px card radii, ticket perforations, film grain.
STORY: A traveller sees real operations running, believes plans are computed and watched rather than imagined, and answers the wizard's first question right on the hero.
FIRST VIEWPORT: Left: headline, "who's going?" crew chips feeding the trip wizard, primary wizard CTA, demoted one-line-brief link. Right: live-operations deck with a ticking event feed.
FORM: Live-ops command deck, candidate 3 of 7, seed ba2d3e62.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Nav />
        <main className="flex-1 overflow-x-clip">{children}</main>
        <StickyCTA />
        <Footer />
      </body>
    </html>
  );
}
