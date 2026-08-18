# SITE BRIEF — jamesbrady.org rebuild

Status: DRAFT v2 (2026-08-11) — v1 audited by three independent lenses (buyer/credibility, GEO/SEO, feasibility/security). All accepted findings merged below. Locks as the contract when James approves.

## Identity

Hero: **"James Brady builds AI systems that show their work."**
Support line: "One person, operating at fleet scale — documenting what actually works."
Direction: Synthesis — portfolio-first structure and plain-language proof, carrying forward bold visual ambition (manifold background objects, motion, artifact pages) done cleanly.

Register rules (hard):
- No esoteric/mystical language in copy, component names, or UI: no "alchemist" framing in new surfaces, no sacred-geometry naming (metatron/vesica), no "neural link" / "semantic input" sci-fi chrome. The site proves competence; it never performs mystique.
- Every public claim verifiable. **Every number rendered on the site is computed from the content source at build/render time — never hand-typed.** (The old site hardcoded "298 Tools cataloged"; the real computed count was 36. This class of defect is banned.)

## What the site must do, ranked

1. Prove in 10 seconds that James builds real systems — show, don't claim.
2. Explain each project so a smart non-technical person gets it.
3. Publish his theories as serious, citable work.
4. Let visitors ask the site anything — the chatbot is a front door (never a single point of failure: the site is fully usable with chat down or JS off).
5. Convert strong-fit visitors into contact (existing Utlyze lead gateway).
6. Get cited by AI answer engines and rank in search — GEO/SEO in the skeleton.
7. Be, itself, the best portfolio piece.

## Audiences, ranked

1. Founders and operators sizing James up
2. Collaborators and client prospects
3. Technical builders
4. Media and speaking
5. AI crawlers and answer engines

## Page map (v2 — URLs preserved)

| Route | Job |
|---|---|
| `/` | Hero line + **proof strip** (contract below) + doors weighted Work first, then Theories, then Ask |
| `/work` | Portfolio index; filters: Products · Open source · Client work · Experiments. Open-source entries carry live repo signals (stars, last commit) |
| `/work/[slug]` | Case study template: problem → what I built → how it works in plain words → **proof block** → stack. Prose must be substantively different from the project README (SEO constraint, not style preference) |
| `/theories` | Index with maturity states shown as prominently as titles |
| `/theories/[slug]` | Question-shaped H1 → answer capsule → full theory as static HTML → state → artifact link |
| `/lab` | Interactive artifacts; each ships with a written explanation page (or is noindexed) |
| `/primer`, `/manuscript`, `/workshop` | **Stay at current URLs.** Reskinned in place under the new design with a dated "Archived [date]" badge. No moves, no redirects needed |
| `/learn` | New hub page that introduces and links to the three archived volumes |
| `/about` | The human story + **the reliability answer**: how one person at fleet scale checks work before it ships (verification doctrine in plain words). Names which entity delivers what (James / New Reward / Utlyze) |
| `/contact` | Strong-fit qualification + lead gateway |
| `/now` | Single hand-edited file, updated monthly, visible "updated N weeks ago" indicator; staleness past 6 weeks is a defect. No auto-generation from GitHub activity |
| Ask | Chat dock on every page |

## Proof rules (new in v2)

- **Proof strip contract (`/`):** 3–4 slots; each slot = system name + one outcome number (computed or sourced, with method available) + one live-or-redacted artifact link. No aggregate vanity counts.
- **Case-study proof block:** falsifiable specifics required — exact stack, exact timeframe, quantitative deltas (exact or ranged) with stated methodology; live links or redacted screenshots; a 60–90s "watch it run" screen recording for flagship studies.
- **Anonymization methodology, disclosed on-page:** "Client name and identifying details withheld per agreement; screenshots and metrics otherwise unaltered." Anonymized ≠ vague.
- **Standing process:** at every project close, ask the client for case-study/testimonial clearance — named proof accrues over time.
- **Testimonials:** collected and shown where cleared; never fabricated, never paraphrased without approval.
- Theories at "named-only" maturity are excluded from home/nav discovery surfaces until at least "sketched."

## Theories spine

Flagship: Universal Question Geometry (OfOne). Then: Question-Answer Dynamics, Council Geometry, Architect Loop, THE PAPER (five-layer war-strategy OS), Movement Economy, Function-First Orchestration, UFAT (inclusion under review), Latent Emotions in LLMs (working demo exists — ManifoldScene/ChatPanel; theory text in development via interview; **full text must land as static HTML on its page before the theory counts as "developed" — the interview is a drafting tool, not a publishing destination**).

