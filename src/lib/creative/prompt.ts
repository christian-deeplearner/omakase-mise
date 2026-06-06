// ─────────────────────────────────────────────────────────────────────────
// Omakase prompt architecture + art-director heuristic.
//
// Every generated image is described with a 7-part prompt:
//   1. style declaration  2. subject  3. material/surface  4. light
//   5. palette            6. mood/ma  7. camera
//
// The aesthetic is fixed (the brand bible is the source of truth): editorial
// photography for a high-end Japanese luxury label, garment/object on natural
// materials, soft warm daylight, generous negative space (ma), muted sand/clay/
// sumi palette, medium-format magazine quality. No text, no logos, no robots.
//
// The art-director heuristic scores a built prompt 0–100 against that brief:
// it rewards on-brand material/light/palette/ma vocabulary and penalizes
// off-brand terms. It is deterministic — the same prompt always scores the
// same — so results are stable and testable.
// ─────────────────────────────────────────────────────────────────────────

/** What the operator is briefing an image for. */
export type CreativeKind = "hero" | "collection" | "product";

/** A single image dimension preset, mapped to fal's `image_size`. */
export type ImageSizePreset =
  | "landscape_16_9"
  | "landscape_4_3"
  | "portrait_4_3"
  | "portrait_16_9"
  | "square";

/** The brief an operator assembles in the Studio before generating. */
export interface CreativeBrief {
  kind: CreativeKind;
  /** Subject line — the garment/object/collection being shot. */
  subject: string;
  /** Slug used for the output path (collection-slug or product-slug). */
  slug: string;
  /** Optional art-direction notes layered onto the brand defaults. */
  styleNotes?: string;
  /** Collection character (e.g. "indigo-dyed", "unbleached naturals"). */
  character?: string;
}

/** The seven parts of an Omakase prompt, kept separable for inspection. */
export interface PromptParts {
  style: string;
  subject: string;
  material: string;
  light: string;
  palette: string;
  mood: string;
  camera: string;
}

// ── Fixed brand vocabulary (the brand bible, encoded) ───────────────────────

const STYLE_DECLARATION =
  "Editorial photography for a premium Japanese luxury label, considered and quietly confident";

const MATERIALS = [
  "resting on warm sandstone",
  "laid over raw linen",
  "set on a hinoki cypress surface",
  "arranged on washi paper",
] as const;

const LIGHT = "soft warm daylight, gentle directional shadow, calm and unhurried";

const PALETTE =
  "muted sand, clay, and sumi palette — warm neutrals, terracotta accent, deep warm near-black";

const MOOD =
  "calm and considered, generous negative space (ma), restraint, nothing extra";

const CAMERA =
  "shot on medium format, shallow controlled depth of field, magazine-quality, no text, no logos, no robots, no sci-fi";

/**
 * Material/surface choice is deterministic per variant index so a brief that
 * asks for N variants gets N distinct-but-on-brand surfaces, repeatably.
 */
function materialFor(index: number): string {
  return MATERIALS[index % MATERIALS.length];
}

// ── Prompt assembly ─────────────────────────────────────────────────────────

function subjectClause(brief: CreativeBrief): string {
  const subject = brief.subject.trim() || "a curated essential garment";
  switch (brief.kind) {
    case "hero":
      return `${subject} — a hero composition for the storefront, the single confident piece`;
    case "collection":
      return `${subject} — a collection cover that captures its character${
        brief.character ? ` (${brief.character})` : ""
      }`;
    case "product":
    default:
      return `${subject} — a product study, the garment as the sole subject`;
  }
}

/**
 * Build the seven prompt parts for a brief + variant index. Operator style
 * notes are appended to the mood part (never allowed to override brand light/
 * palette/camera, only to nuance the mood).
 */
export function buildPromptParts(
  brief: CreativeBrief,
  variantIndex: number,
): PromptParts {
  const notes = brief.styleNotes?.trim();
  return {
    style: STYLE_DECLARATION,
    subject: subjectClause(brief),
    material: materialFor(variantIndex),
    light: LIGHT,
    palette: PALETTE,
    mood: notes ? `${MOOD}; ${notes}` : MOOD,
    camera: CAMERA,
  };
}

/** Flatten the seven parts into a single comma-joined prompt string. */
export function composePrompt(parts: PromptParts): string {
  return [
    parts.style,
    parts.subject,
    parts.material,
    parts.light,
    parts.palette,
    parts.mood,
    parts.camera,
  ].join(". ");
}

/** Convenience: build + compose in one step. */
export function buildPrompt(brief: CreativeBrief, variantIndex: number): string {
  return composePrompt(buildPromptParts(brief, variantIndex));
}

/** The fal `image_size` preset appropriate for a given kind. */
export function imageSizeFor(kind: CreativeKind): ImageSizePreset {
  // Hero + collection are landscape; products are portrait.
  return kind === "product" ? "portrait_4_3" : "landscape_16_9";
}

// ── Art-director heuristic ──────────────────────────────────────────────────
// A deterministic 0–100 score approximating "how on-brand is this prompt?".
// On-brand vocabulary (materials, warm light, ma, the sand/clay palette) earns
// points; off-brand terms (neon, glossy, busy, cyberpunk…) lose them. The score
// is clamped to [0,100]. This is intentionally simple and explainable — an
// operator can read the prompt and predict roughly where it lands.

const ON_BRAND_TERMS: readonly string[] = [
  "washi",
  "hinoki",
  "sandstone",
  "linen",
  "warm",
  "soft",
  "daylight",
  "calm",
  "negative space",
  "ma)",
  "restraint",
  "medium format",
  "muted",
  "sand",
  "clay",
  "sumi",
  "considered",
  "editorial",
];

const OFF_BRAND_TERMS: readonly string[] = [
  "neon",
  "glossy",
  "saturated",
  "busy",
  "cluttered",
  "cyberpunk",
  "robot",
  "sci-fi",
  "logo",
  "text",
  "harsh",
  "flash",
  "vibrant",
  "3d render",
  "cartoon",
];

const BASELINE = 58; // a clean brand prompt with no notes lands comfortably high

/**
 * Score a prompt string 0–100. Deterministic: same string → same score.
 * Each on-brand term is +3 (capped), each off-brand term is −9.
 */
export function scorePrompt(prompt: string): number {
  const haystack = prompt.toLowerCase();

  let onHits = 0;
  for (const term of ON_BRAND_TERMS) {
    if (haystack.includes(term)) onHits += 1;
  }
  let offHits = 0;
  for (const term of OFF_BRAND_TERMS) {
    // The brand camera clause literally says "no text/no logos/no robots" — only
    // penalize off-brand terms that appear OUTSIDE a "no <term>" negation.
    const negated = new RegExp(`no [^.]*\\b${escapeRegex(term)}\\b`).test(
      haystack,
    );
    if (!negated && haystack.includes(term)) offHits += 1;
  }

  const onBonus = Math.min(onHits * 3, 36); // cap so length alone can't max it
  const offPenalty = offHits * 9;
  const raw = BASELINE + onBonus - offPenalty;
  return clamp(Math.round(raw), 0, 100);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
