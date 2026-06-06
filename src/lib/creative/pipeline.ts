// ─────────────────────────────────────────────────────────────────────────
// The Omakase image pipeline.
//
// Conceptually mirrors the genesis-creative-review flow:
//   brief → prompt → generate → score → save → manifest.
//
// It assembles jobs for the whole catalog (hero + all collections + all
// products, two shots per product), builds an on-brand Omakase prompt for each
// (prompts.ts), renders each (fal.ts — real fal when FAL_KEY is set, otherwise
// the deterministic warm-sand stub), saves to the canonical image path, and
// writes public/images/manifest.json describing everything produced.
//
// Generation runs with bounded concurrency (default 3) so a full catalog run is
// quick without hammering the API. No secret is ever logged or returned.
//
// IMAGE PATH CONVENTION (must match exactly across the whole repo):
//   hero       → public/images/hero.jpg                         (/images/hero.jpg)
//   collection → public/images/collections/<slug>.jpg           (/images/collections/<slug>.jpg)
//   product    → public/images/products/<slug>-01.jpg / -02.jpg (/images/products/<slug>-01.jpg)
// ─────────────────────────────────────────────────────────────────────────

import { promises as fs } from "node:fs";
import path from "node:path";

import type { Collection, Product } from "@/lib/types";

import { renderImage, hasFalKey } from "./fal";
import { outputPathsFor } from "./index";
import {
  buildCollectionPrompt,
  buildHeroPrompt,
  buildProductPrompt,
} from "./prompts";
import {
  imageSizeFor,
  scorePrompt,
  type ImageSizePreset,
} from "./prompt";
import type {
  ImageJob,
  ImageManifest,
  ManifestItem,
  JobFilter,
  PipelineOptions,
  PipelineResult,
  ProgressEvent,
} from "./types";

/** Repo public dir. process.cwd() is the repo root in dev, build, and scripts. */
const PUBLIC_DIR = path.join(process.cwd(), "public");
const MANIFEST_PATH = path.join(PUBLIC_DIR, "images", "manifest.json");

/** How many product shots to render per product. */
const PRODUCT_SHOTS = 1;
const DEFAULT_CONCURRENCY = 3;

/** Model id for the manifest: FAL_MODEL override, else the default. */
const DEFAULT_MODEL = "fal-ai/nano-banana-pro";
function resolveModel(): string {
  const m = process.env.FAL_MODEL?.trim();
  return m && m.length > 0 ? m : DEFAULT_MODEL;
}

// ── Job assembly (brief step) ──────────────────────────────────────────────

/** Build the hero job. */
function heroJob(): ImageJob {
  const { absolutePath, publicPath } = outputPathsFor("hero", "hero", 1);
  return makeJob("hero", "hero", buildHeroPrompt(), imageSizeFor("hero"), absolutePath, publicPath);
}

/** Build one cover job per collection. */
function collectionJobs(collections: Collection[]): ImageJob[] {
  return collections.map((c) => {
    const { absolutePath, publicPath } = outputPathsFor("collection", c.slug, 1);
    return makeJob(
      "collection",
      c.slug,
      buildCollectionPrompt(c),
      imageSizeFor("collection"),
      absolutePath,
      publicPath,
    );
  });
}

/** Build PRODUCT_SHOTS jobs per product (-01, -02). */
function productJobs(products: Product[]): ImageJob[] {
  const jobs: ImageJob[] = [];
  for (const p of products) {
    for (let shot = 1; shot <= PRODUCT_SHOTS; shot++) {
      const { absolutePath, publicPath } = outputPathsFor("product", p.slug, shot);
      jobs.push(
        makeJob(
          "product",
          `${p.slug}-${String(shot).padStart(2, "0")}`,
          buildProductPrompt(p, shot),
          imageSizeFor("product"),
          absolutePath,
          publicPath,
        ),
      );
    }
  }
  return jobs;
}

function makeJob(
  kind: ImageJob["kind"],
  slug: string,
  prompt: string,
  size: ImageSizePreset,
  outputPath: string,
  publicPath: string,
): ImageJob {
  const { width, height } = dimensionsFor(size);
  return { kind, slug, prompt, width, height, outputPath, publicPath };
}

/** Approximate pixel dimensions per size preset (for the manifest + types). */
function dimensionsFor(size: ImageSizePreset): { width: number; height: number } {
  switch (size) {
    case "portrait_4_3":
    case "portrait_16_9":
      return { width: 960, height: 1280 };
    case "square":
      return { width: 1024, height: 1024 };
    case "landscape_4_3":
    case "landscape_16_9":
    default:
      return { width: 1536, height: 864 };
  }
}

/**
 * Build the full job list for the requested slice, then apply the limit.
 * Order: hero → collections → products (so --limit N front-loads the hero).
 */
export function buildJobs(
  collections: Collection[],
  products: Product[],
  only: JobFilter = "all",
  limit = 0,
): ImageJob[] {
  let jobs: ImageJob[] = [];
  if (only === "all" || only === "hero") jobs.push(heroJob());
  if (only === "all" || only === "collections") jobs.push(...collectionJobs(collections));
  if (only === "all" || only === "products") jobs.push(...productJobs(products));
  if (limit > 0) jobs = jobs.slice(0, limit);
  return jobs;
}

// ── Run (generate → score → save → manifest) ───────────────────────────────

/**
 * Run the pipeline: render every job with bounded concurrency, save to disk
 * (renderImage handles fal-vs-stub + the actual write), then write the
 * manifest. Returns a summary with fal/stub counts.
 */
export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const only = options.only ?? "all";
  const limit = options.limit ?? 0;
  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);

  const jobs = buildJobs(options.collections, options.products, only, limit);
  const total = jobs.length;
  const model = resolveModel();

  const items: ManifestItem[] = new Array<ManifestItem>(total);
  let done = 0;
  let fromFal = 0;
  let fromStub = 0;

  // Bounded-concurrency worker pool over a shared index cursor.
  let cursor = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = cursor++;
      if (i >= total) return;
      const job = jobs[i];

      // generate + save (renderImage writes the bytes to job.outputPath).
      const rendered = await renderImage({
        prompt: job.prompt,
        imageSize: imageSizeFor(job.kind),
        absolutePath: job.outputPath,
        publicPath: job.publicPath,
        stubSeed: stubSeed(job.slug),
      });

      // score (the genesis "score" step — kept for parity/observability).
      void scorePrompt(job.prompt);

      items[i] = {
        kind: job.kind,
        slug: job.slug,
        prompt: job.prompt,
        path: job.publicPath,
        source: rendered.source,
      };
      if (rendered.source === "fal") fromFal++;
      else fromStub++;

      done++;
      const event: ProgressEvent = { done, total, job, source: rendered.source };
      options.onProgress?.(event);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total || 1) }, () => worker());
  await Promise.all(workers);

  const manifest: ImageManifest = {
    generatedAt: new Date().toISOString(),
    model,
    items,
  };
  await writeManifest(manifest);

  return {
    manifest,
    manifestPath: MANIFEST_PATH,
    generated: total,
    fromFal,
    fromStub,
  };
}

/** Whether this run will hit fal (true) or produce stubs (false). */
export function willUseFal(): boolean {
  return hasFalKey();
}

async function writeManifest(manifest: ImageManifest): Promise<void> {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

/** Deterministic stub seed from a slug (FNV-1a). */
function stubSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
