#!/usr/bin/env node
// CONTRAST GATE — issue 17, as an executable proof.
//
//   npm run verify:contrast     (no server, no browser, no deps)
//
// The contract it holds (issue 17 done-state): every primary CTA —
// .btn--primary (which carries "Start a build enquiry") — plus the .skip
// link renders cream ink on a deep-green fill measured >=4.5:1 (WCAG 2.x).
// Dark ink on neon phosphor (--sig / --sig-hi fills under --ink-on-sig) is
// banned on these selectors. Token values live in :root; this gate reads
// them from there instead of restating them.
//
// Three layers, so a regression has nowhere to hide:
//
//   1. CALIBRATION — known WCAG pairs must produce their textbook ratios,
//      including the classic near-miss #777-on-white (fails 4.5) vs
//      #767676-on-white (passes). Broken math voids everything below, and a
//      gate that rounds 4.48 up to a pass would be worse than no gate.
//   2. STRUCTURE — the contracted selectors must declare exactly the
//      contracted tokens, and none of them may resolve back to the banned
//      phosphor fill or the dark on-signal ink.
//   3. MEASUREMENT SWEEP — every resolvable background/ink pair in EVERY
//      rule that touches these selectors, in any @media context, must
//      measure >=4.5:1. A future media-query override that quietly re-paints
//      a primary button fails here rather than in someone's browser.
//
// The parser is fail-closed: any brace imbalance or unresolvable colour it
// meets on these selectors is reported, never silently skipped.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_PATH = join(ROOT, "app", "globals.css");
const THRESHOLD = 4.5;

/* ------------------------------------------------------------- WCAG 2.x math */

const hexToRgb = (hex) => {
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

/** sRGB channel -> linear light (WCAG 2.x definition). */
const lin = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const rgb = hexToRgb(hex);
  return rgb ? 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]) : null;
};

const contrast = (fg, bg) => {
  const a = luminance(fg);
  const b = luminance(bg);
  if (a === null || b === null) return null;
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

const fmt = (r) => (r === null ? "UNRESOLVED" : `${r.toFixed(2)}:1`);

/* --------------------------------------------------- token + rule extraction */

/** name -> value for every custom property in ANY :root block. First wins,
 *  so the screen sheet outranks the @media-print re-bind. */
function parseTokens(css) {
  const map = new Map();
  for (const [, block] of css.matchAll(/:root\s*\{([^}]*)\}/g))
    for (const [, name, value] of block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g))
      if (!map.has(name)) map.set(name, value.trim());
  return map;
}

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, " ");

/* Comments out (line-preserving) every top-level @media block, returning
   {css, medias:[{cond, body}]}. Balanced-brace scan; fails closed on imbalance. */
