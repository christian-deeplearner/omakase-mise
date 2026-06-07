# Omakase

**Leave it to us.** A fictional Japanese-luxury DTC commerce app — a customer-facing **storefront** and an operator **command center** over one deterministic fake-data layer. Curated essentials, chosen for you: considered, calm, and built to last.

Omakase is a teaching artifact. It was built by a Claude Code **agent team** for the "How to Become a 100x Engineer" webinar, and it ships with the thing it teaches: a working **memory base** (`knowledge-base/`) and a real **harness** (`.claude/`). Nothing here is real — Omakase sells fictional goods, the data is seeded with faker, and the whole repo is safe to read on a screen.

> The model is not the moat. Your context is.

---

## Live

Omakase is deployed publicly on Vercel:

- **Storefront:** <https://omakase-mise.vercel.app>
- **Command center:** <https://omakase-mise.vercel.app/overview> — demo gate: any valid email + password `omakase`

The repo is linked to the Vercel project; once the Vercel GitHub App is granted access to this repo, pushes to `main` auto-deploy (until then, ship with `vercel --prod`). The hosted demo serves the committed gallery and deterministic seed data; live image generation and cross-surface order persistence are local-only on serverless (by design). How it's set up, how to ship and roll back: **`docs/deployment/VERCEL.md`**.

---

## The meta-story

This repo, and the deck that presents it, were built by the method they teach. A named agent team — a director who orchestrates and never codes, plus engineers, a designer, and QA — ran the **Context → Plan → Build → Ship** loop, read the memory base before acting, wrote its decisions back into `knowledge-base/decisions/`, and verified every surface with Playwright before calling it done. The repo you clone is therefore not an empty template. It is a memory base that already compounded.

If you want to see how, read `workflows/build-webinar.md` and `knowledge-base/decisions/`.

---

## Two missions

### Mission 1 — Clone + run
Get an AI-native command center on your machine and see Omakase running locally.

```bash
pnpm install
pnpm dev
```

- Storefront: <http://localhost:3000>
- Command center: <http://localhost:3000/overview>

Both surfaces render on seeded fake data. Regenerate the fixtures any time — deterministically — with `pnpm seed`.

### Mission 2 — Build a surface with an agent team, then verify it
Open Claude Code with agent teams enabled, point the team at a brief, and build a real surface — a collection page, a PDP, a command-center view. Then prove it works with Playwright before you call it done.

```bash
# enable the experimental agent team
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude

# verify the change end-to-end
pnpm test:e2e
```

The killer test (`e2e/storefront-checkout.spec.ts`) drives a checkout on the storefront, then asserts the order appears in the command center's Orders view and the Overview KPIs update — customer action → operator visibility → verified end-to-end.

---

## How to run

| Step | Command |
|---|---|
| Install | `pnpm install` |
| Dev (both surfaces) | `pnpm dev` |
| Production build | `pnpm build` |
| Regenerate fixtures (deterministic) | `pnpm seed` |
| Generate brand imagery | `pnpm generate:images` |
| Lint | `pnpm lint` |
| End-to-end tests | `pnpm test:e2e` *(added during Mission 2)* |
| Deploy to production | `vercel --prod` (or `git push origin main` once the Vercel GitHub App has repo access) — runbook: `docs/deployment/VERCEL.md` |

Requires Node (use `nvm`) and `pnpm`.

---

## Images

Omakase generates its own imagery — editorial photography for a Japanese-luxury label, on the Sand+Clay palette — through a gated creative loop run by the `art-director` agent.

```bash
# 1. drop your Fal key into .env.local (gitignored — never commit it)
echo "FAL_KEY=your-fal-key" >> .env.local

# 2. generate the brand imagery
pnpm generate:images
```

- Frames land in `public/images/` — hero (`hero.jpg`), collections (`collections/<slug>.jpg`), products (`products/<slug>-01.jpg` / `-02.jpg`) — and render on the storefront from `/images/...`.
- **No key? It still works.** If `FAL_KEY` is absent, the generator falls back to a deterministic warm-sand **stub**, so the loop runs offline and this public repo is safe to clone without secrets.
- The model is `fal-ai/nano-banana-pro` (override with `FAL_MODEL`). The prompt method, the 7-part image-prompt architecture, and the agent roles live in `docs/creative/` (`PIPELINE.md`, `PROMPT-ENGINEERING.md`, `AGENT-ARCHITECTURE.md`); the brand image gate is `knowledge-base/standards/2026-06-06-omakase-image-standard.md`.

---

## What's in here

```
CLAUDE.md            # the company operating doc — read this first
knowledge-base/      # the memory base: voice, customer, standards, brand, decisions, learnings
.claude/             # the harness: agents (named staff), skills, commands, settings + hooks
workflows/           # sequence + gate workflows (incl. build-webinar.md — the meta-artifact)
src/                 # the Next.js app (storefront + command center) and shared lib
```

Start with **`CLAUDE.md`**. It is the operating doc the agents read before they do anything — and the clearest map of how Omakase works. The canonical brand doc (Sand+Clay tokens, voice, the six collections) lives at `knowledge-base/brand/omakase-brand.md`.

---

## A note on what this is and isn't

- **Fictional.** Omakase is invented. No real brand, no real customer data, no real products.
- **Deterministic.** Faker is seeded, so the demo is the same every run.
- **Honest about limits.** The value here isn't "autonomous agents." The value is that the workflow has a home — a memory base agents read, standards they verify against, and a review link at the end so a human can always click and check.
