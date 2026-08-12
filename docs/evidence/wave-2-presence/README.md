# Wave 2 — presence tuning: evidence

Owner, looking at the LIVE site on 2026-08-12:

> the background field should be **"more visible and noticeable but still not
> overwhelming"**

> the four-box mark's movement is too subtle to perceive — **"would you have
> that move and be alive"** was not satisfied by the current breathing

Everything below is measured. `before` = a build of `main` (`34c4a5b`) served on
:4124; `after` = this branch on :4123. One instrument,
`scripts/verify-chrome.mjs`, produced both — it takes `--baseline` so the two
sides are comparable.

---

## The numbers

| Measure | before (`main`) | after (this branch) | gate |
|---|---|---|---|
| Field peak luminance | 0.249 | **0.346** | ≥ 0.30, ≤ 0.45, < h1 |
| Field **median** luminance | 0.107 | **0.202** | — (the one that answers the ask) |
| Field minimum luminance | 0.078 | **0.128** | — |
| h1 peak luminance | 0.869 | 0.869 | — |
| Frame rate, 1440, every layer on | 56.1 fps | **56.9 fps** | ≥ 55 GPU / ≥ 30 software |
| Frame rate, 375, every layer on | 67.0 fps | **69.8 fps** | ≥ 55 GPU / ≥ 30 software |
| Reduced motion: animations running | 0 | **0** | 0 |
| Horizontal overflow, 1440 / 375 | 0 / 0 | **0 / 0** | 0 |
| Legacy routes vs `main`, pixels differing | — | **0** across 5 routes | 0 |

Gate tallies on the final build: `verify-tokens` 5/5 · `verify-fixtures` 19/19 ·
`verify-visual` 16/16 · `verify-chrome` 22/22 · typecheck and build clean.
`verify-seo` 16/17 and `verify-ask --offline` 24/25 — both carry the same single
failure, `.seo-denylist.txt is absent`, which is the fail-closed client-name
gate whose list CI materialises from the `CLIENT_DENYLIST` secret. It fails
identically on `main`; it is **not proven locally** either way.

### The measurement defect this pass had to fix first

**The field's brightness is not steady, and every previous number in this repo
was read through a window too short to see that.** The manifold surface's
slowest term evolves over about 70 seconds, so the number of lines standing
high — and the whole field's brightness with it — cycles on a minute scale.

Sampled every ~230ms for 43s on one unchanged build, then sliding the old 2.4s
window across that series:

| window | reported peak, same build, same viewport |
|---|---|
| 2.4s (what the gate used) | 0.119 … 0.313 |
| 6s | 0.167 … 0.313 |
| 12s | 0.202 … 0.313 |
| 30s | 0.253 … 0.313 |

The instrument was reporting which minute it happened to be, not what the field
does. That is a **safety** hole and not just a noisy number: a 2.4s window
samples about 3% of the cycle, so a build that breached the 0.45 ceiling at some
other phase would have passed the ceiling gate on luck. `verify-chrome` now
samples 150 captures over ~35s, and reports the median and the minimum next to
the peak, because they answer different questions:

- the **peak** is one pixel at the field's brightest instant — it is what the
  0.45 ceiling and the "dimmer than the h1" rule are about;
- the **median** is what a visitor actually sees, and it is the number that had
  to move for the owner's ask to be met. It nearly doubled: 0.107 → 0.202.

For scale: the static SVG that reduced-motion visitors see measures 0.363, so
the live field has moved from **half** its own baseline to just under it.

---

## What changed

### The field (`components/site/Manifold.tsx`)

Presence was bought from structure and motion, never from a brighter wash. Two
of the six levers raise the field's **quiet** phases and pay nothing at its
peak, which is why the minimum moved 64% while the peak moved 39%:

| Lever | before | after |
|---|---|---|
| Height-ramp floor (pays out only when the surface is low) | .55 | **.72** |
| Travelling-window floor (crest unchanged at 1.30) | .72 | **.80** |
| Family alphas, rulings / cross-sections | .45 / .30 | **.66 / .50** |
| Crest glow | one 5px pass at .14, from k > .78 | **two passes, 7px at .28 + 14px at .11, from k > .70** |
| Particles | 44, r 1.1–2.2 | **70, r 1.35–2.7, each twinkling on its own seeded clock** |
| Travelling-window speed | .085 / −.062 | **.128 / −.093** (1.5×) |
| Far layer alpha | .40 | **.52** |

