import type { Metadata } from "next";

import { JsonLd, PageNameplate, SectionHead } from "@/components/site/instruments";
import { TheoryList } from "@/components/site/theories";
import { discoverableTheories, theoriesActive, theoriesPaused } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

const CAPSULE =
  "The theories index lists open questions worked in public, with each theory's maturity state shown as prominently as its title.";

export const metadata: Metadata = pageMetadata({
  path: "/theories",
  title: "Theories",
  description:
    "Open questions worked in public, each labelled by what it actually is: named, sketched, developed, or a live demo.",
  og: { image: "/og/theories.png", imageAlt: "James Brady — theories index" },
});

export default function TheoriesIndexPage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/theories",
            name: "Theories",
            description: CAPSULE,
            items: discoverableTheories.map((t) => ({
              path: `/theories/${t.slug}`,
              name: t.name,
            })),
          }),
        )}
      />
      <section className="theories theories--bare">
        <div className="wrap" style={{ paddingTop: "var(--s-8)" }}>
          <SectionHead
            eyebrow="Theories"
            heading="Open questions I'm working in public."
            aside={`${CAPSULE} The ladder is named, sketched, developed, live demo — with paused as a separate flag, because paused is a status, not a rung. ${theoriesActive} active, ${theoriesPaused} paused.`}
          />
          <TheoryList entries={discoverableTheories} />
          <PageNameplate
            source="The typed content source"
            method="Listed where maturity is at least sketched; the count and the rows are the same list"
          />
        </div>
      </section>
    </main>
  );
}
