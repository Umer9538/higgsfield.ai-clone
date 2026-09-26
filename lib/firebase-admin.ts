import "server-only";
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Server-side Firestore via a service account. These variables are secrets:
 * they have no NEXT_PUBLIC_ prefix, so they never reach the browser bundle,
 * and `server-only` makes importing this module from client code a build error.
 */
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Hosting dashboards store the key on one line with literal "\n" sequences.
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

/** All three are required; with any missing, the repository uses memory. */
export const isFirebaseConfigured = Boolean(projectId && clientEmail && privateKey);

/** Names (never values) of the variables that are not set. */
export const missingFirebaseEnv = [
  ["FIREBASE_PROJECT_ID", projectId],
  ["FIREBASE_CLIENT_EMAIL", clientEmail],
  ["FIREBASE_PRIVATE_KEY", privateKey],
]
  .filter(([, value]) => !value)
  .map(([name]) => name as string);

/**
 * The live deployment must never fall back to memory: a write would answer
 * 201 and then vanish on the next cold start. There, a missing credential
 * makes the API refuse with 503 instead. Local dev, CI and preview builds
 * keep the in-memory fallback so they run without secrets.
 */
export const requiresDatabase = process.env.VERCEL_ENV === "production";

if (!isFirebaseConfigured && !requiresDatabase) {
  console.warn(
    `[firebase] ${missingFirebaseEnv.join(", ")} not set — using the in-memory store. ` +
      "Data lasts until the server restarts. See .env.example.",
  );
}

/**
 * Cached on globalThis: Next.js hot reload re-evaluates modules, and a second
 * initializeApp for the default app throws.
 */
const globalForAdmin = globalThis as unknown as {
  __hfAdminApp?: App;
  __hfAdminDb?: Firestore;
};

function getAdminApp(): App | null {
  if (!isFirebaseConfigured) return null;
  if (globalForAdmin.__hfAdminApp) return globalForAdmin.__hfAdminApp;

  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });

  globalForAdmin.__hfAdminApp = app;
  return app;
}

export function getAdminDb(): Firestore | null {
  if (globalForAdmin.__hfAdminDb) return globalForAdmin.__hfAdminDb;

  const app = getAdminApp();
  if (!app) return null;

  const db = getFirestore(app);
  globalForAdmin.__hfAdminDb = db;
  return db;
}
