// Export the grown specimen (the same geometry the browser draws) as JSON, for the Blender still.
// Run: node --experimental-strip-types --no-warnings scripts/specimen/export.mjs <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { grow } = await import(join(ROOT, "lib/specimen/grow.ts"));
const { threads } = await import(join(ROOT, "content/history/threads.ts"));
const snapshot = JSON.parse(readFileSync(join(ROOT, "content/history/history.snapshot.json"), "utf8"));
const s = grow(snapshot, threads);
const out = process.argv[2] ?? join(ROOT, "specimen.json");
writeFileSync(out, JSON.stringify({ generatedAt: s.generatedAt, height: s.height, tubes: s.tubes.map((t) => ({ kind: t.kind, frosted: t.frosted, cut: t.cut, points: t.points, radii: t.radii, heat: t.heat })), beads: s.beads.map((b) => ({ p: b.p, r: b.r })) }));
console.log(`exported ${s.tubes.length} tubes, ${s.beads.length} beads to ${out}`);
