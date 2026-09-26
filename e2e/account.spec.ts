import { expect, test, type Page } from "@playwright/test";
import { settle } from "./helpers";

async function signIn(page: Page) {
  await page.goto("/pricing");
  await page.getByRole("banner").getByRole("button", { name: "Log in" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL(/\/explore$/);
}

test("the account menu opens the real Profile and Settings pages", async ({ page }) => {
  await signIn(page);
  const account = page.getByRole("banner").getByRole("button", { name: "Account" });

  await account.click();
  await page.getByRole("menuitem", { name: "Profile" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("google.creator");

  await account.click();
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
});

test("profile: display name edits persist, and stats count real generations", async ({ page }) => {
  await signIn(page);
  await page.goto("/profile");
  await expect(page.locator('[data-stat="Generations"]')).toHaveText("0");

  await page.getByRole("button", { name: "Edit display name" }).click();
  await page.getByLabel("Display name").fill("Ava Director");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ava Director");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ava Director");

  // Run one generation, then it counts and shows
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 25_000 });
  await page.goto("/profile");
  await expect(page.locator('[data-stat="Generations"]')).toHaveText("1");
  await expect(page.locator('[data-stat="Videos"]')).toHaveText("1");
  await expect(page.getByRole("list", { name: "Recent generations" }).getByRole("listitem")).toHaveCount(1);
});

test("profile shows the onboarding preset and reopens it", async ({ page }) => {
  await signIn(page);
  await page.goto("/profile");
  await expect(page.getByRole("link", { name: "Make your first frame" })).toBeVisible();

  await page.goto("/welcome-quiz");
  await page.getByRole("radio", { name: /Cinematic Video/ }).click();
  await page.getByRole("radio", { name: "Monochrome noir" }).click();
  await page.getByRole("button", { name: "Render a test frame" }).click();
  await page.getByRole("button", { name: "Open Workspace with This Preset" }).click({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/ai\/cinema-studio\?/);

  await page.goto("/profile");
  await expect(page.getByRole("list", { name: "Preset settings" })).toContainText("Monochrome");
  await page.getByRole("link", { name: "Open this preset" }).click();
  await expect(page).toHaveURL(/\/ai\/cinema-studio\?/);
  await expect(page.getByRole("complementary", { name: "Settings" }).getByRole("button", { name: /^Color palette/ })).toContainText(
    "Monochrome",
  );
});

test("settings: reduced motion persists app-wide, data can be cleared, onboarding re-runs", async ({ page }) => {
  await signIn(page);
  await page.goto("/settings");

  const motion = page.getByRole("switch", { name: "Reduce motion" });
  // Off means the knob sits at the left of the track
  const knobOffset = () =>
    motion.evaluate((el) => el.querySelector("[data-knob]")!.getBoundingClientRect().left - el.getBoundingClientRect().left);
  expect(await knobOffset()).toBeLessThan(8);
  await motion.click();
  await expect.poll(knobOffset).toBeGreaterThan(20);
  await expect(motion).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).toHaveClass(/reduce-motion/);
  await page.goto("/explore"); // survives navigation and reload
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/reduce-motion/);

  // Clearing is two-step
  await page.evaluate(() =>
    localStorage.setItem("hf.generatedAssets", JSON.stringify([{ id: "g1", title: "t", kind: "image", model: "m", prompt: "p", createdAt: "2026-01-01", src: "/media/results/image.jpg", meta: "" }])),
  );
  await page.goto("/settings#data");
  await page.getByRole("button", { name: "Clear…" }).click();
  await page.getByRole("button", { name: "Clear 1" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText("Saved generations cleared");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("hf.generatedAssets") ?? "[]").length)).toBe(0);

  // Everything stored is listed
  const stored = page.getByRole("list", { name: "Stored in this browser" });
  for (const key of ["hf.auth", "hf.generatedAssets", "hf.onboarding", "hf.prefs"]) await expect(stored).toContainText(key);

  await page.getByRole("button", { name: "Run again" }).click();
  await expect(page).toHaveURL(/\/welcome-quiz$/);
});

test("signed out, account pages explain themselves instead of redirecting", async ({ page }) => {
  for (const route of ["/profile", "/settings"]) {
    await page.goto(route);
    expect(new URL(page.url()).pathname).toBe(route);
  }
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Sign in to see your profile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
});

test("footer links all go somewhere real, and to the right place", async ({ page }) => {
  await page.goto("/pricing");
  const footer = page.getByRole("navigation", { name: "Footer" });
  const expected: Record<string, string> = {
    "AI Video": "/ai/video",
    "Seedance 2.5": "/ai/video",
    "GPT Image 2": "/ai/image",
    "Kling 3.0 Motion Control": "/ai/motion-control",
    "Cinema Studio": "/ai/cinema-studio",
    "MCP / CLI": "/mcp",
    Enterprise: "/enterprise",
  };
  for (const [label, href] of Object.entries(expected)) {
    await expect(footer.getByRole("link", { name: label, exact: true }).first()).toHaveAttribute("href", href);
  }

  const hrefs = await page.locator("footer a").evaluateAll((links) => links.map((a) => a.getAttribute("href")!));
  for (const href of new Set(hrefs.map((h) => h.split("#")[0]))) {
    const response = await page.request.get(href);
    expect(response.status(), href).toBe(200);
  }
  await expect(page.locator("footer button")).toHaveCount(0);
});

test("no page ships a link-shaped button that goes nowhere", async ({ page }) => {
  test.setTimeout(120_000);
  for (const route of [
    "/", "/explore", "/pricing", "/assets", "/enterprise", "/canvas", "/academy", "/community",
    "/contests", "/plugins", "/originals", "/mcp", "/chatgpt-plugin", "/supercomputer", "/profile",
    "/settings", "/ai/video", "/ai/cinema-studio",
  ]) {
    await page.goto(route);
    await expect(page.locator("[data-unbuilt-link]"), route).toHaveCount(0);
  }
});

test("pricing footnotes open the FAQ answer they ask about", async ({ page }) => {
  await page.goto("/pricing");
  await page.getByRole("link", { name: /What are Unlimited models\?/ }).click();
  await expect(page).toHaveURL(/#faq-how-does-unlimited-work$/);
  await expect(page.getByRole("button", { name: "How does Unlimited work?" })).toHaveAttribute("aria-expanded", "true");
});

test("the account menu sits above page sticky bars once the page has settled", async ({ page }) => {
  await signIn(page); // lands on /explore, whose filter bar is sticky
  await settle(page); // the bug only showed after the entry animation ended
  await page.getByRole("banner").getByRole("button", { name: "Account" }).click();
  for (const label of ["Profile", "Settings", "Onboarding", "Sign out"]) {
    const item = page.getByRole("menuitem", { name: label });
    const box = (await item.boundingBox())!;
    const onTop = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('[role="menuitem"]')?.textContent?.trim() ?? null,
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    expect(onTop, label).toBe(label);
  }
});

