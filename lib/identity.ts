"use client";

import { useSyncExternalStore } from "react";
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