The twinkle multiplier tops out at exactly 1.0, so the crests get busier without
the brightest pixel moving. The travelling window now crosses about a quarter of
the mesh in the first two seconds — at the old speed a visitor had to watch for
roughly twelve seconds to see a crest arrive.

**The static SVG was deliberately not regenerated.** It already measures 0.363,
inside the target band and ahead of where the canvas landed, so reduced-motion
visitors have had the stronger field all along. `lib/manifold/curves.ts` is a
locked audited artifact and is untouched.

### The mark (`app/globals.css`)

Three clocks, so it never reads as one blinking thing:

| Layer | before | after |
|---|---|---|
| Breath | ≤0.75px translate, ≤6% scale | **≤2px translate, 5–6% scale**, same three periods |
| Tick | 1px snap every 20s | **2px snap**, plus a brief `--sig` glint on that cell |
| Cycle | — | **new**: one cell holds full brightness, handing off every 2.7s on an 8.1s rotation, in reading order |

The cycle is the one that reads as *alive* rather than as decoration wobbling:
three cells trading a highlight is work moving through a system. It is `opacity`;
the breath and tick are `transform`. Nothing touches a layout property, and the
glyph's box is asserted byte-identical across a full breath.

**On ruling (B) and the glint.** Ruling B demotes decoration from `--sig`, and
the mark is decoration. The glint is read as `--sig`'s *first* documented role,
not a new one: `--sig` means "live, measured, computed", and the tick has always
been the mark reporting that this site counts things — the glint is what makes
that report legible. It is ~800ms once every 20 seconds on one cell, and the
owner asked for it by name in this pass. It remains the only `--sig` in the mark
outside hover. Flagged here rather than resolved silently.

---

## The captures

| File | What it shows |
|---|---|
| `home-1440-hero-before.png` / `-after.png` | The hero as a visitor meets it. |
| `field-1440-before-t0.png` / `-t1.png` | `main`'s field, two captures 1s apart. |
| `field-1440-after-t0.png` / `-t1.png` | This branch's field, two captures 1s apart — **the motion proof**. Hero copy and readout panel are `visibility:hidden` so the field is unobstructed; layout is untouched, so what you see is composited exactly as it ships, mask and scrim included. |
| `home-1440-reduced-motion-before.png` / `-after.png` | `prefers-reduced-motion: reduce` — the static SVG, canvas stood down, mark frozen. |
| `home-375-hero-before.png` / `-after.png` | Mobile. Below 1180 the field moves to the open band under the copy (wave-1 responsive rule, unchanged). |
| `mark-cycle-1440-after-t0.png` / `-t4.png` | The mark 4s apart, at the shipped 1× size — a different cell is brightest in each. |
| `mark-zoom-cycle-a/b/c-after.png` | The same hand-off at 4×, one frame per cell, because a .58→1.0 brightness change inside a 15px glyph does not survive a 1× screenshot. |
| `mark-zoom-glint-after.png` | The tick's glint, **caught lit** at opacity 0.77 by polling the pseudo-element rather than inferred from the stylesheet. |
| `mark-hover-1440-after.png` | The mark mid-converge on hover, cells on the signal colour. |

The previous packet said "the mark's own motion is not screenshottable" and fell
back to assertions. The 4× captures close that gap; the assertions remain as the
gate.

## Reproducing

```bash
npm ci && npm run build
npx next start -p 4123 &
npm run verify:tokens
npm run verify:fixtures
npm run verify:ask                                    # --offline
node scripts/verify-seo.mjs    --base http://localhost:4123
node scripts/verify-visual.mjs --base http://localhost:4123 --legacy-base <main build>
node scripts/verify-chrome.mjs --base http://localhost:4123 \
     --label after --update-evidence --evidence-dir wave-2-presence
```

For the `before` column, serve a build of `main` and add `--baseline --label
before`. `--evidence-dir` is new: it defaults to `wave-2-chrome`, so existing
invocations are unchanged and a later wave writes its own packet instead of
overwriting an earlier wave's record.

`--update-evidence` rewrites the PNGs in this directory. It is opt-in: evidence
should change when someone decides to refresh it, not as a side effect of
verifying.
