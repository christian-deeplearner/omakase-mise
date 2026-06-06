# Workflow: build-webinar  ·  the meta-artifact

This file is the reveal. The webinar "How to Become a 100x Engineer" teaches a method — and this repo, *and the deck in `deck/`, were built by that exact method*: a Claude Code agent team running workflows, grounded in a memory base, verified with Playwright. Nothing here is a mockup.

> The model is not the moat. Your context is.

## What was built
- **`omakase-mise`** — this repo: an Omakase storefront + an operator command center over one deterministic fake-data seam.
- **`deck/`** — the reveal.js workshop deck (~34 slides) that presents it. Re-sequenced **theory-first** (harness engineering → concepts → practice → close) by the Omakase agent team via `workflows/redesign-deck.md`; see `knowledge-base/decisions/2026-06-05-deck-reworked-theory-first.md`.
- **The harness** — `CLAUDE.md`, `knowledge-base/` (the memory base), `.claude/agents` (the team), `.claude/skills`, `.claude/commands`, `.claude/settings.json` (hooks), and these `workflows/`.

## How it was built (the real run)

```
PHASE 0 — UNDERSTAND  (read-only research, two workflows)
  • a build blueprint workflow: parallel research agents → an integrated plan
  • an AI-native knowledge-layer workflow: mine the project's learnings, lessons,
    and content theses → the conceptual spine the deck teaches
  GATE: a plan the human read in plan mode and approved

PHASE 1 — FOUNDATION  (parallel, disjoint files)
  • fake-data layer (seeded faker)   • design system (UI + charts)
  • memory base + harness            • reveal.js deck
  GATE: each owns its own files; no collisions

PHASE 2 — SURFACES  (parallel)
  • Omakase storefront  ∥  operator command center

PHASE 3 — INTEGRATE
  • cto: make pnpm build + pnpm lint green across the whole app
  GATE: build clean, 58 routes, 0 type errors

PHASE 4 — VERIFY
  • qa: add Playwright; e2e/storefront-checkout.spec.ts proves a real checkout
    appears in the command center; overview + orders specs
  GATE: pnpm test:e2e green
```

## The team that ran it
`director` (orchestrate, never codes) · `tpm` (sequence + gates) · `cto` (architecture + build gate) · `fullstack-engineer` (surfaces + seam) · `ui-ux-designer` (Omakase design system) · `qa` (the Playwright proof). Named staff with job descriptions — not anonymous parallel processes. See `.claude/agents/`.

## The lesson
Every decision made during the build was written back into `knowledge-base/decisions/`. So the repo you cloned is already a *working, compounding* memory base — not an empty template. Run `workflows/new-feature.md` to add your own surface the same way.

Enable the team: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude` (already set in `.claude/settings.json`).
