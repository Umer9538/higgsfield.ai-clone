import { expect, test } from "./fixtures";

/** Side rail, Create catalog, secondary pages, the signed-out header and the accent. */

const CATALOG_LABELS = [
  "Image", "Video", "Audio", "Edit", "Motion Control",
  "Cinema Studio", "Marketing Studio", "Genjutsu", "Effects", "3D Jutsu",
  "Canvas", "Supercomputer", "ChatGPT Plugin", "MCP", "Plugins",
];

test("the rail holds five sections and Create opens every model, studio and app", async ({ page }) => {
  await page.goto("/");
  const rail = page.getByRole("navigation", { name: "Main" });

  await expect(rail.getByRole("button", { name: "Create" })).toBeVisible();
  for (const label of ["Explore", "Assets", "Learn", "Pricing"]) {
    await expect(rail.getByRole("link", { name: label, exact: true })).toBeVisible();
  }

  await rail.getByRole("button", { name: "Create" }).click();
  const catalog = page.getByRole("dialog", { name: "Create" });
  await expect(catalog).toBeVisible();
  for (const group of ["Models", "Studios", "Apps"]) {
    await expect(catalog.getByRole("heading", { name: group })).toBeVisible();
  }
  for (const label of CATALOG_LABELS) {
    await expect(catalog.getByRole("link", { name: new RegExp(`^${label}\\b`) }).first()).toBeVisible();
  }

  // Badges: New on ChatGPT Plugin and 3D Jutsu, Free on Genjutsu and Effects
  await expect(catalog.getByText("New", { exact: true })).toHaveCount(2);
  await expect(catalog.getByText("Free", { exact: true })).toHaveCount(2);

  // Escape closes it and hands focus back to Create
  await page.keyboard.press("Escape");
  await expect(catalog).toHaveCount(0);
  await expect(rail.getByRole("button", { name: "Create" })).toBeFocused();
});

test("following any nav link closes the Create catalog", async ({ page }) => {
  await page.goto("/explore");
  const rail = page.getByRole("navigation", { name: "Main" });
  const catalog = page.getByRole("dialog", { name: "Create" });

  for (const [label, path] of [["Assets", "/assets"], ["Explore", "/explore"], ["Learn", "/academy"], ["Pricing", "/pricing"]]) {
    await rail.getByRole("button", { name: "Create" }).click();
    await expect(catalog).toBeVisible();
    await rail.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`), { timeout: 20_000 });
    await expect(catalog).toHaveCount(0);
  }

  // The section you are already on: the route does not change, it still closes
  await rail.getByRole("button", { name: "Create" }).click();
  await rail.getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(catalog).toHaveCount(0);

  // A click outside the panel, and Escape
  await rail.getByRole("button", { name: "Create" }).click();
  await page.mouse.click(1200, 500);
  await expect(catalog).toHaveCount(0);
  await rail.getByRole("button", { name: "Create" }).click();
  await page.keyboard.press("Escape");
  await expect(catalog).toHaveCount(0);
});

test("menus are exclusive and lock the page behind them", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html[data-palette-ready]")).toHaveCount(1);
  const rail = page.getByRole("navigation", { name: "Main" });

  await rail.getByRole("button", { name: "Create" }).click();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  // Opening the palette closes the catalog instead of stacking on it
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Create" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Search commands" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  // Closing the last overlay gives scrolling back
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("secondary pages reveal beside their rail section", async ({ page }) => {
  await page.goto("/");
  const rail = page.getByRole("navigation", { name: "Main" });

  await rail.getByRole("link", { name: "Explore", exact: true }).hover();
  const more = rail.getByRole("list", { name: "More in Explore" });
  await expect(more.getByRole("link", { name: "Community" })).toBeVisible();
  await more.getByRole("link", { name: "Contests" }).click();
  await expect(page).toHaveURL(/\/contests$/);
  await expect(rail.getByRole("link", { name: "Explore", exact: true })).toHaveAttribute("data-active", "true");
});

test("every studio route resolves and marks its place in the nav", async ({ page }) => {
  const routes: [string, string][] = [
    ["/ai/genjutsu", "Genjutsu"],
    ["/ai/effects", "Effects"],
    ["/ai/cinema-studio", "Cinema Studio"],
    ["/ai/marketing-studio", "Marketing Studio"],
    ["/ai/3d-jutsu", "3D Jutsu"],
    ["/mcp", "MCP"],
    ["/chatgpt-plugin", "ChatGPT Plugin"],
    ["/supercomputer", "Supercomputer"],
  ];

  for (const [route, label] of routes) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);

    const rail = page.getByRole("navigation", { name: "Main" });
    const create = rail.getByRole("button", { name: "Create" });
    await expect(create).toHaveAttribute("data-active", "true");

    await create.click();
    const active = page.getByRole("dialog", { name: "Create" }).getByRole("link", {
      name: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    });
    await expect(active.first()).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
  }
});

// Electric Violet #8B5CF6 for fills, #A78BFA for text on dark surfaces.
const ACCENT = "rgb(139, 92, 246)";

const ACCENT_SOFT = "rgb(167, 139, 250)";

test("header shows signed-out controls by default on every public page", async ({ page }) => {
  for (const route of ["/", "/pricing", "/ai/video", "/mcp", "/supercomputer"]) {
    await page.goto(route);
    const header = page.getByRole("banner");
    const rail = page.getByRole("navigation", { name: "Main" });

    await expect(header.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(header.getByRole("button", { name: "Sign up" })).toBeVisible();
    await expect(rail.getByRole("link", { name: "Pricing", exact: true })).toBeVisible();

    // Signed-in chrome must not leak while signed out
    await expect(header.getByRole("button", { name: "Account" })).toHaveCount(0);

    await expect(rail.getByRole("img", { name: "Higgsfield" })).toBeVisible();
  }
});

test("the accent renders as Electric Violet on the active link, New badge and Generate", async ({ page }) => {
  await page.goto("/ai/genjutsu");

  const rail = page.getByRole("navigation", { name: "Main" });
  const active = rail.getByRole("button", { name: "Create" });
  await expect(active).toHaveCSS("color", ACCENT_SOFT);

  // New badge in the catalog: solid violet background, black text
  await active.click();
  const newBadge = page.getByRole("dialog", { name: "Create" }).getByText("New", { exact: true }).first();
  await expect(newBadge).toHaveCSS("background-color", ACCENT);
  await expect(newBadge).toHaveCSS("color", "rgb(0, 0, 0)");

  // Primary action: solid violet background, black text
  const generate = page.getByRole("button", { name: /^Generate/ });
  await expect(generate).toHaveCSS("background-color", ACCENT);
  await expect(generate).toHaveCSS("color", "rgb(0, 0, 0)");
});

test("every nav item links to a working route", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("button", { name: "Create" }).click();

  // Rail links, their hover flyouts (in the DOM while hidden) and the catalog
  const hrefs = [
    ...new Set(
      await nav.locator("a[href]").evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute("href")!),
      ),
    ),
  ];

  // Every destination the old 19-item top bar carried is still reachable
  expect(hrefs.length).toBeGreaterThanOrEqual(19);

  for (const href of hrefs) {
    const response = await page.goto(href as string);
    expect(response?.status(), `${href} should return 200`).toBe(200);
  }
});
