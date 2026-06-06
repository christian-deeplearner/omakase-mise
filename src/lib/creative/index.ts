// ─────────────────────────────────────────────────────────────────────────
// The creative pipeline — Omakase's image-generation seam.
//
// Public API (the Studio surface + its API route import only from here):
//   - generateVariants(brief, count) → builds Omakase prompts, renders each via
//     fal (real if FAL_KEY is set, else the deterministic stub), scores each
//     with the art-director heuristic, and writes to the canonical image paths.
//   - approveVariant / getApproval — an in-memory selection map so an operator
//     can mark which variant is the chosen one for a slug.
//
// IMAGE PATH CONVENTION (must match exactly across the whole repo):
//   hero       → public/images/hero.jpg                        (/images/hero.jpg)
//   collection → public/images/collections/<slug>.jpg          (/images/collections/<slug>.jpg)
//   product    → public/images/products/<slug>-01.jpg / -02.jpg(/images/products/<slug>-01.jpg)
// ─────────────────────────────────────────────────────────────────────────

import path from "node:path";

import {
  buildPrompt,
  imageSizeFor,
  scorePrompt,
  type CreativeBrief,
  type CreativeKind,
} from "./prompt";
import { hasFalKey, renderImage, type RenderedImage } from "./fal";

export type { CreativeBrief, CreativeKind } from "./prompt";
export { hasFalKey } from "./fal";

/** One generated option presented to the operator in the results grid. */
export interface CreativeVariant {
  /** Stable id: `<slug>-<nn>`. Used as the approval key and React key. */
  id: string;
  /** Public URL the app serves the image at (/images/...). */
  path: string;
  /** Absolute disk path the bytes were written to. */
  absolutePath: string;
  /** The full Omakase prompt used to render this variant. */
  prompt: string;
  /** Art-director heuristic, 0–100. */
  score: number;
  /** Whether fal.ai rendered it, or the offline stub did. */
  source: RenderedImage["source"];
}

/** The full response from a generate run. */
export interface GenerateResult {
  brief: CreativeBrief;
  /** True when fal.ai was used; false when the stub produced placeholders. */
  live: boolean;
  variants: CreativeVariant[];
}

// Repo public dir. process.cwd() is the repo root in both dev and build.
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Resolve { absolutePath, publicPath } for a brief + 1-based variant number,
 * following the canonical path convention exactly.
 */
export function outputPathsFor(
  kind: CreativeKind,
  slug: string,
  variantNumber: number,
): { absolutePath: string; publicPath: string } {
  switch (kind) {
    case "hero": {
      // Hero is a single image; variants beyond 1 get a suffix so a run that
      // produces options doesn't clobber the canonical hero.jpg.
      const publicPath =
        variantNumber === 1
          ? "/images/hero.jpg"
          : `/images/hero-${pad(variantNumber)}.jpg`;
      return { publicPath, absolutePath: path.join(PUBLIC_DIR, publicPath) };
    }
    case "collection": {
      const publicPath =
        variantNumber === 1
          ? `/images/collections/${slug}.jpg`
          : `/images/collections/${slug}-${pad(variantNumber)}.jpg`;
      return { publicPath, absolutePath: path.join(PUBLIC_DIR, publicPath) };
    }
    case "product":
    default: {
      const publicPath = `/images/products/${slug}-${pad(variantNumber)}.jpg`;
      return { publicPath, absolutePath: path.join(PUBLIC_DIR, publicPath) };
    }
  }
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Generate `count` variants for a brief. Each variant gets its own on-brand
 * prompt (different material/surface), is rendered to its canonical path, and
 * scored. Runs sequentially to keep memory bounded and fal usage gentle.
 */
export async function generateVariants(
  brief: CreativeBrief,
  count = 2,
): Promise<GenerateResult> {
  const n = clampInt(count, 1, 4);
  const imageSize = imageSizeFor(brief.kind);
  const variants: CreativeVariant[] = [];

  for (let i = 0; i < n; i++) {
    const variantNumber = i + 1;
    const prompt = buildPrompt(brief, i);
    const score = scorePrompt(prompt);
    const { absolutePath, publicPath } = outputPathsFor(
      brief.kind,
      brief.slug,
      variantNumber,
    );

    const rendered = await renderImage({
      prompt,
      imageSize,
      absolutePath,
      publicPath,
      stubSeed: hashSeed(`${brief.slug}-${variantNumber}`),
    });

    variants.push({
      id: `${brief.slug}-${pad(variantNumber)}`,
      path: rendered.publicPath,
      absolutePath: rendered.absolutePath,
      prompt,
      score,
      source: rendered.source,
    });
  }

  // Present strongest first so the operator's eye lands on the best option.
  variants.sort((a, b) => b.score - a.score);

  return { brief, live: hasFalKey(), variants };
}

function clampInt(n: number, lo: number, hi: number): number {
  const v = Math.floor(Number.isFinite(n) ? n : lo);
  return Math.max(lo, Math.min(hi, v));
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ── In-memory approval map ──────────────────────────────────────────────────
// Records which variant id an operator approved for a given slug. Survives HMR
// within a dev session via globalThis (same pattern as the data-layer world).
// This is intentionally ephemeral — selection is a review action, not catalog
// state, so it lives only as long as the process.

const GLOBAL_KEY = "__OMAKASE_CREATIVE_APPROVALS__";
type GlobalWithApprovals = typeof globalThis & {
  [GLOBAL_KEY]?: Map<string, string>;
};
const g = globalThis as GlobalWithApprovals;

function approvals(): Map<string, string> {
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = new Map<string, string>();
  return g[GLOBAL_KEY]!;
}

/** Record `variantId` as the chosen variant for `slug`. Returns the mapping. */
export function approveVariant(
  slug: string,
  variantId: string,
): { slug: string; variantId: string } {
  approvals().set(slug, variantId);
  return { slug, variantId };
}

/** The approved variant id for a slug, if any. */
export function getApproval(slug: string): string | null {
  return approvals().get(slug) ?? null;
}

/** Snapshot of all approvals (slug → variantId). */
export function listApprovals(): Record<string, string> {
  return Object.fromEntries(approvals());
}
