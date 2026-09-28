#!/usr/bin/env node
// RED-TEAM THE GATES. Not the happy path — the gates themselves.
//
//   node scripts/verify-fixtures.mjs
//
// Every fixture under scripts/fixtures/ is a hostile input that a gate in this
// repo MUST catch, plus one control that it must NOT. A gate verified only on
// the permitted case has not been verified: it has to be shown REFUSING
// something. That is the whole reason this file exists — the retired-brand gate
// ran green for a whole wave against an allowlist that let the token through in
// prose, in a handle, and in a component name.
//
// No test runner. Node's own assertions, so this runs anywhere `node` does.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { H3RO_SOURCE_FACTS, scanH3ro, scanH3roSource } from "./lib/h3ro-gate.mjs";
import { parseRootTokens, scanForLiterals, scanFrozen } from "./lib/token-gate.mjs";
import { renderIcons } from "./lib/icon-raster.mjs";
import { sameImage } from "./lib/png.mjs";
import { renderMarkdown, toPlainText, PENDING_TOKEN } from "../lib/content/markdown.ts";

const FIXTURES = join(process.cwd(), "scripts", "fixtures");
const read = (name) => readFileSync(join(FIXTURES, name), "utf8");

let failed = 0;
let passed = 0;

function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${name} — ${e.message.split("\n")[0]}`);
  }
}

console.log(`\nverify-fixtures — red-teaming the gates\n${"─".repeat(72)}`);

/* --------------------------------------------- the retired-brand-token gate */

for (const [fixture, label] of [
  ["h3ro-f4-brand-prose.txt", "F4 the token as brand copy in prose"],
  ["h3ro-f5-bare-handle.txt", "F5 a bare handle away from its link"],
  ["h3ro-f6-component-name.txt", "F6 the token in a component name"],
]) {
  check(`h3ro gate CATCHES ${label}`, () => {
    const { brandHits } = scanH3ro(read(fixture));
    assert.ok(brandHits > 0, `expected brandHits > 0, got ${brandHits}`);
  });
}

check("h3ro gate CATCHES F7 the retired domain as a destination", () => {
  const { domainHits } = scanH3ro(read("h3ro-f7-domain-destination.txt"));
  assert.ok(domainHits > 0, `expected domainHits > 0, got ${domainHits}`);
});

check("h3ro gate ALLOWS the permitted shapes (control)", () => {
  const { domainHits, brandHits } = scanH3ro(read("h3ro-allowed.txt"));
  assert.equal(domainHits, 0, "a permitted URL was counted as the retired domain");
  assert.equal(brandHits, 0, "a permitted URL was counted as brand copy");
});

check("h3ro gate is URL-ANCHORED, not token-global", () => {
  // The exact shape of the old defect: an allowlisted URL on the same page
  // must not license the bare token elsewhere on it.
  const mixed = "https://x.com/h3roai and, separately, the h3ro-dev collective.";
  assert.ok(scanH3ro(mixed).brandHits > 0, "an allowlisted URL licensed loose brand copy");
});

// 2026-09-27: the scheme became optional and a repository's full name became a
// permitted shape. Every edge of those two widenings is asserted one line at a
// time, so a line cannot pass by riding on a hit elsewhere in the file.
check("h3ro gate CATCHES F11 every edge of the org-infrastructure shapes", () => {
  const lines = read("h3ro-f11-shape-edges.txt").split("\n").slice(1).filter(Boolean);
  assert.ok(lines.length >= 8, `fixture shrank to ${lines.length} lines`);
  const missed = lines.filter((line) => scanH3ro(line).brandHits === 0);
  assert.deepEqual(missed, [], `passed as permitted: ${missed.join(" | ")}`);
});

check("h3ro gate ALLOWS a pinned source fact in its own file ONLY", () => {
  const [fact] = H3RO_SOURCE_FACTS;
  const text = `{"method": "… ${fact.text} releases …"}`;
  assert.equal(scanH3roSource(fact.file, text).brandHits, 0, "the pinned fact was flagged in its own file");
  assert.ok(scanH3roSource("content/elsewhere.json", text).brandHits > 0, "the fact was allowed in another file");
  const reworded = text.replace(fact.text, fact.text.replace("CryptoJym and h3ro-dev", "the h3ro-dev team"));
  assert.ok(scanH3roSource(fact.file, reworded).brandHits > 0, "a reworded fact rode on the pin");
});

/* ------------------------------------------------------ the markdown renderer */

check("markdown REFUSES non-allowlisted link schemes", () => {
  const html = renderMarkdown(read("md-link-schemes.md"));
  for (const scheme of ["javascript:", "data:text/html", "vbscript:", "file://", "JAVASCRIPT:"]) {
    assert.ok(
      !html.includes(`href="${scheme}`),
      `an anchor was built for a ${scheme} URL`,
    );
  }
  // …and renders them as plain text instead of dropping them silently.
  assert.ok(html.includes("javascript:alert(1)"), "the refused link vanished instead of rendering as text");
});

