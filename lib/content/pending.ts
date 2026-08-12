// The open-items register — every `[JAMES: …]` gap the site is carrying.
//
// WHY THIS EXISTS. The gaps were always honest and always visible. What the
// five-persona audit found is that visibility is not the same as placement: a
// buyer landing on /about met four questions addressed to somebody else,
// phrased as things James still has to do, and read the page as unfinished
// rather than as candid. The honesty was doing the opposite of its job.
//
// So the marks stay in the source, buyer pages render them in the third person
// (lib/content/markdown.ts, PendingRender), and the full second-person register
// renders in exactly one place: /now, which is the work log. A work log is
// where a work log belongs.
//
// The list below is DERIVED. Nobody maintains a second copy of it, so an item
// cannot be quietly dropped from the register while its gap is still in the
// page, and closing a gap in the source removes it from /now the same build.

import { siteProse } from "@/content/site";
import { extractGaps } from "./markdown";
import { lab, learn, now, offers, theories, work } from "./index";
import type { AnyEntry } from "./types";

export type PendingItem = {
  /** What a reader sees as the source: "Case study, the visibility platform". */
  where: string;
  /** The route the gap renders on. */
  path: string;
  /** The question, exactly as the source carries it. */
  question: string;
};

const COLLECTION_LABEL: Record<AnyEntry["collection"], string> = {
  work: "Case study",
  theories: "Theory",
  lab: "Lab artifact",
  learn: "Archived volume",
  now: "This page",
  offers: "Work with me",
};

function entryPathFor(entry: AnyEntry): string {
  switch (entry.collection) {
    case "work":
      return `/work/${entry.slug}`;
    case "theories":
      return `/theories/${entry.slug}`;
    case "lab":
      return "/lab";
    case "learn":
      return entry.volumeRoute;
    case "now":
      return "/now";
    case "offers":
      return `/work-with-me/${entry.slug}`;
  }
}

function fromEntries(entries: AnyEntry[]): PendingItem[] {
  return entries.flatMap((entry) =>
    extractGaps(entry.body).map((question) => ({
      where: `${COLLECTION_LABEL[entry.collection]}, ${entry.title}`,
      path: entryPathFor(entry),
      question,
    })),
  );
}

/**
 * Every open question, collection entries first and then the hand-built pages.
 * Order is stable across builds because both inputs are ordered arrays.
 */
export const pendingItems: PendingItem[] = [
  ...fromEntries([...work, ...theories, ...lab, ...learn, ...offers, now]),
  ...siteProse.flatMap((prose) =>
    extractGaps(prose.body).map((question) => ({
      where: prose.where,
      path: prose.path,
      question,
    })),
  ),
];

/** Computed, never typed. The /now block prints this beside the list. */
export const pendingCount = pendingItems.length;

/** The routes carrying open items, in first-appearance order. */
export const pendingPaths: string[] = [...new Set(pendingItems.map((i) => i.path))];
