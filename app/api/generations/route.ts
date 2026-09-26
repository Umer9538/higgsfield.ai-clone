import { NextResponse } from "next/server";
import { createGeneration, isFirebaseConfigured, listGenerations } from "@/lib/server/repository";
import type { NewGeneration } from "@/lib/server/types";

/** Reads and writes hit Firestore, so never serve a cached response. */
export const dynamic = "force-dynamic";
/** firebase-admin uses Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? 50);

  try {
    const items = await listGenerations(Number.isFinite(limit) ? limit : 50);
    return NextResponse.json({ items, source: isFirebaseConfigured ? "firestore" : "memory" });
  } catch (error) {
    return NextResponse.json(
      { items: [], source: "error", error: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: Partial<NewGeneration>;
  try {
    body = (await request.json()) as Partial<NewGeneration>;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  if (!body.prompt || !body.model || !body.src) {
    return NextResponse.json(
      { error: "prompt, model and src are required" },
      { status: 400 },
    );
  }

  try {
    const item = await createGeneration({
      prompt: body.prompt,
      model: body.model,
      surface: body.surface ?? "video",
      kind: body.kind ?? "video",
      src: body.src,
      poster: body.poster,
      spec: body.spec ?? "",
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
