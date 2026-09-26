import { expect, test, type Page } from "@playwright/test";

/** A generated result is on screen in the Video studio. */
async function generateVideo(page: Page) {
  await page.goto("/ai/video");
  await page.locator("#prompt").fill("Drone pass over a stadium at dusk");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 25_000 });
  const video = page.locator("video").first();
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.readyState), { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
  return video;
}

test.describe("node canvas", () => {
  test("cables are springy beziers that settle, with live frame stats", async ({ page }) => {
    await page.goto("/canvas");
    const cable = page.locator("[data-cable] path").first();
    await expect.poll(() => cable.getAttribute("d")).toMatch(/^M [\d.]+ [\d.]+ C /);
    const rest = await cable.getAttribute("d");

    const handle = page.getByRole("button", { name: "Move Video Output node" });
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + 5, box.y + 5);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + 5 - i * 15, box.y + 5 + i * 12);

    // Measured while moving: per-frame cost and frame rate
    await expect(page.locator("[data-cable-stats]")).toHaveText(/ms\/frame · \d+ fps/);
    await page.mouse.up();

    await expect.poll(() => cable.getAttribute("d")).not.toBe(rest);
    // …and the loop stops itself once the springs are at rest
    await expect(page.locator("[data-cable-stats]")).toHaveAttribute("data-running", "false", { timeout: 5_000 });
  });

  test("with reduced motion the cable snaps instead of swinging", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/canvas");
    const cable = page.locator("[data-cable] path").first();
    await expect.poll(() => cable.getAttribute("d")).toMatch(/ C /);

    const handle = page.getByRole("button", { name: "Move Video Output node" });
    await handle.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const first = await cable.getAttribute("d");
    await page.waitForTimeout(150);
    expect(await cable.getAttribute("d")).toBe(first);
  });

  test("output node badges follow its inputs and duration", async ({ page }) => {
    await page.goto("/canvas");
    const output = page.locator('[data-node="n-video"]');
    const badges = output.locator("[data-node-badges]");
    await expect(badges).toContainText("2 inputs");
    await expect(badges).toContainText("est. 45 cr");

    await output.getByLabel("Duration").selectOption("10s");
    await expect(badges).toContainText("est. 90 cr");

    await page.getByRole("button", { name: "Delete Text Prompt node" }).click();
    await expect(badges).toContainText("1 input");
  });
});

test.describe("media stage", () => {
  test("frame stepping is frame-accurate and the timecode counts frames", async ({ page }) => {
    const video = await generateVideo(page);
    await page.getByRole("button", { name: "Next frame" }).click();
    await page.getByRole("button", { name: "Next frame" }).click();
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeCloseTo(2 / 30, 2);
    await expect(page.locator("[data-timecode]")).toContainText("00:00:00:02");

    await page.getByRole("button", { name: "Previous frame" }).click();
    await expect(page.locator("[data-timecode]")).toContainText("00:00:00:01");

    // Keyboard: "." steps forward from anywhere in the player
    await page.keyboard.press(".");
    await expect(page.locator("[data-timecode]")).toContainText("00:00:00:02");
  });

  test("hovering the scrubber previews that moment from a filmstrip", async ({ page }) => {
    await generateVideo(page);
    const seek = page.getByRole("slider", { name: "Seek" });
    const box = (await seek.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);

    const preview = page.locator("[data-scrub-preview]");
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(/00:00:0\d:\d\d/);
    // The sprite is sampled from the real video after the page settles
    await expect
      .poll(() => preview.locator("div").first().evaluate((el) => getComputedStyle(el).backgroundImage), { timeout: 20_000 })
      .toContain("data:image/jpeg");
  });

  test("compare splits preview pass and final render, by keyboard and pointer", async ({ page }) => {
    await generateVideo(page);
    await page.getByRole("button", { name: "Compare" }).click();

    const split = page.getByRole("slider", { name: "Comparison split" });
    await expect(split).toHaveAttribute("aria-valuenow", "50");
    await split.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(split).toHaveAttribute("aria-valuenow", "48");
    await expect(page.locator("[data-compare] canvas")).toHaveAttribute("style", /inset\(0px 52% 0px 0px\)|inset\(0 52% 0 0\)/);

    const stage = (await page.locator("[data-compare]").boundingBox())!;
    const handle = (await split.boundingBox())!;
    await page.mouse.move(handle.x + handle.width / 2, stage.y + stage.height / 2);
    await page.mouse.down();
    await page.mouse.move(stage.x + stage.width * 0.25, stage.y + stage.height / 2, { steps: 5 });
    await page.mouse.up();
    const value = Number(await split.getAttribute("aria-valuenow"));
    expect(value).toBeGreaterThan(20);
    expect(value).toBeLessThan(30);

    await expect(page.getByText("Preview pass")).toBeVisible();
    await expect(page.getByText("Final render")).toBeVisible();
  });
});

