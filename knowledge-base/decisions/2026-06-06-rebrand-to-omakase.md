# Decision — Rebrand Aurora → Omakase (Sand+Clay)

- **Date:** 2026-06-06
- **Status:** accepted
- **Owners:** director, cto, ui-ux-designer
- **Context:** The repo was scaffolded under the working name "Aurora — A House of Light," an editorial-luxury DTC house with a sharp, serif-forward, paper/ink/teal palette. We are replacing that brand wholesale with **Omakase** (お任せ — "I leave it to us" / the chef's selection): a high-end Japanese-luxury label of curated, considered essentials. The site shape, the agent team, the memory base, and the fake-data seam are unchanged — only the brand changes. The canonical brand bible is `../brand/omakase-brand.md`.

## Decision

Adopt **Omakase** as the brand across the whole repo and deck:
- **Identity.** Name Omakase; tagline "Leave it to us." (secondary "The chef's selection."); positioning "Curated essentials, chosen for you. Considered, calm, and built to last."
- **Tokens.** Swap to the **Sand+Clay** palette (warm sand paper/card, warm sumi ink, clay/terracotta accent, sage/amber/rust status) in `src/app/globals.css`. Token *names* are unchanged (`bg-paper`, `text-ink`, `border-hairline`, `bg-accent`, …); only the hex values behind them move. Soft radius (12px) and generous *ma* replace the prior sharp/editorial feel.
- **Type.** Sans-forward: Geist (display + body + UI), Geist Mono (labels/eyebrows/drops), Newsreader (optional warm-luxury serif accent). Mixed-case headings; never force-uppercase.
- **Collections.** The six-collection "tasting menu": Kinari · Sumi · Ai · Hinoki · Kuro · Shiro, each with a kanji glyph and a one-line tagline. Kuro is the numbered, limited "drop" line (the subtle drop-culture edge). These replace the old Halo/Umbra/Solstice/Aurora/Meridian/Lumen lines.
- **Voice.** Calm, few words, warm-precise, quietly confident, anti-hype, with a drop-culture edge. The hard rule holds: **no somatic / wellness-practice language in customer copy.**
- **ICP.** The seeded ideal customer is **Akiko** (replacing the prior "Imogen"): high-AOV, low-frequency, material-honest, wants better-and-fewer.

## Why

- **One brand, end to end.** The storefront, command center, memory base, agents, workflows, README, and deck must all speak Omakase or the teaching artifact reads as half-finished. The rebrand is a clean swap of branding over an unchanged architecture, which is itself the lesson: the fake-data seam and the harness don't care what the brand is.
- **Sand+Clay is warmer and calmer.** The Japanese-luxury blend (Japanese restraint + Stripe/Linear precision + Alo/Airbnb warmth + a subtle hypebeast drop edge) is a better demo of "premium means restrained, not ornate" than the prior editorial-serif look.
- **The hard rules survive the rebrand.** Strict TypeScript, tokens-only styling, the fake-data seam, the review-link standard, and the no-somatic-language gate all carry over verbatim. A rebrand that broke them would break the webinar's whole point.

## Scope of the change (by slice)

| Area | Change |
|---|---|
| `CLAUDE.md` | Rewritten as the Omakase operating doc (Sand+Clay, Geist, the six collections, Akiko). |
| `README.md`, `package.json` | Omakase title/copy; package name `omakase-mise`. |
| `knowledge-base/voice/`, `customer/` | Omakase voice + Akiko ICP. |
| `knowledge-base/standards/` | Light rebrand (substance kept); example product → Sumi. |
| `knowledge-base/brand/omakase-brand.md` | New canonical brand bible (this rebrand's source of truth). |
| `.claude/agents/`, `skills/`, `commands/` | Aurora→Omakase; `ui-ux-designer` retuned for the Sand+Clay Japanese-luxury aesthetic. |
| `workflows/` | Aurora→Omakase references. |
| `src/`, `deck/` | Owned by other agents in this rebrand; tokens, copy, collections, and fake data updated there. |

## Consequences

- The earlier scaffold decision (`2026-06-03-aurora-scaffold-initialized.md`) is preserved as history with a pointer here; its "Brand" locked-choice now reads Omakase.
- The order-number prefix in the seed data (`AUR-####`) is in the engineer's slice; see the rebrand report. If it is changed to an Omakase prefix, the Playwright full-loop assertion and any `data-testid` expectations must move with it. Otherwise leave it — it is internal and not customer-facing brand copy.
- `data-testid` attributes are unchanged by the rebrand; tests depend on them.

## Alternatives considered

- **Keep the Aurora palette, change only the name.** Rejected: the Sand+Clay warmth and soft radius are core to the Japanese-luxury positioning; a name swap over a teal/sharp palette would read as inconsistent.
- **Rename token CSS variables to Japanese names (e.g. `--sand`, `--clay`).** Rejected: the existing token *names* (`paper`, `ink`, `accent`, `hairline`) are stable across the codebase and the deck; renaming them would touch every file for no semantic gain. We changed the values, not the names.

## Link

Canonical brand doc: `../brand/omakase-brand.md`.
