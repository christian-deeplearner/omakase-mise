// ~40 Omakase products across the six collections. Names and "kinds" are
// hand-authored per collection so the catalog reads like a real curated
// Japanese house; faker fills the deterministic numeric/inventory detail.

import type { Product, ProductStatus } from "@/lib/types";
import { faker, makeId, slugify, weightedPick } from "./seed";
import { COLLECTIONS } from "./collections";

// Apparel sizing vs. one-size objects. Decided per product "kind".
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const ONE_SIZE = ["OS"];

type Kind = "apparel" | "object";

type Blueprint = {
  collectionSlug: string;
  name: string;
  kind: Kind;
  // realistic price band in cents, inclusive
  price: [number, number];
  blurb: string;
  // limited "drop" pieces (the Kuro line): numbered vibe, low inventory.
  drop?: boolean;
};

// Authored catalog. Order is fixed → deterministic ids/prices.
const BLUEPRINTS: readonly Blueprint[] = [
  // ── Kinari · 生 · unbleached naturals ─────────────────
  { collectionSlug: "kinari", name: "Kinari Crew", kind: "apparel", price: [12000, 16000], blurb: "A loop-knit crew in undyed cotton. Left the color it came in." },
  { collectionSlug: "kinari", name: "Kinari Pocket Tee", kind: "apparel", price: [8000, 11000], blurb: "A heavyweight tee in raw cotton with a single chest pocket. The first layer, and often the only one." },
  { collectionSlug: "kinari", name: "Kinari Wide Trouser", kind: "apparel", price: [15000, 19000], blurb: "A relaxed, drawn-waist trouser in unbleached twill. Tailoring that asks for nothing." },
  { collectionSlug: "kinari", name: "Kinari Linen Shirt", kind: "apparel", price: [14000, 18000], blurb: "Washed natural linen, cut easy. Creases on purpose." },
  { collectionSlug: "kinari", name: "Kinari Field Coat", kind: "apparel", price: [28000, 36000], blurb: "An unlined chore coat in raw canvas. Softens with every wear." },
  { collectionSlug: "kinari", name: "Kinari Tote", kind: "object", price: [9000, 13000], blurb: "An oversized market tote in heavy undyed canvas. Carries the day." },

  // ── Sumi · 墨 · dark essentials ───────────────────────
  { collectionSlug: "sumi", name: "Sumi Overshirt", kind: "apparel", price: [16000, 22000], blurb: "An unstructured overshirt in brushed cotton, dyed deep sumi-black. One line, drawn once." },
  { collectionSlug: "sumi", name: "Sumi Trouser", kind: "apparel", price: [17000, 22000], blurb: "A heavier wool-blend trouser with a single deep pleat. Weight you can lean on." },
  { collectionSlug: "sumi", name: "Sumi Roll-Neck", kind: "apparel", price: [15000, 20000], blurb: "Dense lambswool knit close to the throat. Charcoal as material." },
  { collectionSlug: "sumi", name: "Sumi Wool Coat", kind: "apparel", price: [38000, 48000], blurb: "A long single-breasted coat in compacted wool. Cut for the cold hours." },
  { collectionSlug: "sumi", name: "Sumi Leather Belt", kind: "object", price: [9000, 13000], blurb: "Vegetable-tanned leather, blackened by hand. Ages quietly." },
  { collectionSlug: "sumi", name: "Sumi Cashmere Scarf", kind: "object", price: [14000, 19000], blurb: "A double-faced cashmere scarf in two depths of charcoal." },

  // ── Ai · 藍 · indigo-dyed ─────────────────────────────
  { collectionSlug: "ai", name: "Ai Wide Trouser", kind: "apparel", price: [17000, 23000], blurb: "A fluid wide-leg in rope-dyed indigo. Dyed deep, worn long." },
  { collectionSlug: "ai", name: "Ai Haori Jacket", kind: "apparel", price: [26000, 33000], blurb: "An open-front haori in indigo-dyed cotton. Deepens with every wear." },
  { collectionSlug: "ai", name: "Ai Denim Shirt", kind: "apparel", price: [15000, 20000], blurb: "A boro-inspired denim shirt in slubby indigo. Keeps its own record." },
  { collectionSlug: "ai", name: "Ai Selvedge Jean", kind: "apparel", price: [19000, 25000], blurb: "A straight-leg selvedge jean, rope-dyed and raw. Made to fade to you." },
  { collectionSlug: "ai", name: "Ai Noragi Coat", kind: "apparel", price: [30000, 40000], blurb: "A patched noragi work coat in layered indigo. The longer it lives, the better it reads." },
  { collectionSlug: "ai", name: "Ai Indigo Scarf", kind: "object", price: [13000, 18000], blurb: "A hand-dyed modal scarf in graduated indigo, dusk to deep night." },

  // ── Hinoki · 檜 · cypress-warm naturals ───────────────
  { collectionSlug: "hinoki", name: "Hinoki Knit", kind: "apparel", price: [16000, 21000], blurb: "A brushed lambswool knit in warm cypress tones. Quiet warmth in the weave." },
  { collectionSlug: "hinoki", name: "Hinoki Cardigan", kind: "apparel", price: [19000, 25000], blurb: "A relaxed shawl-collar cardigan in soft wool. Warm to the hand." },
  { collectionSlug: "hinoki", name: "Hinoki Camp Collar", kind: "apparel", price: [13000, 17000], blurb: "A camp-collar shirt in earthy washed cotton, cut wide and easy." },
  { collectionSlug: "hinoki", name: "Hinoki Lounge Pant", kind: "apparel", price: [13000, 17000], blurb: "A soft pull-on trouser in brushed cotton. The weight of an easy afternoon." },
  { collectionSlug: "hinoki", name: "Hinoki Wool Beanie", kind: "object", price: [7000, 9000], blurb: "A fine-gauge merino beanie in warm cedar. Folds to nothing." },
  { collectionSlug: "hinoki", name: "Hinoki Carry Pouch", kind: "object", price: [9000, 13000], blurb: "A soft leather pouch for cords, keys, and small certainties." },

  // ── Kuro · 黒 · the limited drop ──────────────────────
  { collectionSlug: "kuro", name: "Kuro Cap", kind: "object", price: [9000, 13000], blurb: "A six-panel cap in matte black, numbered to the run. The drop.", drop: true },
  { collectionSlug: "kuro", name: "Kuro Bomber", kind: "apparel", price: [42000, 58000], blurb: "A limited bomber in coated black nylon. Made once, numbered, then gone.", drop: true },
  { collectionSlug: "kuro", name: "Kuro Hooded Parka", kind: "apparel", price: [40000, 54000], blurb: "A long technical parka in deep black. A small, numbered run.", drop: true },
  { collectionSlug: "kuro", name: "Kuro Cargo Trouser", kind: "apparel", price: [20000, 28000], blurb: "A tapered cargo in matte black ripstop. Limited to the drop.", drop: true },
  { collectionSlug: "kuro", name: "Kuro Heavyweight Hoodie", kind: "apparel", price: [16000, 22000], blurb: "A boxy 14oz hoodie in pitch black, numbered inside the hem.", drop: true },
  { collectionSlug: "kuro", name: "Kuro Tabi Boot", kind: "apparel", price: [30000, 42000], blurb: "A split-toe tabi boot in black leather. A single numbered run.", drop: true },

  // ── Shiro · 白 · clean whites ─────────────────────────
  { collectionSlug: "shiro", name: "Shiro Tee", kind: "apparel", price: [8000, 11000], blurb: "The essential tee in dense white cotton. Holds its shape. Nothing extra." },
  { collectionSlug: "shiro", name: "Shiro Oxford", kind: "apparel", price: [14000, 18000], blurb: "A crisp oxford in optic white. The shirt that finishes everything." },
  { collectionSlug: "shiro", name: "Shiro Crew", kind: "apparel", price: [12000, 16000], blurb: "A fine merino crew in clean white. Light, exact, restrained." },
  { collectionSlug: "shiro", name: "Shiro Wide Trouser", kind: "apparel", price: [15000, 19000], blurb: "A fluid wide-leg in off-white twill. Calm from waist to hem." },
  { collectionSlug: "shiro", name: "Shiro Linen Shirt", kind: "apparel", price: [14000, 18000], blurb: "Washed white linen, cut loose. Breathes before you do." },
  { collectionSlug: "shiro", name: "Shiro Sleep Set", kind: "apparel", price: [13000, 17000], blurb: "A two-piece in silk-finish white cotton. For the soft hours." },
  { collectionSlug: "shiro", name: "Shiro Sneaker", kind: "apparel", price: [16000, 21000], blurb: "A minimal low-top in white leather. One clean line, nothing more." },
  { collectionSlug: "shiro", name: "Shiro Ceramic Mug", kind: "object", price: [6000, 9000], blurb: "A hand-thrown mug in matte white glaze. The smallest essential." },
];

