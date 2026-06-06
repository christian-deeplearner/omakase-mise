# Knowledge Base — Cold-Tier Map

> This is the **cold** map of Omakase's memory base. It is *not* auto-loaded. `CLAUDE.md` @-imports only the **hot** leaves (active voice, active standards); everything else lives here and is read on request.
>
> The split is the discipline: most operators carry too much hot context. Audit what's actually load-bearing for the current task, keep that hot, move the rest cold.

## How this memory base works

- **Hot** (auto-loaded via `CLAUDE.md` @-imports): `voice/brand-voice.md`, `standards/pdp-quality-gate.md`, `standards/review-links-standard.md`. These shape almost every task, so they're always in context.
- **Cold** (read on demand, listed below): the canonical brand doc, customer notes, decision history, learnings, the rest of the map. An agent pulls these when the task calls for them.
- **It compounds.** Agents append to `decisions/` and `learnings/` as they work. The repo gets smarter every session. That is the point of a memory base over a chat history: it is a folder you own, any model can read it, and Git versions it.

## Map

### brand/ — the single source of truth for the brand
| File | What it is | Tier |
|---|---|---|
| `brand/omakase-brand.md` | The Omakase brand bible — Sand+Clay tokens, fonts, the six collections, voice, naming | cold (canonical) |

### voice/ — how Omakase talks
| File | What it is | Tier |
|---|---|---|
| `voice/brand-voice.md` | Tone, do/don't, banned phrases, worked examples | **hot** |

### customer/ — who we build for
| File | What it is | Tier |
|---|---|---|
| `customer/icp.md` | The seeded ideal customer (Akiko) | cold |
| `customer/customer-notes.md` | Running behavioral notebook (compounds) | cold |

### standards/ — the gates work must pass
| File | What it is | Tier |
|---|---|---|
| `standards/pdp-quality-gate.md` | The ≥80 PDP score gate (generate → gate → review) | **hot** |
| `standards/review-links-standard.md` | "Done" requires a clickable review link | **hot** |
| `standards/2026-06-06-omakase-image-standard.md` | The ≥80 image gate + veto (no text/logo/sci-fi; Sand+Clay palette) — run by `art-director` | cold |

### decisions/ — why we chose what we chose (append-only log)
| File | What it is |
|---|---|
| `decisions/2026-06-03-aurora-scaffold-initialized.md` | Baseline architecture + locked choices |
| `decisions/2026-06-05-deck-reworked-theory-first.md` | The theory-first deck re-sequence |
| `decisions/2026-06-06-rebrand-to-omakase.md` | The Aurora → Omakase rebrand (Sand+Clay) |

### learnings/ — what we've learned, dated and atomic
| File | What it is |
|---|---|
| `learnings/2026-06-03-fake-data-seam-keeps-the-demo-honest.md` | Why all data flows through one seam |

## Conventions for this base

- **Naming:** `decisions/` and `learnings/` files are `YYYY-MM-DD-kebab-title.md`. Standards, voice, and brand are stable names (no date).
- **Atomic:** one decision per decision file, one learning per learning file.
- **Cross-link:** every file links to the decisions/standards it depends on. The links are how an agent navigates the cold tier.
- **Promote when it hardens:** a repeated note in `customer-notes.md` that becomes a rule graduates to `standards/`.

## Where the rest of the operating doc lives

This is the memory base. The *operating* layer sits beside it:
- `../CLAUDE.md` — the company operating doc (spine + hot @-imports).
- `../.claude/agents/` — the named staff (JDs).
- `../.claude/skills/` — the three standing weekly skills.
- `../.claude/commands/` — `/ship`, `/review`, `/verify`.
- `../workflows/` — sequence+gate workflows, including the meta `build-webinar.md`.
- `../docs/creative/` — the image pipeline methodology (`PIPELINE.md`, `PROMPT-ENGINEERING.md`, `AGENT-ARCHITECTURE.md`); run by the `art-director` agent via `pnpm generate:images`.
