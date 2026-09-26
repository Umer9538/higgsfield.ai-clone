"use client";

import { useSyncExternalStore } from "react";

/**
 * What the active studio exposes to global tools (the ⌘K palette and the
 * performance HUD), which live outside the studio's React tree. The studio
 * registers itself on mount and clears on unmount; readers subscribe.
 */
export interface StudioContext {
  surfaceId: string;
  label: string;
  /** The prompt as currently typed */
  prompt: () => string;
  /** Everything that would describe this generation, as plain JSON */
  metadata: () => Record<string, unknown>;
  /** One-step looks that set several parameters at once */
  looks: { name: string; apply: () => void }[];
}

let current: StudioContext | null = null;
const listeners = new Set<() => void>();

export function setStudioContext(next: StudioContext | null) {
  current = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useStudioContext(): StudioContext | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
