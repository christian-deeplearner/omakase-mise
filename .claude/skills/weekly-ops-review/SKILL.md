---
name: weekly-ops-review
description: "Produce the weekly Omakase operations review from the command-center data — what changed, what needs attention, one decision. Use every week."
---

# Skill: weekly-ops-review

## When to use
Once a week, or before a stakeholder check-in.

## Procedure
1. **Pull the numbers** from `src/lib/data-layer/`: `getKpis()`, `getFunnel()`, recent `getOrders()`, `getActivity()`.
2. **Frame for the operator** — a dashboard answers questions, it doesn't list metrics. Answer: What changed since last week? What needs attention? Where is the funnel leaking? What is one decision to make now?
3. **Write the review** as a short markdown brief: Highlights · Funnel (with the biggest drop-off) · Orders/AOV trend · Attention (3 items max) · One decision + recommendation.
4. **Write it back.** Append the durable takeaway to `knowledge-base/learnings/` and any decision to `knowledge-base/decisions/`. The base compounds.
5. **Report a review link** to the relevant command-center surface.

## Done means
A one-screen review that drives a decision, plus a learning written back to the memory base.
