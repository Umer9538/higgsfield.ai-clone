import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firestore needs at least a project id and an API key to do anything useful.
 * Without them the app falls back to an in-memory store, so builds, CI and a
 * fresh clone all work with no credentials.
 */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

/**
 * Cached on globalThis: Next.js hot reload re-evaluates modules, and calling
 * initializeApp twice for the same name throws.
 */
const globalForFirebase = globalThis as unknown as {
  __hfFirebaseApp?: FirebaseApp;
  __hfFirestore?: Firestore;
};

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (globalForFirebase.__hfFirebaseApp) return globalForFirebase.__hfFirebaseApp;

  const app = getApps().length ? getApp() : initializeApp(config);
  globalForFirebase.__hfFirebaseApp = app;
  return app;
}

export function getDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (globalForFirebase.__hfFirestore) return globalForFirebase.__hfFirestore;

  const app = getFirebaseApp();
  if (!app) return null;

  const db = getFirestore(app);
  globalForFirebase.__hfFirestore = db;
  return db;
}

/** Named export kept for convenience; null when Firebase is not configured. */
export const db = getDb();
