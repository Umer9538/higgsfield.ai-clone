import { expect, test } from "./fixtures";

/** The asset library: filters, search, sort, delete, and generations landing in it. */

test("assets library filters, searches, sorts and deletes", async ({ page }) => {
  const response = await page.goto("/assets");
  expect(response?.status()).toBe(200);

  const tabs = page.getByRole("group", { name: "Asset type" });
  for (const label of ["All", "Videos", "Images", "Audio", "Folders"]) {
    await expect(tabs.getByRole("button", { name: label, exact: true })).toBeVisible();
  }

  const countLine = page.getByText(/\d+ assets$/);
  await expect(countLine).toBeVisible();
  const initial = Number((await countLine.textContent())?.match(/\d+/)?.[0]);

  // Filtering narrows the grid
  await tabs.getByRole("button", { name: "Audio", exact: true }).click();
  const audioCount = Number((await countLine.textContent())?.match(/\d+/)?.[0]);
  expect(audioCount).toBeGreaterThan(0);
  expect(audioCount).toBeLessThan(initial);

  // Folders tab swaps to folder cards
  await tabs.getByRole("button", { name: "Folders", exact: true }).click();
  await expect(page.getByText("Q4 Campaigns")).toBeVisible();

  // Search narrows results
  await tabs.getByRole("button", { name: "All", exact: true }).click();
  await page.getByPlaceholder("Search assets").fill("motorcycle");
  const searched = Number((await countLine.textContent())?.match(/\d+/)?.[0]);
  expect(searched).toBeLessThan(initial);

  // Sorting is available both ways
  await page.getByPlaceholder("Search assets").fill("");
  await page.getByLabel("Sort assets").selectOption("oldest");
  await expect(page.getByLabel("Sort assets")).toHaveValue("oldest");

  // Hover actions exist, and delete actually removes the card
  const first = page.getByRole("main").getByRole("listitem").first();
  await first.hover();
  await expect(first.getByRole("button", { name: /^Download/ })).toBeVisible();
  await expect(first.getByRole("button", { name: /^Copy prompt/ })).toBeVisible();
  // Open in Studio is a real link into the workspace, carrying the prompt
  const openInStudio = first.getByRole("link", { name: /Open .* in Studio/ });
  await expect(openInStudio).toBeVisible();
  await expect(openInStudio).toHaveAttribute("href", /\/ai\/(video|image|audio)\?prompt=/);
  await first.getByRole("button", { name: /^Delete/ }).click();

  const afterDelete = Number((await countLine.textContent())?.match(/\d+/)?.[0]);
  expect(afterDelete).toBe(initial - 1);
});

test("a generation is persisted and appears in the asset library", async ({ page }) => {
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 20_000 });

  const stored = await page.evaluate(() => window.localStorage.getItem("hf.generatedAssets"));
  expect(stored).toBeTruthy();
  expect(JSON.parse(stored!)).toHaveLength(1);

  // It shows in the library without a reload of the store
  await page.goto("/assets");
  const first = page.getByRole("main").getByRole("listitem").first();
  await expect(first).toContainText(/Generation/);
  await expect(first).toContainText("Seedance 2.5");

  // And under the Videos tab
  await page.getByRole("button", { name: "Videos", exact: true }).click();
  await expect(page.getByRole("main").getByRole("listitem").first()).toContainText(/Generation/);
});
