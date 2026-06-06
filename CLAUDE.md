# Omakase — Company Operating Doc

Omakase (お任せ — "I leave it to you") is a fictional Japanese luxury label — "Leave it to us." It sells curated, considered essentials: elevated tailoring × calm athleisure × limited drops. This repo is its operating system: a customer-facing **storefront** and an operator **command center**, one Next.js app over one deterministic fake-data layer.

This file is the first thing a new senior hire reads on day one. It is not code memory; it is how the company works. Agents read it before acting. The spine is kept tight; detail lives in `@`-imported leaves and the `knowledge-base/` (the memory base).

> The model is not the moat. Your context is. This file, and the `knowledge-base/` beside it, are that context.

This repo runs on a pre-release Next.js — read the version-specific rules before writing code:

@AGENTS.md

---

## Who

A small, calm, AI-native commerce team. Humans set taste and make the calls; a named agent team does the legible, repeatable work and writes what it learns back into the memory base. We multiply judgment, we do not replace it. The brand is the team's posture: curated, considered, certain — leave it to us.

## What

One Next.js 16 app, two surfaces, one seam:
- **Storefront** `app/(store)/` — Japanese-luxury shopping: the six collections (the tasting menu), PDPs, cart, checkout. Editorial but warm; *ma* (negative space) carries the weight.
- **Command center** `app/(command)/` — operator console: overview KPIs, orders, products, customers, analytics. "OMAKASE · OPERATOR" labels; the "LIVE · FAKE DATA" honesty badge stays.
- **One fake-data seam** `lib/data-layer/fake/` — seeded with `@faker-js/faker`, deterministic, no real data ever. A customer action on the storefront becomes operator-visible in the command center because both read this seam.

## Who-For

We build for **Akiko** — see `knowledge-base/customer/icp.md`. She wants better and fewer, not more. She reads the cloth and the construction before the price. She will not be rushed, flattered, or alarmed into a purchase. Every page and every line is written for her, not for "everyone."

## How-We-Talk

Calm, few words, warm-precise, quietly confident, with a drop-culture edge. We state; we do not sell. Lead with the material and the restraint; let whitespace do the work. **Anti-hype.** Full voice — do/don't, banned phrases, worked examples — is the hot leaf below.

@knowledge-base/voice/brand-voice.md

## What-We-Refuse

- Real data of any kind. Omakase is fictional; the data is seeded faker output.
- Hype, urgency theater, and corporate slop in customer copy.
- **Somatic / wellness-practice language** anywhere customer-facing. Hard rule. (See voice + PDP gate.)
- Reporting work "done" without a review link a human can click.
- Pushing secrets to a public repo. Force-pushing shared history.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.7, App Router |
| UI | React 19, TypeScript (strict, **no `any`**) |
| Styling | Tailwind CSS v4 — Sand+Clay tokens in `src/app/globals.css` (paper / card / ink / accent / hairline). Never invent hex. |
| Type | Geist (sans, display + body + UI), Geist Mono (labels / eyebrows / drops), Newsreader (optional warm-luxury serif accent), via `next/font/google`. |
| Data fetching | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Charts | Recharts 3.8 (client components only) |
| Auth (mock) | `jose` JWT — single mock login |
| Primitives | Radix UI, `lucide-react` |
| Fake data | `@faker-js/faker`, seeded → deterministic |
| Verification | Playwright (`pnpm test:e2e`) — added live during Mission 2 |
| Package manager | pnpm |
| Repo | Public GitHub (teaching artifact) |

## Conventions

- **Server Components by default.** Add `"use client"` only for interactivity, hooks, or Recharts.
- **TypeScript strict, no `any`.** Use the shared types in `src/lib/types.ts` everywhere — one source of truth.
- **Shared helpers** live in `src/lib/utils.ts`: `cn`, `formatCurrency(cents)`, `formatNumber`, `formatPercent(ratio)`, `formatDate`. Use them; do not re-implement.
- **All data flows through the seam.** Components and pages never produce data; they read `lib/data-layer/fake/`. (Why: `knowledge-base/learnings/2026-06-03-fake-data-seam-keeps-the-demo-honest.md`.)
- **Product images:** plain `<img>` with the URLs in `product.images`. Not `next/image` (avoids remote-config issues).
- **Design tokens only.** Sand+Clay tokens from `globals.css` (`bg-paper`, `bg-card`, `text-ink`, `text-ink-muted`, `border-hairline`, `bg-accent`). Soft radius (`--radius` 12px; rounded-soft on cards/buttons). Generous *ma* — more whitespace, fine hairlines for structure. Never invent a hex beyond the tokens.
- **Headings mixed-case.** Never force-uppercase headings. Mono labels/eyebrows may be wide-tracked uppercase; display lines are mixed-case.
- **File locations:** storefront `app/(store)/`, command center `app/(command)/`, API route handlers `app/api/{store,dashboard}/`, fake data `lib/data-layer/fake/`, fixtures `fixtures/`, Playwright `e2e/`.
- **One change per commit.** Small, reversible, reviewable. Git is not a backup — Git is memory.
- **Memory base taxonomy:** `knowledge-base/{voice,customer,standards,brand,decisions,learnings,index.md}`. Append decisions and learnings as you work; the base compounds.

