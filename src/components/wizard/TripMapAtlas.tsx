"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TripPlan } from "@/lib/planner/engine";
import { CITIES, DEFAULT_COUNTRY, gatewayOrderFor } from "@/lib/planner/data";
import { cityGeo } from "@/lib/planner/geo";
import CityPhoto from "@/components/plan/CityPhoto";
import { Bed, Send, Ticket } from "@/components/plan/icons";

/* The trip as a page from an atlas.

   A soft paper map, flat and north-up, with the real trip drawn on it:

     · circular photo markers — one per stop, in visit order, sized by
       nights, each carrying its city's photograph and a mono nights chip
     · the arrival stop ringed in mint with a pin tail — where the trip
       touches ground
     · dashed arcs stop to stop, a small arrow on each showing direction
     · day-trip towns as labeled mini-dots on a dashed gold thread
     · a dashed arrival sweep in from the west, named for the real
       departure city
     · the rest of the country's gateways as faint, truthful labels, and
       the real neighbours (seas and countries) as ambient type

   Nothing here is decoration pretending to be data: every pin sits at
   its city's real latitude and longitude (lib/planner/geo), projected
   north-up into kilometre space, so bearings between stops and the
   distances the chips and scale bar quote are genuinely geographic. The
   route order is the plan's order. Cities the geo table doesn't know yet
   fall back to the dataset's stylized positions. */

/* equirectangular projection constants: km per degree at the equator */
const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LNG = 111.32;

/* km per map unit for the stylized-coordinate fallback, calibrated on a
   known city pair per priced country */
function kmPerUnit(country: string): number {
  const cal =
    country === "Bali"
      ? { a: "Kuta", b: "Ubud", km: 20 }
      : { a: "Bangkok", b: "Chiang Mai", km: 580 };
  const A = CITIES[cal.a];
  const B = CITIES[cal.b];
  if (!A || !B) return 8;
  const d = Math.hypot(A.x - B.x, A.y - B.y);
  return d ? cal.km / d : 8;
}

/* The real neighbourhood, per priced country, at its real coordinates.
   Geography, not garnish: Myanmar is west of Thailand, Laos northeast,
   the Andaman southwest — and Bali sits between the Bali Sea and the
   Indian Ocean, Java west, Lombok east. Labels that fall outside the
   fitted view simply don't render. Extend this table when a country
   goes live. */
const AMBIENT: Record<string, { label: string; lat: number; lng: number }[]> = {
  Thailand: [
    { label: "Myanmar", lat: 17.2, lng: 96.9 },
    { label: "Laos", lat: 18.6, lng: 103.6 },
    { label: "Cambodia", lat: 12.9, lng: 104.6 },
    { label: "Gulf of Thailand", lat: 10.8, lng: 101.0 },
    { label: "Andaman Sea", lat: 9.3, lng: 96.9 },
    { label: "Malaysia", lat: 5.6, lng: 101.4 },
  ],
  Bali: [
    { label: "Bali Sea", lat: -8.05, lng: 115.25 },
    { label: "Java", lat: -8.3, lng: 114.55 },
    { label: "Indian Ocean", lat: -8.95, lng: 115.2 },
    { label: "Lombok", lat: -8.5, lng: 116.15 },
  ],
};

/* quadratic bezier point + tangent, for arrows that sit on the arc */
type Pt = { x: number; y: number };
function qPoint(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}
function qAngle(a: Pt, c: Pt, b: Pt, t: number): number {
  const u = 1 - t;
  const dx = 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x);
  const dy = 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/* one dashed leg with a direction arrow, bowed perpendicular to its chord */
function legGeometry(a: Pt, b: Pt, side: 1 | -1) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const bow = Math.min(56, len * 0.28) * side;
  const nx = -(b.y - a.y) / len;
  const ny = (b.x - a.x) / len;
  const c = { x: (a.x + b.x) / 2 + nx * bow, y: (a.y + b.y) / 2 + ny * bow };
  return { c, d: `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}` };
}

