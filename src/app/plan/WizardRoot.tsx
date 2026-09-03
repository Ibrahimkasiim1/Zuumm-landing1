"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  clearWizardDraft,
  countryPatch,
  deriveTrip,
  initialWizardState,
  isAnswered,
  loadWizardDraft,
  markAnswered,
  missingFor,
  missingSentence,
  notesForStep,
  saveWizardDraft,
  stepBlocked,
  type PlanMode,
  type SmartNote,
  type WizardState,
} from "@/lib/planner/wizard";
import { attractionById } from "@/lib/planner/attractions";
import { WIZARD_SECTIONS } from "@/lib/planner/sections";
import { CREWS, MONTHS_LONG } from "@/lib/planner/options";
import { track } from "@/lib/analytics";
import { ArrowLeft, Check, ChevronRight, MapPin, Pin, Sparkle, Ticket, Users, X } from "@/components/plan/icons";
import {
  StepBasicsWhen,
  FromField,
  ToField,
  WhenField,
  WhoField,
  StyleField,
} from "@/components/wizard/StepBasics";
import ConstraintBar, { FixedFlash } from "@/components/wizard/ConstraintBar";
import StepDestinations from "@/components/wizard/StepDestinations";
import StepExperiences from "@/components/wizard/StepExperiences";
import StepItinerary from "@/components/wizard/StepItinerary";
import TripReadout from "@/components/wizard/TripReadout";
import JourneyRail, { type RailGroup, type RailStop } from "@/components/wizard/JourneyRail";
import DestinationProfile from "@/components/wizard/DestinationProfile";
import ExperienceBrowser from "@/components/wizard/ExperienceBrowser";
import HubsPanel from "@/components/wizard/HubsPanel";

/* The guided wizard, as a focus flow: one decision per screen.

   Research-backed shape (progressive disclosure, ≤3 decisions to a trip):
   the golden path asks only what the plan visibly can't default —

     crew → destination → style → suggested (map + starter picks) → reveal

   "Suggest a route for me" is the default, not a question: the architect
   path (hubs → experiences) stays one tap away on the suggested screen.
   Origin (Mumbai) and dates/nights (7N, shoulder-priced) are pre-answered
   defaults, edited from chips on the reveal — each opens its old screen as
   a detour that returns straight to the trip.

   The engine runs on every answer (see TripReadout), drafts persist to
   localStorage, browser back walks screens, and a pre-answered URL param
   (?crew=family) skips its screen entirely. Story cards deep-link with
   ?to/&nights/&tier/&pins and land straight on the suggested route. */

type ScreenId =
  | "crew"
  | "destination"
  | "prefs"
  | "origin"
  | "when"
  | "vibes"
  | "hubs"
  | "experiences"
  | "reveal";

const QUESTIONS: Record<
  string,
  { title: string; sub?: string; noteStep: number; continueLabel: string }
> = {
  crew: {
    title: "Who's going?",
    sub: "One tap — adjust the exact headcount if you need to.",
    noteStep: 1,
    continueLabel: "When",
  },
  prefs: {
    title: "When, and what kind of trip?",
    noteStep: 1,
    continueLabel: "Where to",
  },
  destination: {
    title: "Where to?",
    sub: "Pick a destination — its profile is on the right. You'll choose its cities next.",
    noteStep: 1,
    continueLabel: "Choose cities",
  },
  /* single-field detours, reachable from reveal chips and legacy links */
  origin: {
    title: "Where are you flying from?",
    sub: "We use this for your flight legs and arrival timing.",
    noteStep: 1,
    continueLabel: "Done",
  },
  when: {
    title: "When, and for how long?",
    noteStep: 1,
    continueLabel: "Done",
  },
  vibes: {
    title: "What kind of trip?",
    sub: "Pick as many as you like — this steers everything we suggest.",
    noteStep: 1,
    continueLabel: "Done",
  },
  hubs: { title: "", noteStep: 2, continueLabel: "Build my trip" },
  experiences: { title: "", noteStep: 3, continueLabel: "Build my itinerary" },
  reveal: { title: "", noteStep: 4, continueLabel: "" },
};

/* the whole funnel: one or two questions per page, then the trip.
   When comes before Where — dates and style first, destination after. */
function sequenceFor(_mode: PlanMode | null): ScreenId[] {
  return ["crew", "prefs", "destination", "hubs", "reveal"];
}

/* the funnel's sections — what the top progress bar and the left rail
   speak in. The top bar shows one segment per section; the left rail
   lists only the current section's pages. The reveal's "Edit:" row reads
   the same list (lib/planner/sections), so the two can't disagree; only
   the icons live here. */
const SECTION_ICONS: Record<string, (p: { size?: number }) => ReactNode> = {
  "Trip details": (p) => <Users {...p} />,
  Destinations: (p) => <MapPin {...p} />,
  Cities: (p) => <Pin {...p} />,
  "Your plan": (p) => <Ticket {...p} />,
};

