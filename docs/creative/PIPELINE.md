# Creative Pipeline — Omakase

> How Omakase produces its imagery. Adapted from the genesis-creative-review methodology to a Japanese-luxury label: the same gated loop, the same five-stage architecture, retuned to Sand+Clay restraint and the Omakase image style.

The pipeline is one loop with six gates: **BRIEF → PROMPT → GENERATE → SCORE → SELECT → ASSIGN.** The `art-director` agent runs it (`.claude/agents/art-director.md`). Code lives in `src/lib/creative`; the entry point is `scripts/generate-images.mjs`, wired to `pnpm generate:images`.

---

## The loop

### 1. BRIEF
Name the surface and its slug, then decide subject / material / light / orientation from the brand.

- **Surfaces:** `hero` (one), `collection-<slug>` (six: kinari, sumi, ai, hinoki, kuro, shiro), `product-<slug>` (two frames each).
- **Source of truth:** `knowledge-base/brand/omakase-brand.md` — palette, the six collections, each collection's character and tagline.
- **One scene, one idea.** *Ma* over clutter. The brief decides whether a person appears (default: no — Omakase shows the object).

### 2. PROMPT
Write the prompt with the **7-part architecture** (see `PROMPT-ENGINEERING.md`): style declaration → subject → material/surface → light → palette → mood/ma → camera. Match the palette to the collection. No text, no logos, no robots, no sci-fi.

### 3. GENERATE
Run `pnpm generate:images`. The generator (`scripts/generate-images.mjs` → `src/lib/creative`) calls Fal:

- **Model:** `process.env.FAL_MODEL` or `fal-ai/nano-banana-pro`.
- **Settings:** `num_images: 1`, `num_inference_steps: 28`, `guidance_scale: 5`, `image_size` per orientation (landscape for hero/collection, portrait for product).
- **Auth:** `fal.config({ credentials: process.env.FAL_KEY })`. `FAL_KEY` lives in `.env.local` (gitignored).
- **Result:** `result.images[0].url` → fetch the bytes → write to the canonical path.
- **Offline / public-safe fallback:** if `FAL_KEY` is absent, a deterministic **stub** writes a warm-sand placeholder so the loop runs offline and the public repo never needs a key. The stub is a feature, not a failure mode.

### 4. SCORE
Score each variant against `knowledge-base/standards/2026-06-06-omakase-image-standard.md` (100 points; pass ≥ 80). The "no text / no logo / no robots / no sci-fi" check is a **veto** — any hit fails the image regardless of total, the same way the somatic check vetoes copy in the PDP gate.

### 5. SELECT
Keep the highest-scoring frame. For products keep two: `-01` (front/hero) and `-02` (detail/alt). Discard the rest. The loop records the winning prompt next to the brief so it compounds.

### 6. ASSIGN
Write the winner to the canonical path and report a **review link** — the local URL where the storefront renders it. No link, not done (`knowledge-base/standards/review-links-standard.md`).

---

## Image path convention

| Kind | Write to | Served at | Orientation |
|---|---|---|---|
| hero | `public/images/hero.jpg` | `/images/hero.jpg` | landscape ~1536×864 |
| collection | `public/images/collections/<collection-slug>.jpg` | `/images/collections/<slug>.jpg` | landscape |
| product | `public/images/products/<product-slug>-01.jpg`, `-02.jpg` | `/images/products/<slug>-01.jpg` | portrait ~960×1280 |

Slugs are the brand collection slugs and the seeded product slugs. Every agent that touches imagery uses these paths exactly — the storefront reads `/images/...` and nothing else.

---

## Roles in the loop

The pipeline adapts genesis's five-stage architecture (see `AGENT-ARCHITECTURE.md`): **generation · art-director · copy · compositor · review.** In Omakase these collapse onto a lean team — the `art-director` agent owns generation, scoring, and selection; `ui-ux-designer` and `fullstack-engineer` consume the assigned paths; `qa` verifies the surface renders.

---

## Hard rules

- **Never print, log, or commit `FAL_KEY`.** `.env.local` only; it is gitignored.
- **No text, no logos, no robots, no sci-fi** in any frame (veto).
- **Sand+Clay palette only** — muted sand, clay, sumi. No saturated color, no neon, no cold light. Never invent a hex.
- TypeScript strict, no `any`, in `src/lib/creative`. Tailwind tokens only on any surface that renders the frames.
- Keep `pnpm build` green. The integrator builds; the human runs generation.
