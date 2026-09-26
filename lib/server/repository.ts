import {
  addDoc,
  collection,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import type { FavoriteRecord, GenerationRecord, NewFavorite, NewGeneration } from "./types";

/**
 * Firestore-backed repository with an in-memory fallback.
 *
 * The fallback is not a stub for tests to special-case: it is the same
 * interface, so every route, test and build behaves identically whether or not
 * credentials are present. Only durability differs.
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

/* -------------------------------- generations ------------------------------- */

export async function listGenerations(max = 50): Promise<GenerationRecord[]> {
  const db = getDb();
  if (!db) {
    return memory.__hfGenerations!.slice(0, max);
  }

  const snapshot = await getDocs(
    query(collection(db, "generations"), orderBy("createdAt", "desc"), fsLimit(max)),
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<GenerationRecord, "id">) }));
}

export async function createGeneration(input: NewGeneration): Promise<GenerationRecord> {
  const record: GenerationRecord = {
    ...input,
    id: newId("gen"),
    createdAt: new Date().toISOString(),
  };

  const db = getDb();
  if (!db) {
    memory.__hfGenerations!.unshift(record);
    memory.__hfGenerations = memory.__hfGenerations!.slice(0, 200);
    return record;
  }

  // Firestore assigns the id, so it is not part of the stored document.
  const ref = await addDoc(collection(db, "generations"), {
    prompt: record.prompt,
    model: record.model,
    surface: record.surface,
    kind: record.kind,
    src: record.src,
    poster: record.poster ?? null,
    spec: record.spec,
    createdAt: record.createdAt,
  });
  return { ...record, id: ref.id };
}

/* --------------------------------- favorites -------------------------------- */

export async function listFavorites(owner?: string): Promise<FavoriteRecord[]> {
  const db = getDb();
  if (!db) {
    const all = memory.__hfFavorites!;
    return owner ? all.filter((item) => item.owner === owner) : all;
  }

  const base = collection(db, "favorites");
  const snapshot = await getDocs(
    owner
      ? query(base, where("owner", "==", owner), orderBy("createdAt", "desc"))
      : query(base, orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<FavoriteRecord, "id">) }));
}

export async function createFavorite(input: NewFavorite): Promise<FavoriteRecord> {
  const record: FavoriteRecord = {
    ...input,
    id: newId("fav"),
    createdAt: new Date().toISOString(),
  };

  const db = getDb();
  if (!db) {
    // Toggling off is a second POST of the same item, so de-duplicate here.
    const existing = memory.__hfFavorites!.findIndex(
      (item) => item.itemId === record.itemId && item.owner === record.owner,
    );
    if (existing >= 0) {
      memory.__hfFavorites!.splice(existing, 1);
      return record;
    }
    memory.__hfFavorites!.unshift(record);
    return record;
  }

  const ref = await addDoc(collection(db, "favorites"), {
    itemId: record.itemId,
    title: record.title,
    owner: record.owner,
    createdAt: record.createdAt,
  });
  return { ...record, id: ref.id };
}

export { isFirebaseConfigured };
