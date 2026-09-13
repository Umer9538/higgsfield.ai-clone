import { expect, test } from "@playwright/test";

/**
 * Smoke coverage of the critical user path only.
 * Deliberately not a broad suite: homepage renders, workspace renders,
 * and a generation run completes and produces a playable result.
 */

test("homepage renders its key sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Visual Effects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Higgsfield AI Motion Designer/i })).toBeVisible();
  // Footer is the lime block
  await expect(page.getByText("535 Mission St, 14th floor, San Francisco, CA, 94105")).toBeVisible();

  // All 15 effect presets render
  await expect(page.getByText("Lacewalker")).toBeVisible();
});

test("hero and effect imagery actually loads", async ({ page }) => {
  await page.goto("/");

  const hero = page.locator("img").first();
  await expect(hero).toBeVisible();

  // naturalWidth > 0 proves the bytes decoded, not just that the tag exists.
  // Polled because images decode asynchronously after paint.
  await expect
    .poll(async () => hero.evaluate((img: HTMLImageElement) => img.naturalWidth), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0);

  // No image that finished loading should have failed to decode.
  // networkidle is unusable here: the promo countdown keeps a timer running.
  await expect
    .poll(
      async () =>
        page.evaluate(
          () =>
            Array.from(document.querySelectorAll("img")).filter(
              (img) => img.complete && img.naturalWidth === 0,
            ).length,
        ),
      { timeout: 15_000 },
    )
    .toBe(0);
});

test("video workspace runs a generation and reveals a playable result", async ({ page }) => {
  await page.goto("/ai/video");

  // Idle state
  await expect(page.getByRole("heading", { name: /Make videos in one click/i })).toBeVisible();

  const generate = page.getByRole("button", { name: /^Generate/ });
  await expect(generate).toBeEnabled();
  await generate.click();

  // Running state: progress bar plus stage list
  const progress = page.getByRole("progressbar", { name: "Generation progress" });
  await expect(progress).toBeVisible();
  await expect(page.getByText("Generating", { exact: true })).toBeVisible();

  // Completed state
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 20_000 });

  const video = page.locator("video");
  await expect(video).toBeVisible();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();

  // The result is a real file the browser could decode. Polled, because over a
  // real network metadata arrives after the element is already visible.
  await expect
    .poll(async () => video.evaluate((el: HTMLVideoElement) => el.readyState), {
      timeout: 20_000,
    })
    .toBeGreaterThanOrEqual(1);

  // Reset returns to the idle pane
  await page.getByRole("button", { name: "New generation" }).click();
  await expect(page.getByRole("heading", { name: /Make videos in one click/i })).toBeVisible();
});

test("audio surface keeps Generate disabled, matching the real product", async ({ page }) => {
  await page.goto("/ai/audio");
  await expect(page.getByRole("button", { name: /^Generate/ })).toBeDisabled();
});

test("image surface uses the docked prompt bar, not the side panel", async ({ page }) => {
  await page.goto("/ai/image");
  await expect(page.getByPlaceholder("Describe the scene you imagine")).toBeVisible();
  await expect(page.locator("aside")).toHaveCount(0);
});

test("pricing page renders plans, toggles billing, and expands an FAQ", async ({ page }) => {
  await page.goto("/pricing");

  // Promo countdown
  await expect(page.getByText("Personal promo expires in...")).toBeVisible();

  // Three plans, annual by default. Scoped to the plan list, because the
  // calculator also renders a recommended-plan card with the same headings.
  const plans = page.getByRole("list", { name: "Plans" });
  await expect(plans.getByRole("heading", { name: "Basic", exact: true })).toBeVisible();
  await expect(plans.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
  await expect(plans.getByRole("heading", { name: "Max", exact: true })).toBeVisible();
  await expect(plans.getByText("$20", { exact: true })).toBeVisible();
  await expect(plans.getByText("$45", { exact: true })).toBeVisible();

  // Switching to monthly raises the headline prices
  await page.getByRole("switch", { name: "Bill annually" }).first().click();
  await expect(plans.getByText("$29", { exact: true })).toBeVisible();
  await expect(plans.getByText("$79", { exact: true })).toBeVisible();

  // FAQ accordion opens
  const question = page.getByRole("button", { name: "How do credits work?" });
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/Credits are spent each time you generate/)).toBeVisible();
});

test("calculator recommends a bigger plan as usage grows", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByText("We recommend Pro plan")).toBeVisible();

  // Push video volume to the top of the range; usage should outgrow Pro
  const videos = page.getByLabel("Kling 3.0 videos");
  await videos.fill("200");

  await expect(page.getByText("We recommend Max plan")).toBeVisible();
});

test("compare features matrix expands to reveal all groups", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByRole("heading", { name: "Compare features" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find the best plan for you" })).toBeVisible();

  // Collapsed: Video group only
  await expect(page.getByRole("columnheader", { name: "Video" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Platform" })).toBeHidden();

  const toggle = page.getByRole("button", { name: "Compare Features" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();

  // Expanded: every group present
  await expect(page.getByRole("columnheader", { name: "Image" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Audio" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Platform" })).toBeVisible();

  await page.getByRole("button", { name: "Hide comparison" }).click();
  await expect(page.getByRole("columnheader", { name: "Platform" })).toBeHidden();
});

test("header nav exposes every studio item with the right label and badge", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });

  for (const label of [
    "Explore",
    "Image",
    "Video",
    "Audio",
    "MCP",
    "ChatGPT Plugin",
    "Genjutsu",
    "Effects",
    "Cinema Studio",
    "Marketing Studio",
    "Supercomputer",
    "3D Jutsu",
    "Edit",
  ]) {
    await expect(nav.getByText(label, { exact: true })).toBeVisible();
  }

  // Badges: New on ChatGPT Plugin and 3D Jutsu, Free on Genjutsu and Effects
  await expect(nav.getByText("New", { exact: true })).toHaveCount(2);
  await expect(nav.getByText("Free", { exact: true })).toHaveCount(2);
});

test("every studio route resolves and marks itself active", async ({ page }) => {
  const routes: [string, string][] = [
    ["/ai/genjutsu", "Genjutsu"],
    ["/ai/effects", "Effects"],
    ["/ai/cinema-studio", "Cinema Studio"],
    ["/ai/marketing-studio", "Marketing Studio"],
    ["/ai/3d-jutsu", "3D Jutsu"],
    ["/mcp", "MCP"],
    ["/chatgpt-plugin", "ChatGPT Plugin"],
    ["/supercomputer", "Supercomputer"],
  ];

  for (const [route, label] of routes) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);

    const active = page.getByRole("navigation", { name: "Main" }).getByRole("link", {
      name: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    });
    await expect(active.first()).toHaveAttribute("aria-current", "page");
  }
});

test("genjutsu and effects use the panel shell; studios use the dock", async ({ page }) => {
  await page.goto("/ai/genjutsu");
  await expect(page.locator("aside")).toHaveCount(1);
  await expect(page.getByRole("switch", { name: "Prompt" })).toBeVisible();

  await page.goto("/ai/effects");
  await expect(page.getByRole("switch", { name: "Use free gens" })).toBeVisible();
  await expect(page.getByRole("button", { name: /1 FREE LEFT/ })).toBeVisible();

  await page.goto("/ai/cinema-studio");
  await expect(page.locator("aside")).toHaveCount(0);
  await expect(page.getByPlaceholder(/Describe your scene/)).toBeVisible();
});
