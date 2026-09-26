import "server-only";
import { getAdminDb, isFirebaseConfigured } from "@/lib/firebase-admin";
import { createHash } from "node:crypto";
import type { FavoriteRecord, GenerationRecord, NewFavorite, NewGeneration, PublicGeneration } from "./types";

export const hashOwner = (owner: string) => createHash("sha256").update(owner).digest("hex");

/** Strip the owner id (a delete credential) and publish only its hash. */
function toPublic({ owner, ...rest }: GenerationRecord): PublicGeneration {
  return { ...rest, ownerHash: owner ? hashOwner(owner) : null };
}

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
 * One favourite per owner per item, with a deterministic id so writes need
 * no lookup query and duplicates are impossible. "|" is a separator neither
 * owner nor item ids may contain, so ids cannot collide across owners, and
 * the "f|" prefix keeps them clear of Firestore's reserved __name__ form.
 * The first scheme joined with "__", which both could contain.
 */
function favoriteId(owner: string, itemId: string) {
  return `f|${owner}|${itemId}`;
}
/**
 * The earlier scheme, still read and cleaned up so old records cannot linger.
 * null when that id would be one Firestore reserves (__name__), which only a
 * crafted owner/item pair produces and no old record can have.
 */
function legacyFavoriteId(owner: string, itemId: string): string | null {
  const id = `${owner}__${itemId}`.replace(/[/\s]/g, "_");
  return /^__.*__$/.test(id) ? null : id;
}

/* -------------------------------- generations ------------------------------- */

export async function listGenerations(max = 50): Promise<PublicGeneration[]> {
  const db = getAdminDb();
  if (!db) return memory.__hfGenerations!.slice(0, max).map(toPublic);

  const snapshot = await db
    .collection("generations")
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();

  return snapshot.docs.map((doc) => toPublic({ id: doc.id, ...(doc.data() as Omit<GenerationRecord, "id">) }));
}

export async function createGeneration(input: NewGeneration): Promise<PublicGeneration> {
  const createdAt = new Date().toISOString();
  const db = getAdminDb();

  if (!db) {
    const record: GenerationRecord = { ...input, id: newId("gen"), createdAt };
    memory.__hfGenerations!.unshift(record);
    memory.__hfGenerations = memory.__hfGenerations!.slice(0, 200);
    return toPublic(record);
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
    owner: input.owner ?? null,
    createdAt,
  });

  return toPublic({ ...input, id: ref.id, createdAt });
}

export type DeleteOutcome = "deleted" | "not_found" | "forbidden";

/** Only the owner that created a generation can delete it; `owners` are the caller's identities. */
export async function deleteGeneration(id: string, owners: string[]): Promise<DeleteOutcome> {
  const db = getAdminDb();
  if (!db) {
    const index = memory.__hfGenerations!.findIndex((item) => item.id === id);
    if (index < 0) return "not_found";
    if (!owners.includes(memory.__hfGenerations![index].owner ?? "")) return "forbidden";
    memory.__hfGenerations!.splice(index, 1);
    return "deleted";
  }

  const ref = db.collection("generations").doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) return "not_found";
  if (!owners.includes(snapshot.get("owner") ?? "")) return "forbidden";
  await ref.delete();
  return "deleted";
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

  // A transaction, so two concurrent toggles cannot both read "absent" and
  // both write (a double-click used to end up saved instead of unchanged)
  const ref = db.collection("favorites").doc(id);
  const legacyId = legacyFavoriteId(input.owner, input.itemId);
  const legacy = legacyId ? db.collection("favorites").doc(legacyId) : null;
  return db.runTransaction(async (tx) => {
    const [existing, old] = await Promise.all([tx.get(ref), legacy ? tx.get(legacy) : Promise.resolve(null)]);
    if (existing.exists || old?.exists) {
      if (existing.exists) tx.delete(ref);
      if (legacy && old?.exists) tx.delete(legacy);
      return { item: record, removed: true };
    }
    tx.set(ref, { itemId: record.itemId, title: record.title, owner: record.owner, createdAt: record.createdAt });
    return { item: record, removed: false };
  });
}

/**
 * Idempotent: make it a favourite (or not) regardless of the current state.
 * What the app uses, so retries and double-clicks are harmless.
 */
export async function setFavorite(input: NewFavorite, favorite: boolean): Promise<ToggleResult> {
  const id = favoriteId(input.owner, input.itemId);
  const record: FavoriteRecord = { ...input, id, createdAt: new Date().toISOString() };
  if (!favorite) {
    await removeFavorite(input.owner, input.itemId);
    return { item: record, removed: true };
  }
  const db = getAdminDb();
  if (!db) {
    if (!memory.__hfFavorites!.some((item) => item.id === id)) memory.__hfFavorites!.unshift(record);
    return { item: record, removed: false };
  }
  // Only written when absent, so the original createdAt is kept
  const ref = db.collection("favorites").doc(id);
  const legacyId = legacyFavoriteId(input.owner, input.itemId);
  const [existing, old] = await Promise.all([
    ref.get(),
    legacyId ? db.collection("favorites").doc(legacyId).get() : Promise.resolve(null),
  ]);
  // A favourite under the old id already counts; writing a new one would
  // list the same item twice
  if (!existing.exists && !old?.exists) {
    await ref.set({ itemId: record.itemId, title: record.title, owner: record.owner, createdAt: record.createdAt });
  }
  return { item: record, removed: false };
}

/** Idempotent: removing a favourite that does not exist still succeeds. */
export async function removeFavorite(owner: string, itemId: string): Promise<void> {
  const id = favoriteId(owner, itemId);
  const db = getAdminDb();
  if (!db) {
    memory.__hfFavorites = memory.__hfFavorites!.filter((item) => item.id !== id);
    return;
  }
  const batch = db.batch();
  batch.delete(db.collection("favorites").doc(id));
  const legacyId = legacyFavoriteId(owner, itemId);
  if (legacyId) batch.delete(db.collection("favorites").doc(legacyId));
  await batch.commit();
}

/** A real round trip, for /api/health: configured is not the same as reachable. */
export async function pingDatabase(): Promise<{ reachable: boolean; latencyMs: number }> {
  const started = performance.now();
  const db = getAdminDb();
  if (!db) return { reachable: false, latencyMs: 0 };
  await db.collection("generations").limit(1).get();
  return { reachable: true, latencyMs: Math.round(performance.now() - started) };
}

export { isFirebaseConfigured };
