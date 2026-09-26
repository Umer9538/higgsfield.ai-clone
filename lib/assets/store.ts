"use client";

import type { Asset, AssetKind } from "./content";

const KEY = "hf.generatedAssets";
const EVENT = "hf-assets-change";

/**
 * localStorage-backed list of generations, read through useSyncExternalStore.
 * Snapshots are cached by raw string so getSnapshot returns a stable reference.
 */
let cachedRaw: string | null = null;
let cachedList: Asset[] = [];

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/*
 * Set once a write to localStorage fails (site data blocked). From then on
 * the in-memory list is the source of truth for this tab: re-reading storage
 * would return nothing and discard it, which is what the first version did.
 */
let memoryOnly = false;

export function getGeneratedSnapshot(): Asset[] {
  if (memoryOnly) return cachedList;
  const raw = readRaw();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    cachedList = raw ? (JSON.parse(raw) as Asset[]) : [];
  } catch {
    cachedList = [];
  }
  return cachedList;
}

export function getGeneratedServerSnapshot(): Asset[] {
  return EMPTY;
}

const EMPTY: Asset[] = [];

export function subscribeGenerated(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function write(next: Asset[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Blocked storage: keep it in memory so this session still shows it.
    memoryOnly = true;
    cachedList = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Adds a generation locally and returns its local id. */
export function addGeneratedAsset(input: {
  kind: AssetKind;
  model: string;
  prompt: string;
  src: string;
  poster?: string;
  spec: string;
  owner?: string;
}): string {
  const asset: Asset = {
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    owner: input.owner,
    title: `${input.kind === "video" ? "Generation" : "Render"} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    kind: input.kind,
    model: input.model,
    prompt: input.prompt || "Untitled generation",
    createdAt: new Date().toISOString().slice(0, 10),
    src: input.src,
    poster: input.poster,
    meta: input.spec,
  };

  write([asset, ...getGeneratedSnapshot()].slice(0, 60));
  return asset.id;
}

/**
 * Records the backend's id for a local generation, so the library knows the
 * two are one record (it used to match on kind + prompt + day, which merged
 * two same-prompt generations into one).
 */
export function linkRemoteId(localId: string, remoteId: string): void {
  write(getGeneratedSnapshot().map((asset) => (asset.id === localId ? { ...asset, remoteId } : asset)));
}

export function removeGeneratedAsset(id: string): void {
  write(getGeneratedSnapshot().filter((asset) => asset.id !== id && asset.remoteId !== id));
}

export function clearGeneratedAssets(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    memoryOnly = true;
    cachedList = EMPTY;
  }
  window.dispatchEvent(new Event(EVENT));
}
