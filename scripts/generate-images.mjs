// ─────────────────────────────────────────────────────────────────────────
// Omakase image generator (human-run).
//
// Reads the fake-data catalog from /fixtures, builds jobs for the hero, all 6
// collections, and every product (two shots each), then runs the creative
// pipeline: build Omakase prompts → generate (3 concurrent) → save to the
// canonical /public/images paths → write public/images/manifest.json.
//
// FAL_KEY (in .env.local, gitignored) enables real fal.ai generation. Without
// it, the pipeline writes deterministic warm-sand placeholders so this works
// fully offline. The key is NEVER printed or logged here.
//
//   pnpm run generate:images                 # everything
//   pnpm run generate:images -- --only hero  # hero only
//   pnpm run generate:images -- --only collections
//   pnpm run generate:images -- --only products --limit 4
//
// NOTE: run via tsx (see package.json) so it can import the TypeScript pipeline.
// ─────────────────────────────────────────────────────────────────────────

import { config } from "dotenv";
// Load .env.local first (gitignored — where FAL_KEY lives), then .env as fallback.
config({ path: ".env.local" });
config();
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { runPipeline, willUseFal } from "../src/lib/creative/pipeline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const FIXTURES_DIR = resolve(REPO_ROOT, "fixtures");

/** Parse --only <hero|collections|products> and --limit <N> from argv. */
function parseArgs(argv) {
  let only = "all";
  let limit = 0;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--only") {
      const value = argv[++i];
      if (value === "hero" || value === "collections" || value === "products") {
        only = value;
      } else {
        throw new Error(`--only expects hero|collections|products, got: ${value ?? "(nothing)"}`);
      }
    } else if (arg.startsWith("--only=")) {
      const value = arg.slice("--only=".length);
      if (value === "hero" || value === "collections" || value === "products") {
        only = value;
      } else {
        throw new Error(`--only expects hero|collections|products, got: ${value}`);
      }
    } else if (arg === "--limit") {
      limit = parseLimit(argv[++i]);
    } else if (arg.startsWith("--limit=")) {
      limit = parseLimit(arg.slice("--limit=".length));
    }
  }
  return { only, limit };
}

function parseLimit(value) {
  const n = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`--limit expects a non-negative integer, got: ${value ?? "(nothing)"}`);
  }
  return n;
}

async function readJson(name) {
  const file = resolve(FIXTURES_DIR, `${name}.json`);
  const raw = await readFile(file, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const { only, limit } = parseArgs(process.argv.slice(2));

  const [collections, products] = await Promise.all([
    readJson("collections"),
    readJson("products"),
  ]);

  const live = willUseFal();
  console.log("Omakase image generation");
  console.log(`  mode        : ${live ? "fal.ai (live)" : "stub (offline placeholders — no FAL_KEY)"}`);
  console.log(`  model       : ${process.env.FAL_MODEL?.trim() || "fal-ai/nano-banana-pro"}`);
  console.log(`  catalog     : ${collections.length} collections, ${products.length} products`);
  console.log(`  scope       : --only ${only}${limit > 0 ? ` --limit ${limit}` : ""}`);
  console.log("");

  const result = await runPipeline({
    collections,
    products,
    only,
    limit,
    concurrency: 3,
    onProgress: ({ done, total, job, source }) => {
      const tag = source === "fal" ? "fal " : "stub";
      console.log(
        `  [${String(done).padStart(3, " ")}/${total}] ${tag} ${job.kind.padEnd(10)} ${job.publicPath}`,
      );
    },
  });

  console.log("");
  console.log(`  generated   : ${result.generated} image${result.generated === 1 ? "" : "s"}`);
  console.log(`  from fal    : ${result.fromFal}`);
  console.log(`  from stub   : ${result.fromStub}`);
  console.log(`  manifest    : ${result.manifestPath}`);
}

main().catch((err) => {
  // Print only the message — never dump env or credentials.
  console.error(`generate-images failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