function liftMediaBlocks(css) {
  const src = stripComments(css);
  const medias = [];
  let out = "";
  let i = 0;
  while (i < src.length) {
    const at = src.indexOf("@media", i);
    if (at === -1) {
      out += src.slice(i);
      break;
    }
    // A prelude runs to the first brace; anything else named @media* inside a
    // declaration value does not occur in this sheet, but stay strict anyway.
    const open = src.indexOf("{", at);
    const cond = src.slice(at, open).trim();
    let depth = 0;
    let j = open;
    for (; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    if (j >= src.length)
      throw new Error(`unbalanced braces in @media block starting: ${cond}`);
    medias.push({ cond, body: src.slice(open + 1, j) });
    // Keep the real CSS before the block; blank only the block itself,
    // preserving line numbers for any report.
    out += src.slice(i, at) + src.slice(at, j + 1).replace(/[^\n]/g, " ");
    i = j + 1;
  }
  return { css: out, medias };
}

/** [selector, body] pairs from a flat (non-media) stylesheet fragment. */
function flatRules(frag) {
  const rules = [];
  for (const [, sel, body] of frag.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    rules.push({ selector: sel.trim(), body });
  return rules;
}

function parseDecls(body) {
  const decls = new Map();
  for (const d of body.split(";")) {
    const c = d.indexOf(":");
    if (c === -1) continue;
    decls.set(d.slice(0, c).trim().toLowerCase(), d.slice(c + 1).trim());
  }
  return decls;
}

/** Resolve `var(--x)` chains and bare hexes against the token map.
 *  Returns {hex} or {unresolved: reason}; never guesses. */
function resolveColor(value, tokens) {
  let v = value.trim().replace(/!important$/, "").trim();
  const varM = /^var\(\s*(--[\w-]+)\s*\)$/.exec(v);
  if (varM) {
    const name = varM[1].slice(2);
    const bound = tokens.get(name);
    if (bound === undefined) return { unresolved: `${v} matches no :root token` };
    return resolveColor(bound, tokens);
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return { hex: v.toLowerCase() };
  if (/^rgba?\(/i.test(v)) return { unresolved: `${v} (functional form not frozen to :root)` };
  if (/^(none|transparent|currentcolor|inherit)$/i.test(v)) return { unresolved: `${v} paints no fixed colour` };
  return { unresolved: `${v} (not a colour this gate understands)` };
}

/* ------------------------------------------------------------------- the run */

let failed = 0;
const report = (ok, name, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

const cssText = readFileSync(CSS_PATH, "utf8");
const tokens = parseTokens(cssText);

console.log(`\nverify-contrast — primary CTA + skip link >= ${THRESHOLD}:1\n${"─".repeat(72)}`);

/* 1. CALIBRATION ------------------------------------------------------------ */

for (const [fg, bg, want, label] of [
  ["#000000", "#FFFFFF", 21.0, "black on white"],
  ["#FFFFFF", "#FFFFFF", 1.0, "white on white"],
  ["#777777", "#FFFFFF", 4.477, "#777 on white (near-miss, MUST fail)"],
  ["#767676", "#FFFFFF", 4.543, "#767676 on white (near-miss, MUST pass)"],
]) {
  const got = contrast(fg, bg);
  const ok = got !== null && Math.abs(got - want) < 0.01;
  report(ok, `calibration: ${label}`, `got ${fmt(got)}, textbook ${want}`);
}
report(
  contrast("#777777", "#FFFFFF") < THRESHOLD && contrast("#767676", "#FFFFFF") >= THRESHOLD,
  "calibration: the 4.5 boundary lands between #777 and #767676",
);

/* 2. STRUCTURE -------------------------------------------------------------- */

const CONTRACT = [
  { selector: ".btn--primary", bg: "--sig-deep", ink: "--ink-on-deep", note: "primary CTA (Start a build enquiry)" },
  // :hover declares only the fill; its ink is inherited from .btn--primary.
  { selector: ".btn--primary:hover", bg: "--sig-deepest", ink: "--ink-on-deep", inheritedInk: true, note: "primary CTA hover" },
  { selector: ".skip", bg: "--sig-deep", ink: "--ink-on-deep", note: "skip link" },
];

const { css: topLevel, medias } = liftMediaBlocks(cssText);
const rules = [
  ...flatRules(topLevel),
  ...medias.flatMap(({ cond, body }) =>
    flatRules(body).map((r) => ({ ...r, media: `@media ${cond}` })),
  ),
];

for (const c of CONTRACT) {
  const rule = rules.find((r) => r.selector.split(",")[0].trim() === c.selector && !r.media);
  if (!rule) {
    report(false, `structure: ${c.selector} exists at top level`, "selector not found");
    continue;
  }
  const decls = parseDecls(rule.body);
  const bg = decls.get("background") ?? decls.get("background-color");
  const ink = decls.get("color");
  const inkOk = c.inheritedInk ? (ink === undefined || ink === `var(${c.ink})`) : ink === `var(${c.ink})`;
  report(
    bg === `var(${c.bg})` && inkOk,
    `structure: ${c.selector} -> fill ${c.bg}, text ${c.ink}${c.inheritedInk ? " (inherited)" : ""}`,
    bg === `var(${c.bg})` && inkOk ? c.note : `found background:${bg ?? "∅"} color:${ink ?? "∅"}`,
  );

  /* done-state ban, as code: dark ink on neon phosphor is gone here.
     For an inherited-ink rule the ink is read off the base rule it cascades
     from (.btn--primary), because that is where the browser gets it. */
  let effectiveInk = ink;
  if (effectiveInk === undefined && c.inheritedInk) {
    const base = rules.find((r) => r.selector.split(",")[0].trim() === ".btn--primary" && !r.media);
    effectiveInk = base && parseDecls(base.body).get("color");
  }
  const BANNED_FILLS = ["--sig", "--sig-hi"]
    .map((n) => (tokens.get(n.slice(2)) || "").toLowerCase());
  const BANNED_INK = (tokens.get("ink-on-sig") || "").toLowerCase();
  const rbg = bg && resolveColor(bg, tokens);
  const rink = effectiveInk && resolveColor(effectiveInk, tokens);
  const clean =
    rbg?.hex && !BANNED_FILLS.includes(rbg.hex) &&
    rink?.hex && rink.hex !== BANNED_INK;
  report(
    !!clean,
    `ban held: ${c.selector} is off neon-phosphor fill and off --ink-on-sig`,
    clean ? `fill ${rbg.hex} · ink ${rink.hex}` : "resolved onto a banned value",
  );
}

/* 2b. MEASUREMENT OF THE CONTRACTED PAIRS ------------------------------------ */

for (const c of CONTRACT) {
  const inkHex = tokens.get(c.ink.slice(2));
  const bgHex = tokens.get(c.bg.slice(2));
  const r = contrast(inkHex, bgHex);
  report(
    r !== null && r >= THRESHOLD,
    `measure: ${c.selector} — ${c.ink} on ${c.bg}`,
    `${inkHex} on ${bgHex} = ${fmt(r)}${r !== null && r < THRESHOLD ? " (BELOW THRESHOLD)" : ""}`,
  );
}

/* 3. MEASUREMENT SWEEP ------------------------------------------------------ */

const touched = rules.filter((r) =>
  /\.(btn--primary|skip)\b/.test(r.selector.replace(/\.skip-link/g, "")),
);
report(touched.length > 0, "sweep found rules touching .btn--primary / .skip", `${touched.length} rule(s)`);

let pairs = 0;
let sweepFailed = 0;
for (const rule of touched) {
  const decls = parseDecls(rule.body);
  const bgV = decls.get("background") ?? decls.get("background-color");
  const inkV = decls.get("color");
  if (!bgV || !inkV) continue; // e.g. transform-only hover rule
  const bg = resolveColor(bgV, tokens);
  const ink = resolveColor(inkV, tokens);
  if (!bg.hex || !ink.hex) {
    sweepFailed++;
    report(
      false,
      `sweep: unresolvable pair under ${rule.selector}${rule.media ? ` [${rule.media}]` : ""}`,
      `${ink.unresolved ?? inkV} on ${bg.unresolved ?? bgV}`,
    );
    continue;
  }
  pairs++;
  const r = contrast(ink.hex, bg.hex);
  const ok = r !== null && r >= THRESHOLD;
  console.log(
    `      ${ok ? "  ok " : " FAIL"} ${rule.selector}${rule.media ? ` [${rule.media}]` : ""} — ${ink.hex} on ${bg.hex} = ${fmt(r)}`,
  );
  if (!ok) sweepFailed++;
}
report(sweepFailed === 0, `sweep: every measured pair >= ${THRESHOLD}:1`, `${pairs} pair(s) measured`);

/* The old pairing, for the record: proof the fix moved off it. */
const oldPair = contrast(tokens.get("ink-on-sig"), tokens.get("sig"));
console.log(`      note: legacy pairing --ink-on-sig on --sig measured ${fmt(oldPair)} (pre-issue-17 state, kept for provenance)`);

console.log("─".repeat(72));
console.log(failed ? `${failed} contrast check(s) FAILED` : "all contrast checks passed");
process.exit(failed ? 1 : 0);
