/** Quiz content, following the split-screen pattern in recon/onboarding. */

export interface Choice {
  id: string;
  label: string;
  description: string;
}

export const ROLES: Choice[] = [
  { id: "filmmaker", label: "AI Filmmaker", description: "Narrative shorts and cinematic sequences" },
  { id: "ugc", label: "UGC Creator", description: "Creator-style ads and social content" },
  { id: "motion", label: "Motion Designer", description: "Titles, logo reveals and motion graphics" },
  { id: "freelancer", label: "AI Freelancer", description: "Client work across formats" },
  { id: "marketing", label: "Marketing Lead", description: "Campaign assets at volume" },
  { id: "exploring", label: "Just exploring", description: "Seeing what the tools can do" },
];

export const LEVELS: Choice[] = [
  { id: "beginner", label: "Beginner", description: "Simple, guided, one-click presets" },
  { id: "intermediate", label: "Intermediate", description: "Fast workflows with room to tweak" },
  { id: "advanced", label: "Advanced", description: "Fine control over settings and models" },
  { id: "expert", label: "Expert", description: "Manual controls, director tools, MCP" },
];

export const MODELS: Choice[] = [
  { id: "seedance-25", label: "Seedance 2.5", description: "The most advanced video model" },
  { id: "veo-31", label: "Google Veo 3.1", description: "Advanced AI video with sound" },
  { id: "nano-banana-pro", label: "Nano Banana Pro", description: "Best 4K image model" },
  { id: "kling-30", label: "Kling 3.0", description: "Cinematic videos with audio" },
  { id: "soul-20", label: "Higgsfield Soul 2.0", description: "Ultra-realistic fashion visuals" },
  { id: "gpt-image-2", label: "GPT Image 2", description: "Near-perfect text rendering" },
];

export const GOALS: Choice[] = [
  { id: "volume", label: "Ship more, faster", description: "Higher output with less manual work" },
  { id: "quality", label: "Raise the quality bar", description: "Cinematic control over every shot" },
  { id: "clients", label: "Win client work", description: "Pitch-ready assets on short notice" },
  { id: "learn", label: "Learn the craft", description: "Build skills through Academy workflows" },
];

export const STORAGE_KEY = "hf.onboarding";
export const COMPLETED_KEY = "hf.onboardingCompleted";

/** Where every completed auth or onboarding flow lands. */
export const LANDING_ROUTE = "/explore";

/**
 * True once the quiz has been finished on this device. Used to make the
 * onboarding prompt fire exactly once: first sign-up goes to the quiz,
 * every later sign-in goes straight to the landing route.
 */
export function hasCompletedOnboarding(): boolean {
  try {
    return window.localStorage.getItem(COMPLETED_KEY) === "true";
  } catch {
    // Blocked storage: treat as not completed rather than trapping the user.
    return false;
  }
}

export function markOnboardingCompleted(): void {
  try {
    window.localStorage.setItem(COMPLETED_KEY, "true");
  } catch {
    // Non-fatal; the quiz simply may prompt again on the next sign-up.
  }
}

export interface QuizAnswers {
  hasCompletedOnboarding: true;
  role: string | null;
  level: string | null;
  models: string[];
  goal: string | null;
  claimedDiscount: boolean;
  completedAt: string;
}
