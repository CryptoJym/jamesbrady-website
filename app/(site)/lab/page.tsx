import type { Metadata } from "next";
import Link from "next/link";

import {
  Dot,
  JsonLd,
  PageNameplate,
  Prose,
  SectionHead,
} from "@/components/site/instruments";
import { Tally } from "@/components/site/work";
import { lab } from "@/lib/content";
import { renderMarkdown } from "@/lib/content/markdown";
import { labGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/lab",
  title: "Lab",
  description:
    "Interactive artifacts. Each one ships with a written explanation page, or it is not indexed.",
  og: { image: "/og/lab.png", imageAlt: "James Brady — the lab" },
});

export default function LabPage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(labGraph(lab))} />
      <section className="work work--bare">
        <div className="wrap" style={{ paddingTop: "var(--s-8)" }}>
          <SectionHead
            eyebrow="Lab"
            heading="Things you can poke at."
            aside="Every artifact here ships with a written explanation page. One that does not is excluded from search engines by the loader, not by anyone remembering to set a flag."
          />
          <div className="grid-work grid-work--3">
            {lab.map((entry) => (
              <article className="card" key={entry.slug}>
                <div className="card__top">
                  <span className="card__idx" aria-hidden="true" />
                  <span className="card__cat">
                    <Dot state={entry.state} /> {entry.stateWord}
                  </span>
                </div>
                <h3>{entry.title}</h3>
                <p className="card__body">{entry.answerCapsule}</p>
                <div className="prose" style={{ fontSize: "var(--ts-small)" }}>
                  <Prose html={renderMarkdown(entry.body)} />
                </div>
                <p className="card__foot">
                  {entry.explanationUrl ? (
                    <Link className="card__link" href={entry.explanationUrl}>
                      Read the explanation
                    </Link>
                  ) : (
                    <span>No explanation page — not indexed</span>
                  )}
                  <span className="arw" aria-hidden="true">→</span>
                </p>
              </article>
            ))}
          </div>
          <Tally />
          <PageNameplate
            source="The typed content source"
            method="Artifacts counted by CSS from what is displayed; noindex is forced by the loader when an explanation page is missing"
          />
        </div>
      </section>
    </main>
  );
}