## Standards & Gates

Work passes these gates before it is "done."

@knowledge-base/standards/pdp-quality-gate.md
@knowledge-base/standards/review-links-standard.md

Imagery passes the **image gate** (≥80 + veto on text/logo/sci-fi; Sand+Clay palette) — cold standard, run by the `art-director`: `knowledge-base/standards/2026-06-06-omakase-image-standard.md`.

The canonical in-repo brand doc (tokens, voice, the six collections, naming): `knowledge-base/brand/omakase-brand.md`. The cold map of the rest of the memory base (read on request, not auto-loaded): `knowledge-base/index.md`. Keep hot context small; move the rest cold.

## Agent Team

This repo defines a named agent team in `.claude/agents/` — staff with job descriptions, not anonymous parallel processes. `director` orchestrates and never writes code; `tpm`, `cto`, `fullstack-engineer`, `ui-ux-designer`, `qa`, and `art-director` (the agent that produces the imagery) do the work. Use agents to multiply judgment, not replace it.

Enable Claude Code agent teams (experimental):
```bash
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```

Standing skills live in `.claude/skills/` (three you use weekly beat 200 prompts you scroll once): `generate-pdp`, `weekly-ops-review`, `competitor-scan`. Slash commands live in `.claude/commands/`: `/ship`, `/review`, `/verify`. Sequence+gate workflows live in `workflows/`.

## Creative pipeline

Omakase produces its own imagery — editorial photography for a Japanese-luxury label, on the Sand+Clay palette. The pipeline runs one gated loop: **BRIEF → PROMPT → GENERATE → SCORE → SELECT → ASSIGN.**

- **The agent:** `art-director` (`.claude/agents/art-director.md`) briefs the scene, writes the Omakase image prompt (7-part architecture), runs generation, scores variants against the image gate, and writes the winner to the canonical path. This is the agent that produces the images.
- **The code:** `src/lib/creative` (the Fal client wrapper + stub), entered via `scripts/generate-images.mjs`, wired to `pnpm generate:images`. Model `fal-ai/nano-banana-pro` (`FAL_MODEL` overrides), `num_inference_steps` 28, `guidance_scale` 5, `num_images` 1.
- **The surface:** generated frames land in `public/images/` (hero → `hero.jpg`; collections → `collections/<slug>.jpg`; products → `products/<slug>-01.jpg`/`-02.jpg`) and the storefront / a Studio surface renders them from `/images/...`.
- **The key:** `FAL_KEY` lives in `.env.local` (gitignored). **Never print, log, or commit it.** If it's absent, a deterministic **stub** writes a warm-sand placeholder — the loop runs offline and the public repo stays safe.
- **The gate + method:** image gate `knowledge-base/standards/2026-06-06-omakase-image-standard.md`; methodology in `docs/creative/` (`PIPELINE.md`, `PROMPT-ENGINEERING.md`, `AGENT-ARCHITECTURE.md`).

The integrator builds; the human runs generation. Don't run `pnpm build`/`pnpm dev`/`pnpm generate:images` to "check" your prompt — verify the frame at its review link.

## Verification

Every change is verified by running the app and observing behavior — not by asserting it works.

1. `pnpm build` → clean, no type errors.
2. `pnpm dev` → the changed surface renders on seeded data; check mobile (resize to ~390px).
3. **Playwright** (`pnpm test:e2e`) → the relevant spec is green, including `e2e/storefront-checkout.spec.ts`: PDP → add to cart → checkout → assert the order shows in `/orders` and Overview KPIs update.
4. **Report a review link.** Diagnose → decide → act → **verify**. Guardrails in the brief, not in your nerves. Never say "done" without a link the decision-maker can click.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Storefront at `/`, command center at `/overview` |
| `pnpm build` | Production build (type-check gate) |
| `pnpm seed` | Regenerate deterministic fixtures (`scripts/generate-fixtures.ts`) |
| `pnpm generate:images` | Generate brand imagery via Fal (`art-director`) — stub fallback if no `FAL_KEY` |
| `pnpm lint` | ESLint |
| `pnpm test:e2e` | Playwright (added live during Mission 2) |

## Don't

- Don't push secrets to the public repo. Don't `git push --force` shared history.
- Don't report work "done" without a verified review link.
- Don't write hype, urgency theater, or corporate slop — and **no somatic / wellness-practice language** in customer copy. Ever.
- Don't put real data anywhere. Omakase is fictional; data is seeded.
- Don't bypass the fake-data seam with inline data in components.
- Don't invent hex colors — use the Sand+Clay tokens in `globals.css`.
- Don't force-uppercase headings; keep display lines mixed-case.
- Don't add `next/image` for product images; use `<img>` with `product.images`.