test.describe("command matrix and HUD", () => {
  test("in a studio, ⌘K offers its own commands: looks, prompt copy, JSON", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/ai/cinema-studio");
    await expect(page.locator("html[data-palette-ready]")).toHaveCount(1);
    await page.getByPlaceholder(/Describe your scene/).fill("Lighthouse in a storm");

    // A look sets several parameters in one step
    await page.keyboard.press("Control+k");
    await page.getByRole("option", { name: "Apply look: Noir" }).click();
    const settings = page.getByRole("complementary", { name: "Settings" });
    await expect(settings.getByRole("button", { name: /^Camera/ })).toContainText("50mm");
    await expect(settings.getByRole("button", { name: /^Color palette/ })).toContainText("Monochrome");
    await expect(settings.getByRole("button", { name: "Reset 4" })).toBeVisible();

    await page.keyboard.press("Control+k");
    await page.getByRole("option", { name: "Copy prompt" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("Lighthouse in a storm");

    await page.keyboard.press("Control+k");
    await page.getByRole("option", { name: "Inspect generation JSON" }).click();
    const json = page.getByRole("dialog", { name: "Generation metadata" }).locator("[data-json-view]");
    await expect(json).toContainText('"studio": "cinema-studio"');
    await expect(json).toContainText('"prompt": "Lighthouse in a storm"');
    await expect(json).toContainText('"Camera": "50mm"');
  });

  test("studio commands only appear inside a studio", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("html[data-palette-ready]")).toHaveCount(1);
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("option", { name: "Copy prompt" })).toHaveCount(0);
    await expect(page.getByRole("option", { name: "Toggle performance HUD" })).toBeVisible();
  });

  test("Shift+D toggles a HUD of measured metrics, but not while typing", async ({ page }) => {
    await page.goto("/ai/cinema-studio");
    await expect(page.locator("html[data-palette-ready]")).toHaveCount(1);
    const hud = page.getByRole("complementary", { name: "Performance HUD" });

    // Typing a capital D into the prompt must not open it
    const prompt = page.getByPlaceholder(/Describe your scene/);
    await prompt.click();
    await page.keyboard.press("Shift+D");
    await expect(prompt).toHaveValue("D");
    await expect(hud).toHaveCount(0);

    await page.locator("main").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("Shift+D");
    await expect(hud).toBeVisible();
    await expect.poll(async () => Number((await hud.locator('[data-hud="fps"]').textContent())?.match(/\d+/)?.[0])).toBeGreaterThan(0);
    await expect(hud.locator('[data-hud="gpu"]')).not.toBeEmpty();
    await expect(hud.locator('[data-hud="studio"]')).toHaveText("Cinema Studio");

    // Remembered for this viewer, and closable from ⌘K
    await page.reload();
    await expect(hud).toBeVisible();
    await page.keyboard.press("Control+k");
    await page.getByRole("option", { name: "Toggle performance HUD" }).click();
    await expect(hud).toHaveCount(0);
  });

  test("the HUD reports real /api latency from Resource Timing", async ({ page }) => {
    await page.goto("/assets"); // fetches /api/generations on load
    await expect(page.locator("html[data-palette-ready]")).toHaveCount(1);
    await page.keyboard.press("Shift+D");
    await expect(page.getByRole("complementary", { name: "Performance HUD" }).locator('[data-hud="api"]')).toContainText(
      /generations \d+ ms/,
      { timeout: 10_000 },
    );
  });
});
