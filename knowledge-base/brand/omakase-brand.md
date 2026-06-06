# OMAKASE — Brand Bible (single source of truth)

This is the canonical in-repo brand doc. It is copied from the rebrand brief and is the single source of truth for the Omakase brand: tokens, fonts, the six collections, the voice, and the naming mapping. Every agent reads this before writing customer copy, designing a surface, or touching the brand. Repo: `/Users/acunamatata/workspace/omakase-mise`.

## The brand

- **Name:** Omakase (お任せ — "I leave it to you" / the chef's selection).
- **Tagline:** **"Leave it to us."** (secondary: "The chef's selection.")
- **What it is:** a high-end Japanese luxury label — curated, considered essentials. Elevated tailoring × calm athleisure × limited drops. A fictional brand (no real data; seeded faker).
- **Positioning line:** "Curated essentials, chosen for you. Considered, calm, and built to last."
- **Aesthetic blend:** Japanese restraint + *ma* (negative space) as the base · Stripe/Linear precision (fine hairlines, exact type) · Airbnb + Alo/Lululemon warmth (warm sand neutrals, rounded-soft, calm/wellness) · a subtle hypebeast edge (numbered, limited "drops"; one confident accent — never loud).

## Voice

Calm, few words, warm-precise, quietly confident, with a drop-culture edge. State; don't sell. **Anti-hype.** **No somatic / wellness-practice language in customer copy** (hard rule). Lead with the material and the restraint. Examples of register: "Left as it was found." · "One line, drawn once." · "Nothing extra." · "Leave it to us."
- DO: spare, material, certain; Japanese-inflected nouns; let whitespace carry weight.
- DON'T: hype, urgency theater, "10x", corporate slop, emojis, exclamation, wellness/somatic claims.

## Design tokens (Sand + Clay) — use ONLY these; never invent hex

```
--paper        #F3EEE6   warm sand background
--card         #FAF6EF   lighter sand (cards)
--ink          #21201C   warm sumi near-black (text)
--muted        #6F695E   warm grey (secondary text)
--hairline     #E6DFD3   fine rule (Linear/Stripe precision)
--panel        #21201C   dark warm sections
--panel-2      #2C2A24
--paper-on-panel #F3EEE6
--accent       #B0744F   clay / terracotta — PRIMARY accent (interactive + emphasis only, never decoration)
--accent-soft  #D9CBB8   stone (soft fills, pale)
--sumi         #21201C   the "Kuro" drop bold (same as ink; used for limited-drop treatment)
--positive     #4E7A52   sage (gate passed)
--warning      #9A6A1E   amber (ask/confirm)
--critical     #A23A2E   rust (LIVE / not done)
--radius       12px      rounded-soft (Airbnb/Alo). Buttons ~10–999px.
```
Generous spacing (*ma*) — more whitespace. Soft radius on cards/buttons (rounded-calm, not sharp/editorial). Fine hairlines for structure.

## Type (sans-forward — precise + warm)

- `--font-sans`: **Geist** — display + body + UI (the workhorse; Stripe/Linear/Alo precision).
- `--font-mono`: **Geist Mono** — labels, eyebrows, drops, code, technical.
- `--font-serif`: **Newsreader** — OPTIONAL warm-luxury accent for the odd hero line / tagline (italic). Use sparingly.
- App: load via `next/font/google` (`Geist`, `Geist_Mono`, `Newsreader`). Deck: Google Fonts CDN (`Geist`, `Geist Mono`, `Newsreader`). Keep the existing font CSS-variable names if present, just swap the families.
- Display: large, tight (`-0.02em`), but Omakase leans **sans display** (not a big serif). Mixed-case, never force-uppercase headings.

## Collections (the tasting menu — exactly these 6)

| slug | name | glyph | tagline | character |
|---|---|---|---|---|
| kinari | Kinari | 生 | "Left as it was found." | unbleached naturals |
| sumi | Sumi | 墨 | "One line, drawn once." | dark essentials |
| ai | Ai | 藍 | "Dyed deep. Worn long." | indigo-dyed |
| hinoki | Hinoki | 檜 | "Warm to the hand." | cypress-warm naturals |
| kuro | Kuro | 黒 | "The drop." | limited black line (the hypebeast note — numbered, limited) |
| shiro | Shiro | 白 | "Nothing extra." | clean whites |

(The fake-data `glyph` field takes a single character — use the kanji above.)

## Sample products (elevated essentials; generate ~40 across collections)

Kinari Crew · Kinari Pocket Tee · Sumi Overshirt · Sumi Trouser · Ai Wide Trouser · Ai Haori Jacket · Hinoki Knit · Hinoki Cardigan · Kuro Cap (drop) · Kuro Bomber (limited) · Shiro Tee · Shiro Oxford. Japanese-inflected, calm, premium. Prices realistic for elevated essentials (e.g. 8,000–58,000 cents). Kuro items are the limited "drops" (lower inventory, numbered vibe).

## The site shape (only the brand changes)

One Next.js app, two surfaces over one fake-data seam:
- **Storefront** `app/(store)`: editorial-but-warm — hero ("Leave it to us." energy), THE COLLECTIONS as hairline rows (glyph · name · tagline · →), PDPs, cart, checkout, a calm "POSITION"-style manifesto, a footer (a "JOIN THE LIST" / drop-notify CTA fits the drop culture). Reskin to Sand+Clay + Omakase copy.
- **Command center** `app/(command)`: operator console — Overview KPIs, Orders, Products, Customers, Analytics, Agents. "OMAKASE · OPERATOR" labels; keep the "LIVE · FAKE DATA" honesty badge.

## Naming / copy mapping (replace everywhere)

- "Aurora" → "Omakase"; "aurora" → "omakase"; "A House of Light" → "Leave it to us." (or "The chef's selection.")
- "AURORA · A HOUSE OF LIGHT" mark → "OMAKASE" (optionally "OMAKASE · お任せ").
- Old collections (Halo/Umbra/Solstice/Aurora/Meridian/Lumen) → the 6 above.
- Old hero "We dress the hours between dawn and dark." → an Omakase line, e.g. "Chosen for you. Made to keep." or "We choose the pieces. You wear them for years."
- package.json name → `omakase-mise`. README title → Omakase. Command-center wordmark/title → Omakase.
- Mark-corner in deck "✦ Aurora — A House of Light" → "Omakase · お任せ".
- Keep the brand fictional; the "LIVE · FAKE DATA" indicator stays.

## Hard rules

- No real data anywhere; Omakase is fictional, seeded with faker.
- TypeScript strict, no `any`. Tailwind tokens only — never invent hex beyond this file. Keep `pnpm build` green and the Playwright full-loop test passing.
- Mixed-case headings; never force-uppercase. No somatic / wellness-practice language in customer copy.
- Stay in your assigned files; don't touch other agents' slices.
