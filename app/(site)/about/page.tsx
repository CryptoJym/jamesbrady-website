import type { Metadata } from "next";

import {
  JsonLd,
  PageNameplate,
  Prose,
  SectionHead,
} from "@/components/site/instruments";
import { renderMarkdown } from "@/lib/content/markdown";
import { aboutGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About",
  description:
    "Who does what across James Brady, Utlyze and New Reward — and how one person checks work before it ships.",
  og: { image: "/og/about.png", imageAlt: "James Brady — about" },
  type: "profile",
});

/**
 * The reliability answer, as a genuine question-and-answer block. /about and
 * /contact are the only two routes permitted to emit FAQPage (§2.3), because
 * they are the only two that actually render questions and answers.
 */
const FAQ = [
  {
    question:
      "If most of the building is done by AI agents running in parallel, what stops bad work from reaching a client?",
    answer:
      "A claim is not proof. An agent saying it finished is a report, not a result, so the finished thing gets checked at the place it actually lives — not in the chat that produced it. If a change is supposed to be on the site, the site is what gets read. If a report is supposed to have gone out, the sent folder is what gets read.",
  },
  {
    question: "What does “done” mean here?",
    answer:
      "Work moves along a ladder, and each rung is a different claim: open, then checks passing, then reviewed, then merged, then deployed, then checked live, then approved for a client to see. Saying a higher rung than the true one is treated as a defect, not a rounding error.",
  },
  {
    question: "Who grades the work?",
    answer:
      "Whatever grades the work is separate from what produced it, and the standard is frozen before the work starts. If the thing being tested can edit the test, the test decides nothing. The frozen set includes the test files and the scripts the check depends on, and a change to any of them is compared afterward.",
  },
  {
    question: "What happens when something cannot be measured?",
    answer:
      "The answer is “unknown”, and unknown is written down as unknown. It never quietly becomes a zero, an estimate, or a confident sentence. Missing is not zero.",
  },
];

/*
 * "One person, operating at fleet scale" is OWNER-APPROVED COPY, not an
 * unresolved question (review addendum, A7). SITE-BRIEF.md line 8 sets the
 * support line verbatim and the decisions log ratifies it on 2026-08-11
 * ("Hero: 'builds AI systems that show their work' + fleet-scale support. —
 * James"). The [JAMES:] clearance mark that used to sit under the doctrine
 * section asked whether the fleet could be described in public at all; that
 * ruling answers it, so the mark is resolved and the copy stands.
 *
 * Still open here, and deliberately: the human story, the multi-year goal,
 * the real photograph, the entity-structure confirmation, and the one
 * measured throughput figure. Those are facts nobody but James has.
 */
const STORY = `## The short version

James Brady builds AI systems that show their work. One person, operating at fleet scale, documenting what actually works. Based in Lehi, Utah.

[JAMES: the human story. Two or three paragraphs, in your voice, covering: how you got here, what you were doing before this, and why you work this way instead of some other way. This is the single biggest gap on the page. Everything else below is process, and process without a person reads like a manual.]

[JAMES: one sentence on what you are trying to build over the next few years. Not a mission statement. The actual goal.]

[JAMES: a real photograph. The site brief lists a real photo asset as a build gate.]

## Who does what

Three names show up across this site, and they are not the same thing.

**James Brady** is the person. The theories, the open-source projects, and the writing are mine.

**Utlyze** is the studio. It builds products and takes on custom software and systems work.

**New Reward** is the agency. It does the visibility work: measuring how findable a business is in search and inside AI assistants, and then fixing it.

I operate both. When a page on this site says a client engagement, it names the industry and not the company, unless that company has given written permission to be named.

[JAMES: confirm this split is how you want it stated, and confirm the legal entity names and structure. Is Utlyze the parent, is New Reward a brand under it, or are they separate? This paragraph should match reality exactly, because it is the one a lawyer or a prospective client will read closely.]`;

