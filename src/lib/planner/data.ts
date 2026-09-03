/* The multi-country dataset registry.

   Every consumer that used to import CITIES / GATEWAY_ORDER /
   SATELLITES_BY_GATEWAY straight from thailand-data now reads the merged
   maps from here, so a route can resolve any city regardless of country.
   City names are unique across datasets; a route only ever contains one
   country's cities (the wizard clears the route on a country switch).

   Country-specific sequencing (which gateways exist, which one anchors the
   first trip) goes through the COUNTRIES table — engine.autoRoute reads it
   instead of hardcoding Bangkok. */

import {
  CITIES as THAI_CITIES,
  GATEWAY_ORDER as THAI_GATEWAY_ORDER,
  SATELLITES_BY_GATEWAY as THAI_SATELLITES,
} from "./thailand-data";
import { BALI_CITIES, BALI_GATEWAY_ORDER } from "./bali-data";

export type { City, CityActivity, HotelTier, HotelTierKey } from "./thailand-data";

export interface CountryData {
  /** north→south (or airport-first) visit order of this country's gateways */
  gatewayOrder: string[];
  /** the international gateway that anchors every first trip */
  anchor: string;
}

export const COUNTRIES: Record<string, CountryData> = {
  Thailand: { gatewayOrder: THAI_GATEWAY_ORDER, anchor: "Bangkok" },
  Bali: { gatewayOrder: BALI_GATEWAY_ORDER, anchor: "Kuta" },
};

export const DEFAULT_COUNTRY = "Thailand";

/** All cities across every priced country, by name. */
export const CITIES = { ...THAI_CITIES, ...BALI_CITIES };

/** Merged visit order — used to sequence a route's selected cities. Within a
    country the order is preserved; selections never span countries. */
export const GATEWAY_ORDER: string[] = [
  ...THAI_GATEWAY_ORDER,
  ...BALI_GATEWAY_ORDER,
];

/** Satellite cities per gateway (Bali folds its areas into activities, so it
    contributes none). */
export const SATELLITES_BY_GATEWAY: Record<string, string[]> = {
  ...THAI_SATELLITES,
};

export function countryOfCity(name: string): string {
  return CITIES[name]?.country ?? DEFAULT_COUNTRY;
}

export function gatewayOrderFor(country?: string): string[] {
  return (COUNTRIES[country ?? DEFAULT_COUNTRY] ?? COUNTRIES[DEFAULT_COUNTRY])
    .gatewayOrder;
}

export function anchorFor(country?: string): string {
  return (COUNTRIES[country ?? DEFAULT_COUNTRY] ?? COUNTRIES[DEFAULT_COUNTRY])
    .anchor;
}
