/* Lightweight funnel analytics for the planner.
   Batches events to the Django planner-events endpoint; never blocks UI,
   never throws, degrades to console.debug in dev when the API is away. */

import { API_BASE_URL } from "./env";

const DEVICE_KEY = "zuumm_device_id";
const EVENTS_PATH = "/api/trips/v1/events/";
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

function payload(events: Ev[]) {
  return JSON.stringify({ events, device_id: deviceId() });
}

function flush(useBeacon = false) {
  if (!queue.length || typeof window === "undefined") return;
  const batch = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);
  const url = `${API_BASE_URL}${EVENTS_PATH}`;
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload(batch)], { type: "application/json" }));
      return;
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload(batch),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the product */
  }
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
