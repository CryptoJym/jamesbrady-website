# Wave 3 — comprehension: evidence

The buildable half of a five-persona audit (SMB owner evaluating the visibility
agency · founder hiring the studio · open-source builder · video follower ·
HR and compliance). The audit's finding, in one sentence: the site could prove
competence and could not be bought from, and it sorted visitors by what it
contained rather than by who they were.

Everything below is measured, not asserted. `after` = this branch served on
:4321; the legacy pixel diff compares against a build of `main` (`34c4a5b`)
served on :4322 by the same instrument.

---

## Gate tallies on the final build

| Gate | Result |
|---|---|
| `tsc --noEmit` | clean |
| `next build` | clean, 41 static pages |
| `verify-seo` | **17/18 PASS · 1 UNPROVEN** (denylist secret, known and unchanged) |
| `verify-visual` | **21/21 PASS** |
| `verify-chrome` | **18/18 PASS** |
| `verify-tokens` | **5/5 PASS** |
| `verify-fixtures` | **19/19 PASS** |
| `verify-ask --offline` | **24/25 PASS · 1 UNPROVEN** (same denylist secret) |
| `verify-ask --live` | **NOT RUN** — needs a real key, unchanged from wave 2 |
| Legacy parity vs `main` | **0 px** across `/primer` `/manuscript` `/workshop` `/watch` |

`verify-seo` gained check 17 and `verify-visual` gained four assertions this
wave; both are described below. Frame rate held at 57.1 fps at 1440 and
59.9 fps at 375 with every layer on, and reduced motion still runs zero
animations.

## What shipped

**A services path.** `/work-with-me` plus `/work-with-me/get-found` and
`/work-with-me/build-a-system`, from a new typed `offers` collection. The
budget bands, the delivering entity and the enquiry type each have one source:
the bands are read from `lib/contact.ts`, so a page cannot print a range the
enquiry form will not accept. JSON-LD emits `Service` with the delivering
organisation as `provider`; it deliberately does **not** emit `Offer` with a
`priceSpecification`, because turning an orientation band into a structured
price would publish a number this site has no source for.

**A three-door row under the hero**, sorting by who the visitor is. Both hero
calls to action demoted to ghost buttons, so the row is the page's primary
sort rather than the third thing competing for it.

**`/links` reskinned at the same URL.** It was the bridge from the social
accounts and it landed on the retired gold skin, with no route into the work.
It now carries the Direction B skin, the two doors, all seven profiles read
from the same `sameAs` array the Person node publishes, and a way through to
`/watch`. It left the deferred-legacy list in both batteries, so every check
now applies to it strictly. The other four archived routes are untouched and
still diff at zero pixels.

**Work cards carry their repository.** A direct GitHub link with the star count
beside it, read from the same dated `repo.stars` snapshot the homepage readout
sums. Previously a builder needed three clicks to reach the source the card was
already boasting about.

**`/now` describes research projects.** Owner directive, 2026-08-12: the page
must not describe the current work as rebuilding this site. James's words were
"currently working on a number of different research projects at this time". He
named no projects, so none are named; the earlier copy naming the rebuild, the
platform in production and the collector heading toward release came out rather
than being reworded. Title, answer capsule, summary and `dateModified` all
follow. The research line is the page's headline entry and the open-items work
log sits below it.

**Pending marks moved, not deleted.** `lib/content/markdown.ts` gained a render
mode: buyer pages state each absence in the third person, builder and theory
pages keep the owner-facing question inline, and the full second-person
register renders once on `/now` under **Open items**, derived from the same
bodies the pages render. The photo placeholder left the sitewide footer and
stays on `/about`.

## Screenshots

| File | What it shows |
|---|---|
| `home-1440-doors.png`, `home-1440-full.png` | the door row in place under the hero |
| `work-with-me-1440.png`, `work-with-me-375.png` | the hub at both widths |
| `offer-get-found-1440.png`, `offer-get-found-375.png` | the visibility engagement |
| `offer-build-a-system-1440.png`, `offer-build-a-system-375.png` | the studio engagement |
| `links-1440.png`, `links-375.png` | the reskinned bridge at its original URL |
| `now-open-items-1440.png`, `now-1440.png`, `now-375.png` | the research-projects entry and the Open items register below it |
| `about-1440.png`, `contact-1440.png` | buyer pages with third-person absences |
| `primer-legacy-1440.png`, `primer-main-1440.png` | the legacy parity pair |

## The two new gates

**`verify-seo` check 17 — pending-mark placement.** It runs in both directions,
because a one-directional version passes the day somebody deletes the register:
no buyer route may render a second-person mark, **and** at least one builder
route must still render one, **and** `/now` must carry the block with real
items in it. Deleting the marks to satisfy the first clause fails the other two.

**`verify-visual`** replaced its single "gaps render visibly" assertion with
three: `/about` shows third-person notes and zero owner-facing marks,
`/theories/architect-loop` keeps its inline question, and `/now` lists the
register. It also asserts the door row is three real links that each name a
visitor, and that every work card's repository link resolves to `github.com`
with a star count beside it.

## What is not claimed

- No outcome figure from a client engagement appears on either offer page. The
  pages say so in the third person rather than reaching for a number.
- The client-name denylist gate is **UNPROVEN**, not passing. It needs the
  `CLIENT_DENYLIST` secret, which does not exist yet (geo-seo-spec §9-C). Under
  `CI=true` it exits nonzero, exactly as it did before this wave.
- `verify-ask --live` was **NOT RUN**. Unchanged from wave 2.
- Proof-link liveness (§8.9) is still unimplemented and still not claimed.
- `/contact` moved from static to server-rendered so the enquiry type can be
  preselected from the URL without taking the form out of the server response.
  That is a rendering-mode change, and it is stated rather than buried.
