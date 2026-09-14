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

export function getGeneratedSnapshot(): Asset[] {
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

export function addGeneratedAsset(input: {
  kind: AssetKind;
  model: string;
  prompt: string;
  src: string;
  poster?: string;
  spec: string;
}): void {
  const asset: Asset = {
    id: `gen-${Date.now()}`,
    title: `${input.kind === "video" ? "Generation" : "Render"} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    kind: input.kind,
    model: input.model,
    prompt: input.prompt || "Untitled generation",
    createdAt: new Date().toISOString().slice(0, 10),
    src: input.src,
    poster: input.poster,
    meta: input.spec,
  };

  const next = [asset, ...getGeneratedSnapshot()].slice(0, 60);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Blocked storage: keep it in memory so this session still shows it.
    cachedRaw = JSON.stringify(next);
    cachedList = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearGeneratedAssets(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    cachedRaw = null;
    cachedList = EMPTY;
  }
  window.dispatchEvent(new Event(EVENT));
}
