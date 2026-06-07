# Learning — Serverless is read-only and stateless; design the demo around it

- **Date:** 2026-06-07
- **Tags:** deployment, vercel, serverless, fake-data-seam, hardening
- **Confidence:** high

## The learning

The same in-memory fake-data seam that [keeps the demo honest](2026-06-03-fake-data-seam-keeps-the-demo-honest.md) locally hits two hard walls on a serverless host (Vercel), and both were predictable from first principles:

1. **The filesystem is read-only.** Only `/tmp` is writable, and the deployment bundle is immutable. Any code that writes into the project at request time fails. For Omakase that was the creative pipeline writing rendered frames to `/public` (`src/lib/creative/fal.ts`, `pipeline.ts`) — a raw `EROFS` surfaced in the Studio UI.
2. **There is no shared, persistent process memory.** A `globalThis` value (our `__OMAKASE_WORLD__` and the creative approvals map) lives only inside one warm function instance. It resets on cold-start and is not shared across instances. So a *write* on the storefront (a checkout) is not reliably visible to a later *read* on the command center.

Neither is a Vercel bug — it's the serverless contract. The fix is not to fight it; it's to **design the demo around it** and be honest about what's live.

## What we did about each

- **Read-only FS → guard the write, don't attempt it.** The Studio page passes `hosted={!!process.env.VERCEL}` to the client, which shows an on-brand "generation runs locally" notice and disables Generate. The API route early-returns a clean `422` (defense-in-depth) instead of an `EROFS` 500. The host serves the *committed* gallery; generation stays a local operation (`pnpm generate:images`).
- **Files read at request time → trace them into the bundle.** The `/agents` page reads `.claude/agents/*.md` and `knowledge-base/decisions/*.md` via `fs.readdir`/`fs.readFile`. Next's output file tracing can't see dynamic reads, so they're missing from the function bundle and the page renders empty. `next.config.ts` `outputFileTracingIncludes` (keyed by the route glob `/agents`, values are project-root globs) pulls them in. Verified live: the roster and decision log render on the hosted page.
- **No shared memory → accept it for reads, document it for writes.** Every *read* surface is fully populated on a cold start because the seed is deterministic — browsing, PDPs, KPIs, funnel, analytics all work on the host with no database. Only the live *write→reflect* loop is best-effort within a warm instance. We shipped that as a documented limitation rather than blocking launch on a datastore.

## The rule it implies

- **Before deploying anything to serverless, grep for runtime `fs.write*` and runtime `fs.read*` of project files**, and for `globalThis`/module-level mutable state expected to persist. Each is a known failure mode with a known fix (write→`/tmp` or external store; read→`outputFileTracingIncludes`; state→external KV/DB).
- **A public demo should never show a raw runtime error.** If a feature can't work on the host, detect the host (`process.env.VERCEL`) and degrade to an honest, on-brand message — then disable the control that triggers it.
- **Decide what is genuinely "live" vs "served."** Say it plainly in the docs. "Browsing and dashboards are live on deterministic data; live image generation and cross-surface order persistence are local-only / best-effort" is more honest — and more teachable — than implying everything is fully stateful.

## The follow-up (when the write→reflect loop must be rock-solid on the host)

Back the seam with **Vercel KV / Upstash Redis**: the data layer (`src/lib/data-layer/fake/store.ts`) is already a single module the whole app reads through, so swapping the `globalThis` world for a KV-backed store is the same "swap fake for real" one-seam change the architecture was designed for. Not done at launch — the read surfaces don't need it, and "live now" was the goal.

## Connects to

- Decision: `../decisions/2026-06-07-deploy-to-vercel.md`.
- Runbook: `../../docs/deployment/VERCEL.md`.
- Learning: `2026-06-03-fake-data-seam-keeps-the-demo-honest.md` (the seam this stresses).
