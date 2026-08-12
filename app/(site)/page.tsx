import type { Metadata } from "next";
import Link from "next/link";

import { Manifold } from "@/components/site/Manifold";
import { DockTrigger } from "@/components/site/Dock";
import {
  Dot,
  JsonLd,
  PageNameplate,
  SectionHead,
} from "@/components/site/instruments";
import { ProofBank, Tally, WorkFilters, WorkGrid } from "@/components/site/work";
import { DoorRow } from "@/components/site/offers";
import { TheoryList } from "@/components/site/theories";
import {
  discoverableTheories,
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
  work,
} from "@/lib/content";
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
            {/* No status dot here: these are subjects, not states. Dots mean
                live / active / paused / dormant and nothing else. */}
            <p className="eyebrow-b rise d1">
              <span>Agent fleets</span>
              <i aria-hidden="true">/</i>
              <span>Open source</span>
              <i aria-hidden="true">/</i>
              <span>Evidence, not adjectives</span>
            </p>

            <h1 className="rise d2">
              James Brady builds AI systems that{" "}
              <span className="mark-under">show their work</span>.
            </h1>

            <p className="hero__sub rise d3">
              One person, operating at fleet scale — documenting what actually works.
            </p>

            {/* Both demoted to ghost in wave 3. The door row below now carries
                the page's primary sort, and two competing primary treatments
                above the fold is how a visitor ends up pressing neither. */}
            <div className="hero__cta rise d5">
              <Link href="#proof" className="btn btn--ghost">
                SEE THE PROOF <span className="arw" aria-hidden="true">→</span>
              </Link>
              <DockTrigger className="btn btn--ghost">
                <>
                  ASK ABOUT MY WORK <span className="arw" aria-hidden="true">→</span>
                </>
              </DockTrigger>
            </div>
            <p className="hero__terms rise d5">
              The assistant is grounded only in what&rsquo;s published here, and it says
              when it doesn&rsquo;t know.
            </p>
          </div>

          {/* Page-level counts only. Per-system numbers live in the proof bank;
              the two used to say most of the same things twice. */}
          <aside
            className="hero__panel panel rise d4"
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
        {/* ======================= 00 / DOORS ======================= *
         * Sorted by WHO the visitor is, not by what the site contains.
         * The five-persona audit found every persona landing on the same
         * two buttons: an owner who wants customers, a founder who wants
         * something built, and a builder who wants the source were all
         * offered "see the proof". Two of the three had no reason to press
         * it. */}
        <section className="doorway" aria-labelledby="doorway-h">
          <div className="wrap">
            <h2 className="doorway__h" id="doorway-h">
              What did you come here to do?
            </h2>
            <DoorRow
              label="Choose a starting point"
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
          </div>
        </section>

        {/* ======================= 01 / PROOF ======================= */}
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

        {/* ======================= 02 / WORK ======================== */}
        <section className="work" id="work">
          <div className="wrap">
            <SectionHead
              num="02"
              eyebrow="Work"
              heading="Products, open source, client work, experiments."
              aside="Filter the shelf. The count below updates with it. The number is read from what is on screen, not typed in, and there is no denominator to fall out of date."
            />
            <WorkFilters />
            <WorkGrid entries={work} />
            <Tally />
          </div>
        </section>

        {/* ===================== 03 / THEORIES ====================== */}
        <section className="theories" id="theories">
          <div className="wrap">
            <SectionHead
              num="03"
              eyebrow="Theories"
              heading="Open questions I'm working in public."
              aside="Labeled by what they actually are. Anything still named-only stays off this page until it is at least sketched."
            />
            <TheoryList entries={discoverableTheories} />
          </div>
        </section>
      </main>
    </>
  );
}
