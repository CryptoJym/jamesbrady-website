import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  JsonLd,
  Nameplate,
  PageNameplate,
  Prose,
} from "@/components/site/instruments";
import {
  BudgetBands,
  DeliverableList,
  DeliveryLine,
  StepList,
} from "@/components/site/offers";
import { offerBySlug, offers } from "@/lib/content";
import { renderMarkdown } from "@/lib/content/markdown";
import { INQUIRY_PARAM } from "@/lib/contact";
import { offerGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return offers.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = offerBySlug(slug);
  if (!entry) return {};
  return pageMetadata({
    path: `/work-with-me/${entry.slug}`,
    title: entry.title,
    description: entry.summary,
    og: entry.og,
    type: "article",
    publishedTime: entry.datePublished,
    modifiedTime: entry.dateModified,
  });
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = offerBySlug(slug);
  if (!entry) notFound();

  // Every OTHER engagement, not just the first one found. With two offers a
  // singular `other` was the whole rest of the collection; with three it
  // silently hid one, and the door a reader could not see is the one they
  // conclude does not exist.
  const others = offers.filter((o) => o.slug !== entry.slug);
  const cta = `/contact?${INQUIRY_PARAM}=${entry.inquiryType}`;

  return (
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(offerGraph(entry))} />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <Link href="/work-with-me">Work with me</Link>
            <i aria-hidden="true">/</i>
            <span>{entry.kicker}</span>
          </p>
          <h1>{entry.title}</h1>
          <p className="page-lead">{entry.summary}</p>
          <DeliveryLine entry={entry} />
          <div className="hero__cta" style={{ marginTop: "var(--s-5)" }}>
            <Link href={cta} className="btn btn--primary">
              {entry.ctaLabel.toUpperCase()}{" "}
              <span className="arw" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="article">
          <div>
            {/* The answer capsule, under a question-shaped heading and as real
                prose in the body (geo-seo-spec §4). The DefinedTerm in the
                graph carries this exact string; verify-seo diffs the two. */}
            <section aria-labelledby="capsule">
              <h2 className="offer__q" id="capsule">
                {entry.capsuleQuestion}
              </h2>
              <p className="offer__capsule">{entry.answerCapsule}</p>
            </section>

            {/*
              The render mode is a property of the ENTRY, not of the template,
              exactly as on /work/[slug]. Every offer page is a buyer page, so
              an offer that carries an open question carries `publicNotes` too
              and its gaps render as statements of absence. An offer with no
              gaps needs neither. verify-seo check 17 is the lane that keeps a
              second-person mark off these routes.
            */}
            <Prose
              html={renderMarkdown(
                entry.body,
                entry.publicNotes
                  ? { mode: "public", notes: entry.publicNotes }
                  : { mode: "inline" },
              )}
            />

            <section aria-labelledby="steps" style={{ marginTop: "var(--s-7)" }}>
              <h2 className="offer__q" id="steps">
                What an engagement looks like
              </h2>
              <StepList steps={entry.steps} />
            </section>

            <section aria-labelledby="deliverables" style={{ marginTop: "var(--s-7)" }}>
              <h2 className="offer__q" id="deliverables">
                What you are left holding
              </h2>
              <DeliverableList items={entry.deliverables} />
            </section>

            <section aria-labelledby="who-for" style={{ marginTop: "var(--s-7)" }}>
              <h2 className="offer__q" id="who-for">
                Who it is for
              </h2>
              <div className="chip-row">
                {entry.audience.map((a) => (
                  <span className="chip" key={a}>
                    {a}
                  </span>
                ))}
              </div>
            </section>

            <section aria-labelledby="start" style={{ marginTop: "var(--s-7)" }}>
              <h2 className="offer__q" id="start">
                Starting one
              </h2>
              <p className="offer__capsule">
                The enquiry form is the same one the rest of the site uses, and this
                page&rsquo;s button arrives with the right kind of enquiry already
                selected. If the form fails it says so on screen and gives you the email
                address instead.
              </p>
              <div className="hero__cta" style={{ marginTop: "var(--s-5)" }}>
                <Link href={cta} className="btn btn--primary">
                  {entry.ctaLabel.toUpperCase()}{" "}
                  <span className="arw" aria-hidden="true">
                    →
                  </span>
                </Link>
                {others.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/work-with-me/${o.slug}`}
                    className="btn btn--ghost"
                  >
                    OR: {o.title.toUpperCase()}{" "}
                    <span className="arw" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="article__aside" aria-label="Engagement facts">
            <BudgetBands bands={entry.budgetBands} />

            <div className="panel">
              <div className="panel__head">
                <span>How the work gets checked</span>
              </div>
              <div className="panel__body">
                <p>
                  One person operating at fleet scale is a fair thing to be suspicious
                  of. The reliability answer states, in plain words, what stops bad work
                  reaching a client, what &ldquo;done&rdquo; means here, and what happens
                  when something cannot be measured.
                </p>
              </div>
              <Nameplate
                fields={[
                  { label: "Answer", value: "Reliability, in plain words", href: "/about" },
                  { label: "Entities", value: "Utlyze (studio) · New Reward (agency)" },
                ]}
              />
            </div>

            <div className="panel">
              <div className="panel__head">
                <span>Go and check it</span>
              </div>
              <div className="panel__body">
                <p style={{ marginBottom: "var(--s-3)" }}>
                  Every claim on this page links to the thing itself rather than to a
                  description of it.
                </p>
                {/*
                  A list rather than a nameplate. The plate's `auto 1fr` grid
                  sizes its label column to the LONGEST label, and a proof
                  label is a sentence, so the URLs were squeezed into a column
                  a few characters wide and wrapped one letter at a time.

                  The label is the anchor text, which is the descriptive anchor
                  §7.5 asks for, and the full URL prints underneath: a reader
                  sees where a link goes before pressing it, and the retired
                  brand token stays in one of its four permitted URL shapes
                  rather than being shortened into a violation.
                */}
                <ul className="prooflist">
                  {entry.proof.map((p) => (
                    <li key={p.label}>
                      {p.url ? (
                        <a href={p.url} rel="noopener noreferrer">
                          {p.label}
                          <span className="arw" aria-hidden="true">
                            →
                          </span>
                        </a>
                      ) : (
                        <span className="prooflist__label">{p.label}</span>
                      )}
                      <span className="prooflist__url">
                        {p.url ?? p.artifact ?? "no link recorded"}
                      </span>
                      <span className="prooflist__method">
                        {p.method} Checked {p.capturedAt}.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <PageNameplate
          source="The typed content source · the enquiry form's own budget list"
          method="No figure is printed on this page; the bands are read from lib/contact.ts"
        />
      </div>
    </main>
  );
}
