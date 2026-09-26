import { NextResponse } from "next/server";
import { createGeneration, listGenerations } from "@/lib/server/repository";
import { databaseGuard, readJson, serverError, source } from "@/lib/server/http";
import { clampLimit, validateGeneration } from "@/lib/server/validate";
import type { NewGeneration } from "@/lib/server/types";

/** Reads and writes hit Firestore, so never serve a cached response. */
export const dynamic = "force-dynamic";
/** firebase-admin uses Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

/** GET /api/generations?limit=1..100 → 200 { items, source } */
export async function GET(request: Request) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  try {
    const items = await listGenerations(clampLimit(new URL(request.url).searchParams.get("limit")));
    return NextResponse.json({ items, source: source() });
  } catch (error) {
    return serverError(error, "GET /api/generations");
  }
}

/** POST /api/generations → 201 { item, source } | 400 { error, code } */
export async function POST(request: Request) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  const parsed = await readJson<NewGeneration>(request);
  if (!parsed.ok) return parsed.response;
  const valid = validateGeneration(parsed.body);
  if (!valid.ok) return NextResponse.json({ error: valid.error, code: "invalid_field" }, { status: 400 });

  try {
    const item = await createGeneration(valid.value);
    return NextResponse.json({ item, source: source() }, { status: 201 });
  } catch (error) {
    return serverError(error, "POST /api/generations");
  }
}
