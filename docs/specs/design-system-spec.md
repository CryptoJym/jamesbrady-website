# Design system spec — jamesbrady.org rebuild (Direction B "Operating Room")

Status: DRAFT for Phase 4 build. Authorities in order: (1) the locked comp
`direction-b-operating-room.html` — its `:root`, component patterns and inline lint
comments; (2) `docs/design/direction-b-v2-punchlist.md` (PROTECT list + rulings);
(3) `SITE-BRIEF.md` (page map, register rules, WCAG 2.2 AA, manifold gates). Where they
disagree, §8 names the conflict — do not resolve a §8 item by picking the easier read.

Stack today: Next 16.2.10 App Router, React 19, Tailwind **3.4.1**, PostCSS.
`app/globals.css` and `tailwind.config.js` carry the OLD gold/black token set; §2
replaces both wholesale.

---

## 1. Token inventory (verbatim from the comp `:root`)

Values copied exactly; "role" is the one job the token has. **(unused)** = declared but
never consumed in the comp — keep only if a v1 template needs it, else drop.

### 1.1 Surface

| Token | Value | Role |
|---|---|---|
| `--c-void` | `#05080A` | Deepest surface, below `--c-base`. **(unused in comp)** |
| `--c-base` | `#0A0E11` | Page background; the contrast reference every text token is measured against. |
| `--c-panel` | `#0D1317` | Card / panel / ghost-button fill. |
| `--c-raised` | `#11191D` | Hover fill for panels, slots and cards. |
| `--c-inset` | `#080C0E` | Recessed bands: console rail, footer, panel gradient foot. |

### 1.2 Structure

| Token | Value | Role |
|---|---|---|
| `--c-line` | `#1A252A` | Decorative hairline: section rules, card/panel borders, dashed dividers. |
| `--c-line-2` | `#253339` | Decorative border one step up: non-interactive chips, `kbd`. |
| `--c-line-hot` | `#33474F` | Decorative border on hover; slash separators; dashed placeholder underline. |
| `--c-edge-int` | `#55707A` | **Interactive-boundary token.** Every interactive component edge (chip, button, dock, off-state dot) uses this. Ruling (punch list 25): interactive edges clear 3:1 against their own background — measured 3.6:1 on `--c-base`, 3.5:1 on `--c-panel`, 3.3:1 on `--c-raised`. Documented exception: decorative card/section hairlines (`--c-line*`) may sit below 3:1 because they never carry meaning alone — every card also has a fill change, a text label and a focus ring. |

### 1.3 Text (all AA+ on `--c-base`)

| Token | Value | Role |
|---|---|---|
| `--t-hi` | `#E9F1F3` | Headings, values, primary emphasis. 16.8:1. |
| `--t-mid` | `#B3C3C9` | Body default (`body` color). 10.6:1. |
| `--t-lo` | `#7E9199` | Secondary prose, labels, demoted kickers/section numbers. 5.8:1. |
| `--t-faint` | `#7A8E96` | Furniture floor: rail, stamps, nameplate labels. 5.6:1 on base, 5.2:1 on `--c-raised` — deliberately off the old 4.61:1 hover cliff (punch list 24). **Nothing may be dimmer than this.** |

### 1.4 Signal — one accent does the work

| Token | Value | Role |
|---|---|---|
| `--sig` | `#3FD9A0` | Phosphor. Budget: live/computed status · the one primary action · computed values (see §7.3 and §8-B). |
| `--sig-deep` | `#1F7A5C` | Manifold gradient dark stop; never used for text. |
| `--sig-wash` | `rgba(63,217,160,.10)` | 10% fill: selected chip background, dot halo. |
| `--sig-edge` | `rgba(63,217,160,.34)` | 34% border: selected chip, dock-open edge, live-dot ring. |
| `--warn` | `#E2A75F` | **Paused / partial only.** Never error-red theatre; amber never means "bad". |
| `--warn-wash` | `rgba(226,167,95,.10)` | Paused dot halo. |

