// Render the generated grounding-pack module. Shared by scripts/build-pack.mjs
// (which writes it) and scripts/verify-ask.mjs (which regenerates and compares).
// One renderer, so the writer and the drift check cannot disagree about what
// the file should contain.

import { createHash } from "node:crypto";
import { join } from "node:path";

import { ROOT, importTs } from "./ts-register.mjs";

export const PACK_MODULE_PATH = join(ROOT, "lib", "ask", "grounding-pack.generated.ts");

export async function renderPackModule() {
  const { buildGroundingPack } = await importTs("lib/ask/pack.ts");
  const pack = buildGroundingPack();
  const sha = createHash("sha256").update(pack).digest("hex");
  const lines = pack.split("\n").map((line) => JSON.stringify(line));

  const source = `// GENERATED FILE. Do not edit by hand.
//
//   npm run pack          regenerate
//   npm run verify:ask    fails if this file has drifted from lib/ask/pack.ts
//
// Written by scripts/build-pack.mjs from lib/ask/pack.ts, which reads the
// content collections. Every line below traces to content/**; nothing here was
// typed. Kept as an array of lines so a review diff shows which section of the
// site moved, not one changed megabyte.

/** sha256 of the pack text, for the drift check and the health payload. */
export const GROUNDING_PACK_SHA256 = ${JSON.stringify(sha)};

export const GROUNDING_PACK = [
${lines.map((line) => `  ${line},`).join("\n")}
].join("\\n");
`;

  return { pack, sha, source };
}
