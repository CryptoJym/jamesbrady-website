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
//
// FULGURITE (2026-09-27). The accepted design is grown from the public GitHub
// record, and the org that holds half of it is named h3ro-dev. It prints a
// repository two more ways, both the same org-infrastructure fact as the URL:
//   · the URL without its scheme, as a label's visible text:
//     "github.com/h3ro-dev/borg" (the 2026-08-11 ruling allows the org's URLs);
//   · the repository's full name, which is that URL's path and how the record
//     names a repo: "Releases of h3ro-dev/eegt", a link labelled "h3ro-dev/borg",
//     the record's own data, and `h3ro-dev/${r}` building one in code.
// Each shape still needs a repository after the slash and a clean left edge,
// so the bare org name, "h3ro-dev" as prose, an @-scope, a lookalike host and
// an http:// link are all still hits (fixture h3ro-f11-shape-edges.txt).

export const H3RO_ALLOWED_URLS = [
  /https:\/\/x\.com\/h3roai(?![\w.-])/g,
  /https:\/\/(www\.)?tiktok\.com\/@h3ro\.ai(?![\w.-])/g,
  // Scheme optional. Without it, nothing may touch the host on its left.
  /(?:https:\/\/|(?<![\w.@/:-]))github\.com\/h3ro-dev\/[\w.-]+/g,
  /https:\/\/h3ro-dev\.github\.io[\w./-]*/g,
  // A repository's full name, standing on its own.
  /(?<![\w.@/-])h3ro-dev\/(?:[\w.-]+|\$\{)/g,
];

/**
 * Sentences in the SOURCE that name the org's GitHub account in prose, pinned
 * by file and exact text, each with its reason. Only the source scan reads this
 * list: a rendered page gets no exemption, so if one of these ever reaches a
 * page it is a hit there. Any other wording in the same file is a hit too.
 */
export const H3RO_SOURCE_FACTS = [
  {
    file: "content/history/history.snapshot.json",
    text: "public repositories owned by CryptoJym and h3ro-dev;",
    reason:
      "the snapshot's method line names the two GitHub accounts it read. No page renders it; " +
      "the snapshot ships as data for the specimen",
  },
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

/** scanH3ro for a source file: its pinned facts (if any) are removed first, each once. */
export function scanH3roSource(file, text) {
  let rest = text;
  for (const fact of H3RO_SOURCE_FACTS) if (fact.file === file) rest = rest.replace(fact.text, " ");
  return scanH3ro(rest);
}
