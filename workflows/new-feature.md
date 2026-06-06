# Workflow: new-feature

A sequence-and-gate workflow for adding a surface or feature to Omakase. Phases are ordered; each gate is **binary**. The `director` runs it; owners are agents from `.claude/agents/`.

```
PLAN ──▶ BUILD ──▶ VERIFY ──▶ SHIP
 (G1)     (G2)      (G3)      (G4)
```

## Phase 1 — PLAN  ·  owners: `tpm`, `cto` (model: opus)
- Read `CLAUDE.md`, the relevant `knowledge-base/` leaves, and the existing code.
- `tpm` decomposes the outcome into ordered, owned tasks with binary acceptance criteria and a parallel/serial map.
- `cto` confirms the approach respects the seam, the type contract, and the tokens.
- **GATE 1 — plan approved:** the human reads the plan in plan mode and approves. No code before this.

## Phase 2 — BUILD  ·  owners: `fullstack-engineer` ∥ `ui-ux-designer` (model: sonnet)
- Implement in the assigned files only. Reuse `src/components/*`, `src/lib/utils.ts`, `src/lib/data-layer/`.
- Parallel where files are disjoint (e.g. data + UI); serial where shared.
- **GATE 2 — builds clean:** `pnpm build` green, `pnpm lint` exits 0, the surface renders on seeded data (desktop + ~390px).

## Phase 3 — VERIFY  ·  owner: `qa` (model: sonnet)
- Add or extend `e2e/*.spec.ts` for the new workflow. If it touches store or orders, the full-loop `storefront-checkout.spec.ts` must still pass.
- Run `pnpm test:e2e`, twice.
- **GATE 3 — proven:** the suite is green; the exact output is in the report.

## Phase 4 — SHIP  ·  owner: `cto` → human
- Small commit(s). `gh pr create --fill` with the verification result attached.
- Deploy only after gates pass (the guard hook flags a prod deploy).
- Write the decision/learning back to `knowledge-base/`.
- **GATE 4 — done:** a clickable review link is reported. No link, not done.
```
```
