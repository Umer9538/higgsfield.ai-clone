/** Labels that map onto routes this rebuild actually serves. */
export const ROUTE_FOR_LABEL: Record<string, string> = {
  // Create
  "AI Video": "/ai/video",
  "AI Image": "/ai/image",
  "Edit Image": "/ai/edit",
  Inpaint: "/ai/edit",
  "AI Face Swap": "/ai/image",
  "AI Influencer": "/ai/image",
  "Mixed Media": "/ai/marketing-studio",
  // Models
  "Seedance 2.5": "/explore",
  "Seedance 2.0": "/explore",
  "Kling 3.0": "/ai/video",
  "Nano Banana": "/ai/image",
  "GPT Image 2": "/ai/image",
  "Grok Imagine 1.5": "/ai/video",
  "Gemini Omni Flash": "/ai/video",
  // Studios
  "Cinema Studio": "/ai/cinema-studio",
  "Marketing Studio": "/ai/marketing-studio",
  "Higgsfield Canvas": "/canvas",
  // Platform
  Supercomputer: "/supercomputer",
  "MCP/CLI": "/mcp",
  Games: "/ai/3d-jutsu",
  // Company
  Pricing: "/pricing",
  Enterprise: "/enterprise",
  // Resources
  Academy: "/academy",
  "Help Center": "/mcp",
  // Community
  Community: "/community",
  Contests: "/contests",
  Originals: "/originals",
  Assets: "/assets",
  Explore: "/explore",
  Canvas: "/canvas",
  Effects: "/ai/effects",
  Genjutsu: "/ai/genjutsu",
  "3D Jutsu": "/ai/3d-jutsu",
};

export function routeFor(label: string): string | undefined {
  return ROUTE_FOR_LABEL[label];
}
