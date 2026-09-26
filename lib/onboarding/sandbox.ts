/**
 * The onboarding sandbox: pick a medium, build a prompt from tags, watch a
 * test frame render, then open the matching studio with everything applied.
 *
 * Tags do two jobs. Each adds words to the prompt, and some also set a real
 * studio control (Camera, Lighting, Color palette…) when the target studio
 * has it. Nothing is applied that the studio cannot represent.
 */

export type MediumId = "cinematic" | "reel" | "game-asset" | "product-ad";

export interface Medium {
  id: MediumId;
  label: string;
  description: string;
  /** Studio this preset opens in */
  surface: "cinema-studio" | "3d-jutsu" | "marketing-studio";
  studioLabel: string;
  /** Still the test frame renders from */
  still: string;
  subjects: string[];
  /** Controls the medium itself implies, before any tags */
  base: [string, string][];
}

export const MEDIUMS: Medium[] = [
  {
    id: "cinematic",
    label: "Cinematic Video",
    description: "Film-grade shots with lens and light control",
    surface: "cinema-studio",
    studioLabel: "Cinema Studio",
    still: "/media/hero/5.jpg",
    subjects: ["a pier at last light as the tide turns", "a lone rider crossing a salt flat", "rain on an empty night market"],
    base: [
      ["Film setup", "Cinematic"],
      ["ratio", "16:9"],
    ],
  },
  {
    id: "reel",
    label: "Social AI Reel",
    description: "Vertical, fast, made to stop the scroll",
    surface: "cinema-studio",
    studioLabel: "Cinema Studio",
    still: "/media/hero/3.jpg",
    subjects: ["a red tram cutting through a busy street", "a skater carving an empty pool", "neon signs flickering on in the rain"],
    base: [
      ["Film setup", "Music video"],
      ["ratio", "9:16"],
    ],
  },
  {
    id: "game-asset",
    label: "3D Game Asset",
    description: "Environments and props, blocked out in 3D",
    surface: "3d-jutsu",
    studioLabel: "3D Jutsu",
    still: "/media/library/5.jpg",
    subjects: ["a weathered sandstone monolith", "a desert canyon arena", "an overgrown stone ruin"],
    base: [],
  },
  {
    id: "product-ad",
    label: "Product Ad",
    description: "Hero shots and campaign-ready visuals",
    surface: "marketing-studio",
    studioLabel: "Marketing Studio",
    still: "/media/steps/3.jpg",
    subjects: ["a glass serum bottle on wet stone", "sneakers floating against a bright wall", "a watch face catching a single highlight"],
    base: [["mode", "Image"]],
  },
];

export interface Tag {
  id: string;
  label: string;
  /** Words this tag adds to the prompt */
  words: string;
  /** Studio controls it sets, where the studio has them */
  sets?: [string, string][];
}

export interface TagGroup {
  id: "camera" | "style" | "motion";
  label: string;
  tags: Tag[];
}

export const TAG_GROUPS: TagGroup[] = [
  {
    id: "camera",
    label: "Camera angle",
    tags: [
      { id: "drone", label: "Drone flyover", words: "sweeping drone flyover", sets: [["Camera", "35mm"]] },
      { id: "push-in", label: "Low-angle push-in", words: "slow low-angle push-in", sets: [["Camera", "Anamorphic"]] },
      { id: "handheld", label: "Handheld close-up", words: "handheld close-up", sets: [["Camera", "50mm"]] },
      { id: "locked", label: "Locked-off wide", words: "locked-off wide shot", sets: [["Camera", "35mm"]] },
    ],
  },
  {
    id: "style",
    label: "Style",
    tags: [
      {
        id: "cyberpunk",
        label: "Cyberpunk Obsidian",
        words: "cyberpunk obsidian palette, teal and magenta neon",
        sets: [
          ["Color palette", "Orange Teal"],
          ["Lighting", "Neon Night"],
        ],
      },
      {
        id: "golden",
        label: "Golden-hour film",
        words: "golden-hour 35mm film look, warm grain",
        sets: [
          ["Color palette", "Warm Vintage"],
          ["Lighting", "Golden Hour"],
        ],
      },
      {
        id: "studio",
        label: "Clean studio",
        words: "clean studio light, soft shadows",
        sets: [
          ["Color palette", "Pastel"],
          ["Lighting", "Studio Soft Light"],
        ],
      },
      {
        id: "noir",
        label: "Monochrome noir",
        words: "high-contrast monochrome noir",
        sets: [
          ["Color palette", "Monochrome"],
          ["Lighting", "High Key"],
        ],
      },
    ],
  },
  {
    id: "motion",
    label: "Motion",
    tags: [
      { id: "hyperlapse", label: "Hyper-lapse", words: "hyper-lapse" },
      { id: "slowmo", label: "Slow motion", words: "120fps slow motion" },
      { id: "loop", label: "Seamless loop", words: "seamless loop" },
      { id: "whip", label: "Whip pan", words: "whip-pan transition" },
    ],
  },
];

