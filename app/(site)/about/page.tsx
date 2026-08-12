import type { Metadata } from "next";
import Link from "next/link";

import {
  JsonLd,
  PageNameplate,
  Prose,
  SectionHead,
} from "@/components/site/instruments";
import { aboutDoctrine, aboutStory } from "@/content/site";
import { renderMarkdown } from "@/lib/content/markdown";
import { aboutGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About",
  description:
    "Who does what across James Brady, Utlyze and New Reward, and how one person checks work before it ships.",
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
      "A claim is not proof. An agent saying it finished is a report, not a result, so the finished thing gets checked at the place it actually lives, not in the chat that produced it. If a change is supposed to be on the site, the site is what gets read. If a report is supposed to have gone out, the sent folder is what gets read.",
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
 * The prose moved to content/site/index.ts in wave 3 so two consumers can read
 * it: this page, which renders its gaps in the third person for a reader who
 * is not the owner, and /now, which lists the same gaps as the work log they
 * are. The marks themselves are untouched, text included.
 */

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
            <Prose
              html={renderMarkdown(aboutStory.body, {
                mode: "public",
                notes: aboutStory.publicNotes,
              })}
            />

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
                <Prose
                  html={renderMarkdown(aboutDoctrine.body, {
                    mode: "public",
                    notes: aboutDoctrine.publicNotes,
                  })}
                />
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
            {/* The trail stays walkable. This page states what is missing; the
                work log states the same gaps as the open questions they are,
                in the words they were asked in. */}
            <div className="panel">
              <div className="panel__head">
                <span>Open items</span>
              </div>
              <div className="panel__body">
                Where this page says a fact is not published yet, the open question behind
                it is listed in full on <Link href="/now">the work log</Link>, together
                with every other one the site is carrying.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
