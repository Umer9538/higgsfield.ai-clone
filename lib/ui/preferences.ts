"use client";

import { useSyncExternalStore } from "react";

/**
 * Per-viewer preferences, persisted in localStorage and read through
 * useSyncExternalStore (the server renders the defaults).
 */
export interface Preferences {
  /** Forces the app's reduced-motion mode even if the OS does not ask for it */
  reducedMotion: boolean;
  /** Stops feed videos autoplaying (WCAG 2.2.2: moving content can be paused) */
  pauseVideo: boolean;
}

const KEY = "hf.prefs";
const EVENT = "hf-prefs-change";
const DEFAULTS: Preferences = { reducedMotion: false, pauseVideo: false };

let cachedRaw: string | null | undefined;
let cached: Preferences = DEFAULTS;

function read(): Preferences {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // blocked storage: defaults
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULTS;
  } catch {
    cached = DEFAULTS;
  }
  return cached;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  const next = { ...read(), [key]: value };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cachedRaw = JSON.stringify(next);
    cached = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

/**
 * True when motion should be avoided: the OS asks for it, or the viewer
 * turned it on in Settings. For JS-driven motion (smooth scroll, JS springs)
 * that the global CSS rule cannot reach.
 */
export function prefersReducedMotion(): boolean {
  return (
    document.documentElement.classList.contains("reduce-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
