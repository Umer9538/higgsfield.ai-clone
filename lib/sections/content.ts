/**
 * Copy transcribed from the live site on 2026-09-14.
 * Real endpoints: /academy, /community, /contests/higgsfield-global-film-festival,
 * /plugins/after-effects, /canvas-intro, /original-series.
 */

/* ---------------------------------- Academy --------------------------------- */

export const ACADEMY = {
  eyebrow: "Academy",
  headline: ["Learn. Create. Ship.", "All in one place."],
  sub: "Real workflows for AI video, ads, and content, from your first try to a finished reel.",
  cta: "Start for free",
  categoriesTitle: "Browse by category",
  categories: ["Movie making", "UGC & Social Content", "Automate & Agents"],
  coursesTitle: "Most popular courses",
  courses: [
    {
      id: "blockbuster",
      title: "Blockbuster 4K: The AI Filmmaking Pipeline",
      body: "The full pipeline from script to finished 4K sequence, using the models a working crew would actually reach for.",
      category: "Movie making",
      level: "Intermediate",
      modules: 10,
      minutes: 40,
    },
    {
      id: "short-film",
      title: "Build an Ultra-Realistic Short Film in 4K",
      body: "A 33-minute director's masterclass. A football drama built shot by shot with Claude Fable 5 and Seedance 2.0 4K.",
      category: "Movie making",
      level: "Intermediate",
      modules: 19,
      minutes: 33,
    },
    {
      id: "vfx",
      title: "Add AI VFX to Real Footage",
      body: "Composite generated effects onto live plates without the seams giving it away.",
      category: "Movie making",
      level: "Advanced",
      modules: 11,
      minutes: 12,
    },
    {
      id: "animated",
      title: "Make an AI Animated Short",
      body: "Build one animated story across eight distinct visual worlds, from concept and scene design to a finished short.",
      category: "Movie making",
      level: "Intermediate",
      modules: 11,
      minutes: 17,
    },
    {
      id: "ugc",
      title: "UGC Ads That Convert",
      body: "Hooks, pacing and framing for creator-style ads that survive the first three seconds.",
      category: "UGC & Social Content",
      level: "Beginner",
      modules: 8,
      minutes: 24,
    },
    {
      id: "agents",
      title: "Automate Your Pipeline with Agents",
      body: "Wire Supercomputer, MCP and the CLI into a repeatable content pipeline.",
      category: "Automate & Agents",
      level: "Advanced",
      modules: 9,
      minutes: 28,
    },
  ],
};

/* --------------------------------- Community -------------------------------- */

export const COMMUNITY = {
  tabs: ["Explore", "Projects", "Shots", "Originals"],
  banner: {
    label: "Contest is live",
    prize: "$1,000,000",
    title: "Global Film Festival",
    body: "Any story. Any genre. Make your film in Higgsfield. Fourteen winners, a million dollars.",
    dates: "Jul 14 — Sep 14",
    cta: "Join the festival",
  },
  /** tabs lists which view each rail belongs to; matching on the title was
   *  fragile and the Projects tab fell through to showing everything. */
  rails: [
    { id: "originals", title: "Originals by Higgsfield", link: "Explore all originals", tabs: ["Explore", "Originals"] },
    { id: "festival", title: "Global Film Festival Live Projects", link: "Explore all live projects", tabs: ["Explore", "Projects"] },
    { id: "projects", title: "Projects by Community", link: "Explore all projects", tabs: ["Explore", "Projects"] },
    { id: "shots", title: "Shots", link: "Explore all shots", tabs: ["Explore", "Shots"] },
  ],
  creators: [
    { handle: "mrabujoe", role: "Director", projects: 24 },
    { handle: "shestak", role: "Motion designer", projects: 18 },
    { handle: "ash", role: "Creative technologist", projects: 31 },
    { handle: "jighit", role: "Editor", projects: 12 },
    { handle: "higgsfield.studio", role: "In-house studio", projects: 96 },
    { handle: "adqua", role: "Agency", projects: 40 },
  ],
  socials: ["Discord", "X / Twitter", "Youtube", "LinkedIn", "Tiktok"],
};

