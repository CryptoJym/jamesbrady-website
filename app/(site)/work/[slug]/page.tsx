import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, ProofList, Prose, RecordSection } from "@/components/fg/Reading";
import { CaseLabel, TrayLabel } from "@/components/fg/Tray";
import { work, workBySlug } from "@/lib/content";
import { serializeGraph, workGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { specimenFor } from "@/lib/tray";

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = workBySlug(slug);
  if (!entry) return {};
  return pageMetadata({
    path: `/work/${entry.slug}`,
    title: entry.title,
    description: entry.summary,
    og: entry.og,
    type: "article",
    publishedTime: entry.datePublished,
    modifiedTime: entry.dateModified,
  });
}

export default async function WorkEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = workBySlug(slug);
  if (!entry) notFound();

  const specimen = specimenFor(entry.slug);
  // Same thread first, then the tray's editorial order.
  const others = work.filter((w) => w.slug !== entry.slug);
  const related = [
    ...others.filter((w) => specimenFor(w.slug).thread.id === specimen.thread.id),
    ...others.filter((w) => specimenFor(w.slug).thread.id !== specimen.thread.id),
  ].slice(0, 3);

  return (
    <main id="main" tabIndex={-1} className="fg-page fga-page">
      <JsonLd json={serializeGraph(workGraph(entry))} />

      <div className="fga-doc">
        <header className="fg-page__head fga-doc__head">
          <p className="fg-eyebrow">
            <Link href="/work">Work</Link> · {specimen.thread.name}
          </p>
          <h1 className="fg-h1">{entry.title}</h1>
          {/* The answer capsule: real prose, self-contained and pronoun-free, so an engine can quote it without this
              page. JSON-LD's DefinedTerm carries the same words (verify-seo check 5). */}
          <p className="fg-p">{entry.answerCapsule}</p>
        </header>

        <div className="fga-doc__label">
          <CaseLabel s={specimen} />
        </div>

        <div className="fga-doc__body">
          {/* An entry with publicNotes renders its [JAMES: …] gaps as those notes, in the third person. */}
          <Prose body={entry.body} notes={entry.publicNotes} />
        </div>

        <aside className="fga-doc__record" aria-label="The record">
          <RecordSection id="proof" title="Proof">
            <ProofList proof={entry.proof} />
            <p className="fga-rec__note">Every source above was read read-only on the date shown.</p>
          </RecordSection>

          {entry.deltas.length > 0 ? (
            <RecordSection id="measured" title="What changed, and how it was measured">
              <ul className="fga-deltas">
                {entry.deltas.map((d) => (
                  <li key={d.metric} className="fga-delta">
                    <p className="fga-delta__k">{d.metric}</p>
                    <p className="fga-delta__v">{d.before ? `${d.before} → ${d.after ?? d.range}` : (d.after ?? d.range)}</p>
                    <p className="fga-delta__m">method: {d.method}</p>
                    <p className="fga-delta__m">timeframe: {d.timeframe}</p>
                  </li>
                ))}
              </ul>
            </RecordSection>
          ) : null}

          {entry.anonymized ? (
            <RecordSection id="anonymization" title="Anonymization">
              <p className="fga-rec__text">
                Client names and identifying details are withheld per agreement. Industries are named, specific clients
                are not. Screenshots and metrics are otherwise unaltered. A client is named only under a written
                clearance record.
              </p>
            </RecordSection>
          ) : null}

          <RecordSection id="stack" title="Stack">
            <ul className="fga-stack">
              {entry.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </RecordSection>
        </aside>
      </div>

      <section className="fga-related" aria-labelledby="related">
        <h2 className="fga-row__h" id="related">
          Related work
        </h2>
        <ul className="fga-labels">
          {related.map((w) => (
            <li key={w.slug}>
              <TrayLabel s={specimenFor(w.slug)} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
