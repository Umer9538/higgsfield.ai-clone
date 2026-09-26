import { NextResponse } from "next/server";
import { isFirebaseConfigured, missingFirebaseEnv, requiresDatabase } from "@/lib/firebase-admin";
import { pingDatabase } from "@/lib/server/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health: which store is live, and proof it answers. Variable names
 * that are missing are listed; values never are.
 *   200 ok        Firestore configured and reachable (or memory outside production)
 *   503 degraded  production without a database, or Firestore unreachable
 */
export async function GET() {
  if (!isFirebaseConfigured) {
    return NextResponse.json(
      {
        status: requiresDatabase ? "degraded" : "ok",
        database: "memory",
        durable: false,
        missing: missingFirebaseEnv,
      },
      { status: requiresDatabase ? 503 : 200 },
    );
  }
  try {
    const { latencyMs } = await pingDatabase();
    return NextResponse.json({ status: "ok", database: "firestore", durable: true, latencyMs });
  } catch (error) {
    console.error("[api] health: Firestore unreachable:", error);
    return NextResponse.json({ status: "degraded", database: "firestore", durable: true, reachable: false }, { status: 503 });
  }
}
