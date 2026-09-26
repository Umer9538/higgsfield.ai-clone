import type { Asset, AssetKind } from "./content";

/**
 * Pure helpers for the asset library: the backend's record shape, how it maps
 * onto the card model, how one record is identified across stores, and the
 * per-viewer list of hidden items.
 */
export interface RemoteGeneration {
  id: string;
  prompt: string;
  model: string;
  kind: AssetKind;
  src: string;
  poster?: string | null;
  spec: string;
  createdAt: string;
  ownerHash?: string | null;
}

/** Shape a stored generation into the card model the library renders. */
export function toAsset(item: RemoteGeneration): Asset {
  return {
    id: item.id,
    title: `${item.kind === "video" ? "Generation" : "Render"} ${item.createdAt.slice(11, 16)}`,
    kind: item.kind,
    model: item.model,
    prompt: item.prompt,
    createdAt: item.createdAt.slice(0, 10),
    src: item.src,
    poster: item.poster ?? undefined,
    meta: item.spec,
    remoteId: item.id,
    ownerHash: item.ownerHash ?? undefined,
  };
}

/** One record, however many stores it appears in: the backend id when known. */
export const identity = (asset: Asset) => asset.remoteId ?? asset.id;

const HIDDEN_KEY = "hf.hiddenAssets";
export function readHidden(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(HIDDEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function saveHidden(ids: string[]): void {
  try {
    window.localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  } catch {
    // blocked storage: hidden for this visit
  }
}
