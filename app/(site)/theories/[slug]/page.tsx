import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Dot,
  JsonLd,
  Nameplate,
  PageNameplate,
  Prose,
} from "@/components/site/instruments";
import { MATURITY_LABEL } from "@/lib/content/types";
import { discoverableTheories, theoryBySlug } from "@/lib/content";
import { renderMarkdown } from "@/lib/content/markdown";
import { serializeGraph, theoryGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return discoverableTheories.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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

export default async function TheoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = theoryBySlug(slug);
  if (!entry) notFound();

  const state = entry.paused ? "paused" : "active";

  return (
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(theoryGraph(entry))} />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <Link href="/theories">Theories</Link>
            <i aria-hidden="true">/</i>
            <span className="thy__name">{entry.name}</span>
          </p>
          {/* Question-shaped H1 (geo-seo-spec §4.1). */}
          <h1>{entry.title}</h1>
          {/* Answer capsule — real prose in the body, matching the DefinedTerm
              description verbatim, never markup-only. */}
          <p className="page-lead">{entry.answerCapsule}</p>
          <div className="chip-row">
            <span className="chip">{MATURITY_LABEL[entry.maturity]}</span>
            {entry.paused ? (
              <span className="chip" style={{ color: "var(--warn)" }}>
                Paused
              </span>
            ) : null}
          </div>
        </div>

        <div className="article">
          <Prose html={renderMarkdown(entry.body)} />

          <aside className="article__aside" aria-label="State and provenance">
            <div className="panel">
              <div className="panel__head">
                <span>State</span>
                <span>
                  <Dot state={state} /> {entry.paused ? "Paused" : "Active"}
                </span>
              </div>
              <div className="panel__body">
                <p>
                  <strong style={{ color: "var(--t-hi)" }}>The claim.</strong>{" "}
                  {entry.claim}
                </p>
              </div>
              <Nameplate
                fields={[
                  { label: "Maturity", value: MATURITY_LABEL[entry.maturity] },
                  { label: "First published", value: entry.datePublished },
                  { label: "Last modified", value: entry.dateModified },
                  ...(entry.artifactUrl
                    ? [
                        {
                          label: "Artifact",
                          value: entry.artifactLabel ?? "Open",
                          href: entry.artifactUrl,
                        },
                      ]
                    : [{ label: "Artifact", placeholder: "none published" }]),
                ]}
              />
            </div>

            <div className="panel">
              <div className="panel__head">
                <span>History</span>
                <span>{entry.history.length} entries</span>
              </div>
              <div className="panel__body">
                <ul style={{ display: "grid", gap: "var(--s-3)" }}>
                  {entry.history.map((h) => (
                    <li key={`${h.date}-${h.state}`}>
                      <span style={{ color: "var(--t-hi)" }}>
                        {h.date} · {h.state}
                      </span>
                      <br />
                      {h.note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {entry.proof.length > 0 ? (
              <div className="panel">
                <div className="panel__head">
                  <span>Proof</span>
                  <span>{entry.proof.length} sources</span>
                </div>
                <div className="panel__body">
                  <ul style={{ display: "grid", gap: "var(--s-4)" }}>
                    {entry.proof.map((p) => (
                      <li key={p.label}>
                        {p.url ? (
                          <a
                            href={p.url}
                            rel="noopener"
                            style={{ color: "var(--t-hi)", textDecoration: "underline" }}
                          >
                            {p.label}
                          </a>
                        ) : (
                          <span style={{ color: "var(--t-hi)" }}>
                            {p.label}
                            {p.redacted ? " (redacted)" : ""}
                          </span>
                        )}
                        <Nameplate
                          fields={[
                            { label: "Method", value: p.method },
                            { label: "Captured", value: p.capturedAt },
                          ]}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <PageNameplate
                  source="The typed content source"
                  method="Dates advance with the maturity state; the full text is on this page as static HTML"
                />
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
