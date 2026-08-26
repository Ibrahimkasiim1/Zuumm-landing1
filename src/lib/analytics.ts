/* Funnel analytics, stubbed for the static landing build. The full
   product batches these events to the Django planner-events endpoint;
   this build keeps the same call sites and drops everything, so no
   request ever leaves the page. */

const DEVICE_KEY = "zuumm_device_id";
const FLUSH_MS = 4000;
const MAX_BATCH = 40;

export function deviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

type Ev = { name: string; props: Record<string, unknown>; ts: string; trip_id?: string };

let queue: Ev[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let bound = false;

function flush(_useBeacon = false) {
  if (!queue.length || typeof window === "undefined") return;
  queue = queue.slice(MAX_BATCH);
}

export function track(name: string, props: Record<string, unknown> = {}, tripId?: string) {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    console.debug("[track]", name, props);
  }
  queue.push({ name, props, ts: new Date().toISOString(), trip_id: tripId });
  if (!bound) {
    bound = true;
    window.addEventListener("pagehide", () => flush(true));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true);
    });
  }
  if (queue.length >= MAX_BATCH) flush();
  else if (!timer) {
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, FLUSH_MS);
  }
}