### 1.5 Type

| Token | Value | Role |
|---|---|---|
| `--f-inst` | `"Helvetica Neue", "Segoe UI Variable Display", "Segoe UI", Helvetica, "Liberation Sans", sans-serif` | Instrument sans — body and headings. System stack, no webfont, no CLS. |
| `--f-mono` | `ui-monospace, "SF Mono", SFMono-Regular, Menlo, "Cascadia Mono", "Roboto Mono", "DejaVu Sans Mono", monospace` | All furniture, labels, values, nav, buttons. The dominant face. |
| `--f-paper` | `"Iowan Old Style", Charter, "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif` | Serif. Binds to **two** things only (graft B): theory names and the hero support line. |
| `--ts-nano` | `.625rem` (10px) | Chip + stamp + nameplate furniture. |
| `--ts-micro` | `.6875rem` (11px) | Console furniture, nav links, kickers, unit lines. |
| `--ts-small` | `.8125rem` (13px) | Card/slot body, buttons, footer links. |
| `--ts-body` | `.9375rem` (15px) | Base body size. |
| `--ts-lead` | `1.1875rem` (19px) | Hero support line (serif italic). |
| `--ts-h3` | `1.1875rem` | H3. Same value as `--ts-lead` by design; keep both names — they change independently. |
| `--ts-h2` | `1.75rem` | Section headings. |
| `--ts-serif-md` | `1.45rem` | The one serif display size (theory names). |
| `--ts-value` | `2.125rem` | The big computed numeral (`.slot__val`). One size, everywhere. |
| `--ts-h1` | `clamp(2.35rem, 4.7vw, 4.25rem)` | Page H1. |
| `--track-label` | `.13em` | Uppercase mono furniture. |
| `--track-data` | `.05em` | Mono values + sentence-case mono. |
| `--track-display` | `-.02em` | H2 / H3 / big numerals. |
| `--track-tight` | `-.032em` | H1 only. |

Line-height is **not** tokenized (per component: 1.02 h1, 1.15 h2, 1.25 h3, 1.5–1.6
prose, 1 on `.slot__val`). Do not invent `--lh-*` until a second consumer needs one.

### 1.6 Space, geometry, motion

| Token | Value | Role |
|---|---|---|
| `--s-1` … `--s-10` | in index order: `4px 8px 12px 16px 24px 32px 48px 64px 96px 128px` | Spacing scale (`--s-1:4px` … `--s-10:128px`). `--s-1` and `--s-8` are **(unused)** in the comp. |
| `--maxw` | `1320px` | Content max width (`.wrap`). |
| `--gutter` | `60px` | Inline page padding. **Responsive: 40px ≤1180, 22px ≤620.** |
| `--r-sm` | `3px` | Buttons, skip link, small chips, photo frame. |
| `--r-md` | `5px` | Panels, cards, expanded dock. |
| `--dock-size` | `48px` | Resting dock diameter. |
| `--dock-gap` | `20px` | Dock inset from viewport edge. **Responsive: 16px ≤620.** |
| `--dock-reserve` | `96px` | Bottom page reserve the fixed dock is paid out of (punch list 2) — applied as `footer { padding-bottom }`. |
| `--dur` | `220ms` | The one transition duration. |
| `--ease` | `cubic-bezier(.2,.7,.3,1)` | The one easing curve. |

`--s-9`, `--s-10`, `--gutter`, `--dock-gap` are **re-declared inside media queries**
(≤1180: `--s-9:80px --s-10:88px`; ≤620: `--s-9:64px --s-10:80px`). Keep this mechanism —
everything downstream, Tailwind utilities included, becomes responsive for free with no
breakpoint variants in markup.

---

## 2. Implementation mapping (Next.js app)

**2.1 One source.** `app/globals.css` `:root` holds every token from §1, with the
comp's comment text intact (the contrast measurements and the `--c-edge-int` ruling are
part of the artifact — do not strip them). The media-query re-declarations live in the
same file directly under `:root`.

