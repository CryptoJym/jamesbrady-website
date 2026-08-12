# Wave 4 — the legacy pages onto the design system

Branch `rebuild/wave-4-legacy-reskin`. Captured 2026-08-12 against a production
build (`npm run build` then `next start`), Chromium via Playwright.

`/primer`, `/manuscript`, `/workshop` and `/watch` were the last four routes
still rendering on the old gold-and-black skin. An independent review called
them "stylistically a different site". They now render on Direction B **at the
same URLs**, with a dated archive band, and every gate that used to defer them
now runs against them.

## The screenshots

Sixteen full-page captures, `<route>-<width>-<before|after>.png`, at 1440 and
375. Animations are frozen after a 1.4s settle, so a re-run of the same build
produces the same bytes and a diff means a real change.

`before` is the build of `main` at `c5038c9`. `after` is this branch.

| Route | 1440 | 375 |
|---|---|---|
| `/primer` | `primer-1440-{before,after}.png` | `primer-375-{before,after}.png` |
| `/manuscript` | `manuscript-1440-{before,after}.png` | `manuscript-375-{before,after}.png` |
| `/workshop` | `workshop-1440-{before,after}.png` | `workshop-375-{before,after}.png` |
| `/watch` | `watch-1440-{before,after}.png` | `watch-375-{before,after}.png` |

Horizontal overflow was measured at capture time on all sixteen: **0px on every
route at both widths**, before and after.

## Gate results on this branch

| Gate | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 problems, down from 30 errors + 15 warnings on `main` |
| `npm run build` | PASS — 41 static pages |
| `npm run verify:tokens` | 5/5 PASS, and the scope is now the **whole repo** |
| `npm run verify:fixtures` | 19/19 PASS |
| `npm run verify:seo` | 17/18 PASS, **1 UNPROVEN** (see below) |
| `npm run verify:visual` | all PASS, including the new dated-archive gate |
| `npm run verify:chrome` | 22/22 PASS |
| `npm run verify:ask` (offline) | 24/25, **1 fail-closed** (see below) |

### The one gate that is not green, and why

`verify-seo` check 10 and its twin in `verify-ask` are the client-name denylist.
Both fail closed when `.seo-denylist.txt` is absent, which it is on any machine
without the `CLIENT_DENYLIST` secret. **This is identical on `main`** — verified
by stashing this branch and re-running. It is not a regression and it is not
fixed here; CI materializes the file from the secret before the gate runs.

Nothing else is deferred. `verify-seo` now prints, on every run:

```
No deferred routes. Every check above ran against all 30 routes.
```

### Register scan: the deferral list is empty

`LEGACY_ROUTES` in `scripts/verify-seo.mjs` is now `[]`. Check 11 reports
`82 source files + 30 routes, no route deferred`. Everything the archived
volumes were exempted from — JSON-LD `@graph`, the shared Person node, `og:url`,
host discipline, the heading outline, the register rule — is now enforced on
them.

### The pixel-parity gate is retired, on purpose

`verify-visual` used to build `main` in a second worktree and require **zero**
differing pixels on these four routes. That gate earned its keep: it caught a
`colors.base` cross-scale collision that repainted a heading band on
`/manuscript`, which no amount of reading found.

It is retired because these four routes are now **intended** to differ from
`main` in every pixel, so a zero-difference assertion would fail by design — and
a gate that has to be suppressed to pass is a gate that gets deleted for the
wrong reason later. The reasoning is written into the head of the script.

It is replaced, not dropped. The new check asserts, per route: no horizontal
overflow, exactly one `h1`, no skipped heading level, the archive band present
with a **real date** matching `Archived YYYY-MM-DD`, the Direction B chrome
actually mounted (rail, nav mark, footer, dock, `.b-room`), and **no computed
style anywhere on the page still painting the retired palette**. It passed on
all four:

```
PASS  Dated archives on the design system (4 routes: no overflow, one h1,
      no level skip, dated band, chrome mounted)
      /primer:archived=2026-08-11 · /manuscript:archived=2026-08-11
      /workshop:archived=2026-08-11 · /watch:archived=2026-08-11
PASS  No horizontal overflow at 375 on the dated archives (4 routes)
```

No other gate was weakened.

## URLs are unchanged

The brief keeps these volumes at their own URLs as dated archives, so the thing
most worth proving is that nothing moved.

- `STATIC_ROUTES` membership: **byte-identical** to `main` (diffed).
- Every `path:` literal in `lib/seo/routes.ts`: **byte-identical** to `main`.
- `app/sitemap.ts`, `app/llms.txt/route.ts`, `ai-manifest`, `feed.xml` and
  `robots.ts`: **untouched**.
- Live sitemap: 30 `<loc>` entries, and `verify-seo` check 1 asserts
  `sitemap === STATIC_ROUTES` while check 6 asserts
  `llms.txt === ai-manifest === indexable routes`. All pass.
- No redirects were added. There are none in the repo.

In-page anchors were preserved too: `#code #stack #agents #skills #mcp` on
`/primer`, `#agent-setup #install-skills #connect-mcp` on `/workshop`, and the
category ids on `/manuscript`.

## Assets that were renamed or removed

Three asset paths carried the retired register in their **file names**, and a
file path inside a `src` attribute is rendered HTML, which is what the register
scan reads. Renaming them was part of the copy fix, not a tidy-up. The
recordings are byte-identical.

The three video posters were photographic plates of robed figures, glowing
sacred geometry and gold-lit tableaux — the largest thing on `/watch`, and the
exact costume `SITE-BRIEF.md` retires ("the site proves competence; it never
performs mystique"). They are replaced by generated plates
(`npm run posters` → `scripts/make-posters.mjs`), built with the same encoder,
the same 5x7 face and the same tokens as the OG plates. Each plate names the
recording it fronts, which the photographs did not. The eight unreferenced
photo JPEGs (4.6 MB) were removed with them.

**This is the one change a reviewer should look at first**, because it removes
visible assets rather than reskinning them. `watch-1440-before.png` beside
`watch-1440-after.png` is the comparison.
