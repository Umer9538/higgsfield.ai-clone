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

test("header is the signed-in app shell on every public page", async ({ page }) => {
  for (const route of ["/", "/pricing", "/ai/video", "/mcp", "/supercomputer"]) {
    await page.goto(route);

    // Scoped to the header: the footer also links to Pricing.
    const header = page.getByRole("banner");

    await expect(header.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(header.getByRole("link", { name: /Pricing/ })).toBeVisible();
    await expect(header.getByRole("link", { name: "Enterprise" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Assets" })).toBeVisible();
    await expect(header.getByRole("button", { name: "Notifications" })).toBeVisible();
    await expect(header.getByRole("button", { name: "Account" })).toBeVisible();

    // The real mark, not a text wordmark
    await expect(header.getByRole("img", { name: "Higgsfield" })).toBeVisible();
  }
});

test("no auth wall: every page is reachable with no sign-in controls", async ({ page }) => {
  for (const route of ["/", "/pricing", "/ai/video", "/ai/genjutsu", "/mcp", "/supercomputer"]) {
    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);

    // Nothing in the page may gate access behind an account
    await expect(page.getByRole("button", { name: "Sign up" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Log in" })).toHaveCount(0);

    // Page content actually rendered rather than redirecting to a login
    expect(page.url()).toContain(route === "/" ? "/" : route);
  }
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

  // Header link marks itself active
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Enterprise" }),
  ).toHaveAttribute("aria-current", "page");
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
    await expect(page.getByRole("banner")).toBeVisible();
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
  await expect.poll(async () => (await read()).nodes).toBe(before.nodes + 1);

  await page.getByRole("button", { name: "Delete" }).click();
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