**2.2 Tailwind reads the variables and never restates a value.** In
`tailwind.config.js` (v3 `theme.extend`) every entry is `var(--token)`:

```js
colors: { base:'var(--c-base)', panel:'var(--c-panel)', raised:'var(--c-raised)',
  inset:'var(--c-inset)', void:'var(--c-void)', line:'var(--c-line)',
  line2:'var(--c-line-2)', lineHot:'var(--c-line-hot)', edge:'var(--c-edge-int)',
  hi:'var(--t-hi)', mid:'var(--t-mid)', lo:'var(--t-lo)', faint:'var(--t-faint)',
  sig:'var(--sig)', sigDeep:'var(--sig-deep)', sigWash:'var(--sig-wash)',
  sigEdge:'var(--sig-edge)', warn:'var(--warn)', warnWash:'var(--warn-wash)' },
fontSize: { nano:'var(--ts-nano)', micro:'var(--ts-micro)', small:'var(--ts-small)',
  body:'var(--ts-body)', lead:'var(--ts-lead)', h3:'var(--ts-h3)', h2:'var(--ts-h2)',
  serifMd:'var(--ts-serif-md)', value:'var(--ts-value)', h1:'var(--ts-h1)' },
letterSpacing: { label:'var(--track-label)', data:'var(--track-data)',
  display:'var(--track-display)', tight:'var(--track-tight)' },
spacing: { 1:'var(--s-1)', /* …10 */ gutter:'var(--gutter)', dock:'var(--dock-size)',
  dockGap:'var(--dock-gap)', dockReserve:'var(--dock-reserve)' },
borderRadius:{ sm:'var(--r-sm)', md:'var(--r-md)' }, maxWidth:{ page:'var(--maxw)' },
fontFamily:{ inst:['var(--f-inst)'], mono:['var(--f-mono)'], paper:['var(--f-paper)'] },
transitionDuration:{ DEFAULT:'var(--dur)' },
transitionTimingFunction:{ DEFAULT:'var(--ease)' },
```

Delete the existing `gold` / `surface` literal palettes and the Geist font vars — old
design, and exactly the duplication this spec bans.

**2.3 Opacity modifiers are banned on token colors.** Tailwind 3 cannot apply
`bg-sig/10` to a hex delivered through `var()` (no `<alpha-value>` channel). Use the
pre-mixed `--sig-wash` / `--sig-edge` / `--warn-wash`. A new alpha means a new named
token in `:root`, never an inline `rgba()`.

**2.4 Component CSS.** Structural instruments (rail, panel, nameplate, slot, card,
theory row, dock) ship as plain CSS classes in `globals.css` under the comp's own class
names — the comp is the reference implementation, and translating it to utility soup
loses the inline rulings. Tailwind utilities cover one-off layout inside templates.
Either way, values come from tokens only.

**2.5 Dark-only for v1.** No `prefers-color-scheme` branch, no theme toggle, no `.dark`
class; `:root` is the dark theme and `<html>` sets `color-scheme: dark`.
**Phase 4 deliverable (punch-list carryover): a light/print path for `/work/[slug]`**,
because buyers forward PDFs to committees. Implement as a `@media print` token-override
block re-binding surface/text/line tokens to a paper set — component CSS must not
change. Print: manifold and grain hidden, dock hidden, panel gradients flattened,
`--sig` demoted to a print-safe ink, links print their href, nameplates and the footer
stamp always print.

---

## 3. Component inventory and contract rules

