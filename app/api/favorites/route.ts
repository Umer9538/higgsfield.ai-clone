import { NextResponse } from "next/server";
import { listFavorites, removeFavorite, setFavorite, toggleFavorite } from "@/lib/server/repository";
import { databaseGuard, fail, readJson, serverError, source } from "@/lib/server/http";
import { ITEM_ID, OWNER, validateFavorite } from "@/lib/server/validate";
import type { NewFavorite } from "@/lib/server/types";

export const dynamic = "force-dynamic";
/** firebase-admin uses Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

/**
 * GET /api/favorites?owner=… → 200 { items, source }
 * owner is required: without it this returned every owner's favourites
 * (handles included) as an unbounded full-collection read.
 */
export async function GET(request: Request) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  const owner = new URL(request.url).searchParams.get("owner");
  if (!owner || !OWNER.test(owner)) return fail(400, "invalid_owner", "owner is required");
  try {
    const items = await listFavorites(owner);
    return NextResponse.json({ items, source: source() });
  } catch (error) {
    return serverError(error, "GET /api/favorites");
  }
}

/**
 * POST /api/favorites
 *   { itemId, title?, owner?, favorite?: boolean }
 * With `favorite`, sets that state idempotently (what the app sends, so a
 * retry or double-click cannot flip it the wrong way). Without it, toggles,
 * as the original contract did. Either way: 201 { item, removed: false }
 * when it is now a favourite, 200 { item, removed: true } when it is not.
 */
export async function POST(request: Request) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  const parsed = await readJson<NewFavorite>(request);
  if (!parsed.ok) return parsed.response;
  const valid = validateFavorite(parsed.body);
  if (!valid.ok) return NextResponse.json({ error: valid.error, code: "invalid_field" }, { status: 400 });

  try {
    const desired = (parsed.body as { favorite?: unknown }).favorite;
    if (desired !== undefined && typeof desired !== "boolean") {
      return fail(400, "invalid_field", "favorite must be true or false");
    }
    const { item, removed } =
      typeof desired === "boolean" ? await setFavorite(valid.value, desired) : await toggleFavorite(valid.value);
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
  if (!itemId || !ITEM_ID.test(itemId)) return fail(400, "invalid_field", "itemId is required");
  try {
    await removeFavorite(owner, itemId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return serverError(error, "DELETE /api/favorites");
  }
}
