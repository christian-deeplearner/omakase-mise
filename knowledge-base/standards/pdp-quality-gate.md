# Standard — PDP Quality Gate

> A product detail page is not "done" until it scores **≥ 80** on this gate. The gate is deterministic: same PDP, same score. Generate the copy, score it, then a human approves — generate → gate → review.

This is a hot standard `CLAUDE.md` points to. The `generate-pdp` skill runs this gate as its final step. The `editor` and `fullstack-engineer` agents write to pass it on the first try.

## Why a gate

Most AI copy is plausible and wrong — on-grammar, off-voice. A threshold gate turns taste into a check the loop can close on its own: the machine catches the obvious failures, the human spends judgment only on the close calls. "Diagnose → decide → act → verify" applied to copy.

## The rubric (100 points)

| # | Check | Points | How to score |
|---|---|---:|---|
| 1 | **Required fields present** | 20 | name, price, ≥1 image, material/care, fit/size, description, returns line. −3 each missing. |
| 2 | **On-voice** | 25 | Reads like `../voice/brand-voice.md`. Spare, material, certain. −5 per off-voice sentence. |
| 3 | **No banned phrases** | 20 | Grep the banned list in `brand-voice.md`. **Any hit = automatic fail of this row (0).** |
| 4 | **No somatic / wellness-practice language** | 15 | Hard rule. "grounded, centered, ritual, sacred, embodied, breathe, sanctuary, mindful." **Any hit = 0 and the PDP fails the whole gate regardless of total.** |
| 5 | **Material honesty** | 10 | Names the actual fabric/weight/finish. Concrete nouns, not adjectives. |
| 6 | **Length discipline** | 5 | Description ≤ 90 words. Collection one-liner ≤ 12 words. |
| 7 | **Accessibility basics** | 5 | Every `<img>` has alt text; price is real text, not baked into an image. |

**Pass = total ≥ 80 AND row 4 = full marks (no somatic language).** The somatic check is a veto, not a deduction.

## The gate output (what the skill reports)

```
PDP GATE — <product slug>
Score: 86 / 100   → PASS
  Fields ............ 20/20
  On-voice .......... 22/25  (1 sentence flagged: "elevate your everyday rotation")
  Banned phrases .... 20/20
  Somatic veto ...... 15/15  (clear)
  Material honesty .. 10/10
  Length ............ 4/5    (description 96 words — trim 6)
  A11y .............. 5/5
Flags: rewrite "elevate your everyday rotation"; trim description to ≤90 words.
Review link: http://localhost:3000/product/<slug>
```

## The rule

- **Never report a PDP "done" without a score and a review link.** (See `review-links-standard.md`.)
- A failing gate is not a blocker — it is the work. Rewrite, rescore, then send for human approval.
- The human approves the *close calls*. The gate catches the obvious ones so a person never has to.
