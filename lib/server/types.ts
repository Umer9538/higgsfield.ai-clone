export interface GenerationRecord {
  id: string;
  prompt: string;
  model: string;
  surface: string;
  kind: "video" | "image" | "audio";
  src: string;
  poster?: string;
  spec: string;
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
