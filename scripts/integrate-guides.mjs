/* Integrate authored guides: validate each against the contract, normalise,
 * write src/lib/guides/data/<slug>.json, and regenerate the registry
 * barrel between the GUIDE IMPORTS markers in src/lib/guides/index.ts.
 *
 * Usage: node scripts/integrate-guides.mjs <workflow-output.json>
 *   (or with no arg: just revalidate data/ and regenerate the barrel)
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = path.join(ROOT, "src/lib/guides/data");
const REGIONS = new Set(["oceania","southeast-asia","east-asia","south-asia","middle-east","africa","europe","americas"]);
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function fail(slug, msg) { throw new Error(`${slug}: ${msg}`); }

function validate(g) {
  const s = g.slug;
  for (const k of ["slug","name","displayName","country","region","flag","tagline","overview","heroAlt"])
    if (typeof g[k] !== "string" || !g[k].trim()) fail(s, `missing ${k}`);
  if (!KEBAB.test(g.slug)) fail(s, "bad slug");
  if (!REGIONS.has(g.region)) fail(s, `bad region ${g.region}`);
  const wc = g.overview.split(/\s+/).length;
  if (wc < 90 || wc > 220) fail(s, `overview ${wc} words`);
  const img = (i, where) => {
    if (!i || typeof i.query !== "string" || typeof i.alt !== "string") fail(s, `bad image at ${where}`);
    if (i.candidates) i.candidates = i.candidates.filter((c) => /^https:\/\/images\.unsplash\.com\/photo-/.test(String(c).split("?")[0]));
  };
  img(g.heroImage, "hero");
  const qf = g.quickFacts;
  if (!qf) fail(s, "quickFacts");
  for (const k of ["capital","timezone","flightFromIndia","plug","sim"]) if (!qf[k]) fail(s, `quickFacts.${k}`);
  if (!qf.currency?.code || !qf.currency?.inr) fail(s, "currency");
  if (!Array.isArray(qf.languages) || !qf.languages.length) fail(s, "languages");
  if (!["visa-free","voa","evisa","sticker"].includes(g.visa?.type)) fail(s, `visa.type ${g.visa?.type}`);
  if (!g.visa.headline || !g.visa.body) fail(s, "visa copy");
  if (g.weather?.seasons?.length !== 3) fail(s, "seasons != 3");
  const tones = g.weather.seasons.map((x) => x.tone).sort().join(",");
  if (tones !== "high,low,shoulder") fail(s, `season tones ${tones}`);
  if (!g.weather.bestTime || !g.weather.summary) fail(s, "weather copy");
  for (const k of ["high","low","note"]) if (!g.booking?.[k]) fail(s, `booking.${k}`);
  if (!g.idealDuration?.nights || !g.idealDuration?.note) fail(s, "idealDuration");
  if (g.budget?.perDay?.length !== 3) fail(s, "budget tiers != 3");
  if (typeof g.safety?.score !== "number" || g.safety.score < 1 || g.safety.score > 5) fail(s, "safety.score");
  if (!Array.isArray(g.safety.tips) || g.safety.tips.length < 4) fail(s, "safety.tips");
  if (!Array.isArray(g.goodToKnow) || g.goodToKnow.length < 6) fail(s, "goodToKnow < 6");
  if (!Array.isArray(g.cities) || g.cities.length < 5 || g.cities.length > 6) fail(s, `cities ${g.cities?.length}`);
  if (!Array.isArray(g.highlights) || g.highlights.length !== 10) fail(s, `highlights ${g.highlights?.length}`);
  if (!Array.isArray(g.activities) || g.activities.length !== 6) fail(s, `activities ${g.activities?.length}`);
  if (!Array.isArray(g.trips) || g.trips.length !== 3) fail(s, `trips ${g.trips?.length}`);
  if (!Array.isArray(g.faqs) || g.faqs.length < 4) fail(s, "faqs < 4");

  const ids = new Set(["hero"]);
  const claim = (id, where) => {
    if (!KEBAB.test(id || "")) fail(s, `bad id at ${where}: ${id}`);
    if (ids.has(id)) fail(s, `duplicate id ${id}`);
    ids.add(id);
  };
  for (const c of g.cities) { if (!c.name || !c.blurb) fail(s, `city ${c.id}`); claim(c.id, "city"); img(c.image, `city.${c.id}`); }
  g.highlights.sort((a, b) => a.rank - b.rank).forEach((h, i) => {
    h.rank = i + 1;
    if (!h.name || !h.blurb || !h.detail || !h.category) fail(s, `highlight ${h.id}`);
    claim(h.id, "highlight"); img(h.image, `highlight.${h.id}`);
  });
  for (const a of g.activities) { if (!a.name || !a.blurb || !a.category) fail(s, `activity ${a.id}`); claim(a.id, "activity"); img(a.image, `activity.${a.id}`); }
  for (const t of g.trips) {
    if (!t.title || !t.summary || !Array.isArray(t.route) || !t.route.length) fail(s, `trip ${t.id}`);
    claim(t.id, "trip"); img(t.image, `trip.${t.id}`);
    t.nights = Number(t.nights) || t.route.reduce((n, l) => n + (Number(l.nights) || 0), 0);
  }
  for (const f of g.faqs) if (!f.q || !f.a) fail(s, "faq entry");
  return g;
}

const arg = process.argv[2];
let written = 0;
const failed = [];
if (arg) {
  const payload = JSON.parse(await readFile(arg, "utf8"));
  const guides = payload.result?.guides || payload.guides || [];
  for (const entry of guides) {
    try {
      const g = validate(entry.guide);
      await writeFile(path.join(DATA, `${g.slug}.json`), JSON.stringify(g, null, 2));
      written++;
      console.log(`ok   ${g.slug}`);
    } catch (e) {
      failed.push({ slug: entry.slug, err: String(e.message || e) });
      console.log(`FAIL ${entry.slug} — ${e.message || e}`);
    }
  }
}

/* revalidate everything on disk + regenerate the barrel */
const files = (await readdir(DATA)).filter((f) => f.endsWith(".json")).sort();
const good = [];
for (const f of files) {
  const slug = f.replace(/\.json$/, "");
  try { validate(JSON.parse(await readFile(path.join(DATA, f), "utf8"))); good.push(slug); }
  catch (e) { console.log(`ON-DISK INVALID ${f}: ${e.message}`); }
}
const ident = (slug) => "g_" + slug.replace(/-/g, "_");
const barrel = good.map((slug) => `import ${ident(slug)} from "./data/${slug}.json";`).join("\n");
const list = `const RAW: unknown[] = [${good.map(ident).join(", ")}];`;

const idxPath = path.join(ROOT, "src/lib/guides/index.ts");
let idx = await readFile(idxPath, "utf8");
idx = idx.replace(/import bali from "\.\/data\/bali\.json";\n/, "");
idx = idx.replace(/(?:import g_[a-z0-9_]+ from "\.\/data\/[a-z0-9-]+\.json";\n)+/g, "");
idx = idx.replace(/\/\* GUIDE IMPORTS START \*\/[\s\S]*?\/\* GUIDE IMPORTS END \*\//,
  `/* GUIDE IMPORTS START */\n${list}\n/* GUIDE IMPORTS END */`);
idx = idx.replace('import type { DestinationGuide, RegionKey } from "./types";',
  `import type { DestinationGuide, RegionKey } from "./types";\n${barrel}`);
await writeFile(idxPath, idx);
console.log(`\n${written} written from payload · ${good.length} guides in registry`);
