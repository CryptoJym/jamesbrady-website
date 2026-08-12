import Link from "next/link";
import type { ReactNode } from "react";

import { BUILD_STAMP } from "@/lib/seo/site";

/* ------------------------------------------------------------------ dot */

export type DotState = "active" | "live" | "paused" | "dormant";

const DOT_CLASS: Record<DotState, string> = {
  active: "dot",
  live: "dot dot--live",
  paused: "dot dot--warn",
  dormant: "dot dot--off",
};

export const DOT_WORD: Record<DotState, string> = {
  active: "Active",
  live: "Live",
  paused: "Paused",
  dormant: "Dormant",
};

/**
 * The page's smallest unit of honesty. Always aria-hidden, always beside a
 * visible status word — the dot never carries the state on its own, and
 * `live` differs from `active` by a static ring rather than by motion.
 */
export function Dot({ state }: { state: DotState }) {
  return <span className={DOT_CLASS[state]} aria-hidden="true" />;
}

/* ------------------------------------------------------ provenance plate */

export type NameplateField = {
  label: string;
  value?: ReactNode;
  /** A field the build has not supplied. Rendered labelled, never faked. */
  placeholder?: string;
  href?: string;
};

/**
 * Graft A. The same plate wherever a number is printed: where it came from,
 * how it was derived, when it was last touched. The field set is variadic —
 * the canonical page-level instance is SOURCE / METHOD / BUILT, the per-item
 * instance is SOURCE-or-VALUE / LAST ACTIVE / GO.
 */
export function Nameplate({
  fields,
  className = "",
}: {
  fields: NameplateField[];
  className?: string;
}) {
  return (
    <dl className={`np ${className}`.trim()}>
      {fields.map((f) => (
        <div className="np__f" key={f.label}>
          <dt>{f.label}</dt>
          <dd className={f.placeholder ? "np__ph" : undefined}>
            {f.placeholder ? (
              f.placeholder
            ) : f.href ? (
              <NameplateLink href={f.href}>{f.value}</NameplateLink>
            ) : (
              f.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function NameplateLink({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(href);
  const inner = (
    <>
      {children} <span className="arw" aria-hidden="true">→</span>
    </>
  );
  return external ? (
    <a href={href} rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link href={href}>{inner}</Link>
  );
}

/** The canonical page-level plate: SOURCE / METHOD / BUILT. */
export function PageNameplate({
  source,
  method,
  className = "",
}: {
  source: string;
  method: string;
  className?: string;
}) {
  return (
    <Nameplate
      className={className}
      fields={[
        { label: "Source", value: source },
        { label: "Method", value: method },
        { label: "Built", value: BUILD_STAMP },
      ]}
    />
  );
}

/* ------------------------------------------------------------- sec head */

/**
 * A section head.
 *
 * `level` is the document-outline level, not a size: on `/`, sections sit
 * under the hero h1 and stay h2. On the four index routes the section head IS
 * the page heading, so it renders h1 — and `.b-room .sec-head h1` pins it to
 * the same metrics, so the outline is fixed without a visual change
 * (independent review, P1-5).
 */
export function SectionHead({
  num,
  eyebrow,
  heading,
  aside,
  level = 2,
}: {
  num?: string;
  eyebrow: string;
  heading: string;
  aside?: string;
  level?: 1 | 2;
}) {
  const Heading = (level === 1 ? "h1" : "h2") as "h1" | "h2";
  return (
    <div className="sec-head">
      <div>
        <p className="sec-num">
          {num ? <span>{num}</span> : null}
          {num ? (
            <i aria-hidden="true">/</i>
          ) : null}
          <em>{eyebrow}</em>
        </p>
        <Heading>{heading}</Heading>
      </div>
      {aside ? <p className="sec-aside">{aside}</p> : null}
    </div>
  );
}

/* --------------------------------------------------------------- badges */

/** Archived is not paused: --c-line-2 and --t-faint, never --warn. */
export function ArchivedBadge({ date }: { date: string }) {
  return <span className="badge-archived">Archived {date}</span>;
}

/**
 * The archive band (wave 4).
 *
 * /primer, /manuscript, /workshop and /watch are frozen as dated archives at
 * their original URLs. A reader arriving from a search result cannot tell that
 * from the content, so the page states it before the content rather than after
 * it, and points at where the maintained version of the same ground lives.
 *
 * The date is a prop because it comes from the content source — the same
 * `archivedDate` the /learn card prints, so the hub and the volume can never
 * disagree about when a volume stopped being maintained.
 */
export function ArchiveBand({
  date,
  children,
}: {
  date: string;
  children: ReactNode;
}) {
  return (
    <div className="archive">
      <div className="wrap archive__in">
        <ArchivedBadge date={date} />
        <p className="archive__note">{children}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- json-ld */

export function JsonLd({ json }: { json: string }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}

/* ---------------------------------------------------------------- prose */

export function Prose({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
