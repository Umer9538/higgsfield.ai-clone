import { type Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { settle } from "./helpers";

/**
 * Every property animated by a running CSS keyframe animation on the page.
 * Transitions are excluded on purpose: short colour fades on hover and state
 * changes remain (one repaint of one small element, not continuous motion),
 * and the motion utilities' own transitions are asserted separately below.
 */
async function animatedProperties(page: Page) {
  return page.evaluate(() => {
    const meta = new Set(["offset", "computedOffset", "easing", "composite"]);
    const found = new Map<string, Set<string>>();
    for (const animation of document.getAnimations()) {
      if (!(animation instanceof CSSAnimation)) continue;
      const name = animation.animationName;
      const effect = animation.effect as KeyframeEffect | null;
      for (const frame of effect?.getKeyframes() ?? []) {
        for (const key of Object.keys(frame)) {
          if (meta.has(key)) continue;
          if (!found.has(name)) found.set(name, new Set());
          found.get(name)!.add(key);
        }
      }
    }
    return Object.fromEntries([...found].map(([name, props]) => [name, [...props]]));
  });
}

const COMPOSITOR = new Set(["transform", "opacity"]);
const offenders = (props: Record<string, string[]>) =>
  Object.entries(props).filter(([, keys]) => keys.some((key) => !COMPOSITOR.has(key)));

test("every keyframe animation in the main flows moves only transform and opacity", async ({ page }) => {
  // Route entry and the staggered feed
  await page.goto("/explore");
  expect(offenders(await animatedProperties(page))).toEqual([]);

  // A generation in flight: button pulse and sweep, developing frame, progress bar
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByRole("progressbar", { name: "Generation progress" })).toBeVisible();
  expect(offenders(await animatedProperties(page))).toEqual([]);

  // The Create flyout
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Create" }).click();
  expect(offenders(await animatedProperties(page))).toEqual([]);
});

test("feed cards enter in sequence, and reduced motion removes the wait", async ({ page }) => {
  await page.goto("/explore");
  const delays = await page
    .locator("main article")
    .evaluateAll((cards) => cards.slice(0, 4).map((card) => getComputedStyle(card).animationDelay));
  expect(delays).toEqual(["0s", "0.045s", "0.09s", "0.135s"]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const reduced = await page.locator("main article").nth(3).evaluate((card) => {
    const style = getComputedStyle(card);
    return { delay: style.animationDelay, duration: parseFloat(style.animationDuration) };
  });
  expect(reduced.delay).toBe("0s");
  expect(reduced.duration).toBeLessThan(0.001);
});

test("media cards lift on a spring and light a violet edge on hover", async ({ page }) => {
  await page.goto("/explore");
  await settle(page);
  const card = page.locator("main article").first();

  // Compositor-only: the transition covers transform, the glow fades on ::after
  expect(await card.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("transform");
  expect(await card.evaluate((el) => getComputedStyle(el).transitionTimingFunction)).toMatch(/^linear\(/);

  await card.hover();
  await expect
    .poll(() => card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a), { timeout: 3_000 })
    .toBeCloseTo(1.02, 3);
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el, "::after").opacity))
    .toBe("1");
});

test("Generate presses to 0.98 and pulses while it works", async ({ page }) => {
  await page.goto("/ai/video");
  const generate = page.getByRole("button", { name: /^Generate/ });
  const box = (await generate.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect
    .poll(() => generate.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a))
    .toBeCloseTo(0.98, 3);
  await page.mouse.up();

  const pulse = page.locator("[data-generate-pulse]");
  await expect(pulse).toHaveCount(1);
  expect(await pulse.evaluate((el) => getComputedStyle(el).animationName)).toBe("glow-pulse");
});

test("the studio's progress glow brightens toward completion", async ({ page }) => {
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  const glow = page.locator("[data-progress-glow]");
  await expect(glow).toHaveCount(1);
  const early = Number(await glow.evaluate((el) => el.style.opacity));
  await expect(page.locator("[data-frame-counter]")).toHaveText(/^Frame \d{3} \/ 120$/);

  await expect.poll(async () => Number(await glow.evaluate((el) => el.style.opacity)), { timeout: 15_000 }).toBeGreaterThan(0.5);
  expect(early).toBeLessThan(0.2);
  // The bar grows by transform, not width
  const bar = page.getByRole("progressbar", { name: "Generation progress" }).locator("div");
  expect(await bar.evaluate((el) => el.style.transform)).toMatch(/^scaleX\(/);
});

test("sheets and the catalog slide in on the spec'd spring", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Create" }).click();
  const flyout = page.getByRole("dialog", { name: "Create" });
  expect(await flyout.evaluate((el) => getComputedStyle(el).animationName)).toBe("slide-from-left");
  expect(await flyout.evaluate((el) => getComputedStyle(el).animationTimingFunction)).toMatch(/^linear\(/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ai/video");
  await page.getByRole("button", { name: "Settings" }).click();
  const sheet = page.getByRole("dialog", { name: "Settings" });
  expect(await sheet.evaluate((el) => getComputedStyle(el).animationName)).toBe("sheet-up");
});

test("feed media shows a shimmer until its still has loaded, then drops it", async ({ page }) => {
  await page.goto("/explore");
  const first = page.locator("main article").first();
  await expect(first.locator("[data-skeleton]")).toHaveCount(0, { timeout: 15_000 });
});
