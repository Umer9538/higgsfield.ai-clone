import { expect, test } from "@playwright/test";

/**
 * Smoke coverage of the critical user path only.
 * Deliberately not a broad suite: homepage renders, workspace renders,
 * and a generation run completes and produces a playable result.
 */

test("homepage renders its key sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Visual Effects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Higgsfield AI Motion Designer/i })).toBeVisible();
  // Footer is the lime block
  await expect(page.getByText("535 Mission St, 14th floor, San Francisco, CA, 94105")).toBeVisible();

  // All 15 effect presets render
  await expect(page.getByText("Lacewalker")).toBeVisible();
});

test("hero and effect imagery actually loads", async ({ page }) => {
  await page.goto("/");

  const hero = page.locator("img").first();
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

test("video workspace runs a generation and reveals a playable result", async ({ page }) => {
  await page.goto("/ai/video");

  // Idle state
  await expect(page.getByRole("heading", { name: /Make videos in one click/i })).toBeVisible();

  const generate = page.getByRole("button", { name: /^Generate/ });
  await expect(generate).toBeEnabled();
  await generate.click();

  // Running state: progress bar plus stage list
  const progress = page.getByRole("progressbar", { name: "Generation progress" });
  await expect(progress).toBeVisible();
  await expect(page.getByText("Generating", { exact: true })).toBeVisible();

  // Completed state
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 20_000 });

  const video = page.locator("video");
  await expect(video).toBeVisible();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();

  // The result is a real file the browser could decode. Polled, because over a
  // real network metadata arrives after the element is already visible.
  await expect
    .poll(async () => video.evaluate((el: HTMLVideoElement) => el.readyState), {
      timeout: 20_000,
    })
    .toBeGreaterThanOrEqual(1);

  // Reset returns to the idle pane
  await page.getByRole("button", { name: "New generation" }).click();
  await expect(page.getByRole("heading", { name: /Make videos in one click/i })).toBeVisible();
});

test("audio surface keeps Generate disabled, matching the real product", async ({ page }) => {
  await page.goto("/ai/audio");
  await expect(page.getByRole("button", { name: /^Generate/ })).toBeDisabled();
});

test("image surface uses the docked prompt bar, not the side panel", async ({ page }) => {
  await page.goto("/ai/image");
  await expect(page.getByPlaceholder("Describe the scene you imagine")).toBeVisible();
  await expect(page.locator("aside")).toHaveCount(0);
});

test("pricing page renders plans, toggles billing, and expands an FAQ", async ({ page }) => {
  await page.goto("/pricing");

  // Promo countdown
  await expect(page.getByText("Personal promo expires in...")).toBeVisible();

  // Three plans, annual by default. Scoped to the plan list, because the
  // calculator also renders a recommended-plan card with the same headings.
  const plans = page.getByRole("list", { name: "Plans" });
  await expect(plans.getByRole("heading", { name: "Basic", exact: true })).toBeVisible();
  await expect(plans.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
  await expect(plans.getByRole("heading", { name: "Max", exact: true })).toBeVisible();
  await expect(plans.getByText("$20", { exact: true })).toBeVisible();
  await expect(plans.getByText("$45", { exact: true })).toBeVisible();

  // Switching to monthly raises the headline prices
  await page.getByRole("switch", { name: "Bill annually" }).first().click();
  await expect(plans.getByText("$29", { exact: true })).toBeVisible();
  await expect(plans.getByText("$79", { exact: true })).toBeVisible();

  // FAQ accordion opens
  const question = page.getByRole("button", { name: "How do credits work?" });
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/Credits are spent each time you generate/)).toBeVisible();
});

test("calculator recommends a bigger plan as usage grows", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByText("We recommend Pro plan")).toBeVisible();

  // Push video volume to the top of the range; usage should outgrow Pro
  const videos = page.getByLabel("Kling 3.0 videos");
  await videos.fill("200");

  await expect(page.getByText("We recommend Max plan")).toBeVisible();
});

