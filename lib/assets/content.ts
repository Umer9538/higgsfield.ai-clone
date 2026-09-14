export type AssetKind = "video" | "image" | "audio";

export interface Asset {
  id: string;
  title: string;
  kind: AssetKind;
  model: string;
  prompt: string;
  /** ISO date, newest sorts first by default */
  createdAt: string;
  src: string;
  poster?: string;
  meta: string;
}

const PROMPTS = [
  "A cinematic action scene of a young woman riding a black motorcycle at speed",
  "Slow dolly through a neon-lit Tokyo alley after rain, shallow depth of field",
  "Product hero shot of a glass serum bottle on wet stone, soft rim light",
  "Portrait of a jazz trumpeter mid-solo, warm tungsten key, 85mm",
  "Aerial push-in over a foggy pine forest at first light",
  "UGC-style creator unboxing a pastel skincare set in a bright kitchen",
  "Hand-held follow shot of a skateboarder carving an empty pool",
  "Editorial fashion still, oversized knit, seamless coral backdrop",
  "Macro of espresso crema swirling, 120fps, amber tones",
  "Wide establishing shot of a desert highway at golden hour",
  "Studio voiceover, warm female narrator, measured and calm",
  "Character turnaround for a brand mascot, three-quarter view",
];

const KINDS: AssetKind[] = ["video", "image", "image", "audio", "image", "video"];
const MODELS = ["Seedance 2.5", "Nano Banana Pro", "GPT Image 2", "Seed Audio 1.0", "Kling 3.0"];

/** Deterministic so server and client render identically. */
export const ASSETS: Asset[] = Array.from({ length: 18 }, (_, index) => {
  const kind = KINDS[index % KINDS.length];
  const day = String(28 - index).padStart(2, "0");
  return {
    id: `asset-${index + 1}`,
    title:
      kind === "audio"
        ? `Voiceover take ${index + 1}`
        : kind === "video"
          ? `Sequence ${index + 1}`
          : `Still ${index + 1}`,
    kind,
    model: kind === "audio" ? "Seed Audio 1.0" : MODELS[index % 3],
    prompt: PROMPTS[index % PROMPTS.length],
    createdAt: `2026-08-${day}`,
    src:
      kind === "video"
        ? index % 2 === 0
          ? "/media/results/result.mp4"
          : "/media/results/result-2.mp4"
        : `/media/effects/${(index % 15) + 1}.jpg`,
    poster: kind === "video" ? "/media/results/poster.jpg" : undefined,
    meta: kind === "video" ? "1080p · 5s" : kind === "audio" ? "WAV · 0:24" : "2K · 16:9",
  };
});

export const FOLDERS = [
  { id: "campaigns", name: "Q4 Campaigns", count: 24 },
  { id: "brand", name: "Brand Characters", count: 8 },
  { id: "ugc", name: "UGC Library", count: 41 },
  { id: "archive", name: "Archive", count: 112 },
];
