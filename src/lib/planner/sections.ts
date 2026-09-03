/* The funnel's sections — the shape the whole wizard speaks in.

   One definition, two readers: the header's progress bar (WizardRoot) and
   the reveal's "Edit:" row (StepItinerary). They used to name the steps
   separately, which is how a progress bar and an edit row drift into
   disagreeing about what the trip is made of. Icons stay with the header,
   keyed by label — this file holds no JSX so the engine side can read it. */

export type SectionScreen =
  | "crew"
  | "prefs"
  | "destination"
  | "hubs"
  | "experiences"
  | "reveal";

export type WizardSection = {
  label: string;
  /** the screens this section covers, in order — the first is its entry */
  screens: SectionScreen[];
};

export const WIZARD_SECTIONS: WizardSection[] = [
  { label: "Trip details", screens: ["crew", "prefs"] },
  { label: "Destinations", screens: ["destination"] },
  { label: "Cities", screens: ["hubs"] },
  { label: "Your plan", screens: ["experiences", "reveal"] },
];
