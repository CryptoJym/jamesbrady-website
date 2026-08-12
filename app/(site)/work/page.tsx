import type { Metadata } from "next";

import { JsonLd, PageNameplate, SectionHead } from "@/components/site/instruments";
import { Tally, WorkFilters, WorkGrid } from "@/components/site/work";
import { publicRepos, repoSnapshotDate, work } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

const CAPSULE =
  "The work index lists products, open-source projects, client work and experiments, filtered in the browser with a count read from what is on screen.";

export const metadata: Metadata = pageMetadata({
  path: "/work",
  title: "Work",
  description:
    "Products, open source, client work and experiments, each with the proof attached and the method stated.",
  og: { image: "/og/work.png", imageAlt: "James Brady — work index" },
});

export default function WorkIndexPage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/work",
            name: "Work",
            description: CAPSULE,
            items: work.map((w) => ({ path: `/work/${w.slug}`, name: w.title })),
          }),
        )}
      />
      <section className="work work--bare">
        <div className="wrap" style={{ paddingTop: "var(--s-8)" }}>
          <SectionHead
            level={1}
            eyebrow="Work"
            heading="What kind of thing do you want to look at?"
            aside={CAPSULE}
          />
          <p
            className="sec-aside"
            style={{ marginTop: "var(--s-4)", maxWidth: "72ch" }}
          >
            {CAPSULE} Repo signals (stars, last push) are a dated snapshot taken from the
            GitHub API on {repoSnapshotDate}, across {publicRepos.length} public
            repositories, and each card&rsquo;s foot line prints the unit it is showing.
          </p>
          <WorkFilters />
          <WorkGrid entries={work} headingLevel={2} />
          <Tally />
          <PageNameplate
            source="The typed content source · dated repo snapshot"
            method="Cards counted by CSS from what is displayed; no typed denominator"
          />
        </div>
      </section>
    </main>
  );
}
