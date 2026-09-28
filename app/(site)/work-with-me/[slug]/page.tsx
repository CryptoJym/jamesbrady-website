import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  amount,
  Chips,
  countWord,
  DeliveredBy,
  Keeps,
  Levels,
  ProofLabels,
  Published,
  PublishedCards,
  publishedMethod,
  Row,
  Steps,
  WithFigs,
} from "@/components/fg/Offer";
import { JsonLd, Prose } from "@/components/site/instruments";
import { offerBySlug, offers } from "@/lib/content";
import { extractGaps, renderMarkdown } from "@/lib/content/markdown";
import type { OfferEntry } from "@/lib/content/types";
import { INQUIRY_PARAM } from "@/lib/contact";
import { offerGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return offers.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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

/**
 * The body, one row per `##` section, each rendered on its own. A buyer page renders its pending gaps as
 * third-person notes, and the notes are positional across the whole body, so each section starts reading them
 * where the sections before it stopped.
 */
function bodySections(entry: OfferEntry): { heading: string; html: string }[] {
  const chunks = entry.body.split(/^## /m).filter((c) => c.trim());
  let noteAt = 0;
  return chunks.map((chunk) => {
    const newline = chunk.indexOf("\n");
    const heading = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
    const text = newline === -1 ? "" : chunk.slice(newline + 1);
    const notes = entry.publicNotes?.slice(noteAt) ?? [];
    noteAt += extractGaps(text).length;
    return {
      heading,
      html: renderMarkdown(text, entry.publicNotes ? { mode: "public", notes } : { mode: "inline" }),
    };
  });
}

const anchor = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default async function OfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = offerBySlug(slug);
  if (!entry) notFound();

  // Every OTHER offer, not just the first one found: the door a reader cannot see is the one they conclude does
  // not exist.
  const others = offers.filter((o) => o.slug !== entry.slug);
  const cta = `/contact?${INQUIRY_PARAM}=${entry.inquiryType}`;
  const company = entry.deliveredBy.name;
  const published = entry.published;
  const priceFigures =
    published && entry.price.source
      ? published.cards.map((c) => ({ n: amount(c.price), m: publishedMethod(company, entry.price.source!) }))
      : [];

  return (
    <main id="main" tabIndex={-1} className="fg-page fgb">
      <JsonLd json={serializeGraph(offerGraph(entry))} />

      <header className="fg-page__head fgb-head">
        <p className="fg-eyebrow">
          <Link href="/work-with-me">Work with him</Link> · {company}
        </p>
        <h1 className="fg-h1">{entry.title}</h1>
        <p className="fg-p">
          <WithFigs text={entry.summary} figures={priceFigures} />
        </p>
        <DeliveredBy entry={entry} />
        <nav className="fg-cta-row" aria-label="Start">
          <Link className="fg-cta--primary" href={cta}>
            {entry.ctaLabel} →
          </Link>
          <a href="#check">Go and check it ↓</a>
        </nav>
      </header>

      <div className="fgb-rows">
        {/* The answer capsule, under its question and as real prose (geo-seo-spec §4). The DefinedTerm in the graph
            carries this exact string, and verify-seo diffs the two, so no figure inside it becomes a <Fig>. */}
        <Row id="capsule" title={entry.capsuleQuestion}>
          <p className="fgb-capsule">{entry.answerCapsule}</p>
          {published ? <Published company={company} sources={published.sources} /> : null}
        </Row>

        {published ? (
          <>
            <Row id="ways" title={`${countWord(published.cards.length)} ways in.`}>
              <PublishedCards published={published} company={company} />
            </Row>
            <Row id="levels" title={published.levels.heading}>
              <Levels published={published} company={company} />
            </Row>
            <Row id="people" title={published.people.heading}>
              <div className="fgb-prose">
                {published.people.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </Row>
          </>
        ) : null}

        {bodySections(entry).map((s) => (
          <Row key={s.heading} id={anchor(s.heading)} title={s.heading}>
            <div className="fgb-prose">
              <Prose html={s.html} />
            </div>
          </Row>
        ))}

        <Row id="steps" title="What an engagement looks like">
          <Steps steps={entry.steps} />
        </Row>

        <Row id="keeps" title="What you are left holding">
          <Keeps items={entry.deliverables} />
        </Row>

        <Row id="who-for" title="Who it is for">
          <Chips items={entry.audience} />
        </Row>

        {published ? null : (
          <Row id="price" title="What it costs">
            <div className="fgb-prose">
              <p>{entry.price.statement}</p>
            </div>
          </Row>
        )}

        <Row id="check" title="Go and check it" note="Every source this page cites, with the day it was read.">
          <ProofLabels proof={entry.proof} />
        </Row>

        <Row id="start" title="Starting one">
          <div className="fgb-prose">
            <p>
              The enquiry form is the same one the rest of the site uses, and this page&rsquo;s link arrives with the
              right kind of enquiry already chosen. If the form fails, it says so on screen and gives you the email
              address instead.
            </p>
          </div>
          <nav className="fg-cta-row" aria-label="Start this">
            <Link className="fg-cta--primary" href={cta}>
              {entry.ctaLabel} →
            </Link>
            <a href={entry.deliveredBy.url} rel="noopener noreferrer">
              {company}&rsquo;s own site ↗
            </a>
          </nav>
          <p className="fgb-others__k">Or another way in</p>
          <ul className="fgb-others">
            {others.map((o) => (
              <li key={o.slug}>
                <Link className="fg-door" href={`/work-with-me/${o.slug}`}>
                  <span className="fgb-others__by">{o.deliveredBy.name}</span>
                  <span className="fgb-others__t">{o.title}</span>
                  <span className="fg-door__go">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Row>
      </div>
    </main>
  );
}
