import { expect, test } from "./fixtures";

/** Sign-in, sign-up, the forgot-password flow and the once-per-device onboarding detour. */

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
  for (const label of ["Profile", "Settings", "Onboarding"]) {
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

test("onboarding prompts once: first sign-up detours, later sign-ups do not", async ({ page }) => {
  // First sign-up on a clean device goes to onboarding
  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: "Sign up" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL(/\/welcome-quiz$/);

  // Make a frame and open the studio
  await page.getByRole("radio", { name: /Product Ad/ }).click();
  await page.getByRole("button", { name: "Render a test frame" }).click();
  await page.getByRole("button", { name: "Open Workspace with This Preset" }).click({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/ai\/marketing-studio\?/);

  // Sign out, then sign up again on the same device: no second detour
  await page.getByRole("banner").getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();

  await page.getByRole("banner").getByRole("button", { name: "Sign up" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue with Apple" }).click();
  await expect(page).toHaveURL(/\/explore$/);
});

test("a first-run sign-up routes straight into the onboarding quiz", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: "Sign up" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue with Apple" }).click();
  await expect(page).toHaveURL(/\/welcome-quiz$/);
  await expect(page.getByRole("radiogroup", { name: "What are you creating today?" })).toBeVisible();
});
