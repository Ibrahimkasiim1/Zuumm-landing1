/* Source and download every guide photo.
 *
 * For each image slot in every guide JSON (plus the hub entries defined
 * here), resolve a real photograph and save it under public/guides/:
 *
 *   1. agent-verified Unsplash CDN candidates (free license, no watermark)
 *   2. the Wikipedia article's lead image for the query's entity
 *   3. top Wikimedia Commons search hit, largest first
 *
 * Every download is verified (HTTP 200, image/*, sane byte size) and
 * recorded in public/guides/CREDITS.json with its source, so licensing
 * stays auditable. Existing files are skipped — safe to re-run; pass
 * --only=<slug> to restrict, --force to redownload.
 */
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = path.join(ROOT, "src/lib/guides/data");
const OUT = path.join(ROOT, "public/guides");
const UA = "ZuummGuides/1.0 (travel guide image sourcing; contact@zuumm.ai)";

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const force = process.argv.includes("--force");

/* hub images live outside the guide JSONs */
const HUB_SLOTS = [
  { file: "hubs/europe.jpg", query: "Eiffel Tower Paris", hero: true },
  { file: "hubs/africa.jpg", query: "masai mara elephants savanna", hero: true },
  { file: "hubs/south-america.jpg", query: "machu picchu peru", hero: true },
  { file: "hubs/south-america-t1.jpg", query: "machu picchu peru citadel" },
  { file: "hubs/south-america-t2.jpg", query: "rio de janeiro christ redeemer" },
  { file: "hubs/south-america-t3.jpg", query: "perito moreno glacier argentina" },
  { file: "hubs/south-america-t4.jpg", query: "cartagena colombia old town" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* cartography, heraldry and chrome are never destination photography */
const NOT_A_PHOTO = /map|locator|location|position|flag|coat[_ ]of[_ ]arms|\bcoa\b|logo|seal|emblem|banner|diagram|chart|plan[_ ]of|\.svg|montage|collage|panorama[_ ]label|engraving|etching|lithograph|woodcut|sketch|painting|tapestry|poster|\bcoin|medal|stamp[_ ]of|banknote|currency|manuscript|codex|satellite|landsat|sentinel-|portrait[_ ]of|molecule|specimen|amazing[_ ]race|screenshot|\bcover\b/i;
const looksLikePhoto = (url) => !NOT_A_PHOTO.test(decodeURIComponent(url));

/* one image, one slot — a repeated Wikipedia lead across four queries is
   how a page ends up with the same photo on every card */
const used = new Set();
const normUrl = (u) => (u || "").replace(/\/\d+px-/, "/px-").split("?")[0];
const isUsed = (r) => used.has(normUrl(r.url)) || (r.credit && used.has(r.credit));
const markUsed = (r) => { used.add(normUrl(r.url)); if (r.credit) used.add(r.credit); };

async function politeFetch(url, opts = {}, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { ...opts, headers: { "User-Agent": UA, ...(opts.headers || {}) } });
    if (res.status !== 429) return res;
    await sleep(4000 * (i + 1) + Math.random() * 2000);
  }
  return fetch(url, { ...opts, headers: { "User-Agent": UA, ...(opts.headers || {}) } });
}

async function head(url) {
  try {
    const res = await fetch(url, { method: "GET", headers: { "User-Agent": UA, Range: "bytes=0-0" } });
    const type = res.headers.get("content-type") || "";
    return { ok: res.ok, type };
  } catch { return { ok: false, type: "" }; }
}

async function download(url, dest) {
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/")) throw new Error(`not image: ${type}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25000) throw new Error(`too small: ${buf.length}b`);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return buf.length;
}

async function fromCandidates(slot) {
  for (const raw of slot.candidates || []) {
    const base = raw.split("?")[0];
    if (!/^https:\/\/images\.unsplash\.com\/photo-/.test(base)) continue;
    const url = `${base}?w=${slot.hero ? 2200 : 1400}&q=78&auto=format&fit=crop`;
    const h = await head(url);
    if (h.ok && h.type.startsWith("image/")) return { url, source: "unsplash", credit: base };
  }
  return null;
}

async function wikipediaLead(query) {
  try {
    const s = await politeFetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json`
    ).then((r) => r.json());
    const title = s?.query?.search?.[0]?.title;
    if (!title) return null;
    const credit = `en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

    /* the article's media, in article order — the first real photograph
       beats the lead image, which for places is often a locator map */
    const media = await politeFetch(
      `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`
    ).then((r) => r.json()).catch(() => null);
    for (const item of (media?.items || []).slice(0, 12)) {
      if (item.type !== "image") continue;
      const t = item.title || "";
      if (!/\.(jpe?g|png)$/i.test(t) || !looksLikePhoto(t)) continue;
      const src = item.srcset?.[item.srcset.length - 1]?.src || item.srcset?.[0]?.src;
      if (!src) continue;
      const base = "https:" + src.replace(/^https?:/, "");
      /* ask for wide renditions, falling back — Commons 400s when the
         requested thumb width exceeds the original */
      for (const w of [1600, 1200, 800]) {
        const url = base.replace(/\/(\d+)px-/, `/${w}px-`);
        const h = await head(url);
        if (h.ok && h.type.startsWith("image/")) return { url, source: "wikipedia", credit };
      }
      const h = await head(base);
      if (h.ok && h.type.startsWith("image/")) return { url: base, source: "wikipedia", credit };
      continue;
    }

    const sum = await politeFetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    ).then((r) => r.json());
    const img = sum?.originalimage?.source;
    if (!img || !looksLikePhoto(img) || (sum?.originalimage?.width ?? 0) < 900) return null;
    return { url: img, source: "wikipedia", credit };
  } catch { return null; }
}

