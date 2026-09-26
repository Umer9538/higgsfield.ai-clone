import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * A file where every test browser records its device id. The API publishes
 * only owner hashes, so the teardown needs the raw ids from here to delete
 * what the run wrote. Workers inherit the env var.
 */
export default function globalSetup() {
  const file = path.join(os.tmpdir(), `hf-e2e-owners-${Date.now()}-${process.pid}.txt`);
  fs.writeFileSync(file, "");
  process.env.E2E_OWNERS_FILE = file;
}
