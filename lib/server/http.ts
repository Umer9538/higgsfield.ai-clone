import "server-only";
import { NextResponse } from "next/server";
import { isFirebaseConfigured, missingFirebaseEnv, requiresDatabase } from "@/lib/firebase-admin";

/**
 * One response shape for every route. Success bodies are unchanged from the
 * original contract ({ item | items, source, … }); errors are always
 * { error: string, code: string } with a matching status.
 */
export const source = () => (isFirebaseConfigured ? "firestore" : "memory");

export function fail(status: number, code: string, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, code, ...extra }, { status });
}

/**
 * 500 without leaking internals: the client gets a reference, the server log
 * gets the cause. The original routes returned raw exception messages.
 */
export function serverError(error: unknown, where: string) {
  const ref = Math.random().toString(36).slice(2, 10);
  console.error(`[api] ${where} failed (ref ${ref}):`, error);
  return fail(500, "internal", "Something went wrong on our side. Try again.", { ref });
}

/** In production with no database, refuse rather than accept writes that will be lost. */
export function databaseGuard() {
  if (requiresDatabase && !isFirebaseConfigured) {
    return fail(503, "database_unconfigured", "The database is not configured on this deployment.", {
      missing: missingFirebaseEnv,
    });
  }
  return null;
}

export async function readJson<T>(request: Request): Promise<{ ok: true; body: Partial<T> } | { ok: false; response: NextResponse }> {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, response: fail(400, "invalid_body", "Body must be a JSON object") };
    }
    return { ok: true, body: body as Partial<T> };
  } catch {
    return { ok: false, response: fail(400, "invalid_body", "Body must be JSON") };
  }
}
