# Wave 1 — independent review findings

Source: **independent review lane, 2026-08-11**, against PR #3
(`rebuild/wave-1-foundation`). A second pass the same day added a security and
confidentiality sweep; it is recorded below as the addendum.

This file is the findings AS RECEIVED. What was done about each one is in the
right-hand column and, in more detail, in the PR body's "Review fixes" section.
Nothing here was softened: where a fix differs from what the review asked for,
that is stated in the entry.

The rule the whole list is really about: **a gate that has never been shown
refusing something has not been verified.** Wave 1 shipped a 13/13 tally that
included a denylist proving nothing, a brand allowlist that let the token
through in prose, and no CI at all.

---

## P0 — a computed value re-typed by hand

**P0-1. `footUnit` was a free-text string carrying numerals.**
Work cards printed `"Python · 3 stars"`, `"7 domains · 28 questions"`,
`"Live · 1 dependency"` — hand-typed strings sitting two lines above a
`repo.stars: 3` the card never read. A typed parallel copy of computed data is
the exact class of defect the site brief exists to prevent, and it drifts
silently: the source can change and the card will not.

*Fixed.* `footUnit: string` is gone. `footFacts: FootFact[]` replaces it, and a
fact is one of three things only: a REFERENCE to a field the rest of the site
already reads (`repo.stars`, `stack.primary`, `repo.license`, `anonymized`),
a MEASURE held as `{ count, unit, method }`, or prose with **no digits in it**.
`lib/content/validate.ts` throws at build on a numeral in a short display
string, and verify-seo check 15 scans the content source independently, so
retiring the validator does not retire the rule.

---

## P1 — wrong on a public surface, or a gate that was not there

**P1-2. Legacy render drift.** The `tailwind.config.js` spacing override
(`8`→64px, `10`→128px), a new `body { font-size: 15px; line-height: 1.6 }`
rule, the grain overlay, the Ask dock, and a rewritten footer all reached the
five archived routes, which wave 1 was scoped to leave untouched.

*Fixed, and the fix found more than the review did.* Every colliding Tailwind
key is namespaced (`spacing` → `s1..s10`, `borderRadius` → `bSm/bMd`,
`letterSpacing.tight` → `dispTight`, `transitionDuration/TimingFunction.DEFAULT`
dropped, `fontFamily.mono` back on Geist). Document metrics moved from `body`
to `.b-room`. The grain and the dock moved from the root layout into
`app/(site)/layout.tsx`. The legacy footer is `4217d37`'s again, character for
character.

Then the new gate — build `main` in a worktree, pixel-diff both renders —
caught one more: `colors.base` collides **across scales** with Tailwind's
default `text-base` FONT SIZE, emitting a second `.text-base` rule that
repainted every heading using it from `#E8E4DD` to `#0A0E11`. Renamed to
`canvas`. Nobody would have found that by reading the config.

Gate: `verify-visual --legacy-base <url>`, **zero** differing pixels required,
on all five archived routes rather than the one the review asked for.

**P1-3. `/api/catalog` carried the retired job title and a bare host.**
*Fixed.* `"James Brady — Tool Catalog"`, `https://www.jamesbrady.org/manuscript`.
The register and host scans now cover `app/api/**` and `lib/catalog.ts`.

**P1-4. JSON-LD referenced a node it did not define.** Every template emitted
`isPartOf: {"@id": …/#website"}` while only `/` defined the WebSite node.
*Fixed.* WebSite joins Person and both Orgs on every page. Check 3 now resolves
every `@id` reference against the same page's graph.

**P1-5. No `<h1>` on `/work`, `/theories`, `/lab`, `/learn`.**
*Fixed.* `SectionHead` takes an outline `level`; items under it move h3→h2. The
three CSS rules that pin the promoted elements to their existing metrics mean
the outline is fixed with **zero** visual change — confirmed by the screenshots.
Check 14 asserts exactly one h1 per route and no skipped levels.

**P1-6. No CI.** Every green tally in the PR was a claim about one laptop.
*Fixed.* `.github/workflows/verify.yml`: ubuntu-latest, npm cache,
`fetch-depth: 0`, typecheck → fixtures → build → verify-seo → verify-visual
with the `main` worktree for the parity diff. The denylist step **fails red**
when `CLIENT_DENYLIST` is absent rather than falling back to the placeholder.
`npm run lint` is deliberately not a gate yet — 33 pre-existing errors live in
untouched legacy components, and a permanently-red gate teaches people to
ignore red.

**P1-7. Four spec checks unimplemented; check numbering drifted.**
*Fixed.* Capsule integrity (§8.4), `@type` vocabulary (§8.2), deep-equal Person
(§8.3) and index-lastmod-equals-max-child (§8.6) all implemented. The script
header now carries an explicit script-number → spec-row map.

---

## P2

**P2-8. The brand allowlist was token-global, not URL-anchored.**
"h3ro-dev collective" as body copy and a bare `@h3ro.ai` in a footer both
passed. *Fixed.* The gate strips the four permitted URL SHAPES and any surviving
occurrence fails. The scanner moved to `scripts/lib/h3ro-gate.mjs` so the
fixtures test exercises the same code the battery does. Measured: F4 and F5
scored **0 hits** against the old scanner; both are caught now. Consequence:
`/links` renders the token as two visible link labels — a real defect, now
visible in the DEFERRED block instead of hidden by the allowlist.

