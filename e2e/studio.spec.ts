import { expect, test } from "./fixtures";

/** Studios: generation runs, the canvas + prompt bar + inspector shell, controls and results. */

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

test("every studio shares one canvas, prompt bar and inspector", async ({ page }) => {
  for (const [route, prompt] of [
    ["/ai/image", page.getByPlaceholder("Describe the scene you imagine")],
    ["/ai/video", page.locator("#prompt")],
    ["/ai/cinema-studio", page.getByPlaceholder(/Describe your scene/)],
    ["/ai/audio", page.locator("#script")],
  ] as const) {
    await page.goto(route);
    await expect(page.getByRole("complementary", { name: "Settings" }), route).toBeVisible();
    await expect(page.locator("aside"), route).toHaveCount(1);
    await expect(prompt, route).toBeVisible();
    await expect(page.getByRole("button", { name: /^Generate/ }), route).toHaveCount(1);
  }
});

test("the inspector collapses on desktop and hands the canvas the width", async ({ page }) => {
  await page.goto("/ai/video");
  const canvas = page.getByRole("region", { name: /canvas$/ });
  const before = (await canvas.boundingBox())!.width;
  // Change a setting first, so the round trip can prove it survives
  const pill = page.getByRole("button", { name: /^5s setting/ });
  await pill.click();
  await expect(pill).toContainText("8s");

  await page.getByRole("button", { name: "Hide settings" }).click();
  await expect(page.getByRole("complementary", { name: "Settings" })).toBeHidden();
  expect((await canvas.boundingBox())!.width).toBeGreaterThan(before + 300);

  // Field state survives the round trip: the inspector stays mounted
  await page.getByRole("button", { name: "Show settings" }).click();
  await expect(page.getByRole("complementary", { name: "Settings" })).toBeVisible();
  await expect(pill).toContainText("8s");
});

test("genjutsu and effects keep their switches in the inspector", async ({ page }) => {
  await page.goto("/ai/genjutsu");
  await expect(page.locator("aside")).toHaveCount(1);
  await expect(page.getByRole("complementary", { name: "Settings" }).getByRole("switch", { name: "Prompt" })).toBeVisible();

  await page.goto("/ai/effects");
  await expect(page.getByRole("switch", { name: "Use free gens" })).toBeVisible();
  await expect(page.getByRole("button", { name: /1 FREE LEFT/ })).toBeVisible();

  // No prompt field: the bar says so instead of showing an empty box
  await expect(page.getByText("No prompt needed. Add your inputs in Settings, then generate.")).toBeVisible();
});

test("result actions produce real feedback and a real download", async ({ page }) => {
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 20_000 });

  // Share copies and toasts
  await page.getByRole("button", { name: "Share" }).click();
  await expect(page.locator("[data-toast]")).toContainText(/copied|blocked/i);

  // Upscale queues with explicit feedback
  await page.getByRole("button", { name: "Upscale" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText(/Upscaling queued/i);

  // Download produces an actual file
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 15_000 }),
    page.getByRole("button", { name: "Download" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.(mp4|jpg)$/);
});

test("workspace controls mutate state rather than sitting inert", async ({ page }) => {
  await page.goto("/ai/video");

  // Output pills cycle
  const pill = page.getByRole("button", { name: /^5s setting/ });
  await expect(pill).toContainText("5s");
  await pill.click();
  await expect(pill).toContainText("8s");

  // Select row opens a listbox and changes the value
  // The picker, not the inspector's "Model" section heading
  const model = page.getByRole("complementary", { name: "Settings" }).getByRole("button", { name: /^Model\s?\S/ });
  await model.click();
  await page.getByRole("option", { name: "Kling 3.0" }).click();
  await expect(model).toContainText("Kling 3.0");

  // Preset card swaps
  await page.getByRole("button", { name: "Change" }).click();
  await page.getByRole("option", { name: "High flip" }).click();
  await expect(page.getByText("High flip")).toBeVisible();
});

