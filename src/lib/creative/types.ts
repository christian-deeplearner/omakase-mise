// Shared types for the Omakase creative image-generation pipeline.
// Adapted from the genesis-creative-review flow (brief -> prompt -> generate ->
// score -> save), reskinned to the Omakase Sand+Clay luxury aesthetic.
//
// One source of truth for the fal wrapper, prompt builders, pipeline, and the
// generate-images script.

import type { Collection, Product } from "@/lib/types";

/** What the wrapper needs to render one image. */
export type ImageRequest = {
  prompt: string;
  width: number;
  height: number;
};

/** Where the bytes come from: the real fal model, or the offline stub. */
export type ImageSource = "fal" | "stub";

/** Result of generating a single image (bytes ready to write to disk). */
export type GeneratedImage = {
  /** Raw image bytes (JPEG). */
  bytes: Uint8Array;
  /** Remote URL the bytes were fetched from, when source === "fal". */
  url: string | null;
  /** How the image was produced. */
  source: ImageSource;
};

/** The kinds of images the catalog produces. */
export type JobKind = "hero" | "collection" | "product";

/**
 * One unit of work: a kind, a stable slug, a target path on disk, and the
 * dimensions. The prompt is attached later (build step), the result after save.
 */
export type ImageJob = {
  kind: JobKind;
  /** Stable identifier: "hero", a collection slug, or "<product>-01". */
  slug: string;
  /** Absolute path the image is written to. */
  outputPath: string;
  /** Public path the image is served at, e.g. /images/hero.jpg. */
  publicPath: string;
  width: number;
  height: number;
  /** The Omakase 7-part prompt built for this job. */
  prompt: string;
};

/** A line in the public manifest describing one produced image. */
export type ManifestItem = {
  kind: JobKind;
  slug: string;
  prompt: string;
  /** Public path, e.g. /images/collections/kinari.jpg. */
  path: string;
  source: ImageSource;
};

/** The manifest written to public/images/manifest.json. */
export type ImageManifest = {
  generatedAt: string;
  model: string;
  items: ManifestItem[];
};

/** Which slice of jobs to run. */
export type JobFilter = "hero" | "collections" | "products" | "all";

/** Options threaded through the pipeline run. */
export type PipelineOptions = {
  collections: Collection[];
  products: Product[];
  /** Restrict to one kind of job; defaults to "all". */
  only?: JobFilter;
  /** Cap the number of jobs (after filtering); 0/undefined = no cap. */
  limit?: number;
  /** How many images to generate at once. */
  concurrency?: number;
  /** Called after each job completes, for progress logging. */
  onProgress?: (event: ProgressEvent) => void;
};

/** Emitted as each job finishes so the script can log counts (never the key). */
export type ProgressEvent = {
  done: number;
  total: number;
  job: ImageJob;
  source: ImageSource;
};

/** Summary returned to the caller after a full run. */
export type PipelineResult = {
  manifest: ImageManifest;
  manifestPath: string;
  generated: number;
  fromFal: number;
  fromStub: number;
};
