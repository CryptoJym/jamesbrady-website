# Wave 2 — living chrome: evidence

Owner ask, 2026-08-11: **"improve the background so it has stronger
visualization"**, the mark next to JAMES BRADY should **"move and be alive"**,
and **"create a favicon for the website"**.

Everything below is measured, not asserted. `before` = a build of `main`
(`dc24ce7`) served on :4124; `after` = this branch on :4123. The same
instrument, `scripts/verify-chrome.mjs`, produced both — it takes a
`--baseline` flag precisely so the two numbers are comparable.

---

## The numbers

| Measure | before (`main`) | after (this branch) | gate |
|---|---|---|---|
| Frame rate, 1440, every layer on | 60.9 fps | **61.5 fps** | ≥ 55 |
| Frame rate, 375, every layer on | 72.3 fps | **69.9 fps** | ≥ 55 |
| Field peak luminance (composited, 12 frames) | 0.085 | **0.172** | < h1, ≤ 0.45 |
| h1 peak luminance | 0.869 | 0.869 | — |
| Reduced motion: animations running | 0 | **0** | 0 |
| Horizontal overflow, 1440 / 375 | 0 / 0 | **0 / 0** | 0 |
| Legacy routes vs `main`, pixels differing | — | **0** across 5 routes | 0 |

Gate tallies on the final build: `verify-tokens` 5/5 · `verify-fixtures` 19/19
· `verify-seo` 15/16 + 1 UNPROVEN (the denylist secret, known and unchanged) ·
`verify-visual` 16/16 · `verify-chrome` 18/18 · typecheck and build clean.

### On the luminance number

The field got **brighter on purpose, and the reason is a defect this wave
found rather than a taste call.** Sampled with one instrument at one viewport:

| Tier | peak luminance |
|---|---|
| Tier 1, the static SVG (no-JS and reduced-motion baseline) | **0.369** |
| Tier 2, the canvas, on `main` | **0.085** |
| Tier 2, the canvas, on this branch | **0.172** |

Tier 2 was not a live version of tier 1, it was a fainter one — the field
*dimmed* the moment it came alive, because the canvas stroked a flat 1px where
the SVG scales 1.55 viewBox units, and never drew the bloom wash at all. Tier 2
now carries both. It still sits below tier 1, well below the 0.45 ceiling and
5× below the h1, so decoration still loses to content by a wide margin.

Two notes on method, so the number can be checked rather than believed:

1. **Peak across frames, not one frame.** A window of brightness travels
   through the mesh, so a single capture measures whatever the wave happened to
   be doing — two runs of an earlier one-frame version read 0.095 and 0.084 off
   the same build. The reported figure is the peak of 12 captures over ~2.4s.
2. **The task brief quoted a 0.27 baseline for the field.** Measured here with
   WCAG relative luminance — the same formula that reproduces the brief's h1
   figure exactly (0.869 vs 0.87) — `main`'s canvas reads 0.085 and `main`'s
   SVG reads 0.369. 0.27 sits between the two tiers; whichever it referred to,
   both are under the 0.45 ceiling before and after.

### On the frame-rate numbers

The first three runs of the 375 sample read 47.2, 50.0 and 57.0 fps against a
55 floor, and all three were the instrument rather than the field: the 1440
page was still open and animating on the same renderer. `verify-chrome` now
tears the browser down between viewports. Measured on this branch: 50.0 fps
with the desktop tab open, 57.0 with the context closed, 69.9–72.0 in a browser
of its own. Suspending the field entirely reads 72.2 — so the whole field,
every layer on, costs about **1.4 fps**.

---

## The captures

| File | What it shows |
|---|---|
| `home-1440-hero-before.png` / `-after.png` | The hero as a visitor meets it. |
| `field-1440-before-t0.png` / `-t1.png` | `main`'s field, two captures 1s apart. |
| `field-1440-after-t0.png` / `-t1.png` | This branch's field, two captures 1s apart — **the motion proof**. The hero copy and readout panel are set to `visibility:hidden` so the field is unobstructed; layout is untouched, so what you see is composited exactly as it ships, mask and scrim included. |
| `home-1440-reduced-motion-after.png` | `prefers-reduced-motion: reduce` — the static SVG, canvas stood down, mark frozen. |
| `home-375-hero-before.png` / `-after.png` | Mobile. Below 1180 the field moves to the open band under the copy (wave-1 responsive rule, unchanged). |
| `mark-hover-1440-after.png` | The mark mid-converge on hover, cells on the signal colour. |

The mark's own motion is not screenshottable — a 6.2–8.5s breath and a 1px tick
every 20s do not survive a still frame. It is proved by assertion instead:
three cells carrying three different `animation-name`s, one `<b>` carrying
`mark-tick`, the glyph's bounding box byte-identical across a full breath
cycle, and every one of them reading `animation: none` under reduced motion.

## Reproducing

```bash
npm ci && npm run build
npx next start -p 4123 &
npm run verify:tokens
npm run verify:fixtures
node scripts/verify-seo.mjs    --base http://localhost:4123
node scripts/verify-visual.mjs --base http://localhost:4123 --legacy-base <main build>
node scripts/verify-chrome.mjs --base http://localhost:4123
```

`--update-evidence` rewrites the PNGs in this directory. It is opt-in: evidence
should change when someone decides to refresh it, not as a side effect of
verifying.
