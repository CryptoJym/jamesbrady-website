import Link from "next/link";

import type { TheoryEntry } from "@/lib/content/types";
import { Dot, DOT_WORD } from "./instruments";

/**
 * A theory row. The maturity state is shown as prominently as the title, and
 * amber means paused — only ever paused. `--warn` never means "bad".
 */
export function TheoryRow({
  entry,
  index,
  headingLevel = 3,
}: {
  entry: TheoryEntry;
  index: number;
  /** 2 on the /theories index, where the section head is the page h1. */
  headingLevel?: 2 | 3;
}) {
  const state = entry.paused ? "paused" : "active";
  const Heading = (headingLevel === 2 ? "h2" : "h3") as "h2" | "h3";
  return (
    <article className="thy__row">
      <p className="thy__n">T-{String(index + 1).padStart(2, "0")}</p>
      <div>
        <Heading className="thy__name">{entry.name}</Heading>
        <span className={entry.paused ? "thy__flag thy__flag--warn" : "thy__flag"}>
          {entry.flagLabel}
        </span>
      </div>
      <p className="thy__what">{entry.what}</p>
      <div className="thy__state">
        <b>
          <Dot state={state} /> {DOT_WORD[state]}
        </b>
        <Link href={`/theories/${entry.slug}`}>
          Read it <span className="arw" aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export function TheoryList({
  entries,
  headingLevel,
}: {
  entries: TheoryEntry[];
  headingLevel?: 2 | 3;
}) {
  return (
    <div className="thy">
      {entries.map((e, i) => (
        <TheoryRow key={e.slug} entry={e} index={i} headingLevel={headingLevel} />
      ))}
    </div>
  );
}
