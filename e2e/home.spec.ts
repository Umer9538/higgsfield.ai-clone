import { expect, test } from "./fixtures";

/** The home page: composer first, then one feed. */

test("homepage leads with a composer, then one feed", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "What do you want to make?" })).toBeVisible();
  await expect(page.getByLabel("Describe what you want to make")).toBeVisible();
  const output = page.getByRole("group", { name: "Output" });
  for (const label of ["Image", "Video", "Cinema"]) {
    await expect(output.getByRole("button", { name: label })).toBeVisible();
  }
  await expect(page.getByRole("list", { name: "Starting points" }).getByRole("button")).toHaveCount(4);

  await expect(page.getByRole("heading", { name: "Made with Higgsfield" })).toBeVisible();
  await expect(page.locator("main article").first()).toBeVisible();
  await expect(page.getByText("535 Mission St, 14th floor, San Francisco, CA, 94105")).toBeVisible();
});

test("the home composer opens the chosen studio with the prompt filled in", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Film scene" }).click();
  await expect(page.getByRole("group", { name: "Output" }).getByRole("button", { name: "Cinema" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const prompt = await page.getByLabel("Describe what you want to make").inputValue();
  expect(prompt).toContain("salt flat");

  await page.locator("form").getByRole("button", { name: "Create" }).click();
  await expect(page).toHaveURL(/\/ai\/cinema-studio\?prompt=/, { timeout: 20_000 });
  await expect(page.getByPlaceholder(/Describe your scene/)).toHaveValue(prompt);

  // Enter submits too, into the Video studio's prompt field
  await page.goto("/");
  const composer = page.getByLabel("Describe what you want to make");
  await composer.fill("A paper boat in a gutter stream");
  await composer.press("Enter");
  await expect(page).toHaveURL(/\/ai\/video\?prompt=/, { timeout: 20_000 });
  await expect(page.locator("#prompt")).toHaveValue("A paper boat in a gutter stream");
});

test("remixing on the home page loads the prompt into the composer instead of leaving", async ({ page }) => {
  await page.goto("/");

  const card = page.locator("main article").first();
  await card.hover();
  const promptText = (await card.locator("p").first().textContent())!.trim();
  await card.getByRole("button", { name: "Remix" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel("Describe what you want to make")).toHaveValue(promptText);
  await expect(page.locator("[data-toast]").last()).toContainText("Prompt loaded");
});

test("home feed imagery actually loads", async ({ page }) => {
  await page.goto("/");
  // The feed opens on video; the Image filter surfaces the stills
  await page.getByRole("group", { name: "Feed filter" }).getByRole("button", { name: "Image", exact: true }).click();

  const hero = page.locator("main img").first();
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
