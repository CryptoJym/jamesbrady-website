# Wave 3b — the Vuplicity offer: evidence

One owner ruling, built. James, 2026-08-12: *"list Vuplicity as an option too,
where they can work with me."* It supersedes the anonymized-client treatment
for the offer surface and nothing else, and the `CLIENT_DENYLIST` secret was
updated the same day so the confidentiality gate permits the name there.

Everything below is measured, not asserted. `after` = this branch built and
served on :4123; the legacy pixel diff compares against a build of `main`
(`c5038c9`) served on :4124 by the same instrument.

---

## Gate tallies on the final build

| Gate | Result |
|---|---|
| `tsc --noEmit` | clean |
| `next build` | clean, `/work-with-me/background-screening` prerendered |
| `verify-seo` | **17/18 PASS · 1 UNPROVEN** (denylist secret, absent locally by design) |
| `verify-visual` | **23/23 PASS** (2 new assertions this wave) |
| `verify-chrome` | **22/22 PASS** · 60.0 fps at 1440, 66.6 fps at 375 |
| `verify-tokens` | **5/5 PASS** |
| `verify-fixtures` | **19/19 PASS** |
| `verify-ask --offline` | **24/25 PASS · 1 UNPROVEN** (same denylist secret) |
| `verify-ask --live` | **NOT RUN** — needs a real key, unchanged since wave 2 |
| Legacy parity vs `main` | **0 px** across `/primer` `/manuscript` `/workshop` `/watch` |

`verify-seo` check 10 and the matching `verify-ask` check are UNPROVEN on a
laptop because `.seo-denylist.txt` is gitignored and there is no secret to
materialize it from. That is the designed local state. **In CI they are the two
checks this wave actually turns on**, and the section below is the local
red-team that says what they will be measuring.

## The denylist gate, red-teamed in both directions

An UNPROVEN gate proves nothing, so the gate was run locally against a
hand-written list twice, to establish that it is still capable of failing.

| Local list | Result | What it establishes |
|---|---|---|
| one term that is nowhere on the site | **PASS** — `1 terms, 0 matches` | the gate still reads the built pages and the artifacts |
| the single term `Vuplicity` | **FAIL** — 8 surfaces named by file and line, term never echoed | the gate *would* catch the name |

The second row is the one that matters. The name is not hidden from the gate by
any allowlist, exception or special case in this branch. CI passes check 10
**only** if `CLIENT_DENYLIST` no longer carries the term, which is exactly the
dependency the owner ruling created. If the secret was not updated, CI goes red
and the red is correct.

That failing run also enumerated every surface the name reaches, which is how
the scope below was counted rather than intended.

## Where the name appears, counted from the built pages

| Route | Occurrences | Why |
|---|---|---|
| `/work-with-me/background-screening` | 113 | the offer itself |
| `/work-with-me` | 14 | the hub card and its delivery line |
| `/` | 4 | the fourth door |
| `/links` | 4 | the same door on the video-arrival page |
| `/work/visibility-platform` | 4 | the anonymization note states the one exception and links to it |
| `/now` | 4 | the offer carries a `[JAMES: …]` mark asking his exact relationship, and `/now` is the register of every open mark |
| `/about` `/contact` `/work` `/theories` `/lab` `/learn` `/work-with-me/get-found` `/work-with-me/build-a-system` | **0** | out of the ruling's scope |

`/work/visibility-platform` stays `anonymized: true`. Its third `publicNote`
used to read "No client has cleared their name for publication", which stopped
being true the moment the offer shipped; it now names the exception, scopes it
to the offer page, and says the case study stays anonymous. That is the
contradiction this wave had to close: one page naming a company while another
one page over claimed no company had been named.

## Exactly which public facts were used, and which were refused

Every fact about Vuplicity came from `www.vuplicity.com` over plain HTTP on
2026-08-12, and each one is either that page's own `<title>`, its own
`<meta name="description">`, its own JSON-LD `Organization` node, or a URL in
its own `sitemap.xml`. The full capture is recorded in the header comment of
`content/offers/background-screening.ts`. In short:

- `/` — "Nationwide background screening with clear pricing and cleaner workflows"; helps hiring teams run nationwide background screening with transparent pricing, compliant workflows, and a direct path from self-serve setup to guided rollout.
- `/pricing` — "Background Check Pricing"; Basic, Essential and Complete packages, clear public package pricing, add-on guidance.
- `/offerings` — "Background Screening Offerings"; packages, add-ons, monitoring options, candidate consent workflows, report release controls.
- `/security` — "Security and Compliance Overview"; screening workflow controls, audit trails, candidate consent, report release boundaries.
- `/faq` — "Background Screening FAQ"; packages, pricing, candidate consent, report timing, employer decision boundaries.
- JSON-LD `Organization` at `https://www.vuplicity.com/#organization`.

