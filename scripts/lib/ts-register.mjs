// Register the TS resolve hook and hand back the repo root.
//
//   import { ROOT, importTs } from "./lib/ts-register.mjs";
//   const { buildGroundingPack } = await importTs("lib/ask/pack.ts");

import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

process.env.PACK_ROOT = ROOT;
register("./ts-resolve.mjs", import.meta.url);

/** Import a repo-relative TypeScript module. */
export function importTs(relativePath) {
  return import(pathToFileURL(join(ROOT, relativePath)).href);
}
