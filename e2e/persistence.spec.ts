import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

/**
 * Real backend round trips. Every test writes through the API, reloads with
 * the browser's own storage wiped where it matters, and checks the record
 * comes back from the server. Against the live deployment (BASE_URL) the
 * store must be Firestore; locally, without credentials, it is the server's
 * in-memory store, which still survives a page reload.
 */
const EXTERNAL = Boolean(process.env.BASE_URL);
const unique = (label: string) => `${label} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function expectedSource(request: APIRequestContext) {
  const health = await (await request.get("/api/health")).json();
  if (EXTERNAL) expect(health.database, "the live site must run on Firestore").toBe("firestore");
  return health.database as "firestore" | "memory";
}

/** Keep identity (device id / sign-in), drop everything the client could have cached. */
async function wipeClientCaches(page: Page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key !== "hf.device" && key !== "hf.auth") localStorage.removeItem(key);
    }
  });
}

test("health reports the live store and proves it answers", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body.status).toBe("ok");
  if (body.database === "firestore") {
    expect(body.durable).toBe(true);
    expect(typeof body.latencyMs).toBe("number");
  } else {
    expect(body.missing).toEqual(expect.arrayContaining(["FIREBASE_PROJECT_ID"]));
  }
  // Names only: no value of any secret appears
  expect(JSON.stringify(body)).not.toMatch(/BEGIN PRIVATE KEY|@.*\.iam\.gserviceaccount\.com/);
});

test("a generation made in the studio survives a hard reload, served from the backend", async ({ page, request }) => {
  const source = await expectedSource(request);
  const prompt = unique("Persistence check: lighthouse in a storm");

  await page.goto("/ai/video");
  await page.locator("#prompt").fill(prompt);
  const posted = page.waitForResponse((r) => r.url().endsWith("/api/generations") && r.request().method() === "POST");
  await page.getByRole("button", { name: /^Generate/ }).click();
  const response = await posted;
  expect(response.status()).toBe(201);
  const { item } = await response.json();
  // A real database id, not a client-made one
  expect(item.id).toMatch(source === "firestore" ? /^[A-Za-z0-9]{20}$/ : /^gen_/);
  await expect(page.locator("[data-persistence]")).toHaveAttribute("data-persistence", source);

  // Wipe the browser's copy, then reload: the only way back is the server
  await wipeClientCaches(page);
  await page.goto("/assets");
  await page.reload();
  expect(await page.evaluate(() => localStorage.getItem("hf.generatedAssets"))).toBeNull();
  await expect(page.locator("[data-asset-source]")).toHaveText(source);
  await page.locator("[data-sync-pill]").click();
  await expect(page.getByRole("main").getByText(prompt)).toBeVisible();
});

test("a favourite survives a hard reload, hydrated from the backend", async ({ page, request }) => {
  await expectedSource(request);
  await page.goto("/explore");
  const card = page.locator("main article").first();
  await card.hover();
  const heart = card.locator("[data-favorite]");
  await expect(heart).toBeEnabled();
  if ((await heart.getAttribute("aria-pressed")) === "true") await heart.click(); // start clean
  await expect(heart).toHaveAttribute("aria-pressed", "false");

  const saved = page.waitForResponse((r) => r.url().endsWith("/api/favorites") && r.request().method() === "POST");
  await heart.click();
  expect((await saved).status()).toBe(201);
  await expect(heart).toHaveAttribute("aria-pressed", "true");

  // Favourites have no local copy by design; reload and they come from the API
  await wipeClientCaches(page);
  await page.reload();
  const hydrated = page.locator("main article").first().locator("[data-favorite]");
  await expect(hydrated).toHaveAttribute("aria-pressed", "true");

  // And the owner's list on the server has it
  const owner = await page.evaluate(() => `device:${localStorage.getItem("hf.device")}`);
  const itemId = await hydrated.getAttribute("data-favorite");
  const list = await (await request.get(`/api/favorites?owner=${encodeURIComponent(owner)}`)).json();
  expect(list.items.map((f: { itemId: string }) => f.itemId)).toContain(itemId);

  // Un-favourite persists too
  await hydrated.click();
  await expect(hydrated).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(page.locator("main article").first().locator("[data-favorite]")).toHaveAttribute("aria-pressed", "false");
});

test("deleting your own generation deletes it in the backend", async ({ page }) => {
  const prompt = unique("Delete check: paper boat");
  await page.goto("/ai/video");
  await page.locator("#prompt").fill(prompt);
  const posted = page.waitForResponse((r) => r.url().endsWith("/api/generations") && r.request().method() === "POST");
  await page.getByRole("button", { name: /^Generate/ }).click();
  const { item } = await (await posted).json();
  await expect(page.locator("[data-persistence]")).not.toHaveAttribute("data-persistence", "saving");

  await page.goto("/assets");
  const card = page.getByRole("main").getByRole("listitem").filter({ hasText: prompt });
  await card.hover();
  const deleted = page.waitForResponse((r) => r.url().includes(`/api/generations/${item.id}`) && r.request().method() === "DELETE");
  await card.getByRole("button", { name: /^Delete/ }).click();
  expect((await deleted).status()).toBe(204);
  await expect(page.locator("[data-toast]").last()).toContainText("Deleted everywhere");

  // Gone after a reload, and from the API
  await page.reload();
  const listed = await page.evaluate(async () => (await (await fetch("/api/generations?limit=100")).json()).items);
  expect(listed.map((g: { id: string }) => g.id)).not.toContain(item.id);
});

test("API contract: validation, ownership, bounds and methods", async ({ request }) => {
  const owner = "device:contract-test";
  const valid = { prompt: unique("contract"), model: "Seedance 2.5", surface: "video", kind: "video", src: "/media/results/result.mp4", spec: "5s", owner };

  // 400s name the problem and never echo internals
  for (const [body, message] of [
    [{ ...valid, src: "https://evil.example/x.mp4" }, /src must be a \/media\/ file/],
    [{ ...valid, prompt: "x".repeat(2001) }, /at most 2000/],
    [{ ...valid, kind: "hologram" }, /kind must be/],
    [{ ...valid, surface: "nope" }, /surface is not a known studio/],
    [{ ...valid, owner: "root; drop table" }, /owner may only use/],
  ] as const) {
    const response = await request.post("/api/generations", { data: body });
    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.code).toBe("invalid_field");
    expect(json.error).toMatch(message);
  }
  expect((await request.post("/api/generations", { data: "[]", headers: { "Content-Type": "application/json" } })).status()).toBe(400);

  // Ownership on delete
  const created = await (await request.post("/api/generations", { data: valid })).json();
  expect((await request.delete(`/api/generations/${created.item.id}`)).status()).toBe(400);
  const forbidden = await request.delete(`/api/generations/${created.item.id}?owner=device:someone-else`);
  expect(forbidden.status()).toBe(403);
  expect((await forbidden.json()).code).toBe("forbidden");
  expect((await request.delete(`/api/generations/${created.item.id}?owner=${owner}`)).status()).toBe(204);
  expect((await request.delete(`/api/generations/${created.item.id}?owner=${owner}`)).status()).toBe(404);

  // Favourite DELETE is idempotent
  const fav = `/api/favorites?owner=${owner}&itemId=contract-item`;
  expect((await request.delete(fav)).status()).toBe(204);
  expect((await request.delete(fav)).status()).toBe(204);

  // Pages are bounded
  const page = await (await request.get("/api/generations?limit=100000")).json();
  expect(page.items.length).toBeLessThanOrEqual(100);

  // Unsupported methods are refused by the framework
  expect((await request.put("/api/generations", { data: valid })).status()).toBe(405);
});
