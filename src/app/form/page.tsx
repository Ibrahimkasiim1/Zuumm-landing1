import type { Metadata } from "next";
import FormPage from "./FormPage";

/* This page ships as a white-label template, so its <head> carries nothing
   that names the company. Next merges metadata shallowly, which is what
   makes that possible: an absolute title escapes the root layout's
   "%s · <brand>" template, and `null` is how a child drops a field the
   parent set — here the site-wide openGraph, twitter, keywords and the
   metadataBase every canonical URL would otherwise be built from.

   The <body> side (organisation schema, design contract) is handled by
   components/SiteSchema.tsx via lib/branding.ts. */

export const metadata: Metadata = {
  metadataBase: null,
  title: { absolute: "Book flights, stays & experiences" },
  description:
    "One search across 400+ airlines, 6,00,000+ hotels and 30,000+ curated experiences — matched by AI, with a real ground team on WhatsApp, 24×7.",
  keywords: null,
  openGraph: null,
  twitter: null,
};

export default function Page() {
  return <FormPage />;
}
