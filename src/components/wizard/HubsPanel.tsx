"use client";

import { useMemo } from "react";
import {
  catalogForCountry,
  catalogForRoute,
  sortRecommended,
  type Attraction,
} from "@/lib/planner/attractions";
import { CITIES } from "@/lib/planner/data";
import { VIBE_THEMES } from "@/lib/planner/engine";
import { VIBES } from "@/lib/planner/options";
import { tryPin, type WizardState } from "@/lib/planner/wizard";
import { IdeaSlideCard } from "./DestinationIdeas";
import { ChevronRight, Sparkle, Ticket } from "@/components/plan/icons";

/* The hubs screen's side panel, "For you" first: a personal shelf of
   moving showcase cards from the route's real catalog, then one shelf per
   picked vibe — "Because you picked street food" — each four cards, two
   up. Every card is the catalog's own data, deduped across shelves;
   tapping one opens the browser on exactly the experience that was
   showing. (The route map lives on the reveal — here the cards get the
   whole panel.) */

type Shelf = {
  key: string;
  title: string | null;
  cards: Attraction[][];
  /** set on a selected city's shelf — earns it the "Experiences around …"
      door in its heading */
  city?: string;
};

/** the engine's vibe keywords, checked against the attraction's own text */
function matchesVibe(a: Attraction, vibe: string): boolean {
  const kws = VIBE_THEMES[vibe] ?? [];
  const hay = `${a.cityTheme} ${a.activity.name} ${a.activity.about}`.toLowerCase();
  return kws.some((k) => hay.includes(k.toLowerCase()));
}

/** four cards, up to two rotating slides each */
function toCards(list: Attraction[]): Attraction[][] {
  const cards: Attraction[][] = [];
  for (let c = 0; c < 4; c++) {
    const g = list.slice(c * 2, c * 2 + 2);
    if (g.length) cards.push(g);
  }
  return cards;
}

export default function HubsPanel({
  state,
  onOpen,
  onBrowseCity,
  onPatch,
}: {
  state: WizardState;
  /** open the panel browser on a tapped showcase experience (desktop) */
  onOpen?: (a: Attraction) => void;
  /** open the full catalogue for one selected city */
  onBrowseCity?: (city: string) => void;
  /** enables the cards' quick-like hearts */
  onPatch?: (p: Partial<WizardState>) => void;
}) {
  /* the heart runs the same guard as the browser's like button; a pick
     the trip can't absorb opens the browser instead, where the refusal
     and its one-tap fix can be shown properly */
  const toggleLike = onPatch
    ? (a: Attraction) => {
        if (state.pinned.includes(a.key)) {
          onPatch({ pinned: state.pinned.filter((k) => k !== a.key) });
          return;
        }
        if (tryPin(state, a).ok) {
          onPatch({
            pinned: [...state.pinned, a.key],
            removed: state.removed.filter((k) => k !== a.key),
          });
        } else {
          onOpen?.(a);
        }
      }
    : undefined;

  /* shelves are built from what the traveller has actually selected: with
     no cities picked yet, the whole country ("For You" + vibes); each
     selected city then earns its own "Experiences in …" shelf */
  const selectedHubs = useMemo(
    () => state.cities.filter((c) => CITIES[c] && !CITIES[c].gateway),
    [state.cities]
  );
  const shelves = useMemo<Shelf[]>(() => {
    const base = selectedHubs.length
      ? catalogForRoute(state.cities)
      : catalogForCountry(state.country);
    const ranked = sortRecommended(base, state.vibes, state.cities);
    const used = new Set<string>();
    const take = (list: Attraction[], n: number) => {
      const out = list.filter((a) => !used.has(a.id)).slice(0, n);
      for (const a of out) used.add(a.id);
      return out;
    };
    /* the cities the traveller actually picked lead the panel — their own
       section, their own door into the full catalogue — and the broader
       suggestions follow underneath */
    const out: Shelf[] = [];
    for (const hub of selectedHubs) {
      const cards = toCards(
        take(sortRecommended(catalogForRoute([hub]), state.vibes, [hub]), 8)
      );
      if (cards.length) {
        out.push({ key: `city-${hub}`, title: hub, city: hub, cards });
      }
    }
    out.push({
      key: "for-you",
      title: selectedHubs.length ? "More on your route" : "For you",
      cards: toCards(take(ranked, 8)),
    });
    for (const v of state.vibes) {
      const meta = VIBES.find((o) => o.key === v);
      const cards = toCards(take(ranked.filter((a) => matchesVibe(a, v)), 8));
      if (cards.length) {
        out.push({
          key: v,
          title: `Because you picked ${(meta?.label ?? v).toLowerCase()}`,
          cards,
        });
      }
    }
    return out.filter((s) => s.cards.length);
  }, [selectedHubs, state.cities, state.country, state.vibes]);

  if (!shelves.length) return null;

  return (
    <div>
      {/* what a like is worth before any city is chosen — said once, up
          top, so nobody has to guess where their hearts went */}
      {selectedHubs.length === 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-[1.1rem] bg-violet-soft/50 px-3.5 py-3 text-[0.78rem] leading-relaxed text-ink-2">
          <Sparkle size={13} className="mt-0.5 shrink-0 text-violet" aria-hidden />
          <span>
            Like anything you fancy — we&rsquo;ll add your likes to the trip
            once you select a city.
          </span>
        </p>
      )}

      {shelves.map((shelf, si) => (
        <section
          key={shelf.key}
          aria-label={shelf.city ? `Experiences in ${shelf.city}` : (shelf.title ?? "For you")}
          className={si === 0 ? "mt-5" : "mt-8"}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[1.05rem] font-bold text-ink">{shelf.title}</h3>
              {/* the selected city's door into its full catalogue */}
              {shelf.city && onBrowseCity && (
                <button
                  onClick={() => onBrowseCity(shelf.city!)}
                  className="flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-full bg-violet-soft px-3 text-[0.74rem] font-bold text-violet-deep transition-[transform,background-color,color] duration-100 hover:bg-violet hover:text-white active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                >
                  <Ticket size={12} aria-hidden /> Experiences around {shelf.city}
                  <ChevronRight size={12} aria-hidden />
                </button>
              )}
            </div>
            <p className="shrink-0 font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-ink-3">
              {VIBES.find((o) => o.key === shelf.key)?.short ?? ""}
            </p>
          </div>
          <div className="mt-3 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(12.5rem,1fr))]">
            {shelf.cards.map((g, ci) => (
              <IdeaSlideCard
                key={g[0].id}
                slides={g}
                index={si * 4 + ci}
                pinned={state.pinned}
                onOpen={onOpen}
                onLike={toggleLike}
              />
            ))}
          </div>
        </section>
      ))}

      <p className="mt-3 text-[0.7rem] leading-relaxed text-ink-3">
        {onOpen
          ? "Tap a card for the full story — likes are folded into your plan."
          : "Around the stops you're choosing — you'll pick yours on the plan."}
      </p>
    </div>
  );
}
