import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  JsonLd,
  Nameplate,
  PageNameplate,
  Prose,
} from "@/components/site/instruments";
import { CATEGORY_LABEL } from "@/lib/content/types";
import { work, workBySlug } from "@/lib/content";
import { renderMarkdown } from "@/lib/content/markdown";
import { serializeGraph, workGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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

export default async function WorkEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = workBySlug(slug);
  if (!entry) notFound();

  const related = work.filter((w) => w.slug !== entry.slug).slice(0, 3);

  return (
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(workGraph(entry))} />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <Link href="/work">Work</Link>
            <i aria-hidden="true">/</i>
            <span>{entry.kicker}</span>
          </p>
          <h1>{entry.title}</h1>
          {/* Answer capsule: real prose in the body, self-contained and
              pronoun-free, so an engine can quote it without this page. */}
          <p className="page-lead">{entry.answerCapsule}</p>
          <div className="chip-row">
            {entry.categories.map((c) => (
              <span className="chip" key={c}>
                {CATEGORY_LABEL[c]}
              </span>
            ))}
            {entry.anonymized ? <span className="chip">Anonymized</span> : null}
          </div>
        </div>

        <div className="article">
          <div>
            <Prose html={renderMarkdown(entry.body)} />

            {entry.deltas.length > 0 ? (
              <section aria-labelledby="deltas">
                <h2 className="prose" id="deltas" style={{ fontSize: "var(--ts-h2)" }}>
                  What changed, and how it was measured
                </h2>
                {entry.deltas.map((d) => (
                  <div className="panel" key={d.metric} style={{ marginBottom: "var(--s-4)" }}>
                    <div className="panel__head">
                      <span>{d.metric}</span>
                    </div>
                    <div className="panel__body">
                      {d.before ? (
                        <p>
                          {d.before} → {d.after ?? d.range}
                        </p>
                      ) : (
                        <p>{d.after ?? d.range}</p>
                      )}
                    </div>
                    <Nameplate
                      fields={[
                        { label: "Method", value: d.method },
                        { label: "Timeframe", value: d.timeframe },
                      ]}
                    />
                  </div>
                ))}
              </section>
            ) : null}

            <section aria-labelledby="stack">
              <h2 className="prose" id="stack" style={{ fontSize: "var(--ts-h2)" }}>
                Stack
              </h2>
              <div className="chip-row">
                {entry.stack.map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </section>

            <section aria-labelledby="related" style={{ marginTop: "var(--s-8)" }}>
              <h2 className="prose" id="related" style={{ fontSize: "var(--ts-h2)" }}>
                Related work
              </h2>
              <div className="grid-work grid-work--3">
                {related.map((r) => (
                  <article className="card" key={r.slug}>
                    <p className="card__kicker">{r.kicker}</p>
                    <h3>
                      <Link className="card__link" href={`/work/${r.slug}`}>
                        {r.title}
                      </Link>
                    </h3>
                    <p className="card__body">{r.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="article__aside" aria-label="Proof">
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
                source={entry.repo ? `github.com/${entry.repo.owner}/${entry.repo.name}` : "Live pages"}
                method="Every source above was read read-only on the date shown"
              />
            </div>

            {entry.anonymized ? (
              <div className="panel">
                <div className="panel__head">
                  <span>Anonymization</span>
                </div>
                <div className="panel__body">
                  Client names and identifying details are withheld per agreement.
                  Industries are named, specific clients are not. Screenshots and metrics
                  are otherwise unaltered. A client is named only under a written
                  clearance record.
                </div>
              </div>
            ) : null}

            {entry.repo ? (
              <div className="panel">
                <div className="panel__head">
                  <span>Repository</span>
                  <span>{entry.repo.public ? "Public" : "Private"}</span>
                </div>
                <Nameplate
                  fields={[
                    { label: "Name", value: `${entry.repo.owner}/${entry.repo.name}` },
                    ...(entry.repo.license
                      ? [{ label: "License", value: entry.repo.license }]
                      : []),
                    ...(typeof entry.repo.stars === "number"
                      ? [{ label: "Stars", value: String(entry.repo.stars) }]
                      : []),
                    entry.repo.lastPush
                      ? { label: "Last push", value: entry.repo.lastPush }
                      : { label: "Last push", placeholder: "computed at build" },
                    { label: "Snapshot", value: entry.repo.snapshotAt ?? "" },
                  ]}
                />
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