/* --------------------------------- Contests --------------------------------- */

export const CONTESTS = {
  tabs: ["General", "Timeline", "Rules"],
  notice: {
    label: "Deadline extended",
    detail: "Extended by 11 days",
    body: "The timeline has shifted: deadline is now Sep 14",
    cta: "Update your final cut",
  },
  active: {
    title: "Global Film Festival",
    prizePool: "$1,000,000",
    prizeLabel: "prize pool",
    window: "24 days to create a film",
    tagline: "Any story. Any genre. One prize pool.",
    cta: "Create festival project",
    /** Deadline used for the live countdown */
    deadline: "2026-09-14T23:59:59Z",
  },
  timeline: [
    { label: "Program reveal", date: "Aug 3" },
    { label: "Competition opens", date: "Aug 10" },
    { label: "Competition closes", date: "Sep 14" },
    { label: "Winners", date: "Last week of Oct" },
  ],
  prizes: [
    { place: "1st place", amount: "$500,000" },
    { place: "2nd place", amount: "$200,000" },
    { place: "3rd place", amount: "$100,000" },
    { place: "Audience Choice x1", amount: "$100,000" },
    { place: "Honorable Mention x10", amount: "$100,000" },
  ],
  past: [
    { title: "Seedance Shorts", prize: "$250,000", status: "Closed", winners: "12 winners" },
    { title: "Motion Control Jam", prize: "$80,000", status: "Closed", winners: "6 winners" },
    { title: "UGC Sprint", prize: "$40,000", status: "Closed", winners: "20 winners" },
  ],
};

/* ---------------------------------- Plugins --------------------------------- */

export const PLUGINS = {
  status: "Available now",
  headline: ["Higgsfield is now", "inside After Effects"],
  cta: "Download",
  hosts: [
    { id: "photoshop", name: "Photoshop", vendor: "Adobe", installed: true, version: "2.4.1", requires: "Photoshop 2024 or newer", blurb: "Generate and inpaint straight onto a layer, with masks preserved." },
    { id: "after-effects", name: "After Effects", vendor: "Adobe", installed: true, version: "3.0.0", requires: "After Effects 24.0 or newer", blurb: "Drop generations onto the timeline and drive them with expressions." },
    { id: "premiere", name: "Premiere Pro", vendor: "Adobe", installed: false, version: "1.9.2", requires: "Premiere Pro 24.2 or newer", blurb: "B-roll and transitions generated against the sequence you already have." },
    { id: "resolve", name: "DaVinci Resolve", vendor: "Blackmagic", installed: false, version: "1.2.0", requires: "Resolve 19 Studio", blurb: "Render nodes that call Higgsfield models from inside the Fusion page." },
    { id: "figma", name: "Figma", vendor: "Figma", installed: true, version: "2.0.6", requires: "Any Figma plan", blurb: "Fill frames with on-brand imagery without leaving the canvas." },
    { id: "blender", name: "Blender", vendor: "Blender Foundation", installed: false, version: "0.9.4", requires: "Blender 4.2 or newer", blurb: "Texture and environment generation wired into the shader editor." },
  ],
  bridge: {
    title: "MCP: your agent, our models",
    clients: ["ChatGPT", "Claude"],
    url: "bridge.higgsfield.ai/mcp",
    steps: [
      "Copy the bridge prompt",
      "Open Settings → Connectors",
      "Add a custom connector, name it Higgsfield Bridge, paste the URL",
    ],
    example:
      "Build a logo reveal with a bounce ease and a light streak in After Effects",
  },
};

/* ---------------------------------- Canvas ---------------------------------- */

export interface ShowcaseItem {
  id: string;
  title: string;
  category: "Marketing" | "Explainer videos" | "Apps" | "Games";
  author: string;
  image: string;
}

export const SUPERCOMPUTER_FILTERS = ["All", "Marketing", "Explainer videos", "Apps", "Games"] as const;

