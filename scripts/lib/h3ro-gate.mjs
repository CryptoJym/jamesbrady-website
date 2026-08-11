// The retired-brand-token gate, in one place so the battery and the fixtures
// test read the SAME code. A gate whose test re-implements it proves nothing.
//
// URL-ANCHORED, not token-global (independent review, P2-8). The old gate
// allowlisted the bare handles `h3roai`, `h3ro.ai` and `h3ro-dev` ANYWHERE in a
// document, so "the h3ro-dev collective" as body copy, a footer reading
// "@h3ro.ai", or a component named `H3roPanel` all passed it.
//
// The ruling (SITE-BRIEF.md, 2026-08-11; reconciled into geo-seo-spec §8.8 on
// the same date) permits exactly four URL SHAPES — two social profiles and two
// org-infrastructure paths, because an org infrastructure URL is a fact — and
// nothing else. So the gate removes those URLs and any surviving occurrence of
// the token, in any casing, is a hit.
//
// The visible LABEL of an allowlisted link is NOT automatically permitted. It
// has to be prose that does not contain the token.
//
// scripts/fixtures/h3ro-*.txt carries the review's F4-F7 cases and
// scripts/verify-fixtures.mjs asserts each one is caught, so this cannot be
// quietly widened back into a token allowlist.

export const H3RO_ALLOWED_URLS = [
  /https:\/\/x\.com\/h3roai(?![\w.-])/g,
  /https:\/\/(www\.)?tiktok\.com\/@h3ro\.ai(?![\w.-])/g,
  /https:\/\/github\.com\/h3ro-dev\/[\w.-]+/g,
  /https:\/\/h3ro-dev\.github\.io[\w./-]*/g,
];

/**
 * @param {string} text
 * @returns {{ domainHits: number, brandHits: number }}
 *   domainHits — the retired domain used as a destination. Always a violation.
 *   brandHits  — the token surviving after every allowlisted URL is removed.
 */
export function scanH3ro(text) {
  const domainHits = (text.match(/https?:\/\/(www\.)?h3ro\.ai/g) ?? []).length;
  let rest = text;
  for (const re of H3RO_ALLOWED_URLS) rest = rest.replace(re, " ");
  const brandHits = (rest.match(/h3ro/gi) ?? []).length;
  return { domainHits, brandHits };
}
