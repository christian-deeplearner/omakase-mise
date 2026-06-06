---
name: generate-pdp
description: "Draft an Omakase product-detail page (copy + structure) in brand voice that passes the PDP quality gate. Use when adding or refreshing a product."
---

# Skill: generate-pdp

Three skills you use weekly beat 200 prompts you scroll once. This is one of the three.

## When to use
Adding a product, or rewriting a weak PDP. Input: a product (or a product brief) and its collection.

## Procedure
1. **Read context:** `knowledge-base/brand/omakase-brand.md` (collections, glyphs, taglines), `knowledge-base/voice/brand-voice.md`, `knowledge-base/customer/icp.md` (write for Akiko), and `knowledge-base/standards/pdp-quality-gate.md`.
2. **Read the data:** the `Product` from `src/lib/data-layer/` — name, collection, price, materials/sizes. Never invent facts the data doesn't support.
3. **Draft:**
   - One mixed-case display headline (Geist) that states, doesn't sell. Never force-uppercase.
   - A 2–3 sentence material/standpoint paragraph (spare, certain). Name the cloth, the dye, the weight.
   - Size/fit line, care line.
   - One honest reason this exists — not "you deserve it." For a Kuro item, the limited/numbered fact stands plainly.
4. **Self-check against the gate** (banned phrases, no somatic/wellness-practice language, no urgency, reads for Akiko not "everyone"). Score it; if < threshold, revise.
5. **Output** the copy + where it goes (`app/(store)/product/[slug]/`), and note the review link to check it rendered.

## Done means
The PDP renders, passes the quality gate, and a human can click a link to see it.