## Chatbot — two separate surfaces (v2 clarification)

**1. The Ask dock (sitewide).** New build on the Grok (xAI) API — owner ruling 2026-08-11, superseding the earlier Claude reference. Grounded only in the structured content source + profile; every answer cites its source page; declines off-topic cleanly; hedges honestly on in-scope-but-uncertain questions instead of guessing. Structured replies enforced via xAI's schema-constrained output mechanism (exact mechanism BUILD-VERIFIED against current xAI docs in the Phase 4 spec). v1 renders text + citations + a consent-gated "reach James" card; the full rich-component registry (project cards, theory cards, comparison tables) is v2.

**2. The `/lab` manifold chat (contained demo).** The existing emotional-manifold experience, hardened: per-session state (the current module-level global state shared across visitors is a bug, not a base), its own rate budget, honest framing. The Grok persona and sci-fi copy are retired; the demo is re-pointed and re-scripted as part of the Latent Emotions artifact.

**Ops (build prerequisites, not follow-ups):**
- Rate limiting with a named store (Vercel KV or Upstash): numeric caps per session and per IP/hour.
- Hard daily token/cost ceiling with automatic circuit breaker → static fallback message.
- Origin checks; honeypot + rate limits on chat-originated leads (reuse existing `lib/contact.ts` pattern).
- PII: chat transcripts containing lead details are not retained beyond delivery to the gateway; retention stated in the privacy note.
- Pre-launch red-team pass against the grounding pack (prompt injection, hallucinated client details, off-topic pulls).
- Lead-gateway failure alerting (uptime check or log-drain alert); failures currently vanish into ephemeral logs.
- `.env.example` stays exhaustive; missing required secrets fail the deploy loudly, never fall back silently.

## GEO/SEO architecture (v2 — expanded)

- **Canonical discipline:** every page emits a self-referencing canonical, enforced by template helper + a build-time test that renders each route and asserts `canonical === own URL`. (The live site today canonicalizes every subpage to the homepage — verified 2026-08-11; hotfix PR prepared.)
- One structured content source (typed, versioned, in-repo — no CMS, no DB) feeds: pages, JSON-LD, `llms.txt`, `ai-manifest.json`, sitemap with real per-URL `lastModified`, RSS, OG images. `llms.txt` + `ai-manifest.json` are build-generated, never hand-edited (both are stale today).
- **Entity graph:** one canonical Person node (`@id: https://www.jamesbrady.org/#person`) with full `sameAs` (GitHub CryptoJym, LinkedIn jamesbrady1, X h3roai, TikTok h3ro.ai, Bluesky utlyzeit, YouTube), `worksFor` → Organization nodes for Utlyze and New Reward. Every page references the `@id` — never a bespoke Person copy.
- **Theories markup:** `CreativeWork`/`Article` + nested `Claim`/`abstract`, `creativeWorkStatus` carrying the maturity ladder, real `datePublished`/`dateModified` that advance with state. Not `ScholarlyArticle`.
- **Answer capsules (house rule):** capsule sits under a question-shaped heading (or the H1 is the question), self-contained and pronoun-free, backed by `FAQPage`/`DefinedTerm` markup.
- **OG/social:** per-page `openGraph`/`twitter` title+description+image required at template level. v1: static per-template images; v2: dynamic generation.
- No important content lives only in chat. Full theory/project text is crawlable static HTML.

## Design system

- Tokens (color, type scale, spacing, radius, motion) → CSS variables → components → templates — **scoped to what v1 templates actually need**, grown as templates demand.
- **Manifold: three tiers** (ruled 2026-08-11 after James approved the animated field). Tier 1: static SVG — the no-JS and reduced-motion baseline, always present. Tier 2: the fluid canvas animator (same parametric family, token-driven colors, hidden-tab/offscreen suspend) — SHIPS AT LAUNCH; prototype proven in the comp. Tier 3: the WebGL/shader field (`EntanglementField` heritage) stays the gated v2 upgrade: static fallback, visibility-gated frameloop, measured mobile Lighthouse pass, draw-call refactor (instancing — current ~70 animated Line components). Keep the existing `next/dynamic` + `ssr:false` lazy-mount pattern.
- WCAG 2.2 AA. 60fps budget, zero CLS, `prefers-reduced-motion` honored everywhere.

## v1 / v2 cut