check("markdown ALLOWS http, https, mailto, relative and fragment links", () => {
  const html = renderMarkdown(read("md-link-schemes.md"));
  for (const href of [
    "https://example.com/a",
    "http://example.com/b",
    "mailto:hi@example.com",
    "/work/ofone",
    "#stack",
  ]) {
    assert.ok(html.includes(`href="${href}"`), `no anchor for ${href}`);
  }
});

check("markdown external links carry rel=noopener noreferrer", () => {
  const html = renderMarkdown("[external](https://example.com/a)");
  assert.ok(html.includes('rel="noopener noreferrer"'), "missing rel on an external link");
});

check("gap with a NESTED bracket does not truncate and leak prose", () => {
  const html = renderMarkdown(read("md-gap-nested-bracket.md"));
  assert.ok(html.includes("mark class=\"pending\""), "no pending mark rendered");
  // The whole question must be inside the mark. If the old lazy regex closed
  // at "[table 2]", the tail would escape as ordinary body prose.
  const inside = /<span class="pending__q">([\s\S]*?)<\/span>/.exec(html)?.[1] ?? "";
  assert.ok(inside.includes("which window it covers"), "the gap truncated at the nested bracket");
  assert.ok(!/<p>[^<]*which window it covers/.test(html), "gap remainder leaked into a paragraph");
});

check("gap spanning a BLANK LINE renders as one mark, not raw brackets", () => {
  const html = renderMarkdown(read("md-gap-blank-line.md"));
  const marks = html.match(/<mark class="pending">/g) ?? [];
  assert.equal(marks.length, 1, `expected 1 pending mark, got ${marks.length}`);
  assert.ok(!html.includes("[JAMES:"), "a raw [JAMES: bracket reached the page");
});

check("toPlainText emits [pending], never silence", () => {
  const source = read("md-gap-nested-bracket.md");
  const plain = toPlainText(source);
  assert.ok(plain.includes(PENDING_TOKEN), "the gap was deleted silently");
  assert.ok(!plain.includes("confirm the figure"), "the gap body leaked into plain text");
  // The sentences either side must not close over the hole.
  assert.ok(
    plain.includes(`Before the gap. ${PENDING_TOKEN} After the gap.`),
    `the marker is not standing in the gap's place: "${plain}"`,
  );
});

check("toPlainText marks EVERY gap, not just the first", () => {
  const plain = toPlainText("A [JAMES: one] B [JAMES: two] C");
  assert.equal((plain.match(/\[pending\]/g) ?? []).length, 2, plain);
});

// 2026-09-27, James: open questions render as third-person publicNotes. The
// public render is what every page now uses, so it has to be shown refusing
// the two silent failures verify-seo check 17 assumes it refuses.
check("public render states each gap as its note, with no owner-facing mark", () => {
  const html = renderMarkdown("Before. [JAMES: supply the figure] After.", {
    mode: "public",
    notes: ["The figure is not published yet."],
  });
  assert.ok(html.includes('<span class="pending-note">The figure is not published yet.</span>'), html);
  assert.ok(!/class="pending"|Pending from James|supply the figure/.test(html), `owner-facing text leaked: ${html}`);
});

check("public render REFUSES a gap with no note", () => {
  assert.throws(
    () => renderMarkdown("A [JAMES: one] B [JAMES: two] C", { mode: "public", notes: ["Only one note."] }),
    /no note for it/,
  );
});

/* ------------------------------------------------------------ the token gate */
//
// New in wave 2. The rule is old (design-system-spec §7.2) but it was prose
// until an allowlist was needed for app/icon.svg, and an allowlist with no
// lint behind it allows everything. Same discipline as above: the gate has to
// be shown REFUSING, including refusing the exemption it grants.

for (const [fixture, label] of [
  ["tokens-f8-hex-outside-root.css", "F8 a hex on a component rule"],
  ["tokens-f9-rgba-outside-root.css", "F9 an rgba() on a component rule"],
]) {
  check(`token gate CATCHES ${label}`, () => {
    const hits = scanForLiterals(read(fixture), { css: true });
    assert.ok(hits.length > 0, "the literal outside :root was not reported");
  });
}

check("token gate ALLOWS tokens, :root, the print re-bind and comments (control)", () => {
  const hits = scanForLiterals(read("tokens-allowed.css"), { css: true });
  assert.equal(hits.length, 0, `false positives: ${JSON.stringify(hits)}`);
});

