# Content drafts v1 — jamesbrady.org

Drafted 2026-08-11. Phase-2 copy for `/work`, `/theories`, and `/about`.

**Sources used.** `docs/content-input/portfolio-inventory-2026-08-11.md` (the curated
slate and the hard rules), `docs/content-input/latent-emotions-interview-2026-08-11.md`
(James's own words), `SITE-BRIEF.md` (register rules and the case-study template), and
read-only checks of public GitHub repos and live URLs on 2026-08-11. Every fact below
traces to one of those. Nothing is invented.

**How to read the tags.**

- `[JAMES: ...]` marks a thing only James can supply. A number, a story, a motive, a
  clearance, a yes or no. Never fill one of these in by guessing.
- `PROOF` blocks list what was actually checked and when. Anything unchecked says so.
- Numbers marked `computed at build` must be derived from the content source at render
  time, per the site brief. Do not hand-type them into a template.

**Rules applied to every word below.**

- No client names anywhere. Industries only.
- Royal RWA and Apocaltips appear nowhere.
- OpenClaw is described as operated and extended, never built.
- The Architect Loop is described as a fork of someone else's project, because it is.
- VisionClaw, trading systems, and HydraStream are off the site.
- Plain words. Short sentences. Exact technical names. No hype adjectives.

---

# A. Case studies

Template for every entry, per the site brief:
problem → what I built → how it works in plain words → proof block → stack.

---

## A1. OfOne — a compiler that makes a decision show its work

**Route:** `/work/ofone` · **Filter tags:** Products, Open source

### The problem

Ask an expert a hard question and you get an essay back. The essay reads well. You
cannot check it. You cannot see which facts it rests on, how old those facts are, what
would change the answer, or where a person was supposed to sign off. When the world
moves, the whole essay has to be rewritten, because nobody can tell which parts still
hold.

### What I built

OfOne turns a hard question into a map before it writes a single sentence of answer.
The map is made of typed objects: evidence, claims, unknowns, kill tests, causal edges,
options, triggers, and human gates. A validator program checks the map. Only a map that
passes gets turned into prose. The answer you read is a rendering of the map, the way a
photograph is a rendering of a building. The blueprint stays attached.

Two pieces ship. `ofone-skillchain` is the open method: the skill file, the schemas, the
validator, the adapters, and a live walkthrough site. `of1.ai` is the product front that
teaches the same method as three steps, Prism, Map, and Forge.

### How it works in plain words

You state what is being decided, over what time, at what stakes. That is the charter.
Then you list your evidence, and each piece carries its source, how fresh it is, and how
reliable it is. Claims sit on top of evidence. Anything you do not know becomes a real
object called an unknown, and an unknown is allowed to block the recommendation. Every
strong claim has to name the result that would prove it wrong.

Confidence is low, medium, or high, plus a named reason. Never a made-up percentage.

When a new fact shows up, the map does not get rewritten. The system patches only the
chain of claims, options, and gates that actually depended on the fact that changed, and
it reports what it invalidated.

Four adapters translate the same skeleton into four working languages: strategy and
operations, science and engineering, formal proof, and contested-values questions. Real
problems mix these, so a map can declare a mix instead of pretending one lens fits.

### PROOF

- Repository: `github.com/CryptoJym/ofone-skillchain`. Public. MIT licensed. Version
  badge reads 0.7.0. Last push 2026-08-01. Checked 2026-08-11.
- Live walkthrough site: `https://cryptojym.github.io/ofone-skillchain/` returned HTTP
  200 on 2026-08-11.
- Live product site: `https://of1.ai` returned HTTP 200 on 2026-08-11.
- The validator is real and runnable: `npm run validate` runs JSON Schema checks first,
  then semantic graph checks. Patching is a command, not a promise:
  `npm run patch -- examples/strategy-micro.json E1`.
- **Honest limit, stated by the project itself.** The benchmark suite is a scaffold, not
  a result. Its own standard requires at least 21 retrospective cases across six task
  families before any performance claim. Batch 01, opened 2026-05-17, records 52 of 90
  predeclared run slots complete with local reviews. The repo says in writing that the
  included interactive benchmark is a smoke test and does not establish superiority.
  OfOne makes no speed or accuracy claim, and neither does this page.
- One excluded run is kept on purpose. A full-OfOne slot was rejected because its
  artifact identity was copied from the wrong case. The failed run stays in the repo as
  immutable evidence, and the rerun is tracked separately so history is not rewritten.
- `[JAMES: of1.ai sign-in is currently broken, and the Cartographer feature is not
  working in production. Do you want that stated on this page, kept off it, or fixed
  before the page ships? Recommendation: fix or scope the page to the method and the
  open-source compiler, which are both provably live.]`

### Stack

Node.js. JSON Schema plus a semantic graph validator. Markdown skill definition
(`SKILL.md`). GitHub Pages for the walkthrough. Product front: Vite, React, wouter,
shadcn/ui, tRPC, Drizzle, deployed on Vercel, API on Railway.

---

## A2. plimsoll — the load line for AI spend

**Route:** `/work/plimsoll` · **Filter tags:** Open source, Products

### The problem

Teams spend real money on AI coding agents and cannot say what they got. Vendor
dashboards stop at an org-level total. Nobody joins the spend to the thing that shipped.
So the honest answer to "what did those tokens buy us" is a guess, and the guess is
usually flattering.

### What I built

Plimsoll is a local-first collector that watches Claude Code and Codex on your own
machine, records what each session cost, and joins those sessions to shipped outcomes:
merged pull requests and passing checks. Then it does the division. Tokens per merged
pull request. Cost per validated outcome. Where the spend produced nothing.

The name comes from Samuel Plimsoll, who in 1876 forced shipowners to paint a load line
on every hull. Deaths from overloading fell, not because the rule was clever, but
because the limit became visible to anyone standing on the dock.

### How it works in plain words

Claude Code sends hook events. Both tools send OpenTelemetry data. The collector listens
on your machine at `127.0.0.1:48271` and writes to a local SQLite file. It does not send
your work anywhere.

Before anything is written to disk, the collector throws away the content: prompts, model
outputs, command bodies, file contents, diffs, and tool arguments. It hashes the things
that identify you: emails, file paths, branch names, repository remotes. It keeps the
boring parts plain: timestamps, tool names, models, token counts, costs, durations, and
commit hashes.

Sessions join to pull requests by matching hashes, not names. Both sides hash the same
normalized inputs, so the join works while the raw strings never leave your machine.

The health check is honest by design. `doctor` climbs four rungs, from `not_installed`
to `signal_verified`, and only the top rung exits zero. A fresh install with no real
token traffic fails, on purpose, instead of reporting a green light it has not earned.

### PROOF

- Repository: `github.com/CryptoJym/plimsoll`. Public. Apache-2.0. TypeScript. Last push
  2026-07-20. Checked 2026-08-11.
- Site: `https://plimsoll.dev` returned HTTP 200 on 2026-08-11.
- Real measured output, published in the project README: pull request #28, merged, checks
  passed. One session. 41,799 input tokens, 188,834 output tokens, 30.4M cache reads.
  Cost $48.46. That is Plimsoll measuring the pull request that built Plimsoll.
- The privacy claim is testable, not promised. The suppression rules live in
  `packages/shared/src/policy.ts` and the forbidden-field list lives in
  `packages/shared/src/schemas.ts`. A fidelity test plants sentinel commands, paths, and
  prompts, then fails if any of them survive to disk.
- Stated as unfinished in the README: background service mode for npm installs is not
  fitted yet, and the lifecycle command set is proofed in isolation but not released.
  Release signing and npm publication are tracked in issue #103.
- `[JAMES: is there a second published cost-per-merged-PR figure you want on this page,
  from your own fleet rather than from the repo? If yes, supply the number, the window,
  and the repo it covers. Do not publish a fleet figure without your clearance.]`

### Stack

TypeScript. Node 20 to 24. OpenTelemetry logs, traces, and metrics. Local SQLite ledger
with 90-day retention. pnpm monorepo. macOS LaunchAgent. Optional hosted sync that is off
by default.

---

## A3. The visibility platform — measuring what search and AI assistants say about a business

**Route:** `/work/visibility-platform` · **Filter tags:** Products, Client work

> **Anonymization note, shown on the page.** Client names and identifying details are
> withheld per agreement. Industries are named, specific clients are not. Screenshots and
> metrics are otherwise unaltered. Named case studies get published only when a client
> gives written clearance.

### The problem

A business used to be findable in one place: Google. Now a buyer may never see a search
result. They ask an assistant, and the assistant answers from sources the business has
never checked. Most owners have no way to see what those answers say about them, no way
to compare themselves to a rival, and no way to tell which fix is worth doing first.

### What I built

A multi-tenant platform that measures how findable a business is in ordinary search and
inside AI assistants, scores it against a fixed rubric, turns the score into a report a
non-technical owner can read, and then feeds the gaps back as work.

The rubric is a 12-axis scorecard with 76 measures underneath it. The axes are fixed on
purpose. A fixed rubric is what makes this month comparable to last month, and one
business comparable to another.

Industries served so far: medical and health services, HVAC, roofing, concrete, gutters,
financial and commercial lending, custom software and IT staffing, pet breeding,
background screening, promotional products, and call-center software.

### How it works in plain words

Every client is a tenant with its own walled data. Nothing crosses between tenants.

A run collects from outside first, using only what any member of the public could see, so
a measurement never depends on getting access to a client's accounts. Where connections
exist, the platform also reads Search Console and analytics directly. Each finding is
stored with its source, the date, and the exact vantage point it was seen from, because
the same page can look different to different visitors.

Missing evidence is recorded as missing. It is never scored as a zero. That single rule
is the difference between a report that helps and a report that misleads.

The report leads with the comparison and the business conclusion. The score sits under a
plain checklist and a visible formula. The technical evidence goes in an appendix, so an
owner can act without reading it and a technician can check it without arguing.

### PROOF

- Live application: `https://new-rewards.vercel.app` returned HTTP 200 on 2026-08-11.
- Agency front: `https://newreward.com` returned HTTP 200 on 2026-08-11.
- The published method: the scorecard system's documentation site,
  `https://h3ro-dev.github.io/new-reward-seo-skills-os/`, returned HTTP 200 on
  2026-08-11. The underlying repository is private.
- Axis and measure counts (12 axes, 76 measures) come from the portfolio inventory of
  2026-08-11 and must be `computed at build` from the scorecard source, not typed.
- Platform repository is private. `[JAMES: do you want a redacted screen recording of a
  real run for this page? The site brief asks for a 60 to 90 second watch-it-run clip on
  flagship studies. Approve the recording and the redaction list.]`
- `[JAMES: supply one outcome number with its method, for one anonymized client. Example
  shape: "an HVAC client, over 90 days, moved from N of 76 measures passing to M." Nothing
  goes on this page until you give the figure and the window.]`
- `[JAMES: clearance question. Any client willing to be named yet? If yes, that becomes a
  second, named case study and this one stays anonymous.]`

### Stack

Next.js and TypeScript on Vercel. Prisma with a multi-tenant schema keyed by tenant and
client. Clerk for authentication. Search Console and analytics sync. DataForSEO adapters
for backlinks, keyword data, and assistant-mention checks. Self-hosted CI runners with
required checks and a merge queue.

---

## A4. EEG meditation analysis — scoring meditation depth from brainwaves

**Route:** `/work/eeg-meditation-analysis` · **Filter tags:** Open source, Experiments

### The problem

People who meditate have almost no way to tell whether a session went deep or shallow,
other than how it felt. Consumer EEG headsets record the signal, but the raw signal is
noise to a human eye. The gap is not the sensor. It is the analysis in between.

### What I built

A Python toolkit that takes an EEG recording and reports what happened during a
meditation session. It filters the signal, removes artifacts, measures power in each
brainwave band, and scores meditation depth from 0 to 100. It can also walk a whole
session in sliding windows, so you can see where attention drifted and where it settled.

It ships a synthetic data generator, so anyone can run the whole pipeline without owning
a headset or handing over their own recordings.

### How it works in plain words

Brain activity gets sorted into frequency bands. Delta is the slowest, from 0.5 to 4
cycles per second. Theta runs from 4 to 8. Alpha, Beta, and Gamma go up from there. Deep
meditative states show more of the slow bands and less of the fast ones.

The toolkit measures how much power sits in each band, then computes ratios between them.
A higher Delta to Theta ratio points to deeper states. The Theta to Alpha ratio tracks the
move from alert to meditative. It also reports spectral entropy, which is a measure of how
disordered the signal is, and the dominant frequency.

Those numbers roll into one score and one of four labels: alert, light, moderate, or deep.
It draws the whole thing as a multi-panel chart with a spectrogram, the power spectrum,
and the band distribution.

### PROOF

- Repository: `github.com/CryptoJym/eeg-meditation-analysis`. Public. MIT licensed.
  Python. 3 stars from outside contributors. Last push 2025-11-11. Checked 2026-08-11.
- Runnable end to end without hardware: `python generate_sample_eeg.py` then
  `python eeg_analysis.py`.
- **Honest limits, stated on the page.** This is a signal-processing toolkit, not a
  clinical instrument and not a validated study. The four state labels are thresholds
  chosen from published band conventions, not outcomes measured against a control group.
  No accuracy claim is made here.
- Status: dormant. Last commit was 2025-11-11, which is about nine months before this
  page was drafted. `[JAMES: label this "archived" or "dormant, open to revival"? Also:
  was this run on your own recordings from a specific headset, or on synthetic data only?
  If real recordings exist, name the device.]`

### Stack

Python 3.8 or newer. NumPy and SciPy for filtering and power spectral density.
Matplotlib for the multi-panel plots.

---

## A5. seopr1.com — a marketing site that has to prove the thing it sells

**Route:** `/work/seopr1` · **Filter tags:** Products, Client work

### The problem

A site that sells AI-search visibility has a credibility trap built into it. If the site
itself is slow, invisible to crawlers, or generic, the pitch is dead on arrival. It also
has a plain business job: explain a new service to professional firms who have not heard
of it, and book a call.

### What I built

A five-page site built for speed first and motion second. The hero carries a 3D tuning
fork rendered in WebGL, tied to scroll. Ripple and wave layers sit behind the copy. The
whole thing ships as static pages with one framework dependency, so the visual ambition
does not cost load time.

### How it works in plain words

The site is built with Astro, which sends plain HTML and adds interactivity only where it
is needed. The 3D fork runs on WebGL through three.js, driven by GSAP ScrollTrigger, so
the object turns as you read.

The interesting part is what happens when the fancy layer is not available. If WebGL is
missing, the code keeps the whole DOM experience, reveals and theme included, and drops
only the 3D. On small screens the wave canvas is switched off entirely, and a legibility
plate sits behind copy wherever the fork would pass under text. Nothing important lives
inside the animation.

Structured data describes the service in the page source, so an assistant reading the page
gets the same explanation a person does. Booking runs through an embedded scheduler, so
the call happens in one click instead of a form and a wait.

### PROOF

- Live: `https://seopr1.com` returned HTTP 200 on 2026-08-11.
- Repository: `github.com/CryptoJym/seopr1-site`. Public. Last push 2026-08-11.
- One production dependency: `astro ^6.2.2`. Node 22.12 or newer. Five pages: home,
  AI visibility for firms, answer engine optimization, FAQ, and the shared layout.
  `robots.txt`, `sitemap.xml`, and an OG image ship with the site.
- Accessibility and fallback behavior are in the source, not asserted here: the WebGL
  branch has an explicit no-WebGL path, and decorative canvases carry `aria-hidden`.
- `[JAMES: supply a performance number with its method. A Lighthouse or CrUX score for
  seopr1.com, with the date and the device profile. The site brief bans typed numbers, so
  this needs a real measurement you approve.]`
- `[JAMES: this is a live commercial front. Confirm it belongs in the portfolio as your
  work, and confirm whether to name it as a New Reward property or as a client property.]`

### Stack

Astro 6. three.js r128. GSAP with ScrollTrigger. Lenis for smooth scroll. SVG filters for
ripple distortion. Deployed on Vercel. Booking through an embedded LeadConnector widget.

---

## A6. AI-readiness assessment — a company-wide readiness score in one sitting

**Route:** `/work/ai-readiness-assessment` · **Filter tags:** Products, Open source

### The problem

Most organizations answer "are we ready for AI" with a feeling. The people who ask are
usually executives, and the answer they get back is a vendor's opinion. There is no shared
frame, so two departments in the same company can disagree without ever finding out why.

### What I built

An interactive assessment that scores an organization across seven competency domains,
using 28 questions, and returns charts and a downloadable report. It filters questions by
role, so an executive, a manager, an IT lead, and an HR lead each answer what they can
actually judge.

### How it works in plain words

The seven domains are: mindset and ethics, governance and risk, opportunity discovery,
workflow integration and prompting, verification and quality, execution discipline, and
culture and change.

You answer one domain at a time, with a progress bar showing where you are. Every domain
has its own color, used consistently across every chart, so a weak area looks the same
wherever it appears.

At the end you get four views of the same data: a bar chart by domain, a radar chart for
the overall shape, a distribution, and a maturity matrix showing where you sit on the
journey. Four views matter because a single number hides which two domains are dragging
the average down.

Results export as a formatted PDF for sharing, or as raw JSON if you want to track scores
over time rather than take a snapshot and forget it.

### PROOF

- Live: `https://ai-readiness-assessment-eight.vercel.app` returned HTTP 200 on
  2026-08-11.
- Repository: `github.com/CryptoJym/ai-readiness-assessment`. Public. MIT licensed. Last
  push 2025-08-15. Checked 2026-08-11.
- Counts are in the source and must be `computed at build`: 28 questions, 7 domains.
- Status note for honesty: last commit 2025-08-15. The tool is live and working, and it
  has not been changed in about a year.
- `[JAMES: the README calls the 28 questions "research-based". Name the sources, or the
  page will say "questions drawn from an internal rubric" instead. Do not publish
  "research-based" without citations.]`
- `[JAMES: has this been run by any real organization? If yes, how many, and can any of
  them be described anonymously by industry? If no, the page says so plainly.]`

### Stack

Next.js 15 with the App Router. TypeScript. Tailwind CSS. shadcn/ui components. Framer
Motion. Recharts. PDF export. Deployed on Vercel.

---

## A7. The Of One family — a thesis in progress

**Route:** `/work/of-one-family` · **Filter tags:** Experiments, Products

> **Read this first.** This entry is a thesis being tested, not a finished product line.
> Most of what is described below is staked ground: a registered domain and a landing
> page, nothing more. A small number are real, working applications. The page labels
> which is which, every time, and the counts are computed from the content source at
> build. Ideation repositories are not counted as products.

### The problem

Software for a one-person business is usually shrunken software for a big company. The
work a solo operator actually has to do is different in kind, not just in size. One person
is the CEO, the finance function, the legal review, and the marketing department in the
same afternoon. The thesis is that each of those jobs deserves its own tool, built for one
person, rather than a seat in a suite built for fifty.

### What I built

A governed family of domains and applications under the "of One" idea. Each one names a
single company role and asks what that role looks like when the whole department is one
person plus AI.

Two things are true at once, and the page says both.

First, the real ones. `financeofone.com` and `vcofone.ai` are live applications, not
brochures. They are the ones worth judging.

Second, the staked ground. The rest of the family is domains and landing pages. They exist
to test which role-shaped problem pulls the most interest before anything gets built. That
is a legitimate way to find demand. It is not the same as shipping a product, and calling
it shipping would be a lie.

### How it works in plain words

The family runs on one rule: a domain does not become a product until someone shows up
wanting it. Landing pages carry the promise. Traffic and signups say which promise is
real. Only then does a build start. That order is deliberate, and it is why the count of
domains is much larger than the count of applications.

Shared UI components live in one place, `ofone-ui`, so a build that graduates does not
start from an empty folder.

### PROOF

- Live and checked 2026-08-11: `https://businessofone.ai` HTTP 200,
  `https://financeofone.com` HTTP 200, `https://vcofone.ai` HTTP 200.
- Correction to carry forward: `vcofone.com` does not serve a site. It resolves to a host
  that returns nothing. The live domain is `vcofone.ai`. Do not link the `.com`.
- Family counts from the portfolio inventory of 2026-08-11: 26 governed domains, 21 live
  landing pages, 2 to 4 real applications. These must be `computed at build` from a
  checked domain list, not typed, and the live check should be dated on the page.
- The 47-repository burst in this family is ideation. It is not counted anywhere on this
  site as product.
- `[JAMES: give the honest verdict line for this page. Which of these is getting real
  traffic, and what have you decided to kill? A thesis page with no result is just a list
  of domains. One sentence about what you learned makes it a case study.]`
- `[JAMES: confirm the exact set of "real applications". The inventory says 2 to 4.
  Name them.]`

### Stack

Mostly Next.js on Vercel for the landing pages. Shared component library `ofone-ui`.
Domain and provider mapping tracked in a per-family audit document.

---

# B. Theory pages

Every theory page uses the same shape, per the site brief:
question-shaped H1 → answer capsule → body as static HTML → maturity state → artifact link.

Answer capsule house rule: self-contained, and the **first sentence carries no pronouns**,
so an answer engine can quote it without the surrounding page.

Maturity ladder used below: **named-only → sketched → developed**. Named-only theories stay
off the home page and the navigation until they reach sketched.

---

## B1. What is Universal Question Geometry?

*Flagship. Route: `/theories/universal-question-geometry`*

### Answer capsule

Universal Question Geometry treats a question as an operation that changes the state of
knowledge, which means questions can be ranked, ordered, and scored before any are asked.
The method keeps a running picture of the current state of knowledge, estimates how much
each candidate question would move that picture, and selects the next question from the
top of that ranking. Stopping is not allowed on the feeling of being finished; a stop
attempt is rejected while a question with positive expected value is still open.

### The body

Most inquiry runs on habit. Someone asks what comes to mind, gets an answer, asks the next
thing that comes to mind, and stops when the list of questions runs out or the clock does.
The order is accidental. The stopping point is a mood.

Universal Question Geometry starts from a different claim: questions have shape. A question
is not a request for a fact. It is an operator that moves a belief state from one position
to another. Some moves are large. Some are tiny. Some open doors that other questions can
then walk through, which means their real value is not in their own answer but in what they
unlock. If that is true, then a set of candidate questions has a landscape, with high
ground, low ground, and a frontier of choices where you cannot improve one thing without
giving up another.

The implementation makes that landscape computable. It ranks candidate questions over the
current state. It records the peaks, the valleys, and the frontier. When an answer comes
back, it updates the beliefs and the causal structure underneath them, then re-ranks.

Three rules do most of the work.

**Answers must be qualified, not tagged.** A challenge pass is not complete because someone
marked it complete. It is complete when the answers meet the conditions.

**Provenance is chained.** Every answer event is hashed with SHA-256 and linked to the one
before it, so a state that was quietly edited after the fact does not pass verification.

**Depth is typed, not counted.** The familiar "five whys" rule stops at five because five
is a memorable number. Here, the traversal continues by the type of thing you are standing
on. You stop when you reach bedrock: a primary source, a named mechanism, or a human
ruling. Not when you get tired.

Stopping has guards. Residual expected value of information, decision robustness, whether a
question was actually selected by the runtime, and whether any positive-value question
remains. A rejected stop exits with code 2 and hands back the next required question.

Two more things exist because inquiry gets stuck rather than wrong. Stall detection notices
when the loop is circling and switches operator. And a configured safety boundary sends the
whole thing to a human before it can run away.

### Maturity

**Developed, and deliberately unproven.** The engine, the protocol, the enforcement layer,
and the documentation all exist and run. The evidence does not exist yet. The project's own
benchmark standard demands at least 21 retrospective cases across six task families before
any performance claim, and batch 01 stands at 52 of 90 predeclared run slots. The repository
states in writing that the included benchmark is a smoke test and establishes nothing.
That gap is stated here rather than papered over.

### Artifacts

- `QUESTION_GEOMETRY.md` and `docs/question-geometry-engine.md` in
  `github.com/CryptoJym/ofone-skillchain`
- The runnable loop: `node scripts/ofone-question-loop.mjs`
- The walkthrough site: `https://cryptojym.github.io/ofone-skillchain/`
- Related case study: `/work/ofone`

---

## B2. Why should a useful-looking finding get more scrutiny, not less?

*Route: `/theories/question-answer-dynamics`*

### Answer capsule

Question-Answer Dynamics is a rule for interrogating every finding before that finding is
acted on, and the central claim is that scrutiny should scale with how convenient a finding
is. A finding
that contradicts the plan already attracts hard questions; a finding that flatters the plan
does not, which is exactly why it slips through unchecked. The method fixes this by running
a fixed battery of questions on every finding and by refusing to stop research on
satisfaction.

### The body

Two failure modes started this.

The first is gift acceptance. On one competitive-intelligence engagement, for a custom
software and IT staffing firm, the research turned up something convenient: a rival's site
appeared to be blocked from indexing. It was banked immediately as leverage. Nobody asked
the boring questions.

When those questions were finally asked, the finding reversed. When did it start? Well
before the rival's repositioning, so it was not strategy. Was it intentional? No, it was a
hosting default nobody managed. Was it total? No, it was keyed to specific visitors, so
real search crawlers passed through. Could it be undone? Yes, with one toggle.

The convenient reading said "exploit their wall". The interrogated reading said "fix your
own foundation, and treat their wall as a temporary bonus that may vanish tomorrow". Two
opposite plans from one fact.

The second failure mode is the checklist stop. An audit finished its task list, declared
completion, and was asked one more question: is there more to learn here? That question
turned one instance into a class, and four more gaps came out.

So the method has two halves.

**The battery**, run on every finding. Is it real, and was it measured or inferred? When
did it start, and which way is it moving? Why would a rational actor produce this state,
on purpose, by accident, or through neglect? What else is on this same surface? How does it
read from four other viewpoints? What would make this misleading? Where does it lead next?
Unknown is a permitted answer. Skipping is not.

**The scheduler.** Every interrogated finding ends with either a list of next questions or a
written reason for stopping. Never neither. All open next-questions from all findings go
into one queue, ranked by value divided by cost. The top one gets pulled, the answer comes
back, and it re-enters the battery. That queue is the research plan. Not a plan written on
day one, but a frontier that regrows from every answer.

Research ends when every finding has been interrogated, every remaining question has a
written stop reason, no contradictions are left unresolved, and beliefs are strong enough
for the use they are being put to. Not when the researcher feels done.

### Maturity

**Developed and in daily use.** The method is written as an executable skill and runs on
live competitive-intelligence work. Its two founding cases are real engagements, described
here by industry only. The stop and continue decisions are logged so they can be scored
over time, but that scoring has not been published.

### Artifacts

- The skill definition, installed and running in the operating environment
- `[JAMES: this method is currently an internal skill file. Do you want it published as a
  public repository, the way problem-solving-system is? If yes, it needs a client-safe
  pass first, because the working copy names two client engagements.]`

---

## B3. Can one person run a software team by splitting judgment from building?

*Route: `/theories/architect-loop`*

### Answer capsule

The Architect Loop is a working arrangement in which one AI model does judgment only and a
separate set of AI models does all the building, with a git repository as the only shared
memory. Judgment means arbitration, verdicts against frozen gates, splitting work into
lanes, and deciding whether to continue or kill. Building means writing code in isolated
worktrees, with no authority to decide whether its own work passed.

### The body

The separation is the whole idea. A model that writes code and also grades that code will
grade it kindly. Not from dishonesty, but because the same context that produced the work
produces the standard.

So the loop puts a wall in the middle. One model holds judgment. One to four builders run
in parallel, each in its own isolated git worktree. They never share a directory, because
parallel agents in one directory tidy up after each other and destroy each other's work.

The repository is the only memory. Not chat history, not a scratch folder. A handoff file,
a gates directory, and a lanes directory. Anything not written to the repository did not
happen.

Gates are frozen before the work starts. That is the part most systems get wrong. If the
test that decides "done" can be edited by the thing being tested, the test decides nothing.
So the gate has a tamper perimeter, and it covers more than the gate file: it includes the
validators, the test files, and the script entries the gate command depends on. After the
run, the loop diffs that whole set. A fix that touched the checker has to be re-verified
against a known-bad input before it counts.

Disagreement stops the run before code. If the plan and the request materially disagree,
the run ends as blocked rather than proceeding on a guess.

The final verdict is given by a fresh judge with no memory of the build conversation, and
that judge is handed pointers only: the handoff file, the gates, and the frozen commit. Not
the story of how the work went. A judge who watched the struggle grades the struggle.

**Attribution, stated plainly.** The Architect Loop is not mine. It is a fork of
`DanMcInerney/architect-loop`, heavily customized, run daily, and hardened locally.
Five audit findings were fixed in a local v2.4 pass, and one of those fixes was offered
back upstream as a pull request. What I contribute is the hardening and the operating
discipline, not the original design.

### Maturity

**Developed and field-proven, on a fork I do not own.** Two full delivery cycles have run
end to end under it, in client engagements described here by industry only: pet breeding
and financial and commercial lending. The upstream project has since been rebuilt into a
different architecture, and my install deliberately stays on the older shape.

### Artifacts

- Upstream project: `github.com/DanMcInerney/architect-loop`
- `[JAMES: the local hardened copy is unpublished. Publish a write-up of the v2.4 changes,
  link the upstream pull request, or keep both private? Recommendation: publish the
  write-up, link upstream, credit Dan by name in the first paragraph.]`

---

## B4. Do language models share a hidden vocabulary for relational states?

*Route: `/theories/latent-emotions`*

### Answer capsule

Latent Emotions is a personal, unfinished observation that different large language models
reach for closely similar words when describing certain relational states, which may
point to shared structure underneath rather than shared training vocabulary. No claim of
proof is made here, and no formal study exists. The work is paused.

### The body

I want to be clear about what this is before I describe it. These are my own observations
and my own internal thinking. They are not formal claims. There is not really any
credibility to validate them yet. I am putting them here because they are interesting, and
because they might yield something later, not because I think I have shown anything.

Here is what I noticed. As I talked with different language models, across different
vendors, I kept seeing the same vocabulary come back for specific relational states. Not
common words. Particular ones, for states I would argue are nonverbal. The states themselves
do not have obvious names, and yet different models reached for overlapping language when
they tried to describe them.

That convergence is what caught me. If separate models trained by separate companies
describe an unnamed state with the same words, one explanation is coincidence in the
training data. Another is that there is some shared latent structure being described. I do
not know which. I have not run the work that would tell them apart.

To have something to look at, I built a six-dimension model: energy, valence, complexity,
novelty, introspection, and focus. Those six became the axes of a visual demo, where a
conversation moves through a space instead of down a page.

I should say how that model was made. I arrived at those six dimensions in conversation
with a language model, together, not by deriving them from anything. I do not think it is a
complete model. It was a way to view the idea. It was never meant to prove the idea.

Since I started this, related work has appeared from other people, including, I believe,
from Anthropic. That came out after I began. I am not making a priority claim about it, and
I do not think one would matter. I note the timing only because someone will ask.

**Where this stands.** I stopped. I have not carried the observations forward, and it is
more of a stagnant project than an active one right now. It is here because it is honest to
show the unfinished things too.

### Maturity

**Sketched, and paused.** Observations, a six-dimension working model built in conversation,
and a visual demo. No formal write-up, no validation design, no result. Paused by choice.

### Artifacts

- The manifold demo in `/lab`, presented as a lens for looking at the idea, not as evidence
  for it
- `[JAMES: the originating ChatGPT conversations are on the MacBook Pro and did not sync.
  If you export them, this page can carry your actual first observations with dates.
  Optional. The page works without them.]`
- `[JAMES: name one or two of the specific vocabulary words or states you kept seeing, if
  you are comfortable. One concrete example would make this page far stronger, and right
  now there is not one.]`

---

## B5. What is THE PAPER?

*Route: `/theories/the-paper`*

### Answer capsule

THE PAPER is a single working document that specifies a five-layer operating system for
running a business where AI agents do most of the labor. The five layers are business
truth, competitive monitoring and recommendation, strategy, execution, and visibility
measurement, each one gated by the layer beneath it. The document is a specification under
active revision, not a published theory.

### The body

This page introduces the document. It does not reproduce it. THE PAPER is 22,078 words
across 2,380 lines, and dropping that on a web page would help nobody.

The idea it specifies is a stack. Each layer only gets to act on what the layer below it
has established.

**Layer 1, business truth.** What the company actually sells, at what price, to whom, with
what economics. Captured once, at onboarding, and treated as the cornerstone. Everything
above it is wrong if this is wrong.

**Layer 2, intelligence.** Split in two on purpose. Layer 2a records facts about
competitors, continuously, and only facts. Layer 2b applies judgment on top of those facts
and proposes moves. Keeping observation separate from opinion is what stops a guess from
hardening into a fact three steps later.

**Layer 3, strategy.** A versioned war plan derived from truth and intelligence. Every
version has to carry its reasoning and the alternatives it rejected, so a future reader can
see what was considered and not just what was chosen.

**Layer 4, execution.** The agent labor. Content, site, brand, go-to-market. Gated, so
execution cannot run ahead of the plan that authorizes it.

**Layer 5, visibility measurement.** Search and AI-answer scanning. The document is firm
that this is one instrument, not the whole system. That matters because measurement is the
easiest layer to build and the most tempting to mistake for strategy.

What makes the document itself unusual is its tagging. Every load-bearing claim carries
exactly one tag: locked, resolved, decision needed, assumption, unverified, or verified
with an evidence path. You can strike any single line and immediately see what it takes
down with it. Decisions sit at the top of each section, mechanics below, because decisions
are what a reader is most likely to change.

### Maturity

**Developed as a specification, unreviewed past section 4, and unpublished.** Revision R5,
dated 2026-07-05. Sections 4 onward have not been reviewed. The decision register carries
open items rated high, and building against an open decision is not permitted.

### Artifacts

- `[JAMES: hard gate. The war-strategy program's own standing rule says the program is
  private and local-only until you publish it, and that nothing may be published, pushed,
  deployed, or shared without your approval. This page cannot ship without your explicit
  yes. Three options: (1) publish this introduction only, with no link to the document;
  (2) publish the introduction plus a redacted excerpt of sections 1 and 2; (3) keep the
  whole thing off the site for now. Recommendation: option 1.]`
- Verified size for the page, if it ships: 22,078 words, 2,380 lines, 161 KB, Revision R5,
  dated 2026-07-05. Measured 2026-08-11. Must be `computed at build` if shown.

---

## B6. What is Movement Economy?

*Route: `/theories/movement-economy`* · *Short entry*

### Answer capsule

Movement Economy is a rule that every sentence in a piece of analysis must do one of ten
declared jobs or be deleted. The ten jobs are: bound the question, ground it in evidence,
make a claim, link two things, state a test, propose a move, evaluate options, warn, set a
trigger, and gate a decision. Anything that does none of these is decoration, and
decoration is removed.

### The body

Analysis bloats for a reason. Writing that sounds thoughtful gets rewarded. Framing,
throat-clearing, restatement, and hedging all read as care. None of them change what a
reader can do.

Movement Economy makes that testable. Ten jobs are declared up front. Every emitted piece
has to name the job it does. If it cannot name one, it goes.

The effect is not shorter writing for its own sake. It is that everything left standing
moves the decision somewhere. A reader can point at any sentence and ask which of the ten
it is doing, and there is an answer or there is a deletion.

The rule lives inside OfOne, where it is enforced on the map objects rather than applied by
taste to prose. That is the part worth stealing: a style rule that a program can check is a
different kind of rule from a style rule you have to remember.

### Maturity

**Sketched.** Named, defined, and enforced in code as rule 8 of the OfOne compiler. No
standalone write-up exists yet, and no measurement of its effect on real documents.

### Artifacts

- Rule 8 in `github.com/CryptoJym/ofone-skillchain` (`README.md`, "The rules that keep it
  honest")
- Related theory: `/theories/universal-question-geometry`

---

## B7. What is Function-First Orchestration?

*Route: `/theories/function-first-orchestration`* · *Short entry*

### Answer capsule

Function-First Orchestration is an operating rule that puts proof of function ahead of proof
of thoroughness. Under the rule, a piece of work ships with one honest happy-path test
plus the specific refusals that protect money, custody, and truth, and nothing else.
Broader test coverage is deliberately deferred rather than skipped.

### The body

The rule came out of watching build waves produce test batteries larger than the features
they tested. The tests were not wrong. They were early. Every hour spent on a speculative
test matrix was an hour not spent finding out whether the thing worked at all.

So the standing rule is: great is the enemy of good. Prove function. Refine later.

Two things keep this from becoming an excuse for sloppiness.

First, the refusals are not optional. A test that proves the system says no, correctly,
when money moves, when custody changes, or when a truth claim is being made, is
function-proof, not polish. Those tests ship in the first pass, every time.

Second, the deferral is written down. "Refine later" only works if later is a real entry on
a list, not a feeling. Improvements go into a parking file, not into the current wave, and
the current wave's scope is frozen and shrink-only.

There is a matching rule for the agents doing the work: give each one a narrow lane and all
the surrounding context. Narrow, because a broad brief invites design beyond the ask. All
the context, because an agent forced to re-derive a settled decision will sometimes derive
a different one.

### Maturity

**Sketched.** A standing operating rule with a clear origin and daily application. No
measurement has been published on whether it produced more shipped work or more defects,
and that measurement is the obvious next step.

### Artifacts

- `[JAMES: this rule came from your own words on 2026-07-28: "ensure that we do not over
  engineer the testing. We want to focus on function. We can refine later. Great is the
  enemy of good." Do you want that quoted on the page as yours? It is the strongest line on
  it, but it is from an internal working session.]`
- Related: `/theories/architect-loop`

---

# C. About page draft

*Route: `/about`*

---

## The short version

James Brady builds AI systems that show their work. One person, operating at fleet scale,
documenting what actually works. Based in Lehi, Utah.

`[JAMES: the human story. Two or three paragraphs, in your voice, covering: how you got
here, what you were doing before this, and why you work this way instead of some other way.
This is the single biggest gap on the page. Everything else below is process, and process
without a person reads like a manual.]`

`[JAMES: one sentence on what you are trying to build over the next few years. Not a
mission statement. The actual goal.]`

`[JAMES: a real photograph. The site brief lists a real photo asset as a build gate.]`

---

## Who does what

Three names show up across this site, and they are not the same thing.

**James Brady** is the person. The theories, the open-source projects, and the writing are
mine.

**Utlyze** is the studio. It builds products and takes on custom software and systems work.

**New Reward** is the agency. It does the visibility work: measuring how findable a business
is in search and inside AI assistants, and then fixing it.

I operate both. When a page on this site says a client engagement, it names the industry and
not the company, unless that company has given written permission to be named.

`[JAMES: confirm this split is how you want it stated, and confirm the legal entity names
and structure. Is Utlyze the parent, is New Reward a brand under it, or are they separate?
This paragraph should match reality exactly, because it is the one a lawyer or a
prospective client will read closely.]`

---

## How one person checks work before it ships

This is the fair question. If most of the building is done by AI agents running in parallel,
what stops bad work from reaching a client?

Here is the actual answer, without jargon.

**A claim is not proof.** An agent saying it finished is a report, not a result. So the rule
is that the finished thing gets checked at the place it actually lives. Not in the chat that
produced it. If a change is supposed to be on the site, the site is what gets read. If a
report is supposed to have gone out, the sent folder is what gets read.

**"Done" is not one word.** Work moves along a ladder, and each rung is a different claim:
open, then checks passing, then reviewed, then merged, then deployed, then checked live,
then approved for a client to see. Saying a higher rung than the true one is treated as a
defect, not a rounding error.

**The checker cannot be the builder.** Whatever grades the work is separate from what
produced it, and the standard is frozen before the work starts. If the thing being tested
can edit the test, the test decides nothing. The frozen set includes the test files and the
scripts the check depends on, and a change to any of them is compared afterward.

**Machines hold the gates, not memory.** Required checks run on every change. A merge queue
tests changes together, in order, before they land, so two changes that each pass alone but
break together get caught before a person sees them. None of this depends on anyone
remembering to run something.

**Missing is not zero.** When something cannot be measured, the answer is "unknown", and
unknown is written down as unknown. It never quietly becomes a zero, an estimate, or a
confident sentence. This one rule prevents most of the bad reports I have seen.

**Numbers are computed, not typed.** Every number on this site is derived from its source
when the page is built. The old version of this site displayed a hand-typed count that was
wrong by a factor of eight. That class of mistake is now impossible here, by construction.

**Irreversible things stop for a human.** Sending a client message, spending money,
publishing, deploying, deleting data. Agents prepare those. A person approves them. That is
not a limitation I am working around. It is the design.

`[JAMES: one measured throughput number would make this section land, with its method and
window. Something in the shape of "N changes merged in a 7-day window, every one through
the same required checks". You have measured this. Approve a figure and a window, or this
section stays qualitative.]`

`[JAMES: clearance. Are you comfortable describing the fleet in public at all, or does the
about page describe the discipline without the scale?]`

---

## What I use, and what is not mine

`OpenClaw` is a third-party project. I run and extend a self-hosted instance of it, with
custom skills, a gateway, and hardware hookups. I did not build OpenClaw.

`architect-loop` is a fork of a project by Dan McInerney. I run a heavily customized copy
daily and have contributed a fix upstream. The original design is his.

I mention both because a portfolio that quietly absorbs other people's work is exactly the
kind of thing this site is supposed to be the opposite of.

---

## Contact

`[JAMES: what makes someone a strong fit to reach out, in one or two lines? The contact
page needs a real qualification, not "get in touch". What kind of problem do you actually
want in your inbox?]`

---

# Appendix 1 — verification log

Everything checked on 2026-08-11, read-only, from this machine.

| Thing checked | Method | Result |
|---|---|---|
| `of1.ai` | HTTP GET, follow redirects | 200 |
| `plimsoll.dev` | HTTP GET | 200 |
| `seopr1.com` | HTTP GET | 200 |
| `newreward.com` | HTTP GET | 200 |
| `utlyze.com` | HTTP GET | 200 |
| `new-rewards.vercel.app` | HTTP GET | 200 |
| `cryptojym.github.io/ofone-skillchain/` | HTTP GET | 200 |
| `h3ro-dev.github.io/new-reward-seo-skills-os/` | HTTP GET | 200 |
| `ai-readiness-assessment-eight.vercel.app` | HTTP GET | 200 |
| `businessofone.ai` | HTTP GET | 200 |
| `financeofone.com` | HTTP GET | 200 |
| `vcofone.ai` | HTTP GET | 200 |
| `vcofone.com` | HTTP GET + DNS | Resolves to 178.128.175.14, serves nothing |
| `CryptoJym/ofone-skillchain` | GitHub API | Public, MIT, 0 stars, pushed 2026-08-01 |
| `CryptoJym/plimsoll` | GitHub API | Public, Apache-2.0, TypeScript, 0 stars, pushed 2026-07-20 |
| `CryptoJym/eeg-meditation-analysis` | GitHub API | Public, MIT, Python, 3 stars, pushed 2025-11-11 |
| `CryptoJym/ai-readiness-assessment` | GitHub API | Public, MIT, 0 stars, pushed 2025-08-15 |
| `CryptoJym/seopr1-site` | GitHub API | Public, pushed 2026-08-11, one dependency (astro ^6.2.2) |
| `CryptoJym/problem-solving-system` | GitHub API | Public, no license set, JavaScript, pushed 2026-05-12 |
| `h3ro-dev/new-reward-seo-skills-os` | GitHub API | **Private**, 1 star, pushed 2026-07-20 |
| `THE-PAPER.md` | `wc` on the local file | 2,380 lines, 22,078 words, 161,326 bytes, Rev R5, dated 2026-07-05 |

---

# Appendix 2 — factual conflicts found between sources

Named, not silently resolved.

1. **`new-reward-seo-skills-os` is private, but the inventory describes it as a "published
   'how I work' playbook".** The repository is private (verified via GitHub API). Its
   GitHub Pages site at `h3ro-dev.github.io/new-reward-seo-skills-os/` is publicly
   reachable and returned 200. Both are true, and they mean different things. Draft copy
   above cites the public documentation site only, never the repository. **Needs James:
   confirm the Pages site is intentionally public.**

2. **`vcofone` domain is wrong in the inventory.** The inventory lists `vcofone` among real
   apps in the businessofone family. `vcofone.com` resolves but serves nothing.
   `vcofone.ai` is live and returns 200. Draft copy uses `vcofone.ai`.

3. **THE PAPER's location and status conflict across sources.** The inventory says "exists
   locally". The war-strategy skill names its root as
   `/Users/jamesbrady/Projects/codex-conductor-program` (a source-machine path). The file
   actually resolved on this machine at
   `/Users/utlyze/Documents/Codex/AI-Workstation/knowledge/codex-conductor-program/reviews/THE-PAPER.md`.
   Size matches the inventory's 161 KB exactly.

4. **THE PAPER's date differs between sources.** Durable memory says it shipped 2026-07-04.
   The document's own header says 2026-07-05, Revision R5. The document wins.

5. **Publishing THE PAPER conflicts with a standing rule.** `SITE-BRIEF.md` lists THE PAPER
   in the theories spine. The war-strategy program's own skill file states the program is
   private and local-only until James publishes it, and that nothing may be published,
   pushed, deployed, or shared without approval. The draft page above introduces the idea
   and links nothing. **This is a blocking gate, not a preference.**

6. **The Latent Emotions maturity target conflicts with the site brief's own rule.**
   `SITE-BRIEF.md` says the full theory text must land as static HTML before the theory
   counts as "developed". The interview file rules the page "sketched / exploratory" and
   paused. Both are satisfied by the draft above: full text is static HTML on the page, and
   the maturity label reads sketched-and-paused. Flagged so nobody later "upgrades" it.

7. **`of1.ai` is live but partly broken.** Durable memory records that sign-in has been
   broken on `of1.ai` throughout, and the Cartographer feature does not work in production.
   The inventory lists OfOne as "Both live". Both statements are true at different levels
   of detail. Draft copy scopes the claim to the method and the open-source compiler, and
   flags the choice to James.

8. **Star counts are lower than the inventory implies in two places.** The inventory's
   flagship table implies traction for OfOne and plimsoll. Both are at 0 stars. The
   supporting-repo counts it cites are correct: `cursor-admin-mcp` 3, `motion-mcp-server` 2,
   `eeg-meditation-analysis` 3. No draft page above cites a star count, because star counts
   are not outcomes. Flagged in case the `/work` index plans to render live repo signals.

9. **`problem-solving-system` has no license file.** The inventory lists it under public
   repositories. The GitHub API reports no license. A public repository with no license is
   not usable by others by default. **Needs James: add a license or drop the "reusable"
   framing.** No draft page above depends on it.

---

# Appendix 3 — `[JAMES]` gap index

**25 inline `[JAMES]` markers.** Grouped so they can be answered in one sitting.

**Clearances and go/no-go (6)**
1. A1 — disclose, fix, or scope around the of1.ai sign-in and Cartographer state.
2. A3 — approve a redacted screen recording of a real platform run.
3. A3 — any client willing to be named yet.
4. A5 — confirm seopr1.com is portfolio work, and whether it is a New Reward or a client
   property.
5. B5 — **blocking.** Publication approval for THE PAPER page. Three options given,
   option 1 recommended.
6. C — comfort level with describing the fleet publicly at all.

**Numbers that must not be invented (5)**
7. A2 — a fleet cost-per-merged-PR figure, with window and repository, or none.
8. A3 — one anonymized client outcome number, with method and window.
9. A5 — a real performance measurement for seopr1.com, with date and device profile.
10. A7 — confirm the exact set of "real applications" in the Of One family.
11. C — one measured throughput number with its method and window.

**Facts only James holds (6)**
12. A4 — was the EEG work run on real recordings, and on which device.
13. A4 — label the EEG toolkit archived, or dormant and open to revival.
14. A6 — name the sources behind the "research-based" 28 questions, or drop the phrase.
15. A6 — has any real organization completed the assessment.
16. A7 — the verdict line: what got traction, what got killed.
17. B4 — one or two concrete vocabulary examples from the latent-emotions observations.

**Publishing decisions on internal material (3)**
18. B2 — publish Question-Answer Dynamics as a public repository, after a client-safe pass.
19. B3 — publish the Architect Loop v2.4 hardening write-up and link upstream.
20. B7 — approve quoting his own 2026-07-28 words on the page.

**The human story (3, and the largest gap on the site)**
21. C — two or three paragraphs in his voice: how he got here, what came before, why he
    works this way.
22. C — one sentence on the actual goal for the next few years.
23. C — a real photograph.
24. C — confirm the entity structure paragraph: legal names, and whether Utlyze is the
    parent or the two are separate.
25. C — what makes someone a strong fit to contact him. One or two lines, for `/contact`.

**Optional, not blocking**
- B4 — export the originating ChatGPT conversations from the MacBook Pro, if he wants dated
  first observations on the page.
