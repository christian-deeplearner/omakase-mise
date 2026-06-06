# Decision — Deck reworked theory-first

- **Date:** 2026-06-05
- **Status:** accepted
- **Owners:** director, cto, ui-ux-designer
- **Context:** The `deck/` reveal.js deck ("How to Become a 100x Engineer") was practice-first: setup the kitchen, then run missions, with theory only lightly sketched. Engineers resist "another tool" but not a paradigm with receipts. The deck needed to earn the right to teach mechanics before showing keystrokes.

## Decision

Re-sequence the deck **theory-first** around **harness engineering** as the central organizing theory, into a four-act arc (~34 slides, ~90 min). The Omakase agent team ran the rework on **Opus 4.8** via `workflows/redesign-deck.md` (UNDERSTAND → DESIGN → BUILD → VERIFY → SHIP, binary gates). We extend the existing deck rather than rebuild it — the deck CSS already mirrors the Omakase tokens.

## Why

- **Paradigm before mechanics before keyboard.** You earn the right to teach the harness by first proving the paradigm (Agent = Model + Harness; ~1M lines zero-human-written; engineering roles collapsing into one builder where taste is the bottleneck). Theory → concepts → practice mirrors how this repo was built: `build-webinar.md` PHASE 0 is read-only *understand* before any code.
- **Recognition, not first-contact.** Concepts (dynamic workflows, agent teams, remote control, the markdown/Obsidian memory base) are taught abstractly in Act II so that in Act III the audience recognizes the *real* `.claude/agents/` and `knowledge-base/` as instances of ideas they already hold.
- **The meta-reveal lands harder at the end.** Saving "this deck and repo were built by the exact method just taught" for the close converts a slide-2 claim into an earned realization.

## The four-act arc

| Act | Name | What it does |
|---|---|---|
| I | THEORY | Harness engineering as the discipline; the AI-native org thesis as the stakes (roles collapse, taste is scarce). Motif **planted**. |
| II | CONCEPTS | The mechanics, each as a worked mental model *before* touching Omakase: dynamic workflows, agent teams, remote control, the markdown/Obsidian memory base, then the synthesis. |
| III | PRACTICE | Build Omakase with the real harness — the named agent team running `workflows/new-feature.md` over the memory base, verified by Playwright. Every prompt **verbatim** from a named repo file. Motif **paid off**. |
| IV | CLOSE | The meta-reveal (`build-webinar.md`), the public quality bar = Omakase's own artifacts, motif **reprised**, CTA: clone + run `workflows/new-feature.md`. |

## Honesty rules locked into the rework

- Omakase `workflows/*.md` are **gated process specs**; `agent()`/`parallel()` is the Claude dynamic-workflow **JS feature**. Teach both, label each, never conflate.
- **Remote control** is a Claude Code capability, not a repo artifact — one concept slide + one mention, not a live demo.
- **Agent teams** are experimental + token-heavy — state the caveat.
- The public quality bar is **Omakase's own artifacts**. No private design reference is referenced or rendered in the deck.
- Every PRACTICE prompt/command is verbatim from a real repo file, and its prompt-card names the source file.

## Consequences

- `workflows/build-webinar.md` (the meta-artifact) updated: slide count ~34, plus a note that the deck was re-sequenced theory-first — so the artifact stays consistent with itself.
- `.claude/agents/ui-ux-designer.md` and `.claude/agents/qa.md` broadened so their scope also covers `deck/` (deck design, and its render + prompt-fidelity verification).
- VERIFY now includes a **prompt-fidelity** gate: every practice prompt must grep-match its named source file verbatim.

## Alternatives considered

- **Keep practice-first.** Rejected: leading with keystrokes invites the "not another tool" reflex; the paradigm has to come first or the mechanics read as hobbyist tooling.
- **Rebuild the deck in React/Tailwind.** Rejected: the deck CSS already mirrors the Omakase tokens, and reveal.js gives speaker notes, fragments, and PDF export for free. A bespoke rebuild discards working equity for no live-data need — the demos happen in the real terminal/app, which is more compelling than embedded fakes.

## Link

Process: `workflows/redesign-deck.md`.