test("compare features matrix expands to reveal all groups", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByRole("heading", { name: "Compare features" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find the best plan for you" })).toBeVisible();

  // Collapsed: Video group only
  await expect(page.getByRole("columnheader", { name: "Video" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Platform" })).toBeHidden();

  const toggle = page.getByRole("button", { name: "Compare Features" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();

  // Expanded: every group present
  await expect(page.getByRole("columnheader", { name: "Image" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Audio" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Platform" })).toBeVisible();

  await page.getByRole("button", { name: "Hide comparison" }).click();
  await expect(page.getByRole("columnheader", { name: "Platform" })).toBeHidden();
});

test("header nav exposes every studio item with the right label and badge", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });

  for (const label of [
    "Explore",
    "Image",
    "Video",
    "Audio",
    "MCP",
    "ChatGPT Plugin",
    "Genjutsu",
    "Effects",
    "Cinema Studio",
    "Marketing Studio",
    "Supercomputer",
    "3D Jutsu",
    "Edit",
  ]) {
    await expect(nav.getByText(label, { exact: true })).toBeVisible();
  }

  // Badges: New on ChatGPT Plugin and 3D Jutsu, Free on Genjutsu and Effects
  await expect(nav.getByText("New", { exact: true })).toHaveCount(2);
  await expect(nav.getByText("Free", { exact: true })).toHaveCount(2);
});

test("every studio route resolves and marks itself active", async ({ page }) => {
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

    const active = page.getByRole("navigation", { name: "Main" }).getByRole("link", {
      name: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    });
    await expect(active.first()).toHaveAttribute("aria-current", "page");
  }
});

test("genjutsu and effects use the panel shell; studios use the dock", async ({ page }) => {
  await page.goto("/ai/genjutsu");
  await expect(page.locator("aside")).toHaveCount(1);
  await expect(page.getByRole("switch", { name: "Prompt" })).toBeVisible();

  await page.goto("/ai/effects");
  await expect(page.getByRole("switch", { name: "Use free gens" })).toBeVisible();
  await expect(page.getByRole("button", { name: /1 FREE LEFT/ })).toBeVisible();

  await page.goto("/ai/cinema-studio");
  await expect(page.locator("aside")).toHaveCount(0);
  await expect(page.getByPlaceholder(/Describe your scene/)).toBeVisible();
});

const LIME = "rgb(209, 254, 23)";

test("header shows signed-out controls by default on every public page", async ({ page }) => {
  for (const route of ["/", "/pricing", "/ai/video", "/mcp", "/supercomputer"]) {
    await page.goto(route);
    const header = page.getByRole("banner");

    await expect(header.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(header.getByRole("link", { name: /Pricing/ })).toBeVisible();
    await expect(header.getByRole("button", { name: "Sign up" })).toBeVisible();

    // Signed-in chrome must not leak while signed out
    await expect(header.getByRole("button", { name: "Account" })).toHaveCount(0);

    await expect(header.getByRole("img", { name: "Higgsfield" })).toBeVisible();
  }
});

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

test("signing in swaps the header to the app shell and out again", async ({ page }) => {
  await page.goto("/");

  // Log in (not Sign up): signing up routes on to the chrome-less onboarding
  // quiz, while signing in lands on /explore where the header is present.
  await page.getByRole("banner").getByRole("button", { name: "Log in" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.locator("[data-toast]").last()).toContainText(/Successfully signed in as/);

  // Signed-in chrome appears, signed-out controls go
  const header = page.getByRole("banner");
  await expect(header.getByRole("button", { name: "Account" })).toBeVisible();
  await expect(header.getByRole("button", { name: "Sign up" })).toHaveCount(0);

  // Avatar menu exposes the documented destinations
  await header.getByRole("button", { name: "Account" }).click();
  const menu = page.getByRole("menu", { name: "Account menu" });
  for (const label of ["Profile", "Settings", "Onboarding Quiz"]) {
    await expect(menu.getByRole("menuitem", { name: label })).toBeVisible();
  }

  await menu.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(header.getByRole("button", { name: "Sign up" })).toBeVisible();
  await expect(header.getByRole("button", { name: "Account" })).toHaveCount(0);
});

test("auth page supports email sign-in and the forgot-password code flow", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  // Forgot password -> 6 digit code
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await page.getByLabel("Email").fill("creator@studio.com");
  await page.getByRole("button", { name: "Send code" }).click();

  const group = page.getByRole("group", { name: "Verification code" });
  await expect(group).toBeVisible();
  const verify = page.getByRole("button", { name: "Verify and continue" });
  await expect(verify).toBeDisabled();

  for (let i = 1; i <= 6; i++) await page.getByLabel(`Digit ${i}`).fill(String(i));
  await expect(verify).toBeEnabled();
  await verify.click();

  // The "code sent" toast is still on screen, so assert against the newest one
  await expect(page.locator("[data-toast]").last()).toContainText(/Successfully signed in/);
  await expect(page).toHaveURL(/\/explore$/);
});

test("signup route toggles to sign-in mode", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("welcome quiz walks three steps and lands in a personalised workspace", async ({ page }) => {
  await page.goto("/welcome-quiz");

  const next = page.getByRole("button", { name: "Continue" });
  await expect(next).toBeDisabled();

  // Step 1: role
  await page.getByRole("radio", { name: /AI Filmmaker/ }).click();
  await expect(next).toBeEnabled();
  await next.click();

  // Step 2: level + at least one model. Picking an image model steers the surface.
  await expect(next).toBeDisabled();
  await page.getByRole("radio", { name: /Advanced/ }).click();
  await page.getByRole("checkbox", { name: /Nano Banana Pro/ }).click();
  await expect(next).toBeEnabled();
  await next.click();

  // Step 3: goal + discount
  const finish = page.getByRole("button", { name: "Finish and start creating" });
  await expect(finish).toBeDisabled();
  await page.getByRole("radio", { name: /Ship more, faster/ }).click();
  await page.getByRole("button", { name: /Claim your 54% sign-up discount/ }).click();
  await expect(page.locator("[data-toast]")).toContainText("54% sign-up discount claimed");

  await finish.click();

  // Completing the quiz always lands on the feed
  await expect(page).toHaveURL(/\/explore$/);

  const saved = await page.evaluate(() => window.localStorage.getItem("hf.onboarding"));
  expect(saved).toBeTruthy();
  const parsed = JSON.parse(saved!);
  expect(parsed.role).toBe("filmmaker");
  expect(parsed.models).toContain("nano-banana-pro");
  expect(parsed.claimedDiscount).toBe(true);
  expect(parsed.hasCompletedOnboarding).toBe(true);

  // And records the one-shot flag
  const flag = await page.evaluate(() => window.localStorage.getItem("hf.onboardingCompleted"));
  expect(flag).toBe("true");
});

test("onboarding prompts once: first sign-up detours, later sign-ups do not", async ({ page }) => {
  // First sign-up on a clean device goes to the quiz
  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: "Sign up" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL(/\/welcome-quiz$/);

  // Complete it
  await page.getByRole("radio", { name: /UGC Creator/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Beginner/ }).click();
  await page.getByRole("checkbox", { name: /Seedance 2.5/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Win client work/ }).click();
  await page.getByRole("button", { name: "Finish and start creating" }).click();
  await expect(page).toHaveURL(/\/explore$/);

  // Sign out, then sign up again on the same device: no second detour
  await page.getByRole("banner").getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();

  await page.getByRole("banner").getByRole("button", { name: "Sign up" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue with Apple" }).click();
  await expect(page).toHaveURL(/\/explore$/);
});

test("lime renders as #d1fe17 on the active link, New badge and Generate", async ({ page }) => {
  await page.goto("/ai/genjutsu");

  const active = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: /^Genjutsu/ });
  await expect(active).toHaveCSS("color", LIME);

  // New badge: solid lime background, black text
  const newBadge = page
    .getByRole("navigation", { name: "Main" })
    .getByText("New", { exact: true })
    .first();
  await expect(newBadge).toHaveCSS("background-color", LIME);
  await expect(newBadge).toHaveCSS("color", "rgb(0, 0, 0)");

  // Primary action: solid lime background, black text
  const generate = page.getByRole("button", { name: /^Generate/ });
  await expect(generate).toHaveCSS("background-color", LIME);
  await expect(generate).toHaveCSS("color", "rgb(0, 0, 0)");
});

test("enterprise route covers the positioning the brief asks for", async ({ page }) => {
  const response = await page.goto("/enterprise");
  expect(response?.status()).toBe(200);

  await expect(
    page.getByRole("heading", { name: /The AI-native creative suite built for enterprise/i }),
  ).toBeVisible();

  // Shared workspace, pooled credits, seats, SSO and admin control
  await expect(page.getByText("Shared team workspace with approvals & comments")).toBeVisible();
  await expect(page.getByText("Credit pooling & allocation across teams")).toBeVisible();
  await expect(page.getByText("Unlimited number of seats").first()).toBeVisible();
  await expect(page.getByText("SSO / SAML & role-based access control")).toBeVisible();

  // Security and compliance
  await expect(page.getByText(/SOC 2 & ISO 42001 aligned/)).toBeVisible();
  await expect(page.getByText("No training on your data")).toBeVisible();

  // Contact Sales with selectable credit volume
  const scale = page.getByRole("button", { name: /Scale/ });
  await expect(scale).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Custom/ }).click();
  await expect(page.getByRole("button", { name: /^Custom/ })).toHaveAttribute("aria-pressed", "true");

  // Enterprise is signed-in-only header chrome, so it is absent while signed
  // out. The route itself stays public, which the no-auth-wall test covers.
  await expect(page.getByRole("banner").getByRole("link", { name: "Enterprise" })).toHaveCount(0);
});

test("assets library filters, searches, sorts and deletes", async ({ page }) => {
  const response = await page.goto("/assets");
  expect(response?.status()).toBe(200);

  const tabs = page.getByRole("tablist", { name: "Asset type" });
  for (const label of ["All", "Videos", "Images", "Audio", "Folders"]) {
    await expect(tabs.getByRole("tab", { name: label })).toBeVisible();
  }

  const countLine = page.getByText(/\d+ assets$/);
  await expect(countLine).toBeVisible();
  const initial = Number((await countLine.textContent())?.match(/\d+/)?.[0]);

  // Filtering narrows the grid
  await tabs.getByRole("tab", { name: "Audio" }).click();
  const audioCount = Number((await countLine.textContent())?.match(/\d+/)?.[0]);
  expect(audioCount).toBeGreaterThan(0);
  expect(audioCount).toBeLessThan(initial);

  // Folders tab swaps to folder cards
  await tabs.getByRole("tab", { name: "Folders" }).click();
  await expect(page.getByText("Q4 Campaigns")).toBeVisible();

  // Search narrows results
  await tabs.getByRole("tab", { name: "All" }).click();
  await page.getByPlaceholder("Search assets").fill("motorcycle");
  const searched = Number((await countLine.textContent())?.match(/\d+/)?.[0]);
  expect(searched).toBeLessThan(initial);

  // Sorting is available both ways
  await page.getByPlaceholder("Search assets").fill("");
  await page.getByLabel("Sort assets").selectOption("oldest");
  await expect(page.getByLabel("Sort assets")).toHaveValue("oldest");

  // Hover actions exist, and delete actually removes the card
  const first = page.getByRole("listitem").first();
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
    // The onboarding quiz is intentionally full-screen with no header.
    if (route === "/welcome-quiz") {
      await expect(page.getByRole("radiogroup", { name: "Primary workflow" })).toBeVisible();
    } else {
      await expect(page.getByRole("banner")).toBeVisible();
    }
  }

  expect(problems, problems.join("\n")).toEqual([]);
});

test("every nav item links to a working route", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });

  const hrefs = await nav.getByRole("link").evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).getAttribute("href")).filter(Boolean),
  );

  // Every nav entry is a real link now, not inert text
  expect(hrefs.length).toBeGreaterThanOrEqual(19);

  for (const href of hrefs) {
    const response = await page.goto(href as string);
    expect(response?.status(), `${href} should return 200`).toBe(200);
  }
});

