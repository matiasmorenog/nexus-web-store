/**
 * @deprecated Use `npm run db:seed:demo-goat` (full wipe + catalog + enrich).
 * Kept as a thin alias so existing docs/scripts keep working.
 */
import "dotenv/config";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tsxBin = path.join(repoRoot, "node_modules", ".bin", "tsx");

console.warn(
  "[deprecated] db:demo-orders → db:seed:demo-goat (full Goat demo seed).",
);

const result = spawnSync(tsxBin, ["prisma/seed-demo-goat.ts"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    SEED_TARGET: process.env.SEED_TARGET ?? "development",
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
