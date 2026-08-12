// ESM resolve hook: lets a plain `node` script import the repo's TypeScript
// content source directly.
//
// Node 22 strips types on its own. What it does not do is resolve two things
// the repo's TS uses: the `@/` root alias from tsconfig, and extensionless or
// directory imports (`./universal-question-geometry`, `@/content/work`). Both
// are resolved here so scripts/build-pack.mjs and scripts/verify-ask.mjs read
// the SAME modules the app reads, instead of a second copy of the content that
// could drift from it.
//
// Registered by scripts/lib/ts-register.mjs. PACK_ROOT carries the repo root
// because a hook runs in its own loader thread with its own cwd.

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = pathToFileURL(`${process.env.PACK_ROOT}/`).href;

/** Try the TS shapes tsc would try, in tsc's order. */
function resolveTs(url) {
  if (!url.startsWith("file:")) return url;
  const path = fileURLToPath(url);
  if (/\.(ts|tsx)$/.test(path) && existsSync(path)) return url;
  for (const candidate of [`${path}.ts`, `${path}.tsx`, `${path}/index.ts`, `${path}/index.tsx`]) {
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return url;
}

export function resolve(specifier, context, next) {
  const spec = specifier.startsWith("@/") ? ROOT + specifier.slice(2) : specifier;
  if (spec.startsWith("file:") || spec.startsWith("./") || spec.startsWith("../")) {
    const absolute = spec.startsWith("file:") ? spec : new URL(spec, context.parentURL).href;
    return next(resolveTs(absolute), context);
  }
  return next(spec, context);
}
