"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/auth/context";

/**
 * Who is acting, for records the backend keeps per owner (favourites, the
 * right to delete a generation): "user:<handle>" when signed in, otherwise a
 * random id for this browser, "device:<uuid>", kept in localStorage.
 */
const DEVICE_KEY = "hf.device";
let cachedDevice: string | null = null;

function deviceId(): string {
  if (cachedDevice) return cachedDevice;
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    cachedDevice = id;
  } catch {
    // Blocked storage: stable for this tab only
    cachedDevice = crypto.randomUUID();
  }
  return cachedDevice;
}

/** Same character set the API accepts */
const clean = (handle: string) => handle.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 64);

const noopSubscribe = () => () => {};

/** null during server render and hydration; the owner string after. */
export function useOwner(): string | null {
  const { user } = useAuth();
  const device = useSyncExternalStore(noopSubscribe, deviceId, () => null);
  if (user) return `user:${clean(user.handle)}`;
  return device ? `device:${device}` : null;
}

/**
 * Every identity this browser can act as: the signed-in user and the device.
 * A generation made signed-out is owned by the device; after signing in it is
 * still yours to delete, so deletes offer both.
 */
export function useOwners(): string[] {
  const { user } = useAuth();
  const device = useSyncExternalStore(noopSubscribe, deviceId, () => null);
  return [user ? `user:${clean(user.handle)}` : null, device ? `device:${device}` : null].filter(
    (owner): owner is string => owner !== null,
  );
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * SHA-256 of each identity in useOwners(). The API publishes only owner
 * hashes (the raw id is what authorises a delete), so this is how the
 * library recognises what is yours.
 */
export function useOwnerHashes(): Set<string> {
  const owners = useOwners();
  const key = owners.join("|");
  const [hashes, setHashes] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    let cancelled = false;
    void Promise.all(key ? key.split("|").map(sha256) : []).then((list) => {
      if (!cancelled) setHashes(new Set(list));
    });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return hashes;
}

