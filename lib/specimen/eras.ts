// The home page's descent, as spans of the record. Depth is time, so each era sits at the depth of its dates in
// the glass (makeDepth in grow.ts, the same time warp the specimen grows by). The page reads these to travel the
// rendered sculpture down with the reader, and scripts/specimen/sculpture.py reads them to cut each era's window
// out of the plate for screens too narrow to hold the sculpture beside the text.

export type Era = {
  id: string;
  /** First day of the era (YYYY-MM-DD). */
  from: string;
  /** Last day of the era, or null for "to the tip": the day the record was read. */
  to: string | null;
};

export const ERAS = [
  { id: "2023-2024", from: "2023-03-01", to: "2024-12-31" },
  { id: "2025", from: "2025-01-01", to: "2025-12-31" },
  { id: "2025-10-2026-03", from: "2025-10-01", to: "2026-03-31" },
  { id: "2026-04-2026-07", from: "2026-04-01", to: "2026-07-31" },
  { id: "2026-08", from: "2026-08-01", to: "2026-08-31" },
  { id: "2026-09", from: "2026-09-01", to: null },
] as const satisfies readonly Era[];

/** The tip: the last days of the record, where the heat is. */
export const TIP_DAYS = 10;

export const eraById = (id: string) => {
  const e = ERAS.find((x) => x.id === id);
  if (!e) throw new Error(`[eras] no era "${id}"`);
  return e;
};
