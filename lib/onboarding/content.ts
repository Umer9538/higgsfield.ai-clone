/** Onboarding bookkeeping shared by auth and the sandbox. */

export const COMPLETED_KEY = "hf.onboardingCompleted";

/** Where every completed auth or onboarding flow lands. */
export const LANDING_ROUTE = "/explore";

/**
 * True once onboarding has been finished on this device. Used to make the
 * onboarding prompt fire exactly once: first sign-up goes to onboarding,
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
    // Non-fatal; onboarding simply may prompt again on the next sign-up.
  }
}
