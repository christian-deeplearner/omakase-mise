# Decision — Omakase scaffold initialized

- **Date:** 2026-06-03
- **Status:** accepted
- **Owners:** director, cto
- **Context:** First entry in the Omakase decision log. The point of a decision log is that the next agent — or the next model — can read *why*, not just *what*. (The repo scaffold was first authored under the working name "Aurora"; the brand was set to Omakase in the 2026-06-06 rebrand — see `2026-06-06-rebrand-to-omakase.md`.)

## Decision

Stand up `omakase-mise` as a single Next.js 16 App Router app: a customer-facing **Omakase storefront** and an operator **command center**, sharing one deterministic fake-data layer behind a clean seam. Ship it with a real memory base (`knowledge-base/`) and a real Claude Code harness (`.claude/`), authored to be the teachable artifact a webinar can reveal.

## Why

- **One app, two surfaces, one data seam** keeps the demo honest: a customer action on the storefront becomes operator-visible in the command center because they read the same fixtures. The end-to-end loop is the lesson.
- **Fake data behind a seam** (`lib/data-layer/fake/`) means "swap fake for real later" is a one-file change. That seam is itself a teaching point, and it keeps the public repo free of any real data.
- **The repo ships its own context.** `CLAUDE.md` + `knowledge-base/` is the memory base. The harness reads it before acting and writes decisions back into it — so the repo attendees clone is a *working, compounding* asset, not an empty template. "The model is not the moat. Your context is."

## Locked choices

| Choice | Value |
|---|---|
| Framework | Next.js 16.2.7, App Router, React 19, TypeScript strict |
| Styling | Tailwind v4, Sand+Clay tokens in `src/app/globals.css` (paper/card/ink/accent/hairline) |
| Brand | Omakase — fictional Japanese-luxury DTC, "Leave it to us." |
| Data | Deterministic, seeded with `@faker-js/faker`; no real data, ever |
| Verification | Playwright (`pnpm test:e2e`), added live during Mission 2 |
| Memory base taxonomy | `voice / customer / standards / decisions / learnings / index.md` |
| Harness | `.claude/{agents,skills,commands,settings.json}` + `workflows/` |

## Consequences

- Every later decision references this one as the baseline.
- The fake-data seam is load-bearing; do not bypass it with inline data in components.
- Voice and PDP-quality standards are enforced from day one (see `../standards/`).

## Alternatives considered

- **Two separate apps (storefront + dashboard).** Rejected: doubles the surface area and breaks the shared-data-seam lesson. One app with route groups proves the same architecture with less to maintain.
- **Real CMS / real analytics.** Rejected for a public teaching repo: a deterministic fake layer is more honest, more portable, and demo-safe.
