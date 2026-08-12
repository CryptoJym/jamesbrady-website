import type { Metadata } from "next";
import Link from "next/link";

import {
  JsonLd,
  PageNameplate,
  SectionHead,
} from "@/components/site/instruments";
import { DeliveryLine } from "@/components/site/offers";
import { offers } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { WORK_WITH_ME_CAPSULE } from "@/lib/seo/routes";
import { SITE } from "@/lib/seo/site";

/**
 * The engagement count, in words, derived from the collection.
 *
 * design-system-spec §6 bans typed figures, and "Two engagements" in an H1 was
 * one: wave 3b added a third offer and the heading would have gone on saying
 * two. Words rather than a numeral because the heading is a sentence, and
 * because §6 also asks that a count spelled into prose stay checkable against
 * the thing it counts. The map covers the sizes this row can legibly hold; a
 * fourth engagement past it falls back to the numeral rather than silently
 * printing the wrong word.
 */
const COUNT_WORD = ["no", "one", "Two", "Three", "Four", "Five"];
const ENGAGEMENT_COUNT_WORD = COUNT_WORD[offers.length] ?? String(offers.length);

export const metadata: Metadata = pageMetadata({
  path: "/work-with-me",
  title: "Work with me",
  description:
    "Three engagements: getting a business found in search and in AI answers, building a system that ships in verified waves, and background screening for your hires.",
  og: {
    image: "/og/work-with-me.png",
    imageAlt: "James Brady — three ways to work together",
  },
});

export default function WorkWithMePage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/work-with-me",
            name: "Work with me",
            description: WORK_WITH_ME_CAPSULE,
            items: offers.map((o) => ({
              path: `/work-with-me/${o.slug}`,
              name: o.title,
            })),
          }),
        )}
      />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>Work with me</span>
            <i aria-hidden="true">/</i>
            <span>{SITE.location}</span>
          </p>
          {/* The count is the collection's length, not a word somebody has to
              remember to change. Wave 3 shipped "Two engagements" as typed
              prose and wave 3b added a third one. */}
          <h1>{ENGAGEMENT_COUNT_WORD} engagements, and the entity that delivers each one.</h1>
          {/* The capsule, as real prose in the body and in the reading size,
              so an engine quoting this page alone gets the whole answer. */}
          <p className="page-lead">{WORK_WITH_ME_CAPSULE}</p>
        </div>
      </div>

      {/* No extra top padding here: the index routes add it because they have
          no page head, and this one does. */}
      <section className="work work--bare">
        <div className="wrap">
          <SectionHead
            eyebrow="The doors"
            heading="Which problem are you solving?"
            aside="The rest of this site is evidence. This page is the part you can hire. Each engagement below says what it measures or produces, who delivers it, what you are left holding, and roughly what it costs, before you write in."
          />

          <div className="grid-work grid-work--3" style={{ marginTop: "var(--s-6)" }}>
            {offers.map((offer) => (
              <article className="card card--offer" key={offer.slug}>
                <div className="card__top">
                  <span className="card__idx" aria-hidden="true" />
                  <span className="card__cat">{offer.deliveredBy.name}</span>
                </div>
                <p className="card__kicker">{offer.kicker}</p>
                <h2 className="card__title">
                  <Link className="card__link" href={`/work-with-me/${offer.slug}`}>
                    {offer.title}
                  </Link>
                </h2>
                <p className="card__body">{offer.summary}</p>
                <DeliveryLine entry={offer} />
                <p className="card__foot">
                  <span>{offer.ctaLabel}</span>{" "}
                  <span className="arw" aria-hidden="true">
                    →
                  </span>
                </p>
              </article>
            ))}
          </div>

          <div className="panel" style={{ marginTop: "var(--s-6)", maxWidth: "72ch" }}>
            <div className="panel__head">
              <span>Which one is which</span>
            </div>
            <div className="panel__body">
              <p>
                If the problem is that customers cannot find you, the first engagement
                measures why and fixes it. If the problem is that something has to get
                built and you need to be able to check it afterwards, the second one does
                that. If you are about to hire someone and need their record checked, the
                third one is the screening path, and the checks there are run by Vuplicity
                rather than by me. If it is more than one of them, say so in the enquiry
                and the scope covers what you named.
              </p>
            </div>
          </div>

          <PageNameplate
            source="The typed content source · the enquiry form's own budget list"
            method="Engagements counted from the collection; every band read from lib/contact.ts"
          />
        </div>
      </section>
    </main>
  );
}
