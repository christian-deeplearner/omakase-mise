# deck/public — fallback demo assets

This folder holds the **fallback demo media** recorded at the June 6 dress
rehearsal. The deck runs four LIVE DEMOS in a real terminal beside the slides.
If any demo stalls for more than **60 seconds**, switch to the matching asset
here and narrate over it — the deck never simulates a fake terminal, but the
clock always wins.

One asset per live demo. Record each from the *known-good* rehearsal branch so
the fallback shows the exact result the on-slide prompt produces.

| Slide | Demo | Fallback file | What it must show |
|---|---|---|---|
| S14 | Live Demo 1a — environment | `demo-1a-environment.gif` | `nvm use`, `ssh -T git@github.com` success, `claude` launching |
| S20 | Live Demo 1b — scaffold + run | `demo-1b-scaffold-run.gif` | `pnpm dev` → Omakase storefront on `:3000` + `/overview` on fake data |
| S27 | Live Demo 2a — build feature | `demo-2a-build-feature.gif` | branch created, agent builds the PDP redesign, the **diff** shown |
| S30 | Live Demo 2b — test + mobile + PR | `demo-2b-test-mobile-pr.gif` | `pnpm test:e2e` **green**, 375px mobile pass, `gh pr create` |
| S32 | Live Demo 2c — deploy → link | `demo-2c-deploy-link.gif` | confirm-hook fires, `vercel --prod`, the clickable review URL |

## Recording notes

- **Format:** GIF (autoplaying, no controls needed) or short muted MP4 if a GIF
  gets too large. Keep each under ~8 MB so the deck stays snappy offline.
- **Source:** record against the pre-built `feat/omakase-pdp-editorial` branch so
  the result is deterministic and matches the slide prompt exactly (Gate 5:
  every on-slide prompt produces the on-slide result in a real run).
- **Crop:** terminal + relevant browser pane only; warm paper background where
  possible so the fallback reads as part of the Omakase deck, not a raw capture.
- The deck references these by **relative path** (`deck/public/<file>`), shown in
  small print on each demo slide as `⎌ fallback:` so the presenter knows the
  exact file to open without leaving speaker view.

> Insurance, not the plan. If the live run is healthy, these never get opened.
