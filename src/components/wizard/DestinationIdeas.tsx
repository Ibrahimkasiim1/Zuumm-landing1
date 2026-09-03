"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CityPhoto from "@/components/plan/CityPhoto";
import { type Attraction } from "@/lib/planner/attractions";
import { Clock, Heart, MapPin } from "@/components/plan/icons";

/* IdeaSlideCard: the wizard's moving showcase card — the photo owns the
   whole card, the reference way: a rating-style pill top-left (ours
   holds real hours), heart and plus buttons top-right, dots riding the
   image, and the name + place on the photo itself over a legibility
   gradient. The heart is a real like (it feeds the plan); the plus and
   the card itself open the browser on the experience currently showing.
   Rotation pauses entirely under reduced motion. */

export function IdeaSlideCard({
  slides,
  index,
  pinned,
  onOpen,
  onLike,
}: {
  slides: Attraction[];
  /** stagger seed so the grid doesn't flip in lockstep */
  index: number;
  pinned: string[];
  onOpen?: (a: Attraction) => void;
  /** quick-like straight from the card's heart */
  onLike?: (a: Attraction) => void;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const id = window.setInterval(
      () => setI((v) => (v + 1) % slides.length),
      3800 + index * 650
    );
    return () => window.clearInterval(id);
  }, [reduce, slides.length, index]);
  const cur = slides[i] ?? slides[0];
  const liked = pinned.includes(cur.key);

  const photoAndText: ReactNode = (
    <span className="relative block aspect-[4/5] w-full">
      {slides.map((a, si) => (
        <span
          key={a.id}
          aria-hidden={si !== i}
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: si === i ? 1 : 0 }}
        >
          <CityPhoto
            query={`${a.activity.name} ${a.city} ${a.country}`}
            theme={a.cityTheme}
            alt=""
            className="h-full w-full"
          />
        </span>
      ))}
      {/* legibility gradient under the overlaid name + place */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/80 via-ink/35 to-transparent"
      />
      <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 font-mono text-[0.6rem] font-bold text-ink backdrop-blur">
        <Clock size={10} aria-hidden />~{Math.round(cur.hours)}h
      </span>
      {/* dots, then the name + place — all on the image, the reference's way */}
      <span className="absolute inset-x-3 bottom-3 block">
        {slides.length > 1 && (
          <span aria-hidden className="mb-2 flex justify-center gap-1">
            {slides.map((a, si) => (
              <span
                key={a.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  si === i ? "w-4 bg-white" : "w-1.5 bg-white/55"
                }`}
              />
            ))}
          </span>
        )}
        <span className="line-clamp-2 block text-[0.9rem] font-bold leading-snug text-white">
          {cur.activity.name}
        </span>
        <span className="mt-1 flex items-center gap-1 font-mono text-[0.58rem] font-semibold uppercase tracking-widest text-white/85">
          <MapPin size={10} aria-hidden />
          <span className="truncate">{cur.city}</span>
        </span>
      </span>
    </span>
  );

  return (
    <div className="relative overflow-hidden rounded-[1.4rem] bg-paper-2 transition-shadow duration-150 hover:shadow-[0_20px_44px_-26px_rgba(22,18,31,0.5)]">
      {onOpen ? (
        <motion.button
          type="button"
          onClick={() => onOpen(cur)}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
          aria-label={`${cur.activity.name}, ${cur.city} — see the full story`}
          className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet"
        >
          {photoAndText}
        </motion.button>
      ) : (
        <div>{photoAndText}</div>
      )}

      {/* one button, and it says what it does. Opening the experience is
          the card itself, so there's nothing for a second icon to add. */}
      {onLike && (
        <button
          type="button"
          onClick={() => onLike(cur)}
          aria-pressed={liked}
          aria-label={
            liked
              ? `Remove ${cur.activity.name} from your likes`
              : `Like ${cur.activity.name}`
          }
          className={`absolute right-2.5 top-2.5 flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[0.68rem] font-bold backdrop-blur transition-[transform,background-color,color] duration-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet ${
            liked ? "bg-coral text-white" : "bg-white/85 text-ink hover:text-coral-deep"
          }`}
        >
          <Heart size={12} filled={liked} />
          {liked ? "Liked" : "I like this"}
        </button>
      )}
    </div>
  );
}
