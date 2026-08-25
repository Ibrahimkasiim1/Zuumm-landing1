import type { DestinationGuide, RegionKey } from "./types";
import g_australia from "./data/australia.json";
import g_azerbaijan from "./data/azerbaijan.json";
import g_bali from "./data/bali.json";
import g_china from "./data/china.json";
import g_egypt from "./data/egypt.json";
import g_finland from "./data/finland.json";
import g_france from "./data/france.json";
import g_hong_kong from "./data/hong-kong.json";
import g_japan from "./data/japan.json";
import g_kenya from "./data/kenya.json";
import g_malaysia from "./data/malaysia.json";
import g_maldives from "./data/maldives.json";
import g_mauritius from "./data/mauritius.json";
import g_nepal from "./data/nepal.json";
import g_new_zealand from "./data/new-zealand.json";
import g_philippines from "./data/philippines.json";
import g_russia from "./data/russia.json";
import g_saudi_arabia from "./data/saudi-arabia.json";
import g_seychelles from "./data/seychelles.json";
import g_singapore from "./data/singapore.json";
import g_south_africa from "./data/south-africa.json";
import g_sri_lanka from "./data/sri-lanka.json";
import g_switzerland from "./data/switzerland.json";
import g_thailand from "./data/thailand.json";
import g_turkey from "./data/turkey.json";
import g_uae from "./data/uae.json";
import g_usa from "./data/usa.json";
import g_vietnam from "./data/vietnam.json";
import { REGIONS, HUBS, hubBySlug } from "./regions";

/* The guide registry. Every surface — destination pages, the nav dropdown,
   the destinations index, the trip wizard — reads through here.

   data/index-manifest.json lists the guide files to load; it is rewritten
   by scripts/integrate-guides.mjs as authored guides land, and the barrel
   below must import exactly that set (the script regenerates this file's
   GUIDE IMPORTS block). */

/* GUIDE IMPORTS START */
const RAW: unknown[] = [g_australia, g_azerbaijan, g_bali, g_china, g_egypt, g_finland, g_france, g_hong_kong, g_japan, g_kenya, g_malaysia, g_maldives, g_mauritius, g_nepal, g_new_zealand, g_philippines, g_russia, g_saudi_arabia, g_seychelles, g_singapore, g_south_africa, g_sri_lanka, g_switzerland, g_thailand, g_turkey, g_uae, g_usa, g_vietnam];
/* GUIDE IMPORTS END */

export const GUIDES: DestinationGuide[] = (RAW as DestinationGuide[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));

const bySlug = new Map(GUIDES.map((g) => [g.slug, g]));

export function guideBySlug(slug: string): DestinationGuide | undefined {
  return bySlug.get(slug);
}

export function guidesByRegion(): { key: RegionKey; label: string; guides: DestinationGuide[] }[] {
  return REGIONS.map((r) => ({
    ...r,
    guides: GUIDES.filter((g) => g.region === r.key),
  })).filter((r) => r.guides.length > 0);
}

/** image path convention — every guide photo lives under /guides/<slug>/ */
export function guideImage(guideSlug: string, itemId: string): string {
  return `/guides/${guideSlug}/${itemId}.jpg`;
}

export { REGIONS, HUBS, hubBySlug };
export type { DestinationGuide, RegionKey };