test("magic enhance appends cinema parameters and names the model", async ({ page }) => {
  await page.goto("/ai/video");

  const prompt = page.locator("#prompt");
  await prompt.fill("A skater carving an empty pool");

  await page.getByRole("button", { name: "Magic Enhance" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText("Prompt enhanced for Seedance 2.5");

  const value = await prompt.inputValue();
  expect(value).toContain("A skater carving an empty pool");
  expect(value).toContain("cinematic lighting");
  expect(value).toContain("35mm lens");
  expect(value).toContain("photorealistic render");

  // Enhancing twice does not duplicate the parameters
  await page.getByRole("button", { name: "Magic Enhance" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText("already enhanced");
  expect((await prompt.inputValue()).match(/35mm lens/g)?.length).toBe(1);
});

test("marketing studio templates filter by category and media type", async ({ page }) => {
  await page.goto("/ai/marketing-studio");

  const label = page.getByText(/Showing \d+ .* templates/);
  const cards = page.getByRole("list", { name: "Templates" }).getByRole("listitem");
  const all = await cards.count();
  expect(all).toBeGreaterThan(8);

  await page.getByRole("button", { name: "UGC", exact: true }).click();
  const ugc = await cards.count();
  expect(ugc).toBeLessThan(all);
  await expect(label).toContainText(`Showing ${ugc} ugc templates`);

  // Media type narrows further and is reflected in the label
  await page.getByRole("button", { name: "Images", exact: true }).click();
  await expect(label).toContainText("images only");

  await page.getByRole("button", { name: "All", exact: true }).first().click();
  await page.getByRole("button", { name: "Videos", exact: true }).click();
  const videos = await cards.count();
  expect(videos).toBeGreaterThan(0);
  expect(videos).toBeLessThan(all);
});

test("cinema studio: parameter popovers and the image/video mode switcher", async ({ page }) => {
  await page.goto("/ai/cinema-studio");

  // Parameter pills open a real listbox and apply the choice
  const camera = page.getByRole("button", { name: /^Camera/ });
  await camera.click();
  const options = page.getByRole("listbox", { name: "Camera" });
  await expect(options).toBeVisible();
  await options.getByRole("option", { name: "Anamorphic" }).click();
  await expect(camera).toContainText("Anamorphic");
  await expect(page.locator("[data-toast]").last()).toContainText("Camera: Anamorphic");

  const lighting = page.getByRole("button", { name: /^Lighting/ });
  await lighting.click();
  await page.getByRole("listbox", { name: "Lighting" }).getByRole("option", { name: "Golden Hour" }).click();
  await expect(lighting).toContainText("Golden Hour");

  // Mode switcher changes the composer's model
  // The pill keeps its control name and reports the current value
  const modelPill = page.getByRole("button", { name: /^Cinema Studio 4\.0 setting/ });
  await expect(modelPill).toHaveAttribute("aria-label", /currently Cinema Studio 4\.0/);

  await page.getByRole("button", { name: "Image", exact: true }).click();
  await expect(modelPill).toHaveAttribute("aria-label", /currently Cinema Studio Image/);
  await expect(modelPill).toContainText("Cinema Studio Image");
  await expect(page.locator("[data-toast]").last()).toContainText("Switched to image");

  await page.getByRole("button", { name: "Video", exact: true }).click();
  await expect(modelPill).toHaveAttribute("aria-label", /currently Cinema Studio 4\.0/);
});

test("result video scrubber, mute and play controls respond", async ({ page }) => {
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 20_000 });

  const video = page.locator("video").first();
  await expect.poll(async () => video.evaluate((el: HTMLVideoElement) => el.readyState)).toBeGreaterThanOrEqual(1);

  // Play, then pause
  await page.getByRole("button", { name: "Play" }).first().click();
  await expect.poll(async () => video.evaluate((el: HTMLVideoElement) => !el.paused)).toBe(true);
  await page.getByRole("button", { name: "Pause" }).first().click();
  await expect.poll(async () => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);

  // Scrubbing moves the playhead
  const seek = page.getByRole("slider", { name: "Seek" });
  await seek.fill("2");
  await expect.poll(async () => video.evaluate((el: HTMLVideoElement) => Math.round(el.currentTime))).toBe(2);

  // Mute toggles both ways
  expect(await video.evaluate((el: HTMLVideoElement) => el.muted)).toBe(true);
  await page.getByRole("button", { name: "Unmute" }).click();
  expect(await video.evaluate((el: HTMLVideoElement) => el.muted)).toBe(false);
  await page.getByRole("button", { name: "Mute" }).click();
  expect(await video.evaluate((el: HTMLVideoElement) => el.muted)).toBe(true);
});
