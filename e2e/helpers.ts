import type { Page } from "@playwright/test";

/**
 * Wait for entry motion to finish before measuring geometry. Pages rise in
 * and grid items stagger; a bounding box read mid-animation is off by a few
 * pixels. Infinite animations (loading shimmer, cable flow) are skipped
 * because they never finish.
 */
export async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}
