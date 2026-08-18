import type { Metadata } from "next";

import { Manifold } from "@/components/site/Manifold";
import {
  Dot,
  JsonLd,
  PageNameplate,
  SectionHead,
} from "@/components/site/instruments";
import { ProofBank } from "@/components/site/work";
import {
  offers,
  outsideStars,
  proofSlots,
  publicRepoNames,
  publicRepos,
  repoSnapshotDate,
  systemsListed,
  theoriesActive,
  theoriesListed,
  theoriesPaused,
} from "@/lib/content";
import { HomeDoors } from "@/components/site/HomeDoors";
import { VISIT_DOORS } from "@/lib/content/visits";
import { homeGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: SITE.title,
  description: SITE.description,
  og: {
    image: "/og/default.png",
    imageAlt: "James Brady — builds AI systems that show their work",
  },
});

/** Two-digit instrument formatting. The value itself is always derived. */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// The door row reads the offer collection rather than restating it: the
// summaries, the slugs and the delivering entity all come from the same
// entries the offer pages render, so the door and the page it opens cannot
// describe different things.
const [getFound, buildSystem, screening] = offers;

export default function HomePage() {
  return (
    <>
      <JsonLd json={serializeGraph(homeGraph())} />

      <header className="hero" id="top">
        <Manifold />
        <div className="hero__scrim" aria-hidden="true" />

        <div className="wrap hero__in">
          <div className="hero__copy">
            <p className="eyebrow-b rise d1">
              <span>Lehi, UT</span>
              <i aria-hidden="true">/</i>
              <span>Utlyze</span>
              <i aria-hidden="true">/</i>
              <span>New Reward</span>
            </p>

            <h1 className="rise d2">
              James Brady builds AI systems that{" "}
              <span className="mark-under">show their work</span>.
            </h1>

            <p className="hero__sub rise d3">
              One person. Two shops. You either need customers to find you,
              or you need a system built. Start there.
            </p>
          </div>

          <aside
            className="hero__panel panel panel--strip rise d5"
            aria-label="What this page can back up"
          >
            <div className="panel__head">
              <span>Readout</span>
              <span>
                <Dot state="live" /> <span className="tag-live">counted</span>
              </span>
            </div>
            <ul className="readout">
              <li>
                <span className="k">Systems listed</span>
                <span className="rule" aria-hidden="true" />
                <span className="v">{pad(systemsListed)}</span>
              </li>
              <li className="has-sub">
                <span className="ln">
                  <span className="k">Public repos</span>
                  <span className="rule" aria-hidden="true" />
                  <span className="v">{pad(publicRepos.length)}</span>
                </span>
                <span className="sub">{publicRepoNames.join(" · ")}</span>
              </li>
              <li className="has-sub">
                <span className="ln">
                  <span className="k">Outside stars</span>
                  <span className="rule" aria-hidden="true" />
                  <span className="v">{pad(outsideStars)}</span>
                </span>
                <span className="sub">
                  Summed across all {publicRepos.length} public repos · snapshot{" "}
                  {repoSnapshotDate}
                </span>
              </li>
              <li className="has-sub">
                <span className="ln">
                  <span className="k">Theories</span>
                  <span className="rule" aria-hidden="true" />
                  <span className="v">{pad(theoriesListed)}</span>
                </span>
                <span className="sub">
                  {theoriesActive} active, {theoriesPaused} paused, and it says which
                </span>
              </li>
            </ul>
            <PageNameplate
              source="Public repos · live pages · the typed content source"
              method="Counted, one by one. Nothing rounded up."
            />
          </aside>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <HomeDoors
          visitDoors={VISIT_DOORS}
          doors={[
            {
              label: "Get my business found",
              who: "For an owner whose customers cannot find them",
              detail: `${getFound.summary} Delivered by ${getFound.deliveredBy.name}.`,
              href: `/work-with-me/${getFound.slug}`,
            },
            {
              label: "Build me a system",
              who: "For a founder or an operator with a build to run",
              detail: `${buildSystem.summary} Delivered by ${buildSystem.deliveredBy.name}.`,
              href: `/work-with-me/${buildSystem.slug}`,
            },
            {
              label: "Screen your hires",
              who: "For an employer about to trust a stranger",
              detail: `${screening.summary} Delivered by ${screening.deliveredBy.name}.`,
              href: `/work-with-me/${screening.slug}`,
            },
            {
              label: "Read the code",
              who: "For a builder who would rather check than be told",
              detail: `${systemsListed} systems, ${publicRepos.length} of them in public repositories you can open from the card.`,
              href: "/work",
            },
          ]}
        />

        <section className="proof" id="proof">
          <div className="wrap">
            <SectionHead
              num="01"
              eyebrow="Proof"
              heading={`${proofSlots.length} things you can go look at right now.`}
              aside="Each one links to the thing itself: a repo, a doc site, a running product, and not a case study about it. Every value and every last-active date is read from the content source when the page is built."
            />
            <ProofBank entries={proofSlots} />
          </div>
        </section>
      </main>
    </>
  );
}
