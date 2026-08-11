# GEO/SEO implementation spec — jamesbrady.org rebuild

Status: DRAFT for Phase 4 build. Authorities in order: (1) `SITE-BRIEF.md`
§ "GEO/SEO architecture (v2 — expanded)" + page map + decisions log; (2)
`docs/specs/design-system-spec.md` §4 (route inventory) and §6 (number honesty);
(3) the shipped implementation on `main` (`app/layout.tsx`, `app/sitemap.ts`,
`app/robots.ts`, `app/feed.xml/route.ts`, `lib/catalog.ts`). Where they disagree,
§9 names the conflict — do not resolve a §9 item by picking the easier read.

Stack today: Next 16.2.10 App Router, React 19, TypeScript, Tailwind 3.4.1.
Deploy target Vercel. No test runner is installed — §8 names what to add.
`metadataBase` is already `https://www.jamesbrady.org`; per-page self-canonicals
shipped in PR #2 (`dc7e27d`) as relative `alternates.canonical` strings.

---

## 1. Content collections — the one source

Location `content/<collection>/<slug>.mdx`; loaders in `lib/content/`. MDX because
theory and case-study bodies must publish as long-form static HTML (§7). Frontmatter
is validated at build by a schema module (`zod` recommended; any validator is fine so
long as **an invalid or missing required field fails the build**, never warns).

Collections: `work` · `theories` · `lab` · `learn` · `now` (exactly one entry).

**Base fields — every entry, every collection:**

| Field | Type | Feeds |
|---|---|---|
| `title` | string | H1, `<title>`, OG, JSON-LD `name`, llms.txt, RSS |
| `slug` | string, kebab, immutable | URL, canonical, `@id`, sitemap |
| `answerCapsule` | string, 1–3 sentences | capsule block, `DefinedTerm.description`, llms.txt, grounding pack, meta description fallback |
| `summary` | string ≤ 160 chars | `<meta name="description">`, OG/twitter description, RSS `<description>` |
| `datePublished` | ISO date | JSON-LD, RSS `pubDate` |
| `dateModified` | ISO date, ≥ `datePublished` | JSON-LD, **sitemap `lastmod`**, "updated N ago" |
| `entities` | `EntityRef[]` (`"person:james" \| "org:utlyze" \| "org:new-reward"`) | JSON-LD `author`/`publisher`/`worksFor` edges — refs only, never inline copies |
| `proof` | `ProofSource[]` | proof block, `citation`, external-link gate (§8.9) |
| `og` | `{ image: string; imageAlt: string; title?: string; description?: string }` | `openGraph` + `twitter`; `title`/`description` default to `title`/`summary` |
| `noindex` | boolean, default `false` | `robots` meta, excluded from sitemap + llms.txt |

`ProofSource = { label: string; url?: string; artifact?: string; method: string; capturedAt: ISO date; redacted?: boolean }`.
`method` is required — it is the METHOD line of the provenance nameplate
(design-system-spec §6.2). A proof entry with neither `url` nor `artifact` fails
validation: unlinkable proof is not proof.

**Per-collection additions:**

- `work`: `categories: ("products"|"open-source"|"client-work"|"experiments")[]` (drives
  the `data-cat` filter attribute) · `stack: string[]` · `timeframe: {start, end?}` ·
  `deltas: {metric, before?, after?, range?, method, timeframe}[]` ·
  `repo?: {owner, name, public: boolean}` · `anonymized: boolean` ·
  `clearance?: {clientName, grantedAt, scope}` — **the only way a client name may render**
  (brief: anonymized by default, named only with explicit clearance).
- `theories`: `maturity: "named"|"sketched"|"developed"|"live-demo"` ·
  `paused: boolean` (orthogonal status flag, per the 2026-08-11 ruling (C)) ·
  `claim: string` (the falsifiable proposition → JSON-LD `Claim`) ·
  `abstract: string` · `artifactUrl?: string` · `history: {date, state, note}[]`.
  **Gate:** `maturity: "developed"` requires a non-empty MDX body ≥ 600 words — the
  brief's rule that the full text must land as static HTML before a theory counts as
  developed, enforced instead of trusted.