export type Picks = Partial<Record<TagGroup["id"], string>>;

export const mediumById = (id: MediumId) => MEDIUMS.find((m) => m.id === id)!;
const tagById = (group: TagGroup["id"], id?: string) =>
  TAG_GROUPS.find((g) => g.id === group)!.tags.find((t) => t.id === id);

/** The prompt, as its parts: the subject and one fragment per picked tag. */
export function promptParts(subject: string, picks: Picks): { text: string; tag?: TagGroup["id"] }[] {
  const parts: { text: string; tag?: TagGroup["id"] }[] = [{ text: subject.trim() }];
  for (const group of TAG_GROUPS) {
    const tag = tagById(group.id, picks[group.id]);
    if (tag) parts.push({ text: tag.words, tag: group.id });
  }
  return parts.filter((part) => part.text);
}

export const buildPrompt = (subject: string, picks: Picks) =>
  promptParts(subject, picks)
    .map((part) => part.text)
    .join(", ");

/** Controls the preset will set in the studio, later entries winning. */
export function presetSettings(medium: Medium, picks: Picks): [string, string][] {
  const merged = new Map<string, string>(medium.base);
  // Only Cinema Studio has the Camera / Look pickers the tags map onto
  if (medium.surface === "cinema-studio") {
    for (const group of TAG_GROUPS) {
      for (const [key, value] of tagById(group.id, picks[group.id])?.sets ?? []) merged.set(key, value);
    }
  }
  return [...merged];
}

/** Where "Open workspace" goes: the studio, with prompt and controls in the URL. */
export function studioUrl(medium: Medium, prompt: string, settings: [string, string][]) {
  const params = new URLSearchParams();
  if (prompt) params.set("prompt", prompt);
  for (const [key, value] of settings) params.append("set", `${key}:${value}`);
  params.set("from", "onboarding");
  return `/ai/${medium.surface}?${params.toString()}`;
}

/** "Surprise me": a subject and one tag from every group. */
export function surprise(medium: Medium, random: () => number = Math.random): { subject: string; picks: Picks } {
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length) % list.length];
  return {
    subject: pick(medium.subjects),
    picks: Object.fromEntries(TAG_GROUPS.map((group) => [group.id, pick(group.tags).id])) as Picks,
  };
}

/** How the test frame is graded for each style, as a CSS filter. */
export const STYLE_GRADE: Record<string, { filter: string; tint?: string }> = {
  cyberpunk: {
    filter: "hue-rotate(185deg) saturate(1.7) contrast(1.2) brightness(0.78)",
    tint: "linear-gradient(135deg, rgb(236 72 153 / 0.35), rgb(6 182 212 / 0.3))",
  },
  golden: { filter: "sepia(0.45) saturate(1.35) contrast(1.05) brightness(1.04)" },
  studio: { filter: "saturate(0.8) contrast(0.92) brightness(1.12)" },
  noir: { filter: "grayscale(1) contrast(1.4) brightness(0.9)" },
};

export const SANDBOX_KEY = "hf.onboarding";

export interface SandboxAnswers {
  hasCompletedOnboarding: true;
  medium: MediumId;
  subject: string;
  picks: Picks;
  prompt: string;
  settings: [string, string][];
  completedAt: string;
}
