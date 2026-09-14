/**
 * Homepage content, transcribed verbatim from the live site.
 * See docs/higgsfield-reference.md for provenance.
 */

export const PROMO_BAR = {
  label: "Offer expires in",
  lead: "Nano Banana Pro & 2 UNLIMITED on Max.",
  rest: "Kling 3.0 Unlimited.",
  emphasis: "Personal 54% OFF",
  cta: "Get Unlimited with 54% OFF",
  /** Seconds remaining, matching the ~2h45m window seen on the live site. */
  durationSeconds: 2 * 3600 + 42 * 60 + 49,
};

export interface HeroCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export const HERO_CARDS: HeroCard[] = [
  {
    id: "motion-designer",
    href: "/ai/marketing-studio",
    image: "/media/hero/1.jpg",
    title: "Higgsfield AI Motion Designer",
    description: "ChatGPT can now do motion design in After Effects.",
  },
  {
    id: "effects",
    href: "/ai/effects",
    image: "/media/hero/2.jpg",
    title: "Higgsfield Effects",
    description: "Viral video presets now in ChatGPT, with free generations",
  },
  {
    id: "genjutsu",
    href: "/ai/genjutsu",
    image: "/media/hero/3.jpg",
    title: "Higgsfield Genjutsu",
    description: "One upload in. Endless new visions out.",
  },
  {
    id: "sunburst",
    href: "/ai/image",
    image: "/media/hero/4.jpg",
    title: "GPT Image 2.5 Sunburst",
    description: "Sharper edits with more natural light and texture",
  },
  {
    id: "astra",
    href: "/ai/3d-jutsu",
    image: "/media/hero/5.jpg",
    title: "Higgsfield × GPT-6 Astra",
    description:
      "Turn a single prompt into a playable 3D game. Story, mechanics, and every asset included",
  },
];

export const PROMO_PANEL = {
  headline: "Unlimited Nano Banana Pro",
  highlight: "with Personal 54% OFF",
  sub: "7-day unlimited Nano Banana Pro, Nano Banana 2 and Kling 3.0",
  cta: "Get with 54% OFF",
  note: "Discount expires in 2h 42m 48s",
};

export interface ProductTile {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: { label: string; tone: "top" | "new" | "free" };
  kind?: string;
}

export const PRODUCT_TILES: ProductTile[] = [
  {
    id: "seedance",
    href: "/ai/video",
    title: "Seedance 2.5",
    description: "The most advanced video model",
    badge: { label: "Top", tone: "top" },
    kind: "Video",
  },
  { id: "nano-banana", href: "/ai/image", title: "Nano Banana Pro", description: "Generate high-quality visuals", kind: "Image" },
  {
    id: "genjutsu",
    href: "/ai/genjutsu",
    title: "Higgsfield Genjutsu",
    description: "One video, many versions",
    badge: { label: "Free", tone: "free" },
  },
  { id: "mcp", href: "/mcp", title: "MCP & CLI", description: "Turn Claude into a creative engine" },
  { id: "cinema", href: "/ai/cinema-studio", title: "Cinema Studio 4.0", description: "Create cinematic scenes effortlessly" },
  { id: "supercomputer", href: "/supercomputer", title: "Supercomputer", description: "Agent powered by GPT-6 Astra" },
];

export const EFFECTS = {
  heading: "Visual Effects",
  sub: "Big-budget visual effects, from explosions to surreal transformations.",
  cta: "Start generating",
  footerCta: "View all presets",
  presets: [
    { name: "Floating fall", image: "/media/effects/1.jpg" },
    { name: "High flip", image: "/media/effects/2.jpg" },
    { name: "Burning man", image: "/media/effects/3.jpg" },
    { name: "Studio slide", image: "/media/effects/4.jpg" },
    { name: "Incline", image: "/media/effects/5.jpg" },
    { name: "Act natural", image: "/media/effects/6.jpg" },
    { name: "Eyes in", image: "/media/effects/7.jpg" },
    { name: "Street colossus", image: "/media/effects/8.jpg" },
    { name: "Melting", image: "/media/effects/9.jpg" },
    { name: "Wild ride", image: "/media/effects/10.jpg" },
    { name: "Cutout", image: "/media/effects/11.jpg" },
    { name: "World morphing", image: "/media/effects/12.jpg" },
    { name: "Smash and grab", image: "/media/effects/13.jpg" },
    { name: "Selfception", image: "/media/effects/14.jpg" },
    { name: "Lacewalker", image: "/media/effects/15.jpg" },
  ],
};

export const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Create",
    links: [
      "AI Video",
      "AI Image",
      "Edit Image",
      "Inpaint",
      "Upscale",
      "Sora 2 Upscale",
      "Mixed Media",
      "AI Face Swap",
      "AI Influencer",
      "Apps",
    ],
  },
  {
    title: "Video Models",
    links: [
      "Seedance 2.5",
      "Seedance 2.0",
      "Kling 3.0",
      "Sora 2 Introduction",
      "Veo 3.1 Introduction",
      "WAN 2.6",
      "Grok Imagine 1.5",
      "Gemini Omni Flash",
    ],
  },
  {
    title: "Image Models",
    links: ["Nano Banana", "Flux 2", "Seedream 5", "GPT Image 2"],
  },
  {
    title: "Studios",
    links: [
      "Cinema Studio",
      "Marketing Studio",
      "Lipsync Studio",
      "Photodump Studio",
      "Fashion Factory",
      "UGC Factory",
      "Higgsfield Popcorn",
    ],
  },
  {
    title: "Platform",
    links: ["Supercomputer", "MCP/CLI", "Collab", "Games", "Reference Extension"],
  },
  {
    title: "Company",
    links: ["About", "Trust", "Enterprise", "Team", "Pricing", "Careers", "Contact"],
  },
];

export const FOOTER = {
  wordmark: ["AI-native", "creative suite"],
  address: "535 Mission St, 14th floor, San Francisco, CA, 94105",
  socials: ["X / Twitter", "Youtube", "LinkedIn", "Tiktok"],
  copyright: "© 2026 Higgsfield, Inc. All rights reserved.",
  legal: ["Help center", "Cookie Notice", "Cookie Settings", "Terms", "Privacy"],
};
