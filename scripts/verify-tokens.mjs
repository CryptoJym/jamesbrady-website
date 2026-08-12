#!/usr/bin/env node
// TOKEN DISCIPLINE — design-system-spec §7.2, as an executable gate.
//
//   npm run verify:tokens        (no server, no browser, ~50ms)
//
// The rule: no hex / rgb() / rgba() colour literal outside a :root block.
// Wave 2 needed the first exemption to it — app/icon.svg must inline its
// hexes, because a browser fetching an icon has never seen the stylesheet —
// and "add it to the lint's allowlist" turned out to mean "write the lint".
//
// SCOPE — WHOLE REPO AS OF WAVE 4. This gate used to carry two exclusions:
// the LEGACY SKIN block at the foot of globals.css, and components/ outside
// components/site/. Both existed for the same reason: the archived routes kept
// their old gold palette on purpose, and a gate that went red on them from day
// one would be a gate everyone learned to ignore.
//
// Wave 4 reskinned /primer, /manuscript, /workshop and /watch onto Direction B
// at their original URLs. The LEGACY SKIN block is deleted, the (legacy) route
// group is deleted, and the components that painted the old palette are
// deleted. So the exclusions are gone and this gate now reads every stylesheet
// rule and every component in the repo — which is what the wave-2 note said
// would happen, and it took no other change.
//
// The allowlist has TWO halves. A file on it may repeat a token value; it may
// not invent a colour. Every literal in an exempted file is then checked
// against :root, so an "exempt" asset cannot drift away from the palette.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { parseRootTokens, scanForLiterals, scanFrozen } from "./lib/token-gate.mjs";
import { APPLE_OUT, ICO_OUT, ROOT, renderIcons } from "./lib/icon-raster.mjs";

const CSS = join(ROOT, "app", "globals.css");

/**
 * Files that may carry a colour literal, each with the reason it must.
 * Every one of them is ALSO checked against :root below.
 */
const ALLOWLIST = new Map([
  [
    "app/icon.svg",
    "rasterized brand asset — a browser fetches the icon on its own, with no " +
      "stylesheet in scope, so var(--sig) would resolve to nothing",
  ],
  [
    "app/layout.tsx",
    "viewport.themeColor — the browser paints its own chrome with this value " +
      "before, and outside, any stylesheet of ours",
  ],
]);

let failed = 0;
const report = (name, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const rel = (p) => relative(ROOT, p).split("\\").join("/");

console.log(`\nverify-tokens — no colour literal outside :root\n${"─".repeat(72)}`);

/* ------------------------------------------------------- 1. the token set */

const cssText = readFileSync(CSS, "utf8");
const tokens = parseRootTokens(cssText);
report("1. :root declares a token palette", tokens.size > 0, `${tokens.size} colour values`);

/* --------------------------------------------- 2. globals.css, Direction B */

const cssHits = scanForLiterals(cssText, { css: true });
report(
  "2. globals.css: no colour literal outside :root",
  cssHits.length === 0,
  cssHits.length
    ? cssHits.map((h) => `line ${h.line}: ${h.literal}`).join(" | ")
    : `whole file scanned, ${cssText.split("\n").length} lines`,
);

/* -------------------------------------------- 3. Direction B TS/TSX + SVG */

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === ".next") continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|svg)$/.test(name)) out.push(p);
  }
  return out;
};

// components/, not components/site/. The wave-2 exclusion existed for the
// archived skin's components; they are deleted, so the whole directory is in
// scope and a new component cannot paint a literal by living one level up.
const sourceFiles = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components"))];

const srcHits = [];
for (const file of sourceFiles) {
  const name = rel(file);
  if (ALLOWLIST.has(name)) continue;
  for (const h of scanForLiterals(readFileSync(file, "utf8")))
    srcHits.push(`${name}:${h.line} ${h.literal}`);
}
report(
  `3. Direction B sources: no colour literal (${sourceFiles.length} files, ${ALLOWLIST.size} allowlisted)`,
  srcHits.length === 0,
  srcHits.length ? srcHits.join(" | ") : [...ALLOWLIST.keys()].join(" · "),
);

/* ------------------------------- 4. the allowlist's other half: FROZEN, not free */

const drifted = [];
for (const [name, reason] of ALLOWLIST) {
  const text = readFileSync(join(ROOT, name), "utf8");
  const bad = scanFrozen(text, tokens);
  for (const h of bad) drifted.push(`${name}:${h.line} ${h.literal} matches no :root token`);
  if (!bad.length) console.log(`      ${name} — ${reason}`);
}
report(
  "4. Allowlisted files froze a TOKEN, not a colour of their own",
  drifted.length === 0,
  drifted.length ? drifted.join(" | ") : "every frozen literal still equals its token",
);

/* ------------------------- 5. the raster siblings are the SVG, not a memory of it */

const { apple, ico } = renderIcons();
const same = (buf, path) => {
  try {
    return Buffer.compare(buf, readFileSync(path)) === 0;
  } catch {
    return false;
  }
};
const appleOk = same(apple, APPLE_OUT);
const icoOk = same(ico, ICO_OUT);
report(
  "5. app/apple-icon.png + app/favicon.ico are in sync with app/icon.svg",
  appleOk && icoOk,
  appleOk && icoOk
    ? `${apple.length} + ${ico.length} bytes, re-rendered and byte-identical`
    : `stale: ${[!appleOk && "apple-icon.png", !icoOk && "favicon.ico"].filter(Boolean).join(", ")} — run \`npm run icons\``,
);

console.log("─".repeat(72));
console.log(failed ? `${failed} token check(s) FAILED` : "all token checks passed");
process.exit(failed ? 1 : 0);
