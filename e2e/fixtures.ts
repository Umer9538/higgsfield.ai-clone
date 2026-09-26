import { test as base, expect } from "@playwright/test";

/**
 * Every test browser acts as a tagged device ("e2e-…"), so anything a test
 * writes to the shared library is owned by an identity the teardown can
 * recognise and delete. Against the live deployment, untagged test runs used
 * to leave permanent records in every real visitor's library.
 */
export const E2E_OWNER_PREFIX = "device:e2e-";

export const test = base.extend({
  page: async ({ page }, provide) => {
    const device = `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    await page.addInitScript((id) => {
      if (!localStorage.getItem("hf.device")) localStorage.setItem("hf.device", id);
    }, device);

    // Navigation resolves once React has hydrated, not merely once HTML has
    // loaded: a click that lands before hydration does nothing, and a count
    // read straight after it sees the old value. Every page mounts the command
    // palette, which marks <html data-palette-ready> in its first effect.
    const hydrated = () =>
      page.waitForSelector("html[data-palette-ready]", { state: "attached", timeout: 15_000 }).catch(() => undefined);
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);
    page.goto = async (...args: Parameters<typeof goto>) => {
      const response = await goto(...args);
      await hydrated();
      return response;
    };
    page.reload = async (...args: Parameters<typeof reload>) => {
      const response = await reload(...args);
      await hydrated();
      return response;
    };

    await provide(page);
  },
});

export { expect };