- `lab`: `explanationUrl?: string` — **if absent, `noindex` is forced to `true` by the
  loader**, not left to the author (brief: demos ship with a written explanation or are
  noindexed) · `state: "live"|"paused"|"dormant"`.
- `learn`: `archivedDate: ISO date` · `volumeRoute: "/primer"|"/manuscript"|"/workshop"`.
- `now`: `updated: ISO date` · body. Exactly one file; a second fails the build.

Derived, never authored: counts, tallies, `lastmod`, "updated N weeks ago", stars,
last-commit. Every consumer imports the same typed module — the `lib/catalog.ts`
precedent (`catalog.reduce((n,c) => n + c.tools.length, 0)`), not a parallel copy.

**One source → seven outputs:** pages · JSON-LD · `llms.txt` · `ai-manifest.json` ·
`sitemap.xml` · `feed.xml` · the Ask-dock grounding pack (`docs/specs/chatbot-spec.md`
§ Request construction). Adding an eighth consumer means importing the module, never
re-typing the data.

---

## 2. JSON-LD emission

One builder module, `lib/schema/`. Every page emits a single
`<script type="application/ld+json">` containing `{"@context":"https://schema.org",
"@graph":[…]}`, serialized with `.replace(/</g,"\\u003c")` (the existing repo pattern).

**2.1 The identity nodes** — defined once in `lib/schema/entities.ts`:

- `Person`, `@id: https://www.jamesbrady.org/#person`. `name` "James Brady";
  `url` `https://www.jamesbrady.org/`; `homeLocation` Lehi, UT; `email`;
  `worksFor: [{"@id":…/#utlyze"},{"@id":…/#new-reward"}]`;
  `sameAs` (exact list, ordered, no additions without a ruling):
  `https://github.com/CryptoJym` · `https://www.linkedin.com/in/jamesbrady1/` ·
  `https://x.com/h3roai` · `https://www.tiktok.com/@h3ro.ai` ·
  `https://bsky.app/profile/utlyzeit.bsky.social` ·
  `https://www.youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA`.
  The X and TikTok entries are **plain profile links only** — permitted by the
  2026-08-11 ruling. No `h3ro` branding, no `h3ro.ai` domain, anywhere (§8.7).
  `jobTitle` must not be "AI Alchemist" (register rule; current value on `/`, `/about`,
  `/contact` violates it).
- `Organization`, `@id: …/#utlyze` (studio) and `@id: …/#new-reward` (agency), each with
  `name`, `url`, `description`.

**Ruling (implementation of "never a bespoke Person copy"):** the full Person node is
emitted into every page's `@graph` from the single builder, so it is byte-identical on
every URL and any page crawls standalone. What is banned is a second, differently-shaped
Person object. Page-level nodes point at it with `{"@id": "…/#person"}` — never an
inline `{"@type":"Person", name:…}` literal. Lint in §8.3.

**2.2 Per-template types:**

| Route | Graph nodes |
|---|---|
| `/` | `WebSite` (`@id` `…/#website`, `publisher` → person ref) + Person + both Orgs |
| `/about` | `ProfilePage` with `mainEntity` → person ref; `about` → person ref |
| `/work` | `CollectionPage` + `ItemList` of work entries (`url`, `position`) |
| `/work/[slug]` | `CreativeWork` (`SoftwareSourceCode` when `repo.public === true`, with `codeRepository`), `author` → person ref, `publisher` → the delivering org ref, `citation` ← `proof[]`, `datePublished`/`dateModified` |
| `/theories` | `CollectionPage` + `ItemList`, filtered to `maturity !== "named"` |
| `/theories/[slug]` | `Article` **(never `ScholarlyArticle`)** + `abstract` + nested `Claim` (`@type:"Claim", text: claim`) + `creativeWorkStatus: maturity` (+ `"paused"` appended when `paused`) + `DefinedTerm` for the answer capsule + `isPartOf` → `DefinedTermSet` `…/#theory-glossary` |
| `/lab`, `/lab/[slug]` | `CollectionPage`; per-artifact `CreativeWork` + `WebApplication` where interactive. Omitted entirely when `noindex` |
| `/learn` | `CollectionPage` + `ItemList` of the three volumes |
| `/primer`,`/manuscript`,`/workshop` | `Article` + `archivedAt`/`temporalCoverage` + the archived date |
| `/contact` | `ContactPage`, `mainEntity` → person ref |
| `/now` | `WebPage` + `dateModified` |
| `/links`, `/watch` | `ProfilePage` / `CollectionPage`; both keep their URLs (ruling G) |

