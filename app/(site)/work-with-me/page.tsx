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

export const metadata: Metadata = pageMetadata({
  path: "/work-with-me",
  title: "Work with me",
  description:
    "Two engagements: getting a business found in search and in AI answers, and building a system that ships in verified waves.",
  og: {
    image: "/og/work-with-me.png",
    imageAlt: "James Brady — two ways to work together",
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
          <h1>Two engagements, and the entity that delivers each one.</h1>
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
            eyebrow="The two doors"
            heading="Which problem are you solving?"
            aside="The rest of this site is evidence. This page is the part you can hire. Each engagement below says what it measures or produces, who delivers it, what you are left holding, and roughly what it costs, before you write in."
          />

          <div className="grid-work grid-work--2" style={{ marginTop: "var(--s-6)" }}>
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
                that. If it is both, say so in the enquiry and the scope covers both.
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
