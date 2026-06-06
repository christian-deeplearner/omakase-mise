---
description: "Ship the current change the Omakase way: build → verify → PR → deploy (confirmed) → review link."
---

# /ship

Run the ship sequence for the current change. Shipping isn't a URL existing on the internet — it's sending it to someone and waiting for the reply. Don't skip a step.

1. **Build.** `pnpm build` — must be clean, no type errors. `pnpm lint` exits 0.
2. **Verify.** `pnpm test:e2e` — the relevant spec(s) green, including the full-loop checkout test if the change touches store or orders.
3. **Commit small.** One change, a clear message. Git is memory.
4. **PR.** `gh pr create --fill` — title + what changed + how it was verified. Attach the test result.
5. **Deploy** only after the gates pass. Deploys are confirmed, never silent (the guard hook will stop a force-push and flag a prod deploy).
6. **Report a review link** — the deployed URL or the PR — that the decision-maker can click. Never report "shipped" without it.

If any gate is red, stop and fix. Done beats perfect; broken doesn't beat anything.