| Component | Contract |
|---|---|
| **Console rail** (`.rail`) | Landmark: `role="region" aria-label="Page status"`. Mono, `--ts-micro`, `--t-faint`, 34px tall, `--c-inset`. Left set = live status; right set = location + index-built stamp. Every dot is paired with a visible status word — the dot never carries state alone. At ≤900px the first right-hand item hides; nothing else may be dropped. |
| **Status dot** (`.dot`) | 6px. Variants: default = active (`--sig`), `--live` = static `--sig-edge` ring + breathing animation (the ring is the signal; the breathing is decoration), `--warn` = paused (`--warn`), `--off` = dormant (`--c-edge-int`, ≥3:1). Always `aria-hidden` with an adjacent visible word (Active / Live / Paused / Dormant). |
| **Nav** (`.nav`) | Sticky, `rgba` base at 86% + backdrop blur, `--c-line` bottom border. Mark → `/`. Links mono `--ts-micro` uppercase, `--t-lo`, `--sig` underline grows on hover. `.ask` pill uses `--c-edge-int` (interactive edge). ≤900px: links wrap to a scrollable third row; ≤620px: link hit areas ≥44px. |
| **Readout panel** (`.panel` + `.readout`) | Page-level counts only — per-system numbers belong to the proof slots (punch list 14, ~60% duplication removed). Head = title + live-dot + status word. Each row: label · dotted leader rule · value. `.has-sub` rows carry a `.sub` line that names or derives the count so a reader can check it. Values `--t-hi`, computed values may take `.v--sig`. |
| **Provenance nameplate** (`.np`) | Graft A. Two-column grid (`auto 1fr`) so the longest label sizes the column. Fields are `<div class="np__f"><dt>…<dd>…`. Field set is **variadic, not fixed**: the canonical page-level instance is SOURCE / METHOD / BUILT (hero readout, footer stamp); the per-item instance is SOURCE-or-VALUE / LAST ACTIVE / GO. Required wherever a number is printed. Unfilled fields use `.np__ph` (dashed underline + `--t-faint` + literal text such as "computed at build") — labelled, never faked. |
| **Proof slot** (`.slot`) | Exactly one real number per slot, one size (`--ts-value`), one color (`--sig`). No text masquerading as a value — units ("$ / PR", "LIVE") live on `.slot__unit`. Order: id + dot + state word → value → unit → description → nameplate strip. Hover raises fill and grows a `--sig` top rule. 3–4 slots (brief proof-strip contract). |
| **Work card** (`.card`) | Wraps a real focusable link (`.card__link` with a stretched `::after`); the accessible name is the title alone. `data-cat` carries space-separated categories. Index numeral is `counter(cards, decimal-leading-zero)` — never typed. Focus ring lands on the whole card via `:has()`. Category chip is decorative (`--c-line-2`), non-interactive. |
| **Filter mechanism** | Radio group (`role="group"`, visually-hidden inputs + `<label>` chips, chips ≥44px at ≤620px, `--c-edge-int` border, checked = `--sig-wash`/`--sig-edge`/`--sig`). Filtering is **CSS-only** via `@supports selector(:has(*))` — `.work:has(#wf-x:checked) .card:not([data-cat~="x"]) { display:none }`. **PROTECT: the CSS-counter tally must survive as a mechanism.** `display:none` cards cannot increment `counter(cards)`, so the shown-count is honest by construction. Do not re-implement the count in JS, React state, or a data attribute — a JS count can drift from what is on screen; this one cannot. Degrades to "show everything" without `:has()`. |
| **Tally** (`.tally`) | `Showing <n>` where `n::before { content: counter(cards, decimal-leading-zero) }` in `--sig`, plus `Filter: <name>` where the name is also a generated `content` string per checked filter. **No typed denominator** (punch list 12). |
| **Theory row** (`.thy__row`) | Grid `52px 1.15fr 1fr 190px` → 2-col ≤1180. Name in `--f-paper` at `--ts-serif-md`. `.thy__flag` = maturity label, `--t-lo`; `.thy__flag--warn` = `--warn` and **amber means paused, only ever paused**. State column carries dot + word + artifact link. |
| **Buttons** | `.btn` 44px, mono `--ts-small`, `--track-label`, `--r-sm`. `.btn--primary` = `--sig` fill (the one primary action per view). `.btn--ghost` = `--c-edge-int` border on `--c-panel`. Hover: -1px translate + arrow +3px. `.ask` nav pill is 36px (44px ≤620px). |
| **Chips** | Interactive chips (filters) use `--c-edge-int`; decorative chips (`.card__cat`) use `--c-line-2` under the documented hairline exception. |
| **Dock** (`.dock`) | Rests as a 48px icon-only pill at `--dock-gap`; expands to `min(330px, 100vw - 2×gap)` on hover / focus-visible / `.is-open`, stating its honesty clause before anyone talks to it. `aria-haspopup="dialog"`, `aria-expanded`, short `aria-label`, terms in `aria-describedby`. Page reserves `--dock-reserve` (96px) at the footer so the dock never covers content at any breakpoint. **Mobile (coarse pointer): no hover expansion — tap opens; expanded panel is full-width minus gaps, dismissible, and returns focus to the trigger. The dock must never overlap the tally, theory links, slot links or footer at any width.** [BUILD-GATE] |
| **Skip link** (`.skip`) | Fixed, off-screen until `:focus`, 44px, `--sig` fill. First element in `<body>`; target `<main id="main" tabindex="-1">`. |
| **Footer** | `--c-inset`, `padding-bottom: var(--dock-reserve)`. Social links ≥44px; human-presence photo (real asset, [BUILD-GATE]); colophon stating the number-honesty policy; page-level nameplate stamp; entity line: "Utlyze (studio) · New Reward (agency) — James operates both". |
| **Grain** (`.grain`) | Fixed data-URI turbulence, `opacity .038`, `mix-blend-mode: overlay`, `pointer-events:none`, `aria-hidden`. Hidden in print. |
| **Archived badge** (new — no comp precedent) | For `/primer`, `/manuscript`, `/workshop`. Mono `--ts-nano`, uppercase, `--track-label`, `--c-line-2` border, `--t-faint`; text "Archived <date>" with a real date from the content source. Not `--warn` — archived is not paused. |