function roundToNine(cents: number): number {
  // Round to the nearest "x9900" feel (e.g. 18900) for premium price endings.
  const hundreds = Math.round(cents / 1000) * 1000;
  return hundreds - 100; // e.g. 19000 -> 18900
}

function buildProducts(): Product[] {
  const validSlugs = new Set(COLLECTIONS.map((c) => c.slug));

  return BLUEPRINTS.map((bp) => {
    if (!validSlugs.has(bp.collectionSlug)) {
      throw new Error(`Product "${bp.name}" references unknown collection "${bp.collectionSlug}"`);
    }

    const slug = slugify(bp.name);
    const id = makeId("prd");

    // Deterministic price within the band, rounded to a premium ending.
    const rawPrice = faker.number.int({ min: bp.price[0], max: bp.price[1] });
    const priceCents = roundToNine(rawPrice);

    // On-brand product images, generated by the creative pipeline
    // (scripts/generate-images.mjs → public/images/products/<slug>-01.jpg
    // and -02.jpg). Two portrait shots per product: primary + alternate.
    const images = [`/images/products/${slug}-01.jpg`];

    // Status: mostly active, a few coming-soon, rare archived.
    const status = weightedPick<ProductStatus>(
      ["active", "coming-soon", "archived"],
      [88, 8, 4],
    );

    // Inventory: coming-soon/archived run lean; active products vary. Kuro
    // "drop" pieces are deliberately scarce — a small, numbered run.
    const inventory =
      status === "active"
        ? bp.drop
          ? faker.number.int({ min: 0, max: 40 })
          : faker.number.int({ min: 0, max: 220 })
        : faker.number.int({ min: 0, max: 12 });

    const sizes = bp.kind === "apparel" ? [...APPAREL_SIZES] : [...ONE_SIZE];

    return {
      id,
      slug,
      name: bp.name,
      collectionSlug: bp.collectionSlug,
      priceCents,
      currency: "USD",
      images,
      description: bp.blurb,
      sizes,
      status,
      inventory,
    } satisfies Product;
  });
}

export function getProductsSeed(): Product[] {
  return buildProducts();
}
