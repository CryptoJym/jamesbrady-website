# Wave 1 evidence

Everything in this folder is produced by a script, not by hand. To regenerate:

```bash
npm install
npx playwright install chromium      # verify:visual only
npm run build
npx next start -p 4123 &
npm run verify:seo    -- --base http://localhost:4123
npm run verify:visual -- --base http://localhost:4123
```

`verify:seo` exits non-zero on any failure. `verify:visual` writes the
screenshots below and exits non-zero if any behavioural check fails.

## What each screenshot shows

| File | What it proves |
|---|---|
| `home-1440-hero.png` | The home hero as a visitor first meets it. Compare against the locked comp: console rail, nav + ASK pill, hero rhythm, readout panel with computed values, provenance nameplate, manifold field. |
| `home-1440-full.png` | Full home page: proof bank, filtered work grid, theory rows, footer with the entity clause. |
| `home-375-hero.png` / `home-375-full.png` | 375px. Nav wraps to a scrollable third row, hero stacks, touch targets ≥44px, zero horizontal overflow. |
| `home-1440-reduced-motion.png` | `prefers-reduced-motion: reduce`. The canvas stands down and the static SVG manifold is what renders. |
| `home-1440-no-js.png` | JavaScript disabled. The static SVG manifold and all prose are in the server response. |
| `work-1440.png`, `work-plimsoll-1440.png` | The work index and a case-study template with its proof aside. |
| `theories-1440.png`, `theory-latent-emotions-1440.png` | The theory index and a theory page: question-shaped H1, answer capsule, maturity + paused flags, full static text, state/history/proof panels. |
| `about-1440.png` | The reliability answer as real question-and-answer blocks, and the visibly-styled pending-from-James gaps. |
| `contact-1440.png` | The lead form on the existing gateway flow. |
| `now-1440.png` | `/now` with its computed age indicator. |
| `lab-1440.png`, `learn-1440.png` | The lab and the learn hub with dated archive badges. |
| `primer-legacy-1440.png` | `/primer` still renders on its original skin at its original URL. |

## Known gaps, stated rather than hidden

- The photo box in the footer and on `/about` is a labelled placeholder. A real
  photograph is a build gate that has not been met.
- The Ask dock has no chat backend this wave. Its expanded state says so and
  offers email.
- The five archived routes carry real, unfixed defects (an inline Person literal
  in their JSON-LD, bare-host URLs, no per-page `og:url`). They were out of
  scope. `npm run verify:seo -- --strict-legacy` fails on them; the default run
  prints them in a DEFERRED block.
