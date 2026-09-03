"use client";

import { useEffect, useState } from "react";

/* Photo header with an always-good fallback.

   In the full product this asks /api/planner/photo for a real image
   (Unsplash-backed when a key is configured). This static build has no photo
   service — a live image search is one of the things still to wire — so the
   lookup resolves empty and the component takes the path it was already
   designed to take when the API is absent: a brand gradient keyed to the
   place's theme holds the space, so cards never jump or break. */

async function lookup(_query: string): Promise<string | null> {
  return null;
}

const THEME_GRADIENTS: [RegExp, string][] = [
  [/beach|island|marine/i, "from-teal/25 via-teal-soft to-mint/20"],
  [/culture|history|city/i, "from-coral/20 via-coral-soft to-sun/25"],
  [/nature|mountain|wildlife/i, "from-mint/25 via-teal-soft to-violet-soft"],
  [/food/i, "from-sun/30 via-coral-soft to-coral/15"],
  [/wellness|relax/i, "from-violet/20 via-violet-soft to-teal-soft"],
];

export function themeGradient(theme: string): string {
  return THEME_GRADIENTS.find(([re]) => re.test(theme))?.[1] ?? "from-violet-soft via-paper-2 to-coral-soft";
}

export default function CityPhoto({
  query,
  theme = "",
  alt,
  className = "",
  children,
}: {
  /** search query, e.g. "Chiang Mai Thailand temple" */
  query: string;
  /** city theme string for the gradient fallback */
  theme?: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    lookup(query).then((u) => on && setUrl(u));
    return () => {
      on = false;
    };
  }, [query]);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${themeGradient(theme)} ${className}`}>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0, transition: "opacity 0.4s ease" }}
          onLoad={(e) => ((e.target as HTMLImageElement).style.opacity = "1")}
        />
      )}
      {children}
    </div>
  );
}
