# Workflow: redesign-deck

A sequence-and-gate workflow for reworking the reveal.js deck in `deck/`. Phases are ordered; each gate is **binary**. The `director` runs it; owners are agents from `.claude/agents/`. This is the workflow the Omakase agent team ran (on Opus 4.8) to re-sequence the deck **theory-first** — see `knowledge-base/decisions/2026-06-05-deck-reworked-theory-first.md`.

Note: this is an Omakase **gated process spec** (a sequence of human-checked gates), not a Claude Code dynamic-workflow JS script (`agent()`/`parallel()`). The `deck/` deck *teaches* both; this file *is* the former.

```
UNDERSTAND ──▶ DESIGN ──▶ BUILD ──▶ VERIFY ──▶ SHIP
   (G1)         (G2)       (G3)      (G4)       (G5)
```

## Phase 1 — UNDERSTAND  ·  owners: `tpm`, `cto` (model: opus)
- Read the running order + sourced quotes in the blueprint (sections B and C), `CLAUDE.md`, and the real repo artifacts the deck must cite: `.claude/agents/`, `workflows/`, `.claude/settings.json`, `knowledge-base/`.
- `tpm` decomposes the rework into ordered, owned tasks: the four acts (I THEORY · II CONCEPTS · III PRACTICE · IV CLOSE) and the slide-level beats, each with a binary acceptance criterion.
- `cto` confirms every PRACTICE prompt/command maps to a **verbatim** line in a named repo file, and that the four honesty labels hold (gated process spec vs. dynamic-workflow JS; remote control = capability, not artifact; agent teams = experimental + token-heavy; no private design reference in the deck).
- **GATE 1 — sourcing approved:** the human reads the slide map in plan mode and approves. Every quote has a source; every prompt names its repo file. No edits to `deck/` before this.

## Phase 2 — DESIGN  ·  owner: `ui-ux-designer` (model: sonnet)
- Extend the existing deck, do not rebuild: the deck CSS already mirrors the Omakase Sand+Clay tokens in `src/app/globals.css`. Reuse `.label`, `.display`, `.row`, `.stat`, `.concept`, `.demo-badge`, `.fallback`, `.prompt-label`, `section.panel`, `section.motif`, `.cols`, `.card-note`, `.qr`.
- Tokens only — never invent a hex. Status colors map to gates: `positive` = gate passed, `warning` = ask/confirm, `critical` = LIVE DEMO. Motif planted in Act I, paid off in Act III, reprised in Act IV.
- **GATE 2 — design approved:** the four-act structure, section dividers, and component reuse are signed off; no new color, no decoration that doesn't earn its place.

## Phase 3 — BUILD  ·  owner: `ui-ux-designer` (model: sonnet)
- Re-sequence `deck/index.html` into the four acts (~34 slides). Theory before concepts before practice — the deck is built the way the repo was built (`build-webinar.md` PHASE 0 is read-only *understand* before any code).
- Every PRACTICE slide carries a prompt-card whose label names the source file (e.g. `workflows/new-feature.md`, `.claude/agents/director.md`, `.claude/settings.json`). Label each capability: Omakase `workflows/*.md` are gated process specs; `agent()`/`parallel()` is the Claude dynamic-workflow JS feature. Remote control gets one concept slide + one mention, never a live demo.
- **GATE 3 — renders clean:** the deck opens via `npx serve deck` with 0 console errors, the slide count is ~34, and every slide renders at the projector aspect and at laptop width. No broken fragments, no missing tokens.

## Phase 4 — VERIFY  ·  owner: `qa` (model: sonnet)
- Render-walk every slide; confirm the four-act order and that the motif lands in I, III, and IV.
- **Prompt-fidelity check:** for each PRACTICE prompt/command, grep the named source file and assert the text matches **verbatim**. A prompt that doesn't match its source file fails the gate.
- Honesty check: no private design reference rendered or named; remote control is a concept, not a demo; the agent-teams caveat (experimental + token-heavy) is present.
- **GATE 4 — proven:** the render walk is clean and every prompt maps to a real repo line. The exact source-file matches are in the report. A claim of fidelity without the grep output is not a report.

## Phase 5 — SHIP  ·  owner: `cto` → human
- Small commit(s). `gh pr create --fill` with the render walk and the prompt-fidelity matches attached.
- Write the decision back to `knowledge-base/decisions/` (the theory-first re-sequence) and any learning to `knowledge-base/learnings/`.
- Keep the meta-artifact consistent: update `workflows/build-webinar.md` slide count and the theory-first note.
- **GATE 5 — done:** a clickable review link to the served deck is reported. No link, not done.