**v1 ships:** content pipeline → page skeleton (`/`, `/work`, `/work/[slug]`, `/theories`, `/theories/[slug]`, `/about`, `/contact`, `/now`, `/learn` hub; volumes reskinned in place) → tokens as needed → Ask dock (grounded, cited, rate-limited, simple rendering + reach-James card) → contact with failure alerting → hardened `/lab` manifold chat → static per-template OG images → generated llms.txt/ai-manifest/sitemap/RSS/JSON-LD.

**v2 later:** sitewide manifold background chrome (after gates), rich JSON-to-component chat rendering, dynamic per-page OG images, quarterly dead-link check for the frozen catalog, additional `/lab` artifacts (WebGL radar port), testimonial collection as clearances land.

## Decisions log

- 2026-08-11 — Preserve July pivot on its branch (verified on origin as 5096976); build from main. — James
- 2026-08-11 — Keep and reframe old content; volumes frozen as dated archive **at current URLs**. — James (URL preservation per GEO audit)
- 2026-08-11 — Identity: Synthesis. — James
- 2026-08-11 — Client work anonymized by default; named only with explicit clearance. — James
- 2026-08-11 — Hero: "builds AI systems that show their work" + fleet-scale support. — James
- 2026-08-11 — Latent Emotions developed via in-chat interview. — James
- 2026-08-11 — v1 audit merged from three lenses → this v2. — pending James's lock
- 2026-08-11 — a background-screening SaaS client (name withheld) = client work (New Reward provided SEO/GEO); anonymized-client policy applies. Client name redacted from this public repository 2026-08-11 under the same policy. — James
- 2026-08-11 — Royal RWA excluded entirely ("not mine to claim"). — James
- 2026-08-11 — Of One family told as one thesis-in-progress case study (real apps + honestly-labeled staked ground). — James
- 2026-08-11 — /lab approved: manifold chat, wrath-shield-v3 (after framing/claims fix), games + playful builds. VisionClaw and trading systems stay off the site. — James
- 2026-08-11 — Hotfix PR #2 (canonicals + honest stat) merged to main at James's approval; merge commit c2cfb5d. LIVE-VERIFIED same day: www.jamesbrady.org/primer canonical self-references and homepage serves the computed 36. — James
- 2026-08-11 — Apocaltips GitHub account is another user's; excluded from everything, never attributed. — James
- 2026-08-11 — Design direction: B "Operating Room" (dark live-console, self-auditing readout, luminous manifold). Grafts carried from A (provenance nameplate device) and C (counts never animate; serif for theories). — James
- 2026-08-11 — Location shown on site: Lehi, UT. — James
- 2026-08-18 — Primary CTAs (Start a build enquiry, skip link) use cream on deep green, 6.93:1. Dark ink on neon phosphor is off buttons. Issue #17.
- 2026-08-18 — This visit plate, pokeable Lab lens, Ask-off is mailto, offer CTA under H1, Contact in primary nav, home is doors + proof not a second /work. Issues #13–#15. — James: “go for some big stuff”
- 2026-08-17 — First visit reimagined as a front door: who you are, two shops, four visitor doors in the hero, readout as a strip after the choice. Primary nav is Work with me / Work / About / Now. Theories, Lab, Learn, Contact stay in More and in the footer. Honesty gates (computed numbers, four doors, rail count) stay. — James: “reimagine the entire thing your way”
- 2026-08-11 — Direction B audited by three independent lenses (credibility / craft / accessibility); 25-item punch list consolidated (docs/design/direction-b-v2-punchlist.md) and applied; v2 comp verified (0 contrast fails across 32 pairs, 0 dead links, 0 overflow at 5 widths, counter mechanism intact). Phase 3 complete. Build-gates carried into Phase 4/5: every proof link resolves externally; all numbers computed at build; real photo asset; mobile dock behavior; light/print case-study path.

- 2026-08-11 — adhd-founder.com: James does not recognize or remember building it. Excluded from the site entirely; ownership investigation spun off separately. — James

