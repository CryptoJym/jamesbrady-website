import type { Metadata } from "next";
import Link from "next/link";

import { BuiltLabel } from "@/components/fg/Built";
import { Fig } from "@/components/fg/Fig";
import { JsonLd, Provenance } from "@/components/fg/Reading";
import { TrayLabel, TrayMethod } from "@/components/fg/Tray";
import { KIND_LABEL, STATUS_METHOD, built, byKind, countStatus, type BuiltKind } from "@/content/built";
import { work } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { WORK_CAPSULE } from "@/lib/seo/routes";
import { RECORD_METHOD, mergesIn, restOfRecord, tray, type TrayGroup } from "@/lib/tray";

export const metadata: Metadata = pageMetadata({
  path: "/work",
  title: "Work",
  description:
    "What James Brady has built, won and made work: for clients named by industry, his companies, the tools he gave away, his teaching and his agent fleet, each with its status, then his public record thread by thread.",
  og: { image: "/og/work.png", imageAlt: "James Brady — work index" },
});

/** The order the kinds of work are shown in: what it did for people first. */
const KINDS: { kind: BuiltKind; note: string }[] = [
  { kind: "clients", note: "Named by industry only: what was built for each business, and what it did." },
  { kind: "companies", note: "The companies he co-founded, the one where he was CTO, and the pieces they run on." },
  { kind: "teaching", note: "Classes, a podcast, videos, free answers in public, and the young builders he trains." },
  { kind: "tools", note: "Open source and free: install it, fork it, fix it. Some of it was practice, and says so." },
  { kind: "fleet", note: "The agents, and the machinery that lets a small team run many of them." },
];

/** A thread's size in the same words the home page's specimen key uses: repositories and merged changes. */
function ThreadCount({ group }: { group: TrayGroup }) {
  const { thread, repos } = group;
  if (!repos.length) {
    return thread.span ? (
      <>
        {thread.span.start} → {thread.span.end ?? "now"} · no repository; dated by {thread.span.source}
      </>
    ) : null;
  }
  const merges = mergesIn(repos);
  return (
    <>
      <Fig n={repos.length} m={`Public repositories in the thread "${thread.name}". ${RECORD_METHOD}`} /> public{" "}
      {repos.length === 1 ? "repository" : "repositories"} ·{" "}
      <Fig n={merges} m={`Pull requests authored by his GitHub account and merged in those repositories. ${RECORD_METHOD}`} />{" "}
      merged {merges === 1 ? "change" : "changes"}
    </>
  );
}

const STATUS_COUNT = `Counted over the ${built.length} pieces of work on this page (content/built). ${STATUS_METHOD}`;

export default function WorkIndexPage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page fga-page">
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/work",
            name: "Work",
            description: WORK_CAPSULE,
            items: work.map((w) => ({ path: `/work/${w.slug}`, name: w.title })),
          }),
        )}
      />
      <header className="fg-page__head">
        <p className="fg-eyebrow">Work</p>
        <h1 className="fg-h1">What he has built.</h1>
        <p className="fg-p">{WORK_CAPSULE}</p>
        <p className="fg-attrib fga-method">
          <Fig n={built.length} m={STATUS_COUNT} /> pieces of work: <Fig n={countStatus("live")} m={STATUS_COUNT} live /> live,{" "}
          <Fig n={countStatus("shipped")} m={STATUS_COUNT} /> shipped, <Fig n={countStatus("retired")} m={STATUS_COUNT} /> retired,{" "}
          <Fig n={countStatus("unknown")} m={STATUS_COUNT} /> with a status the studies could not tell. {STATUS_METHOD}
        </p>
      </header>

      <div className="fga-tray">
        {KINDS.map(({ kind, note }) => {
          const items = byKind(kind).sort((a, b) => a.rank - b.rank);
          const live = countStatus("live", items);
          return (
            <section key={kind} className="fga-row" aria-labelledby={`k-${kind}`}>
              <div className="fga-row__side">
                <p className="fga-kick">
                  {items.length} {items.length === 1 ? "piece" : "pieces"} · {live} live
                </p>
                <h2 className="fga-row__h" id={`k-${kind}`}>
                  {KIND_LABEL[kind]}
                </h2>
                <p className="fg-muted fga-row__note">{note}</p>
              </div>
              <ul className="fga-labels">
                {items.map((b) => (
                  <li key={b.id}>
                    <BuiltLabel b={b} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="fga-record" aria-labelledby="record">
        <h2 className="fg-h2" id="record">
          The public record, thread by thread.
        </h2>
        <p className="fg-p fg-muted fga-rest__lede">
          The same work as his public code shows it: one label for each repository with a story of its own, grouped by the
          thread it grew on, with its dates, stars and merged changes read from GitHub.
        </p>
        <p className="fg-attrib fga-method">
          <TrayMethod />
        </p>

        <div className="fga-tray">
          {tray.map((group) => (
            <section key={group.thread.id} className="fga-row" aria-labelledby={`t-${group.thread.id}`}>
              <div className="fga-row__side">
                <p className="fga-kick">thread · {group.thread.status}</p>
                <h2 className="fga-row__h" id={`t-${group.thread.id}`}>
                  {group.thread.name}
                </h2>
                <p className="fg-muted fga-row__note">{group.thread.note}</p>
                <p className="fga-row__rec">
                  <ThreadCount group={group} />
                </p>
                {group.thread.private?.length ? (
                  <p className="fga-row__rec fga-row__rec--private">
                    private: {group.thread.private.map((p) => p.label).join("; ")}
                  </p>
                ) : null}
              </div>
              <ul className="fga-labels">
                {group.specimens.map((s) => (
                  <li key={s.key}>
                    <TrayLabel s={s} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="fga-rest" aria-labelledby="rest">
          <h2 className="fg-h2" id="rest">
            The rest of the record.
          </h2>
          <p className="fg-p fg-muted fga-rest__lede">
            The other threads of his public record. None of them has a label of its own; each is counted the same way.
          </p>
          <ul className="fga-rest__list">
            {restOfRecord
              .filter((group) => group.repos.length || group.thread.span)
              .map((group) => (
                <li key={group.thread.id}>
                  <p className="fga-kick">thread · {group.thread.status}</p>
                  <h3>{group.thread.name}</h3>
                  <p className="fg-muted">
                    {group.thread.note}
                    {group.thread.id === "teaching" ? (
                      <>
                        {" "}
                        <Link href="/learn">The three volumes →</Link>
                      </>
                    ) : null}
                  </p>
                  <p className="fga-row__rec">
                    <ThreadCount group={group} />
                  </p>
                </li>
              ))}
          </ul>
        </section>
      </section>

      <Provenance
        source="The typed content source · content/built (the 2026-09-28 studies) · content/history/threads.ts · the public-record snapshot"
        method="The work is grouped by kind, with the studies' statuses; the public record is grouped by the curated threads, with every date and count read from the snapshot at build, none typed"
      />
    </main>
  );
}
