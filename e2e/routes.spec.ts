import { expect, test } from "./fixtures";

/** Every route: status, console errors, no auth wall, no placeholder anchors, layout shift. */

test("no auth wall: every route renders while signed out, never redirecting to login", async ({
  page,
}) => {
  for (const route of ["/", "/pricing", "/ai/video", "/ai/genjutsu", "/assets", "/canvas", "/mcp"]) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);

    // The page itself renders — no gate, no bounce to /login
    expect(new URL(page.url()).pathname).toBe(route);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator("main, aside").first()).toBeVisible();
  }
});

const ALL_ROUTES = [
  "/",
  "/explore",
  "/login",
  "/signup",
  "/welcome-quiz",
  "/pricing",
  "/enterprise",
  "/assets",
  "/academy",
  "/community",
  "/contests",
  "/plugins",
  "/canvas",
  "/originals",
  "/mcp",
  "/chatgpt-plugin",
  "/supercomputer",
  "/ai/video",
  "/ai/image",
  "/ai/audio",
  "/ai/edit",
  "/ai/motion-control",
  "/ai/genjutsu",
  "/ai/effects",
  "/ai/cinema-studio",
  "/ai/marketing-studio",
  "/ai/3d-jutsu",
];

test("every route returns 200 and logs no console errors", async ({ page }) => {
  const problems: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    // Ignore aborted media range requests, which are normal for <video>
    const failure = request.failure()?.errorText ?? "";
    if (!failure.includes("ERR_ABORTED")) {
      problems.push(`requestfailed: ${request.url()} ${failure}`);
    }
  });

  for (const route of ALL_ROUTES) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);
    // Onboarding is intentionally full-screen with no header.
    if (route === "/welcome-quiz") {
      await expect(page.getByRole("radiogroup", { name: "What are you creating today?" })).toBeVisible();
    } else {
      await expect(page.getByRole("banner")).toBeVisible();
    }
  }

  expect(problems, problems.join("\n")).toEqual([]);
});

const AUDIT_ROUTES = [
  "/", "/explore", "/pricing", "/assets", "/enterprise", "/canvas", "/academy", "/community",
  "/contests", "/plugins", "/originals", "/mcp", "/chatgpt-plugin", "/supercomputer", "/login",
  "/signup", "/welcome-quiz", "/ai/video", "/ai/image", "/ai/audio", "/ai/edit",
  "/ai/motion-control", "/ai/genjutsu", "/ai/effects", "/ai/cinema-studio",
  "/ai/marketing-studio", "/ai/3d-jutsu",
  "/profile", "/settings",
];

test("no route ships a placeholder anchor or a layout shift", async ({ page }) => {
  // A 29-route crawl with a settle window per page; the default 30s budget is
  // fine locally but not against a deployment over a real network.
  test.setTimeout(240_000);
  const offenders: string[] = [];

  for (const route of AUDIT_ROUTES) {
    await page.goto(route);
    const result = await page.evaluate(
      () =>
        new Promise<{ dead: number; cls: number }>((resolve) => {
          let cls = 0;
          try {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
                if (!shift.hadRecentInput) cls += shift.value ?? 0;
              }
            }).observe({ type: "layout-shift", buffered: true });
          } catch {
            // Unsupported: the dead-anchor check still runs.
          }
          setTimeout(
            () =>
              resolve({
                dead: document.querySelectorAll('a[href="#"], a:not([href])').length,
                cls: Math.round(cls * 1000) / 1000,
              }),
            600,
          );
        }),
    );

    if (result.dead > 0) offenders.push(`${route}: ${result.dead} placeholder anchors`);
    if (result.cls > 0.1) offenders.push(`${route}: CLS ${result.cls}`);
  }

  expect(offenders, offenders.join("\n")).toEqual([]);
});
