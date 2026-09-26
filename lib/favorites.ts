"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useOwner } from "@/lib/identity";

/**
 * Favourites live in the backend only: there is deliberately no local copy,
 * so a heart that is still filled after a reload came from Firestore. The
 * store hydrates once per owner from GET /api/favorites, flips optimistically
 * on toggle, reconciles with the server's answer, and rolls back on failure.
 */
interface State {
  owner: string | null;
  loaded: boolean;
  /** itemId → title */
  items: Map<string, string>;
}

let state: State = { owner: null, loaded: false, items: new Map() };
const listeners = new Set<() => void>();
const set = (next: State) => {
  state = next;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const SERVER: State = { owner: null, loaded: false, items: new Map() };

let inflight: string | null = null;
async function hydrate(owner: string) {
  if (state.owner === owner && state.loaded) return;
  if (inflight === owner) return;
  inflight = owner;
  set({ owner, loaded: false, items: new Map() });
  try {
    const response = await fetch(`/api/favorites?owner=${encodeURIComponent(owner)}`);
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as { items: { itemId: string; title: string }[] };
    if (state.owner === owner) set({ owner, loaded: true, items: new Map(data.items.map((f) => [f.itemId, f.title])) });
  } catch {
    // Backend unreachable: hearts stay empty, and toggling will say so
    if (state.owner === owner) set({ owner, loaded: true, items: new Map() });
  } finally {
    inflight = null;
  }
}

/** Returns whether the item is a favourite afterwards, or null if the save failed. */
async function toggle(owner: string, itemId: string, title: string): Promise<boolean | null> {
  const before = state.items;
  const optimistic = new Map(before);
  if (optimistic.has(itemId)) optimistic.delete(itemId);
  else optimistic.set(itemId, title);
  set({ ...state, items: optimistic });

  try {
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, title, owner }),
    });
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as { removed: boolean };
    // The server's answer wins, e.g. after a toggle from another tab
    const settled = new Map(state.items);
    if (data.removed) settled.delete(itemId);
    else settled.set(itemId, title);
    set({ ...state, items: settled });
    return !data.removed;
  } catch {
    set({ ...state, items: before });
    return null;
  }
}

export function useFavorites() {
  const owner = useOwner();
  const snapshot = useSyncExternalStore(subscribe, () => state, () => SERVER);

  useEffect(() => {
    if (owner) void hydrate(owner);
  }, [owner]);

  const ready = snapshot.owner === owner && snapshot.loaded;
  return {
    ready,
    count: ready ? snapshot.items.size : 0,
    items: ready ? [...snapshot.items].map(([itemId, title]) => ({ itemId, title })) : [],
    isFavorite: useCallback((itemId: string) => ready && snapshot.items.has(itemId), [ready, snapshot]),
    toggle: useCallback(
      (itemId: string, title: string) => (owner ? toggle(owner, itemId, title) : Promise.resolve(null)),
      [owner],
    ),
  };
}
