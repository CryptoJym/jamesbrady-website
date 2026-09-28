import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd, Provenance } from "@/components/fg/Reading";
import { SpecimenLabel } from "@/components/fg/Tray";
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
    <main id="main" tabIndex={-1} className="fg-page fga-page">
      <JsonLd json={serializeGraph(learnGraph(learn))} />
      <header className="fg-page__head">
        <p className="fg-eyebrow">Learn</p>
        <h1 className="fg-h1">Three volumes, written earlier, kept where they were.</h1>
        <p className="fg-p">
          These are archived as written. They stay at their original URLs, with nothing moved and nothing redirected,
          and each one carries the date it stopped being maintained. Archived is not the same as paused, and it is not
          the same as wrong.
        </p>
      </header>

      <ol className="fga-rows">
        {learn.map((entry, i) => (
          <li key={entry.slug} className="fga-row">
            <div className="fga-row__side">
              <SpecimenLabel
                no={`V-${String(i + 1).padStart(2, "0")}`}
                name={entry.kicker}
                rows={[`published ${entry.datePublished}`, `at ${entry.volumeRoute}`]}
                state={{ text: `archived ${entry.archivedDate}`, kind: "archived" }}
              />
            </div>
            <div className="fga-row__main">
              <h2 className="fga-row__q">
                <Link href={entry.volumeRoute}>{entry.title}</Link>
              </h2>
              <p className="fg-muted fga-row__what">{entry.answerCapsule}</p>
              <p className="fga-go" aria-hidden="true">
                {entry.volumeRoute} →
              </p>
            </div>
          </li>
        ))}
      </ol>


      <Provenance
        source="The typed content source"
        method="Volume count read from the collection; each archive date comes from its own entry"
      />
    </main>
  );
}