---

## 4. Template specs (brief page map)

Numbers listed as "computed" are derived at build from the typed in-repo content source
(`lib/` modules — `lib/catalog.ts` already exists and is the live example: the homepage
"36 tools cataloged" is `catalog.reduce((n,c) => n + c.tools.length, 0)`). Nothing in
this column may be typed into JSX.

| Route | Sections | Components | Computed numbers → source |
|---|---|---|---|
| `/` | rail → nav → hero (eyebrow, H1, serif support line, CTA pair, terms line, readout panel) → 01 Proof → 02 Work → 03 Theories → footer | rail, nav, manifold, scrim, readout panel, nameplate, proof slot ×3–4, filter + card grid, tally, theory row, dock, footer | Systems listed = `work.length`; Public repos = count of work entries with a public repo, with the repo names printed in the `.sub` line (punch list 9); Outside stars = summed stars across public repos, method stated inline (punch list 10); Theories = count of theories at maturity ≥ *sketched* (see §8-C); rail "N systems tracked" = same `work.length`; index-built stamp = build timestamp; per-slot value + LAST ACTIVE = per-system source. |
| `/work` | sec-head → filter group → card grid → tally | filters, card, tally, nameplate (index-level) | Tally numerator = CSS counter. Per-card open-source signals (stars, last commit) = repo snapshot captured at build; each card's foot line prints the unit it is showing. |
| `/work/[slug]` | H1 → problem → what I built → how it works in plain words → **proof block** → stack → related | panel, proof slot(s), nameplate, archived/anonymized disclosure line, print styles (§2.5) | Every quantitative delta with stated methodology and timeframe; nameplate SOURCE/METHOD/BUILT required on the proof block; anonymization sentence rendered from the content source when `anonymized: true`. Prose must be substantively different from the project README (SEO constraint). |
| `/theories` | sec-head → theory rows | theory row, maturity flag, dot | Count of listed theories = `theories.filter(maturity ≥ sketched).length`. Maturity state is shown as prominently as the title. |
| `/theories/[slug]` | Question-shaped H1 → answer capsule → maturity state + dated history → full theory as static HTML → artifact link | panel (capsule), theory flag, nameplate | `datePublished` / `dateModified` advance with maturity state; `creativeWorkStatus` carries the maturity rung. Capsule is self-contained and pronoun-free. Full text must be static HTML on the page — chat is never the publishing destination. |
| `/lab` | sec-head → artifact grid → per-artifact explanation link | card, dot/state, dock | Artifact count = counter mechanism. Any artifact without a written explanation page is `noindex`. |
| `/learn` | hub intro → three volume cards with archived dates | card, archived badge | Volume count computed; each "Archived <date>" from the content source. |
| `/primer`, `/manuscript`, `/workshop` | Existing content, reskinned in place | tokens + type + nav + footer + archived badge | **URLs preserved, no redirects.** Only the skin and the badge change. |
| `/about` | Human story → the reliability answer (verification doctrine in plain words) → entity map (James / New Reward / Utlyze) | photo, panel, nameplate | None required; if a number appears it obeys §6. |
| `/contact` | Strong-fit qualification → lead gateway form | buttons, panel, form states | None. Form failure must surface visibly, never silently. |
| `/now` | Single hand-edited file + "updated N weeks ago" | rail-style stamp, dot | "Updated N weeks ago" computed from the file's own `updated` field. Staleness past 6 weeks is a defect and should fail a build check. No auto-generation from GitHub activity. |

