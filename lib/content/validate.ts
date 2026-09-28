// Build-failing content validation — geo-seo-spec §1.
//
// "An invalid or missing required field fails the build, never warns."
// Every function here THROWS. They run at module evaluation time in
// lib/content/index.ts, which means `next build` cannot produce a page from
// content that breaks a contract.

import { helpTypes } from "@/lib/contact";
import { extractGaps } from "./markdown";
import {
  MATURITY_ORDER,
  type AnyEntry,
  type LabEntry,
  type LearnEntry,
  type NowEntry,
  type OfferEntry,
  type TheoryEntry,
  type WorkEntry,
} from "./types";

class ContentError extends Error {
  constructor(where: string, message: string) {
    super(`[content] ${where}: ${message}`);
    this.name = "ContentError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Leading pronouns and deictics an answer capsule may not start with (§4.2). */
const LEADING_DEICTIC =
  /^(it|this|that|these|those|they|he|she|we|i|our|its|their|the system|the project|as described|the above)\b/i;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function assert(cond: unknown, where: string, message: string): asserts cond {
  if (!cond) throw new ContentError(where, message);
}

/**
 * THE NO-UNSOURCED-NUMERAL RULE (independent review, P0-1).
 *
 * A SHORT DISPLAY STRING — a card foot fact, a kicker, a status word, a flag —
 * may not contain a digit. Those strings render as data furniture next to
 * numbers the build computed, and a numeral typed into one is a parallel copy
 * of a computed value with no method behind it. That is how the card foot line
 * came to say "Python · 3 stars" beside a `repo.stars: 3` it never read.
 *
 * The allowlist is deliberate and narrow, and every entry on it is prose whose
 * numbers ARE sourced somewhere the reader can see:
 *   · answerCapsule / summary / abstract / claim / what / body — prose. Their
 *     figures are stated with a method on the page or in `proof[]`.
 *   · proofMetric.unit — the unit LINE of a nameplate whose `method` field is
 *     required and printed beside it ("measures under 12 fixed axes").
 *   · FootFact.count — a number held AS a number, with its own unit and method.
 *   · title / slug / stack / repo — names of real things ("seopr1.com",
 *     "Astro 6"). A version number is the thing's name, not a claim.
 *
 * Anything not on that list is checked. Adding a field to the allowlist is a
 * decision someone has to write down here.
 */
const DIGIT = /\d/;

function assertNoNumeral(value: string | undefined, where: string, field: string) {
  if (!value) return;
  assert(
    !DIGIT.test(value),
    where,
    `${field} contains a numeral ("${value}"). Short display strings carry no ` +
      `unsourced numbers — put the figure in a typed field with a unit and a ` +
      `method (see FootFact / ProofMetric), or write it in words.`,
  );
}

function validateBase(entry: AnyEntry) {
  const where = `${entry.collection}/${entry.slug ?? "<no slug>"}`;

  assert(entry.title?.trim(), where, "title is required");
  assert(KEBAB.test(entry.slug ?? ""), where, `slug must be kebab-case, got "${entry.slug}"`);
  assert(entry.summary?.trim(), where, "summary is required");
  assert(
    entry.summary.length <= 160,
    where,
    `summary must be <= 160 chars for <meta name="description">, got ${entry.summary.length}`,
  );
  assert(ISO_DATE.test(entry.datePublished), where, "datePublished must be an ISO date");
  assert(ISO_DATE.test(entry.dateModified), where, "dateModified must be an ISO date");
  assert(
    entry.dateModified >= entry.datePublished,
    where,
    `dateModified (${entry.dateModified}) must be >= datePublished (${entry.datePublished})`,
  );
  assert(entry.entities.length > 0, where, "at least one entity ref is required");
  assert(entry.og?.image, where, "og.image is required — per-page OG is a template-level gate");
  assert(entry.og?.imageAlt, where, "og.imageAlt is required");

  // Answer-capsule house rule (geo-seo-spec §4).
  const capsule = entry.answerCapsule?.trim() ?? "";
  assert(capsule, where, "answerCapsule is required");
  const capsuleWords = wordCount(capsule);
  assert(
    capsuleWords >= 40 && capsuleWords <= 110,
    where,
    `answerCapsule must be 40-110 words, got ${capsuleWords}`,
  );
  const firstSentence = capsule.split(/(?<=[.!?])\s/)[0] ?? capsule;
  assert(
    !LEADING_DEICTIC.test(firstSentence),
    where,
    `answerCapsule first sentence must be pronoun-free and self-contained; it starts "${firstSentence.slice(0, 40)}…"`,
  );

  // Buyer render mode. One third-person note per gap, in gap order.
  //
  // Both failure directions are checked, because both are silent: too few
  // notes and the render throws mid-page or a gap loses its statement of
  // absence; too many and a note has been written for a gap somebody deleted,
  // which shifts every note after it onto the wrong hole.
  if (entry.publicNotes) {
    const gaps = extractGaps(entry.body);
    assert(
      entry.publicNotes.length === gaps.length,
      where,
      `publicNotes has ${entry.publicNotes.length} note(s) for ${gaps.length} pending gap(s). ` +
        `The buyer render pairs them by position, so the counts have to match exactly.`,
    );
    entry.publicNotes.forEach((note, i) => {
      assert(note.trim(), where, `publicNotes[${i}] is empty — a gap still has to say it is a gap`);
    });
  }

  // Proof sources.
  for (const p of entry.proof) {
    assert(p.method?.trim(), where, `proof "${p.label}" is missing a method`);
    assert(ISO_DATE.test(p.capturedAt), where, `proof "${p.label}" needs an ISO capturedAt`);
    assert(
      Boolean(p.url) || Boolean(p.artifact),
      where,
      `proof "${p.label}" has neither url nor artifact — unlinkable proof is not proof`,
    );
  }
}

function validateWork(entry: WorkEntry) {
  const where = `work/${entry.slug}`;
  assert(entry.categories.length > 0, where, "at least one category is required");
  assert(entry.stack.length > 0, where, "stack is required");
  assert(entry.body.trim().length > 0, where, "body is required — case-study prose is static HTML");

  assertNoNumeral(entry.kicker, where, "kicker");

  // Card foot line — the P0-1 gate proper.
  assert(entry.footFacts.length > 0, where, "footFacts is required — the card foot line");
  entry.footFacts.forEach((fact, i) => {
    if ("label" in fact) {
      assertNoNumeral(fact.label, where, `footFacts[${i}].label`);
      return;
    }
    if ("count" in fact) {
      assert(
        Number.isFinite(fact.count),
        where,
        `footFacts[${i}].count must be a number, not a string`,
      );
      assert(fact.unit?.trim(), where, `footFacts[${i}].unit is required`);
      assert(
        fact.method?.trim(),
        where,
        `footFacts[${i}].method is required — a foot-line figure states where it came from, same as a proof slot`,
      );
      return;
    }
    // A field reference. It must resolve on THIS entry, or the card would
    // silently drop a fact the author believed was there.
    if (fact.field === "repo.stars") {
      assert(
        typeof entry.repo?.stars === "number",
        where,
        `footFacts[${i}] reads repo.stars, but this entry has no repo.stars`,
      );
    }
    if (fact.field === "repo.license") {
      assert(
        Boolean(entry.repo?.license),
        where,
        `footFacts[${i}] reads repo.license, but this entry has no repo.license`,
      );
    }
  });
  if (!entry.anonymized) {
    // Nothing extra: a non-anonymized entry simply carries no client name at all.
  }
  if (entry.clearance) {
    assert(
      ISO_DATE.test(entry.clearance.grantedAt),
      where,
      "clearance.grantedAt must be an ISO date — a client name may render only under a clearance record",
    );
  }
  if (entry.repo?.public) {
    assert(
      entry.repo.snapshotAt && ISO_DATE.test(entry.repo.snapshotAt),
      where,
      "a public repo needs a dated snapshotAt — repo signals are sourced, never assumed",
    );
  }
  if (entry.proofMetric) {
    const m = entry.proofMetric;
    assert(
      m.placeholder === true || typeof m.value === "number",
      where,
      "proofMetric must carry a real numeric value or be explicitly flagged placeholder — missing is not zero",
    );
    assert(m.method?.trim(), where, "proofMetric.method is required");
    assert(m.unit?.trim(), where, "proofMetric.unit is required");
  }
}

function validateTheory(entry: TheoryEntry) {
  const where = `theories/${entry.slug}`;
  assert(
    MATURITY_ORDER.includes(entry.maturity),
    where,
    `maturity must be one of ${MATURITY_ORDER.join(" | ")}`,
  );
  assert(entry.claim?.trim(), where, "claim is required — it is the JSON-LD Claim node");
  assert(entry.abstract?.trim(), where, "abstract is required");
  assert(entry.history.length > 0, where, "history needs at least one dated state");
  assertNoNumeral(entry.flagLabel, where, "flagLabel");

  // Brief gate, enforced instead of trusted: "developed" requires the full text
  // as static HTML on the page.
  if (entry.maturity === "developed") {
    const words = wordCount(entry.body);
    assert(
      words >= 600,
      where,
      `maturity "developed" requires a body of >= 600 words of static HTML, got ${words}`,
    );
  }
}

/**
 * Words an offer may never use (James, 2026-09-27, for Utlyze's Build and the Of One sites; they hold for every
 * offer here). Buyers do not know what a workstream is; "beta" and "production testing" describe the client as the
 * test; "dedicated team" and "named people" were the old names for the build-with-you coaches; and "from" before a
 * price read as a hidden price. "Build With You" in title case is another company's name, so the coach name stays
 * lower case except at the start of a sentence: "Build-with-you coaches".
 */
const OFFER_BANNED: [RegExp, string][] = [
  [/workstream/i, "workstream"],
  [/\bbeta\b/i, "beta"],
  [/production testing/i, "production testing"],
  [/dedicated team/i, "dedicated team"],
  [/named (people|engineers)/i, "named people"],
  [/\bfrom \$\d/i, "from before a price"],
  [/Build With You/, "Build With You, as a name"],
];

/** The promise line that follows the coach name wherever there is room (James, 2026-09-27). */
const COACH_NAME = /build-with-you coach/i;
const COACH_PROMISE =
  "They build your AI systems with you and teach your team to run them. If you ever leave, the systems stay with you.";

/** Every string anywhere inside a value, for the word gates. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

function assertSource(s: { label: string; url: string; capturedAt: string }, where: string, field: string) {
  assert(s.label?.trim(), where, `${field}.label is required`);
  assert(s.url?.startsWith("https://"), where, `${field}.url must be absolute https — a price is read from a page`);
  assert(ISO_DATE.test(s.capturedAt), where, `${field}.capturedAt must be an ISO date — the day the price was read`);
}

/**
 * An offer is the one collection a buyer reads before deciding to pay, so the
 * fields that would let it overstate are the ones checked hardest: the enquiry
 * type must be a real member of the /contact allowlist, or the call to action
 * preselects nothing; a price must say where and when it was read; and the
 * words James has ruled out of buyer copy fail the build.
 */
function validateOffer(entry: OfferEntry) {
  const where = `offers/${entry.slug}`;
  assertNoNumeral(entry.kicker, where, "kicker");
  assert(entry.body.trim().length > 0, where, "body is required — offer prose is static HTML");
  assert(
    entry.capsuleQuestion.trim().endsWith("?"),
    where,
    "capsuleQuestion must be question-shaped: the answer capsule sits directly under it (geo-seo-spec §4.1)",
  );
  assert(entry.audience.length > 0, where, "audience is required — who the engagement is for");
  assert(entry.steps.length > 0, where, "steps is required — what an engagement looks like");
  assert(
    entry.deliverables.length > 0,
    where,
    "deliverables is required — what the client is left holding",
  );
  assert(entry.deliveredBy.url.startsWith("https://"), where, "deliveredBy.url must be absolute");
  assert(
    helpTypes.includes(entry.inquiryType),
    where,
    `inquiryType "${entry.inquiryType}" is not in the /contact allowlist — the call to action would preselect nothing`,
  );
  entry.steps.forEach((s, i) => {
    assertNoNumeral(s.label, where, `steps[${i}].label`);
  });
  entry.deliverables.forEach((d, i) => {
    assertNoNumeral(d.label, where, `deliverables[${i}].label`);
  });

  // Money. A price is a published figure, so its method is the page it was read from and the day.
  assert(entry.price?.statement?.trim(), where, "price.statement is required — say what the page says about money");
  if (entry.price.source) assertSource(entry.price.source, where, "price.source");
  assert(
    !DIGIT.test(entry.price.statement) || entry.price.source,
    where,
    `price.statement carries a figure ("${entry.price.statement}") but no price.source: say where and when it was read`,
  );
  if (entry.published) {
    const p = entry.published;
    assert(p.sources.length > 0, where, "published.sources is required — it is the method for every figure in the card");
    p.sources.forEach((s, i) => assertSource(s, where, `published.sources[${i}]`));
    assert(p.cards.length > 0, where, "published.cards is required");
    p.cards.forEach((c, i) => {
      assert(c.name?.trim() && c.price?.trim() && c.value?.trim(), where, `published.cards[${i}] needs a name, a price and its value line`);
      assertNoNumeral(c.name, where, `published.cards[${i}].name`);
    });
    assert(p.levels.items.length > 0, where, "published.levels.items is required");
    assert(p.pace?.trim() && p.start?.trim(), where, "published.pace and published.start are required");
    assert(
      entry.price.source && p.sources.some((s) => s.url === entry.price.source!.url),
      where,
      "price.source must be one of published.sources, so the page and the card cite the same reading",
    );
  }

  // The words James has ruled out, anywhere in the offer.
  const strings = allStrings(entry);
  for (const [pattern, name] of OFFER_BANNED) {
    const hit = strings.find((s) => pattern.test(s));
    assert(!hit, where, `uses "${name}", which is ruled out of buyer copy: "${hit?.slice(0, 120)}"`);
  }
  // The coach name never stands alone: its promise line follows it somewhere on the page.
  if (strings.some((s) => COACH_NAME.test(s))) {
    assert(
      strings.some((s) => s.includes(COACH_PROMISE)),
      where,
      "names build-with-you coaches without their promise line: " + COACH_PROMISE,
    );
  }
}

function validateLab(entry: LabEntry) {
  const where = `lab/${entry.slug}`;
  assertNoNumeral(entry.stateWord, where, "stateWord");
}

function validateLearn(entry: LearnEntry) {
  const where = `learn/${entry.slug}`;
  assertNoNumeral(entry.kicker, where, "kicker");
}

/** The loader forces noindex when an artifact has no written explanation page. */
function normalizeLab(entry: LabEntry): LabEntry {
  if (!entry.explanationUrl) {
    return { ...entry, noindex: true };
  }
  return entry;
}

function validateNow(entries: NowEntry[]) {
  assert(entries.length === 1, "now", `exactly one /now entry is required, found ${entries.length}`);
  const entry = entries[0];
  assert(ISO_DATE.test(entry.updated), "now", "updated must be an ISO date");

  // The hand-written line on /now shows its own date and age on the page, and the rest of /now is computed from
  // the public record at build. So an old line is stated, never a failure: on 2026-09-27 the old 42-day throw took
  // /contact down in production. A build still says so, once.
  const ageDays = Math.floor(
    (Date.parse(`${buildDay()}T00:00:00Z`) - Date.parse(`${entry.updated}T00:00:00Z`)) / 86_400_000,
  );
  if (ageDays > 42 && !isLiveRequest() && process.env.ALLOW_STALE_NOW !== "1") {
    console.warn(`[content] now: the hand-written line is ${ageDays} days old; /now shows its age.`);
  }
}

/** True inside a running Next.js server (not during `next build`, and not in a plain Node script). */
function isLiveRequest(): boolean {
  return process.env.NEXT_RUNTIME !== undefined && process.env.NEXT_PHASE !== "phase-production-build";
}

function buildDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Slugs must be unique inside a collection and across the flat route space. */
function validateUniqueSlugs(entries: AnyEntry[]) {
  const seen = new Map<string, string>();
  for (const e of entries) {
    const key = `${e.collection}/${e.slug}`;
    assert(!seen.has(key), key, "duplicate slug in collection");
    seen.set(key, e.title);
  }
}

export function validateAll(input: {
  work: WorkEntry[];
  theories: TheoryEntry[];
  lab: LabEntry[];
  learn: AnyEntry[];
  now: NowEntry[];
  offers: OfferEntry[];
}) {
  const all: AnyEntry[] = [
    ...input.work,
    ...input.theories,
    ...input.lab,
    ...input.learn,
    ...input.now,
    ...input.offers,
  ];
  all.forEach(validateBase);
  input.work.forEach(validateWork);
  input.theories.forEach(validateTheory);
  input.lab.forEach(validateLab);
  (input.learn as LearnEntry[]).forEach(validateLearn);
  input.offers.forEach(validateOffer);
  validateNow(input.now);
  validateUniqueSlugs(all);
  return { ...input, lab: input.lab.map(normalizeLab) };
}
