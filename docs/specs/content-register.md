# Content register — how copy on this site is written and checked

Patterns adapted from blader/humanizer (MIT), itself based on Wikipedia's "Signs
of AI writing"; merged with this site's register rules.

Status: working checklist for every prose pass on `content/**/*.ts` and the page
prose in `app/(site)/**/page.tsx`. Three authorities feed it, in this order when
they disagree: (1) `SITE-BRIEF.md` register rules, (2) `docs/specs/geo-seo-spec.md`
§4 answer-capsule house rule and the gates in `lib/content/validate.ts`, (3) the
de-AI-pattern checklist below.

---

## Part 0 — House rules that outrank everything else

These come from `SITE-BRIEF.md`. A sentence that satisfies every pattern below
and breaks one of these is still wrong.

**0.1 Evidence, not adjectives.** Every public claim is verifiable. Replace an
adjective with the thing that earned it, or cut the sentence.
Before: "A powerful, best-in-class collector for AI spend."
After: "A collector that joins each session's cost to the merged pull request it
produced."

**0.2 Numbers are computed, never typed.** Every figure rendered on the site is
derived from the content source at build or render time. A numeral typed into a
short display string is a defect, and `lib/content/validate.ts` fails the build
on it. Figures may appear in prose only when the page also carries the method.
Before: "298 tools cataloged."
After: `{catalogCount}` read from the catalog source, beside its method line.

**0.3 Missing is not zero.** Absent evidence is written as absent. It never
becomes an estimate, a zero, or a confident sentence.
Before: "The tool has been run by many organizations."
After: "No record exists of an outside organization running it."

**0.4 Plain words.** Write for a reader who is smart and not in this field. Keep
code, commands, repo names, and version numbers exact; explain everything else.
Before: "A multi-tenant orchestration substrate for visibility telemetry."
After: "A platform that measures how findable a business is, with each client's
data walled off from every other client's."

**0.5 No mysticism, no sci-fi chrome.** No "alchemist" or "alchemy", no sacred
geometry naming, no "neural link" or "semantic input", in copy, component names,
or UI. The site proves competence; it never performs mystique. Enforced by
`scripts/verify-seo.mjs` check 11.

**0.6 State the rung, not the story.** Open, checks passing, reviewed, merged,
deployed, checked live, approved for a client to see — these are different
claims. Claiming a higher rung than the true one is a defect.

**0.7 Say what is not proven, on the page.** Every case study and theory carries
its own "what is not proven" or "honest limits" section. That section is not a
weakness to minimize; it is the reason the rest of the page is believable.

---

## Part 1 — Answer capsules (geo-seo-spec §4, gated in code)

The capsule is the block an answer engine is most likely to quote alone, so it
has hard rules and a build gate.

1. **Self-contained and pronoun-free first sentence.** The entity being defined
   is named in the first five words. No "it", "this", "that", "these", "those",
   "they", "the system", "the project", "as described above". Enforced by the
   `LEADING_DEICTIC` denylist in `lib/content/validate.ts`.
   Before: "It scores an organization across seven domains."
   After: "The AI-readiness assessment scores an organization across seven
   competency domains."
2. **Length.** The spec asks for 40–80 words; the build gate accepts 40–110 and
   fails outside it. Write to the spec, stay inside the gate.
3. **It sits under a question-shaped heading.** On `/theories/[slug]` the H1 is
   itself the question, and the theory name is the eyebrow above it.
4. **Plain language, no marketing adjectives, no unresolved jargon.** Any term
   the capsule introduces is defined inside the capsule.
5. **Verbatim in the body.** The `DefinedTerm.description` in JSON-LD and the
   rendered text must match exactly; `verify-seo` check 4 diffs them. Editing a
   capsule means editing one string, not two.
6. **Tightening beats padding.** If a cut would drop the capsule under 40 words,
   add a real fact that belongs there. Never add filler to clear a floor.

