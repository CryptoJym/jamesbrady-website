import Link from "next/link";

import { CATEGORY_LABEL, CATEGORY_TOKEN, type WorkEntry } from "@/lib/content/types";
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

export function WorkCard({ entry }: { entry: WorkEntry }) {
  const cats = entry.categories.map((c) => CATEGORY_TOKEN[c]).join(" ");
  return (
    <article className="card" data-cat={cats}>
      <div className="card__top">
        <span className="card__idx" aria-hidden="true" />
        <span className="card__cat">{CATEGORY_LABEL[entry.categories[0]]}</span>
      </div>
      <p className="card__kicker">{entry.kicker}</p>
      <h3>
        <Link className="card__link" href={`/work/${entry.slug}`}>
          {entry.title}
        </Link>
      </h3>
      <p className="card__body">{entry.summary}</p>
      <p className="card__foot">
        <span>{entry.footUnit}</span> <span className="arw" aria-hidden="true">→</span>
      </p>
    </article>
  );
}

export function WorkGrid({ entries }: { entries: WorkEntry[] }) {
  return (
    <div className="grid-work">
      {entries.map((e) => (
        <WorkCard key={e.slug} entry={e} />
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
