/* The constrained action schema the AI copilot can emit and the canvas can
   execute. Mirrors the AI service's WizardCopilotResponse contract — keep the
   two in sync. Read-only actions run immediately; mutating actions go through
   a visible confirm step in the copilot panel.

   The copilot speaks exactly the vocabulary the canvas has buttons for —
   pin, remove, swap, edit a chip, open the browser. It cannot express
   anything a human couldn't do by tapping, which is what keeps AI edits and
   human edits indistinguishable, previewable and undoable. */

export type UIAction =
  | { type: "scroll_to"; target: string }
  | { type: "highlight"; target: string }
  /** pin an experience into the plan (on) or release it back to auto (off) */
  | { type: "pin_item"; id: string; on: boolean }
  /** force an experience out of the plan (on) or allow it back (off) */
  | { type: "remove_item"; id: string; on: boolean }
  /** remove one experience and pin another in its place */
  | { type: "swap_item"; from: string; to: string }
  | {
      type: "set_field";
      field:
        | "nights"
        | "startDate"
        | "flexMonth"
        | "tier"
        | "pace"
        | "vibes"
        | "adults"
        | "children"
        | "crew"
        | "arrivalTime"
        | "budgetMax"
        | "country";
      value: unknown;
    }
  | { type: "add_night"; city?: string }
  | { type: "remove_night"; city: string }
  | { type: "propose_fix"; fix_id: string; label?: string }
  /** open the experience browser, optionally scoped to a city or day */
  | { type: "open_browser"; city?: string; day?: number }
  | {
      /** filter the experiences list — read-only, applies instantly */
      type: "set_filter";
      city?: string | null;
      vibe?: string | null;
      query?: string | null;
      sort?: "recommended" | "price" | "duration" | null;
    };

export function isMutating(a: UIAction): boolean {
  return (
    a.type === "pin_item" ||
    a.type === "remove_item" ||
    a.type === "swap_item" ||
    a.type === "set_field" ||
    a.type === "add_night" ||
    a.type === "remove_night" ||
    a.type === "propose_fix"
  );
}

const str = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);

/** Defensive parse of whatever the AI returned into known actions. */
export function parseActions(raw: unknown): UIAction[] {
  if (!Array.isArray(raw)) return [];
  const out: UIAction[] = [];
  for (const r of raw.slice(0, 4)) {
    if (!r || typeof r !== "object") continue;
    const a = r as Record<string, unknown>;
    switch (a.type) {
      case "scroll_to":
      case "highlight": {
        const target = str(a.target);
        if (target) out.push({ type: a.type, target });
        break;
      }
      /* select_attraction was the old on/off toggle against a global manual
         mode. There is no such mode now — an AI still using the old verb is
         read as a pin, which is the closest honest equivalent. */
      case "select_attraction":
      case "pin_item": {
        const id = str(a.id);
        if (id) out.push({ type: "pin_item", id, on: a.on !== false });
        break;
      }
      case "remove_item": {
        const id = str(a.id);
        if (id) out.push({ type: "remove_item", id, on: a.on !== false });
        break;
      }
      case "swap_item": {
        const from = str(a.from);
        const to = str(a.to);
        if (from && to) out.push({ type: "swap_item", from, to });
        break;
      }
      case "set_field": {
        const field = str(a.field);
        if (field) {
          out.push({
            type: "set_field",
            field: field as Extract<UIAction, { type: "set_field" }>["field"],
            value: a.value,
          });
        }
        break;
      }
      case "add_night":
        out.push({ type: "add_night", city: str(a.city) });
        break;
      case "remove_night": {
        const city = str(a.city);
        if (city) out.push({ type: "remove_night", city });
        break;
      }
      case "propose_fix": {
        const fixId = str(a.fix_id);
        if (fixId) out.push({ type: "propose_fix", fix_id: fixId, label: str(a.label) });
        break;
      }
      case "open_browser":
        out.push({
          type: "open_browser",
          city: str(a.city),
          day: typeof a.day === "number" ? a.day : undefined,
        });
        break;
      case "goto_step":
        // steps are gone; the nearest intent is "show me the experiences"
        out.push({ type: "open_browser" });
        break;
      case "set_filter":
        out.push({
          type: "set_filter",
          city: str(a.city) ?? null,
          vibe: str(a.vibe) ?? null,
          query: str(a.query) ?? null,
          sort: ["recommended", "price", "duration"].includes(a.sort as string)
            ? (a.sort as "recommended" | "price" | "duration")
            : null,
        });
        break;
    }
  }
  return out;
}
