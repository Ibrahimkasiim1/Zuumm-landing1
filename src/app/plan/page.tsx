import type { Metadata } from "next";
import { Suspense } from "react";
import WizardRoot from "./WizardRoot";

export const metadata: Metadata = {
  title: "Plan your trip · Zuumm",
  description:
    "A guided trip builder: tell us who's going and what you love, pick your hubs and experiences, and watch a fully priced day-by-day itinerary assemble itself.",
  alternates: { canonical: "/plan" },
};

export default function PlanPage() {
  return (
    <Suspense>
      <WizardRoot />
    </Suspense>
  );
}
