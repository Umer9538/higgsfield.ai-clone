import { NextResponse } from "next/server";
import { createFavorite, isFirebaseConfigured, listFavorites } from "@/lib/server/repository";
import type { NewFavorite } from "@/lib/server/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get("owner") ?? undefined;

  try {
    const items = await listFavorites(owner);
    return NextResponse.json({ items, source: isFirebaseConfigured ? "firestore" : "memory" });
  } catch (error) {
    return NextResponse.json(
      { items: [], source: "error", error: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: Partial<NewFavorite>;
  try {
    body = (await request.json()) as Partial<NewFavorite>;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  if (!body.itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  try {
    const item = await createFavorite({
      itemId: body.itemId,
      title: body.title ?? body.itemId,
      owner: body.owner ?? "anonymous",
    });
    return NextResponse.json(
      { item, source: isFirebaseConfigured ? "firestore" : "memory" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
