// The specimen tray: one label per piece of work, grouped by the thread it grew on.
//
// A view over three sources, all read at build: the work collection (lib/content), the threads
// (content/history/threads.ts) and the public-record snapshot (content/history/history.snapshot.json). Nothing on a
// label is typed. Dates, stars and merged changes come from the snapshot, the catalogue number from the snapshot's
// order (as on the home page), and the condition from the newest date the label prints.

import snapshot from "@/content/history/history.snapshot.json";
import { threads, type Thread } from "@/content/history/threads";
import { trayPlacements, traySpecimens } from "@/content/work/tray";
import { work } from "@/lib/content";
import type { FootFact, WorkEntry } from "@/lib/content/types";

export type Repo = (typeof snapshot.repos)[number];
export type Condition = "active" | "dormant" | "paused" | "private";

/** The day the public record was read. */
export const READ_AT = snapshot.generatedAt.slice(0, 10);
/** The same method line the home page prints under its figures. */
export const RECORD_METHOD = `GitHub, public data only, read ${READ_AT}.`;
/** A label is active when the newest date on it is less than this many days before the read. */
export const ACTIVE_DAYS = 30;
export const CONDITION_METHOD =
  `Active: the newest date on the label is less than ${ACTIVE_DAYS} days before the read. Dormant: it is older. ` +
  "Private: there is no public repository to read.";

const RELEASES = snapshot.releases as Record<string, { tag: string; date: string }[]>;
const position = new Map(snapshot.repos.map((r, i) => [r.name.toLowerCase(), i]));
const repoNamed = (name: string) => snapshot.repos[position.get(name.toLowerCase()) ?? -1];

const day = (iso: string) => Math.floor(Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) / 864e5);

/** Catalogue number: the repository's place in his public record, oldest first (the home page's cat()). */
export function catalogueNumber(repos: Repo[]): string | undefined {
  if (!repos.length) return undefined;
  const first = Math.min(...repos.map((r) => position.get(r.name.toLowerCase())!));
  return `JB-${String(first + 1).padStart(3, "0")}`;
}

/** The thread's repositories that the snapshot carries. */
export function threadRepos(thread: Thread): Repo[] {
  return thread.repos.map(repoNamed).filter((r): r is Repo => Boolean(r));
}

export const mergesIn = (repos: Repo[]) => repos.reduce((n, r) => n + r.merges.length, 0);
export const starsIn = (repos: Repo[]) => repos.reduce((n, r) => n + r.stars, 0);
export const releasesIn = (repos: Repo[]) => repos.reduce((n, r) => n + (RELEASES[r.name]?.length ?? 0), 0);

function threadById(id: string): Thread {
  const t = threads.find((x) => x.id === id);
  if (!t) throw new Error(`[tray] no thread "${id}" in content/history/threads.ts`);
  return t;
}

/** A repository by its short name inside a thread: the file that names it can only name what the thread allowlists. */
function repoInThread(thread: Thread, short: string): Repo {
  const matches = thread.repos.filter((r) => r.toLowerCase().endsWith(`/${short.toLowerCase()}`));
  const repo = matches.length === 1 ? repoNamed(matches[0]) : undefined;
  if (!repo) throw new Error(`[tray] "${short}" is not one repository of thread "${thread.id}" in the snapshot`);
  return repo;
}

export type Specimen = {
  key: string;
  thread: Thread;
  /** Absent when there is no public repository to number it by. */
  no?: string;
  name: string;
  /** The case study, when there is one. */
  entry?: WorkEntry;
  description: string;
  builtOn?: string;
  /** Public repositories behind the label. */
  repos: Repo[];
  licence?: string;
  /** First created and last pushed, across the label's repositories. */
  span?: { start: string; end: string };
  /** A still-running private branch this label claims (threads.ts). */
  privateBranch?: { label: string; start: string };
  condition: Condition;
};

function conditionOf(thread: Thread, repos: Repo[], privateStart?: string): Condition {
  if (thread.status === "paused") return "paused";
  if (!repos.length) return "private";
  const newest = [...repos.map((r) => r.pushed), ...(privateStart ? [privateStart] : [])].sort().at(-1)!;
  return day(READ_AT) - day(newest) < ACTIVE_DAYS ? "active" : "dormant";
}

function spanOf(repos: Repo[]) {
  if (!repos.length) return undefined;
  return {
    start: repos.map((r) => r.created).sort()[0],
    end: repos.map((r) => r.pushed).sort().at(-1)!,
  };
}

