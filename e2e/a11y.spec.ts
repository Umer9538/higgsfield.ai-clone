import { type Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import { settle } from "./helpers";

/** WCAG 2.2 A/AA rules only; any violation fails with its selector and reason. */
async function expectNoViolations(page: Page, where: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const report = violations.flatMap((v) =>
    v.nodes.slice(0, 3).map((n) => `${v.id} (${v.impact}) ${n.target.join(" ")}: ${n.failureSummary?.split("\n")[1] ?? ""}`),
  );
  expect(report, `${where}\n${report.join("\n")}`).toEqual([]);
}

const ROUTES = [
  "/", "/explore", "/pricing", "/assets", "/enterprise", "/canvas", "/academy", "/community", "/contests",
  "/plugins", "/originals", "/mcp", "/chatgpt-plugin", "/supercomputer", "/login", "/signup", "/welcome-quiz",
  "/profile", "/settings", "/ai/video", "/ai/image", "/ai/audio", "/ai/edit", "/ai/motion-control",
  "/ai/genjutsu", "/ai/effects", "/ai/cinema-studio", "/ai/marketing-studio", "/ai/3d-jutsu",
];

test.describe("axe: every route", () => {
  for (const route of ROUTES) {
    test(route, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      await expectNoViolations(page, route);
    });
  }
});

test("axe: overlays, results and later onboarding steps", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await settle(page);
  await expect(page.locator("html[data-palette-ready]")).toHaveCount(1);

  // Audit settled states: mid-animation text is partly transparent by design
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Create" }).click();
  await settle(page);
  await expectNoViolations(page, "Create catalog");
  await page.keyboard.press("Escape");

  await page.keyboard.press("Control+k");
  await page.keyboard.press("ArrowDown");
  await settle(page);
  await expectNoViolations(page, "command palette");
  await page.keyboard.press("Escape");

  await page.goto("/ai/video");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByText("Generation complete")).toBeVisible({ timeout: 25_000 });
  await page.getByRole("button", { name: "Compare" }).click();
  await settle(page);
  await expectNoViolations(page, "result with compare");

  await page.keyboard.press("Control+k");
  await page.getByRole("option", { name: "Inspect generation JSON" }).click();
  await settle(page);
  await expectNoViolations(page, "JSON inspector");
  await page.keyboard.press("Escape");

  await page.goto("/welcome-quiz");
  await page.getByRole("radio", { name: /Cinematic Video/ }).click();
  await expect(page.getByRole("heading", { name: "Build your prompt" })).toBeVisible();
  await settle(page);
  await expectNoViolations(page, "onboarding builder");
});

test("primary buttons keep AA contrast while hovered", async ({ page }) => {
  await page.goto("/");
  const signUp = page.getByRole("banner").getByRole("button", { name: "Sign up" });
  await signUp.hover();
  await expect
    .poll(() =>
      signUp.evaluate((el) => {
        const channel = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        const lum = (css: string) => {
          const [r, g, b] = css.match(/\d+(\.\d+)?/g)!.map(Number);
          return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
        };
        const style = getComputedStyle(el);
        const [a, b] = [lum(style.color), lum(style.backgroundColor)].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
      }),
    )
    .toBeGreaterThanOrEqual(4.5);
});

test.describe("dialog focus behaviour", () => {
  test("Create catalog: focus moves in, Tab stays inside, Escape returns focus", async ({ page }) => {
    await page.goto("/");
    const create = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Create" });
    await create.click();
    const catalog = page.getByRole("dialog", { name: "Create" });
    await expect.poll(() => catalog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
    expect(await catalog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(catalog).toHaveCount(0);
    await expect(create).toBeFocused();
  });

  test("phone settings sheet: a real modal dialog with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ai/cinema-studio");
    const opener = page.getByRole("button", { name: "Settings" });
    await opener.click();
    const sheet = page.getByRole("dialog", { name: "Settings" });
    await expect(sheet).toHaveAttribute("aria-modal", "true");
    await expect.poll(() => sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
    expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.locator("#studio-settings")).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("phone Create sheet: focus moves in and Escape returns it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const opener = page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: "Create" });
    await opener.click();
    const sheet = page.getByRole("dialog", { name: "Create" });
    await expect.poll(() => sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});

test("overlays close when the viewport leaves their breakpoint, releasing the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ai/cinema-studio");
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Sections" }).getByRole("button", { name: "Create" }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Create" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("phone switches keep their shape and still get a 44px touch target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/settings");
  const toggle = page.getByRole("switch", { name: "Reduce motion" });
  const box = (await toggle.boundingBox())!;
  // The global 44px rule used to stretch the 28px track into a pill
  expect(box.height).toBeLessThan(32);
  const hitArea = await toggle.evaluate((el) => {
    const style = getComputedStyle(el, "::before");
    return { position: style.position, top: parseFloat(style.top), bottom: parseFloat(style.bottom) };
  });
  expect(hitArea.position).toBe("absolute");
  expect(box.height - hitArea.top - hitArea.bottom).toBeGreaterThanOrEqual(44);

  // Knobs move by transform, not by animating left
  const knob = toggle.locator("span").first();
  expect(await knob.evaluate((el) => getComputedStyle(el).transitionProperty)).toContain("transform");
});

