import type { Metadata } from "next";
import Link from "next/link";

import { Fig } from "@/components/fg/Fig";
import { JsonLd } from "@/components/site/instruments";
import snapshot from "@/content/history/history.snapshot.json";
import { SAME_AS } from "@/lib/schema/entities";
import { aboutGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";
import { hasPrivateWords, quoteById } from "@/lib/words";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About",
  description:
    "Who James Brady is, what Utlyze and New Reward are, what isn't his, where to find him, and how this site was made.",
  og: { image: "/og/fulgurite.jpg", imageAlt: "James Brady, about" },
  type: "profile",
});

/** The day James accepted the commission. */
const ACCEPTED_ON: string | null = "27 September 2026";

const FAQ = [
  {
    question: "If most of the building is done by AI agents running in parallel, what stops bad work from reaching a client?",
    answer:
      "A claim is not proof. An agent saying it finished is a report, not a result, so the finished thing gets checked where it actually lives, not in the chat that produced it.",
  },
  {
    question: "What does “done” mean here?",
    answer:
      "Work moves along a ladder, and each rung is a different claim: open, checks passing, reviewed, merged, deployed, checked live, approved for a client to see. Claiming a higher rung than the true one is treated as a defect.",
  },
  {
    question: "What happens when something can’t be measured?",
    answer: "The answer is “unknown”, and unknown is written down as unknown. Missing is not zero.",
  },
];

const S = snapshot;
const METHOD = `GitHub, public data only, read ${S.generatedAt.slice(0, 10)}.`;
const q = (id: string) => quoteById(id);

