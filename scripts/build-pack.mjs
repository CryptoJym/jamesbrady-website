#!/usr/bin/env node
// Freeze the grounding pack into a committed module.
//
//   node scripts/build-pack.mjs           write lib/ask/grounding-pack.generated.ts
//   node scripts/build-pack.mjs --check   exit 1 if the committed copy has drifted
//
// Why a generated FILE and not a call at request time:
//
//   · The route must not evaluate the content collections, or shell out to git
//     through lib/seo/routes, on a cold start. A deployed lambda has no .git.
//   · The pack is the stable cache prefix. Freezing it at build makes the cache
//     key change exactly when the site changes and at no other moment.
//   · A file on disk is a thing the gates can read. verify-seo scans it for
//     client names beside every other public artifact, and verify-ask
//     regenerates it and compares, so the committed copy is a FUNCTION of the
//     content source rather than a memory of it. Same discipline as the icon
//     raster check in verify-tokens.
//
// It is committed rather than gitignored because `npm run typecheck` imports it
// and runs before `npm run build` in CI. A generated file that only exists
// after a build is a file the first gate cannot see.

import { readFileSync, writeFileSync } from "node:fs";

import { PACK_MODULE_PATH, renderPackModule } from "./lib/pack-module.mjs";

const check = process.argv.includes("--check");
const { pack, sha, source } = await renderPackModule();

if (check) {
  let current = "";
  try {
    current = readFileSync(PACK_MODULE_PATH, "utf8");
  } catch {
    current = "";
  }
  if (current !== source) {
    console.error(
      "DRIFT: lib/ask/grounding-pack.generated.ts is not what lib/ask/pack.ts produces.\n" +
        "       Run `npm run pack` and commit the result.",
    );
    process.exit(1);
  }
  console.log(`grounding pack in sync — ${pack.length} chars, sha256:${sha.slice(0, 12)}`);
} else {
  writeFileSync(PACK_MODULE_PATH, source);
  console.log(
    `wrote lib/ask/grounding-pack.generated.ts — ${pack.length} chars, ` +
      `${pack.split("\n").length} lines, sha256:${sha.slice(0, 12)}`,
  );
}