Related floor: a theory at `maturity: "developed"` needs a body of at least 600
words of static HTML. Same rule — earn the floor, do not pad to it.

---

## Part 2 — The de-AI-pattern checklist

33 patterns. Each has one condensed before/after. Where the site's own register
overrides the pattern, that is stated.

### Content patterns

**1. Undue emphasis on significance and broader trends.**
Watch: stands as, is a testament to, a pivotal moment, underscores its
importance, reflects broader, marking a shift, evolving landscape.
Before: "The collector shipped in June, marking a pivotal moment in how teams
think about AI spend."
After: "The collector shipped in June."

**2. Undue emphasis on notability and coverage.**
Watch: independent coverage, national outlets, active social media presence.
Before: "The project has been discussed across GitHub, Hacker News and X, and
maintains an active following."
After: "Three outside stars, read from the GitHub API on the snapshot date."

**3. Superficial analyses with -ing endings.**
Watch: highlighting, underscoring, ensuring, reflecting, symbolizing,
contributing to, showcasing, fostering.
Before: "Each session is hashed before storage, ensuring privacy and reflecting
a commitment to user trust."
After: "Each session is hashed before storage. The raw strings never leave the
machine."

**4. Promotional and advertisement-like language.**
Watch: boasts, vibrant, rich, profound, seamless, powerful, robust, renowned,
groundbreaking, cutting-edge, commitment to.
Before: "A powerful, seamless platform with a rich feature set."
After: "A platform that scores a business against a fixed rubric of twelve axes."
(Same rule as house rule 0.1, arriving from a different direction.)

**5. Vague attributions and weasel words.**
Watch: industry reports, observers have cited, experts argue, several sources.
Before: "Experts agree that most teams cannot account for their AI spend."
After: "Vendor dashboards stop at an org-level total." (Name the source, or cut
the claim. Never invent a source to make a sentence sound backed.)

**6. Outline-like "challenges and future prospects" sections.**
Watch: Despite its... faces several challenges, Despite these challenges,
Future Outlook.
Before: "Despite these challenges, the project continues to grow."
After: "Background service mode is not fitted yet, and the README says so."
Note: this site's "what is not proven" sections are the opposite of this
pattern. The tell is the formulaic pivot back to optimism, not the honesty.

### Language and grammar

**7. Overused AI vocabulary.**
Watch: actually, additionally, align with, crucial, delve, emphasizing,
enduring, enhance, fostering, garner, highlight (verb), interplay, intricate,
key (adj), landscape (abstract), pivotal, showcase, tapestry, testament,
underscore (verb), valuable, vibrant.
Before: "Additionally, the intricate interplay between the two layers is
crucial."
After: "The second layer only reads what the first layer wrote."
Keep a watched word when it is a term of art the page defines — a value
*landscape* over ranked questions is a real optimization surface, not decoration.
"Actually" is the one to count: it earns its place only when the sentence is
correcting an expectation.

**8. Copula avoidance.**
Watch: serves as, stands as, represents a, boasts, features a, offers a.
Before: "The repository serves as the shared memory for every lane."
After: "The repository is the only shared memory."