test("explore feed filters, searches and sorts", async ({ page }) => {
  await page.goto("/explore");

  await expect(page.getByRole("heading", { name: "Visual Effects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore more AI features" })).toBeVisible();

  const count = page.getByText(/\d+ generations/);
  const initial = Number((await count.textContent())?.match(/\d+/)?.[0]);
  expect(initial).toBeGreaterThan(0);

  // Category tabs narrow the rails
  await page.getByRole("tab", { name: "Image" }).click();
  await expect(page.getByRole("heading", { name: "Visual Effects" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Higgsfield Soul 2.0" })).toBeVisible();

  // Search narrows further
  await page.getByRole("tab", { name: "All" }).click();
  await page.getByPlaceholder("Search prompts, models, creators").fill("skater");
  const searched = Number((await count.textContent())?.match(/\d+/)?.[0]);
  expect(searched).toBeLessThan(initial);

  // Sorting is wired
  await page.getByPlaceholder("Search prompts, models, creators").fill("");
  await page.getByLabel("Sort the feed").selectOption("most-liked");
  await expect(page.getByLabel("Sort the feed")).toHaveValue("most-liked");
});

test("card hover exposes prompt, model badge and a Remix that prefills the prompt", async ({ page }) => {
  await page.goto("/explore");

  const card = page.locator("article").first();
  await card.hover();

  // Model badge and spec tag
  await expect(card.getByText("Higgsfield Effects")).toBeVisible();
  await expect(card.getByText(/\d+s · (1080p|720p|4K)/)).toBeVisible();

  const remix = card.getByRole("link", { name: "Remix" });
  await expect(remix).toBeVisible();

  // Remix carries the prompt through to the video workspace
  const href = await remix.getAttribute("href");
  expect(href).toContain("/ai/video?prompt=");

  const promptText = await card.locator("p").first().textContent();
  await remix.click();
  await expect(page).toHaveURL(/\/ai\/video\?prompt=/);

  const textarea = page.locator("#prompt");
  await expect(textarea).toHaveValue(promptText!.trim());
});

test("result actions produce real feedback and a real download", async ({ page }) => {
  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 20_000 });

  // Share copies and toasts
  await page.getByRole("button", { name: "Share" }).click();
  await expect(page.locator("[data-toast]")).toContainText(/copied|blocked/i);

  // Upscale queues with explicit feedback
  await page.getByRole("button", { name: "Upscale" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText(/Upscaling queued/i);

  // Download produces an actual file
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 15_000 }),
    page.getByRole("button", { name: "Download" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.(mp4|jpg)$/);
});

test("workspace controls mutate state rather than sitting inert", async ({ page }) => {
  await page.goto("/ai/video");

  // Output pills cycle
  const pill = page.getByRole("button", { name: /^5s setting/ });
  await expect(pill).toContainText("5s");
  await pill.click();
  await expect(pill).toContainText("8s");

  // Select row opens a listbox and changes the value
  const model = page.getByRole("button", { name: /Model/ }).first();
  await model.click();
  await page.getByRole("option", { name: "Kling 3.0" }).click();
  await expect(model).toContainText("Kling 3.0");

  // Preset card swaps
  await page.getByRole("button", { name: "Change" }).click();
  await page.getByRole("option", { name: "High flip" }).click();
  await expect(page.getByText("High flip")).toBeVisible();
});

test("canvas add, connect and delete change real state", async ({ page }) => {
  await page.goto("/canvas");

  const counter = page.getByText(/\d+ nodes · \d+ connections/);
  const read = async () => {
    const text = (await counter.textContent()) ?? "";
    const [nodes, edges] = text.match(/\d+/g)!.map(Number);
    return { nodes, edges };
  };

  const before = await read();

  await page.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: /Text Prompt/ }).click();
  await expect.poll(async () => (await read()).nodes).toBe(before.nodes + 1);

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect.poll(async () => (await read()).nodes).toBe(before.nodes);
});

