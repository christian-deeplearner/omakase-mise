# Omakase Workshop Deck — "How to Become a 100x Engineer"

A reveal.js deck (~39 slides) for the 90-minute live workshop. It is the
**script + prompt library** for the session — the actual building happens in a
real terminal beside it. The deck ships inside the same `omakase-mise` repo
it teaches you to build (that recursion is the point).

No build step. No `npm install`. reveal.js 5.x and all plugins load from a CDN,
and the fonts load from Google Fonts. Open the file or serve the folder.

## Present it

**Option A — just open it**

```bash
open deck/index.html        # macOS
# or double-click deck/index.html
```

**Option B — serve it (recommended; needed for hash URLs + speaker sync)**

```bash
npx serve deck
# → http://localhost:3000  (open index.html)
```

> Online is best (CDN + Google Fonts + the live GitHub repo-metric on the title
> slide). Offline, the deck still renders fully — the live metric just no-ops
> and system fonts stand in.

## Navigation & presenting

| Action | How |
|---|---|
| Next / previous | `→` / `←` (or `Space`) |
| **Speaker view** (notes + timer + next slide) | press **`S`** |
| Slide overview / jump | press **`Esc`** or `O` |
| Fullscreen | press **`F`** |
| Deep-link a slide | the URL hash updates per slide (`hash:true`) — copy/paste to jump |
| Slide number | shown bottom-right (`slideNumber:true`) |

The **copy-paste prompts** live in `<pre><code>` blocks: bash (dark, terminal)
and `language-text` (paper card) for prompts you type into Claude Code. They are
the **exact** text rehearsed against the real scaffold — copy straight off the
slide in speaker view.

## Export to PDF

reveal.js prints to PDF via a query flag and your browser's print dialog:

```
http://localhost:3000/?print-pdf
```

Then **Print → Save as PDF**, Landscape, margins **None**, and enable
**Background graphics** (so the paper/panel colors render).

## Live demos & fallbacks

Four slides are marked **● LIVE DEMO** (1a env, 1b scaffold+run, 2a build,
2b test+mobile+PR, 2c deploy). Each shows a `⎌ fallback:` filename pointing at
`deck/public/`. If a live run stalls past ~60s, open the matching GIF and
narrate over it. See `deck/public/README.md` for the asset list and recording
notes.

## How it's themed

`index.html` is self-contained. Its `<style>` block mirrors the Omakase design
tokens from `src/app/globals.css` exactly — paper `#F3EEE6`, card `#FAF6EF`,
ink `#21201C`, hairline `#E6DFD3`, accent clay `#B0744F` — with Geist for the
sans display and body and Geist Mono for labels and code. No hex colors are
invented.

## The throughline

Every segment carries one idea: **the model is not the moat — your context is.**
The deck names the *memory base* in the Landscape segment, builds it live in the
Mission Deep-Dive (the repo's `CLAUDE.md` + `knowledge-base/`), and reprises it
in the Future segment. The recurring dark **motif slide** states the line twice.
Concept tags on each slide map to the seven load-bearing ideas: context-is-the-
moat, memory base, harness engineering, the Context→Plan→Build→Ship flywheel,
agents-as-named-staff, the legible closed-loop OS, and verify-before-commit.
