# Workflow: pre-deployment

The gate that stands between "it works on my machine" and a deploy. Every item is binary. If any is red, you do not deploy — you fix.

## Gates

| # | Gate | Command / check | Owner |
|---|---|---|---|
| 1 | Build is clean | `pnpm build` → 0 type errors | `cto` |
| 2 | Lint is clean | `pnpm lint` → exit 0 | `cto` |
| 3 | Seed is deterministic | `pnpm seed` → fixtures regenerate identically | `fullstack-engineer` |
| 4 | E2E is green | `pnpm test:e2e` → all specs pass, incl. full-loop checkout | `qa` |
| 5 | Mobile holds | resize to ~390px on changed surfaces | `ui-ux-designer` |
| 6 | No secrets staged | `git status` / diff review — nothing private | `cto` |
| 7 | Voice gate | customer copy: no hype, no urgency, **no somatic language** | `ui-ux-designer` |

## After the gates
- Deploy is **confirmed, never silent** (`.claude/settings.json` asks on `vercel`; the guard hook notes a prod deploy).
- Report a **review link** — the deployed URL — that the decision-maker can click.
- Append the deploy decision to `knowledge-base/decisions/`.

> Shipping isn't a URL existing on the internet. Shipping is sending it to someone and waiting for the reply.