export const SUPERCOMPUTER_SHOWCASE: ShowcaseItem[] = [
  { id: "s1", title: "Hydration launch campaign", category: "Marketing", author: "adqua", image: "/media/steps/1.jpg" },
  { id: "s2", title: "UGC unboxing set", category: "Marketing", author: "jighit", image: "/media/effects/2.jpg" },
  { id: "s3", title: "Seasonal ad variants", category: "Marketing", author: "shestak", image: "/media/effects/5.jpg" },
  { id: "s4", title: "How MCP works, in 90s", category: "Explainer videos", author: "ash", image: "/media/steps/2.jpg" },
  { id: "s5", title: "Onboarding walkthrough", category: "Explainer videos", author: "mrabujoe", image: "/media/effects/7.jpg" },
  { id: "s6", title: "Prompt craft primer", category: "Explainer videos", author: "higgsfield.studio", image: "/media/effects/9.jpg" },
  { id: "s7", title: "Moodboard companion app", category: "Apps", author: "wer", image: "/media/steps/3.jpg" },
  { id: "s8", title: "Shot list generator", category: "Apps", author: "rococo_pen", image: "/media/effects/11.jpg" },
  { id: "s9", title: "Endless runner prototype", category: "Games", author: "ash", image: "/media/effects/13.jpg" },
  { id: "s10", title: "Playable 3D lobby", category: "Games", author: "jighit", image: "/media/effects/14.jpg" },
  { id: "s11", title: "Card battler mockup", category: "Games", author: "adqua", image: "/media/effects/15.jpg" },
  { id: "s12", title: "Retail promo reel", category: "Marketing", author: "wer", image: "/media/effects/3.jpg" },
];

export const CANVAS = {
  headline: "One canvas. Every workflow.",
  sub: "Moodboard, chain workflows, and share with your team - all on one canvas",
  cta: "Try Canvas",
  stepsTitle: "How to start creating",
  steps: [
    { step: "Step 1", title: "Drop a node", body: "Any prompt, image, or reference becomes your starting point." },
    { step: "Step 2", title: "Chain your flow", body: "Connect nodes, mix models, build something bigger." },
    { step: "Step 3", title: "Create together", body: "Share a link and collaborate live on the same canvas, simultaneously." },
  ],
  featureTitle: "Node-based composition",
  featureBody:
    "Chain prompts, style transfers, motion nodes, and render outputs. Every connection is live.",
  /** Graph rendered in the interactive preview. Percentages of the board. */
  nodes: [
    { id: "text", label: "Text", kind: "Prompt", x: 6, y: 14 },
    { id: "image", label: "Image", kind: "Reference", x: 6, y: 58 },
    { id: "imagegen", label: "Image generation", kind: "Nano Banana Pro", x: 40, y: 30 },
    { id: "videogen", label: "Video generation", kind: "Seedance 2.5", x: 72, y: 30 },
  ],
  edges: [
    ["text", "imagegen"],
    ["image", "imagegen"],
    ["imagegen", "videogen"],
  ],
};

/* --------------------------------- Originals -------------------------------- */

export const ORIGINALS = {
  hero: {
    title: "Higgsfield Originals",
    sub: "Short films made end to end inside Higgsfield, by the studio and by the community.",
    cta: "Watch now",
  },
  promo: {
    title: "Start creating with Seedance 2.5",
    sub: "World's best video model available with up to 30% OFF",
    cta: "Get Seedance 2.5",
    badge: "up to 30% OFF",
  },
  rails: [
    { id: "choice", title: "Higgsfield Choice" },
    { id: "first-look", title: "First Look" },
    { id: "radar", title: "On Our Radar" },
  ],
  comingSoon: { title: "Coming Soon", cta: "Notify on Release" },
  winners: {
    title: "Top-3 Winners",
    entries: [
      { place: "1st", handle: "mrabujoe" },
      { place: "2nd", handle: "shestak" },
      { place: "3rd", handle: "ash" },
    ],
    mentions: "Honorable Mentions",
  },
  films: [
    "ZEPHYR: Special",
    "HELL GRIND",
    "Cully Hill Boys",
    "Red Flag",
    "Kok Boru",
    "Adiliada",
    "ONEIRIC",
    "If you stop loving me, I'll die",
  ],
};