const SECTIONS: {
  label: string;
  icon: (p: { size?: number }) => ReactNode;
  screens: ScreenId[];
}[] = WIZARD_SECTIONS.map((s) => ({
  label: s.label,
  icon: SECTION_ICONS[s.label] ?? ((p) => <Ticket {...p} />),
  screens: s.screens as ScreenId[],
}));

/* what the header's position label says on each page — where you are,
   in the funnel's own words */
const STEP_INFO: Record<ScreenId, string> = {
  crew: "Who's going",
  destination: "Where to",
  prefs: "When",
  origin: "Flying from",
  when: "Dates & nights",
  vibes: "Trip style",
  hubs: "Choose cities",
  experiences: "Add experiences",
  reveal: "Your trip, priced",
};

/* single-field screens splice in after their page when visited as detours */
const DETOUR_AFTER: Partial<Record<ScreenId, ScreenId>> = {
  origin: "prefs",
  when: "prefs",
  vibes: "prefs",
  experiences: "hubs",
};

/** which main page a screen stands in for (detours count as their page) */
function anchorScreen(id: ScreenId): ScreenId {
  return DETOUR_AFTER[id] ?? id;
}

/** the section a screen belongs to — direct member first (the experiences
    browser reads as "Your plan" even though it splices in as a detour),
    then via its anchor page */
function sectionOf(id: ScreenId) {
  let i = SECTIONS.findIndex((s) => s.screens.includes(id));
  if (i < 0) i = SECTIONS.findIndex((s) => s.screens.includes(anchorScreen(id)));
  return { index: Math.max(0, i), ...SECTIONS[Math.max(0, i)] };
}

/** what the Continue button promises, named by where it goes next */
const NEXT_LABELS: Partial<Record<ScreenId, string>> = {
  destination: "Where to",
  prefs: "When",
  hubs: "Choose cities",
  experiences: "Pick experiences",
  reveal: "Build my trip",
};

/** numeric goStep compatibility for StepItinerary's edit buttons + notes */
function screenForLegacyStep(n: number, _mode: PlanMode | null): ScreenId {
  if (n <= 1) return "crew";
  if (n === 2) return "hubs";
  if (n === 3) return "experiences";
  return "reveal";
}

/** retired screen ids from older links map onto the new funnel */
function normalizeScreenId(id: string | null): ScreenId | null {
  if (!id) return null;
  if (id === "suggested") return "reveal";
  if (id === "mode" || id === "basics") return "crew";
  return QUESTIONS[id] ? (id as ScreenId) : null;
}