**2.3 FAQPage vs DefinedTerm.** Answer capsules bind to `DefinedTerm` by default —
Google restricts FAQ rich results, and a one-capsule page is not a FAQ. `FAQPage` is
used **only** where a route genuinely renders a question-and-answer block: `/about`
(the reliability answer) and `/contact` (qualification questions). A template may not
emit both on the same URL.

---

## 3. Canonical and metadata rules

1. **Host is `https://www.jamesbrady.org`, no exceptions.** `metadataBase` already sets
   it. `feed.xml`, `ai-manifest.json` and the `/about` JSON-LD currently emit non-www —
   fix as part of this work (§9-A).
2. **Trailing slash policy: off.** Add `trailingSlash: false` to `next.config.ts`
   explicitly rather than relying on the default; every canonical, sitemap URL, llms.txt
   link and JSON-LD `url` is written without a trailing slash (the site root `/` excepted).
3. **Self-referencing canonical on every route**, via a shared helper so it cannot be
   forgotten: `pageMetadata({ path, title, description, og })` in `lib/seo/metadata.ts`
   returns a `Metadata` with `alternates.canonical: path` (relative — resolved against
   `metadataBase`, matching the PR #2 pattern), `openGraph` and `twitter`. Templates call
   the helper; a route that hand-rolls `export const metadata` is a review reject.
   Dynamic routes build `path` from `slug` in `generateMetadata`.
4. **Per-page OG/twitter required at template level:** `title`, `description`, `image`,
   `imageAlt` on every indexable route. v1 = one static image per template under
   `public/og/<template>.png` (1200×630), chosen by the template not the entry; v2 =
   per-entry dynamic generation. `twitter.card: "summary_large_image"`.
5. **No URL moves.** `/primer`, `/manuscript`, `/workshop`, `/links`, `/watch` keep their
   current URLs and gain only a reskin + archived badge. No redirects are added; a
   redirect appearing for any of these five is a defect.
6. `robots` meta: `index, follow` sitewide except entries with `noindex: true` and
   `/api/*`.

---

## 4. Answer-capsule house rule

Applies to every `work`, `theory`, `lab` and `learn` entry.

1. The capsule sits directly under a **question-shaped heading**. On `/theories/[slug]`
   the **H1 itself is the question** ("Why do questions have geometry?"), and the theory
   name renders as the eyebrow above it.
2. **First sentence is self-contained and pronoun-free** — it must survive being quoted
   alone by an answer engine. No "it", "this", "the system", "as described above". The
   entity being defined is named in the first five words.
3. Length 40–80 words, plain language, no marketing adjectives, no unresolved jargon.
4. Markup binding: `DefinedTerm` (`name` = the concept, `description` = the capsule,
   `termCode` = slug, `inDefinedTermSet` = the collection's glossary `@id`); `FAQPage`
   only under the §2.3 restriction.
5. The capsule is rendered as real prose in the page body — never `visibility:hidden`,
   never markup-only. Markup and visible text must match verbatim; §8.4 diffs them.

---

## 5. Generated files — never hand-edited

All four are produced from the collections at build. `public/llms.txt` and
`public/.well-known/ai-manifest.json` (both stale today: "AI Alchemist" naming,
`last_updated: 2025-03-21`, five-page map, non-www URLs) are **deleted** and replaced by
route handlers — a file in `public/` shadows a route, so leaving them is how they go
stale again. This follows the existing `app/feed.xml/route.ts` precedent.

| Artifact | Implementation |
|---|---|
| `/llms.txt` | `app/llms.txt/route.ts`, `dynamic = "force-static"`, `text/plain` |
| `/.well-known/ai-manifest.json` | `app/.well-known/ai-manifest.json/route.ts`, `force-static`, `application/json` |
| `/sitemap.xml` | `app/sitemap.ts` (rewrite; currently 8 hand-typed URLs with no `lastModified`) |
| `/feed.xml` | `app/feed.xml/route.ts` (rewrite; currently 3 hardcoded items) |

**5.1 `llms.txt` structure** (llmstxt.org shape):
```
# James Brady
> <one-line site descriptor, from lib/seo/site.ts>

## Work
- [<title>](https://www.jamesbrady.org/work/<slug>): <answerCapsule>
## Theories
- [<title>](…/theories/<slug>): <answerCapsule>  — maturity: <rung>[, paused]
## Lab
## Learn
## Site
- [About](…/about): … | [Now](…/now): updated <ISO> | [Contact](…/contact): …
## Machine-readable
- /feed.xml · /.well-known/ai-manifest.json · /sitemap.xml
## Terms
Content © James Brady. Cite the source URL. Figures are computed at build; method is stated on-page.
```
Every indexable route appears exactly once (§8.5). `noindex` entries are excluded.

**5.2 `ai-manifest.json`:** `{ name, description, url, canonicalHost, person: {"@id"},
organizations[], generatedAt (build ISO), contentVersion (git short SHA), routes[]
({path, title, capsule, dateModified, collection}), collections[] ({name, count}),
machineReadable[], citationPolicy }`. `generatedAt` and `contentVersion` come from the
build, never typed. No `last_updated` string literal.

**5.3 `sitemap.xml`:** every indexable route, with a **real per-URL `lastModified`**:
entry routes → `dateModified`; index routes (`/work`, `/theories`, `/lab`, `/learn`) →
`max(dateModified)` of their children; hand-built TSX routes (`/`, `/about`, `/contact`,
`/links`, `/watch`, `/primer`, `/manuscript`, `/workshop`) → git last-commit date of the
route's own files; `/now` → its `updated` field. `changeFrequency`/`priority` are
dropped — they are ignored by major engines and invite hand-typed drift. CI must check
out with full history (`fetch-depth: 0`), or git dates collapse to the clone date.

**5.4 `feed.xml`:** items = all `work` + `theories` entries with
`maturity !== "named"`, sorted by `dateModified` desc, capped at 50. Per item: `title`,
`link` (www, canonical), `guid isPermaLink="true"`, `pubDate` (RFC-822 from
`datePublished`), `description` (the `answerCapsule`, XML-escaped), `category`.
Channel `lastBuildDate` = max item `dateModified`, **not** `new Date()` — a feed whose
build date moves without content moving trains aggregators to ignore it.

---

## 6. `/now` freshness

- Single hand-edited entry, `content/now/now.mdx`, `updated` field. No auto-generation
  from GitHub activity (brief).
- Page renders a visible "Updated N weeks ago" computed from `updated` — never typed —
  next to a status dot with its visible word (design-system-spec §3).
- `dateModified` = `updated` in the `WebPage` JSON-LD and in the sitemap.
- **Staleness gate:** `updated` older than 42 days fails the build with the exact age.
  A stale `/now` is a defect, not a warning. Local escape hatch `ALLOW_STALE_NOW=1` for
  unrelated hotfixes; it is not available in CI.
- `/now` appears in the footer nav and the console rail (ruling G).

---

## 7. Crawlability rules

1. **Nothing important is chat-only.** Full theory text and full case-study text render
   as static HTML in the server response. The Ask dock is a second door onto content
   that already exists at a URL — never the only door.
2. **Server-rendered by default.** No `ssr:false` on any element that carries indexable
   prose. `next/dynamic` + `ssr:false` stays confined to the manifold/canvas visuals.
3. **`/lab` demos** carry a written explanation page or are `noindex` — enforced by the
   loader (§1), not by author discipline.
4. **`/work` prose is substantively different from the project README** (SEO constraint,
   not style preference). Operationalized: for any entry with `repo.public === true`, the
   build fetches the README once, and any shared verbatim run of ≥ 25 consecutive words
   fails the check. Author intent is not evidence; the diff is.
5. One `<h1>` per page; headings descend without skipping; every proof link has
   descriptive anchor text (never "here", "link").
6. `/api/*` stays `Disallow` in robots — but see §9-B, because `llms.txt` and the footer
   currently advertise `/api/catalog` as a machine-readable endpoint.

---

## 8. Verification battery (CI)

One script, `scripts/verify-seo.mjs`, run after `next build` against `next start` on a
local port; plus static greps that need no server. Add `vitest` (or `node --test`) and
wire `npm run verify:seo` into the same CI job as `lint` + `typecheck`. Every check
below **fails the build** — none warn. Route universe = the sitemap plus the static
route list, asserted equal (a route in one and not the other is itself a failure).

| # | Check | Pass condition |
|---|---|---|
| 1 | **Canonical self-reference** | For every route, fetch the rendered HTML and assert exactly one `<link rel="canonical">` and `href === https://www.jamesbrady.org<path>`. The live site canonicalized every subpage to `/` before PR #2 — this is the test that keeps it fixed |
| 2 | **JSON-LD validity** | Exactly one `ld+json` block per page; parses; `@context` present; every `@type` is a real schema.org type (validated against a vendored type list); every `{"@id"}` reference resolves to a node defined in the same graph; no `ScholarlyArticle` anywhere |
| 3 | **One Person node** | Across all pages: every Person object is deep-equal to the canonical node, and carries the `…/#person` `@id`. Any inline Person literal without that `@id` fails |
| 4 | **Capsule integrity** | For each entry, the `DefinedTerm.description` in JSON-LD appears verbatim in the rendered body text; first sentence matches the pronoun-free rule (regex denylist of leading pronouns/deictics) |
| 5 | **llms.txt coverage** | Set of URLs in `/llms.txt` === set of indexable routes. Missing or extra URL fails. Same equality check for `ai-manifest.json` `routes[]` |
| 6 | **Sitemap lastmod nonzero** | Every `<url>` has `<lastmod>`; none equals the build timestamp; none is in the future; index-route lastmod === max of its children |
| 7 | **OG present per page** | `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:image` on every indexable route; each `og:image` resolves 200 and is 1200×630 |
| 8 | **No `h3ro` branding** | *Reconciled 2026-08-11 with `SITE-BRIEF.md` line 126, whose ruling WINS: this row previously said `h3ro-dev.github.io` proof links fail, and the brief allows them.* The gate BLOCKS the retired token used as brand copy and BLOCKS the `h3ro.ai` domain as a destination. It ALLOWS, **URL-anchored only**, `https://x.com/h3roai`, `https://www.tiktok.com/@h3ro.ai`, `https://github.com/h3ro-dev/*` and `https://h3ro-dev.github.io/*` — org infrastructure URLs are facts. A handle is allowed only as the visible label of one of those exact URLs: "h3ro-dev collective" as prose, or a bare `@h3ro.ai` away from its link, FAILS. The allowlist is explicit and lives in the script; a naive grep would fail on the permitted links, so this check must never be "simplified" |
| 9 | **Proof links resolve** | Every `proof[].url` and `artifactUrl` returns < 400 (design-system-spec §7.10 BUILD-GATE). Redacted artifacts are exempt but must set `redacted: true` |
| 10 | **Client-name denylist** | No term in the denylist appears in any generated artifact (`llms.txt`, `ai-manifest.json`, `sitemap.xml`, `feed.xml`, the grounding pack, rendered HTML, OG alt text). Denylist file `.seo-denylist.txt`, one term per line, **gitignored**. Fails closed when absent (§9-C). **The gate prints file + line number + a hash of the match, never the matched term** — echoing a client name into a public CI log is the exact harm the gate exists to prevent. A name leaves the denylist only when the work entry carries a `clearance` record |
| 11 | **Register rule** | No "alchemist", "alchemy", "metatron", "vesica", "neural link", "semantic input" in copy, component names, route output or generated artifacts. Known current violations to clear: `components/AlchemyCanvas.tsx`, the `/api/catalog` title string, `jobTitle: "AI Alchemist"` in three JSON-LD blocks, layout `title.default` and `openGraph.siteName` |
| 12 | **Host discipline** | No `https://jamesbrady.org` (non-www) in any source or generated artifact |

---

## 9. Open conflicts — do not resolve silently

**A. Host split, www vs non-www, live today.** `metadataBase`, `app/robots.ts`,
`app/sitemap.ts` and the PR #2 canonicals use `https://www.jamesbrady.org`.
`app/feed.xml/route.ts` (channel link, item links, atom self-link), the
`/about` JSON-LD `Person.url`, and `public/.well-known/ai-manifest.json` all use bare
`https://jamesbrady.org`. Split-host signals in the feed and the entity graph undercut
the canonicals the hotfix just landed. §3.1 and §8.12 assume **www wins**; that is the
consistent read of the shipped canonicals, but it is a live-surface change and is called
out rather than buried.

**B. `/api/*` is `Disallow`ed while `llms.txt` advertises `/api/catalog`.**
`app/robots.ts` disallows `/api/`; `public/llms.txt` lists `/api/catalog` under
"Machine-Readable Endpoints", `ai-manifest.json` lists it under `capabilities`, and the
footer links to it. Either the catalog endpoint is a machine-readable surface (then it
needs an allow rule or a non-`/api` path) or it is not (then it comes out of llms.txt,
the manifest and the footer). Needs a ruling; §5.1 currently omits it.

**C. A gitignored denylist is absent in CI.** The task requires the client-name denylist
to be gitignored, but a fresh CI checkout then has no file, and a check with no denylist
passes vacuously — fail-open on the one gate that protects client confidentiality.
Spec'd resolution: the gate **fails closed** when the file is missing, and CI
materializes `.seo-denylist.txt` from a repository secret (`CLIENT_DENYLIST`) before the
gate runs. That requires creating the secret; until it exists, CI cannot run check 10.
Flagged, not assumed.

**D. Design-system-spec §8-C is resolved; §8-G partially.** The maturity vocabulary
(named / sketched / developed / live-demo + orthogonal `paused`) is settled by the
2026-08-11 ruling (C) and §1 encodes it. Ruling (G) keeps `/links` and `/watch` and makes
`/contact` a real route — but neither ruling states whether `/links` and `/watch` belong
in `llms.txt` and the grounding pack, or only in the sitemap. §5.1 includes them under
"Site" as the URL-equity-preserving read; a "keep the URL, keep it out of the AI surface"
read is equally available and needs one word from James.

**E. `sameAs` YouTube entry is a channel ID, not a handle.** The brief names "YouTube"
with no handle; the only verified URL in the repo is
`https://www.youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA` (`/about`). §2.1 uses it as-is.
If a vanity handle exists, it should replace this before launch — a channel-ID URL is
correct but weaker as an entity signal.

**F. `dateModified` has no authority when content moves without frontmatter moving.**
Nothing prevents an author editing an MDX body and leaving `dateModified` stale, which
would then propagate a false date into JSON-LD, the sitemap and the feed. Recommended
resolution (not yet ruled): a CI check comparing each entry's `dateModified` against the
git last-commit date of its own file and failing when the file is newer. That makes
frontmatter dates verifiable rather than trusted, at the cost of one extra edit per
content change.
