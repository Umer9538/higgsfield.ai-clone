import { createHash } from "node:crypto";
import fs from "node:fs";
import { request, type FullConfig } from "@playwright/test";
import { API_TEST_OWNERS } from "./fixtures";

/**
 * After every run, delete what tests wrote to the shared library, through
 * the public API and its ownership check (no admin backdoor). The API only
 * publishes owner hashes, so the owners come from the run file the fixture
 * writes; each is hashed and matched. Re-reads the newest 100 generations
 * until none belong to this run.
 */
export default async function globalTeardown(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL;
  const file = process.env.E2E_OWNERS_FILE;
  if (!baseURL) return;

  const owners = new Set(API_TEST_OWNERS);
  if (file && fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) if (line.trim()) owners.add(line.trim());
    fs.rmSync(file, { force: true });
  }
  const byHash = new Map([...owners].map((owner) => [createHash("sha256").update(owner).digest("hex"), owner]));

  const api = await request.newContext({ baseURL });
  let removed = 0;
  try {
    for (let pass = 0; pass < 30; pass++) {
      const response = await api.get("/api/generations?limit=100");
      if (!response.ok()) break;
      const { items } = (await response.json()) as { items: { id: string; ownerHash?: string | null }[] };
      const ours = items.filter((item) => item.ownerHash && byHash.has(item.ownerHash));
      if (ours.length === 0) break;
      for (const item of ours) {
        const owner = byHash.get(item.ownerHash!)!;
        const done = await api.delete(`/api/generations/${item.id}?owner=${encodeURIComponent(owner)}`);
        if (done.status() === 204 || done.status() === 404) removed += 1;
      }
    }
  } finally {
    await api.dispose();
  }
  if (removed) console.log(`[teardown] removed ${removed} test generations from the library`);
}
