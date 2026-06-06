---
description: "Run the Omakase verification gate and report the result with a review link."
---

# /verify

Prove it works; don't assert it. Diagnose → decide → act → **verify**.

1. `pnpm build` → clean (type-check gate).
2. `pnpm dev` → open the changed surface; it renders on seeded data. Resize to ~390px — mobile holds.
3. `pnpm test:e2e` → the relevant spec is green. If the change touches store or orders, the full-loop `storefront-checkout.spec.ts` must pass.
4. Spot-check the numbers the change should move (KPIs, order count) actually moved.

Report: the exact command output (not a paraphrase), what you verified, and a clickable review link. If anything is red, it's not verified — say so plainly.
