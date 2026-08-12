import type { Metadata } from "next";
import Link from "next/link";

import {
  ArchivedBadge,
  JsonLd,
  PageNameplate,
  SectionHead,
} from "@/components/site/instruments";
import { Tally } from "@/components/site/work";
import { learn } from "@/lib/content";
import { learnGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/learn",
  title: "Learn",
  description:
    "Three archived volumes (the Primer, the Manuscript and the Workshop) introduced here and kept at their original URLs.",
  og: { image: "/og/learn.png", imageAlt: "James Brady — learn hub" },
});

export default function LearnPage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(learnGraph(learn))} />
      <section className="work work--bare">
        <div className="wrap" style={{ paddingTop: "var(--s-8)" }}>
          <SectionHead
            level={1}
            eyebrow="Learn"
            heading="Three volumes, written earlier, kept where they were."
            aside="These are archived as written. They stay at their original URLs, with nothing moved and nothing redirected, and each one carries the date it stopped being maintained. Archived is not the same as paused, and it is not the same as wrong."
          />
          <div className="grid-work grid-work--3">
            {learn.map((entry) => (
              <article className="card" key={entry.slug}>
                <div className="card__top">
                  <span className="card__idx" aria-hidden="true" />
                  <ArchivedBadge date={entry.archivedDate} />
                </div>
                <p className="card__kicker">{entry.kicker}</p>
                <h2 className="card__title">
                  <Link className="card__link" href={entry.volumeRoute}>
                    {entry.title}
                  </Link>
                </h2>
                <p className="card__body">{entry.answerCapsule}</p>
                <p className="card__foot">
                  <span>{entry.volumeRoute}</span>{" "}
                  <span className="arw" aria-hidden="true">→</span>
                </p>
              </article>
            ))}
          </div>
          <Tally />
          <PageNameplate
            source="The typed content source"
            method="Volume count read from the collection; each archive date comes from its own entry"
          />
        </div>
      </section>
    </main>
  );
}
