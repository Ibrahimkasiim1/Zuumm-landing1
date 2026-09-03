/* The option tables the whole planner reads from — one definition, used by
   the start screen, the canvas chip editors, the experience browser filters
   and the copilot's vocabulary. (The old wizard duplicated these across the
   modal and the step files, which is how the two drifted apart.) */

import type { Crew, Pace } from "./engine";
import type { HotelTierKey } from "./thailand-data";

/* One tap fills the whole party — solo auto-sets 1 adult, couple 2, and so
   on; the exact counters below the cards fine-tune from there. */
export const CREWS: {
  key: Crew;
  label: string;
  sub: string;
  adults: number;
  children: number;
  infants: number;
}[] = [
  { key: "solo", label: "Just me", sub: "1 traveller", adults: 1, children: 0, infants: 0 },
  { key: "couple", label: "Couple", sub: "2 travellers", adults: 2, children: 0, infants: 0 },
  { key: "family", label: "Family", sub: "With kids", adults: 2, children: 2, infants: 0 },
  { key: "friends", label: "Friends", sub: "1+ travellers", adults: 4, children: 0, infants: 0 },
];

/** Which crew card a hand-typed headcount lands on, so the cards and the
    counters never disagree: any kids make it a family, one adult alone is
    solo, two is a couple, more is friends. */
export function crewForParty(adults: number, children: number): Crew {
  if (children > 0) return "family";
  if (adults <= 1) return "solo";
  if (adults === 2) return "couple";
  return "friends";
}

export const VIBES: { key: string; label: string; short: string }[] = [
  { key: "beaches", label: "Beaches & islands", short: "Beaches" },
  { key: "culture", label: "Temples & culture", short: "Culture" },
  { key: "food", label: "Street food", short: "Food" },
  { key: "nature", label: "Nature & wildlife", short: "Nature" },
  { key: "adventure", label: "Adventure", short: "Adventure" },
  { key: "wellness", label: "Slow & wellness", short: "Wellness" },
];

export const PACES: { key: Pace; label: string; sub: string }[] = [
  { key: "relaxed", label: "Relaxed", sub: "One thing a day" },
  { key: "balanced", label: "Balanced", sub: "See a lot, still breathe" },
  { key: "packed", label: "Packed", sub: "Every hour counts" },
];

export const TIERS: { key: HotelTierKey; label: string; sub: string }[] = [
  { key: "3", label: "3★", sub: "Clean & central" },
  { key: "4", label: "4★", sub: "The sweet spot" },
  { key: "5", label: "5★", sub: "Landmark stays" },
];

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const SEASON_CHIP: Record<string, { label: string; cls: string }> = {
  peak: { label: "Peak · best weather", cls: "bg-coral-soft text-coral-deep" },
  shoulder: { label: "Shoulder · great balance", cls: "bg-violet-soft text-violet-deep" },
  low: { label: "Green · best prices", cls: "bg-mint/12 text-mint" },
};

export const NIGHT_PRESETS = [4, 5, 7, 10, 14];

export const crewLabel = (crew: Crew) =>
  CREWS.find((c) => c.key === crew)?.label ?? "Travellers";

export const vibeLabel = (key: string) =>
  VIBES.find((v) => v.key === key)?.short ?? key;
