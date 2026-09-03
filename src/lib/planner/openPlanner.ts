/* The one way into the planner.

   The guided wizard lives at /plan and is the site's single funnel: every
   CTA routes through the helpers here. A preset can pre-answer the wizard's
   questions (crew, vibes, destination) or carry a whole trip (destination,
   nights, tier, route, pinned experiences and a target screen) — that's how
   the "booked this week" story cards land a visitor straight on a suggested
   itinerary with nothing left to answer. */

export interface WizardPreset {
  /** crew key from lib/planner/options.ts — solo | couple | family | friends */
  crew?: string;
  vibes?: string[];
  /** a live destination name from lib/planner/destinations.ts */
  to?: string;
  nights?: number;
  /** hotel tier — "3" | "4" | "5" */
  tier?: string;
  /** hub cities, in visit order */
  cities?: string[];
  /** attraction ids (lib/planner/attractions.ts) to pin into the plan */
  pins?: string[];
  /** which screen to land on, e.g. "suggested" */
  q?: string;
  /** wipe any stored wizard draft and start clean */
  fresh?: boolean;
}

export function wizardHref(preset?: WizardPreset): string {
  const p = new URLSearchParams();
  if (preset?.crew) p.set("crew", preset.crew);
  if (preset?.vibes?.length) p.set("vibes", preset.vibes.join(","));
  if (preset?.to) p.set("to", preset.to);
  if (preset?.nights) p.set("nights", String(preset.nights));
  if (preset?.tier) p.set("tier", preset.tier);
  if (preset?.cities?.length) p.set("cities", preset.cities.join(","));
  if (preset?.pins?.length) p.set("pins", preset.pins.join(","));
  if (preset?.q) p.set("q", preset.q);
  if (preset?.fresh) p.set("fresh", "1");
  const qs = p.toString();
  return qs ? `/plan?${qs}` : "/plan";
}

export function openWizard(preset?: WizardPreset) {
  window.location.assign(wizardHref(preset));
}

/* Legacy alias for the retired canvas planner — same funnel, different
   preset shape. Kept so older CTA components keep compiling. */

export interface PlannerPreset {
  destination?: string;
  nights?: number;
  vibes?: string[];
  cities?: string[];
}

export function plannerHref(preset?: PlannerPreset): string {
  return wizardHref({
    to: preset?.destination,
    nights: preset?.nights,
    vibes: preset?.vibes,
    cities: preset?.cities,
    fresh: true,
  });
}

export function openTripPlanner(preset?: PlannerPreset) {
  window.location.assign(plannerHref(preset));
}
