import type { Metadata } from "next";
import Link from "next/link";

import { Fig } from "@/components/fg/Fig";
import { JsonLd, Provenance } from "@/components/fg/Reading";
import { TrayLabel, TrayMethod } from "@/components/fg/Tray";
import { work } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { WORK_CAPSULE } from "@/lib/seo/routes";
import { RECORD_METHOD, mergesIn, restOfRecord, tray, type TrayGroup } from "@/lib/tray";

export const metadata: Metadata = pageMetadata({
  path: "/work",
  title: "Work",
  description:
    "Products, open source, client work and experiments, each with the proof attached and the method stated.",
  og: { image: "/og/work.png", imageAlt: "James Brady — work index" },
});

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
        <h1 className="fg-h1">What he has built, thread by thread.</h1>
        <p className="fg-p">{WORK_CAPSULE}</p>
        <p className="fg-attrib fga-method">
          <TrayMethod />
        </p>
      </header>

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
          {restOfRecord.map((group) => (
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

      <Provenance
        source="The typed content source · content/history/threads.ts · the public-record snapshot"
        method="Grouped by the curated threads; every date and count read from the snapshot at build, none typed"
      />
    </main>
  );
}
