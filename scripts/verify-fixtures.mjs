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

import { scanH3ro } from "./lib/h3ro-gate.mjs";
import { parseRootTokens, scanForLiterals, scanFrozen } from "./lib/token-gate.mjs";
import { renderIcons } from "./lib/icon-raster.mjs";
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

check("h3ro gate ALLOWS the four permitted URL shapes (control)", () => {
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

check("icon raster is a FUNCTION of the SVG, not a memory of it", () => {
  // Check 5 of verify-tokens compares bytes. Prove the comparison can fail:
  // change one digit of the source and the raster must change with it.
  const svg = readFileSync(join(process.cwd(), "app", "icon.svg"), "utf8");
  const drifted = svg.replace('fill="#3FD9A0" fill-opacity="1"', 'fill="#3FD9A0" fill-opacity="0.5"');
  assert.notEqual(drifted, svg, "the fixture edit did not apply — the SVG shape changed");
  assert.notEqual(
    renderIcons(svg).apple.toString("base64"),
    renderIcons(drifted).apple.toString("base64"),
    "a changed SVG rendered identical bytes — the sync check cannot fail",
  );
});

console.log("─".repeat(72));
console.log(`${passed}/${passed + failed} fixture checks passed${failed ? ` — ${failed} FAILED` : ""}`);
process.exit(failed ? 1 : 0);
