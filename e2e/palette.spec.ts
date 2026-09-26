import { expect, test } from "./fixtures";

/** The command palette: shortcuts, navigation and keyboard selection. */

test("command palette opens on Ctrl/Cmd+K and navigates", async ({ page }) => {
  await page.goto("/");

  // Wait for the shortcut listener to attach, otherwise the keypress races hydration.
  await page.locator("html[data-palette-ready='true']").waitFor();

  // Headless Chromium on macOS swallows a real Cmd+K before the page sees it,
  // so the driven keystroke uses Control. The metaKey path is asserted below.
  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "Command palette" });
  await expect(palette).toBeVisible();

  // Fuzzy search narrows the list
  await palette.getByRole("combobox").fill("canvas");
  const options = palette.getByRole("option");
  await expect(options.first()).toContainText("Open Canvas");

  // Keyboard navigation and Enter
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/canvas$/);

  // Escape closes it
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toHaveCount(0);
});

test("the Cmd (meta) shortcut is wired, not just Ctrl", async ({ page }) => {
  await page.goto("/");
  await page.locator("html[data-palette-ready='true']").waitFor();
  await page.evaluate(() =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })),
  );
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
});

test("palette arrow keys move the selection", async ({ page }) => {
  await page.goto("/");
  await page.locator("html[data-palette-ready='true']").waitFor();
  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "Command palette" });

  const first = palette.getByRole("option").first();
  await expect(first).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowDown");
  await expect(first).toHaveAttribute("aria-selected", "false");
  await expect(palette.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
});
