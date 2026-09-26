import { type Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { settle } from "./helpers";

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
    // 24 route loads; the default 30s budget only holds against localhost.
    test.setTimeout(240_000);
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

test("mobile: a tab bar replaces the rail and Create opens the catalog as a sheet", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  const tabs = page.getByRole("navigation", { name: "Sections" });
  await expect(tabs).toBeVisible();
  for (const label of ["Explore", "Assets", "Learn", "Pricing"]) {
    await expect(tabs.getByRole("link", { name: label })).toBeVisible();
  }

  // Pinned to the bottom edge, within thumb reach
  const bar = (await tabs.boundingBox())!;
  expect(bar.y + bar.height).toBeGreaterThanOrEqual(MOBILE.height - 1);

  await tabs.getByRole("button", { name: "Create" }).click();
  const sheet = page.getByRole("dialog", { name: "Create" });
  await expect(sheet).toBeVisible();
  const opaque = await sheet.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(opaque).not.toContain("rgba(0, 0, 0, 0)");

  for (const label of ["Video", "Cinema Studio", "Canvas", "Originals", "Enterprise"]) {
    await expect(sheet.getByRole("link", { name: new RegExp(`^${label}\\b`) }).first()).toBeAttached();
  }

  // Navigating closes it
  await sheet.getByRole("link", { name: /^Canvas/ }).click();
  await expect(page).toHaveURL(/\/canvas$/);
  await expect(page.getByRole("dialog", { name: "Create" })).toHaveCount(0);
});

test("desktop shows the rail and hides the tab bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
});

