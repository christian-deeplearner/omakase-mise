# Decision — Deploy Omakase to Vercel (public), CLI first + GitHub auto-deploy

- **Date:** 2026-06-07
- **Status:** accepted
- **Owners:** director, cto, qa, security-auditor
- **Context:** Omakase needed to go live on a public URL so the storefront and command center can be shown without a local checkout. The repo is already public (a teaching artifact); the hard constraint was that **nothing sensitive may leak** while still getting it live. The app is one Next.js 16 app over an in-memory, deterministic fake-data seam — no database — so "deploy" is mostly: confirm safety, harden the few serverless-incompatible spots, push to a host, and prove it works.

## Decision

Host on **Vercel** under `christiandeeplearners-projects`, project **`omakase-mise`**.

- **First deploy via the Vercel CLI** (`vercel --prod`) from the local working tree — fastest path to live, and it carried the hardening before it was committed.
- **GitHub repo linked to the project** during `vercel link`. Push-to-deploy additionally needs the **Vercel GitHub App granted access to this repo** (a one-time browser grant at github.com/settings/installations → Vercel → Configure); for a freshly-created project that grant is pending, so until it's added the team ships with `vercel --prod`. Once granted, every push to `main` builds a new production deployment and other branches get previews.
- **`OMAKASE_SESSION_SECRET`** set as a Vercel env var (production + development; preview falls back) so the operator session JWT isn't signed with the public dev fallback.
- **`FAL_KEY` deliberately NOT set on Vercel.** Image generation writes to `/public` (read-only on serverless) and the Studio gate is a public demo password — setting the key would expose us to public Fal-credit burn for zero benefit. The committed gallery is what the host serves.

Live URLs:
- Storefront: **https://omakase-mise.vercel.app**
- Command center: **https://omakase-mise.vercel.app/overview** (demo gate: any email + password `omakase`)

## Why

- **CLI-first gets it live now**; Git integration makes every subsequent change deploy itself. Best of both — no waiting on a push for the first launch, no manual redeploys after.
- **Vercel auto-detects Next.js 16.2.7** (build `next build`, no config) and matches the pinned Node 22.x. No `vercel.json` needed.
- **No DB to provision.** The deterministic seed means every read surface (browsing, PDPs, all dashboards, analytics) is fully populated on a cold start. Going live is genuinely just "host the app."
- **Withholding `FAL_KEY` is the safe default for a public surface** — it removes a cost/abuse vector and loses nothing, because the read-only filesystem can't persist a generated frame anyway.

## What we hardened first (so the public demo doesn't show raw errors)

| Spot | Problem on serverless | Fix |
|---|---|---|
| `POST /api/studio/generate` | Writes frames to `/public` → `EROFS` → raw 500 in the UI | Studio page passes `hosted={!!process.env.VERCEL}`; client shows an on-brand "runs locally" notice and disables Generate; the route early-returns a clean `422` as defense-in-depth |
| `/agents` page | Reads `.claude/agents/*.md` + `knowledge-base/decisions/*.md` at request time; not traced into the bundle → empty page | `next.config.ts` `outputFileTracingIncludes` for `/agents` pulls those globs into the function bundle |
| Build reproducibility | No Node pin | `package.json` `engines.node: "22.x"` |

## Known limitations (accepted, documented — see the learning)

- **Cross-surface writes don't persist on serverless.** The signature "place an order → it appears in the command center" flow lives in an in-memory `globalThis` world that resets per cold-start and isn't shared across instances. All *read* surfaces work; the live *write→reflect* loop is best-effort within a warm instance. Follow-up: back the seam with Vercel KV.
- **Studio live generation is local-only.** The host serves the committed gallery; run `pnpm generate:images` locally to make new frames.
- **The command-center gate is a demo password** (`omakase`, shown on `/login`) — intentional for a public teaching demo, not real auth.

## How it was verified

Two `qa` agents (storefront + command center) asserted every route on the live URL: storefront 8/8 (200s, PDP markers, no leaks), command center 10/10 (auth gate 307→login, login, all five consoles, Studio hosted-guard present + Generate disabled, `/agents` roster populated, generate route 422, no leaks). Browser screenshots captured for home, a PDP, overview, Studio, and agents.

## Connects to

- Runbook: `../../docs/deployment/VERCEL.md` (how to redeploy, rollback, env vars).
- Learning: `../learnings/2026-06-07-vercel-serverless-and-the-in-memory-seam.md`.
- Standard: `../standards/review-links-standard.md` (this decision ends with live links).
- Decision: `2026-06-03-aurora-scaffold-initialized.md` (the in-memory seam this builds on).
