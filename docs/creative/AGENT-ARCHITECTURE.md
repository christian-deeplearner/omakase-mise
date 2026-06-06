# Agent Architecture — Omakase Creative Pipeline

> The pipeline adapts the genesis-creative-review **five-stage architecture** to Omakase. Genesis ran five specialized stages; Omakase keeps the same separation of concerns but collapses them onto its lean named team — one `art-director` owns the creative loop, and the existing staff consume and verify its output.

---

## The genesis five stages (the reference)

| Stage | Genesis role | What it does |
|---|---|---|
| **Generation** | runs the model | Calls the image API with tuned settings, fetches the result, writes bytes. The mechanical step. |
| **Art-director** | sets the look | Briefs the scene, writes the prompt to the house style, decides subject / material / light / orientation. |
| **Copy** | writes the words | Produces the on-voice text that travels with the image (captions, alt). Kept separate from the look. |
| **Compositor** | assembles | Places frames at the canonical paths, pairs variants (front/detail), prepares them for the surface. |
| **Review** | scores + selects | Scores variants against the brand rubric, vetoes off-brand frames, selects the winner, returns a review link. |

The discipline genesis enforced and Omakase keeps: **generation is separated from judgment.** The model produces; a scored gate decides. Taste becomes a check the loop can close on its own, and a human spends judgment only on the close calls.

---

## How Omakase maps the five stages

Omakase runs a small calm team (`.claude/agents/`), so the five stages map onto existing staff rather than five new agents:

| Genesis stage | Omakase owner | Where |
|---|---|---|
| Generation | `art-director` (runs `pnpm generate:images`) | `scripts/generate-images.mjs` → `src/lib/creative` |
| Art-director | `art-director` | `.claude/agents/art-director.md`, `docs/creative/PROMPT-ENGINEERING.md` |
| Copy | `art-director` writes alt; voice rules from `knowledge-base/voice/brand-voice.md` | image alt text travels with the frame |
| Compositor | `art-director` writes to canonical paths; `ui-ux-designer` / `fullstack-engineer` render them | `public/images/...` |
| Review | `art-director` scores; the gate is the standard | `knowledge-base/standards/2026-06-06-omakase-image-standard.md` |

So **`art-director` is the agent that produces the images** — it carries generation, art-direction, copy-for-image, and review. The storefront team (`ui-ux-designer`, `fullstack-engineer`) is the compositor's downstream: they consume the assigned paths. `qa` closes the loop by verifying the surface renders the frame.

---

## The loop (BRIEF → PROMPT → GENERATE → SCORE → SELECT → ASSIGN)

```
BRIEF      art-director    surface + slug + subject/material/light/orientation (from the brand)
  ↓
PROMPT     art-director    7-part prompt, palette matched to collection (PROMPT-ENGINEERING.md)
  ↓
GENERATE   src/lib/creative  Fal (nano-banana-pro, steps 28, guidance 5) — or deterministic stub if no FAL_KEY
  ↓
SCORE      art-director    rubric in knowledge-base/standards/2026-06-06-omakase-image-standard.md (≥80; veto on text/logo/sci-fi)
  ↓
SELECT     art-director    keep the winner; products keep -01 (front) + -02 (detail)
  ↓
ASSIGN     art-director    write to public/images/... → report the review link
```

Each arrow is a gate. The loop does not jump from PROMPT to ASSIGN — generation without scoring is how off-brand frames ship.

---

## Why separate generation from judgment

Same reason the PDP gate separates copy from approval: most model output is plausible and off-brand. A scored gate with a hard veto (no text, no logo, no sci-fi; Sand+Clay palette only) lets the machine catch the obvious failures so a person only weighs the close calls. The art-director's leverage is the brief and the rubric — not the number of variants generated.

---

## Boundaries (who touches what)

- `art-director` owns: the briefs, the prompts (`docs/creative/`), running generation, scoring, and writing image bytes to `public/images/...`.
- `art-director` does **not** edit storefront markup, the data seam, or `src/lib/creative` implementation internals beyond running it — it consumes the library through `pnpm generate:images`.
- `ui-ux-designer` / `fullstack-engineer` render the assigned paths; `qa` verifies the surface.
- **`FAL_KEY` never leaves `.env.local`** and is never printed, logged, or committed. The stub keeps the public repo safe.
