// ─────────────────────────────────────────────────────────────────────────
// Omakase prompt builders — the catalog-driven layer on top of prompt.ts.
//
// The brand bible (the source of truth) describes every image as a 7-part
// prompt:
//   1. style declaration  2. subject  3. material/surface  4. light
//   5. palette            6. mood/ma  7. camera
//
// prompt.ts owns the fixed brand vocabulary, the part assembly, the
// compose/score helpers, and the image-size presets. This module turns the
// fake-data catalog (Collection / Product) into Omakase briefs and exposes the
// three builders the pipeline + script call by name:
//
//   buildHeroPrompt()
//   buildCollectionPrompt(collection)
//   buildProductPrompt(product, variant)
//
// All builders return a finished, comma-joined prompt string in the Omakase
// editorial style. They are deterministic: same input → same prompt.
// ─────────────────────────────────────────────────────────────────────────

import type { Collection, Product } from "@/lib/types";

import {
  buildPrompt,
  imageSizeFor,
  type CreativeBrief,
  type ImageSizePreset,
} from "./prompt";

/** The single hero composition for the storefront. */
export function buildHeroPrompt(): string {
  const brief: CreativeBrief = {
    kind: "hero",
    slug: "hero",
    subject:
      "a single curated essential — a folded heavyweight garment, the chef's selection",
    styleNotes:
      "wide, unhurried storefront opener; one confident piece carrying the whole frame",
  };
  // Variant index 0 anchors the hero to the warm-sandstone surface.
  return buildPrompt(brief, 0);
}

/** A collection cover that captures the collection's character. */
export function buildCollectionPrompt(collection: Collection): string {
  const brief: CreativeBrief = {
    kind: "collection",
    slug: collection.slug,
    subject: `the ${collection.name} collection — "${collection.tagline}"`,
    character: collectionCharacter(collection),
    styleNotes: collection.tagline,
  };
  // Index by a stable hash of the slug so each collection gets a distinct (but
  // on-brand) surface, repeatably.
  return buildPrompt(brief, slugIndex(collection.slug));
}

/**
 * A product study. `variant` (1-based) selects the surface so a product's two
 * shots (-01, -02) differ while both stay on-brand. Defaults to 1.
 */
export function buildProductPrompt(product: Product, variant = 1): string {
  const brief: CreativeBrief = {
    kind: "product",
    slug: product.slug,
    subject: `${product.name} — ${product.description}`,
    character: product.collectionSlug,
  };
  // 1-based variant → 0-based material index, offset by the slug hash so
  // different products don't all land on the same first surface.
  const index = slugIndex(product.slug) + Math.max(0, variant - 1);
  return buildPrompt(brief, index);
}

/** The fal image-size preset for a given image kind (re-exported for callers). */
export function heroImageSize(): ImageSizePreset {
  return imageSizeFor("hero");
}
export function collectionImageSize(): ImageSizePreset {
  return imageSizeFor("collection");
}
export function productImageSize(): ImageSizePreset {
  return imageSizeFor("product");
}

// ── helpers ──────────────────────────────────────────────────────────────

/**
 * Distill a one-phrase "character" for a collection from its description's
 * first clause — used as the parenthetical character note in the prompt.
 */
function collectionCharacter(collection: Collection): string {
  const firstClause = collection.description.split(/[.—]/)[0]?.trim();
  return firstClause && firstClause.length > 0
    ? firstClause.toLowerCase()
    : collection.name.toLowerCase();
}

/** Stable small non-negative index from a slug (FNV-1a, mod nothing here). */
function slugIndex(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 4; // 4 brand surfaces in prompt.ts MATERIALS
}
