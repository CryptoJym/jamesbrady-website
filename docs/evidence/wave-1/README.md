# Wave 1 evidence

Everything in this folder is produced by a script, not by hand.

**These PNGs are REGENERATED, not accumulated.** `verify:visual --update-evidence`
rewrites every screenshot below. Two runs of the same commit produce
byte-different files — a review lane watched 16 PNGs move by 8 bytes each and
had to work out whether that was drift or tampering. It is neither; it is PNG
encoding. Without `--update-evidence` the script writes to the untracked
`out/verify-visual/` instead, so a plain verification run leaves the committed
evidence alone.

To regenerate:

```bash
npm install
npx playwright install chromium          # verify:visual only
npm run build
npx next start -p 4123 &

npm run verify:fixtures                  # red-teams the gates, needs no server
npm run verify:seo    -- --base http://localhost:4123
npm run verify:visual -- --base http://localhost:4123 --update-evidence

# Legacy parity needs a second server running a build of `main`:
git worktree add ../main-baseline origin/main
(cd ../main-baseline && npm ci && npm run build && npx next start -p 4124 &)
npm run verify:visual -- --base http://localhost:4123 \
                         --legacy-base http://localhost:4124 --update-evidence
```

`verify:seo` exits non-zero on any failure, and on any UNPROVEN check when
`CI=true`. `verify:visual` exits non-zero if any behavioural or parity check
fails. `verify:fixtures` exits non-zero if a hostile fixture stops being
caught.

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
| `primer-legacy-1440.png` | `/primer` on this branch, on its original skin at its original URL. |
| `primer-main-1440.png` | The same route built from `main`. The two are pixel-diffed by `verify:visual --legacy-base`; the gate requires **zero** differing pixels, across all five archived routes. |

## Known gaps, stated rather than hidden

- The photo box in the footer and on `/about` is a labelled placeholder. A real
  photograph is a build gate that has not been met.
- The Ask dock has no chat backend this wave. Its expanded state says so and
  offers email.
- The five archived routes carry real, unfixed defects (an inline Person literal
  in their JSON-LD, no `@graph` at all, bare-host URLs, no per-page `og:url`,
  and the retired brand token as visible link labels on `/links`). They were out
  of scope. `npm run verify:seo -- --strict-legacy` fails on them; the default
  run prints them in a DEFERRED block.
- The client-name denylist reads **UNPROVEN**, not PASS. It has zero terms until
  the `CLIENT_DENYLIST` secret exists. `CI=true` turns UNPROVEN into a nonzero
  exit, and `.github/workflows/verify.yml` fails red when the secret is absent.
- Proof-link liveness (geo-seo-spec §8.9) is still not implemented and is not
  claimed as passing.

## Independent review

`independent-review-findings.md` in this folder is the full finding list from
the independent review lane (2026-08-11) and the security sweep addendum, with
what each fix was and which gate now holds it.
