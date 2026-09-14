import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/", "/explore", "/pricing", "/assets", "/enterprise", "/canvas", "/academy",
  "/community", "/contests", "/plugins", "/originals", "/mcp", "/chatgpt-plugin",
  "/supercomputer", "/ai/video", "/ai/image", "/ai/audio", "/ai/edit",
  "/ai/motion-control", "/ai/genjutsu", "/ai/effects", "/ai/cinema-studio",
  "/ai/marketing-studio", "/ai/3d-jutsu",
];

const MOBILE = { width: 390, height: 844 };   // iPhone 12/13/14
const TABLET = { width: 768, height: 1024 };  // iPad

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    return de.scrollWidth - de.clientWidth;
  });
}

for (const [name, viewport] of [["mobile", MOBILE], ["tablet", TABLET]] as const) {
  test(`${name}: no horizontal overflow on any route`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const offenders: string[] = [];

    for (const route of ROUTES) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should return 200`).toBe(200);
      const overflow = await horizontalOverflow(page);
      if (overflow > 0) offenders.push(`${route} overflows by ${overflow}px`);
      await expect(page.getByRole("banner")).toBeVisible();
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });
}

test("mobile: hamburger drawer replaces the horizontal nav", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/");

  // The desktop nav is hidden; the hamburger is the way in
  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

  const burger = page.getByRole("button", { name: "Open menu" });
  await expect(burger).toBeVisible();
  await burger.click();

  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await expect(drawer).toBeVisible();

  // A visible element can still be mispositioned: assert the panel actually
  // fills the viewport height and paints an opaque background behind the list.
  const box = await drawer.boundingBox();
  expect(box!.height).toBeGreaterThan(MOBILE.height * 0.9);
  const opaque = await drawer.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(opaque).not.toContain("rgba(0, 0, 0, 0)");

  // Nav items must sit inside the painted panel, not overflow it
  const firstItem = await drawer.getByRole("link").first().boundingBox();
  expect(firstItem!.y + firstItem!.height).toBeLessThanOrEqual(box!.y + box!.height + 1);

  // Every nav destination is reachable, plus search and the action buttons
  for (const label of ["Explore", "Video", "Cinema Studio", "Canvas", "Originals"]) {
    await expect(drawer.getByRole("link", { name: new RegExp(`^${label}$`) })).toBeVisible();
  }
  await expect(drawer.getByPlaceholder("Search models and presets")).toBeVisible();
  await expect(drawer.getByRole("link", { name: /Pricing/ })).toBeVisible();
  await expect(drawer.getByRole("link", { name: "Enterprise" })).toBeVisible();
  await expect(drawer.getByRole("link", { name: "Assets" })).toBeVisible();

  // Navigating closes it
  await drawer.getByRole("link", { name: "Canvas" }).click();
  await expect(page).toHaveURL(/\/canvas$/);
  await expect(page.getByRole("dialog", { name: "Navigation" })).toHaveCount(0);
});

test("desktop keeps the horizontal nav and hides the hamburger", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
});

test("mobile: workspace stacks and its settings collapse", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ai/video");

  const aside = page.locator("aside");
  const main = page.locator("main").first();

  // Stacked, not side by side
  const a = await aside.boundingBox();
  const m = await main.boundingBox();
  expect(a!.width).toBeGreaterThan(MOBILE.width * 0.9);
  expect(m!.y).toBeGreaterThanOrEqual(a!.y);

  // Settings collapse so the content pane is reachable
  const toggle = page.getByRole("button", { name: "Show settings" });
  await expect(toggle).toBeVisible();
  await expect(page.locator("#control-fields")).toBeHidden();
  await toggle.click();
  await expect(page.locator("#control-fields")).toBeVisible();

  // Generate stays reachable at all times
  await expect(page.getByRole("button", { name: /^Generate/ })).toBeVisible();
});

test("mobile: card actions do not depend on hover", async ({ page }) => {
  await page.setViewportSize(MOBILE);

  // Explore: prompt, model badge and Remix are visible without hovering
  await page.goto("/explore");
  const card = page.locator("article").first();
  await expect(card.getByRole("link", { name: "Remix" })).toBeVisible();

  // Assets: the action row is visible without hovering
  await page.goto("/assets");
  const asset = page.getByRole("listitem").first();
  await expect(asset.getByRole("button", { name: /^Download/ })).toBeVisible();
  await expect(asset.getByRole("link", { name: /Open .* in Studio/ })).toBeVisible();
});

test("mobile: primary controls meet a 44px touch target", async ({ page }) => {
  await page.setViewportSize(MOBILE);

  for (const route of ["/ai/video", "/assets", "/canvas", "/academy"]) {
    await page.goto(route);
    const tooSmall = await page.evaluate(() => {
      const bad: string[] = [];
      document.querySelectorAll<HTMLElement>("button, select, [role=tab]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 44) {
          bad.push(`${el.tagName}.${(el.className || "").toString().slice(0, 40)} h=${Math.round(r.height)}`);
        }
      });
      return bad;
    });
    expect(tooSmall, `${route}: ${tooSmall.join(", ")}`).toEqual([]);
  }
});

test("grids collapse to one column on mobile and widen on tablet", async ({ page }) => {
  const columnCount = () =>
    page.evaluate(() => {
      const grid = document.querySelector("ul.grid");
      if (!grid) return 0;
      return getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    });

  await page.setViewportSize(MOBILE);
  await page.goto("/assets");
  expect(await columnCount()).toBe(1);

  await page.setViewportSize(TABLET);
  await page.goto("/assets");
  expect(await columnCount()).toBeGreaterThanOrEqual(2);
});
