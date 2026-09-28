import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";

import { JsonLd, Prose, Provenance } from "@/components/fg/Reading";
import { SpecimenLabel } from "@/components/fg/Tray";
import { EmotionalManifoldDemo } from "@/components/site/EmotionalManifoldDemo";
import { lab } from "@/lib/content";
import { labGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/lab",
  title: "Lab",
  description:
    "Interactive artifacts. Each one ships with a written explanation page, or it is not indexed.",
  og: { image: "/og/lab.png", imageAlt: "James Brady — the lab" },
});

/** The artifact itself, for the entries that have one on this page. It carries its own heading. */
const DEMOS: Record<string, ComponentType> = {
  "emotional-manifold": EmotionalManifoldDemo,
};

export default function LabPage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page fga-page">
      <JsonLd json={serializeGraph(labGraph(lab))} />
      <header className="fg-page__head">
        <p className="fg-eyebrow">Lab</p>
        <h1 className="fg-h1">Things you can poke at.</h1>
        <p className="fg-p">
          Every artifact here ships with a written explanation page. One that does not is excluded from search engines
          by the loader, not by anyone remembering to set a flag.
        </p>
      </header>

      {lab.map((entry, i) => {
        const Demo = DEMOS[entry.slug];
        return (
          <section key={entry.slug} className="fga-lab">
            {Demo ? <Demo /> : <h2 className="fga-row__h">{entry.title}</h2>}
            <div className="fga-row fga-row--flush">
              <div className="fga-row__side">
                <SpecimenLabel
                  no={`L-${String(i + 1).padStart(2, "0")}`}
                  name={entry.title}
                  rows={[
                    `first published ${entry.datePublished}`,
                    entry.dateModified !== entry.datePublished ? `last modified ${entry.dateModified}` : null,
                    entry.explanationUrl ? (
                      <>
                        explained at <Link href={entry.explanationUrl}>{entry.explanationUrl}</Link>
                      </>
                    ) : (
                      "no explanation page, so not indexed"
                    ),
                  ]}
                  state={{
                    text: entry.stateWord.toLowerCase(),
                    kind: entry.state === "live" ? "active" : entry.state,
                  }}
                />
              </div>
              <div className="fga-row__main">
                <p className="fga-row__lede">{entry.answerCapsule}</p>
                <Prose body={entry.body} />
                {entry.explanationUrl ? (
                  <p className="fga-go">
                    <Link href={entry.explanationUrl}>Read the explanation →</Link>
                  </p>
                ) : (
                  <p className="fga-go">No explanation page — not indexed</p>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <Provenance
        source="The typed content source"
        method="noindex is forced by the loader when an explanation page is missing"
      />
    </main>
  );
}