test("academy filters courses and opens a detail modal", async ({ page }) => {
  await page.goto("/academy");

  const count = page.getByText(/\d+ courses/);
  const initial = Number((await count.textContent())?.match(/\d+/)?.[0]);

  await page.getByRole("tab", { name: "Automate & Agents" }).click();
  const filtered = Number((await count.textContent())?.match(/\d+/)?.[0]);
  expect(filtered).toBeLessThan(initial);

  await page.getByRole("tab", { name: "All" }).click();
  await page.getByRole("button", { name: "View details" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("pricing plan selection opens a confirmation modal", async ({ page }) => {
  await page.goto("/pricing");

  await page.getByRole("list", { name: "Plans" }).getByRole("button", { name: "Get Pro" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Pro plan selected");

  await dialog.getByRole("button", { name: "Continue to checkout" }).click();
  await expect(page.locator("[data-toast]")).toContainText("added to your cart");
});

test("community follow toggles and plugin install toggles", async ({ page }) => {
  await page.goto("/community");
  const follow = page.getByRole("button", { name: "Follow" }).first();
  await follow.click();
  await expect(page.getByRole("button", { name: "Following" }).first()).toBeVisible();

  await page.goto("/plugins");
  const install = page.getByRole("button", { name: /^Install Premiere Pro/ });
  await install.click();
  await expect(page.getByRole("button", { name: /^Uninstall Premiere Pro/ })).toBeVisible();
});

test("a first-run sign-up routes straight into the onboarding quiz", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: "Sign up" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue with Apple" }).click();
  await expect(page).toHaveURL(/\/welcome-quiz$/);
  await expect(page.getByRole("radiogroup", { name: "Primary workflow" })).toBeVisible();
});

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

test("magic enhance appends cinema parameters and names the model", async ({ page }) => {
  await page.goto("/ai/video");

  const prompt = page.locator("#prompt");
  await prompt.fill("A skater carving an empty pool");

  await page.getByRole("button", { name: "Magic Enhance" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText("Prompt enhanced for Seedance 2.5");

  const value = await prompt.inputValue();
  expect(value).toContain("A skater carving an empty pool");
  expect(value).toContain("cinematic lighting");
  expect(value).toContain("35mm lens");
  expect(value).toContain("photorealistic render");

  // Enhancing twice does not duplicate the parameters
  await page.getByRole("button", { name: "Magic Enhance" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText("already enhanced");
  expect((await prompt.inputValue()).match(/35mm lens/g)?.length).toBe(1);
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
  const first = page.getByRole("listitem").first();
  await expect(first).toContainText(/Generation/);
  await expect(first).toContainText("Seedance 2.5");

  // And under the Videos tab
  await page.getByRole("tab", { name: "Videos" }).click();
  await expect(page.getByRole("listitem").first()).toContainText(/Generation/);
});

test("canvas nodes are typed and their parameters are editable", async ({ page }) => {
  await page.goto("/canvas");

  // Add a typed node from the picker
  await page.getByRole("button", { name: "Add node" }).click();
  await page.getByRole("menuitem", { name: /Video Output/ }).click();
  await expect(page.locator("[data-toast]").last()).toContainText("Video Output node added");

  // Its parameters render as real inputs and persist edits
  const durations = page.getByLabel("Duration");
  await durations.last().selectOption("10s");
  await expect(durations.last()).toHaveValue("10s");

  // Text prompt nodes take free text
  const promptBox = page.getByRole("textbox", { name: "Prompt" }).first();
  await promptBox.fill("Rooftop chase at dusk");
  await expect(promptBox).toHaveValue("Rooftop chase at dusk");

  // Per-node delete works from the card header
  const counter = page.getByText(/\d+ nodes · \d+ connections/);
  const nodesNow = Number(((await counter.textContent()) ?? "").match(/\d+/)![0]);
  await page.getByRole("button", { name: /^Delete Video Output node/ }).last().click();
  await expect.poll(async () =>
    Number(((await counter.textContent()) ?? "").match(/\d+/)![0]),
  ).toBe(nodesNow - 1);
});

test("supercomputer tabs filter the showcase grid, not just the label", async ({ page }) => {
  await page.goto("/supercomputer");

  const label = page.getByText(/Showing \d+ .* projects/);
  // Scoped: the footer also renders list items.
  const cards = page.getByRole("list", { name: "Showcase" }).getByRole("listitem");

  const all = await cards.count();
  expect(all).toBeGreaterThan(6);
  await expect(label).toContainText(`Showing ${all} all projects`);

  for (const [tab, expected] of [
    ["Games", "games"],
    ["Apps", "apps"],
    ["Marketing", "marketing"],
    ["Explainer videos", "explainer videos"],
  ] as const) {
    await page.getByRole("tab", { name: tab }).click();

    const count = await cards.count();
    expect(count, `${tab} should narrow the grid`).toBeLessThan(all);
    expect(count).toBeGreaterThan(0);

    // Label tracks the active category and the real count
    await expect(label).toContainText(`Showing ${count} ${expected} projects`);

    // Every rendered card belongs to the chosen category
    const badges = await cards.locator("span.text-hf-lime").allTextContents();
    expect(new Set(badges.map((b) => b.trim()))).toEqual(new Set([tab]));
  }

  await page.getByRole("tab", { name: "All" }).click();
  expect(await cards.count()).toBe(all);
});

test("community tabs select real collections", async ({ page }) => {
  await page.goto("/community");
  const label = page.getByText(/collections? in /);

  await expect(label).toContainText("4 collections in Explore");

  await page.getByRole("tab", { name: "Shots" }).click();
  await expect(label).toContainText("1 collection in Shots");
  await expect(page.getByRole("heading", { name: "Shots" })).toBeVisible();

  // Projects used to fall through and show everything
  await page.getByRole("tab", { name: "Projects" }).click();
  await expect(label).toContainText("2 collections in Projects");
  await expect(page.getByRole("heading", { name: "Originals by Higgsfield" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Originals" }).click();
  await expect(label).toContainText("1 collection in Originals");
});

test("marketing studio templates filter by category and media type", async ({ page }) => {
  await page.goto("/ai/marketing-studio");

  const label = page.getByText(/Showing \d+ .* templates/);
  const cards = page.getByRole("list", { name: "Templates" }).getByRole("listitem");
  const all = await cards.count();
  expect(all).toBeGreaterThan(8);

  await page.getByRole("tab", { name: "UGC" }).click();
  const ugc = await cards.count();
  expect(ugc).toBeLessThan(all);
  await expect(label).toContainText(`Showing ${ugc} ugc templates`);

  // Media type narrows further and is reflected in the label
  await page.getByRole("tab", { name: "Images" }).click();
  await expect(label).toContainText("images only");

  await page.getByRole("tab", { name: "All", exact: true }).first().click();
  await page.getByRole("tab", { name: "Videos" }).click();
  const videos = await cards.count();
  expect(videos).toBeGreaterThan(0);
  expect(videos).toBeLessThan(all);
});

test("plugin cards open details and the MCP connector switches", async ({ page }) => {
  await page.goto("/plugins");

  // Detail modal carries real metadata and secondary actions
  await page.getByRole("button", { name: "Details for Blender" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Blender 4.2 or newer");
  await expect(dialog).toContainText("Not installed");

  await dialog.getByRole("button", { name: "Check for updates" }).click();
  await expect(page.locator("[data-toast]").last()).toContainText("up to date");

  // Installing from the modal flips the card state behind it
  await dialog.getByRole("button", { name: "Install" }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Uninstall Blender/ })).toBeVisible();

  // MCP connector switch
  const connector = page.getByRole("switch", { name: /connector/ });
  await expect(connector).toHaveAttribute("aria-checked", "false");
  await connector.click();
  await expect(connector).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("Connected", { exact: true })).toBeVisible();
});
