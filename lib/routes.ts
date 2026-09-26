/** Labels that map onto routes this rebuild actually serves. */
export const ROUTE_FOR_LABEL: Record<string, string> = {
  // Create
  "AI Video": "/ai/video",
  "AI Image": "/ai/image",
  "Edit Image": "/ai/edit",
  Inpaint: "/ai/edit",
  "Mixed Media": "/ai/marketing-studio",
  // Models
  "Seedance 2.5": "/ai/video",
  "Seedance 2.0": "/ai/video",
  "Kling 3.0": "/ai/motion-control",
  "Nano Banana": "/ai/image",
  "GPT Image 2": "/ai/image",
  // Studios
  "Cinema Studio": "/ai/cinema-studio",
  "Marketing Studio": "/ai/marketing-studio",
  "Higgsfield Canvas": "/canvas",
  // Platform
  Supercomputer: "/supercomputer",
  "MCP/CLI": "/mcp",
  // Company
  Pricing: "/pricing",
  Enterprise: "/enterprise",
  // Resources
  Academy: "/academy",
  // Rail headings
  "Explore all originals": "/originals",
  "Explore all live projects": "/contests",
  "Explore all projects": "/explore",
  "Explore all shots": "/explore",
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
