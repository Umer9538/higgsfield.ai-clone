import { NextResponse } from "next/server";
import { listFavorites, removeFavorite, toggleFavorite } from "@/lib/server/repository";
import { databaseGuard, fail, readJson, serverError, source } from "@/lib/server/http";
import { OWNER, validateFavorite } from "@/lib/server/validate";
import type { NewFavorite } from "@/lib/server/types";

export const dynamic = "force-dynamic";
/** firebase-admin uses Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

/** GET /api/favorites?owner=… → 200 { items, source } */
export async function GET(request: Request) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  const owner = new URL(request.url).searchParams.get("owner") ?? undefined;
  if (owner && !OWNER.test(owner)) return fail(400, "invalid_owner", "owner is malformed");
  try {
    const items = await listFavorites(owner);
    return NextResponse.json({ items, source: source() });
  } catch (error) {
    return serverError(error, "GET /api/favorites");
  }
}

/** POST /api/favorites toggles: 201 { item, removed: false } when added, 200 { item, removed: true } when removed */
export async function POST(request: Request) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  const parsed = await readJson<NewFavorite>(request);
  if (!parsed.ok) return parsed.response;
  const valid = validateFavorite(parsed.body);
  if (!valid.ok) return NextResponse.json({ error: valid.error, code: "invalid_field" }, { status: 400 });

  try {
    const { item, removed } = await toggleFavorite(valid.value);
    return NextResponse.json({ item, removed, source: source() }, { status: removed ? 200 : 201 });
  } catch (error) {
    return serverError(error, "POST /api/favorites");
  }
}

/** DELETE /api/favorites?owner=…&itemId=… → 204, idempotent */
export async function DELETE(request: Request) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  const params = new URL(request.url).searchParams;
  const owner = params.get("owner");
  const itemId = params.get("itemId");
  if (!owner || !OWNER.test(owner)) return fail(400, "invalid_owner", "owner is required");
  if (!itemId) return fail(400, "invalid_field", "itemId is required");
  try {
    await removeFavorite(owner, itemId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return serverError(error, "DELETE /api/favorites");
  }
}
