import { expect, test } from "./fixtures";

/** Content pages: canvas, academy, community, supercomputer, plugins, MCP and modals. */

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

  await page.getByRole("group", { name: "Course category" }).getByRole("button", { name: "Automate & Agents", exact: true }).click();
  const filtered = Number((await count.textContent())?.match(/\d+/)?.[0]);
  expect(filtered).toBeLessThan(initial);

  await page.getByRole("group", { name: "Course category" }).getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: "View details" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
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
    await page.getByRole("button", { name: tab, exact: true }).click();

    const count = await cards.count();
    expect(count, `${tab} should narrow the grid`).toBeLessThan(all);
    expect(count).toBeGreaterThan(0);

    // Label tracks the active category and the real count
    await expect(label).toContainText(`Showing ${count} ${expected} projects`);

    // Every rendered card belongs to the chosen category
    const badges = await cards.locator("span.text-hf-accent-soft").allTextContents();
    expect(new Set(badges.map((b) => b.trim()))).toEqual(new Set([tab]));
  }

  await page.getByRole("button", { name: "All", exact: true }).click();
  expect(await cards.count()).toBe(all);
});

test("community tabs select real collections", async ({ page }) => {
  await page.goto("/community");
  const label = page.getByText(/collections? in /);

  await expect(label).toContainText("4 collections in Explore");

  await page.getByRole("button", { name: "Shots", exact: true }).click();
  await expect(label).toContainText("1 collection in Shots");
  await expect(page.getByRole("heading", { name: "Shots" })).toBeVisible();

  // Projects used to fall through and show everything
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await expect(label).toContainText("2 collections in Projects");
  await expect(page.getByRole("heading", { name: "Originals by Higgsfield" })).toHaveCount(0);

  await page.getByRole("button", { name: "Originals", exact: true }).click();
  await expect(label).toContainText("1 collection in Originals");
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

test("MCP page: CLI toggle and platform tabs rewrite the steps", async ({ page }) => {
  // The transport toggle and platform tabs live on the MCP / ChatGPT Plugin
  // page; /plugins is the integrations directory.
  await page.goto("/mcp");

  // MCP is the default: connector instructions and the bridge URL
  await expect(page.getByRole("heading", { name: /Add Higgsfield plugin to ChatGPT/ })).toBeVisible();
  await expect(page.locator("[data-step-code]").first()).toContainText("bridge.higgsfield.ai/mcp");

  // Switching platform rewrites both steps
  await page.getByRole("button", { name: "Claude Code", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Add Higgsfield plugin to Claude Code/ })).toBeVisible();
  await expect(page.getByText(/ask Claude Code to generate/)).toBeVisible();

  // Switching transport swaps to shell setup
  await page.getByRole("button", { name: "CLI", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Install the CLI for Claude Code/ })).toBeVisible();
  const code = page.locator("[data-step-code]").first();
  await expect(code).toContainText("npm i -g @higgsfield/cli");
  await expect(code).toContainText("higgsfield login");
  await expect(page.locator("[data-step-code]").nth(1)).toContainText("higgsfield generate video");

  // And back
  await page.getByRole("button", { name: "MCP", exact: true }).click();
  await expect(page.locator("[data-step-code]").first()).toContainText("bridge.higgsfield.ai/mcp");
});

test("academy search filters the course list", async ({ page }) => {
  await page.goto("/academy");

  // Direct children only: each course card contains its own <ul> of meta chips,
  // so a descendant listitem query counts those too.
  const cards = page.locator('ul[aria-label="Courses"] > li');
  const all = await cards.count();
  expect(all).toBeGreaterThan(3);

  await page.getByPlaceholder("Search courses").fill("VFX");

  // Assert on the live-region count first: it auto-waits for the re-render,
  // whereas an immediate count() can read the pre-filter list.
  await expect(page.getByText(/\d+ courses/)).toContainText("1 courses");
  await expect(cards).toHaveCount(1);

  // Search composes with the category tabs
  await page.getByPlaceholder("Search courses").fill("");
  await page.getByRole("group", { name: "Course category" }).getByRole("button", { name: "UGC & Social Content", exact: true }).click();
  await expect.poll(async () => cards.count()).toBeLessThan(all);

  await page.getByPlaceholder("Search courses").fill("zzzznothing");
  await expect(page.getByText("No courses match that search.")).toBeVisible();
});

test("modals trap focus and close on Escape and backdrop", async ({ page }) => {
  await page.goto("/academy");
  await page.getByRole("button", { name: "View details" }).first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  // Focus starts inside and Tab cycles without escaping
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(inside, `focus escaped the dialog on tab ${i + 1}`).toBe(true);
  }

  // Escape closes
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Backdrop click closes. Clicked near the corner: the backdrop's centre
  // sits under the dialog panel, so a centred click is intercepted.
  await page.getByRole("button", { name: "View details" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(8, 8);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
