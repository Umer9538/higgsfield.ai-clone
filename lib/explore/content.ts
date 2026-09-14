/**
 * Explore feed. On the real site Explore is the signed-in homepage: a stack of
 * per-model rails, each a lime uppercase heading over a masonry grid, with
 * author and like chips revealed on hover. See recon/home.
 */

export interface FeedItem {
  id: string;
  prompt: string;
  author: string;
  model: string;
  likes: number;
  /** "5s · 1080p" for video, "2K · 16:9" for stills */
  spec: string;
  kind: "video" | "image";
  /** Tailwind aspect class — the varied heights are what make it masonry */
  aspect: string;
  src: string;
}

const AUTHORS = ["rococo_pen", "wer", "jighit", "mrabujoe", "shestak", "ash", "adqua", "higgsfield.studio"];

const PROMPTS = [
  "Skater carving an empty pool at golden hour, GoPro on the deck, motion blur",
  "Festival crowd at night, lasers cutting through haze, handheld and frantic",
  "Man in a suit slumped against a wall, single hard window light, 35mm",
  "Semi truck barrelling down a wet interstate, low angle, spray catching the headlights",
  "Cluttered studio apartment at dusk, warm practicals, anime figure on the table",
  "Brooklyn walk-up facade covered in graffiti, overcast, static lock-off",
  "Woman running through autumn woods trailing fire from her sleeves",
  "Open-plan office mid-fight, fluorescent light, papers everywhere",
  "Winged figure against a pale sky, feathers catching the light, shallow focus",
  "Jellyfish lamp in a ceramics studio, teal glass, soft window light",
  "Model in liquid silver on a rock as a wave breaks behind her",
  "Street style portrait, denim corset and fur coat, weathered stucco wall",
  "Boy in a yellow beanie drinking from a blue enamel mug on a side street",
  "Editorial fur coat against alpine snow, low winter sun",
  "Macro of espresso crema swirling, amber tones, 120fps",
  "Neon Tokyo crossing from above, rain slick, long lens compression",
];

const SPECS_VIDEO = ["5s · 1080p", "8s · 720p", "10s · 4K", "5s · 4K"];
const SPECS_IMAGE = ["2K · 16:9", "4K · 3:4", "2K · 9:16", "4K · 1:1"];
const ASPECTS = ["aspect-video", "aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-video", "aspect-[9/16]"];

function build(prefix: string, model: string, kind: FeedItem["kind"], count: number, offset = 0): FeedItem[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + offset;
    return {
      id: `${prefix}-${i}`,
      prompt: PROMPTS[n % PROMPTS.length],
      author: AUTHORS[n % AUTHORS.length],
      model,
      likes: 60 + ((n * 137) % 900),
      spec: kind === "video" ? SPECS_VIDEO[n % SPECS_VIDEO.length] : SPECS_IMAGE[n % SPECS_IMAGE.length],
      kind,
      aspect: ASPECTS[n % ASPECTS.length],
      src: `/media/effects/${(n % 15) + 1}.jpg`,
    };
  });
}

export interface Rail {
  id: string;
  title: string;
  sub: string;
  cta?: string;
  category: string;
  items: FeedItem[];
}

export const RAILS: Rail[] = [
  {
    id: "visual-effects",
    title: "Visual Effects",
    sub: "Big-budget visual effects, from explosions to surreal transformations.",
    cta: "Try for free",
    category: "Effects",
    items: build("fx", "Higgsfield Effects", "video", 8),
  },
  {
    id: "seedance-25",
    title: "Seedance 2.5",
    sub: "The most advanced AI video model.",
    category: "Video",
    items: build("sd25", "Seedance 2.5", "video", 8, 3),
  },
  {
    id: "seedance-20",
    title: "Seedance 2.0",
    sub: "Browse premium AI video generations from the Higgsfield community.",
    category: "Video",
    items: build("sd20", "Google Veo 3.1", "video", 8, 6),
  },
  {
    id: "gpt-image-2",
    title: "GPT Image 2",
    sub: "4K images with near-perfect text rendering.",
    category: "Image",
    items: build("gpt", "Nano Banana Pro", "image", 8, 9),
  },
  {
    id: "soul",
    title: "Higgsfield Soul 2.0",
    sub: "A culture-native photo model built for fashion, aesthetics, and creative expression.",
    category: "Image",
    items: build("soul", "Higgsfield Soul 2.0", "image", 8, 12),
  },
];

export const CATEGORIES = ["All", "Video", "Image", "Effects"];

export const SORTS = [
  { id: "trending", label: "Trending" },
  { id: "newest", label: "Newest" },
  { id: "most-liked", label: "Most liked" },
];

/** The tag cloud that closes the real Explore page. */
export const FEATURE_TAGS = [
  "Cinema Studio", "Visual Effects", "Higgsfield Soul", "Kling 2.1 Master", "Camera Controls",
  "Viral", "Action movements", "Commercial", "MiniMax Hailuo 02", "Seedance Pro", "Community",
  "Wan 2.2 Image", "Seedream 4.0", "Nano Banana", "Flux Kontext", "GPT Image", "Topaz",
  "Google Veo3", "Kling 2.5 Turbo", "Kling Avatars 2.0", "Claude MCP", "Wan 2.5", "Sora 2",
  "Sora 2 Presets", "Banana Placement", "Edit Image", "Multi Reference", "Upscale", "YouTube",
  "TikTok", "Instagram Reels", "YouTube Shorts", "Nano Banana Pro", "Kling o1",
  "Mixed Media Community", "Soul Presets", "Visual Effects Collection",
];

export const TRENDING_PROMPTS = [
  "Cinematic action scene, motorcycle chase at night",
  "UGC unboxing, bright kitchen, handheld",
  "Product hero on wet stone, soft rim light",
  "Anime short, eight distinct visual worlds",
];