function threadForEntry(entry: WorkEntry): Thread {
  const placed = trayPlacements[entry.slug];
  if (placed) return threadById(placed.thread);
  const repo = entry.repo?.public ? `${entry.repo.owner}/${entry.repo.name}`.toLowerCase() : undefined;
  const byRepo = repo && threads.find((t) => t.repos.some((r) => r.toLowerCase() === repo));
  if (byRepo) return byRepo;
  const byWork = threads.find((t) => t.work === entry.slug);
  if (byWork) return byWork;
  throw new Error(`[tray] work/${entry.slug} belongs to no thread. Place it in content/work/tray.ts.`);
}

// Every repository a label names on its own, so a placement that reads "the rest of its thread" can leave them out.
const claimed = new Set<string>([
  ...work.filter((w) => w.repo?.public).map((w) => `${w.repo!.owner}/${w.repo!.name}`.toLowerCase()),
  ...traySpecimens.map((s) => repoInThread(threadById(s.thread), s.repo).name.toLowerCase()),
]);

function specimenForEntry(entry: WorkEntry): Specimen {
  const thread = threadForEntry(entry);
  const placed = trayPlacements[entry.slug];
  let repos: Repo[] = [];
  if (entry.repo?.public) {
    const repo = repoNamed(`${entry.repo.owner}/${entry.repo.name}`);
    if (!repo) throw new Error(`[tray] work/${entry.slug}: ${entry.repo.owner}/${entry.repo.name} is not in the snapshot`);
    repos = [repo];
  } else if (placed) {
    repos = threadRepos(thread).filter((r) => !claimed.has(r.name.toLowerCase()));
  }
  const branch = placed?.privateBranch ? thread.private?.find((p) => p.label === placed.privateBranch) : undefined;
  if (placed?.privateBranch && !branch) {
    throw new Error(`[tray] work/${entry.slug}: thread "${thread.id}" has no private branch "${placed.privateBranch}"`);
  }
  return {
    key: entry.slug,
    thread,
    no: catalogueNumber(repos),
    name: entry.title,
    entry,
    description: entry.summary,
    repos,
    licence: entry.repo?.license,
    span: spanOf(repos),
    privateBranch: branch && !branch.end ? { label: branch.label, start: branch.start } : undefined,
    condition: conditionOf(thread, repos, branch && !branch.end ? branch.start : undefined),
  };
}

const specimens: Specimen[] = [
  ...work.map(specimenForEntry),
  ...traySpecimens.map((s) => {
    const thread = threadById(s.thread);
    const repos = [repoInThread(thread, s.repo)];
    return {
      key: repos[0].name,
      thread,
      no: catalogueNumber(repos),
      name: s.name,
      description: s.description,
      builtOn: s.builtOn,
      repos,
      licence: s.licence,
      span: spanOf(repos),
      condition: conditionOf(thread, repos),
    } satisfies Specimen;
  }),
];

/** The label for one case study. */
export function specimenFor(slug: string): Specimen {
  const s = specimens.find((x) => x.entry?.slug === slug);
  if (!s) throw new Error(`[tray] no specimen for work/${slug}`);
  return s;
}

export type TrayGroup = { thread: Thread; specimens: Specimen[]; repos: Repo[] };

const firstDate = (s: Specimen) => s.span?.start ?? s.entry?.timeframe.start ?? "";

/** Threads in their curated order; labels inside a thread oldest first. */
export const tray: TrayGroup[] = threads
  .map((thread) => ({
    thread,
    specimens: specimens.filter((s) => s.thread.id === thread.id).sort((a, b) => firstDate(a).localeCompare(firstDate(b))),
    repos: threadRepos(thread),
  }))
  .filter((g) => g.specimens.length > 0);

/** The threads with no label in the tray: the rest of the public record, one line each. */
export const restOfRecord: TrayGroup[] = threads
  .filter((t) => !tray.some((g) => g.thread.id === t.id))
  .map((thread) => ({ thread, specimens: [], repos: threadRepos(thread) }));

/**
 * A card's foot facts, the way the old work cards printed them (P0-1): every numeral arrives from a field or a
 * counted measure with its method. The facts a label already prints itself (stars, licence) are left out.
 */
export function footFacts(entry: WorkEntry): ({ text: string } | { count: number; unit: string; method: string })[] {
  return entry.footFacts
    .map((fact: FootFact) => {
      if ("label" in fact) return { text: fact.label };
      if ("count" in fact) return { count: fact.count, unit: fact.unit, method: fact.method };
      if (fact.field === "stack.primary") return entry.stack[0] ? { text: entry.stack[0] } : null;
      if (fact.field === "anonymized") return { text: entry.anonymized ? "Anonymized" : "Named" };
      return null;
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);
}