test("mobile: studio settings open as a sheet and Generate stays pinned", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ai/video");

  const settings = page.getByRole("dialog", { name: "Settings" });
  await expect(settings).toBeHidden();

  // Generate is on screen without scrolling, above the tab bar
  const generate = page.getByRole("button", { name: /^Generate/ });
  const box = (await generate.boundingBox())!;
  const tabs = (await page.getByRole("navigation", { name: "Sections" }).boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(tabs.y);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(settings).toBeVisible();
  await expect(settings.getByRole("group", { name: "Model" })).toBeVisible();
  // Polled: the sheet rises into place over a short reveal animation
  await expect
    .poll(async () => {
      const sheet = (await settings.boundingBox())!;
      return sheet.y + sheet.height;
    })
    .toBeGreaterThanOrEqual(MOBILE.height - 1);

  // The page behind the sheet stays put
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await settings.getByRole("button", { name: "Done" }).click();
  await expect(settings).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("mobile: toasts appear under the top bar, clear of the tab bar and Generate", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ai/cinema-studio");
  await page.getByRole("button", { name: "Add reference" }).click();

  const toast = (await page.locator("[data-toast]").last().boundingBox())!;
  const generate = (await page.getByRole("button", { name: /^Generate/ }).boundingBox())!;
  const tabs = (await page.getByRole("navigation", { name: "Sections" }).boundingBox())!;
  expect(toast.y + toast.height).toBeLessThan(generate.y);
  expect(toast.y + toast.height).toBeLessThan(tabs.y);
});

test("mobile: card actions do not depend on hover", async ({ page }) => {
  await page.setViewportSize(MOBILE);

  // Explore: prompt, model badge and Remix are visible without hovering
  await page.goto("/explore");
  const card = page.locator("article").first();
  await expect(card.getByRole("link", { name: "Remix" })).toBeVisible();

  // Assets: the action row is visible without hovering
  await page.goto("/assets");
  const asset = page.getByRole("main").getByRole("listitem").first();
  await expect(asset.getByRole("button", { name: /^Download/ })).toBeVisible();
  await expect(asset.getByRole("link", { name: /Open .* in Studio/ })).toBeVisible();
});

test("mobile: primary controls meet a 44px touch target", async ({ page }) => {
  await page.setViewportSize(MOBILE);

  for (const route of ["/ai/video", "/assets", "/canvas", "/academy"]) {
    await page.goto(route);
    await settle(page); // entry animations scale items by 0.98 on the way in
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

test("explore rails terminate with a fade and a straddling CTA, with no dead gaps", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore");
  await settle(page);

  const rail = page.locator("section").filter({ hasText: "Visual Effects" }).first();
  const grid = rail.locator("div.grid").first();
  const fade = page.locator("[data-rail-fade]").first();
  const cta = page.locator("[data-rail-cta]").first();

  // The grid is clamped rather than running on
  const gridBox = (await grid.boundingBox())!;
  expect(gridBox.height).toBeLessThanOrEqual(32 * 16 + 2);

  // Fade sits over the bottom of the grid and never eats clicks
  await expect(fade).toBeAttached();
  expect(await fade.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
  const fadeBox = (await fade.boundingBox())!;
  expect(fadeBox.y + fadeBox.height).toBeGreaterThan(gridBox.y + gridBox.height - 40);

  // Pill is centred on the rail and straddles the bottom boundary
  const railBox = (await rail.boundingBox())!;
  const ctaBox = (await cta.boundingBox())!;
  expect(Math.abs(ctaBox.x + ctaBox.width / 2 - (railBox.x + railBox.width / 2))).toBeLessThan(4);
  expect(ctaBox.y).toBeLessThan(gridBox.y + gridBox.height);
  expect(ctaBox.y + ctaBox.height).toBeGreaterThan(gridBox.y + gridBox.height);

  // Dense: every card sits inside the grid's horizontal bounds, no orphan column
  const cards = rail.locator("article");
  const count = await cards.count();
  expect(count).toBeGreaterThan(8);
  for (let i = 0; i < count; i++) {
    const box = await cards.nth(i).boundingBox();
    if (!box) continue;
    expect(box.x).toBeGreaterThanOrEqual(gridBox.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(gridBox.x + gridBox.width + 1);
  }

  // The top row fills every column: no lopsided empty gap beside the first card
  const firstRowTops = [];
  for (let i = 0; i < 5; i++) {
    const box = await cards.nth(i).boundingBox();
    if (box) firstRowTops.push(Math.round(box.y));
  }
  expect(new Set(firstRowTops).size).toBe(1);

  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("hovering a card reveals Remix inside the card, without clipping the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore");

  const card = page.locator("article").first();
  await card.hover();

  const remix = card.getByRole("link", { name: "Remix" });
  await expect(remix).toBeVisible();

  const cardBox = (await card.boundingBox())!;
  const remixBox = (await remix.boundingBox())!;

  // Contained by the card on every edge
  expect(remixBox.x).toBeGreaterThanOrEqual(cardBox.x - 1);
  expect(remixBox.x + remixBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
  expect(remixBox.y + remixBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height + 1);

  // And hovering introduced no scrollbars
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("explore video cards autoplay, are lazy, and keep overlays on top", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore");

  const videos = page.locator("video[data-feed-video]");
  await expect(videos.first()).toBeAttached();

  // Every video carries a poster, so nothing shifts before playback starts
  const total = await videos.count();
  expect(total).toBeGreaterThan(10);
  const postersMissing = await videos.evaluateAll(
    (els) => els.filter((el) => !el.getAttribute("poster")).length,
  );
  expect(postersMissing).toBe(0);

  // Correct playback attributes. preload is "none" rather than "metadata":
  // sources are attached only when a card wins a streaming slot, which is a
  // stronger form of lazy loading than metadata preloading.
  const attrs = await videos.first().evaluate((el: HTMLVideoElement) => ({
    muted: el.muted,
    loop: el.loop,
    playsInline: el.playsInline,
    preload: el.preload,
  }));
  expect(attrs).toEqual({ muted: true, loop: true, playsInline: true, preload: "none" });

  // Lazy and capped: only a handful stream at once, and none offscreen.
  const streaming = await videos.evaluateAll((els) =>
    els.filter((el) => el.getAttribute("src")).length,
  );
  expect(streaming).toBeGreaterThan(0);
  expect(streaming).toBeLessThanOrEqual(4);
  expect(streaming).toBeLessThan(total);

  const offscreenStreaming = await videos.evaluateAll((els) =>
    els.filter((el) => {
      if (!el.getAttribute("src")) return false;
      const box = el.getBoundingClientRect();
      return box.bottom <= 0 || box.top >= window.innerHeight;
    }).length,
  );
  expect(offscreenStreaming).toBe(0);

  // The first card is buffered and actually playing
  const first = videos.first();
  await expect
    .poll(async () => first.evaluate((el: HTMLVideoElement) => el.readyState), { timeout: 20_000 })
    .toBeGreaterThanOrEqual(3);
  await expect
    .poll(async () => first.evaluate((el: HTMLVideoElement) => !el.paused && el.currentTime > 0), {
      timeout: 20_000,
    })
    .toBe(true);

  // Hovering shows the overlay above the video without pausing it
  const card = page.locator("article").first();
  await card.hover();
  await expect(card.getByRole("link", { name: "Remix" })).toBeVisible();
  expect(await first.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
});

test("leaving the feed is not blocked by streaming video", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore");
  // Sync on the condition under test, not a fixed sleep: video is streaming
  await expect(page.locator("main video[src]").first()).toBeAttached({ timeout: 15_000 });

  // Streaming video used to starve navigation (measured 9.0 s to leave Explore
  // on the deployment). The budget sits well under that regression.
  const card = page.locator("article").first();
  await card.hover();

  const started = Date.now();
  await card.getByRole("link", { name: "Remix" }).click();
  await page.waitForURL(/\/ai\/video\?prompt=/, { timeout: 15_000 });
  expect(Date.now() - started).toBeLessThan(4_000);
});

test("leaving the home page is not blocked by its video feed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  // Let the feed start streaming before trying to leave
  await expect(page.locator("main video[src]").first()).toBeAttached({ timeout: 15_000 });

  const started = Date.now();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Learn", exact: true }).click();
  await page.waitForURL(/\/academy$/, { timeout: 15_000 });
  expect(Date.now() - started).toBeLessThan(5_000);

  // Pressing a link aborts every stream at once
  await page.goBack();
  await expect(page.locator("main video[src]").first()).toBeAttached({ timeout: 15_000 });
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Learn", exact: true }).dispatchEvent("pointerdown");
  await expect(page.locator("main video[src]")).toHaveCount(0);
});

