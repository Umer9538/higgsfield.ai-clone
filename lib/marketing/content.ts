/**
 * Footer content, transcribed from the live site.
 * See docs/higgsfield-reference.md for provenance.
 */

/**
 * Footer links, each to a page this app actually serves. The reference's
 * footer lists ~45 destinations; the ones with no page here (Lipsync Studio,
 * Careers, Terms…) are cut rather than kept as links that go nowhere. Models
 * link to the studio where they are the default.
 */
export interface FooterLink {
  label: string;
  href: string;
}

export const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Create",
    links: [
      { label: "AI Video", href: "/ai/video" },
      { label: "AI Image", href: "/ai/image" },
      { label: "Edit Video", href: "/ai/edit" },
      { label: "Motion Control", href: "/ai/motion-control" },
      { label: "Text to Speech", href: "/ai/audio" },
      { label: "Canvas", href: "/canvas" },
    ],
  },
  {
    title: "Models",
    links: [
      { label: "Seedance 2.5", href: "/ai/video" },
      { label: "GPT Image 2", href: "/ai/image" },
      { label: "Kling 3.0 Motion Control", href: "/ai/motion-control" },
      { label: "Cinema Studio 4.0", href: "/ai/cinema-studio" },
      { label: "Seed Audio 1.0", href: "/ai/audio" },
    ],
  },
  {
    title: "Studios",
    links: [
      { label: "Cinema Studio", href: "/ai/cinema-studio" },
      { label: "Marketing Studio", href: "/ai/marketing-studio" },
      { label: "Genjutsu", href: "/ai/genjutsu" },
      { label: "Effects", href: "/ai/effects" },
      { label: "3D Jutsu", href: "/ai/3d-jutsu" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Supercomputer", href: "/supercomputer" },
      { label: "MCP / CLI", href: "/mcp" },
      { label: "ChatGPT Plugin", href: "/chatgpt-plugin" },
      { label: "Plugins", href: "/plugins" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Community", href: "/community" },
      { label: "Contests", href: "/contests" },
      { label: "Originals", href: "/originals" },
      { label: "Academy", href: "/academy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
];

export const FOOTER = {
  wordmark: ["AI-native", "creative suite"],
  address: "535 Mission St, 14th floor, San Francisco, CA, 94105",
  copyright: "© 2026 Higgsfield, Inc. All rights reserved.",
  /** The bottom row: no legal pages exist here, and the site sets no cookies */
  legal: [
    { label: "Settings", href: "/settings" },
    { label: "Your data", href: "/settings#data" },
  ] satisfies FooterLink[],
};
