import { expect, test } from "./fixtures";

/** The Explore feed: filters, card overlays, Remix and View all. */

test("explore feed filters, searches and sorts", async ({ page }) => {
  await page.goto("/explore");

  await expect(page.getByRole("heading", { name: "Visual Effects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore more AI features" })).toBeVisible();

  const count = page.getByText(/\d+ generations/);
  const initial = Number((await count.textContent())?.match(/\d+/)?.[0]);
  expect(initial).toBeGreaterThan(0);

  // Category tabs narrow the rails
  await page.getByRole("button", { name: "Image", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Visual Effects" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Higgsfield Soul 2.0" })).toBeVisible();

  // Search narrows further
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByPlaceholder("Search prompts, models, creators").fill("skater");
  const searched = Number((await count.textContent())?.match(/\d+/)?.[0]);
  expect(searched).toBeLessThan(initial);

  // Sorting is wired
  await page.getByPlaceholder("Search prompts, models, creators").fill("");
  await page.getByLabel("Sort the feed").selectOption("most-liked");
  await expect(page.getByLabel("Sort the feed")).toHaveValue("most-liked");
});

test("card hover exposes prompt, model badge and a Remix that prefills the prompt", async ({ page }) => {
  await page.goto("/explore");

  const card = page.locator("article").first();
  await card.hover();

  // Model badge and spec tag
  await expect(card.getByText("Higgsfield Effects")).toBeVisible();
  await expect(card.getByText(/\d+s · (1080p|720p|4K)/)).toBeVisible();

  const remix = card.getByRole("link", { name: "Remix" });
  await expect(remix).toBeVisible();

  // Remix carries the prompt through to the video workspace
  const href = await remix.getAttribute("href");
  expect(href).toContain("/ai/video?prompt=");

  const promptText = await card.locator("p").first().textContent();
  await remix.click();
  // Allow for real network latency: the feed streams video while navigating.
  await expect(page).toHaveURL(/\/ai\/video\?prompt=/, { timeout: 20_000 });

  const textarea = page.locator("#prompt");
  await expect(textarea).toHaveValue(promptText!.trim());
});

test("explore 'View all' focuses the feed on that model", async ({ page }) => {
  await page.goto("/explore");

  const count = page.getByText(/\d+ generations/);
  const before = Number((await count.textContent())!.match(/\d+/)![0]);
  await expect(page.getByRole("heading", { name: "Seedance 2.5" })).toBeVisible();

  // Focus one rail
  await page.getByRole("button", { name: /View all Seedance 2\.5/ }).click();

  await expect(count).toContainText("in Seedance 2.5");
  const after = Number((await count.textContent())!.match(/\d+/)![0]);
  expect(after).toBeLessThan(before);

  // Other rails are gone, and the clamp is lifted so everything is visible
  await expect(page.getByRole("heading", { name: "Visual Effects" })).toHaveCount(0);
  await expect(page.locator("[data-rail-cta]")).toHaveCount(0);
  await expect(page.locator("[data-rail-fade]")).toHaveCount(0);

  await page.getByRole("button", { name: "Back to all models" }).click();
  await expect(page.getByRole("heading", { name: "Visual Effects" })).toBeVisible();
  expect(Number((await count.textContent())!.match(/\d+/)![0])).toBe(before);
});