check("token gate CATCHES F10 an exempt asset that drifted off the palette", () => {
  const tokens = parseRootTokens(":root{--c-base:#0A0E11;--sig:#3FD9A0}");
  const bad = scanFrozen(read("tokens-f10-drifted-frozen.svg"), tokens);
  assert.equal(bad.length, 1, `expected the one drifted literal, got ${JSON.stringify(bad)}`);
  assert.match(bad[0].literal, /#3FD9A1/i);
});

check("token gate ALLOWS an exempt asset that froze the real token (control)", () => {
  const tokens = parseRootTokens(":root{--c-base:#0A0E11;--sig:#3FD9A0}");
  const bad = scanFrozen(readFileSync(join(process.cwd(), "app", "icon.svg"), "utf8"), tokens);
  assert.equal(bad.length, 0, `the shipped icon reported drift: ${JSON.stringify(bad)}`);
});

check("token gate ALLOWS the shipped specimen, which froze --bead from app/fg.css (control)", () => {
  const tokens = parseRootTokens(readFileSync(join(process.cwd(), "app", "fg.css"), "utf8"));
  const specimen = readFileSync(join(process.cwd(), "components", "specimen", "Specimen.tsx"), "utf8");
  assert.ok(scanForLiterals(specimen).length > 0, "the specimen paints no literal, so this control proves nothing");
  const bad = scanFrozen(specimen, tokens);
  assert.equal(bad.length, 0, `the specimen painted a colour of its own: ${JSON.stringify(bad)}`);
});

check("icon raster is a FUNCTION of the SVG, not a memory of it", () => {
  // Check 5 of verify-tokens compares images (header + pixels). Prove that
  // comparison can fail: change one digit of the source and it must see it.
  const svg = readFileSync(join(process.cwd(), "app", "icon.svg"), "utf8");
  const drifted = svg.replace('fill="#3FD9A0" fill-opacity="1"', 'fill="#3FD9A0" fill-opacity="0.5"');
  assert.notEqual(drifted, svg, "the fixture edit did not apply — the SVG shape changed");
  const [a, b] = [renderIcons(svg), renderIcons(drifted)];
  assert.ok(sameImage(a.apple, renderIcons(svg).apple), "one SVG rendered two different images");
  assert.ok(!sameImage(a.apple, b.apple), "a changed SVG rendered the same apple-icon — the sync check cannot fail");
  assert.ok(!sameImage(a.ico, b.ico), "a changed SVG rendered the same favicon — the sync check cannot fail");
});

/* ------------------------------------------------------------- the offer gate */
//
// 2026-09-27. James ruled words out of buyer copy (workstream, beta, production
// testing, dedicated team, named people, "from" before a price), named the
// people build-with-you coaches with a promise line that always follows the
// name, and said New Reward's client price is never published. The offer rules
// in lib/content/validate.ts enforce that; these show them REFUSING, each on a
// copy of the real offers. /now is dated today in the copy, so the staleness
// gate cannot answer for the offer gate.

const { importTs } = await import("./lib/ts-register.mjs");
const { validateAll } = await importTs("lib/content/validate.ts");
const content = {
  work: (await importTs("content/work/index.ts")).work,
  theories: (await importTs("content/theories/index.ts")).theories,
  lab: (await importTs("content/lab/index.ts")).lab,
  learn: (await importTs("content/learn/index.ts")).learn,
  now: [{ ...(await importTs("content/now/now.ts")).now, updated: new Date().toISOString().slice(0, 10) }],
};
const realOffers = (await importTs("content/offers/index.ts")).offers;
const offerAt = (offers, slug) => offers.find((o) => o.slug === slug);
const validateOffers = (mutate) => {
  const offers = structuredClone(realOffers);
  mutate(offers);
  validateAll({ ...content, offers });
};

check("offer gate ALLOWS the real offers (control)", () => validateOffers(() => {}));
for (const [label, mutate, expected] of [
  ["a banned word (workstream)", (o) => (offerAt(o, "build-a-system").summary += " One workstream."), /workstream/],
  ["'from' before a price", (o) => (offerAt(o, "build-a-system").price.statement = "Build is from $15,000 a month."), /from before a price/],
  ["an old name for the coaches", (o) => (offerAt(o, "build-a-system").deliverables[0].detail = "Named people do it."), /named people/],
  ["the coach name without its promise line", (o) => {
    const b = offerAt(o, "build-a-system");
    b.answerCapsule = b.answerCapsule.replace(/ They build your AI systems[\s\S]*$/, "");
    b.published.people.lines = ["You work side by side with our build-with-you coaches."];
  }, /promise line/],
  ["a New Reward price with no source", (o) => (offerAt(o, "get-found").price.statement = "New Reward costs $3,000 a month."), /no price\.source/],
]) {
  check(`offer gate CATCHES ${label}`, () => assert.throws(() => validateOffers(mutate), expected));
}

console.log("─".repeat(72));
console.log(`${passed}/${passed + failed} fixture checks passed${failed ? ` — ${failed} FAILED` : ""}`);
process.exit(failed ? 1 : 0);
