import type { RegionKey, RegionHub } from "./types";

/* Region groupings for the nav dropdown and the destinations index, in
   display order, plus the three hub pages (Europe, Africa, South America)
   the header's continent entries land on. */

export const REGIONS: { key: RegionKey; label: string }[] = [
  { key: "southeast-asia", label: "Southeast Asia" },
  { key: "east-asia", label: "East Asia" },
  { key: "south-asia", label: "South Asia" },
  { key: "middle-east", label: "Middle East & Caucasus" },
  { key: "africa", label: "Africa & Indian Ocean" },
  { key: "europe", label: "Europe" },
  { key: "oceania", label: "Oceania" },
  { key: "americas", label: "Americas" },
];

export const HUBS: RegionHub[] = [
  {
    slug: "europe",
    name: "Europe",
    tagline: "Old cities, alpine rail, café mornings.",
    overview:
      "Europe rewards the traveller who picks a thread and follows it: a first Paris, a Swiss rail loop under the peaks, Helsinki's design calm, or Istanbul standing with one foot on the continent's edge. Distances are short, trains do the work, and a single Schengen visa opens most doors — so two or three countries in ten days is comfortable rather than heroic.",
    heroImage: {
      query: "paris rooftops eiffel tower dusk",
      alt: "Paris rooftops with the Eiffel Tower at dusk",
    },
    members: ["france", "switzerland", "finland", "turkey", "russia"],
  },
  {
    slug: "africa",
    name: "Africa",
    tagline: "Safari dawns, desert temples, island lagoons.",
    overview:
      "Africa on this shelf runs from the Masai Mara's migration mornings to Cairo's five-millennia skyline, Cape Town's mountain-and-sea city life, and the Indian Ocean idylls of Mauritius and the Seychelles. These are five very different trips sharing one habit: they reward planning around seasons — river crossings, whale months, cyclone windows — more than anywhere else we plan.",
    heroImage: {
      query: "masai mara safari elephants sunrise",
      alt: "Elephants crossing the savannah at sunrise",
    },
    members: ["kenya", "south-africa", "egypt", "mauritius", "seychelles"],
  },
  {
    slug: "south-america",
    name: "South America",
    tagline: "Andes trails, tango nights, jungle rivers.",
    overview:
      "South America is the long-haul that earns its flight time: Machu Picchu above the clouds, Rio's beaches under Christ's outstretched arms, Patagonia's granite storms, Iguazú thundering between two countries. We don't run set itineraries here yet — these trips are built one conversation at a time with the AI planner and priced by our experts.",
    heroImage: {
      query: "machu picchu sunrise peru",
      alt: "Machu Picchu emerging from morning cloud",
    },
    members: [],
    teasers: [
      { name: "Peru", blurb: "Machu Picchu, the Sacred Valley and Cusco's Inca-Spanish streets — the continent's greatest hits in one country.", image: { query: "machu picchu peru", alt: "Machu Picchu citadel and Huayna Picchu" } },
      { name: "Brazil", blurb: "Rio's beaches and big-statue skyline, Iguazú's 275 falls, and the Amazon beginning at the airport's edge.", image: { query: "rio de janeiro christ redeemer", alt: "Rio de Janeiro from Corcovado" } },
      { name: "Argentina", blurb: "Steak and Malbec in Buenos Aires, Patagonia's glaciers, and tango spilling out of San Telmo's doorways.", image: { query: "perito moreno glacier argentina", alt: "The Perito Moreno glacier front" } },
      { name: "Colombia", blurb: "Cartagena's walled old town, coffee-country haciendas and a Caribbean coast that parties till sunrise.", image: { query: "cartagena colombia old town", alt: "Colourful balconied streets of Cartagena" } },
    ],
  },
];

export function hubBySlug(slug: string): RegionHub | undefined {
  return HUBS.find((h) => h.slug === slug);
}
