// The "no colour literal outside :root" rule, as code.
//
// design-system-spec §7.2 has carried this rule as prose since wave 1, and
// prose caught nothing. Wave 2 needed an ALLOWLIST for it — app/icon.svg has
// to inline its hexes, because a browser fetching an icon has never seen the
// stylesheet — and an allowlist with no lint behind it is just a comment.
//
// The gate has two halves, and the second is the point:
//
//   1. scanForLiterals  — no hex / rgb() / rgba() outside a :root block.
//   2. scanFrozen       — inside an ALLOWLISTED file, every literal must still
//                         EQUAL the token it froze. An exemption that only
//                         allows is an exemption that lets the brand drift;
//                         this one allows the literal and then pins it.
//
// Pure functions, no filesystem: scripts/verify-tokens.mjs feeds it the repo
// and scripts/verify-fixtures.mjs feeds it hostile input.

/** #abc / #aabbcc / #aabbccdd, and rgb()/rgba() in any spacing. */
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*[\d.]+[^)]*\)/g;

/** Normalize a hex to lowercase 6 digits so #FFF, #ffffff and #FFFFFF agree. */
export function normalizeHex(h) {
  let m = h.replace("#", "").toLowerCase();
  if (m.length === 3) m = m.replace(/./g, (x) => x + x);
  return m.slice(0, 6);
}

/** Every colour literal declared inside a :root block, normalized. */
export function parseRootTokens(css) {
  const out = new Set();
  for (const [block] of css.matchAll(/:root\s*\{[^}]*\}/g)) {
    for (const [lit] of block.matchAll(LITERAL)) {
      out.add(lit.startsWith("#") ? normalizeHex(lit) : lit.replace(/\s+/g, "").toLowerCase());
    }
  }
  return out;
}

/**
 * Blank a region out while keeping every line number intact, so a violation
 * still reports the line a human will find it on.
 */
const blank = (s) => s.replace(/[^\n]/g, " ");

/**
 * @param {string} text
 * @param {object} opts
 * @param {boolean} opts.css        strip :root blocks before scanning
 * @param {string=} opts.stopAt     scanning stops at this marker (out-of-scope tail)
 * @returns {{line:number, literal:string}[]}
 */
export function scanForLiterals(text, { css = false, stopAt } = {}) {
  let src = text;

  if (stopAt) {
    const at = src.indexOf(stopAt);
    if (at !== -1) src = src.slice(0, at) + blank(src.slice(at));
  }
  if (css) {
    // :root is where tokens are DECLARED — including the @media print re-bind,
    // which is a token re-binding and not a component painting a literal.
    src = src.replace(/:root\s*\{[^}]*\}/g, blank);
    // A CSS comment quoting a token value is documentation, not paint.
    src = src.replace(/\/\*[\s\S]*?\*\//g, blank);
  } else {
    src = src
      .replace(/\/\*[\s\S]*?\*\//g, blank) // block comments
      .replace(/<!--[\s\S]*?-->/g, blank) // SVG/HTML comments
      .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length))); // line comments
  }

  const hits = [];
  for (const m of src.matchAll(LITERAL)) {
    hits.push({ line: src.slice(0, m.index).split("\n").length, literal: m[0] });
  }
  return hits;
}

/**
 * The allowlist's other half. Every literal in an exempted file must be a
 * value that :root also declares — the file is allowed to REPEAT a token, not
 * to invent a colour.
 *
 * @returns {{line:number, literal:string}[]} literals that no token declares
 */
export function scanFrozen(text, tokens) {
  return scanForLiterals(text).filter(({ literal }) => {
    const norm = literal.startsWith("#")
      ? normalizeHex(literal)
      : literal.replace(/\s+/g, "").toLowerCase();
    return !tokens.has(norm);
  });
}