**Refused on purpose.** The same HTML carries two further JSON-LD blocks tagged
`data-newrewards-edge`, injected by the agency's own edge layer rather than
authored by Vuplicity. They are public bytes, and their provenance is this side
of the relationship. A page that quotes its supplier's output back as the
client's own statement is quoting itself, so their extra facts (a Lehi address,
international checks, ATS integrations) are absent here rather than softened.

**Refused for the same reason, in the other direction.** James's title,
ownership position and start date at Vuplicity appear in no public source. They
are carried as a `[JAMES: …]` mark rather than guessed, and render to a buyer as
a third-person statement of absence:

> James Brady's exact position at Vuplicity, and the date it started, are not
> published on this site yet. What this page states is that a screening enquiry
> reaches him and that Vuplicity delivers the work.

`verify-seo` check 17 now includes the new route in `BUYER_ROUTES`, so a
second-person mark reaching it is a build failure rather than a review note.

## The four-door row

Wave 3's `DoorRow` comment said "three doors, not four", on the grounds that a
row stops working when it stops being scannable. Wave 3b makes it four, because
the fourth is a real engagement and the alternative was hiding it. Scannability
became a measured layout property instead of a counting rule:

| Width | Layout | Measured |
|---|---|---|
| 1440 | four across, one row | 4 doors, 1 row, 0 px horizontal overflow |
| 375 | two by two | 4 doors, 2 rows, narrowest door 160 px, 0 px overflow |

Both are asserted in `verify-visual`, not eyeballed. The 375 rule is the only
grid on the site that stays multi-column on a phone: a work card carries a
title and a paragraph and needs the width, but a door is a signpost, and four
signposts in one column is a scroll rather than a choice. Door padding and the
label size step down with the column so the text keeps a line to sit on.

## Files

| File | What it shows |
|---|---|
| `doors-1440.png` | the four-door row at 1440, clipped to the section |
| `doors-375.png` | the same row two by two at 375 |
| `work-with-me-1440.png` · `work-with-me-375.png` | the hub carrying three engagements |
| `offer-background-screening-1440.png` · `offer-background-screening-375.png` | the new page in full, including the third-person absence notes and the proof list |
| `contact-preselect-1440.png` | `/contact?inquiry=background_screening` with the enquiry type already selected |
| `work-visibility-platform-1440.png` | the case study, still anonymized, with the amended note |

The door-row images are clips of the full-page render rather than viewport
screenshots. Wave 3's `home-1440-doors.png` was a viewport shot taken at the
top of the homepage, so it captured the hero and never contained the row it was
named after.

## CI settled both UNPROVEN checks

The workflow ran on `0eaa4e9` and again on `d36feb5`, and both were green. The
line that matters:

```
denylist materialized: 28 term(s)
PASS  10. Client-name denylist — 28 terms, 0 matches
18/18 checks passed
```

That is the secret's real list, 28 terms, run against built pages that name
Vuplicity 143 times, finding nothing. Read against the local red-team above,
where the same gate failed on eight surfaces the moment the term was added, it
says one thing plainly: **`CLIENT_DENYLIST` no longer carries the name, and the
gate is still capable of catching it.** `verify-ask --offline` went to 25/25 in
the same run for the same reason.

CI tallies on `d36feb5`: `verify-seo` 18/18 · `verify-visual` all passed,
including four doors in one row at 1440, two by two at 375 with the narrowest
at 160 px, and legacy parity 0 px across all four archived routes ·
`verify-chrome` all passed · `verify-tokens` 5/5 · `verify-fixtures` 19/19 ·
`verify-ask --offline` 25/25.

## What is not proven here
- **`verify-ask --live`** is NOT RUN, unchanged since wave 2.
- **Proof-link liveness (§8.9)** is still not implemented in `verify-seo`. The
  four Vuplicity URLs on the new page were fetched by hand on 2026-08-12 and
  each returned 200; nothing re-checks them on a schedule.
- **No screening figure of any kind** is published: no volume, no turnaround,
  no employer outcome. None has been measured under a stated method and window,
  and the page says so rather than leaving the reader to notice.
