import { expect, test } from "@playwright/test";

/**
 * Backend contract. Runs against whichever store is live: Firestore when the
 * NEXT_PUBLIC_FIREBASE_* variables are set, the in-memory fallback otherwise.
 * Tests use unique prompts because workers share one server.
 */

const unique = (label: string) => `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

test("POST /api/generations stores a record and GET returns it newest first", async ({ request }) => {
  const first = unique("first");
  const second = unique("second");

  for (const prompt of [first, second]) {
    const response = await request.post("/api/generations", {
      data: { prompt, model: "Seedance 2.5", kind: "video", src: "/media/results/result.mp4", spec: "5s" },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.item.id).toBeTruthy();
    expect(body.item.prompt).toBe(prompt);
    expect(Date.parse(body.item.createdAt)).not.toBeNaN();
    expect(["firestore", "memory"]).toContain(body.source);
  }

  const list = await (await request.get("/api/generations?limit=200")).json();
  const prompts: string[] = list.items.map((item: { prompt: string }) => item.prompt);
  expect(prompts).toContain(first);
  expect(prompts).toContain(second);
  // Ordered by createdAt desc
  expect(prompts.indexOf(second)).toBeLessThan(prompts.indexOf(first));
});

test("POST /api/generations rejects incomplete or malformed bodies", async ({ request }) => {
  const missing = await request.post("/api/generations", { data: { prompt: "only a prompt" } });
  expect(missing.status()).toBe(400);
  expect((await missing.json()).error).toMatch(/required/);

  const malformed = await request.post("/api/generations", {
    headers: { "Content-Type": "application/json" },
    data: "{not json",
  });
  expect(malformed.status()).toBe(400);
});

test("favorites persist per owner", async ({ request }) => {
  const owner = unique("owner").replace(/\s/g, "-");

  const created = await request.post("/api/favorites", {
    data: { itemId: "gen-demo", title: "Demo", owner },
  });
  expect(created.status()).toBe(201);

  const mine = await (await request.get(`/api/favorites?owner=${owner}`)).json();
  expect(mine.items.map((item: { itemId: string }) => item.itemId)).toContain("gen-demo");

  const missing = await request.post("/api/favorites", { data: { title: "no id" } });
  expect(missing.status()).toBe(400);
});

test("favoriting the same item twice toggles it off, never duplicates", async ({ request }) => {
  const owner = unique("toggler").replace(/\s/g, "-");
  const body = { itemId: "gen-toggle", title: "Toggle me", owner };

  const on = await request.post("/api/favorites", { data: body });
  expect(on.status()).toBe(201);
  expect((await on.json()).removed).toBe(false);

  const off = await request.post("/api/favorites", { data: body });
  expect(off.status()).toBe(200);
  expect((await off.json()).removed).toBe(true);

  const list = await (await request.get(`/api/favorites?owner=${owner}`)).json();
  expect(list.items.filter((item: { itemId: string }) => item.itemId === "gen-toggle")).toHaveLength(0);

  // And on again, exactly once
  await request.post("/api/favorites", { data: body });
  const again = await (await request.get(`/api/favorites?owner=${owner}`)).json();
  expect(again.items.filter((item: { itemId: string }) => item.itemId === "gen-toggle")).toHaveLength(1);
});

test("a finished generation reports where it was persisted", async ({ page }) => {
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 20_000 });

  const badge = page.locator("[data-persistence]");
  await expect(badge).toBeVisible();
  // Settles on a real destination, never stuck on "saving"
  await expect
    .poll(async () => badge.getAttribute("data-persistence"), { timeout: 15_000 })
    .toMatch(/^(firestore|memory|local)$/);
});

test("synced generations wait behind a pill instead of shifting the grid", async ({ page, request }) => {
  // Seed the backend with something this browser has never seen
  const prompt = unique("synced");
  await request.post("/api/generations", {
    data: { prompt, model: "Kling 3.0", kind: "video", src: "/media/results/result.mp4", spec: "8s" },
  });

  await page.goto("/assets");
  const pill = page.locator("[data-sync-pill]");
  await expect(pill).toBeVisible();

  // Not in the grid until the user asks for it
  await expect(page.getByText(prompt)).toHaveCount(0);

  await pill.click();
  await expect(page.locator("[data-toast]").last()).toContainText(/synced generations? added/);
  await expect(pill).toHaveCount(0);
});

test("studio parameters open a chip grid and reset in one step", async ({ page }) => {
  await page.goto("/ai/cinema-studio");

  const camera = page.getByRole("button", { name: /^Camera/ });
  await camera.click();
  const grid = page.getByRole("listbox", { name: "Camera" });
  // Every option is visible at once, laid out as a grid
  await expect(grid.getByRole("option")).toHaveCount(5);
  expect(await grid.evaluate((el) => getComputedStyle(el).display)).toBe("grid");

  await grid.getByRole("option", { name: "35mm" }).click();
  await page.getByRole("button", { name: /^Lighting/ }).click();
  await page.getByRole("listbox", { name: "Lighting" }).getByRole("option", { name: "Neon Night" }).click();

  const reset = page.getByRole("button", { name: "Reset 2" });
  await expect(reset).toBeVisible();
  await reset.click();
  await expect(camera).toContainText("Auto");
  await expect(page.getByRole("button", { name: /^Reset/ })).toHaveCount(0);
});

test("mobile: studio parameters fold behind a disclosure that reports what is set", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ai/cinema-studio");

  const toggle = page.getByRole("button", { name: /^Parameters/ });
  const panel = page.locator("#studio-parameters");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();
  await expect(toggle).toContainText("All auto");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel.getByRole("group", { name: "Look" })).toBeVisible();
  await expect(panel.getByRole("group", { name: "Lens" })).toBeVisible();

  // References is a counter, not a picker: it must not claim to be configured
  const references = panel.getByRole("button", { name: /^References/ });
  expect(await references.evaluate((el) => el.className)).not.toContain("ring-hf-cyan");

  await panel.getByRole("button", { name: /^Camera/ }).click();
  await page.getByRole("listbox", { name: "Camera" }).getByRole("option", { name: "50mm" }).click();
  await expect(toggle).toContainText("1 set");

  // On a phone the dock scrolls with the page instead of pinning over the scene
  const position = await panel.evaluate((el) => getComputedStyle(el.parentElement!).position);
  expect(position).not.toBe("sticky");
});

test("keyboard focus draws the cyan ring", async ({ page }) => {
  await page.goto("/pricing");
  // Tab until a control inside main takes focus
  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");

  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return !!el && el !== document.body && el.matches(":focus-visible");
  });
  expect(focused).toBe(true);

  const style = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(style).toBe("solid");

  // Polled: transition-colors includes outline-color, so the ring fades from
  // the element's text colour to cyan over ~150ms rather than snapping.
  await expect
    .poll(async () => page.evaluate(() => getComputedStyle(document.activeElement!).outlineColor))
    .toBe("rgb(6, 182, 212)");
});
