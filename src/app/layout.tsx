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
import SiteSchema from "@/components/SiteSchema";

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
        <SiteSchema />
        <Nav />
        <main className="flex-1 overflow-x-clip">{children}</main>
        <StickyCTA />
        <Footer />
      </body>
    </html>
  );
}
