import { type Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const settingsPanel = (page: Page) => page.getByRole("complementary", { name: "Settings" });

async function renderAndOpen(page: Page) {
  await page.getByRole("button", { name: "Render a test frame" }).click();
  await expect(page.locator("[data-render-preview]")).toHaveAttribute("data-done", "true", { timeout: 15_000 });
  await page.getByRole("button", { name: "Open Workspace with This Preset" }).click();
}

test("the sandbox builds a prompt from tags, renders a test frame, and opens a studio set up for it", async ({ page }) => {
  await page.goto("/welcome-quiz");

  // Step 1: one click picks the medium and moves on
  await page.getByRole("radiogroup", { name: "What are you creating today?" }).getByRole("radio", { name: /Cinematic Video/ }).click();
  await expect(page.getByRole("heading", { name: "Build your prompt" })).toBeVisible();

  // Step 2: tags write the prompt live
  const subject = page.getByLabel("What's in the shot?");
  await subject.fill("a lighthouse in a storm");
  await page.getByRole("radio", { name: "Drone flyover" }).click();
  await page.getByRole("radio", { name: "Cyberpunk Obsidian" }).click();
  await page.getByRole("radio", { name: "Hyper-lapse" }).click();
  const live = page.locator("[data-live-prompt]");
  const expected =
    "a lighthouse in a storm, sweeping drone flyover, cyberpunk obsidian palette, teal and magenta neon, hyper-lapse";
  await expect(live).toHaveText(expected);

  const planned = page.getByRole("list", { name: "Studio settings" });
  for (const text of ["Camera 35mm", "Color palette Orange Teal", "Lighting Neon Night", "Film setup Cinematic", "ratio 16:9"]) {
    await expect(planned).toContainText(text);
  }

  // Step 3: a three-second test render with a frame counter
  await page.getByRole("button", { name: "Render a test frame" }).click();
  await expect(page.locator("[data-render-counter]")).toContainText(/Rendering test frame \d{3}\/120/);
  await expect(page.locator("[data-render-preview]")).toHaveAttribute("data-done", "true", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Your first frame" })).toBeVisible();
  await expect(page.locator("[data-render-counter]")).toHaveText("Test frame 120/120 · done");
  // The progress bar really fills (computed, not just the inline style)
  expect(
    await page.locator("[data-render-bar]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
  ).toBeCloseTo(1, 2);

  // Step 4: land in Cinema Studio with the exact prompt and controls applied
  await page.getByRole("button", { name: "Open Workspace with This Preset" }).click();
  await expect(page).toHaveURL(/\/ai\/cinema-studio\?/, { timeout: 20_000 });
  await expect(page.getByPlaceholder(/Describe your scene/)).toHaveValue(expected);
  const settings = settingsPanel(page);
  await expect(settings.getByRole("button", { name: /^Camera/ })).toContainText("35mm");
  await expect(settings.getByRole("button", { name: /^Color palette/ })).toContainText("Orange Teal");
  await expect(settings.getByRole("button", { name: /^Lighting/ })).toContainText("Neon Night");
  await expect(settings.getByRole("button", { name: /^Film setup/ })).toContainText("Cinematic");
  await expect(page.getByRole("button", { name: /^16:9 setting/ })).toHaveAttribute("aria-label", /currently 16:9/);
  await expect(page.locator("[data-toast]").last()).toContainText("Your preset is loaded");

  // Remembered, and onboarding will not prompt again on this device
  const saved = JSON.parse((await page.evaluate(() => localStorage.getItem("hf.onboarding")))!);
  expect(saved).toMatchObject({ medium: "cinematic", prompt: expected, hasCompletedOnboarding: true });
  expect(await page.evaluate(() => localStorage.getItem("hf.onboardingCompleted"))).toBe("true");
});

test("a social reel opens Cinema Studio vertical; a product ad opens Marketing Studio", async ({ page }) => {
  await page.goto("/welcome-quiz");
  await page.getByRole("radio", { name: /Social AI Reel/ }).click();
  await renderAndOpen(page);
  await expect(page).toHaveURL(/\/ai\/cinema-studio\?/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: /^16:9 setting/ })).toHaveAttribute("aria-label", /currently 9:16/);
  await expect(settingsPanel(page).getByRole("button", { name: /^Film setup/ })).toContainText("Music video");

  await page.goto("/welcome-quiz");
  await page.getByRole("radio", { name: /Product Ad/ }).click();
  await renderAndOpen(page);
  await expect(page).toHaveURL(/\/ai\/marketing-studio\?/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Image", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByPlaceholder("Describe what you want to create...")).toHaveValue(/glass serum bottle/);
});

test("Surprise me fills every tag group, and tapping a chosen tag clears it", async ({ page }) => {
  await page.goto("/welcome-quiz");
  await page.getByRole("radio", { name: /3D Game Asset/ }).click();
  await page.getByRole("button", { name: "Surprise me" }).click();

  for (const group of ["Camera angle", "Style", "Motion"]) {
    await expect(page.getByRole("radiogroup", { name: group }).locator('[aria-checked="true"]')).toHaveCount(1);
  }
  const chosen = page.getByRole("radiogroup", { name: "Motion" }).locator('[aria-checked="true"]');
  await chosen.click();
  await expect(page.getByRole("radiogroup", { name: "Motion" }).locator('[aria-checked="true"]')).toHaveCount(0);

  // An empty subject cannot be rendered
  await page.getByLabel("What's in the shot?").fill("");
  await expect(page.getByRole("button", { name: "Render a test frame" })).toBeDisabled();
});

test("studio presets in the URL are validated, not trusted", async ({ page }) => {
  await page.goto("/ai/cinema-studio?set=Camera:999mm&set=ratio:7:3&set=Lighting:Golden%20Hour&set=mode:Nope");
  const settings = settingsPanel(page);
  await expect(settings.getByRole("button", { name: /^Camera/ })).toContainText("Auto");
  await expect(settings.getByRole("button", { name: /^Lighting/ })).toContainText("Golden Hour");
  await expect(page.getByRole("button", { name: /^16:9 setting/ })).toHaveAttribute("aria-label", /currently 16:9/);
});

test("with reduced motion, steps swap without sliding and the render still completes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/welcome-quiz");
  await page.getByRole("radio", { name: /Cinematic Video/ }).click();
  const section = page.locator("main section");
  await expect(page.getByRole("heading", { name: "Build your prompt" })).toBeVisible();
  expect(await section.evaluate((el) => getComputedStyle(el).transform)).toBe("none");

  await page.getByRole("button", { name: "Render a test frame" }).click();
  await expect(page.locator("[data-render-preview]")).toHaveAttribute("data-done", "true", { timeout: 15_000 });
});
