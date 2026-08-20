/* Routes that own their whole viewport.

   The planner canvas carries its own header and a fixed price bar pinned to
   the bottom of the screen; the site nav and the mobile sticky CTA would sit
   on top of both. These surfaces are focused tasks, not pages you browse, so
   they get the screen to themselves.

   One list, read by Nav, Footer and StickyCTA, which each used to carry
   their own copy. /chat stays out of it deliberately: only StickyCTA hides
   there today, and quietly dropping that page's nav and footer isn't this
   change's call to make. */

export const CHROMELESS_ROUTES = ["/get-started", "/plan"] as const;

export function isChromeless(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return CHROMELESS_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}
