import Link from "next/link";
import type { ReactNode } from "react";

import { extractGaps, renderMarkdown, type PendingRender } from "@/lib/content/markdown";
import type { ProofSource } from "@/lib/content/types";
import { BUILD_STAMP } from "@/lib/seo/site";

/** The sections that say what is not proven, not finished or not shown. They stay prominent. */
const LIMITS = /^(what (is|this page will) not|what is proven|honest|where this stands)/i;

/**
 * A markdown body as readable prose.
 *
 * Rendered one h2 section at a time so the limits sections can be framed. The render mode is the entry's, as before:
 * with `notes`, every [JAMES: …] gap renders as its third-person note, in gap order across the whole body; without,
 * the renderer's own inline mark. Splitting at a heading changes no HTML, because a heading always ends a block.
 */
export function Prose({ body, notes }: { body: string; notes?: string[] }) {
  const parts = body.split(/\n(?=## )/);
  const gaps = parts.map((source) => extractGaps(source).length);
  const firstGap = gaps.map((_, i) => gaps.slice(0, i).reduce((n, g) => n + g, 0));
  if (gaps.reduce((n, g) => n + g, 0) !== extractGaps(body).length) {
    throw new Error("[prose] a [JAMES: …] gap spans a section break, so its note can't be placed");
  }
  const sections = parts.map((source, i) => {
    const pending: PendingRender = notes
      ? { mode: "public", notes: notes.slice(firstGap[i], firstGap[i] + gaps[i]) }
      : { mode: "inline" };
    const first = source.trimStart().split("\n", 1)[0];
    return { html: renderMarkdown(source, pending), limits: first.startsWith("## ") && LIMITS.test(first.slice(3)) };
  });
  return (
    <div className="fga-prose">
      {sections.map((s, i) => (
        <section
          key={i}
          className={s.limits ? "fga-sec fga-sec--limits" : "fga-sec"}
          dangerouslySetInnerHTML={{ __html: s.html }}
        />
      ))}
    </div>
  );
}

/** One heading and its contents, in the record column. */
export function RecordSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="fga-rec" aria-labelledby={id}>
      <h2 className="fga-rec__h" id={id}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Proof sources in the record's voice: what, how it was read, and when. */
export function ProofList({ proof }: { proof: ProofSource[] }) {
  return (
    <ol className="fga-proof">
      {proof.map((p) => (
        <li key={p.label}>
          <p className="fga-proof__label">
            {p.url ? (
              <a href={p.url} rel="noopener noreferrer">
                {p.label}
              </a>
            ) : p.artifact?.startsWith("/") ? (
              <Link href={p.artifact}>{p.label}</Link>
            ) : (
              <>
                {p.label}
                {p.redacted ? " (redacted)" : ""}
              </>
            )}
          </p>
          <p className="fga-proof__m">{p.method}</p>
          <p className="fga-proof__at">captured {p.capturedAt}</p>
        </li>
      ))}
    </ol>
  );
}

/** The archive notice: stated before the content, so a reader arriving from a search knows what they are reading. */
export function ArchiveNotice({ date, children }: { date: string; children: ReactNode }) {
  return (
    <aside className="fga-archive" aria-label="Archive notice">
      <p className="fga-archive__tag">Archived {date}</p>
      <p className="fga-archive__note">{children}</p>
    </aside>
  );
}

/** The page's JSON-LD graph (lib/schema), as one script block. */
export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** Named facts in the record's voice: source, method, and the like. */
export function RecordList({ rows, className = "" }: { rows: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={`fga-dl ${className}`.trim()}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Where a page's figures and text came from, and when it was built. */
export function Provenance({ source, method }: { source: string; method: string }) {
  return (
    <RecordList
      className="fga-prov"
      rows={[
        ["Source", source],
        ["Method", method],
        ["Built", BUILD_STAMP],
      ]}
    />
  );
}
