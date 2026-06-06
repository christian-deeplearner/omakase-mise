# Standard — Always Include a Review Link

> Work is not done until there is a link a human can click to review it. "Done" without a link is a claim, not a fact.

This is a hot standard `CLAUDE.md` enforces. Every agent that reports completed work — code, copy, a built surface — ends its report with a review link.

## The rule

When you report a change as done, the report must include **a link the decision-maker can click to see the result.** No link, not done.

- A built page → the local URL (`http://localhost:3000/...`) and, once deployed, the preview URL.
- A PR → the GitHub PR link.
- A passing test run → the surface the test verifies, plus the run output.
- A generated PDP → the product URL plus its gate score (see `pdp-quality-gate.md`).

## Why

"Shipping isn't a URL existing on the internet. Shipping is sending it to someone — and waiting for the reply." A review link is what turns a finished task into a closed loop. It makes the work *legible*: the reviewer spends thirty seconds clicking, not ten minutes reconstructing what you did.

It also forces honesty. If you cannot produce a working link, the thing is not done — you found that out before the decision-maker did. That is the gate working.

## What good looks like

```
Built the Sumi collection page.
- Route: app/(store)/collections/sumi/page.tsx
- One product per view, full-bleed hero, on-voice one-liner (PDP gate 88/100)
Review: http://localhost:3000/collections/sumi   (mobile: resize to 390px — verified)
Verified with Playwright: e2e/collections.spec.ts — green.
```

## What fails this standard

- "Done — built the collection page." (no link)
- "Should work now." (no link, no verification)
- A link to code instead of a link to the running result. Code is *evidence*; the running surface is the *deliverable*.

## Pairs with verification

A review link without verification is half the loop. The full move: **verify with Playwright → produce the review link → send it.** See `CLAUDE.md` › Verification and `../../workflows/pre-deployment.md`.
