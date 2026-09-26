"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useOwner } from "@/lib/identity";

/**
 * Favourites live in the backend only: there is deliberately no local copy,
 * so a heart that is still filled after a reload came from Firestore.
 *
 * - Hydrates once per owner from GET /api/favorites. If that fails, the store
 *   stays not-ready (hearts disabled) and retries, rather than looking ready
 *   and empty, in which state a click would have removed a saved favourite.
 * - A click sends the state the user wants ({ favorite: true|false }), which
 *   the API applies idempotently, so double-clicks and retries cannot flip it.
 * - Each item settles or rolls back on its own, and only for the owner it was
 *   sent for, so a slow failure cannot undo a newer success or leak across a
 *   sign-in.
 */
interface State {
  owner: string | null;
  loaded: boolean;
  /** itemId → title */
  items: Map<string, string>;
  /** itemIds with a request in flight */
  pending: Set<string>;
}

const initial = (owner: string | null): State => ({ owner, loaded: false, items: new Map(), pending: new Set() });
let state: State = initial(null);
const SERVER: State = initial(null);
const listeners = new Set<() => void>();
const set = (next: State) => {
  state = next;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let inflight: string | null = null;
const RETRY_MS = 4000;

async function hydrate(owner: string) {
  if ((state.owner === owner && state.loaded) || inflight === owner) return;
  inflight = owner;
  if (state.owner !== owner) set(initial(owner));
  try {
    const response = await fetch(`/api/favorites?owner=${encodeURIComponent(owner)}`);
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as { items: { itemId: string; title: string }[] };
    // Only into a store still waiting for this owner: a duplicate response
    // must not overwrite clicks made since the first one landed
    if (state.owner === owner && !state.loaded) {
      set({ ...state, loaded: true, items: new Map(data.items.map((f) => [f.itemId, f.title])) });
    }
  } catch {
    // Stay not-ready and try again; the hearts remain disabled meanwhile
    window.setTimeout(() => {
      if (state.owner === owner && !state.loaded) void hydrate(owner);
    }, RETRY_MS);
  } finally {
    // Only clear our own marker: an owner switch may have started another
    if (inflight === owner) inflight = null;
  }
}

const withItem = (items: Map<string, string>, itemId: string, title: string | null) => {
  const next = new Map(items);
  if (title === null) next.delete(itemId);
  else next.set(itemId, title);
  return next;
};
const withPending = (pending: Set<string>, itemId: string, on: boolean) => {
  const next = new Set(pending);
  if (on) next.add(itemId);
  else next.delete(itemId);
  return next;
};

/** Returns whether the item is a favourite afterwards, or null if the save failed. */
async function setFavorite(owner: string, itemId: string, title: string, favorite: boolean): Promise<boolean | null> {
  if (state.owner !== owner || !state.loaded || state.pending.has(itemId)) return null;
  const previous = state.items.get(itemId) ?? null;
  set({
    ...state,
    items: withItem(state.items, itemId, favorite ? title : null),
    pending: withPending(state.pending, itemId, true),
  });

  let result: boolean | null = null;
  try {
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, title, owner, favorite }),
    });
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as { removed: boolean };
    result = !data.removed;
  } catch {
    result = null;
  }

  // Settle this item only, and only if we are still the same owner
  if (state.owner === owner) {
    const settledTitle = result === null ? previous : result ? title : null;
    set({
      ...state,
      items: withItem(state.items, itemId, settledTitle),
      pending: withPending(state.pending, itemId, false),
    });
  }
  return result;
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
    isPending: useCallback((itemId: string) => snapshot.pending.has(itemId), [snapshot]),
    toggle: useCallback(
      (itemId: string, title: string) =>
        owner ? setFavorite(owner, itemId, title, !state.items.has(itemId)) : Promise.resolve(null),
      [owner],
    ),
  };
}