Sitewide: skip link, `<main id="main" tabindex="-1">`, dock on every page, per-page
self-referencing canonical, per-page `openGraph`/`twitter` title+description+image.

---

## 5. Motion rules

1. **Counts never animate** (graft C, comp lint rule 2). `.slot__val`, `.readout .v`,
   `.tally .n` carry `transition:none; animation:none`. No count-up, ever — a number
   that moves is a number the reader has to trust twice. A lint, not a taste.
2. **Reduced motion is a universal guard and stays universal.**
   `@media (prefers-reduced-motion: reduce)` sets `animation-duration:.001ms !important;
   animation-iteration-count:1 !important; transition-duration:.001ms !important` on
   `*, *::before, *::after`, plus `.mf{animation:none}`. PROTECT — never narrow to an
   opt-in list.
3. **Load choreography, evidence before ask.** One orchestrated reveal: `.rise` (700ms,
   `--ease`, `both`); `.d1` 60ms eyebrow → `.d2` 130ms H1 → `.d3` 200ms support line →
   **`.d4` 280ms readout panel → `.d5` 370ms CTA + terms**. Currently dead in the comp —
   see §8-A.
4. **State is never motion-only.** `.dot--live` differs from active by a *static* ring;
   the 3.4s breathe is an extra for people who can see it.
5. **One duration, one curve** (`--dur`/`--ease`). Hover motion ≤3px translate. No
   parallax, no scroll-jacking, no scroll-triggered number reveals.
6. **The manifold — three tiers.**
   - **Baseline (v1, ships now):** the comp's inline SVG parametric field. Stops are
     classed and styled in CSS (`.mf-s1…`, `.mf-b1…`) because SVG presentation
     attributes cannot parse `var()`; palette is `--sig`/`--sig-deep`/`--c-base` only,
     hue 158°, no cyan drift, no near-white. Decoration must measure *dimmer than the
     H1* (rulings ≈ .45 mean opacity, cross-sections ≈ .30). One `animation`
     declaration carries both the 1500ms fade and the 64s drift — two competing rules is
     how the drift silently died once already.
   - **Upgrade (canvas):** an animated 2D-canvas field may replace the SVG only if it
     holds every baseline property (token-only palette, dimmer than H1, static first
     paint, reduced-motion off) and adds no CLS. *Not named in the brief — see §8-F.*
   - **WebGL promotion gates (brief; all must pass before the field becomes sitewide
     background chrome):** static reduced-motion fallback · non-WebGL fallback ·
     visibility-gated frameloop (pause off-screen) · **measured** mobile Lighthouse
     pass · draw-call refactor of `EntanglementField` (instancing / single particle
     shader; today ~70 animated `Line` components). Keep the existing `next/dynamic` +
     `ssr:false` lazy mount. Until all gates pass `/` ships the lighter hero treatment;
     the full field is the upgrade, never the launch blocker.
