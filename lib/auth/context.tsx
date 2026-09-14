"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export interface AuthUser {
  email: string;
  handle: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string) => AuthUser;
  signOut: () => void;
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

function getSnapshot(): AuthUser | null {
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
    // Blocked storage: the change still propagates for this tab via the event.
    cachedRaw = user ? JSON.stringify(user) : null;
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

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
