// The specimen tray on /work: the pieces of work that have no case study of their own, and the one case study whose
// thread can't be read from its own repository.
//
// Editorial, and sourced. Nothing here is a number: every date and count on a label is read from
// content/history/history.snapshot.json at build (lib/tray.ts). The descriptions and licences are the [checked] lines
// of the 2026-09-27 work study (WORK.md, sections 1.2, 1.3 and 1.5). A repository is named by its short name inside a
// thread of content/history/threads.ts, so this file can only point at a repository that thread already allowlists;
// lib/tray.ts fails the build if one doesn't resolve.

export type TraySpecimen = {
  /** Thread id in content/history/threads.ts. */
  thread: string;
  /** The repository's name inside that thread, without its owner. */
  repo: string;
  name: string;
  description: string;
  /** Other people's work it stands on, credited by name. */
  builtOn?: string;
  licence: string;
};

export const traySpecimens: TraySpecimen[] = [
  {
    thread: "fleet",
    repo: "borg",
    name: "BORG",
    description:
      "A free kit you install on your own Macs. It gives your AI agents one shared memory and common tools.",
    builtOn: "Built on mem0, Graphiti, Beads, Qdrant, FalkorDB and Ollama.",
    licence: "MIT",
  },
  {
    thread: "fleet",
    repo: "agent-landing-fleet",
    name: "agent-landing-fleet",
    description:
      "Runs many coding agents across machines. Its rule: “Merged on main, or it does not exist.”",
    licence: "MIT",
  },
  {
    thread: "fleet",
    repo: "loop-distillery",
    name: "loop-distillery",
    description:
      "Trains a small, cheap model to take over one job from a big one, then tests it on real work.",
    licence: "MIT",
  },
  {
    thread: "minds",
    repo: "eegt",
    name: "EEGT",
    description:
      "An open research notebook. It asks whether different computer models “hear” the same recurring patterns in brainwave recordings. Every primary result so far is reported as inconclusive.",
    licence: "MIT",
  },
];

/**
 * A case study that has no repository of its own. Its label reads the thread's public repositories that no other
 * label claims, and, when it names one, the thread's private branch.
 */
export const trayPlacements: Record<string, { thread: string; privateBranch?: string }> = {
  "of-one-family": { thread: "of-one", privateBranch: "The Of One sites, on one template" },
};
