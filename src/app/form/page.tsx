import type { Metadata } from "next";
import FormPage from "./FormPage";

export const metadata: Metadata = {
  /* absolute: this page ships as a white-label template, so it opts out of
     the root layout's "%s · <brand>" title template */
  title: { absolute: "Book flights, stays & experiences" },
  description:
    "One search across 400+ airlines, 6,00,000+ hotels and 30,000+ curated experiences — matched by AI, backed by a real ground team on WhatsApp, 24×7.",
  alternates: { canonical: "/form" },
};

export default function Page() {
  return <FormPage />;
}
