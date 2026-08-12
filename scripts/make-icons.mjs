#!/usr/bin/env node
// Write the raster siblings of app/icon.svg.
//
//   npm run icons
//
// All of the drawing lives in scripts/lib/icon-raster.mjs, so the verifier can
// render the same bytes without writing anything to the working tree.

import { writeFileSync } from "node:fs";
import { relative } from "node:path";

import { APPLE_OUT, ICO_OUT, ROOT, renderIcons } from "./lib/icon-raster.mjs";

const { apple, ico } = renderIcons();

writeFileSync(APPLE_OUT, apple);
console.log(`wrote ${relative(ROOT, APPLE_OUT)} (180x180, ${apple.length} bytes)`);

writeFileSync(ICO_OUT, ico);
console.log(`wrote ${relative(ROOT, ICO_OUT)} (16/32/48, ${ico.length} bytes)`);
