# Standard — Omakase Image Gate

> An image is not "done" until it scores **≥ 80** on this gate **and** clears the veto. The gate turns the Omakase look into a check the creative loop can close on its own: the model produces, the rubric decides, a human approves only the close calls. Generate → score → review.

This is the gate the `art-director` agent runs as the SCORE step of the creative loop (`docs/creative/PIPELINE.md`). It is the image analogue of `pdp-quality-gate.md`: a threshold plus a hard veto.

## Why a gate

Most generated imagery is plausible and off-brand — pretty, but the wrong palette, a stray logo, a cinematic mood that breaks Omakase's calm daylight. A threshold gate with a veto catches the obvious failures automatically, so a person spends judgment only on the close calls. "Diagnose → decide → act → verify," applied to pixels.

## The veto (any hit fails the whole image, regardless of total)

The frame is **rejected outright** — regenerate, don't ship — if it contains any of:

- **Text, lettering, watermarks, logos, or brand marks.**
- **Robots, sci-fi, or futuristic elements.**
- **People when the brief specified object-only.**
- **A broken palette** — saturated color, neon, or cold blue light where Sand+Clay (muted sand / clay / sumi, warm daylight) is required.

The veto is a check, not a deduction. A 95-scoring frame with a logo still fails.

## The rubric (100 points)

| # | Check | Points | How to score |
|---|---|---:|---|
| 1 | **Correct path + orientation + size** | 15 | Written to the canonical path (hero / collection-`<slug>` / product-`<slug>`-01/-02); orientation matches (landscape hero/collection ~1536×864, portrait product ~960×1280). −5 per miss. |
| 2 | **On-palette (Sand+Clay)** | 25 | Muted sand, clay, sumi; warm daylight. No saturated/neon/cold color. −5 per off-palette region. (Hard breaks trip the veto.) |
| 3 | **Material honesty** | 15 | Object rests on a real natural material — washi, hinoki, sandstone, raw linen — that reads as itself, not a generic backdrop. |
| 4 | **Ma / restraint** | 15 | One subject, generous negative space, the object given air. Busy or cluttered = fewer points. |
| 5 | **Light** | 10 | Soft warm daylight, single gentle source. No hard flash, rim light, or cinematic grading. |
| 6 | **Subject fidelity** | 10 | The frame shows the garment/object the brief named (right collection character: e.g. indigo for Ai, matte black for Kuro). |
| 7 | **Alt text on-voice** | 10 | Travels with the frame; spare and material, reads like `../voice/brand-voice.md`; **no somatic/wellness staging language** ("grounded, ritual, sanctuary, embodied"). |

**Pass = total ≥ 80 AND no veto hit.** Alt text with somatic language loses row 7 entirely.

## The gate output (what the art-director reports)

```
IMAGE GATE — collections/ai
Score: 88 / 100   → PASS   (veto: clear)
  Path/size ......... 15/15
  On-palette ........ 23/25  (one region reads slightly warm-orange — acceptable)
  Material honesty .. 15/15  (raw linen + hinoki, reads true)
  Ma / restraint .... 13/15  (subject a touch large — more air next pass)
  Light ............. 10/10
  Subject fidelity .. 10/10  (deep indigo, correct for Ai)
  Alt text .......... 2/10   (flag: "a grounding indigo trouser" — somatic; rewrite)
Flags: rewrite alt to drop "grounding"; give the subject more air next pass.
Review link: http://localhost:3000/collections/ai
```

## The rule

- **Never report an image "done" without a score and a review link** (see `review-links-standard.md`). The link is the running surface, not the file path.
- A failing gate is the work, not a blocker. Regenerate, rescore, then send the close calls for human approval.
- **`FAL_KEY` never appears in a report, log, or commit.** It lives in `.env.local` (gitignored). If it's absent, the deterministic stub runs and the gate still applies to the placeholder.

## Pairs with

- `docs/creative/PIPELINE.md` — the BRIEF → … → ASSIGN loop this gate sits inside.
- `docs/creative/PROMPT-ENGINEERING.md` — the 7-part architecture that makes a frame pass on the first try.
- `.claude/agents/art-director.md` — the agent that runs this gate.
- `pdp-quality-gate.md` — the copy analogue (threshold + somatic veto).
