"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export interface AuthUser {
  email: string;
  handle: string;
  /** Set from the profile page; the handle is shown until then */
  displayName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string) => AuthUser;
  signOut: () => void;
  updateProfile: (patch: Pick<AuthUser, "displayName">) => void;
}

const STORAGE_KEY = "hf.auth";
const EVENT = "hf-auth-change";

/**
 * localStorage-backed store read through useSyncExternalStore, so the server
 * renders signed out and the client reconciles without setting state in an
 * effect. Snapshots are cached by raw string: getSnapshot must return a
 * stable reference or React re-renders forever.
 */
let cachedRaw: string | null = null;
let cachedUser: AuthUser | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Set when storage writes fail; then memory is the truth for this tab. */
let memoryOnly = false;

function getSnapshot(): AuthUser | null {
  if (memoryOnly) return cachedUser;
  const raw = readRaw();
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function write(user: AuthUser | null) {
  try {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Blocked storage: keep it in memory so sign-in still works in this tab.
    // (Setting cachedRaw alone did not: the next read found storage empty and
    // reset the user to null.)
    memoryOnly = true;
    cachedUser = user;
  }
  window.dispatchEvent(new Event(EVENT));
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mock auth. Nothing is verified and no route is gated — signing in only
 * changes the header chrome and unlocks personalisation.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const signIn = useCallback((email: string) => {
    const handle = (email.split("@")[0] || "creator").toLowerCase();
    const next = { email, handle };
    write(next);
    return next;
  }, []);

  const signOut = useCallback(() => write(null), []);

  const updateProfile = useCallback(
    (patch: Pick<AuthUser, "displayName">) => {
      const current = getSnapshot();
      if (!current) return;
      const displayName = patch.displayName?.trim();
      write({ ...current, displayName: displayName || undefined });
    },
    [],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut, updateProfile }),
    [user, signIn, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
