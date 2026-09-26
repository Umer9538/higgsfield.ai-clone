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
export type NewFavorite = Omit<FavoriteRecord, "id" | "createdAt">;