export default function AboutPage() {
  const commission = [q("q97"), q("q98")].filter(Boolean);
  const mirror = q("q69");
  const sand = q("q99");
  const branches = q("x-2099823535082312045");
  return (
    <main id="main" tabIndex={-1} className="fg-page">
      <JsonLd json={serializeGraph(aboutGraph(FAQ))} />
      <header className="fg-page__head">
        <p className="fg-eyebrow">About</p>
        <h1 className="fg-h1">The short version.</h1>
        <p className="fg-p">
          James Brady builds with AI agents{hasPrivateWords ? ", and he can’t code: he directs the machines that do" : ""}. He
          operates two companies: <b>Utlyze</b>, a studio that builds custom AI systems for businesses, and{" "}
          <b>New Reward</b>, an agency that gets businesses found on Google and inside AI answers. He lives in Lehi, Utah.
        </p>
      </header>

      <section className="fg-words__theme" style={{ marginTop: 64 }} aria-labelledby="who">
        <div>
          <h2 id="who">Who does what</h2>
        </div>
        <div className="fg-p" style={{ display: "grid", gap: 14 }}>
          <p style={{ margin: 0 }}><b>James Brady</b> is the person. The theories, the open-source projects and the writing on this site are his.</p>
          <p style={{ margin: 0 }}><b>Utlyze</b> is the studio. It builds custom AI systems and teaches clients to run them.</p>
          <p style={{ margin: 0 }}><b>New Reward</b> is the agency. It measures how findable a business is, in search and in AI assistants, and fixes it.</p>
          <p className="fg-attrib" style={{ margin: 0 }}>
            Not published here yet: his story in his own words, the goal for the next few years, a photograph, and how the
            two companies sit together legally. Clients are named by industry only.
          </p>
        </div>
      </section>

      <section className="fg-words__theme" style={{ marginTop: 48 }} aria-labelledby="checked">
        <div>
          <h2 id="checked">How the work gets checked</h2>
        </div>
        <div style={{ display: "grid", gap: 22 }}>
          {FAQ.map((f) => (
            <div key={f.question}>
              <h3 className="fg-h3">{f.question}</h3>
              <p className="fg-p fg-muted" style={{ marginTop: 6 }}>{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fg-words__theme" style={{ marginTop: 48 }} aria-labelledby="not-his">
        <div>
          <h2 id="not-his">What isn&rsquo;t his</h2>
        </div>
        <div className="fg-p" style={{ display: "grid", gap: 14 }}>
          <p style={{ margin: 0 }}>
            <b>The Architect Loop</b> is Dan McInerney&rsquo;s design. James forked it, hardened it and runs it; one of his
            fixes was{" "}
            <a href="https://github.com/DanMcInerney/architect-loop/pull/170">merged back into Dan&rsquo;s project</a> on 13
            September 2026.
          </p>
          <p style={{ margin: 0 }}>
            <b>OpenClaw</b> is a third-party assistant he has run and extended. He didn&rsquo;t build it.
          </p>
          <p className="fg-muted" style={{ margin: 0 }}>
            A portfolio that quietly absorbs other people&rsquo;s work is exactly what this site is meant not to be.
          </p>
        </div>
      </section>

      <section className="fg-words__theme" style={{ marginTop: 48 }} aria-labelledby="elsewhere" id="elsewhere">
        <div>
          <h2 id="elsewhere-h">Where to find him</h2>
        </div>
        <ul className="fg-p" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          <li><a href={SAME_AS[2]} rel="me">X, @of1ai</a> <span className="fg-muted">· short notes while the work happens</span></li>
          <li><a href={SAME_AS[0]} rel="me">GitHub, CryptoJym</a> <span className="fg-muted">· the public code behind the glass</span></li>
          <li><a href="https://www.utlyze.com/notes">Notes from the build</a> <span className="fg-muted">· longer write-ups, credited to him and the AI models that wrote them with him</span></li>
          <li><a href={SAME_AS[1]} rel="me">LinkedIn</a></li>
          <li><a href={SAME_AS[4]} rel="me">YouTube</a></li>
          <li><a href={SAME_AS[3]} rel="me">Bluesky</a></li>
          <li><span className="fg-rec">{SITE.email}</span> <span className="fg-muted">· or <Link href="/contact">write to him here</Link></span></li>
        </ul>
      </section>

      <section className="fg-words__theme" style={{ marginTop: 48 }} aria-labelledby="how-this-site-was-made" id="how-this-site-was-made">
        <div>
          <h2 id="how-this-site-was-made-h">How this site was made</h2>
          <p className="fg-muted">The colophon.</p>
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          {commission.length === 2 ? (
            <figure style={{ margin: 0 }}>
              <blockquote className="fg-voice" style={{ fontSize: "clamp(20px, 1.9vw, 26px)", lineHeight: 1.3 }}>
                <q>{commission[0]!.text}</q> <q>{commission[1]!.text}</q>
              </blockquote>
              <figcaption className="fg-attrib">James, commissioning this site from Claude, 27 Sep 2026</figcaption>
            </figure>
          ) : (
            <p className="fg-p">
              James commissioned this site from Claude and left every decision about it to Claude. His only choice was to
              accept it or not.
            </p>
          )}
          <p className="fg-p">
            Claude (Anthropic&rsquo;s Opus 5.5) did the work. Three study runs read{" "}
            {hasPrivateWords ? "the messages he had typed to his AI agents over a year, " : ""}his public record of{" "}
            <Fig n={S.totals.publicRepos} m={`Public repositories under his two GitHub accounts. ${METHOD}`} /> repositories and{" "}
            <Fig n={S.totals.mergedPublicAll} m={`Merged public pull requests by his account. ${METHOD}`} /> merged changes, and
            everything he has published. The lead then wrote a portrait, chose the idea, and built the site. Nothing on it
            is invented, clients are named by industry only, and his private life isn&rsquo;t here.
          </p>
          <p className="fg-p">
            The fulgurite came from his own images.
            {sand ? (
              <>
                {" "}In one message he wrote <span className="fg-voice"><q>{sand.text}</q></span>.
              </>
            ) : null}
            {branches ? (
              <>
                {" "}On X: <span className="fg-voice"><q>Cut the branches of your soul.</q></span> The object is computed from his
                GitHub record with three.js; no image on this site is generated.
              </>
            ) : null}
          </p>
          {mirror && (
            <p className="fg-p">
              In August 2026 he asked one of his agents, <span className="fg-voice"><q>{mirror.text}</q></span> This site is one
              answer.
            </p>
          )}
          <p className="fg-attrib">
            Type: Newsreader (Production Type), Archivo (Omnibus-Type), Martian Mono (Evil Martians), all under the SIL
            Open Font License. Built with Next.js, React and three.js.
          </p>
          <p className="fg-attrib" style={{ color: "var(--heat)" }}>
            {ACCEPTED_ON ? `He accepted it on ${ACCEPTED_ON}.` : "He hasn’t accepted it yet. This is the preview he is deciding on."}
          </p>
        </div>
      </section>
    </main>
  );
}