const Arrow = ({ p, angle, tone = "var(--ink-3)" }: { p: Pt; angle: number; tone?: string }) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${angle})`}>
    <path d="M -4.5 -4 L 4.5 0 L -4.5 4" fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export default function TripMapAtlas({
  plan,
  origin,
  compact = false,
}: {
  plan: TripPlan;
  origin?: string;
  /** rail-width rendering: shorter, smaller markers, less chrome */
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const stops = plan.stops;
  const country = stops[0]?.city.country ?? DEFAULT_COUNTRY;

  /* real geography wherever the geo table covers the whole route; the
     stylized dataset positions only as a last resort, and never mixed —
     one coordinate space per render, so relative positions stay honest */
  const useGeo = stops.every(
    (s) => cityGeo(s.city.name) && s.dayTrips.every((l) => cityGeo(l.city.name))
  );
  const refLat =
    useGeo && stops.length
      ? stops.reduce((sum, s) => sum + (cityGeo(s.city.name)?.lat ?? 0), 0) /
        stops.length
      : 0;
  const cosRef = Math.cos((refLat * Math.PI) / 180) || 1;
  /* north-up km space: x east in km, y south in km (screen-down) */
  const unitOf = (name: string, sx: number, sy: number): Pt => {
    const g = useGeo ? cityGeo(name) : null;
    return g
      ? { x: g.lng * KM_PER_DEG_LNG * cosRef, y: -g.lat * KM_PER_DEG_LAT }
      : { x: sx, y: sy };
  };
  const kmU = useGeo ? 1 : kmPerUnit(country);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 1100, h: 520 });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const set = () =>
      setDims({ w: Math.max(320, el.clientWidth), h: Math.max(300, el.clientHeight) });
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* day-trip towns, tied to their base stop — carrying the count of what
     is actually booked out there */
  const dayTrips: { unit: Pt; name: string; hubUnit: Pt; count: number }[] = [];
  for (const stop of stops) {
    for (const leg of stop.dayTrips) {
      dayTrips.push({
        unit: unitOf(leg.city.name, leg.city.x, leg.city.y),
        name: leg.city.name,
        hubUnit: unitOf(stop.city.name, stop.city.x, stop.city.y),
        count: leg.activities.length,
      });
    }
  }

  const stopUnits = stops.map((s) => unitOf(s.city.name, s.city.x, s.city.y));

  /* ---- fit: uniform scale, route centred, room for labels ---- */
  const fitPts = [...stopUnits, ...dayTrips.map((d) => d.unit)];
  const xs = fitPts.map((p) => p.x);
  const ys = fitPts.map((p) => p.y);
  const cx = fitPts.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 50;
  const cy = fitPts.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : 50;
  /* never zoom past a sensible neighbourhood, never crop the route */
  const spanX = Math.max(fitPts.length ? Math.max(...xs) - Math.min(...xs) : 60, 34);
  const spanY = Math.max(fitPts.length ? Math.max(...ys) - Math.min(...ys) : 60, 34);
  const pad = compact ? { x: 90, y: 150 } : { x: 170, y: 250 };
  const scale = Math.min((dims.w - pad.x) / spanX, (dims.h - pad.y) / spanY);
  /* nudged up: the southernmost stop needs room for its ring, chip and name */
  const toPx = (p: Pt): Pt => ({
    x: (p.x - cx) * scale + dims.w / 2,
    y: (p.y - cy) * scale + dims.h / 2 - 20,
  });
  const inPanel = (p: Pt, m = 30) =>
    p.x > m && p.x < dims.w - m && p.y > m && p.y < dims.h - m;
  /* the scale bar and legend own the bottom corners — no type under them */
  const clearOfChrome = (p: Pt) =>
    !(p.y > dims.h - 76 && (p.x > dims.w - 280 || p.x < 300));

  const stopPx = stopUnits.map((u) => toPx(u));

  /* marker size: nights buy area, arrival stop slightly larger */
  const maxN = Math.max(...stops.map((s) => s.nights), 1);
  const base = compact ? 34 : 54;
  const spread = compact ? 12 : 18;
  const sizeFor = (nights: number, i: number) =>
    Math.round(base + (nights / maxN) * spread + (i === 0 ? (compact ? 4 : 6) : 0));

  /* route legs, alternating bow sides so the line wanders like a journey */
  const legs = stops.slice(0, -1).map((_s, i) => {
    const g = legGeometry(stopPx[i], stopPx[i + 1], (i % 2 === 0 ? 1 : -1) as 1 | -1);
    const km =
      Math.hypot(
        stopUnits[i + 1].x - stopUnits[i].x,
        stopUnits[i + 1].y - stopUnits[i].y
      ) * kmU;
    return { ...g, a: stopPx[i], b: stopPx[i + 1], km };
  });

  /* arrival sweep: in from the west (home is west of every priced country) */
  const arrive = stopPx[0]
    ? legGeometry({ x: -30, y: Math.max(60, stopPx[0].y - 120) }, stopPx[0], -1)
    : null;

  /* faint truthful context: the country's other gateways, off-route */
  const routeNames = new Set([
    ...stops.map((s) => s.city.name),
    ...dayTrips.map((d) => d.name),
  ]);
  const ghosts = gatewayOrderFor(country)
    .filter((n) => !routeNames.has(n) && CITIES[n] && (!useGeo || cityGeo(n)))
    .map((n) => ({ name: n, p: toPx(unitOf(n, CITIES[n].x, CITIES[n].y)) }))
    .filter((g) => inPanel(g.p, 44) && clearOfChrome(g.p))
    .filter((g) => stopPx.every((sp) => Math.hypot(sp.x - g.p.x, sp.y - g.p.y) > 70))
    .slice(0, 5);

  /* ambient labels live at real coordinates, so they only make sense in
     the geographic projection — the stylized fallback goes without them */
  const ambient = useGeo
    ? (AMBIENT[country] ?? [])
        .map((a) => ({
          ...a,
          p: toPx({
            x: a.lng * KM_PER_DEG_LNG * cosRef,
            y: -a.lat * KM_PER_DEG_LAT,
          }),
        }))
        .filter((a) => inPanel(a.p, 10) && clearOfChrome(a.p))
    : [];

  /* honest scale bar: the drawn bar's own width, converted to km via the
     calibration — the number has to describe the line actually on screen */
  const barPx = compact ? 52 : 100;
  const kmPerPx = kmU / scale;
  const scaleKmRaw = kmPerPx * barPx;
  const scaleKm =
    scaleKmRaw >= 100 ? Math.round(scaleKmRaw / 50) * 50 : Math.max(5, Math.round(scaleKmRaw / 5) * 5);

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true as const },
          transition: { duration: 0.6, delay, ease: [0.21, 0.6, 0.35, 1] as const },
        };

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-hidden ${
        compact ? "h-[330px]" : "h-[460px] md:h-[560px]"
      }`}
      role="img"
      aria-label={`Map of your route: ${stops.map((s) => `${s.city.name} (${s.nights} night${s.nights > 1 ? "s" : ""})`).join(", then ")}.`}
    >
      {/* ---- paper ground: faint graticule and soft washes ---- */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(75%_90%_at_28%_18%,rgba(14,116,144,0.05),transparent_65%),radial-gradient(60%_80%_at_82%_85%,rgba(255,174,26,0.06),transparent_65%)]"
      />
      <svg aria-hidden className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="atlas-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M 72 0 L 0 0 0 72" fill="none" stroke="var(--line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#atlas-grid)" opacity="0.45" />

        {/* ---- ambient geography: the real neighbours ---- */}
        {ambient.map((a) => (
          <text
            key={a.label}
            x={a.p.x}
            y={a.p.y}
            textAnchor="middle"
            className="fill-ink-3 font-mono text-[11px] font-semibold uppercase"
            style={{ letterSpacing: "0.3em", opacity: 0.4 }}
          >
            {a.label}
          </text>
        ))}

        {/* ---- the rest of the country, faint but real ---- */}
        {ghosts.map((g) => (
          <g key={g.name} opacity="0.5">
            <circle cx={g.p.x} cy={g.p.y} r="3" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" />
            <text
              x={g.p.x}
              y={g.p.y - 9}
              textAnchor="middle"
              className="fill-ink-3 font-mono text-[10px] font-semibold uppercase"
              style={{ letterSpacing: "0.14em" }}
            >
              {g.name}
            </text>
          </g>
        ))}

        {/* ---- arrival sweep, from home ---- */}
        {arrive && (
          <motion.g {...fade(0.15)}>
            <path
              d={arrive.d}
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth="2"
              strokeDasharray="2 8"
              strokeLinecap="round"
              opacity="0.7"
            />
            <Arrow
              p={qPoint({ x: -30, y: Math.max(60, stopPx[0].y - 120) }, arrive.c, stopPx[0], 0.82)}
              angle={qAngle({ x: -30, y: Math.max(60, stopPx[0].y - 120) }, arrive.c, stopPx[0], 0.82)}
            />
          </motion.g>
        )}

        {/* ---- day-trip threads and mini-pins ---- */}
        {dayTrips.map((d) => {
          const p = toPx(d.unit);
          const hub = toPx(d.hubUnit);
          return (
            <motion.g key={`${d.name}`} {...fade(0.45)}>
              <path
                d={`M ${hub.x} ${hub.y} L ${p.x} ${p.y}`}
                stroke="var(--sun)"
                strokeWidth="1.5"
                strokeDasharray="1 6"
                strokeLinecap="round"
                opacity="0.8"
              />
              <circle cx={p.x} cy={p.y} r="8" fill="white" stroke="var(--line)" strokeWidth="1.5" />
              <circle cx={p.x} cy={p.y} r="3" fill="var(--sun)" />
              <text
                x={p.x}
                y={p.y + 22}
                textAnchor="middle"
                className="fill-ink-2 text-[11px] font-semibold"
                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}
              >
                {d.name}
                {d.count > 0 && ` · ${d.count}`}
              </text>
            </motion.g>
          );
        })}

        {/* ---- the route: dashed arcs with direction arrows ---- */}
        {legs.map((l, i) => {
          const mid = qPoint(l.a, l.c, l.b, 0.5);
          const ang = qAngle(l.a, l.c, l.b, 0.5);
          /* the km label rides the outside of the bow, clear of city names */
          const chord = Math.hypot(l.b.x - l.a.x, l.b.y - l.a.y) || 1;
          const outX = ((l.c.x - (l.a.x + l.b.x) / 2) / chord) * 46;
          const outY = ((l.c.y - (l.a.y + l.b.y) / 2) / chord) * 46;
          return (
            <motion.g key={i} {...fade(0.25 + i * 0.12)}>
              <path
                d={l.d}
                fill="none"
                stroke="var(--ink-2)"
                strokeWidth="2"
                strokeDasharray="3 8"
                strokeLinecap="round"
                opacity="0.85"
              />
              <Arrow p={mid} angle={ang} tone="var(--ink-2)" />
              <text
                x={mid.x + outX}
                y={mid.y + outY + 3}
                textAnchor="middle"
                className="fill-ink-3 font-mono text-[10px] font-semibold"
                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}
              >
                ~{l.km >= 100 ? Math.round(l.km / 25) * 25 : Math.max(5, Math.round(l.km / 5) * 5)} km
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* ---- "from home" chip on the arrival sweep ---- */}
      {arrive && origin && (
        <motion.div
          {...fade(0.2)}
          className="absolute flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-white backdrop-blur"
          style={{
            left: Math.max(10, qPoint({ x: -30, y: Math.max(60, stopPx[0].y - 120) }, arrive.c, stopPx[0], 0.35).x),
            top: qPoint({ x: -30, y: Math.max(60, stopPx[0].y - 120) }, arrive.c, stopPx[0], 0.35).y - 14,
          }}
        >
          <Send size={11} /> from {origin}
        </motion.div>
      )}

      {/* ---- the stops: photo markers in visit order ---- */}
      {stops.map((stop, i) => {
        const p = stopPx[i];
        const size = sizeFor(stop.nights, i);
        const first = i === 0;
        return (
          <motion.div
            key={stop.city.name}
            className="absolute"
            style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.6 },
                  whileInView: { opacity: 1, scale: 1 },
                  viewport: { once: true as const },
                  transition: {
                    delay: 0.2 + i * 0.14,
                    type: "spring" as const,
                    stiffness: 260,
                    damping: 22,
                  },
                })}
          >
            {/* pin tail under the arrival marker */}
            {first && (
              <span
                aria-hidden
                className="absolute left-1/2 top-full -mt-1.5 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-mint"
              />
            )}
            <span
              className={`relative block overflow-hidden rounded-full bg-white shadow-[0_14px_36px_-14px_rgba(22,18,31,0.4)] ${
                first ? "ring-4 ring-mint" : "ring-[3px] ring-white"
              }`}
              style={{ width: size, height: size }}
            >
              <CityPhoto
                query={`${stop.city.name} ${country} ${stop.city.theme}`}
                theme={stop.city.theme}
                alt=""
                className="h-full w-full"
              />
            </span>
            {/* visit order */}
            <span
              aria-hidden
              className="absolute -left-1 -top-1 flex h-[19px] w-[19px] items-center justify-center rounded-full bg-coral font-mono text-[0.62rem] font-bold text-white shadow"
            >
              {i + 1}
            </span>
            {/* what actually sits at this point: the nights, the hotel, and
                the experiences booked in this city. The dataset places
                activities by city, not by street address, so this counts
                them at their city rather than inventing pins around it. */}
            <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-line bg-white px-1.5 py-px font-mono text-[0.6rem] font-bold text-ink shadow-sm">
              {stop.nights}N
              <span aria-hidden className="text-ink-3">
                ·
              </span>
              <Bed size={9} className="text-ink-3" aria-hidden />
              {stop.activities.length > 0 && (
                <>
                  <Ticket size={9} className="text-coral" aria-hidden />
                  {stop.activities.length}
                </>
              )}
            </span>
            <span
              className="absolute left-1/2 top-full mt-3.5 -translate-x-1/2 whitespace-nowrap text-[0.8rem] font-bold text-ink"
              style={{ textShadow: "0 1px 0 white, 0 0 6px white" }}
            >
              {stop.city.name}
            </span>
          </motion.div>
        );
      })}

      {/* ---- scale + north, both real ---- */}
      <div
        aria-hidden
        className={`absolute font-mono text-[0.62rem] font-semibold uppercase tracking-widest text-ink-3 ${
          compact
            ? "bottom-2.5 right-3 flex items-center"
            : "bottom-4 right-5 flex items-center gap-4"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="block h-px bg-ink-3/60"
            style={{ width: barPx, boxShadow: "0 -2px 0 -1px transparent" }}
          />
          ~{scaleKm} km
        </span>
        {!compact && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white">
            N
          </span>
        )}
      </div>
    </div>
  );
}
