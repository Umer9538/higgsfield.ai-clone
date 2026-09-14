export interface CommandItem {
  id: string;
  label: string;
  group: "Workspace" | "Browse" | "Account" | "Actions";
  /** Extra words matched by the fuzzy filter */
  keywords?: string;
  href?: string;
  action?: "signout" | "copy-link" | "clear-generations" | "toggle-motion";
}

export const COMMANDS: CommandItem[] = [
  // Workspace surfaces
  { id: "video", label: "Create Video", group: "Workspace", href: "/ai/video", keywords: "seedance generate" },
  { id: "image", label: "Create Image", group: "Workspace", href: "/ai/image", keywords: "nano banana still" },
  { id: "audio", label: "Text to Speech", group: "Workspace", href: "/ai/audio", keywords: "voice narration" },
  { id: "edit", label: "Edit Video", group: "Workspace", href: "/ai/edit", keywords: "relight" },
  { id: "motion-control", label: "Motion Control", group: "Workspace", href: "/ai/motion-control", keywords: "kling" },
  { id: "genjutsu", label: "Genjutsu", group: "Workspace", href: "/ai/genjutsu", keywords: "reality motion transfer" },
  { id: "effects", label: "Effects", group: "Workspace", href: "/ai/effects", keywords: "vfx presets" },
  { id: "cinema", label: "Cinema Studio", group: "Workspace", href: "/ai/cinema-studio", keywords: "film camera" },
  { id: "marketing", label: "Marketing Studio", group: "Workspace", href: "/ai/marketing-studio", keywords: "ads ugc" },
  { id: "3d", label: "3D Jutsu", group: "Workspace", href: "/ai/3d-jutsu", keywords: "scene blockout" },
  { id: "canvas", label: "Open Canvas", group: "Workspace", href: "/canvas", keywords: "nodes graph workflow" },

  // Browse
  { id: "explore", label: "Explore", group: "Browse", href: "/explore", keywords: "feed community" },
  { id: "assets", label: "View Assets", group: "Browse", href: "/assets", keywords: "library downloads" },
  { id: "home", label: "Home", group: "Browse", href: "/", keywords: "landing" },
  { id: "pricing", label: "Pricing", group: "Browse", href: "/pricing", keywords: "plans billing" },
  { id: "enterprise", label: "Enterprise", group: "Browse", href: "/enterprise", keywords: "teams sso" },
  { id: "academy", label: "Academy", group: "Browse", href: "/academy", keywords: "courses learn" },
  { id: "community", label: "Community", group: "Browse", href: "/community", keywords: "creators" },
  { id: "contests", label: "Contests", group: "Browse", href: "/contests", keywords: "festival prize" },
  { id: "plugins", label: "Plugins", group: "Browse", href: "/plugins", keywords: "after effects figma" },
  { id: "originals", label: "Originals", group: "Browse", href: "/originals", keywords: "films" },
  { id: "supercomputer", label: "Supercomputer", group: "Browse", href: "/supercomputer", keywords: "agent" },
  { id: "mcp", label: "MCP", group: "Browse", href: "/mcp", keywords: "bridge cli" },
  { id: "chatgpt-plugin", label: "ChatGPT Plugin", group: "Browse", href: "/chatgpt-plugin", keywords: "openai" },

  // Account
  { id: "login", label: "Log in", group: "Account", href: "/login" },
  { id: "signup", label: "Sign up", group: "Account", href: "/signup" },
  { id: "quiz", label: "Onboarding Quiz", group: "Account", href: "/welcome-quiz", keywords: "profile setup" },
  { id: "signout", label: "Sign out", group: "Account", action: "signout" },

  // Actions
  { id: "copy-link", label: "Copy current link", group: "Actions", action: "copy-link", keywords: "share url" },
  { id: "toggle-motion", label: "Toggle reduced motion", group: "Actions", action: "toggle-motion", keywords: "animation accessibility" },
  { id: "clear-generations", label: "Clear saved generations", group: "Actions", action: "clear-generations", keywords: "reset assets" },
];

/** Simple subsequence match, so "cvd" finds "Create Video". */
export function matches(item: CommandItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${item.label} ${item.group} ${item.keywords ?? ""} ${item.href ?? ""}`.toLowerCase();
  if (haystack.includes(q)) return true;

  let index = 0;
  for (const char of q.replace(/\s/g, "")) {
    index = haystack.indexOf(char, index);
    if (index === -1) return false;
    index += 1;
  }
  return true;
}
