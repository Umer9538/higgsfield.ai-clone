/**
 * Navigation model shared by the side rail, the mobile tab bar and the
 * Create catalog. The reference product put 19 destinations in one top bar;
 * here there are five primary sections and everything else nests under one.
 */

export type NavBadge = "New" | "Free";

export interface NavLink {
  label: string;
  href: string;
  badge?: NavBadge;
  description?: string;
}

export interface CatalogGroup {
  name: string;
  links: NavLink[];
}

export type SectionKey = "create" | "explore" | "assets" | "learn" | "pricing";

export interface NavSection {
  key: SectionKey;
  label: string;
  /** Absent for Create, which opens the catalog instead of navigating. */
  href?: string;
  /** Secondary destinations revealed next to the rail item. */
  children?: NavLink[];
}

/** Every generator, studio and app — what Create opens. */
export const CATALOG: CatalogGroup[] = [
  {
    name: "Models",
    links: [
      { label: "Image", href: "/ai/image", description: "Stills from a prompt" },
      { label: "Video", href: "/ai/video", description: "Animate an image or a prompt" },
      { label: "Audio", href: "/ai/audio", description: "Narration from a script" },
      { label: "Edit", href: "/ai/edit", description: "Change an existing clip" },
      { label: "Motion Control", href: "/ai/motion-control", description: "Transfer a performance" },
    ],
  },
  {
    name: "Studios",
    links: [
      { label: "Cinema Studio", href: "/ai/cinema-studio", description: "Film look, lens and light" },
      { label: "Marketing Studio", href: "/ai/marketing-studio", description: "Ads from templates" },
      { label: "Genjutsu", href: "/ai/genjutsu", badge: "Free", description: "Recast one video many ways" },
      { label: "Effects", href: "/ai/effects", badge: "Free", description: "One-tap viral presets" },
      { label: "3D Jutsu", href: "/ai/3d-jutsu", badge: "New", description: "Prompt to playable 3D" },
    ],
  },
  {
    name: "Apps",
    links: [
      { label: "Canvas", href: "/canvas", description: "Chain generations as nodes" },
      { label: "Supercomputer", href: "/supercomputer", description: "Agentic multi-step runs" },
      { label: "ChatGPT Plugin", href: "/chatgpt-plugin", badge: "New", description: "Generate inside ChatGPT" },
      { label: "MCP", href: "/mcp", description: "Connect your own agents" },
      { label: "Plugins", href: "/plugins", description: "Extensions for your tools" },
    ],
  },
];

export const SECTIONS: NavSection[] = [
  { key: "create", label: "Create" },
  {
    key: "explore",
    label: "Explore",
    href: "/explore",
    children: [
      { label: "Community", href: "/community" },
      { label: "Contests", href: "/contests" },
      { label: "Originals", href: "/originals" },
    ],
  },
  { key: "assets", label: "Assets", href: "/assets" },
  { key: "learn", label: "Learn", href: "/academy" },
  {
    key: "pricing",
    label: "Pricing",
    href: "/pricing",
    children: [{ label: "Enterprise", href: "/enterprise" }],
  },
];

const CATALOG_HREFS = new Set(CATALOG.flatMap((group) => group.links.map((link) => link.href)));

/** Which primary section a pathname belongs to, for the rail's active state. */
export function sectionFor(pathname: string): SectionKey | null {
  if (CATALOG_HREFS.has(pathname) || pathname.startsWith("/ai/")) return "create";
  for (const section of SECTIONS) {
    if (!section.href) continue;
    if (pathname === section.href || section.children?.some((child) => child.href === pathname)) {
      return section.key;
    }
  }
  return null;
}
