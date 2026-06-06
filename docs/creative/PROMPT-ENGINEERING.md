# Prompt Engineering — Omakase Image Style

> How to write a prompt that produces an Omakase frame. The aesthetic is fixed; the craft is in the seven parts and the restraint. Adapted from the genesis prompt methodology, retuned to Sand+Clay and *ma*.

---

## The house style (one paragraph, internalize it)

> Editorial photography for a premium Japanese luxury label. The garment / object rests on natural materials — washi paper, hinoki wood, warm sandstone, raw linen. Soft warm daylight, calm and considered, generous negative space (*ma*). Muted sand, clay, and sumi palette. No text, no logos, no robots, no sci-fi; people only if specified. Shot on medium format, magazine-quality.

Every prompt is a specific instance of that paragraph. You are not inventing a look each time — you are placing one object into the house's light.

---

## The 7-part architecture (write in this order)

1. **Style declaration** — open with the register. *"Editorial photography for a premium Japanese luxury label."*
2. **Subject** — the object, named plainly and singular. *"an unbleached cotton crew, folded once"* / *"a single indigo-dyed wide trouser, draped"*. One subject. No "and."
3. **Material / surface** — what it rests on, from the natural-materials set: washi paper, hinoki wood, warm sandstone, raw linen. *"resting on a sheet of washi paper over pale sandstone."*
4. **Light** — one soft source, warm. *"soft warm daylight from the left, a single gentle shadow."* No hard flash, no studio rim light, no cold blue.
5. **Palette** — name the muted band. *"muted sand, clay, and sumi tones; no saturated color."*
6. **Mood / ma** — calm, considered, lots of air. *"calm and considered, generous negative space, the object small in the frame."*
7. **Camera** — finish on the format. *"medium format, magazine-quality, honest shallow depth."*

### Worked example — hero (landscape)

> Editorial photography for a premium Japanese luxury label. A single folded unbleached cotton garment as the only subject, resting on a wide sheet of washi paper over warm sandstone. Soft warm daylight from the left, one gentle shadow. Muted sand, clay, and sumi palette; no saturated color, no text, no logos. Calm and considered, generous negative space — the garment sits low and small, air above it. Medium format, magazine-quality, honest shallow depth.

### Worked example — collection (Ai, indigo, landscape)

> Editorial photography for a premium Japanese luxury label. A single indigo-dyed wide trouser, draped once over raw linen on a hinoki wood bench. Soft warm daylight, one soft shadow. Deep indigo against muted sand and clay; sumi accents; no neon, no text, no logos. Calm, considered, generous *ma* around the subject. Medium format, magazine-quality.

### Worked example — product (Hinoki Knit, portrait)

> Editorial photography for a premium Japanese luxury label. A warm natural-tone knit, laid flat, the weave visible, the only subject. Resting on hinoki wood with a strip of washi paper beneath. Soft warm daylight from above-left, gentle shadow. Muted sand and clay tones, sumi shadow; no saturated color, no text, no logos. Calm and considered, generous negative space above the garment. Medium format portrait, magazine-quality, honest shallow depth.

---

## Per-collection palette cues

Pull character and tagline from `knowledge-base/brand/omakase-brand.md`; stage the palette to match.

| Collection | Character | Stage it as |
|---|---|---|
| Kinari 生 | unbleached naturals | raw cotton on washi over pale sandstone |
| Sumi 墨 | dark essentials | sumi-grey garment on warm grey stone |
| Ai 藍 | indigo-dyed | deep indigo on raw linen / hinoki |
| Hinoki 檜 | cypress-warm naturals | warm naturals on hinoki wood |
| Kuro 黒 | the limited black drop | matte black on sumi — one confident note, never loud |
| Shiro 白 | clean whites | clean white on pale sandstone, lots of air |

---

## Negative prompting (state what to exclude)

Always exclude, in-prompt or via the model's negative field: **text, lettering, watermarks, logos, brand marks, robots, sci-fi, neon, saturated color, hard studio flash, cold blue light, busy backgrounds, people (unless the brief specifies a person).**

---

## Anti-patterns (these fail the gate)

- More than one subject, or props competing with the object. *Ma* is the look; clutter is the failure.
- Saturated or neon color, cold light, hard rim/flash — breaks the Sand+Clay palette (palette veto on the standard).
- Any text, lettering, logo, robot, or sci-fi element — automatic veto, regenerate.
- "Lifestyle" staging with people when the brief said object-only.
- Wellness / somatic staging cues in alt text ("grounded," "ritual," "sanctuary") — Omakase shows objects, not states.
- Over-styling: dramatic shadows, moody fog, cinematic grading. Omakase is calm daylight, not a film still.

---

## Settings (do not change without a decision)

- Model: `fal-ai/nano-banana-pro` (`FAL_MODEL` overrides).
- `num_inference_steps: 28`, `guidance_scale: 5`, `num_images: 1`.
- `image_size`: landscape for hero/collection (~1536×864), portrait for product (~960×1280).

The craft is in the seven parts and the restraint — not in cranking guidance or steps.
