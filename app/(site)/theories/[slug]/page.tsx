import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, ProofList, Prose, RecordSection } from "@/components/fg/Reading";
import { TheoryLabel } from "@/components/fg/Tray";
import { discoverableTheories, theoryBySlug } from "@/lib/content";
import { serializeGraph, theoryGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return discoverableTheories.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = theoryBySlug(slug);
  if (!entry) return {};
  return pageMetadata({
    // The H1 is the question; the theory name is the eyebrow above it.
    path: `/theories/${entry.slug}`,
    title: entry.title,
    description: entry.summary,
    og: entry.og,
    type: "article",
    publishedTime: entry.datePublished,
    modifiedTime: entry.dateModified,
  });
}

export default async function TheoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = theoryBySlug(slug);
  if (!entry) notFound();

  return (
    <main id="main" tabIndex={-1} className="fg-page fga-page">
      <JsonLd json={serializeGraph(theoryGraph(entry))} />

      <div className="fga-doc fga-doc--theory">
        <header className="fg-page__head fga-doc__head">
          <p className="fg-eyebrow">
            <Link href="/theories">Theories</Link> · {entry.name}
          </p>
          {/* Question-shaped H1 (geo-seo-spec §4.1). */}
          <h1 className="fg-h1">{entry.title}</h1>
          {/* The answer capsule, matching the DefinedTerm description verbatim, never markup-only. */}
          <p className="fg-p">{entry.answerCapsule}</p>
        </header>

        <div className="fga-doc__label">
          <TheoryLabel t={entry} withArtifact />
        </div>

        <div className="fga-doc__body">
          <Prose body={entry.body} notes={entry.publicNotes} />
        </div>

        <aside className="fga-doc__record" aria-label="State and provenance">
          <RecordSection id="claim" title="The claim">
            <p className="fga-claim">{entry.claim}</p>
          </RecordSection>

          <RecordSection id="history" title="History">
            <ol className="fga-history">
              {entry.history.map((h) => (
                <li key={`${h.date}-${h.state}`}>
                  <p className="fga-history__at">
                    {h.date} · {h.state}
                  </p>
                  <p className="fga-history__note">{h.note}</p>
                </li>
              ))}
            </ol>
          </RecordSection>

          {entry.proof.length > 0 ? (
            <RecordSection id="proof" title="Proof">
              <ProofList proof={entry.proof} />
              <p className="fga-rec__note">
                Dates advance with the maturity state; the full text is on this page as static HTML.
              </p>
            </RecordSection>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
