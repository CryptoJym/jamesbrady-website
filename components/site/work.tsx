import Link from "next/link";

import {
  CATEGORY_LABEL,
  CATEGORY_TOKEN,
  type FootFact,
  type WorkEntry,
} from "@/lib/content/types";
import { Dot, DOT_WORD, Nameplate } from "./instruments";

const FILTERS = [
  { id: "wf-all", label: "All" },
  { id: "wf-prod", label: "Products" },
  { id: "wf-oss", label: "Open source" },
  { id: "wf-client", label: "Client work" },
  { id: "wf-exp", label: "Experiments" },
];

/**
 * The filter mechanism. Radio group, visually-hidden inputs, label chips.
 * Filtering is CSS-only via :has() and degrades to "show everything".
 *
 * PROTECT: the tally below is a CSS counter over the cards still displayed.
 * A display:none card cannot increment counter(cards), so the shown-count is
 * honest by construction. It must never be re-implemented in JS or React
 * state — a JS count can drift from what is on screen; this one cannot.
 */
export function WorkFilters() {
  return (
    <div className="filters" role="group" aria-label="Filter work by type">
      {FILTERS.map((f, i) => (
        <span key={f.id} style={{ display: "contents" }}>
          <input type="radio" name="wf" id={f.id} className="vh" defaultChecked={i === 0} />
          <label htmlFor={f.id}>{f.label}</label>
        </span>
      ))}
    </div>
  );
}

/** No typed denominator. Computed numerator + the named filter, both generated. */
export function Tally() {
  return (
    <p className="tally">
      <span>
        Showing <span className="n" />
      </span>
      <span>
        Filter: <span className="fname" />
      </span>
    </p>
  );
}

/**
 * Resolve one foot fact against the entry.
 *
 * P0-1: every numeral on a card foot line arrives from a field — `repo.stars`
 * is the same number the readout sums and JSON-LD publishes, and a `count`
 * carries its own unit and method. Nothing here formats a hand-typed string.
 * Returns null when the referenced field is absent, so a missing snapshot
 * drops the fact rather than printing a stale or invented one.
 */
function footFactText(fact: FootFact, entry: WorkEntry): string | null {
  if ("label" in fact) return fact.label;
  if ("count" in fact) return `${fact.count} ${fact.unit}`;
  switch (fact.field) {
    case "repo.stars": {
      const n = entry.repo?.stars;
      if (typeof n !== "number") return null;
      return `${n} ${n === 1 ? "star" : "stars"}`;
    }
    case "stack.primary":
      return entry.stack[0] ?? null;
    case "repo.license":
      return entry.repo?.license ?? null;
    case "anonymized":
      return entry.anonymized ? "Anonymized" : "Named";
  }
}

export function WorkCard({
  entry,
  headingLevel = 3,
}: {
  entry: WorkEntry;
  /** 2 on the /work index, where the section head is the page h1. */
  headingLevel?: 2 | 3;
}) {
  const cats = entry.categories.map((c) => CATEGORY_TOKEN[c]).join(" ");
  const Heading = (headingLevel === 2 ? "h2" : "h3") as "h2" | "h3";
  const foot = entry.footFacts
    .map((f) => footFactText(f, entry))
    .filter((t): t is string => Boolean(t))
    .join(" · ");

  /**
   * The repository, one click away.
   *
   * The card used to print "3 stars" as text and link only to the case study,
   * so a builder who wanted the source had to open the case study, scroll to
   * the proof block, and follow a link from there. Three clicks to reach the
   * thing the card was already boasting about. The star count is the SAME
   * `repo.stars` the homepage readout sums and JSON-LD publishes, from the
   * same dated snapshot — not a second number fetched a different way.
   */
  const repo = entry.repo?.public ? entry.repo : undefined;
  const stars = repo?.stars;

  return (
    <article className="card" data-cat={cats}>
      <div className="card__top">
        <span className="card__idx" aria-hidden="true" />
        <span className="card__cat">{CATEGORY_LABEL[entry.categories[0]]}</span>
      </div>
      <p className="card__kicker">{entry.kicker}</p>
      <Heading className="card__title">
        <Link className="card__link" href={`/work/${entry.slug}`}>
          {entry.title}
        </Link>
      </Heading>
      <p className="card__body">{entry.summary}</p>
      <p className="card__foot">
        <span>{foot}</span> <span className="arw" aria-hidden="true">→</span>
      </p>
      {repo ? (
        <p className="card__repo">
          <a
            href={`https://github.com/${repo.owner}/${repo.name}`}
            rel="noopener noreferrer"
          >
            <span className="card__repo-k">Code</span>
            <span className="card__repo-v">
              {repo.owner}/{repo.name}
            </span>
            {typeof stars === "number" ? (
              <span className="card__repo-s">
                {stars} {stars === 1 ? "star" : "stars"} · Star it
              </span>
            ) : null}
            <span className="arw" aria-hidden="true">
              →
            </span>
          </a>
        </p>
      ) : null}
    </article>
  );
}

export function WorkGrid({
  entries,
  headingLevel,
}: {
  entries: WorkEntry[];
  headingLevel?: 2 | 3;
}) {
  return (
    <div className="grid-work">
      {entries.map((e) => (
        <WorkCard key={e.slug} entry={e} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

/**
 * A proof slot. Exactly one real number, one size, one colour. Units live on
 * the unit line, never inside the value. A slot whose figure the build cannot
 * derive prints the labelled placeholder instead of a plausible numeral.
 */
export function ProofSlot({ entry }: { entry: WorkEntry }) {
  const m = entry.proofMetric!;
  const value =
    m.placeholder || typeof m.value !== "number"
      ? null
      : `${m.prefix ?? ""}${m.pad ? String(m.value).padStart(2, "0") : m.value}`;

  return (
    <article className="slot">
      <p className="slot__id">
        <Dot state={m.state} /> {entry.title}{" "}
        <span className="slot__state">{DOT_WORD[m.state]}</span>
      </p>
      {value ? (
        <p className="slot__val">{value}</p>
      ) : (
        <p className="slot__val--ph">placeholder — computed at build</p>
      )}
      <p className="slot__unit">{m.unit}</p>
      <p className="slot__desc">{entry.answerCapsule.split(". ")[0]}.</p>
      <Nameplate
        className="np--slot"
        fields={[
          { label: "Source", value: m.source },
          m.lastActive
            ? { label: "Last active", value: m.lastActive }
            : { label: "Last active", placeholder: "computed at build" },
          { label: "Go", value: m.goLabel, href: m.goHref },
        ]}
      />
    </article>
  );
}

export function ProofBank({ entries }: { entries: WorkEntry[] }) {
  return (
    <div className="bank">
      {entries.map((e) => (
        <ProofSlot key={e.slug} entry={e} />
      ))}
    </div>
  );
}
