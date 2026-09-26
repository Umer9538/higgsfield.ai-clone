"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useToast } from "@/components/ui/Toast";
import { ASSETS, type Asset } from "@/lib/assets/content";
import { identity, readHidden, saveHidden, toAsset, type RemoteGeneration } from "@/lib/assets/library";
import {
  getGeneratedServerSnapshot,
  getGeneratedSnapshot,
  removeGeneratedAsset,
  subscribeGenerated,
} from "@/lib/assets/store";
import { useOwnerHashes, useOwners } from "@/lib/identity";

/**
 * The library's data: generations made on this device, generations synced
 * from the backend, the demo samples, and what the viewer has hidden, merged
 * into one de-duplicated list. Views filter and sort it; this owns fetching,
 * merging and deleting.
 */
export function useAssetLibrary() {
  const { toast } = useToast();
  const owners = useOwners();
  const ownerHashes = useOwnerHashes();

  // Generations made in the workspace appear here immediately, newest first.
  const generated = useSyncExternalStore(subscribeGenerated, getGeneratedSnapshot, getGeneratedServerSnapshot);

  // Items you cannot delete (samples, other people's shared work) are hidden
  // for you instead, and that sticks across reloads.
  const [hidden, setHidden] = useState<string[]>([]);

  // Anything persisted by the backend, including from another device.
  // Fetched items wait in `pending` until the user merges them: inserting them
  // after first paint pushed the whole grid down (measured CLS 0.366).
  const [remote, setRemote] = useState<Asset[]>([]);
  const [pending, setPending] = useState<Asset[]>([]);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Restoring a per-viewer list from storage, once, on the client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(readHidden());

    fetch("/api/generations?limit=50")
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data: { items?: RemoteGeneration[]; source?: string }) => {
        if (cancelled) return;
        setSource(data.source ?? null);
        setPending((data.items ?? []).map(toAsset));
      })
      .catch(() => {
        // Backend unavailable: the local store still renders.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const shownKeys = useMemo(() => new Set([...generated, ...remote].map(identity)), [generated, remote]);
  const freshPending = pending.filter((asset) => !shownKeys.has(identity(asset)) && !hidden.includes(identity(asset)));

  /** Everything in the library, once each, minus what the viewer hid. */
  const library = useMemo(() => {
    // De-duplicate: a generation made in this tab is in both stores.
    const seen = new Set<string>();
    return [...generated, ...remote, ...ASSETS].filter((asset) => {
      const key = identity(asset);
      if (seen.has(key) || hidden.includes(key)) return false;
      seen.add(key);
      return true;
    });
  }, [generated, remote, hidden]);

  /** Merge the synced generations waiting behind the pill; returns how many. */
  const showPending = () => {
    const count = freshPending.length;
    setRemote((prev) => [...freshPending, ...prev]);
    setPending([]);
    return count;
  };

  /**
   * Delete for real where we can: your own synced generation is deleted in
   * the backend (DELETE /api/generations/:id) and locally; a local-only one
   * is removed from this device. Samples and other people's shared work
   * cannot be deleted, so they are hidden for you, and the toast says which.
   */
  const remove = async (asset: Asset) => {
    const key = identity(asset);
    const local = generated.find((item) => item.id === asset.id || (asset.remoteId && item.remoteId === asset.remoteId));
    // Yours if the local copy records one of your ids, or the shared copy's
    // owner hash matches one of yours (the API never reveals raw owner ids)
    const localOwner = local?.owner;
    const mine = Boolean(
      asset.remoteId &&
        ((localOwner && owners.includes(localOwner)) || (asset.ownerHash && ownerHashes.has(asset.ownerHash))),
    );

    if (mine) {
      const query = owners.map((owner) => `owner=${encodeURIComponent(owner)}`).join("&");
      const response = await fetch(`/api/generations/${encodeURIComponent(asset.remoteId!)}?${query}`, {
        method: "DELETE",
      }).catch(() => null);
      // 404 means it is already gone, which is the goal
      if (!response || (!response.ok && response.status !== 404)) {
        toast("Couldn't delete it — check your connection and try again", "info");
        return;
      }
      setRemote((prev) => prev.filter((item) => identity(item) !== key));
      setPending((prev) => prev.filter((item) => identity(item) !== key));
    }
    if (local) removeGeneratedAsset(local.id);

    if (mine) {
      toast("Deleted everywhere");
      return;
    }
    // A local copy of something whose shared copy we cannot delete: remove
    // it here and hide the shared one, or the sync pill brings it straight back
    if (local && !asset.remoteId) {
      toast("Deleted from this device");
      return;
    }
    const next = [...hidden, key];
    setHidden(next);
    saveHidden(next);
    toast(asset.remoteId ? "Hidden — only its creator can delete it" : "Removed from your library", "info");
  };

  return { library, freshPending, source, showPending, remove };
}
