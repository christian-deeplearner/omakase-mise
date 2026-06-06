# Learning — The fake-data seam is what keeps the demo honest

- **Date:** 2026-06-03
- **Tags:** architecture, fake-data, teaching, verification
- **Confidence:** high

## The learning

A clean data-access **seam** — one module the whole app reads through (`lib/data-layer/fake/`) — does three jobs at once, and that triple-duty is the whole reason the seam exists:

1. **It keeps the public repo safe.** No real data anywhere; the seam is the only place data is produced, and it's seeded faker output. You can show every file on a webinar screen without leaking anything.
2. **It keeps the demo deterministic.** Seeded faker means the same fixtures every run. The order numbers, the KPIs, the customer names — identical on stage and on a rehearsal laptop. Determinism is what makes a *live* demo safe to run live.
3. **It teaches the "swap fake for real later" move.** Because storefront and command center both read through the seam, replacing fake with a real backend is a one-file change. The seam *is* the lesson about good boundaries.

## Why it matters

The temptation, when building a demo fast, is to inline data in the components — a hardcoded array in the collection page, a magic number in the KPI card. It works, it ships, and it quietly destroys the demo's value: now the storefront and the command center disagree, the numbers drift, and you can't tell the "swap the backend" story because there's no seam to swap.

The discipline — *all data flows through one module* — is cheap to hold from day one and expensive to retrofit. Hold it from day one.

## The rule it implies

- Components and pages never produce data. They read it through the seam.
- The seam is seeded and deterministic. A rebuild of fixtures (`pnpm seed`) yields the same data.
- A customer action on the storefront and its reflection in the command center read the *same* fixtures — that shared read is what makes the end-to-end Playwright test (`storefront-checkout.spec.ts`) meaningful.

## Connects to

- Decision: `../decisions/2026-06-03-aurora-scaffold-initialized.md` (locked the seam).
- Standard: `../standards/review-links-standard.md` (verified work produces a clickable result — only possible because the data is deterministic).
