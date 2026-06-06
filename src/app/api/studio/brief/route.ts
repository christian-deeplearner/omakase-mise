// GET /api/studio/brief
// Supplies the Studio brief panel with pickable subjects, sourced from the same
// in-memory data-layer the rest of the command center reads: the 6 collections
// and the product catalog. The operator chooses one of these (or hero), adds
// optional style notes, and POSTs to /api/studio/generate.

import { getCollections, getProducts } from "@/lib/data-layer";
import { hasFalKey } from "@/lib/creative";

export const dynamic = "force-dynamic";

export interface BriefCollectionOption {
  slug: string;
  name: string;
  glyph: string;
  tagline: string;
  /** Collection character, fed into the prompt for collection covers. */
  character: string;
}

export interface BriefProductOption {
  slug: string;
  name: string;
  collectionSlug: string;
}

export interface BriefOptions {
  /** Whether the server has a fal credential (real) or will stub (offline). */
  live: boolean;
  collections: BriefCollectionOption[];
  products: BriefProductOption[];
}

/** GET → BriefOptions */
export async function GET(): Promise<Response> {
  const collections: BriefCollectionOption[] = getCollections().map((c) => ({
    slug: c.slug,
    name: c.name,
    glyph: c.glyph,
    tagline: c.tagline,
    // The description's first phrase reads as the collection's character.
    character: c.description.split(".")[0].trim(),
  }));

  const products: BriefProductOption[] = getProducts().map((p) => ({
    slug: p.slug,
    name: p.name,
    collectionSlug: p.collectionSlug,
  }));

  const body: BriefOptions = { live: hasFalKey(), collections, products };
  return Response.json(body);
}