7. **Budgets:** 60fps, zero CLS, WCAG 2.2 AA everywhere.

---

## 6. Number honesty (build constraints, not guidance)

1. Every number rendered anywhere on the site is computed from the typed content source
   at build/render time. Hand-typed figures are a banned defect class — the old site
   printed "298 tools cataloged" when the computed count was 36.
2. Wherever a number appears, a provenance nameplate appears with it: SOURCE (where it
   came from), METHOD (how it was derived), BUILT (when it was last touched). Per-item
   instances substitute VALUE and LAST ACTIVE as in §3.
3. **No typed denominators.** "Showing 03 of 04" is banned; a typed denominator lies the
   moment an item is added. Computed numerator + named filter only.
4. **Placeholder styling rule.** A value the build has not yet supplied renders with
   `.np__ph`: `--t-faint`, dashed underline, and literal text ("computed at build",
   "placeholder — computed at build"). Never styled as fake precision, never a plausible
   invented numeral in value typography.
5. **Missing is not zero.** If a figure cannot be derived, the page says so instead of
   estimating or rounding up.
6. Re-derived fields and maintained constants are distinguished in the content contract
   (e.g. rail's "1 operator" is a constant; "N systems tracked" is derived).
7. Counts shown next to a filter are read from what is displayed (§3, CSS counter), not
   from a parallel data structure.

---

## 7. Lint and enforcement

Add as CI checks; each one is cheap and each one has already caught a real defect.

1. **No raw `px` font-size and no raw `em` letter-spacing outside `:root`.** Add a token
   instead of a literal. (Comp lint rule 1.)
2. **No hex / `rgb()` / `rgba()` color literals outside `:root`, including inside inline
   SVG.** SVG stops must be classed and coloured in CSS. See §8-D: the comp itself has
   12 violations of this rule and cannot pass it without new tokens.
3. **`--sig` three-role budget:** live/computed status · the one primary action ·
   computed values. Nothing decorative wears it. Kickers, section numbers and theory
   flags are `--t-lo`. See §8-B — the comp uses `--sig` for interaction feedback too,
   which is a fourth role needing a ruling.
4. **Serif binding:** `--f-paper` may appear on exactly two selectors — the theory name
   (`.thy__name`) and the hero support line (`.hero__sub`) — plus their per-template
   equivalents. Fail the build on a third.
5. **Canonical self-reference test:** render every route and assert
   `canonical === own URL`. (The live site canonicalized every subpage to the homepage
   until the 2026-08-11 hotfix.)
6. **Per-page OG required:** template-level `openGraph`/`twitter` title + description +
   image on every route; fail the build if absent.
7. **Interactive edges** use `--c-edge-int` and clear 3:1; decorative hairlines may use
   `--c-line*` only where fill + text already carry the meaning.
8. **CSS parses clean.** Run the stylesheet through PostCSS in CI and fail on any rule
   whose selector fails `document.querySelector` validation — §8-A is exactly this bug
   and it is invisible to the eye.
9. **Register rule:** no esoteric/mystical language in copy, **component names**, or UI.
   Existing violations to clear during the rebuild: `components/AlchemyCanvas.tsx` and
   the `"James Brady — AI Alchemist Tool Catalog"` string served by `/api/catalog`.
10. **Every proof and theory link resolves externally** before launch (punch list 4
    [BUILD-GATE]) — the copy "each one links to the thing itself" cannot ship until true.

---

## 8. Open conflicts — do not resolve silently

**A. The comp's load choreography is dead.** Comp line 792 is a stray comment
terminator (`Order matters: … (d5). */`) after the comment already closed on 791. The
parser swallows the next rule: verified with PostCSS, there is **no `.rise` rule** — its
selector parses as `Order matters: the evidence panel (d4) arrives before the ask (d5).
*/ .rise`. `.d1`–`.d5` survive but set `animation-delay` with no animation. It fails
safe (nothing sticks at opacity 0), but §5.3 does not currently happen. Same defect
class as punch-list item 23's dead drift animation, introduced by that item's own
comment edit. Build §5.3 as written.

**B. `--sig` budget vs the comp as built.** 22 uses outside `:root`; twelve fall outside
the three permitted roles: `:focus-visible`, `.filters input:focus-visible + label`,
`.card:has(.card__link:focus-visible)`, `.skip`, `.mark__glyph`, `.nav__links a::after`,
`.slot::before`, `.card::after` (2 borders), `.card:hover .card__foot .arw`,
`.foot__links a:hover`, `.np a:hover`, `.thy__row:hover .thy__state a`. Recommendation:
document a **fourth role — interaction feedback (focus ring, hover reveal, selected
state)** — and demote the decorative `.mark__glyph` square. Needs a ruling before §7.3
can run as a lint.

**C. The theories maturity ladder is undefined.** The brief names a nine-theory spine,
excludes anything below "sketched" from home/nav discovery, and says
`creativeWorkStatus` carries "the maturity ladder" — but names only two rungs
(*named-only*, *sketched*). The comp shows three theories labelled with prose
("Flagship · working paper", "In progress", "Paused exploration — live demo") that are
not rungs. Until the canonical vocabulary exists, the homepage "Theories" count cannot
be computed. Blocks §4 `/` and `/theories`.

**D. The "no hex outside `:root`" lint fails against the locked comp.** Violations:
`#052018` (on-signal ink; `.skip`, `.btn--primary`), `#5FE6B4` (`.btn--primary:hover`),
`#000` ×2 (`.mf` mask — arguably a stencil, not a colour), raw `rgba()` in `.nav`,
`.hero__scrim` ×2, `h1 .mark-under`, `.dock` ×2. Closing it needs new tokens (on-signal
ink, signal-hover, named base-alpha steps). Those tokens are not in the locked comp, so
adding them is a token change needing approval, not a quiet commit.

**E. Ask-dock provider contradicts itself inside the brief.** The Chatbot section says
"New build on the Claude API"; the same-day decisions log says "Ask dock provider: Grok
(xAI API) … Claude reference implementation superseded". The repo ships the `openai`
package as a third data point. No design-system consequence — the dock's visible terms
are provider-agnostic — but the dock cannot be implemented until this is settled.

**F. The manifold has two tiers in the brief, three here.** The brief names only
"lighter hero treatment" now and the full WebGL field after gates; the animated-canvas
middle tier in §5.6 comes from the Phase 4 task framing, not the brief. Note also that
the brief's gates were written for the WebGL `EntanglementField`; the comp's hero SVG is
a different artifact that already animates a 64s drift at launch, so the reduced-motion
gate applies to it today.

**G. Route gaps.** `/now` is in the page map but appears in no navigation surface (comp
nav is Work · Theories · Lab · Learn · About · Contact, where Contact is a footer anchor
that must become the real `/contact` route). The live app also ships `/links` and
`/watch`, which the page map never mentions — no keep/reskin/retire ruling exists.

**H. Graft A's field triple is not what the comp renders.** The punch list defines the
nameplate as SOURCE / METHOD / BUILT; the proof slots render SOURCE-or-VALUE / LAST
ACTIVE / GO. §3 specifies the strip as variadic to match the comp — if the punch list
meant the triple literally, the slots need rework.