const DOCTRINE = `**Machines hold the gates, not memory.** Required checks run on every change. A merge queue tests changes together, in order, before they land, so two changes that each pass alone but break together get caught before a person sees them. None of this depends on anyone remembering to run something.

**Numbers are computed, not typed.** Every number on this site is derived from its source when the page is built. The old version of this site displayed a hand-typed count that was wrong by a factor of eight. That class of mistake is now impossible here, by construction.

**Irreversible things stop for a human.** Sending a client message, spending money, publishing, deploying, deleting data. Agents prepare those. A person approves them. That is not a limitation I am working around. It is the design.

[JAMES: one measured throughput number would make this section land, with its method and window. Something in the shape of "N changes merged in a 7-day window, every one through the same required checks". You have measured this. Approve a figure and a window, or this section stays qualitative.]

## What I use, and what is not mine

\`OpenClaw\` is a third-party project. I run and extend a self-hosted instance of it, with custom skills, a gateway, and hardware hookups. I did not build OpenClaw.

\`architect-loop\` is a fork of a project by Dan McInerney. I run a heavily customized copy daily and have contributed a fix upstream. The original design is his.

I mention both because a portfolio that quietly absorbs other people's work is exactly the kind of thing this site is supposed to be the opposite of.`;

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(aboutGraph(FAQ))} />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>About</span>
            <i aria-hidden="true">/</i>
            <span>{SITE.location}</span>
          </p>
          <h1>One person, and the machinery that keeps him honest.</h1>
          <p className="page-lead">
            James Brady builds AI systems that show their work, from Lehi, Utah, across two
            entities: Utlyze, the studio, and New Reward, the agency. The page below says
            which entity delivers what, and answers the fair question about reliability
            without jargon.
          </p>
        </div>

        <div className="article">
          <div>
            <Prose html={renderMarkdown(STORY)} />

            <section aria-labelledby="reliability" style={{ marginTop: "var(--s-7)" }}>
              <SectionHead
                eyebrow="Reliability"
                heading="How one person checks work before it ships."
                aside="This is the fair question, answered in plain words rather than in process vocabulary."
              />
              <div style={{ display: "grid", gap: "var(--s-4)", marginTop: "var(--s-5)" }}>
                {FAQ.map((f) => (
                  <div className="panel" key={f.question}>
                    <div className="panel__head">
                      <span>{f.question}</span>
                    </div>
                    <div className="panel__body">{f.answer}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "var(--s-6)" }}>
                <Prose html={renderMarkdown(DOCTRINE)} />
              </div>
            </section>
          </div>

          <aside className="article__aside" aria-label="Entities">
            <div className="panel">
              <div className="panel__head">
                <span>Entity map</span>
              </div>
              <div className="panel__body">
                <p>
                  <strong style={{ color: "var(--t-hi)" }}>James Brady</strong> — the
                  person. Theories, open source, writing.
                </p>
                <p style={{ marginTop: "var(--s-3)" }}>
                  <strong style={{ color: "var(--t-hi)" }}>Utlyze</strong> — the studio.
                  Products, custom software and systems work.
                </p>
                <p style={{ marginTop: "var(--s-3)" }}>
                  <strong style={{ color: "var(--t-hi)" }}>New Reward</strong> — the
                  agency. Visibility measurement and the work that follows from it.
                </p>
              </div>
              <PageNameplate
                source="Stated by James; entity structure pending confirmation"
                method="No number appears on this page, so none is derived"
              />
            </div>
            <div className="panel">
              <div className="panel__head">
                <span>Human presence</span>
              </div>
              <div className="panel__body">
                <div className="who">
                  <div className="who__ph" aria-hidden="true">
                    <span>
                      PHOTO
                      <br />
                      PENDING
                    </span>
                  </div>
                  <p className="colophon">
                    A real photograph is a build gate for this page and has not been
                    supplied yet. The box says so rather than standing in for one.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
