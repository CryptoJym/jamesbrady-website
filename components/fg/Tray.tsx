import Link from "next/link";
import type { ReactNode } from "react";

import { Fig } from "@/components/fg/Fig";
import { theories } from "@/lib/content";
import { CATEGORY_LABEL, MATURITY_LABEL, type TheoryEntry } from "@/lib/content/types";
import {
  CONDITION_METHOD,
  RECORD_METHOD,
  footFacts,
  mergesIn,
  releasesIn,
  starsIn,
  type Condition,
  type Specimen,
} from "@/lib/tray";

export type LabelState = Condition | "archived";

const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many);

/**
 * A specimen label: the catalogue card beside a piece of work, in the record's voice. The same box as the home page's
 * <Label>, with room for a heading (labels in a list), a figure with its method, and the conditions this lane needs.
 */
export function SpecimenLabel({
  no,
  name,
  href,
  heading,
  rows,
  state,
}: {
  /** Catalogue number. Absent means there is nothing public to number it by, and the label says so. */
  no?: string;
  name: string;
  href?: string;
  heading?: "h2" | "h3";
  rows: ReactNode[];
  state?: { text: string; kind: LabelState };
}) {
  const Name = heading ?? "span";
  return (
    <div className="fg-label fga-label">
      <div className="fga-label__head">
        {no ? (
          <span className="fg-label__no">{no}</span>
        ) : (
          <span className="fg-label__no fga-label__no--frost">
            <span aria-hidden="true">JB-···</span>
            <span className="fga-vh">No catalogue number: nothing public to number it by.</span>
          </span>
        )}
        <span className="fg-label__no" aria-hidden="true">
          {" · "}
        </span>
        <Name className="fg-label__name">{href ? <Link href={href}>{name}</Link> : name}</Name>
      </div>
      {rows.filter(Boolean).map((row, i) => (
        <p key={i} className="fg-label__row">
          {row}
        </p>
      ))}
      {state ? <p className={`fg-label__row fga-state fga-state--${state.kind}`}>condition: {state.text}</p> : null}
    </div>
  );
}

function repoRow(s: Specimen): ReactNode {
  if (s.repos.length === 1) {
    const url = `https://github.com/${s.repos[0].name}`;
    return <a href={url}>{url.replace("https://", "")}</a>;
  }
  if (s.repos.length > 1) {
    return (
      <>
        <Fig n={s.repos.length} m={`Public repositories of this thread that no other label names. ${RECORD_METHOD}`} /> public{" "}
        {plural(s.repos.length, "repository", "repositories")}
      </>
    );
  }
  return "private repository";
}

function countsRow(s: Specimen): ReactNode {
  if (!s.repos.length) return null;
  // The repository link sits just above, so the method names it by reference rather than repeating the path.
  const where = s.repos.length === 1 ? "this repository" : "these repositories";
  const stars = starsIn(s.repos);
  const merges = mergesIn(s.repos);
  const releases = releasesIn(s.repos);
  return (
    <>
      <Fig n={stars} m={`Stars on ${where}. ${RECORD_METHOD}`} /> {plural(stars, "star")} ·{" "}
      <Fig n={merges} m={`Pull requests authored by his GitHub account and merged in ${where}. ${RECORD_METHOD}`} /> merged{" "}
      {plural(merges, "change")}
      {releases > 0 ? (
        <>
          {" "}
          · <Fig n={releases} m={`Releases of ${where}. ${RECORD_METHOD}`} /> {plural(releases, "release")}
        </>
      ) : null}
    </>
  );
}

function spanRow(s: Specimen, withLicence: boolean): ReactNode {
  const licence = withLicence && s.licence ? ` · ${s.licence}` : "";
  if (s.span) return `${s.span.start} → ${s.span.end}${licence}`;
  if (s.entry) return `since ${s.entry.timeframe.start}${licence}`;
  return null;
}

function factsRow(s: Specimen): ReactNode {
  if (!s.entry) return null;
  const facts = footFacts(s.entry);
  if (!facts.length) return null;
  return facts.map((f, i) => (
    <span key={i}>
      {i > 0 ? " · " : null}
      {"text" in f ? (
        f.text
      ) : (
        <>
          <Fig n={f.count} m={f.method} /> {f.unit}
        </>
      )}
    </span>
  ));
}

const state = (s: Specimen) => ({ text: s.condition, kind: s.condition });

/** A label in the tray on /work: what it is, where it lives, its dates and counts, and its condition. */
export function TrayLabel({ s }: { s: Specimen }) {
  const href = s.entry ? `/work/${s.entry.slug}` : undefined;
  return (
    <SpecimenLabel
      no={s.no}
      name={s.name}
      href={href}
      heading="h3"
      rows={[
        <span key="d" className="fga-label__desc">
          {s.description}
        </span>,
        factsRow(s),
        s.builtOn ?? null,
        repoRow(s),
        spanRow(s, true),
        s.privateBranch ? `${s.privateBranch.label}: private, since ${s.privateBranch.start}` : null,
        countsRow(s),
      ]}
      state={state(s)}
    />
  );
}

/** The label at the head of a case study: what kind of work, repository, dates, licence, stars and condition. */
export function CaseLabel({ s }: { s: Specimen }) {
  return (
    <SpecimenLabel
      no={s.no}
      name={s.name}
      rows={[
        s.entry?.kicker ?? null,
        s.entry ? s.entry.categories.map((c) => CATEGORY_LABEL[c].toLowerCase()).join(" · ") : null,
        repoRow(s),
        spanRow(s, false),
        s.licence ? `licence: ${s.licence}` : null,
        s.privateBranch ? `${s.privateBranch.label}: private, since ${s.privateBranch.start}` : null,
        countsRow(s),
      ]}
      state={state(s)}
    />
  );
}

const byAppearance = [...theories].sort(
  (a, b) => a.datePublished.localeCompare(b.datePublished) || theories.indexOf(a) - theories.indexOf(b),
);

/** A theory's catalogue number: its place in the order the theories first appeared. */
export const theoryNumber = (t: TheoryEntry) => `T-${String(byAppearance.indexOf(t) + 1).padStart(2, "0")}`;

/** A theory's maturity, as a specimen label. Paused is a condition, not a rung. */
export function TheoryLabel({ t, withArtifact = false }: { t: TheoryEntry; withArtifact?: boolean }) {
  const artifact = t.artifactUrl ? (
    t.artifactUrl.startsWith("/") ? (
      <Link href={t.artifactUrl}>{t.artifactLabel ?? "Open"} →</Link>
    ) : (
      <a href={t.artifactUrl} rel="noopener noreferrer">
        {t.artifactLabel ?? "Open"} →
      </a>
    )
  ) : (
    "none published"
  );
  return (
    <SpecimenLabel
      no={theoryNumber(t)}
      name={t.name}
      rows={[
        t.flagLabel,
        `maturity: ${MATURITY_LABEL[t.maturity].toLowerCase()}`,
        `first published ${t.datePublished}`,
        t.dateModified !== t.datePublished ? `last modified ${t.dateModified}` : null,
        withArtifact ? <>artifact: {artifact}</> : null,
      ]}
      state={t.paused ? { text: "paused", kind: "paused" } : { text: "active", kind: "active" }}
    />
  );
}

/** The one line that says how every label on a page was read. */
export function TrayMethod() {
  return (
    <>
      Catalogue numbers are each repository&rsquo;s place in his public record, oldest first. Dates, stars and merged
      changes: {RECORD_METHOD} {CONDITION_METHOD}
    </>
  );
}
