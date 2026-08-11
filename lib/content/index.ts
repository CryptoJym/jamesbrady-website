// The one content source. Every consumer imports THIS module.
//
// design-system-spec §6: every number rendered anywhere on the site is computed
// here at build time. Hand-typed figures are a banned defect class — the old
// site printed "298 tools cataloged" when the computed count was 36.
//
// Validation runs at module evaluation, so `next build` cannot render a page
// from content that breaks a contract.

import { work as workRaw } from "@/content/work";
import { theories as theoriesRaw } from "@/content/theories";
import { lab as labRaw } from "@/content/lab";
import { learn as learnRaw } from "@/content/learn";
import { now as nowRaw } from "@/content/now/now";
import { validateAll } from "./validate";
import {
  MATURITY_ORDER,
  type AnyEntry,
  type LabEntry,
  type LearnEntry,
  type Maturity,
  type NowEntry,
  type TheoryEntry,
  type WorkEntry,
} from "./types";

const validated = validateAll({
  work: workRaw,
  theories: theoriesRaw,
  lab: labRaw,
  learn: learnRaw,
  now: [nowRaw],
});

export const work: WorkEntry[] = validated.work;
export const theories: TheoryEntry[] = validated.theories;
export const lab: LabEntry[] = validated.lab as LabEntry[];
export const learn: LearnEntry[] = validated.learn as LearnEntry[];
export const now: NowEntry = validated.now[0];

export const collections = { work, theories, lab, learn, now: [now] };

// ---------------------------------------------------------------------------
// Derived values. Nothing below may be typed into a template.
// ---------------------------------------------------------------------------

/** Systems listed = the length of the work collection. */
export const systemsListed = work.length;

/** A maintained constant, not a derived field (design-system-spec §6.6). */
export const OPERATORS = 1;

export const publicRepos = work
  .filter((w) => w.repo?.public)
  .map((w) => ({ entry: w, repo: w.repo! }));

/** Repo names printed inline so a human reading the page can check the count. */
export const publicRepoNames = publicRepos.map((r) => r.repo.name);

/** Summed across all public repos; the method is stated wherever this renders. */
export const outsideStars = publicRepos.reduce(
  (n, r) => n + (r.repo.stars ?? 0),
  0,
);

/** The date the repo signals above were observed, for the method line. */
export const repoSnapshotDate = publicRepos
  .map((r) => r.repo.snapshotAt)
  .filter(Boolean)
  .sort()
  .slice(-1)[0];

export function maturityAtLeast(m: Maturity, floor: Maturity): boolean {
  return MATURITY_ORDER.indexOf(m) >= MATURITY_ORDER.indexOf(floor);
}

/**
 * Discovery surfaces exclude "named-only" theories (brief). The homepage count
 * and the rows it counts are the same list — they cannot drift apart.
 */
export const discoverableTheories = theories.filter((t) =>
  maturityAtLeast(t.maturity, "sketched"),
);

export const theoriesListed = discoverableTheories.length;
export const theoriesPaused = discoverableTheories.filter((t) => t.paused).length;
export const theoriesActive = theoriesListed - theoriesPaused;

/** Work entries that earn a slot in the home proof bank. */
export const proofSlots = work.filter((w) => w.proofMetric);

export const indexableLab = lab.filter((l) => !l.noindex);

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function workBySlug(slug: string): WorkEntry | undefined {
  return work.find((w) => w.slug === slug);
}

export function theoryBySlug(slug: string): TheoryEntry | undefined {
  return theories.find((t) => t.slug === slug);
}

/** Every entry across every collection, for the generated artifacts. */
export const allEntries: AnyEntry[] = [
  ...work,
  ...theories,
  ...lab,
  ...learn,
  now,
];

/** Route path for any entry. Index routes are listed separately in lib/seo/routes.ts. */
export function entryPath(entry: AnyEntry): string {
  switch (entry.collection) {
    case "work":
      return `/work/${entry.slug}`;
    case "theories":
      return `/theories/${entry.slug}`;
    case "lab":
      return "/lab";
    case "learn":
      return (entry as LearnEntry).volumeRoute;
    case "now":
      return "/now";
  }
}

/** Most recent dateModified across a set — index routes carry max(children). */
export function maxModified(entries: { dateModified: string }[]): string {
  return entries.map((e) => e.dateModified).sort().slice(-1)[0];
}

/** Whole weeks since an ISO date. Used by /now — never typed. */
export function weeksSince(iso: string, from = new Date()): number {
  const ms = from.getTime() - Date.parse(`${iso}T00:00:00Z`);
  return Math.max(0, Math.floor(ms / (7 * 86_400_000)));
}

export function daysSince(iso: string, from = new Date()): number {
  const ms = from.getTime() - Date.parse(`${iso}T00:00:00Z`);
  return Math.max(0, Math.floor(ms / 86_400_000));
}
