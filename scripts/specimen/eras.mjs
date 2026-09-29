// Where each of the home page's eras sits in the glass, for scripts/specimen/sculpture.py.
// Run: node --experimental-strip-types --no-warnings scripts/specimen/eras.mjs <out.json>
//
// Depth is time: an era's dates go through the same time warp the specimen grows by (makeDepth in
// lib/specimen/grow.ts), so its window in the rendered plate is the glass that grew in those months.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { makeDepth } = await import(join(ROOT, "lib/specimen/grow.ts"));
const { ERAS, TIP_DAYS } = await import(join(ROOT, "lib/specimen/eras.ts"));
const snapshot = JSON.parse(readFileSync(join(ROOT, "content/history/history.snapshot.json"), "utf8"));
const H = 12; // grow()'s height, which the exported specimen carries as "height"
const now = snapshot.generatedAt.slice(0, 10);
const depth = makeDepth(now);
const y = (date) => (date === null ? -H : -H * depth(date));
const day = (d, add) => new Date(Date.parse(d + "T00:00:00Z") + add * 864e5).toISOString().slice(0, 10);
const eras = ERAS.map((e, i) => ({
  id: e.id,
  from: e.from,
  to: e.to,
  y0: y(e.from),
  y1: y(e.to),
  // The descent travels each era's own stretch of glass, up to where the next era begins.
  yNext: i + 1 < ERAS.length ? y(ERAS[i + 1].from) : -H,
}));
const out = { height: H, now, eras, tip: { from: day(now, -TIP_DAYS), y0: y(day(now, -TIP_DAYS)), y1: -H } };
writeFileSync(process.argv[2] ?? join(ROOT, "eras.json"), JSON.stringify(out, null, 2));
console.log(eras.map((e) => `${e.id}: y ${e.y0.toFixed(2)} to ${e.y1.toFixed(2)}`).join(" · "));