**P2-9. `seopr1` was miscategorised as client work.** *Fixed.* Owner records say
"SEOPR1 own marketing site": category `products`, `anonymized: false`, the
withheld-names note gone (it is driven by `anonymized`), and the `[JAMES:]` mark
that asked this exact question resolved with the ruling cited in a source
comment. The performance-number mark stays open — no measurement exists.

**P2-10. Markdown built an anchor from any scheme.** *Fixed.* http/https/mailto
plus relative and fragment links; anything else renders as plain text.

**P2-11. Register/host scans stopped at the Direction B directories.**
*Fixed.* `app/layout.tsx`, `app/api/**`, `lib/catalog.ts`, `app/globals.css`,
`app/robots.ts`, `app/sitemap.ts` and the generated-artifact routes are in
scope, and the `/api/catalog` response body is scanned as an artifact.

**P2-12. The unproven denylist counted as PASS.** A battery running against a
zero-term placeholder tallied 13/13. *Fixed.* Three states: FAIL when the file
is missing or the marker is absent, **UNPROVEN** when it has the marker and no
terms, PASS only on a real list. `CI=true` makes UNPROVEN exit nonzero.

---

## P3

- **`<a>` inside `<button>` in the Ask dock.** Fixed: the hit target is a
  stretched sibling (the pattern `.card` already uses), the mailto is a real
  link, and the keyboard path is unchanged.
- **`aria-haspopup="dialog"` with no dialog.** Dropped. It is a disclosure:
  `aria-expanded` + `aria-controls`.
- **Check-number comments.** Fixed with the P1-7 numbering map.
- **`/about` pending marks.** Left as-is, waiting on James — except the one the
  addendum resolved (A7).

---

# Security sweep addendum (same lane, 2026-08-11)

**A1 (HIGH). `app/api/chat/route.ts` deleted.** An unauthenticated,
unrate-limited proxy to a paid LLM (`api.x.ai`, model pinned, no auth, no quota)
with **zero callers** — its only consumer, `ChatPanel`, is imported by nothing.
Pure attack surface and pure spend risk. Deleted. `ChatPanel` and the other
unmounted components stay for the wave-2 lab rebuild, with a header saying the
endpoint is gone and what it needs before it is mounted.

**A2 (HIGH). Denylist filename trap.** The gate read `.seo-denylist.txt`, which
was **tracked**, while `.gitignore` ignored `.seo-denylist.local.txt` — a
different name. Populating the gate file with real client names would have
committed them to a public repository. *Fixed:* the gate keeps reading
`.seo-denylist.txt` and that name is now gitignored; the tracked artifact is
`.seo-denylist.example.txt`, carrying the marker and no terms.

**A3 (MED). Client name in committed docs.** A real client name appeared in
`SITE-BRIEF.md` and `docs/content-input/portfolio-inventory-2026-08-11.md` in a
public repository — the same policy the site applies to `/work` pages was not
being applied to its own docs. *Fixed:* redacted to "a background-screening SaaS
client (name withheld)" and "(client domain withheld)". Industry stays, name
goes. A sweep for nine other known client names found nothing further;
`content/` and `app/` were already clean.

**A4 (MED). An approval asserted without its source.**
`content/theories/the-paper.ts` said "Introduction-only page approved" with no
attribution. The approval is real. *Fixed:* the note now cites the owner ruling
of 2026-08-11 and the SITE-BRIEF decisions log.

**A5 (MED). `toPlainText()` deleted `[JAMES:]` gaps silently**, which is how an
open question becomes a stated fact the moment wave 2 feeds it to the chatbot
grounding pack. *Fixed:* gaps become the literal token `[pending]`. Two latent
regex bugs fixed alongside — a `]` inside a gap truncated the mark and leaked
the remainder as prose, and a blank line inside a gap rendered raw brackets.
Both now covered by fixtures.

**A6 (LOW). README title and a spec/brief contradiction.** *Fixed:* README line
1 no longer carries the retired job title; `geo-seo-spec.md` §8.8 is reconciled
with `SITE-BRIEF.md` line 126 — the brief's ruling wins, marked
"reconciled 2026-08-11".

**A7 (LOW). Fleet-scale clearance mark, and `rel`.** The `[JAMES:]` mark asking
whether the fleet could be described in public is answered by the brief's own
hero ruling, which sets that support line verbatim. *Fixed:* mark resolved, copy
kept, ruling cited in a source comment. `rel="noreferrer"` added alongside
`noopener` on every new-surface external link.

**Evidence hygiene.** `verify:visual` now writes to the untracked
`out/verify-visual/` by default; `--update-evidence` is what rewrites the
committed PNGs. The evidence README says so, so a regenerated screenshot is
never mistaken for tampering.

---

## Still open after this pass

- **Proof-link liveness (§8.9)** — not implemented, not claimed.
- **README-similarity check (§7.4)** — not implemented, not claimed.
- **`CLIENT_DENYLIST` secret does not exist.** Check 10 reads UNPROVEN and CI is
  red until James creates it. That red is the honest state.
- **The five archived routes** still carry their named defects. Wave 2.
- **`/about` and `/work` `[JAMES:]` marks** that need a fact only James has: the
  human story, the multi-year goal, a real photograph, the entity structure, one
  throughput figure, one Lighthouse/CrUX number, one anonymized client outcome.
- **`.thy__name`** asks for `--ts-serif-md` but has always rendered at
  `--ts-h3`, because `.b-room h3` out-specified it. Pinned deliberately so the
  h3→h2 promotion changed nothing. Whether the serif display size was the intent
  is a design question for wave 2, not a heading-outline question.
