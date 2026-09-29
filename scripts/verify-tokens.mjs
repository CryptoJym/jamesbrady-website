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
// FULGURITE (2026-09-27). The accepted design declares its palette in
// app/fg.css :root and styles through fg.css, fg-a.css and fg-b.css. The gate
// used to read one stylesheet, globals.css, so it neither saw the new rules nor
// knew the new tokens: the themeColor in app/layout.tsx is --ground, and it was
// reported as "matches no :root token". Every stylesheet is now read, for its
// :root tokens and for literals outside :root.
//
// The allowlist has TWO halves. A file on it may repeat a token value; it may
// not invent a colour. Every literal in an exempted file is then checked
// against :root, so an "exempt" asset cannot drift away from the palette.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { parseRootTokens, scanForLiterals, scanFrozen } from "./lib/token-gate.mjs";
import { APPLE_OUT, ICO_OUT, ROOT, renderIcons } from "./lib/icon-raster.mjs";
import { sameImage } from "./lib/png.mjs";

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
    "viewport.themeColor (--ground) — the browser paints its own chrome with " +
      "this value before, and outside, any stylesheet of ours",
  ],
]);
// RETIRED 2026-09-29: "components/specimen/Specimen.tsx" (the bead material, --bead, painted into WebGL). The live
// three.js drawing of the specimen is gone: visitors now see the Blender render of it, and the three.js light laid
// over that render (components/specimen/light.ts) reads --glass from :root at run time, so no source file needs a
// colour literal for it. The exemption is removed, not moved: one fewer file may carry a literal.

let failed = 0;
const report = (name, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const rel = (p) => relative(ROOT, p).split("\\").join("/");

console.log(`\nverify-tokens — no colour literal outside :root\n${"─".repeat(72)}`);

const walk = (dir, out = [], ext = /\.(tsx?|svg)$/) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === ".next") continue;
    if (statSync(p).isDirectory()) walk(p, out, ext);
    else if (ext.test(name)) out.push(p);
  }
  return out;
};

/* ------------------------------------------------------- 1. the token set */

// Every stylesheet, not one: the Fulgurite palette lives in app/fg.css and the
// Direction B tokens globals.css still declares stay tokens (app/icon.svg froze two).
const sheets = [...walk(join(ROOT, "app"), [], /\.css$/), ...walk(join(ROOT, "components"), [], /\.css$/)].map(
  (p) => ({ name: rel(p), text: readFileSync(p, "utf8") }),
);
const tokens = new Set(sheets.flatMap((s) => [...parseRootTokens(s.text)]));
report(
  "1. :root declares a token palette",
  tokens.size > 0,
  `${tokens.size} colour values across ${sheets.map((s) => s.name).join(", ")}`,
);

/* ----------------------------------------------------- 2. every stylesheet */

const cssHits = sheets.flatMap((s) =>
  scanForLiterals(s.text, { css: true }).map((h) => `${s.name}:${h.line} ${h.literal}`),
);
report(
  `2. Stylesheets: no colour literal outside :root (${sheets.length} files)`,
  cssHits.length === 0,
  cssHits.length
    ? cssHits.join(" | ")
    : `whole files scanned, ${sheets.reduce((n, s) => n + s.text.split("\n").length, 0)} lines`,
);

/* -------------------------------------------------- 3. TS/TSX + SVG sources */

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
  `3. Sources: no colour literal (${sourceFiles.length} files, ${ALLOWLIST.size} allowlisted)`,
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

// Compared as IMAGES (header and pixels), not as bytes. The bytes include the
// deflate stream, which belongs to the zlib Node was built with: the same icon
// re-rendered on Homebrew's node@22 (system zlib 1.2.12) and on the official
// Node 22 build CI installs (bundled zlib 1.3.1) differs in every compressed
// byte and in no pixel. A byte compare went red on one of those machines for a
// reason that had nothing to do with the icon.
const { apple, ico } = renderIcons();
const same = (buf, path) => {
  try {
    return sameImage(buf, readFileSync(path));
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
    ? "re-rendered: same size, same pixels, every image"
    : `stale: ${[!appleOk && "apple-icon.png", !icoOk && "favicon.ico"].filter(Boolean).join(", ")} — run \`npm run icons\``,
);

console.log("─".repeat(72));
console.log(failed ? `${failed} token check(s) FAILED` : "all token checks passed");
process.exit(failed ? 1 : 0);