**9. Negative parallelisms and tailing negations.**
Watch: "Not only... but...", "It's not just X, it's Y", and clipped negations
tacked onto a sentence end.
Before: "The options come from the selected item, no guessing."
After: "The options come from the selected item, so nobody has to guess."
**Site-specific extension.** The antithesis "X, not Y." is this site's signature
move, and it is load-bearing when the contrast is the actual claim ("a defect,
not a rounding error"). It is slop when it is decoration ("A shelf, not a
ranking.") or when three of them land in one section. Count them per page. If
the same rhythm closes more than a couple of paragraphs, rewrite the decorative
ones as plain statements and keep the ones carrying a real distinction. The same
applies to "rather than" and "instead of": one contrastive construction per idea,
not one per sentence.

**10. Rule-of-three overuse.**
Before: "It filters, measures, and scores. Fast, honest, and checkable."
After: "It filters the signal and scores the session."
Keep a triad when the count is a fact — three real rules in an implementation is
three, and flattening it would be a lie.

**11. Elegant variation (synonym cycling).**
Before: "The collector reads the events. The daemon stores them. The service
reports them."
After: "The collector reads the events, stores them, and reports them."
Call one thing one name for the whole page.

**12. False ranges.**
Before: "The work runs from theory to practice, from code to conversation."
After: "The work covers the compiler and the two live applications."
A genuine numeric scale ("a depth score from 0 to 100") is not this pattern.

**13. Passive voice and subjectless fragments.**
Before: "No configuration file needed. Results are preserved automatically."
After: "You do not need a configuration file. The collector keeps the results."
Passive is fine where the actor is genuinely irrelevant or unknown.

### Style

**14. Em dashes and en dashes: cut them.**
The most reliable single tell. Replace, in order of preference: a period, a
comma, a colon, parentheses, or a restructure. Catch spaced em dashes and double
hyphens used the same way.
Before: "The rubric is fixed — that is what makes two runs comparable."
After: "The rubric is fixed. That is what makes two runs comparable."
**Exceptions, narrow and named.** (a) Owner-approved copy locked verbatim in
`SITE-BRIEF.md` keeps its punctuation; the brief is the authority. (b) Structural
separators in short display labels — a proof label, an `og.imageAlt`, a
nameplate line — are furniture, not prose, and are out of scope for this rule.
Everything in a body, capsule, summary, abstract, claim, blurb, or page lead is
in scope.

**15. Overuse of boldface.**
Before: "It blends **OKRs**, **KPIs**, and the **Balanced Scorecard**."
After: "It blends OKRs, KPIs, and the Balanced Scorecard."
Bold a term when the paragraph is a definition entry in a genuine labelled list.
Do not bold for emphasis inside running prose.

**16. Inline-header vertical lists.**
Before: "- **Performance:** Performance has been improved through optimization."
After: "The page loads faster because the canvas is off on small screens."
The tell is a bolded header followed by a restatement of that header. A bolded
label followed by real content the label does not already contain is a
definition list and is allowed.

**17. Title case in headings.**
Before: "## Strategic Negotiations And Global Partnerships"
After: "## What is not proven"

**18. Emojis.** None, anywhere in copy.

**19. Curly quotation marks.**
Straight quotes in source strings by default. Exception: rendered page prose in
JSX, where typographic quotes and `&rsquo;`/`&ldquo;` entities are a deliberate
design choice and the lint rule expects them. Curly quotes alone are not a tell.

### Communication

**20. Collaborative communication artifacts.**
Watch: I hope this helps, Of course!, Would you like..., let me know, here is a...
Before: "Here's an overview of the platform. Let me know if you'd like more."
After: "The platform measures findability and scores it against a fixed rubric."
Note: `[JAMES: ...]` marks are a deliberate exception. They are open questions
addressed to the owner, they are meant to be visible, and no pass may edit them,
including the text inside them.

**21. Knowledge-cutoff disclaimers and speculative gap-filling.**
Watch: as of my last update, while specific details are limited, maintains a low
profile, likely began, it is believed that.
Before: "While specific details are limited, the project likely began in 2025."
After: "The first commit is dated 2025-09-14." Or say the date is not recorded.
This is house rule 0.3 in a different costume.

**22. Sycophantic or servile tone.**
Before: "Great question, and you're absolutely right to ask."
After: Answer the question.

### Filler and hedging

**23. Filler phrases.**
"in order to" → "to" · "due to the fact that" → "because" · "at this point in
time" → "now" · "in the event that" → "if" · "has the ability to" → "can" ·
"it is important to note that the data shows" → "the data shows".

**24. Excessive hedging.**
Before: "It could potentially be argued that the method might help."
After: "The method may help. No measurement has been published."
Hedging and honesty are different. "No measurement exists" is a fact; "it could
possibly perhaps help" is a dodge.

**25. Generic positive conclusions.**
Before: "Exciting things ahead as the project continues its journey."
After: Cut the paragraph. End on the last concrete fact.

**26. Hyphenated word-pair overuse.**
Keep the hyphen in attributive position, drop it after the noun.
Before: "The report is high-quality and the method is data-driven."
After: "The report is high quality and the method is data driven."

**27. Persuasive authority tropes.**
Watch: the real question is, at its core, in reality, what really matters,
fundamentally, the deeper issue, the whole point.
Before: "At its core, what really matters is whether the gate can be edited."
After: "The gate matters only if the thing being tested cannot edit it."

**28. Signposting and announcements.**
Watch: let's dive in, here's what you need to know, now let's look at.
Before: "Let's break down how the join works."
After: "Sessions join to pull requests by matching hashes."

**29. Fragmented headers.**
A heading followed by a one-line paragraph that restates the heading.
Before: "## Performance / Speed matters. / When a page is slow, people leave."
After: "## Performance / When a page is slow, people leave."

**30. Diff-anchored writing.**
Documentation that narrates a change instead of describing the thing.
Before: "This section was rewritten to replace the old hand-typed count."
After: "Every number here is computed from the content source at build."
Stating a past defect as a reason for a present rule is not this pattern; it is
evidence. The tell is prose that only parses if you know the last commit.

**31. Manufactured punchlines and staccato drama.**
Before: "Then the gate froze. No edits. No exceptions. No way around it."
After: "The gate is frozen before the work starts, and the frozen set includes
the test files."
One short sentence for emphasis is fine. A run of them is engineered.

**32. Aphorism formulas.**
Watch: X is the Y of Z, X becomes a trap, the language of, the currency of, the
architecture of.
Before: "Provenance is the currency of trust."
After: "Each answer event is hashed and linked to the one before it, so an edited
state fails verification."

**33. Conversational rhetorical openers.**
Watch: Honestly?, Look, Here's the thing, The thing is, Let's be honest.
Before: "Is it proven? Honestly? Not yet."
After: "It is not proven yet."

---

## Part 3 — What not to flag

Editing past these is how a pass makes writing worse. From the source guide,
kept because this site's prose trips several of them honestly.

- **Polish.** Clean grammar and consistent style are not evidence of anything.
- **Dry, neutral prose.** For reference and technical text, plain *is* the human
  voice. Do not inject opinion or first person into a method line or a stack list.
- **Technical vocabulary.** The pattern lists name *specific* overused words, not
  all formal words. A term of art the page defines stays.
- **One transition word.** A single "however" is not a tell.
- **Curly quotes alone**, **em dashes alone**, **one short emphatic sentence**,
  **unsourced claims**, **clean formatting**. Evidence is the *cluster*.
- **Secondhand text.** Never rewrite a watched phrase inside a quotation, a
  title, a proper name, a repo name, or an example where the phrase is being
  discussed rather than used.
- **Specific, hard-to-fabricate detail; mixed feelings; genuine asides; uneven
  sentence length.** These are the signs of a person writing. Preserve them.

## Part 4 — Hard limits on any prose pass

1. No fact, name, number, date, URL, or citation may be added, removed, or
   altered. A rewrite that makes a vague sentence specific is a fabrication
   unless the specific was already in the source.
2. `[JAMES: ...]` marks are untouchable, including the text inside them.
3. Code, schema, field names, and non-prose display strings are out of scope.
4. Every gate in `lib/content/validate.ts` must still pass: capsule word floor
   and ceiling, pronoun-free first sentence, summary ≤ 160 characters, the
   600-word body floor for a developed theory, and the no-numeral rule on short
   display strings.
5. Where a cut would break a floor, improve the passage instead of padding it.
6. Report honest zeros. A pattern with no hits is reported as no hits. Claiming
   fixes that were not needed is itself slop.
