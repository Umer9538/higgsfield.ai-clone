import "server-only";
import { getAdminDb, isFirebaseConfigured } from "@/lib/firebase-admin";
import type { FavoriteRecord, GenerationRecord, NewFavorite, NewGeneration } from "./types";

/**
 * Firestore (via firebase-admin) with an in-memory fallback.
 *
 * Both paths implement the same behaviour, so routes, tests and builds act
 * identically with or without credentials. Only durability differs.
 */
const memory = globalThis as unknown as {
  __hfGenerations?: GenerationRecord[];
  __hfFavorites?: FavoriteRecord[];
};

memory.__hfGenerations ??= [];
memory.__hfFavorites ??= [];

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * One favourite per owner per item. A deterministic id makes POST a toggle
 * without a lookup query, and keeps the two stores in step: the client-SDK
 * version appended duplicates in Firestore while memory toggled.
 */
function favoriteId(owner: string, itemId: string) {
  return `${owner}__${itemId}`.replace(/[/\s]/g, "_");
}

/* -------------------------------- generations ------------------------------- */

export async function listGenerations(max = 50): Promise<GenerationRecord[]> {
  const db = getAdminDb();
  if (!db) return memory.__hfGenerations!.slice(0, max);

  const snapshot = await db
    .collection("generations")
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<GenerationRecord, "id">) }));
}

export async function createGeneration(input: NewGeneration): Promise<GenerationRecord> {
  const createdAt = new Date().toISOString();
  const db = getAdminDb();

  if (!db) {
    const record: GenerationRecord = { ...input, id: newId("gen"), createdAt };
    memory.__hfGenerations!.unshift(record);
    memory.__hfGenerations = memory.__hfGenerations!.slice(0, 200);
    return record;
  }

  // Firestore rejects undefined values, so optional fields become null.
  const ref = await db.collection("generations").add({
    prompt: input.prompt,
    model: input.model,
    surface: input.surface,
    kind: input.kind,
    src: input.src,
    poster: input.poster ?? null,
    spec: input.spec,
    createdAt,
  });

  return { ...input, id: ref.id, createdAt };
}

/* --------------------------------- favorites -------------------------------- */

export async function listFavorites(owner?: string): Promise<FavoriteRecord[]> {
  const db = getAdminDb();
  if (!db) {
    const all = memory.__hfFavorites!;
    return owner ? all.filter((item) => item.owner === owner) : all;
  }

  // Filter in Firestore, sort here. where(owner) + orderBy(createdAt) on
  // different fields needs a composite index, and without one the query
  // fails with FAILED_PRECONDITION on a freshly created project.
  const base = db.collection("favorites");
  const snapshot = owner ? await base.where("owner", "==", owner).get() : await base.get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<FavoriteRecord, "id">) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface ToggleResult {
  item: FavoriteRecord;
  removed: boolean;
}

export async function toggleFavorite(input: NewFavorite): Promise<ToggleResult> {
  const id = favoriteId(input.owner, input.itemId);
  const record: FavoriteRecord = { ...input, id, createdAt: new Date().toISOString() };
  const db = getAdminDb();

  if (!db) {
    const index = memory.__hfFavorites!.findIndex((item) => item.id === id);
    if (index >= 0) {
      memory.__hfFavorites!.splice(index, 1);
      return { item: record, removed: true };
    }
    memory.__hfFavorites!.unshift(record);
    return { item: record, removed: false };
  }

  const ref = db.collection("favorites").doc(id);
  const existing = await ref.get();
  if (existing.exists) {
    await ref.delete();
    return { item: record, removed: true };
  }

  await ref.set({
    itemId: record.itemId,
    title: record.title,
    owner: record.owner,
    createdAt: record.createdAt,
  });
  return { item: record, removed: false };
}

export { isFirebaseConfigured };
