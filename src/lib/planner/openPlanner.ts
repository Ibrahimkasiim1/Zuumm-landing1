/* Static-landing stub. The full product routes these helpers into the trip
   wizard and planner with a preloaded preset; this standalone landing build
   has no planner, so every entry point renders normally but goes nowhere. */

export interface PlannerPreset {
  brief?: string;
  [key: string]: unknown;
}

export interface WizardPreset {
  crew?: string;
  to?: string;
  nights?: number;
  cities?: string[];
  pins?: string[];
  q?: string;
  fresh?: boolean;
  [key: string]: unknown;
}

export function plannerHref(_preset?: PlannerPreset): string {
  return "#";
}

export function wizardHref(_preset?: WizardPreset): string {
  return "#";
}

export function openTripPlanner(_preset?: PlannerPreset) {
  /* no-op in the static landing build */
}

export function openWizard(_preset?: WizardPreset) {
  /* no-op in the static landing build */
}
