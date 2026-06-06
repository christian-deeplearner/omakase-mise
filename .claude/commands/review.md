---
description: "Review a plan or a diff against Omakase's standards and gates before it goes further."
---

# /review

Review the current plan or diff. Read the diff, not the summary. Ask of every change:

- **Seam:** does data still flow only through `src/lib/data-layer/`? No inline data in components?
- **Types:** strict, no `any`, using `src/lib/types.ts`?
- **Boundaries:** Server Components by default; `"use client"` only where needed?
- **Tokens:** Sand+Clay colors from `globals.css`, no invented hex? Omakase restraint (soft radius, *ma*, mixed-case headings) held?
- **Voice:** no hype, no urgency, **no somatic/wellness-practice language** in customer copy?
- **Safety:** no secrets, no force-push, no real data?
- **Literal read:** what would this do if an agent took the prompt literally?

Output: a short redline — what's blocking (must fix), what's a nit (optional), and the one thing most likely to bite later. Approve only when the blocking list is empty.
