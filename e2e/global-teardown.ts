import { request, type FullConfig } from "@playwright/test";
import { E2E_OWNER_PREFIX } from "./fixtures";

/**
 * After every run, delete what tests wrote to the shared library, through
 * the public API and its ownership check (no admin backdoor). Pages through
 * the newest generations until none tagged by a test remain.
 */
export default async function globalTeardown(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;
  const api = await request.newContext({ baseURL });
  let removed = 0;
  try {
    for (let pass = 0; pass < 30; pass++) {
      const response = await api.get("/api/generations?limit=100");
      if (!response.ok()) break;
      const { items } = (await response.json()) as { items: { id: string; owner?: string | null }[] };
      const mine = items.filter((item) => item.owner?.startsWith(E2E_OWNER_PREFIX));
      if (mine.length === 0) break;
      for (const item of mine) {
        const done = await api.delete(`/api/generations/${item.id}?owner=${encodeURIComponent(item.owner!)}`);
        if (done.status() === 204 || done.status() === 404) removed += 1;
      }
    }
  } finally {
    await api.dispose();
  }
  if (removed) console.log(`[teardown] removed ${removed} test generations from the library`);
}