async function commonsSearch(query) {
  try {
    const d = await politeFetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600&format=json`
    ).then((r) => r.json());
    const pages = Object.values(d?.query?.pages || {});
    const good = pages
      .map((p) => p.imageinfo?.[0])
      .filter((i) => i && i.mime?.startsWith("image/") && i.mime !== "image/svg+xml" && i.width >= 1100 && i.width > i.height * 0.6 && looksLikePhoto(i.url || ""))
      .sort((a, b) => b.width - a.width);
    if (!good.length) return null;
    return { url: good[0].thumburl || good[0].url, source: "commons", credit: good[0].descriptionurl || good[0].url };
  } catch { return null; }
}

let openverseBudget = 150; // anon cap is 200/day — keep headroom
async function openverse(query) {
  if (openverseBudget <= 0) return null;
  openverseBudget--;
  try {
    const d = await politeFetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&page_size=8&aspect_ratio=wide`
    ).then((r) => r.json());
    const hit = (d?.results || []).find((x) => (x.width ?? 0) >= 1000 && /\.(jpe?g|png)($|\?)/i.test(x.url));
    if (!hit) return null;
    return { url: hit.url, source: `openverse:${hit.license}`, credit: hit.foreign_landing_url || hit.url };
  } catch { return null; }
}

async function resolveSlot(slot) {
  const fresh = (r) => (r && !isUsed(r) ? r : null);
  const viaCand = fresh(await fromCandidates(slot));
  if (viaCand) return viaCand;
  const viaWiki = fresh(await wikipediaLead(slot.query));
  if (viaWiki) return viaWiki;
  const viaCommons = fresh(await commonsSearch(slot.query));
  if (viaCommons) return viaCommons;
  const viaOpenverse = fresh(await openverse(slot.query));
  if (viaOpenverse) return viaOpenverse;
  /* last try: drop the last word (often a location qualifier) */
  const words = slot.query.split(" ");
  if (words.length > 2) {
    const shorter = words.slice(0, -1).join(" ");
    return fresh(await wikipediaLead(shorter)) || fresh(await commonsSearch(shorter)) || fresh(await openverse(shorter));
  }
  return null;
}

/* collect every slot */
async function collectSlots() {
  const slots = [];
  const files = (await readdir(DATA)).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const slug = f.replace(/\.json$/, "");
    if (only && only !== slug && only !== "hubs") continue;
    const g = JSON.parse(await readFile(path.join(DATA, f), "utf8"));
    const push = (id, image, hero = false) =>
      slots.push({ file: `${slug}/${id}.jpg`, query: image.query, candidates: image.candidates, hero });
    push("hero", g.heroImage, true);
    for (const c of g.cities || []) push(c.id, c.image);
    for (const h of g.highlights || []) push(h.id, h.image);
    for (const a of g.activities || []) push(a.id, a.image);
    for (const t of g.trips || []) push(t.id, t.image);
  }
  if (!only || only === "hubs") slots.push(...HUB_SLOTS);
  return slots;
}

const slots = await collectSlots();
const credits = existsSync(path.join(OUT, "CREDITS.json"))
  ? JSON.parse(await readFile(path.join(OUT, "CREDITS.json"), "utf8"))
  : {};

for (const c of Object.values(credits)) { if (c.credit) used.add(c.credit); }

let done = 0, skipped = 0, failed = [];
const queue = [...slots];
async function worker() {
  for (;;) {
    const slot = queue.shift();
    if (!slot) return;
    const dest = path.join(OUT, slot.file);
    if (!force && existsSync(dest) && (await stat(dest)).size > 25000) { skipped++; continue; }
    try {
      const r = await resolveSlot(slot);
      if (!r) throw new Error("no source found");
      const bytes = await download(r.url, dest);
      markUsed(r);
      credits[slot.file] = { source: r.source, credit: r.credit, query: slot.query };
      done++;
      console.log(`ok   ${slot.file}  [${r.source}] ${(bytes / 1024) | 0}KB`);
    } catch (e) {
      failed.push({ file: slot.file, query: slot.query, err: String(e.message || e) });
      console.log(`FAIL ${slot.file}  (${slot.query}) — ${e.message || e}`);
    }
    await sleep(800);
  }
}
await Promise.all(Array.from({ length: 1 }, worker));

await writeFile(path.join(OUT, "CREDITS.json"), JSON.stringify(credits, null, 2));
console.log(`\n${done} downloaded · ${skipped} already present · ${failed.length} failed of ${slots.length}`);
if (failed.length) {
  await writeFile(path.join(OUT, "FAILURES.json"), JSON.stringify(failed, null, 2));
  console.log("failures written to public/guides/FAILURES.json");
}
