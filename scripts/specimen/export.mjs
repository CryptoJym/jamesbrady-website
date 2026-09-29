// Export the grown specimen (the same geometry the browser draws) as JSON, for the Blender film and stills.
// Run: node --experimental-strip-types --no-warnings scripts/specimen/export.mjs <out.json>
//
// Each tube carries its id and its work's status. The film script (fulgurite.py) reads `status`: "live" and
// "shipped" are its brightest glass, and anything else renders as it always has. Each bead carries its kind:
// "merge" (a merged change) or "outcome" (a result for a client, or people taught), and outcomes are the larger beads.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { grow } = await import(join(ROOT, "lib/specimen/grow.ts"));
const { threads } = await import(join(ROOT, "content/history/threads.ts"));
const { built } = await import(join(ROOT, "content/built/index.ts"));
const snapshot = JSON.parse(readFileSync(join(ROOT, "content/history/history.snapshot.json"), "utf8"));
const s = grow(snapshot, threads, { built });
const out = process.argv[2] ?? join(ROOT, "specimen.json");
writeFileSync(
  out,
  JSON.stringify({
    generatedAt: s.generatedAt,
    height: s.height,
    tubes: s.tubes.map((t) => ({
      id: t.id,
      kind: t.kind,
      frosted: t.frosted,
      cut: t.cut,
      status: t.status ?? "none",
      item: t.item,
      points: t.points,
      radii: t.radii,
      heat: t.heat,
    })),
    beads: s.beads.map((b) => ({ p: b.p, r: b.r, kind: b.kind })),
  }),
);
const count = (f) => s.tubes.filter(f).length;
console.log(
  `exported ${s.tubes.length} tubes (${count((t) => t.status === "live")} live, ${count((t) => t.status === "shipped")} shipped, ` +
    `${count((t) => t.status === "retired")} retired, ${count((t) => t.status === "unknown")} unknown, ${count((t) => !t.status)} with no status), ` +
    `${s.beads.length} beads (${s.beads.filter((b) => b.kind === "outcome").length} outcomes) to ${out}`,
);
