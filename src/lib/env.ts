/**
 * Centralized, typed environment access — pattern ported from the
 * production repo's src/config/env.ts. All URLs are env-driven so
 * local runs point at localhost services and prod points at zuumm.ai.
 */

const get = (key: string, fallback: string): string => {
  const v = process.env[key];
  return v && v.length > 0 ? v : fallback;
};

const stripSlash = (v: string) => v.replace(/\/$/, "");

/** Account-required actions (login, plan upgrades). Inert in this static
    build — the account door renders but goes nowhere. */
export const APP_URL = "#";

/** Django REST API. Local: :8000 */
export const API_BASE_URL = stripSlash(
  get("NEXT_PUBLIC_API_BASE_URL", "https://app.zuumm.ai")
);

/** AI agents service (chat). Local: :8001 */
export const AI_BASE_URL = stripSlash(
  get("NEXT_PUBLIC_AI_BASE_URL", "https://chat.zuumm.ai")
);

/** The live content site (blog, terms, privacy) */
export const SITE_URL = stripSlash(
  get("NEXT_PUBLIC_SITE_URL", "https://www.zuumm.ai")
);

/** WhatsApp support/planning number (digits only for wa.me) */
export const WHATSAPP_NUMBER = get("NEXT_PUBLIC_WHATSAPP_NUMBER", "916366092532");

/** The full product opens WhatsApp with a prefilled message; this static
    build renders the same control and goes nowhere. */
export const waLink = (_text: string) => "#";
