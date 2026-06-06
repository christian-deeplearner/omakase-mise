# Starter prompt — build Omakase from scratch, live

Paste this into a **fresh Claude Code session in an empty folder**. It builds the
whole project the way this repo was actually built: a memory base first, a named
agent team, plan-before-code, a real verification gate, and learnings written back.

Enable the team first:

```bash
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```

Then paste:

---

Build **Omakase** from scratch — a fictional high-end Japanese luxury label ("Leave it to us." — お任せ, the chef's selection): curated, considered essentials. One Next.js app with two surfaces — a customer **storefront** and an operator **command center** — over one deterministic **fake-data seam**. No real data anywhere. Work like a real AI-native team, and **plan before you build**.

The register is calm, spare, certain — anti-hype. State; don't sell. Lead with the material and the restraint; let whitespace carry weight. **No somatic / wellness-practice language anywhere in customer copy** — that's a hard rule.

**1 · Memory base first.** Write `CLAUDE.md` as the company operating doc — five sections: **Who / What / Who-For / How-We-Talk / What-We-Refuse** — plus a `knowledge-base/` with `voice/`, `customer/`, `standards/`, `decisions/`, `learnings/`, and `index.md`. This is the context the whole team reads before acting. Capture the brand: name **Omakase**, tagline **"Leave it to us."** (secondary: "The chef's selection."), positioning "Curated essentials, chosen for you. Considered, calm, and built to last." Voice register examples to bank in `voice/`: "Left as it was found." · "One line, drawn once." · "Nothing extra." · "Leave it to us." — spare, material, Japanese-inflected nouns; no hype, no urgency theater, no emojis, no wellness/somatic claims.

**2 · Stand up the harness.** Create `.claude/agents/` with a named team, one markdown job description each:
- **director** — orchestrates the team, holds the gates, synthesizes. Never writes code.
- **tpm** — turns the goal into ordered tasks with binary acceptance criteria.
- **cto** — architecture, stack standards, the build/type-check gate, final sign-off.
- **fullstack-engineer** — the surfaces, the fake-data seam, API routes. The one who types.
- **ui-ux-designer** — the Sand+Clay design system, layout, responsive, the calm restraint.
- **qa** — Playwright e2e and the verification gate. Proves behavior; never asserts it.

Add `.claude/settings.json` (enable agent teams; a `PreToolUse` guard hook that blocks force-push and flags prod deploys) and `workflows/new-feature.md` — a gated **PLAN → BUILD → VERIFY → SHIP** spec with binary gates.

**3 · Plan first — plan mode.** Propose the full build and wait for my approval before writing any code:
- **Stack:** Next.js 16 (App Router), React 19, **TypeScript strict — no `any`**, Tailwind v4 with **design tokens (never invent a hex value)**, TanStack Query + Table, Recharts (client components only), `jose` for a single mock login, `@faker-js/faker` for seeded deterministic data, **pnpm**.
- **Shape:** one app, two route groups — `app/(store)` (storefront) and `app/(command)` (command center) — plus the seam `src/lib/data-layer/`. **All data flows through the seam**; swapping fake data for a real backend is a one-file change.
- **Conventions:** shared types in `src/lib/types.ts` (one source of truth); `cn()` + formatters in `src/lib/utils.ts`; Server Components by default, `"use client"` only for interactivity/hooks/charts; validate inputs with `zod`; the client never sets a price (resolve it server-side); `data-testid` on interactive elements.
- **Design tokens (Sand + Clay) — define these as the only palette; never invent a hex beyond this list:**
  - `--paper #F3EEE6` warm sand background · `--card #FAF6EF` lighter sand (cards)
  - `--ink #21201C` warm sumi near-black (text) · `--muted #6F695E` warm grey (secondary)
  - `--hairline #E6DFD3` fine rule (Linear/Stripe precision)
  - `--panel #21201C` / `--panel-2 #2C2A24` dark warm sections · `--paper-on-panel #F3EEE6`
  - `--accent #B0744F` clay / terracotta — PRIMARY accent (interactive + emphasis only, never decoration)
  - `--accent-soft #D9CBB8` stone (soft fills, pale) · `--sumi #21201C` the Kuro drop bold
  - `--positive #4E7A52` sage (gate passed) · `--warning #9A6A1E` amber (ask/confirm) · `--critical #A23A2E` rust (LIVE / not done)
  - `--radius 12px` rounded-soft (buttons ~10–999px). Generous spacing (*ma*) — lean on whitespace; soft radius on cards/buttons; fine hairlines for structure.
- **Type (sans-forward, precise + warm):** `--font-sans` **Geist** (display + body + UI, the workhorse), `--font-mono` **Geist Mono** (labels, eyebrows, drops, technical), `--font-serif` **Newsreader** (OPTIONAL warm-luxury accent for the odd hero/tagline line, italic — sparingly). Load via `next/font/google` (`Geist`, `Geist_Mono`, `Newsreader`). Display is large and tight (`-0.02em`) but **sans-led**; mixed-case headings, **never force-uppercase**.

Read me the plan. No code before I approve.

**4 · Build with the team, in parallel.** `director` runs it: `fullstack-engineer` builds the storefront, the command center, and the seam; `ui-ux-designer` builds the Sand+Clay design system — they stay in **disjoint files** (two agents in one file is a conflict; two route groups is a team).
- **Storefront** `app/(store)`: editorial-but-warm — a hero with "Leave it to us." energy (e.g. "Chosen for you. Made to keep."), **the collections as hairline rows** (glyph · name · tagline · →), PDPs, cart, checkout, a calm "POSITION"-style manifesto, and a footer with a "JOIN THE LIST" / drop-notify CTA (fits the drop culture).
- **Command center** `app/(command)`: operator console — Overview KPIs, Orders, Products, Customers, Analytics, Agents. Use "OMAKASE · OPERATOR" labels and keep a "LIVE · FAKE DATA" honesty badge.
- **The collections — exactly these 6** (the tasting menu; `glyph` is a single kanji):
  | slug | name | glyph | tagline | character |
  |---|---|---|---|---|
  | kinari | Kinari | 生 | "Left as it was found." | unbleached naturals |
  | sumi | Sumi | 墨 | "One line, drawn once." | dark essentials |
  | ai | Ai | 藍 | "Dyed deep. Worn long." | indigo-dyed |
  | hinoki | Hinoki | 檜 | "Warm to the hand." | cypress-warm naturals |
  | kuro | Kuro | 黒 | "The drop." | limited black line — numbered, limited (the hypebeast note) |
  | shiro | Shiro | 白 | "Nothing extra." | clean whites |
- **Products:** seed ~40 elevated essentials across the collections (e.g. Kinari Crew, Kinari Pocket Tee, Sumi Overshirt, Sumi Trouser, Ai Wide Trouser, Ai Haori Jacket, Hinoki Knit, Hinoki Cardigan, Kuro Cap (drop), Kuro Bomber (limited), Shiro Tee, Shiro Oxford). Prices realistic for elevated essentials (~8,000–58,000 cents). Kuro items are the limited "drops" — lower inventory, numbered vibe.
- **The detail that makes it real:** a customer checkout on the storefront **creates an order that appears in the command center** — both read the same seam.

**5 · Prove it, don't assert it.** `qa` adds Playwright and writes the **full-loop test**: storefront PDP → add to cart → checkout → assert that exact order shows up in the command center. Gates: `pnpm build` clean, `pnpm lint` 0 errors, `pnpm test:e2e` green — run it twice to catch flake. Nothing is "done" without the test green and a clickable review link.

**6 · Ship + write it back.** Deploy, give me the live review link, and append what we decided and what we learned to `knowledge-base/decisions/` and `knowledge-base/learnings/` — so the base compounds and the next iteration starts smarter.

Start with step 1. Plan before you build.

---

*That last move — writing decisions and learnings back — is the self-improving harness. Every lap, the team gets sharper.*
