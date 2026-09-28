import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Fig } from "@/components/fg/Fig";
import { amount, countWord, publishedMethod, Row, WithFigs } from "@/components/fg/Offer";
import { JsonLd } from "@/components/site/instruments";
import { BUILD, BUILD_CARD, COACH_PROMISE, CONSULT } from "@/content/offers/build-card";
import { offers } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { WORK_WITH_ME_CAPSULE } from "@/lib/seo/routes";

/** The ways in: every offer, and writing to him. Counted, so the heading cannot go on saying an old number. */
const WAYS = offers.length + 1;

export const metadata: Metadata = pageMetadata({
  path: "/work-with-me",
  title: "Work with him",
  description: `${countWord(WAYS)} ways to work with James Brady: build with Utlyze, get found with New Reward, run background checks with Vuplicity, or write to him.`,
  og: { image: "/og/default.png", imageAlt: "James Brady — the ways to work with him" },
});

const PRICE_METHOD = publishedMethod("Utlyze", BUILD_CARD.sources[0]);

/**
 * Each door's own words, keyed by offer. The heading names who does the work; the text says what they do, from the
 * same sources as the offer page. An offer added without a door here still gets one, from its title and summary.
 */
const DOORS: Record<string, { by: string; heading: string; text: ReactNode; go: string }> = {
  "build-a-system": {
    by: "Utlyze · Consult or Build",
    heading: "Build with Utlyze",
    text: (
      <>
        <p>Build-with-you coaches. {COACH_PROMISE}</p>
        <p className="fgb-door__price">
          Consult <Fig n={CONSULT.price} m={PRICE_METHOD} /> · Build <Fig n={BUILD.price} m={PRICE_METHOD} />
        </p>
      </>
    ),
    go: "Consult or Build →",
  },
  "get-found": {
    by: "New Reward · Google and AI answers",
    heading: "Get found with New Reward",
    text: (
      <p>
        New Reward scores how your business shows up in Google and the major AI assistants, does the work you approve
        each month, and shows you what changed.
      </p>
    ),
    go: "How it works →",
  },
  "background-screening": {
    by: "Vuplicity · Background screening",
    heading: "Background checks with Vuplicity",
    text: (
      <p>
        Vuplicity runs background checks for your hires, with candidate consent and FCRA workflows built in. Its
        package prices are on its own site.
      </p>
    ),
    go: "How a check runs →",
  },
};

export default function WorkWithMePage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page fgb">
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/work-with-me",
            name: "Work with him",
            description: WORK_WITH_ME_CAPSULE,
            items: offers.map((o) => ({ path: `/work-with-me/${o.slug}`, name: o.title })),
          }),
        )}
      />

      <header className="fg-page__head">
        <p className="fg-eyebrow">Work with him</p>
        <h1 className="fg-h1">{countWord(WAYS)} ways in.</h1>
        {/* The capsule, as real prose at reading size, so an engine quoting this page alone gets the whole answer. */}
        <p className="fg-p">
          <WithFigs
            text={WORK_WITH_ME_CAPSULE}
            figures={[
              { n: amount(CONSULT.price), m: PRICE_METHOD },
              { n: amount(BUILD.price), m: PRICE_METHOD },
            ]}
          />
        </p>
      </header>

      {/* Each door is one link: the heading's link covers the card (app/fg-b.css). A price inside a door is a <Fig>,
          which takes focus to show its method, so the card cannot itself be an <a>. */}
      <div className="fgb-doors">
        {offers.map((o) => {
          const d = DOORS[o.slug];
          return (
            <article key={o.slug} className="fg-door fgb-door">
              <p className="fgb-door__by">{d?.by ?? o.deliveredBy.name}</p>
              <h2>
                <Link className="fgb-door__link" href={`/work-with-me/${o.slug}`}>
                  {d?.heading ?? o.title}
                </Link>
              </h2>
              {d?.text ?? <p>{o.summary}</p>}
              <span className="fg-door__go" aria-hidden="true">
                {d?.go ?? `${o.ctaLabel} →`}
              </span>
            </article>
          );
        })}
        <article className="fg-door fgb-door">
          <p className="fgb-door__by">Direct</p>
          <h2>
            <Link className="fgb-door__link" href="/contact">
              Write to him
            </Link>
          </h2>
          <p>Not sure which of these fits, or want to build this way yourself? Say so. He reads it.</p>
          <span className="fg-door__go" aria-hidden="true">
            Contact →
          </span>
        </article>
      </div>

      <div className="fgb-rows">
        <Row id="which" title="Which one is which">
          <div className="fgb-prose">
            <p>
              If customers can&rsquo;t find you, start with New Reward. If your team repeats work that a system could
              carry, start with Utlyze: a Consult block if you want the plan first, Build if you want it built. If you
              are about to hire someone, Vuplicity runs the checks.
            </p>
            <p>
              If it is more than one of these, say so in one note. Every enquiry on this site goes through the same
              form, and it says which kind it is.
            </p>
          </div>
        </Row>
      </div>
    </main>
  );
}
