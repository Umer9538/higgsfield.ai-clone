export interface GenerationRecord {
  id: string;
  prompt: string;
  model: string;
  surface: string;
  kind: "video" | "image" | "audio";
  src: string;
  poster?: string;
  spec: string;
  /**
   * Who made it: "user:<handle>" or "device:<id>". Deleting requires the same
   * owner. Sign-in is mocked, so this is advisory, not authentication: with
   * real auth it would come from a verified session, not the request body.
   */
  owner?: string;
  createdAt: string;
}

export interface FavoriteRecord {
  id: string;
  itemId: string;
  title: string;
  owner: string;
  createdAt: string;
}

export type NewGeneration = Omit<GenerationRecord, "id" | "createdAt">;

/**
 * What the API returns. The raw owner id never leaves the server: it is what
 * authorises a delete, and publishing it let anyone list every owner and
 * delete the whole library. Clients get its SHA-256 and compare it with the
 * hash of their own identities to know what is theirs.
 */
export type PublicGeneration = Omit<GenerationRecord, "owner"> & { ownerHash: string | null };
export type NewFavorite = Omit<FavoriteRecord, "id" | "createdAt">;