export default function WizardRoot() {
  const params = useSearchParams();
  const reduce = useReducedMotion();

  const [ready, setReady] = useState(false);
  const [state, setState] = useState<WizardState>(initialWizardState);
  const [screen, setScreenRaw] = useState<ScreenId>("crew");
  const [dir, setDir] = useState(1);
  /* warn notes the user has waved away — reset per screen */
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  /* set only once they've tried to move on: the form doesn't scold anyone
     for not having filled it in yet. Reset per screen. */
  const [attempted, setAttempted] = useState(false);
  const [fixed, setFixed] = useState<string | null>(null);
  /* where a detour (edit-from-reveal) returns to when it's done */
  const [returnTo, setReturnTo] = useState<ScreenId | null>(null);

  /* one-shot hydration: draft first, URL params win over it */
  useEffect(() => {
    const fresh = params.get("fresh") === "1";
    const draft = fresh ? null : loadWizardDraft();
    let next: WizardState = draft ?? initialWizardState;

    const crewKey = params.get("crew");
    const crew = CREWS.find((c) => c.key === crewKey);
    if (crew) {
      /* arriving with the answer in the link is having answered it */
      next = {
        ...next,
        crew: crew.key,
        adults: crew.adults,
        children: crew.children,
        infants: crew.infants,
        ...markAnswered(next, "crew"),
      };
    }
    const vibes = params.get("vibes");
    if (vibes) next = { ...next, vibes: vibes.split(",").filter(Boolean) };

    /* story-card presets: a whole trip in the URL */
    const to = params.get("to");
    if (to)
      next = {
        ...next,
        ...countryPatch(next, to),
        ...markAnswered(next, "country"),
      } as WizardState;
    const nights = Number(params.get("nights"));
    /* no product cap on trip length — the bound is only so a hand-edited
       link can't ask the engine to lay out an absurd number of days */
    if (nights >= 1 && nights <= 365)
      next = { ...next, nights, baseNights: nights };
    const tier = params.get("tier");
    if (tier === "3" || tier === "4" || tier === "5") next = { ...next, tier };
    const cities = params.get("cities");
    if (cities) {
      const list = cities.split(",").map((c) => c.trim()).filter(Boolean);
      if (list.length) next = { ...next, cities: list };
    }
    const pins = params.get("pins");
    if (pins) {
      const keys = pins
        .split(",")
        .map((id) => attractionById(id.trim())?.key)
        .filter((k): k is string => Boolean(k));
      if (keys.length) next = { ...next, pinned: keys, planMode: "explorer" };
    }

    if (fresh) clearWizardDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot post-mount hydration
    setState(next);

    /* entry screen: explicit ?q= wins (retired ids normalize), legacy
       ?step= maps; a hero crew tap arrives with that page already answered
       and skips straight to the next question (endowed progress) */
    const q = normalizeScreenId(params.get("q"));
    const legacy = Number(params.get("step"));
    if (q) setScreenRaw(q);
    else if (legacy >= 1 && legacy <= 4)
      setScreenRaw(screenForLegacyStep(legacy, next.planMode));
    else if (crew) setScreenRaw("prefs");
    setReady(true);
    track("wizard_open", { crew: crewKey ?? "none", fresh, to: to ?? "none" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entry params read once
  }, []);

  useEffect(() => {
    if (ready) saveWizardDraft(state);
  }, [state, ready]);

  const patch = useCallback((p: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  /* which stop the side panel's experience browser is open on (hubs only),
     and the experience it landed on — declared above setScreen, which
     resets them on navigation */
  const [browseHub, setBrowseHub] = useState<string | null>(null);
  const [browseFocus, setBrowseFocus] = useState<string | null>(null);

  const seq = useMemo(() => {
    const s = sequenceFor(state.planMode);
    if (!s.includes(screen)) {
      /* a detour screen slots into its old spot so progress reads sanely */
      const after = DETOUR_AFTER[screen];
      if (after) {
        const i = s.indexOf(after);
        return [...s.slice(0, i + 1), screen, ...s.slice(i + 1)];
      }
    }
    return s;
  }, [state.planMode, screen]);
  const idx = Math.max(0, seq.indexOf(screen));

  const setScreen = useCallback((id: ScreenId, direction: 1 | -1) => {
    setDir(direction);
    setScreenRaw(id);
    setDismissed(new Set()); // dismissals are per screen
    setAttempted(false); // each screen starts unscolded
    setBrowseHub(null); // the panel browser belongs to its screen
    setBrowseFocus(null);
    window.history.pushState({ wq: id }, "", `/plan?q=${id}`);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    track("wizard_screen", { screen: id });
  }, []);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const id =
        normalizeScreenId(
          (e.state?.wq as string) ??
            new URLSearchParams(location.search).get("q")
        ) ?? "crew";
      setScreenRaw(id);
      setReturnTo(null);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const derived = useMemo(() => deriveTrip(state), [state]);
  const q = QUESTIONS[screen];
  const allNotes = useMemo(
    () => notesForStep(q.noteStep, state, derived),
    [q.noteStep, state, derived]
  );
  const blocker = useMemo(
    () => stepBlocked(q.noteStep, state, derived),
    [q.noteStep, state, derived]
  );

  /* screens render advice (tips) inline; warns and blocks belong to the
     constraint bar so they never appear twice */
  const tipNotes = useMemo(
    () => allNotes.filter((n) => n.severity === "tip"),
    [allNotes]
  );

  /* required answers this screen is still waiting on. Continue stays live
     so the traveller gets told what's missing when they reach for it —
     a dead button explains nothing. */
  const missing = useMemo(() => missingFor(screen, state), [screen, state]);

  /* the right-hand preview only earns its space once there's something to
     preview: the route panel always on "hubs", the destination profile
     only after a destination has actually been chosen */
  const showPanel =
    screen === "hubs" || (screen === "destination" && isAnswered(state, "country"));

  const requiredNote = useMemo<SmartNote | null>(() => {
    if (!attempted || missing.length === 0) return null;
    return {
      id: "required-answers",
      anchor: "trip",
      severity: "block",
      title:
        missing.length === 1
          ? `We still need ${missing[0]}`
          : `${missing.length} answers still needed`,
      detail:
        missing.length === 1
          ? "Answer it and we'll carry on."
          : `Add ${missingSentence(missing)}.`,
    };
  }, [attempted, missing]);

  /* what the constraint bar shows: blocks always, warns until waved away */
  const barNotes = useMemo(
    () => [
      ...(requiredNote ? [requiredNote] : []),
      ...allNotes.filter(
        (n) =>
          n.severity === "block" ||
          (n.severity === "warn" && !dismissed.has(n.id))
      ),
    ],
    [requiredNote, allNotes, dismissed]
  );

  useEffect(() => {
    const top = barNotes[0];
    if (top) track("constraint_shown", { id: top.id, severity: top.severity, screen });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire on the surfaced note only
  }, [barNotes[0]?.id]);

  const applyFix = useCallback(
    (p: Partial<WizardState>) => {
      patch(p);
      track("constraint_fixed", { screen });
      setFixed("Fixed — this fits now");
      window.setTimeout(() => setFixed(null), 1800);
    },
    [patch, screen]
  );

  /* the experience browser's scope and the build-moment flag live above
     `advance`, which resets and sets them */
  const [expCity, setExpCity] = useState<string | null>(null);
  /* the labor-illusion beat: an honest moment of visible work between
     choosing destinations and the built trip */
  const [assembling, setAssembling] = useState(false);

  const advance = useCallback(() => {
    if (returnTo) {
      /* a finished detour goes straight back to the trip, not forward */
      const target = returnTo;
      setReturnTo(null);
      setExpCity(null);
      setScreen(target, 1);
      return;
    }
    const next = seq[idx + 1];
    if (!next) return;
    if (screen === "hubs" && next === "reveal" && !reduce) {
      /* build moment: show the work, then reveal */
      setAssembling(true);
      window.setTimeout(() => {
        setAssembling(false);
        setScreen(next, 1);
      }, 1500);
      return;
    }
    setScreen(next, 1);
  }, [returnTo, seq, idx, screen, reduce, setScreen]);

  /* warns live in the constraint bar and never intercept Continue — only a
     block (which disables the button) stops progress. Unanswered required
     questions stop it too, but by speaking up rather than going dead. */
  const next = useCallback(() => {
    if (screen === "reveal") return;
    if (missing.length > 0) {
      setAttempted(true);
      track("wizard_blocked", { screen, missing: missing.join(",") });
      return;
    }
    advance();
  }, [screen, advance, missing]);

  const back = useCallback(() => {
    if (returnTo) {
      const target = returnTo;
      setReturnTo(null);
      setScreen(target, -1);
      return;
    }
    if (idx > 0) setScreen(seq[idx - 1], -1);
  }, [returnTo, idx, seq, setScreen]);

  const goStep = useCallback(
    (n: number) => {
      const target = screenForLegacyStep(n, state.planMode);
      setScreen(target, seq.indexOf(target) > idx ? 1 : -1);
    },
    [state.planMode, seq, idx, setScreen]
  );

  /* open a pre-answered question (origin / when) as a detour and come back */
  const goScreen = useCallback(
    (id: string) => {
      if (!QUESTIONS[id]) return;
      setReturnTo(screen);
      setScreen(id as ScreenId, 1);
    },
    [screen, setScreen]
  );

  /* the experience browser, scoped to one destination, as a detour */
  const goExperiences = useCallback(
    (city: string) => {
      setExpCity(city);
      track("exp_browser_open", { city });
      setReturnTo(screen);
      setScreen("experiences", 1);
    },
    [screen, setScreen]
  );

  /* the fixed footer (nav + constraint bar) must never hide content: we
     measure its real height and pad the page past it, so the bottom of
     every screen scrolls fully into view even when a warning is showing */
  const footRef = useRef<HTMLElement | null>(null);
  const [footH, setFootH] = useState(120);
  useEffect(() => {
    const el = footRef.current;
    if (!el) return;
    const set = () => setFootH(el.offsetHeight);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [screen, ready]);

  const startOver = useCallback(() => {
    clearWizardDraft();
    setState(initialWizardState);
    setReturnTo(null);
    setScreen("crew", -1);
    track("wizard_restart", {});
  }, [setScreen]);

  /* the left rail speaks only about the section you're in: its header and
     its pages, nothing else. Detour screens light up the page they stand
     in for. */
  const railGroup = useMemo<RailGroup>(() => {
    const LABELS: Record<string, string> = {
      crew: "Who's going",
      destination: "Where to",
      prefs: "When",
      hubs: "Choose stops",
      experiences: "Experiences",
      reveal: "Built for you",
    };
    const main = sequenceFor(state.planMode);
    const anchor = anchorScreen(screen);
    const anchorIdx = main.indexOf(anchor);
    const stopState = (id: ScreenId): RailStop["state"] => {
      const i = main.indexOf(id);
      if (i === anchorIdx) return "current";
      return i < anchorIdx ? "done" : "todo";
    };
    const s = sectionOf(screen);
    return {
      label: s.label,
      stops: s.screens
        .filter((id) => main.includes(id))
        .map((id) => ({ id, label: LABELS[id] ?? id, state: stopState(id) })),
    };
  }, [state.planMode, screen]);

  /* answered-so-far summary chips (tap to revisit) */
  const summary = useMemo(() => {
    const chips: { id: ScreenId; label: string }[] = [];
    const crew = CREWS.find((c) => c.key === state.crew);
    const heads = state.adults + state.children;
    for (const id of seq.slice(0, idx)) {
      if (id === "crew" && crew)
        chips.push({
          id,
          label: `${crew.label} · ${heads}${
            state.infants ? ` + ${state.infants} infant${state.infants === 1 ? "" : "s"}` : ""
          }`,
        });
      if (id === "destination") chips.push({ id, label: state.country });
      if (id === "prefs") {
        chips.push({
          id,
          label: `${state.nights}N · ${
            state.startDate ||
            (state.flexMonth != null ? MONTHS_LONG[state.flexMonth] : "dates open")
          }`,
        });
        if (state.vibes.length)
          chips.push({
            id,
            label: `${state.vibes.length} style${state.vibes.length > 1 ? "s" : ""}`,
          });
      }
      if (id === "hubs" && state.cities.length)
        chips.push({ id, label: `${derived.plan.stops.length} destinations` });
    }
    return chips;
  }, [seq, idx, state, derived.plan.stops.length]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-coral"
          aria-label="Loading your trip"
        />
      </div>
    );
  }

  const stepProps = {
    state,
    patch,
    derived,
    notes: tipNotes,
    next,
    goStep,
    goScreen,
    goExperiences,
    expCity,
  };
  const isQuestion = !["hubs", "experiences", "reveal"].includes(screen);
  const wide = screen === "experiences";
  /* the early questions have nothing concrete to price yet — no readout,
     content centred, the page kept open and quiet. (The when/origin
     detours from the reveal keep it: there the trip is real.) */
  const bare = screen === "crew" || screen === "prefs";
  const continueLabel = returnTo
    ? "Done · back to your trip"
    : screen === "destination"
      ? /* the button carries the choice it just made — but it can't name a
           destination before one has actually been chosen */
        missing.includes("a destination")
          ? "Choose cities"
          : `Choose cities in ${state.country}`
      : (NEXT_LABELS[seq[idx + 1]] ?? q.continueLabel);

  return (
    <div
      className="min-h-screen bg-paper"
      /* the fixed footer's live height, readable by any sticky panel so it
         can stop above the bar instead of running underneath it */
      style={{ ["--wiz-foot" as string]: `${screen === "reveal" ? 0 : footH}px` }}
    >
      {/* ---------- header: brand + position + the stepped progress ---------- */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="container-x flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Zuumm home">
            <Image src="/brand/logo.png" alt="Zuumm" width={92} height={26} className="h-6 w-auto" />
          </Link>
          {/* position label — switches with every page */}
          <p className="min-w-0 truncate font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-ink-3">
            <span className="text-ink">Step {sectionOf(screen).index + 1}</span>
            <span aria-hidden> / </span>
            <span className="sr-only">of </span>
            {SECTIONS.length} · {STEP_INFO[screen]}
          </p>
          <button
            onClick={startOver}
            className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[0.78rem] font-semibold text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
          >
            Start over
          </button>
        </div>

        {/* the funnel's three steps, as pills: done steps tap back, the
            current one is the dark pill, what's ahead waits in outline */}
        <nav aria-label="Planning steps" className="pb-2.5">
          <ol className="container-x flex items-center justify-center gap-0">
            {SECTIONS.map((s, si) => {
              const cur = sectionOf(screen).index;
              const stepState = si < cur ? "done" : si === cur ? "current" : "todo";
              const firstScreen = s.screens.find((id) =>
                sequenceFor(state.planMode).includes(id)
              );
              return (
                <li key={s.label} className="flex min-w-0 items-center">
                  {si > 0 && (
                    <span
                      aria-hidden
                      className={`mx-1.5 h-px w-3 shrink-0 sm:mx-2.5 sm:w-7 ${
                        si <= cur ? "bg-mint/60" : "bg-line"
                      }`}
                    />
                  )}
                  <button
                    onClick={() =>
                      stepState === "done" && firstScreen && setScreen(firstScreen, -1)
                    }
                    disabled={stepState !== "done"}
                    aria-current={stepState === "current" ? "step" : undefined}
                    className={`flex min-w-0 items-center gap-2 rounded-full p-1 pr-2 transition-all sm:pr-3.5 ${
                      stepState === "current"
                        ? "bg-ink text-white shadow-[0_10px_30px_-14px_rgba(22,18,31,0.55)]"
                        : stepState === "done"
                          ? "cursor-pointer border border-line bg-white text-ink-2 hover:border-ink-3 hover:text-ink"
                          : "border border-line bg-white text-ink-3"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        stepState === "current"
                          ? "bg-white text-ink"
                          : stepState === "done"
                            ? "bg-mint text-white"
                            : "bg-paper-2 text-ink-3"
                      }`}
                    >
                      {stepState === "done" ? <Check size={13} /> : s.icon({ size: 14 })}
                    </span>
                    <span
                      className={`truncate text-[0.8rem] font-semibold ${
                        stepState === "current" ? "" : "hidden sm:inline"
                      }`}
                    >
                      {s.label}
                    </span>
                    {stepState === "done" && <span className="sr-only">{s.label}, done — edit</span>}
                    {stepState === "todo" && <span className="sr-only">{s.label}, upcoming</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* one slim segment per step — the current one fills page by page */}
        <div aria-hidden className="flex w-full gap-1 px-1 pb-1">
          {SECTIONS.map((s, si) => {
            const cur = sectionOf(screen).index;
            const pages = s.screens.filter((id) =>
              sequenceFor(state.planMode).includes(id)
            );
            const pageIdx = pages.indexOf(anchorScreen(screen));
            const fill =
              si < cur
                ? 1
                : si > cur
                  ? 0
                  : pages.length
                    ? (Math.max(0, pageIdx) + 1) / pages.length
                    : 1;
            return (
              <div key={s.label} className="h-1 flex-1 overflow-hidden rounded-full bg-paper-2">
                <motion.div
                  className="h-full rounded-full grad-bg"
                  initial={false}
                  animate={{ width: `${fill * 100}%` }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }
                  }
                />
              </div>
            );
          })}
        </div>
      </header>

      {/* ---------- screen body ---------- */}
      {/* focus-flow hides field labels; the two-question page needs them */}
      <main {...(screen === "prefs" ? {} : { "data-focus-flow": "" })}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={screen}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 28 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -20 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0 } : { duration: 0.26, ease: [0.21, 0.6, 0.35, 1] }}
          >
            {screen === "reveal" ? (
              /* the reveal has no footer bar — its rail keeps the full notes */
              <StepItinerary {...stepProps} notes={allNotes} />
            ) : screen === "destination" || screen === "hubs" ? (
              /* the two choosing screens share a full-bleed preview panel,
                 flush to the screen's right edge. On "Where to?" it profiles
                 the destination that was picked. On "Choose destinations" it
                 shows the route being drawn and ideas around the chosen
                 stops. No price on either: pricing waits for the plan.

                 "Where to?" starts as one centred column — there is nothing
                 to preview until a destination is chosen, and an empty panel
                 would just be a hole in the page. Choosing one splits the
                 layout and the panel arrives. */
              <div
                className={
                  showPanel
                    ? "lg:grid lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[minmax(0,1fr)_34rem] xl:grid-cols-[minmax(0,1fr)_44rem]"
                    : "min-h-[calc(100vh-7rem)]"
                }
              >
                {/* route advice drops in from the top and leaves on its own —
                    nothing stays stuck to the page */}
                {screen === "hubs" && <TipToasts notes={tipNotes} onApply={applyFix} />}
                <div
                  /* w-full matters: as a grid item, container-x's auto
                     margins would otherwise shrink it to fit-content */
                  className="container-x w-full py-8 lg:py-10"
                  style={{ paddingBottom: footH + 56 }}
                >
                  {/* choosing stops is concrete — the live trip stays in
                      reach on small screens */}
                  {screen === "hubs" && (
                    <div className="mb-5 lg:hidden">
                      <TripReadout state={state} derived={derived} compact />
                    </div>
                  )}
                  {/* answered so far — tap to revisit (mobile; desktop has the rail) */}
                  {summary.length > 0 && (
                    <div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto lg:hidden">
                      {summary.map((c) => (
                        <button
                          key={`${c.id}-${c.label}`}
                          onClick={() => setScreen(c.id, -1)}
                          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[0.76rem] font-semibold text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                        >
                          <Check size={11} className="text-mint" />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div
                    className={
                      screen === "destination"
                        ? /* no rail here — the question sits centred on its
                             own, and spreads wider while it has the page to
                             itself so the destination grid can grow */
                          showPanel
                          ? "mx-auto w-full max-w-[42rem]"
                          : "mx-auto w-full max-w-[54rem]"
                        : /* hubs: the rail's message became the header line —
                             the space goes to the cards */
                          "w-full"
                    }
                  >
                    <div className="w-full min-w-0">
                      {screen === "destination" ? (
                        <>
                          <header className="mb-7">
                            <h1 className="display text-[1.9rem] leading-[1.08] text-ink md:text-[2.4rem]">
                              {q.title}
                            </h1>
                            {q.sub && (
                              <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-ink-2">
                                {q.sub}
                              </p>
                            )}
                          </header>
                          <ToField
                            state={state}
                            patch={patch}
                            notes={tipNotes.filter((n) => n.anchor === "to")}
                          />
                        </>
                      ) : (
                        <StepDestinations
                          {...stepProps}
                          onBrowse={(h) => {
                            setBrowseFocus(null);
                            setBrowseHub(h);
                          }}
                        />
                      )}
                      {/* small screens have no side panel — it flows inline,
                          and stays away until there's a destination to show */}
                      {showPanel && (
                        <div className="mt-10 lg:hidden">
                          <PanelTitle
                            title={screen === "destination" ? "Destination info" : "Experiences"}
                            sub={
                              screen === "destination"
                                ? "About the place you picked"
                                : "Handpicked around your route"
                            }
                          />
                          {screen === "destination" ? (
                            <DestinationProfile country={state.country} />
                          ) : (
                            <HubsPanel state={state} onPatch={patch} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* the preview panel, edge to edge on the right. It arrives
                    with the choice that gives it something to show. */}
                <AnimatePresence>
                  {showPanel && (
                <motion.aside
                  key="preview-panel"
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: 24 }}
                  transition={{ duration: 0.28, ease: [0.21, 0.6, 0.35, 1] }}
                  className="hidden border-l border-line bg-white lg:block"
                  aria-label={
                    screen === "destination"
                      ? "Destination profile"
                      : "Route preview"
                  }
                >
                  <div
                    className="no-scrollbar sticky top-28 overflow-y-auto px-8 py-7"
                    style={{ maxHeight: "calc(100vh - 7rem - var(--wiz-foot, 0px))" }}
                  >
                    {/* what this panel is, said before its content — the
                        browser variant carries its own back-header instead */}
                    {!browseHub && (
                      <PanelTitle
                        title={screen === "destination" ? "Destination info" : "Experiences"}
                        sub={
                          screen === "destination"
                            ? "About the place you picked"
                            : "Handpicked around your route"
                        }
                      />
                    )}
                    {screen === "destination" ? (
                      <DestinationProfile country={state.country} />
                    ) : browseHub ? (
                      /* "Look at experiences" takes over the panel — browse,
                         like, and the likes feed the plan we build next */
                      <ExperienceBrowser
                        key={`${browseHub}:${browseFocus ?? "all"}`}
                        hub={browseHub}
                        state={state}
                        season={derived.plan.season}
                        initialFocus={browseFocus}
                        onPatch={patch}
                        onBack={() => {
                          setBrowseHub(null);
                          setBrowseFocus(null);
                        }}
                      />
                    ) : (
                      <HubsPanel
                        state={state}
                        onPatch={patch}
                        onOpen={(a) => {
                          setBrowseFocus(a.id);
                          setBrowseHub(a.gateway);
                        }}
                        onBrowseCity={(city) => {
                          /* no focus: this opens the city's whole list */
                          setBrowseFocus(null);
                          setBrowseHub(city);
                        }}
                      />
                    )}
                  </div>
                </motion.aside>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div
                className={`container-x mx-auto py-8 lg:py-10 ${wide ? "" : "max-w-[72rem]"}`}
                style={{ paddingBottom: footH + 56 }}
              >
                {/* the early screens hold nothing but the question —
                    there is no trip to read out yet */}
                {!bare && (
                  <div className="mb-5 lg:hidden">
                    <TripReadout state={state} derived={derived} compact />
                  </div>
                )}

                {/* answered so far — tap to revisit (mobile; desktop has the rail) */}
                {summary.length > 0 && (
                  <div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto lg:hidden">
                    {summary.map((c) => (
                      <button
                        key={`${c.id}-${c.label}`}
                        onClick={() => setScreen(c.id, -1)}
                        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[0.76rem] font-semibold text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                      >
                        <Check size={11} className="text-mint" />
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={
                    wide
                      ? ""
                      : bare
                        ? /* rail on the left, an equal spacer on the right,
                             so the question sits dead centre */
                          "lg:grid lg:grid-cols-[8.5rem_minmax(0,1fr)_8.5rem] lg:gap-10"
                        : "lg:grid lg:grid-cols-[8.5rem_minmax(0,1fr)_320px] lg:gap-10"
                  }
                >
                  {!wide && (
                    <aside className="hidden lg:block" aria-hidden={false}>
                      <div className="sticky top-32">
                        <JourneyRail
                          group={railGroup}
                          onJump={(id) => setScreen(id as ScreenId, -1)}
                        />
                      </div>
                    </aside>
                  )}
                  <div
                    className={
                      wide
                        ? ""
                        : bare
                          ? "mx-auto w-full max-w-[42rem]"
                          : "mx-auto w-full max-w-[42rem] lg:mx-0"
                    }
                  >
                    {screen === "crew" ? (
                      /* the personal opening: a promise, not a form */
                      <header className="mb-9 pt-6 text-center md:pt-14">
                        <WelcomeHeadline reduce={!!reduce} />
                        <motion.p
                          initial={reduce ? false : { opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: reduce ? 0 : 0.45,
                            ease: [0.21, 0.6, 0.35, 1],
                          }}
                          className="mx-auto mt-4 max-w-md text-[0.98rem] leading-relaxed text-ink-2"
                        >
                          Three quick questions, and a day-by-day itinerary
                          priced from real rates. First — who&rsquo;s going?
                        </motion.p>
                      </header>
                    ) : (
                      isQuestion && (
                        <header className="mb-7">
                          <h1 className="display text-[1.9rem] leading-[1.08] text-ink md:text-[2.4rem]">
                            {q.title}
                          </h1>
                          {q.sub && (
                            <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-ink-2">
                              {q.sub}
                            </p>
                          )}
                        </header>
                      )
                    )}

                    {screen === "crew" && <WhoField state={state} patch={patch} notes={tipNotes.filter((n) => n.anchor === "who")} />}
                    {screen === "prefs" && <StepBasicsWhen {...stepProps} />}

                    {/* single-field detours (reveal edit chips, legacy links) */}
                    {screen === "origin" && <FromField state={state} patch={patch} />}
                    {screen === "when" && <WhenField state={state} patch={patch} notes={tipNotes.filter((n) => n.anchor === "when")} />}
                    {screen === "vibes" && <StyleField state={state} patch={patch} notes={tipNotes.filter((n) => n.anchor === "style")} />}

                    {screen === "experiences" && <StepExperiences {...stepProps} />}
                  </div>

                  {!wide && bare && <div aria-hidden className="hidden lg:block" />}
                  {!wide && !bare && (
                    <aside className="hidden lg:block" aria-label="Live trip summary">
                      <div
                        className="no-scrollbar sticky top-32 -m-2 overflow-y-auto p-2"
                        style={{ maxHeight: "calc(100vh - 8.5rem - var(--wiz-foot, 0px))" }}
                      >
                        <TripReadout state={state} derived={derived} />
                      </div>
                    </aside>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ---------- the build moment ---------- */}
      <AnimatePresence>
        {assembling && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-paper/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
          >
            <AssemblingLines />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- sticky footer nav (constraint bar docks above it) ---------- */}
      {screen !== "reveal" && (
        <footer
          ref={footRef}
          className="fixed inset-x-0 bottom-0 z-40"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ConstraintBar
            notes={barNotes}
            onApply={applyFix}
            onDismiss={(id) => setDismissed((d) => new Set(d).add(id))}
          />
          <FixedFlash show={!!fixed} label={fixed ?? ""} />
          <div className="border-t border-line bg-white/95 backdrop-blur">
          <div className="container-x flex min-h-[72px] items-center justify-between gap-3 py-3">
            <button
              onClick={back}
              disabled={idx === 0}
              aria-label="Back to the previous question"
              className="btn-secondary disabled:invisible"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline"> Back</span>
            </button>

            <div className="flex min-w-0 items-center gap-3">
              {blocker && (
                <p className="hidden truncate text-[0.78rem] font-semibold text-coral-deep sm:block">
                  {blocker.title}
                </p>
              )}
              <button
                onClick={next}
                disabled={!!blocker}
                className="grad-bg flex min-h-[52px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-5 text-[0.9rem] font-bold text-white shadow-[0_14px_40px_-16px_rgba(255,59,92,0.55)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet sm:px-7 sm:text-[0.95rem]"
              >
                {continueLabel}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          </div>
        </footer>
      )}

    </div>
  );
}

/* names the side panel before its content: "Destination info" on Where
   to?, "Experiences" on Choose cities — so the panel never has to be
   guessed at from what it happens to be showing */
function PanelTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5 border-b border-line pb-3.5">
      <h2 className="text-[1.1rem] font-bold leading-tight text-ink">{title}</h2>
      <p className="mt-0.5 text-[0.76rem] text-ink-3">{sub}</p>
    </div>
  );
}

/* Route advice as notifications: each tip slides down from the top, waits
   long enough to be read, then leaves — dismissible early, one-tap fixes
   attached. The advice is the same engine-computed notes as before; only
   the furniture changed: nothing sticky, nothing stacked on the page. */
function TipToasts({
  notes,
  onApply,
}: {
  notes: SmartNote[];
  onApply: (p: Partial<WizardState>) => void;
}) {
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const shown = notes.filter((n) => !hidden.has(n.id)).slice(0, 2);

  /* each toast gets one timer, once */
  const timed = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const n of shown) {
      if (timed.current.has(n.id)) continue;
      timed.current.add(n.id);
      window.setTimeout(() => setHidden((h) => new Set(h).add(n.id)), 9000);
    }
  });

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[7.6rem] z-40 flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {shown.map((n) => (
          <motion.div
            key={n.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.21, 0.6, 0.35, 1] }}
            className="pointer-events-auto flex w-full max-w-xl items-start gap-2.5 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_24px_60px_-24px_rgba(22,18,31,0.4)]"
          >
            <Sparkle size={14} className="mt-0.5 shrink-0 text-violet" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[0.82rem] font-bold text-ink">{n.title}</p>
              {n.detail && (
                <p className="mt-0.5 text-[0.76rem] leading-relaxed text-ink-2">{n.detail}</p>
              )}
              {n.actions && n.actions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {n.actions.map((ac) => (
                    <button
                      key={ac.label}
                      onClick={() => {
                        onApply(ac.patch);
                        setHidden((h) => new Set(h).add(n.id));
                      }}
                      className="min-h-[32px] cursor-pointer rounded-full bg-violet-soft px-3 text-[0.74rem] font-bold text-violet-deep transition-[transform,background-color,color] duration-100 hover:bg-violet hover:text-white active:scale-[0.97]"
                    >
                      {ac.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setHidden((h) => new Set(h).add(n.id))}
              aria-label="Dismiss note"
              className="shrink-0 cursor-pointer rounded-full p-1 text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* the welcome, dropping in from above word by word — each word falls into
   place inside a clipped span, so the headline assembles like the trip will */
const WELCOME_WORDS = ["Let’s", "plan", "your", "perfect", "trip."];

function WelcomeHeadline({ reduce }: { reduce: boolean }) {
  return (
    <h1 className="display mx-auto max-w-[16ch] text-[2.4rem] leading-[1.06] text-ink md:text-[3.4rem]">
      {WELCOME_WORDS.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "-108%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: reduce ? 0 : 0.08 + i * 0.06,
              ease: [0.21, 0.6, 0.35, 1],
            }}
          >
            {w}
          </motion.span>
          {i < WELCOME_WORDS.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}

/* the honest work, named while it happens — every line is something the
   engine genuinely does in this moment */
const ASSEMBLE_LINES = [
  "Pricing hotels at real rates…",
  "Placing days that actually fit…",
  "Adding transfers between stops…",
];

function AssemblingLines() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ASSEMBLE_LINES.length), 480);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-40" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-coral" />
      </span>
      <p className="font-mono text-[0.82rem] font-semibold uppercase tracking-widest text-ink-2">
        {ASSEMBLE_LINES[i]}
      </p>
    </div>
  );
}
