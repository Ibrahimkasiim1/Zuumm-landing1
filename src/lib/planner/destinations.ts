/* Destination registry — every destination Zuumm intends to serve, with an
   honest status. `live` destinations have a full curated dataset behind the
   wizard; `soon` destinations are plannable conversationally in chat while
   their rate-card datasets are onboarded (see ZUUMM_DATA_STRATEGY.md at the
   workspace root for the acquisition pipeline). */

export type DestinationStatus = "live" | "soon";

export interface Destination {
  name: string;
  region: string;
  status: DestinationStatus;
  blurb?: string;
  /** flag shown next to the name when the destination is live */
  emoji?: string;
}

export const DESTINATIONS: Destination[] = [
  // Southeast Asia
  { name: "Thailand", region: "Southeast Asia", status: "live", emoji: "🇹🇭", blurb: "43 cities · 55 curated experiences · full pricing" },
  { name: "Bali", region: "Southeast Asia", status: "live", emoji: "🇮🇩", blurb: "2 hubs · 51 curated experiences · full pricing" },
  { name: "Indonesia", region: "Southeast Asia", status: "soon", blurb: "Beyond Bali — Java, Komodo & the Gilis" },
  { name: "Vietnam", region: "Southeast Asia", status: "soon" },
  { name: "Singapore", region: "Southeast Asia", status: "soon" },
  { name: "Malaysia", region: "Southeast Asia", status: "soon" },
  { name: "Philippines", region: "Southeast Asia", status: "soon" },
  { name: "Cambodia", region: "Southeast Asia", status: "soon" },
  { name: "Laos", region: "Southeast Asia", status: "soon" },

  // East Asia
  { name: "Japan", region: "East Asia", status: "soon" },
  { name: "South Korea", region: "East Asia", status: "soon" },
  { name: "China", region: "East Asia", status: "soon" },
  { name: "Hong Kong", region: "East Asia", status: "soon" },
  { name: "Taiwan", region: "East Asia", status: "soon" },

  // South Asia & Indian Ocean
  { name: "Maldives", region: "Indian Ocean", status: "soon" },
  { name: "Sri Lanka", region: "Indian Ocean", status: "soon" },
  { name: "Nepal", region: "South Asia", status: "soon" },
  { name: "Bhutan", region: "South Asia", status: "soon" },
  { name: "Mauritius", region: "Indian Ocean", status: "soon" },
  { name: "Seychelles", region: "Indian Ocean", status: "soon" },

  // Middle East
  { name: "UAE", region: "Middle East", status: "soon", blurb: "Dubai & Abu Dhabi" },
  { name: "Saudi Arabia", region: "Middle East", status: "soon" },
  { name: "Qatar", region: "Middle East", status: "soon" },
  { name: "Oman", region: "Middle East", status: "soon" },
  { name: "Jordan", region: "Middle East", status: "soon" },
  { name: "Israel", region: "Middle East", status: "soon" },

  // Europe
  { name: "France", region: "Europe", status: "soon" },
  { name: "Italy", region: "Europe", status: "soon" },
  { name: "Spain", region: "Europe", status: "soon" },
  { name: "Greece", region: "Europe", status: "soon" },
  { name: "Switzerland", region: "Europe", status: "soon" },
  { name: "United Kingdom", region: "Europe", status: "soon" },
  { name: "Turkey", region: "Europe", status: "soon" },
  { name: "Georgia", region: "Europe", status: "soon" },
  { name: "Azerbaijan", region: "Europe", status: "soon" },

  // Africa
  { name: "Egypt", region: "Africa", status: "soon" },
  { name: "Kenya", region: "Africa", status: "soon" },
  { name: "South Africa", region: "Africa", status: "soon" },
  { name: "Morocco", region: "Africa", status: "soon" },

  // Americas & Oceania
  { name: "USA", region: "Americas", status: "soon" },
  { name: "Australia", region: "Oceania", status: "soon" },
  { name: "New Zealand", region: "Oceania", status: "soon" },
];

export const REGIONS = Array.from(new Set(DESTINATIONS.map((d) => d.region)));

const BY_NAME = new Map(DESTINATIONS.map((d) => [d.name.toLowerCase(), d]));

export function destinationByName(name: string): Destination | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

export const LIVE_DESTINATIONS = DESTINATIONS.filter((d) => d.status === "live");

export function searchDestinations(query: string): Destination[] {
  const q = query.trim().toLowerCase();
  if (!q) return DESTINATIONS;
  return DESTINATIONS.filter(
    (d) => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q)
  );
}
