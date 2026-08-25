/* Routes that ship as white-label templates.

   /form is handed to other companies to pose as their own booking desk, so
   nothing naming this company may reach its markup — not the visible copy,
   and not the site-wide furniture the root layout injects into <body> (the
   organisation schema and the build's design-contract note).

   The <head> is handled separately, by the page's own metadata export:
   Next merges metadata shallowly, so /form sets an absolute title to escape
   the root layout's "%s · <brand>" template and nulls the inherited
   openGraph, twitter, keywords and metadataBase.

   Kept apart from CHROMELESS_ROUTES on purpose: that list is about which
   surfaces own their viewport, this one is about whose name is on them. */

export const WHITE_LABEL_ROUTES = ["/form"] as const;

export function isWhiteLabel(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return WHITE_LABEL_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}
