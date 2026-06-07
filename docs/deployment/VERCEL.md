# Deploying Omakase to Vercel

> The runbook for the public deployment. How it's set up, how to ship a change, how to roll back, and the serverless gotchas baked into this app.
> Background and rationale: `knowledge-base/decisions/2026-06-07-deploy-to-vercel.md` and `knowledge-base/learnings/2026-06-07-vercel-serverless-and-the-in-memory-seam.md`.

## Live URLs

| Surface | URL |
|---|---|
| Storefront | https://omakase-mise.vercel.app |
| Command center | https://omakase-mise.vercel.app/overview |
| Vercel project | `christiandeeplearners-projects/omakase-mise` |

Command-center gate (demo only): **any valid email + password `omakase`**. Shown on `/login`. Not real auth.

## How it's wired

- **Host:** Vercel. Framework auto-detected (Next.js 16.2.7, build `next build`). No `vercel.json`.
- **Node:** pinned to `22.x` via `package.json` → `engines.node`.
- **Git integration:** the GitHub repo is linked to the project (`vercel git connect` reports "already connected"). **Push-to-deploy also requires the Vercel GitHub App to have access to this repo** — for a freshly-created project the App often isn't granted the new repo yet, so pushes won't deploy until you add it. Grant it once at <https://github.com/settings/installations> → **Vercel** → **Configure** → add `omakase-mise` to the repository access list. After that, every push to `main` auto-deploys (other branches get previews). Until then, ship with `vercel --prod`. The first launch was a direct CLI deploy of the local working tree.
- **Local link:** `.vercel/` (gitignored) holds the project link. Re-create with `vercel link` if missing.

## Environment variables (Vercel project settings)

| Var | Set on Vercel? | Why |
|---|---|---|
| `OMAKASE_SESSION_SECRET` | **Yes** (production, development) | Signs the operator session JWT. Without it the code falls back to a public dev secret (`src/lib/auth.ts`). |
| `FAL_KEY` | **No — deliberately** | Image generation writes to read-only `/public` on serverless (can't work), and the Studio gate is a public demo password. Setting it would only expose us to public Fal-credit burn. The host serves the committed gallery. |
| `FAL_MODEL` | No | Has a code default; only relevant for local generation. |

**The secret never lives in the repo.** It's in Vercel's encrypted env store and in local `.env.local` (gitignored, never committed). To set/rotate:

```bash
# value is read from a shell var so it's never printed to a log
V=$(openssl rand -hex 32)
printf '%s' "$V" | vercel env add OMAKASE_SESSION_SECRET production
printf '%s' "$V" | vercel env add OMAKASE_SESSION_SECRET development
unset V
# rotating? remove the old value first: vercel env rm OMAKASE_SESSION_SECRET production
```

After changing an env var, redeploy for it to take effect.

## Ship a change (the normal path)

```bash
pnpm build              # local gate: strict TS + ESLint must be clean
git add -p && git commit -m "…"
git push origin main    # → Vercel auto-builds & deploys production
```

Watch the build at the Vercel dashboard (or `vercel inspect <url>`). The push is the deploy.

## Deploy manually (bypass git, e.g. to ship an uncommitted hotfix)

```bash
vercel --prod --yes     # uploads the local working tree, builds remotely, returns the prod URL
```

First-time setup on a fresh machine:

```bash
vercel login            # if not already authed (run yourself: ! vercel login)
vercel link --yes       # link to christiandeeplearners-projects/omakase-mise
```

## Roll back

```bash
vercel ls omakase-mise              # list recent deployments
vercel rollback <deployment-url>    # promote a previous deployment to production
```

Or use the dashboard → Deployments → ⋯ → "Promote to Production" / "Instant Rollback".

## Verify a deployment

Smoke test (no auth):

```bash
BASE="https://omakase-mise.vercel.app"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/"            # 200
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/overview"    # 307 → /login (auth gate)
```

Full gated check (login → cookie → consoles):

```bash
curl -s -c /tmp/omk.txt -X POST "$BASE/api/auth/login" \
  -H 'content-type: application/json' \
  -d '{"email":"operator@omakase.test","password":"omakase"}'
for p in overview orders products customers analytics studio agents; do
  echo -n "$p "; curl -s -o /dev/null -w "%{http_code}\n" -b /tmp/omk.txt "$BASE/$p"
done   # all 200
```

The repo's `e2e/` Playwright specs target a local server; they're the deeper gate to run before a push.

## Serverless gotchas (already handled — don't "fix" them)

1. **Read-only filesystem.** Studio image generation writes to `/public`, which fails on Vercel. The Studio UI detects the host (`process.env.VERCEL`), shows a "runs locally" notice, and disables Generate; `POST /api/studio/generate` returns a clean `422`. Generate new frames **locally** with `pnpm generate:images`, commit them, push.
2. **`/agents` reads repo markdown at request time.** `next.config.ts` `outputFileTracingIncludes` traces `.claude/agents/*.md` + `knowledge-base/decisions/*.md` into the function bundle. If you move those dirs, update the globs or the page renders empty.
3. **In-memory data resets per cold-start.** The fake-data world (`globalThis.__OMAKASE_WORLD__`) and Studio approvals are not persisted or shared across instances. Read surfaces are fine (deterministic seed); a live checkout→order-appears demo is best-effort within a warm instance. To make it durable, back the seam with Vercel KV (see the learning doc).

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Push to `main` doesn't deploy | The Vercel GitHub App lacks access to this repo. Grant it at <https://github.com/settings/installations> → Vercel → Configure → add `omakase-mise`. Verify with `vercel ls omakase-mise` (a git push produces a new deployment). |
| Build fails on Vercel but passes locally | Node mismatch — confirm `engines.node` `22.x`; check the Vercel build log for the failing type/lint line. |
| `/agents` page is empty on the host | `outputFileTracingIncludes` glob doesn't match — verify paths in `next.config.ts`. |
| Operator login works but sessions drop | `OMAKASE_SESSION_SECRET` differs between deployments/instances, or wasn't set — set it and redeploy. |
| Studio "Generate" does nothing | Expected on the host — it's disabled by design. Generate locally. |
| Placed an order, it's not in `/orders` | Expected on serverless (in-memory, per-instance). Documented limitation. |
