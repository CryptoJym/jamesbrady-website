# Direction B "Operating Room" — v2 punch list

Source: three independent audits of the winning comp (buyer credibility ·
design craft · accessibility), 2026-08-11. All verdicts: fixable, no rework.
This list is deduplicated across lanes and is the contract for the v2 comp
AND for the production build (Phase 4/5). Items marked [BUILD-GATE] cannot be
fully closed in a comp and block launch instead.

PROTECT (do not break while fixing): the CSS-counter tally (honest by
construction — display:none cards can't increment it); the conservative
token contrast comments; amber = paused-only discipline; the Latent Emotions
"paused" admission copy; the clean heading order and radio-group filter
semantics; the reduced-motion universal guard.

## P0

1. Location rail: "SALT LAKE CITY · MT" → "LEHI, UT" (owner ruling 2026-08-11).
2. Chat dock collisions (two lanes, measured): covers .sec-aside ×3, .tally,
   theory links, a slot link, footer at ALL breakpoints. Fix: ~96px bottom
   page reserve; move .sec-aside out of the bottom-right rail (left-align
   under its h2); dock rests as icon-only pill, expands on hover/focus.
3. Work cards have zero interactive elements despite hover affordance. Wrap
   each in a real focusable link.
4. Dead anchors: 10 of 17 in-page hrefs resolve to nothing (#lab #learn
   #about #ofone #plimsoll #newrewards #eeg #uqg #qad #latent). In the comp,
   point to the PLANNED real routes (/lab, /learn, /about, /work/ofone,
   /theories/universal-question-geometry, ...). [BUILD-GATE: every proof and
   theory link must resolve externally before launch — the copy "each one
   links to the thing itself" cannot ship until true.]
5. Stat bank integrity (two lanes): delete .slot__val--txt. Every slot = one
   real number, one size, one color. "$ / PR" and "LIVE" move to the unit
   line. plimsoll + NewRewards slots get computed figures at build; in the
   comp use clearly-marked placeholder numerals with a "computed at build"
   note — never styled fake precision.

## P1

6. Manifold: rebuild gradient from --sig/--sig-deep only (kill all 7
   off-token hexes incl. near-white #DCFCEF; hue stays 158°, no cyan drift);
   delete the duplicated blurred <use>; rebalance opacity so both curve
   families read (cross-sections ≈ .30, rulings ≈ .45). Result must be
   dimmer than the h1 (decoration never outranks content).
7. Signal budget: --sig does exactly three jobs — live/computed status, the
   one primary action, computed values. Kickers, section numbers, theory
   flags demote to --t-lo.
8. .dot--off: ≥3:1 contrast + adjacent visible status word (matches the
   Active/Paused pattern). .dot--live additionally gets a static ring
   difference (not motion-only) + text/aria label.
9. "PUBLIC REPOS 03" must be checkable by a human reading the page — name
   the repos inline or surface via the same visible mechanism as the tally.
10. "OUTSIDE STARS 03" states its method inline ("summed across all public
    repos").
11. "Sorted by: most inspectable" → a real sort key ("most recent") or cut.

## P2

12. Drop the typed denominator: "SHOWING 03 OF 04" → "SHOWING 03 · FILTER: X"
    (computed numerator stays; typed denominator lies when a card is added).
13. h1 max-width 14ch → 16–17ch at ≥1180 (fixes the broken rag); keep
    text-wrap: balance.
14. Hero readout owns page-level provenance (counts, index date, method);
    the proof bank owns per-system numbers — remove the ~60% duplication.
15. Token discipline: add --ts-nano and --ts-serif-md; collapse the 13
    letter-spacing values to --track-label + --track-data; no raw px
    font-size or em tracking outside :root (lint rule in CSS comment).
16. Touch targets at mobile: filter chips, .ask pill, mobile nav links,
    footer links all ≥44px; .slot__link / .thy__state links get ≥24px
    (ideally 44px) hit areas via padding, visible size unchanged.
17. Entity clarity in footer: "Utlyze (studio) · New Reward (agency) —
    James operates both."
18. Recency proof: per-slot last-active date, carried by the provenance
    strip (see graft A).
19. Human presence: small photo of James (placeholder box in comp) near the
    readout or footer — highest-value corporate-trust addition on a dark page.
20. Dock honesty clause visible pre-click: "Grounded only in what's
    published here — it says when it doesn't know."
21. "ASK ABOUT MY WORK" wires to the dock's open-trigger, not a #ask scroll
    anchor.

## Grafts (mandated from losing directions)

A. Provenance nameplate strip (from A): SOURCE / METHOD / BUILT fields —
   canonical instance replaces .panel__note in the hero readout; repeats as
   each slot's bottom strip (absorbing .slot__link, adding last-active per
   item 18); page-level instance in .foot__stamp.
B. Serif discipline (from C): --f-paper binds to .thy__name and .hero__sub
   ONLY; remove from .slot__desc em and .colophon b.
C. Counts-never-animate (from C): written as a lint rule — no transition/
   animation on .slot__val, .readout .v, .tally .n; no count-up ever.

## P3 / polish

22. Skip link for sighted keyboard users; console rail into a landmark
    (or labeled region); split the dock's run-on accessible name.
23. Fix the dead 64s drift animation (cascade collision with .fade) — either
    restore intent or delete the code; align panel top to h1 cap-line; swap
    d4/d5 stagger (evidence before ask); correct or delete the two false
    precision comments.
24. Nudge --t-faint on raised hover backgrounds off the 4.61:1 cliff
    (target ≥5:1).
25. Design-system ruling (recorded): interactive component boundaries
    (chips, buttons) ≥3:1 border contrast; decorative card hairlines may
    stay below with redundant fill+text cues — documented exception.

## Build-phase carryovers (not comp-fixable)

- All numbers computed from the content source at build (incl. rail's
  "4 SYSTEMS TRACKED · 1 OPERATOR" — distinguish re-derived fields from
  maintained constants in the content contract).
- Every external link resolves (item 4 gate).
- Real photo asset for item 19.
- Light/print path for /work case-study pages (buyers forward PDFs to
  committees) — Phase 4 spec item.
