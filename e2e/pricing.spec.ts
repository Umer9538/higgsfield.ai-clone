import { expect, test } from "./fixtures";

/** Pricing, the plan calculator, the comparison matrix and Enterprise. */

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

test("pricing plan selection opens a confirmation modal", async ({ page }) => {
  await page.goto("/pricing");

  await page.getByRole("list", { name: "Plans" }).getByRole("button", { name: "Get Pro" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Pro plan selected");

  await dialog.getByRole("button", { name: "Continue to checkout" }).click();
  await expect(page.locator("[data-toast]")).toContainText("added to your cart");
});