- 2026-08-11 — Ask dock BUILT (wave 2), fail-closed. BUILD-VERIFY pass against the live xAI docs is recorded in docs/specs/chatbot-spec.md: model `grok-4.5`, OpenAI-shaped `response_format` json_schema with `strict: true`, **automatic prefix caching with no `cache_control` parameter** (the spec's Anthropic-shaped marker is not sent; the stable-prefix discipline is what earns the cache and is gated), cached tokens at `usage.prompt_tokens_details.cached_tokens`, prices 2.00 / 0.30 / 6.00 per MTok under a 200K prompt. Three technical calls made by the lead agent, in scope: (i) the route serves ONLY with an xAI key AND a shared limit store present, with no in-memory fallback of any kind — absent store means `not_configured`, 503, and the dock keeps its wave-1 terms-and-mailto behaviour; (ii) whether the assistant exists is read from the environment by the server layout at BUILD and handed to the dock as a boolean, so no request leaves the browser on page load and the first paint is already correct — the consequence is that adding the env vars takes effect on the next deploy, not immediately; (iii) the origin check is the ordinary same-origin test (Origin against the request's own host) rather than an environment-switched allowlist, so local, preview and production all behave the same and there is no knob that could widen it on the deployment that matters. The six red-team categories are `verify-ask --live`, which needs a real key: **NOT_RUN** at time of the PR.
- 2026-08-11 — "h3ro" dropped from the identity register: no h3ro branding and no h3ro.ai domain references anywhere on the site. His live social accounts (X @h3roai, TikTok @h3ro.ai) may remain as plain profile links in sameAs/footer unless James cuts those too. — James
- 2026-08-11 — Ask dock provider: Grok (xAI API), per owner choice. Architecture unchanged (grounding pack, schema-enforced JSON replies, rate limits, cost ceiling, red-team gate); Claude reference implementation superseded. — James
- 2026-08-11 — Design-system spec conflict rulings (technical calls, lead agent): (B) `--sig` gets a documented FOURTH role — interaction feedback (focus rings, hover affordances) — alongside status/primary-action/computed-value; (C) theories maturity vocabulary is the brief's four rungs — named / sketched / developed / live-demo — with "paused" as an orthogonal status flag; homepage theory counts compute from that field; (D) the comp's remaining non-token colors become tokens at build (mask, scrim, button-ink) so the no-hex lint can pass; (F) manifold three-tier ruling above; (G) `/links` and `/watch` KEEP their URLs and get reskinned (link equity; watch freezes with the archive unless James resumes video); `/now` joins the footer nav + console rail; Contact becomes the real `/contact` route; (H) the provenance nameplate is variadic — canonical triple SOURCE/METHOD/BUILT on hero + footer, slot variant SOURCE/LAST-ACTIVE/GO. Comp's dead load-choreography comment bug found by the spec pass and fixed same day (verified: `.rise` animates, d4 before d5).

- 2026-08-11 — THE PAPER: intro-only theory page; the paper itself stays private (honest "unpublished" state shown). — James
- 2026-08-11 — problem-solving-system gets an MIT license; commit staged as a PR for James's merge approval. — James
- 2026-08-11 — GEO spec conflict rulings (lead agent): (A) www.jamesbrady.org is canonical everywhere — feed, JSON-LD Person.url, ai-manifest normalize to www; (B) robots keeps `Disallow: /api/` but adds an explicit `Allow: /api/catalog` (deliberate machine-readable endpoint, advertised in llms.txt); (C) client-name denylist gate is FAIL-CLOSED, materialized from a CLIENT_DENYLIST secret created at Phase-5 setup with James's approval — gate output prints line+hash, never the term; (D) /links and /watch appear in sitemap + llms.txt and their content summaries join the grounding pack; (E) YouTube channel-ID URL stands (verified beats pretty); (F) dateModified gets a git-mtime cross-check — warn in v1, fail in v2. h3ro gate nuance: blocks h3ro-as-brand copy and the h3ro.ai domain; ALLOWS github.com/h3ro-dev/* and h3ro-dev.github.io/* (org infrastructure URLs are facts) plus the two social profile URLs (x.com/h3roai, tiktok.com/@h3ro.ai).

- 2026-08-12 — /now describes current work as research projects, not the site rebuild. — James

- 2026-08-12 — Vuplicity listed as a named Work-with-me option (owner ruling; supersedes anonymized treatment for the offer surface; denylist updated same day). — James

- 2026-08-12 — Scope of the ruling above, as built and lead-trimmed: the name renders on exactly four routes — /work-with-me/background-screening (the offer), /work-with-me (hub card), / and /links (door rows) — plus /now's open-items register. The anonymized case study does NOT name or link Vuplicity (a named offer is not case-study clearance, and the lead removed the lane's cross-reference to keep the inference door shut). Every published fact about Vuplicity comes from vuplicity.com (2026-08-12); agency-injected JSON-LD on that site was deliberately not used; James's role there renders as third-person absence pending his word.

## Open items

- James locks v2 (or marks it up).
- Wave-0 hotfix PR (canonicals + honest stat) — awaiting James's merge approval.
- Latent-emotions interview answers → theory page draft.
- Phase 3: three design directions under the register rules above.
