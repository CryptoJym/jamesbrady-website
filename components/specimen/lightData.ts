// Everything the sculpture's light needs, loaded only when it is first wanted (after the page is up, or on a first
// tap): three.js, the grown specimen, and the words for each fork. The notes are the ones the live view showed.

import { STATUS_WORD, built, builtSpan } from "@/content/built";
import snapshot from "@/content/history/history.snapshot.json";
import { OUTSIDE_WORK, threads } from "@/content/history/threads";
import { grow, type Snapshot, type Tube } from "@/lib/specimen/grow";

import { SpecimenLight } from "./light";

const PRIVATE = "Private work: you can see it exists, not inside it.";
const INFO = [...threads.map((t) => ({ id: t.id, name: t.name, note: t.note })), OUTSIDE_WORK];

let specimen: ReturnType<typeof grow> | null = null;

/** A new light over the rendered sculpture, or null where WebGL is not available. */
export function makeLight(): SpecimenLight | null {
  specimen ??= grow(snapshot as Snapshot, threads, { built });
  try {
    return new SpecimenLight(specimen);
  } catch {
    return null;
  }
}

/** What the note says about a fork: the work it is, when there is one, with its status and dates. */
export function describe(tube: Tube): { title: string; note: string } | null {
  const item = tube.item ? built.find((b) => b.id === tube.item) : undefined;
  if (item) {
    const status = `${STATUS_WORD[item.status]} · ${builtSpan(item)}`;
    return { title: item.name, note: tube.frosted ? `${status}. ${PRIVATE}` : status };
  }
  if (tube.kind === "private") return { title: tube.label ?? "Private work", note: PRIVATE };
  const thread = tube.thread ? INFO.find((x) => x.id === tube.thread) : null;
  return thread ? { title: thread.name, note: thread.note } : null;
}
