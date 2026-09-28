import type { Metadata } from "next";
import Link from "next/link";

import { Fig, Label } from "@/components/fg/Fig";
import { JsonLd } from "@/components/site/instruments";
import HomeStage from "@/components/fg/HomeStage";
import snapshot from "@/content/history/history.snapshot.json";
import { threads } from "@/content/history/threads";
import { X_BIO } from "@/content/words/public";
import { hasPrivateWords, heroQuote, quoteById } from "@/lib/words";
import { homeGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "James Brady",
  description: hasPrivateWords
    ? "James Brady can't code. He directs the AI agents that do, and runs two companies with them. This site is grown from his public record."
    : "James Brady directs AI agents that write the code, and runs two companies with them. This site is grown from his public record.",
  og: { image: "/og/fulgurite.jpg", imageAlt: "A fulgurite grown from James Brady's public record" },
});

type Snap = typeof snapshot & { createdPerMonth: Record<string, number> };
const S = snapshot as Snap;
const METHOD = "GitHub, public data only, read " + S.generatedAt.slice(0, 10) + ".";
const day = (d: string) => Math.floor(Date.parse(d + "T00:00:00Z") / 864e5);
const now = S.generatedAt.slice(0, 10);
const repo = (n: string) => S.repos.find((r) => r.name.toLowerCase() === n.toLowerCase());
/** Catalogue number: the repository's place in his public record, oldest first. */
const cat = (n: string) => "JB-" + String(S.repos.findIndex((r) => r.name.toLowerCase() === n.toLowerCase()) + 1).padStart(3, "0");
const createdOn = (d: string) => S.repos.filter((r) => r.created === d).length;
const sprayRepos = Object.entries(S.createdPerMonth).filter(([m]) => m >= "2025-05" && m <= "2025-09").reduce((s, [, v]) => s + v, 0);
const plim = repo("CryptoJym/plimsoll")!;
const plimReleases = [...(S.releases["CryptoJym/plimsoll"] ?? [])].sort((a, b) => a.date.localeCompare(b.date));
const plimSpan = plimReleases.length ? day(plimReleases[plimReleases.length - 1].date) - day(plimReleases[0].date) : 0;
const eegtReleases = (S.releases["h3ro-dev/eegt"] ?? []).length;
const borg = repo("h3ro-dev/borg");
const all = [...S.repos.flatMap((r) => r.merges), ...S.anonymous.ownRepos, ...S.anonymous.otherPeoplesRepos, ...S.upstream.map((u) => u.date)];
const week = all.filter((d) => day(d) > day(now) - 7).length;
const latest = plimReleases[plimReleases.length - 1];
const activeThreads = threads.filter((t) => t.status === "active").length;
const PUBLISHED = "Published by Utlyze in its build notes (utlyze.com/notes/ox-alpha-week): its own count, not checked from outside.";

const said = ["q0", "q18", "x-2099823535082312045"].map(quoteById).filter((q): q is NonNullable<typeof q> => !!q);

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="fg-home">
      <JsonLd json={serializeGraph(homeGraph())} />
      <aside className="fg-stage" aria-label="A fulgurite grown from James Brady's public record. Described in the text beside it.">
        <HomeStage />
      </aside>

      <section className="fg-surface" aria-labelledby="hero">
        <h1 className="fg-eyebrow">James Brady · Lehi, Utah</h1>
        <blockquote className="fg-voice" id="hero">
          <q>{heroQuote.text}</q>
        </blockquote>
        <p className="fg-attrib">
          {heroQuote.url ? <a href={heroQuote.url}>{heroQuote.context}</a> : heroQuote.context}, {fmt(heroQuote.date)}
        </p>
        <p className="fg-lede">
          {hasPrivateWords ? "So his agents write the code." : "His agents write the code."} Under his name, in public,{" "}
          <Fig n={S.totals.mergedPublicAll} m={`Pull requests authored by his GitHub account and merged, in public repositories. ${METHOD}`} /> changes
          have merged. He runs two companies with them.
        </p>
        <nav className="fg-cta-row" aria-label="Where next">
          <a href="#descent">See what they built ↓</a>
          <Link className="fg-cta--primary" href="/work-with-me">
            Work with him →
          </Link>
        </nav>
      </section>

      <section className="fg-what" aria-labelledby="what">
        <p className="fg-eyebrow" id="what">What you&rsquo;re looking at</p>
        <p className="fg-p" style={{ marginTop: 14 }}>
          When lightning hits sand, the strike is gone in a millisecond. What it leaves behind is glass, fused along
          the path it took. That glass is called a fulgurite.
        </p>
        <p className="fg-p">
          Most of what AI agents do vanishes the same way. On one day in August, his fleet ran{" "}
          <Fig n="1,705" m={PUBLISHED} /> jobs and merged one. What merges stays. So the object beside this text is a
          fulgurite grown from his public record, and nobody drew it.
        </p>
        <div className="fg-key" aria-label="How to read it">
          <span><b>Depth is time.</b> The surface is his first public repository; the tip is {fmt(now)}.</span>
          <span><b>Each fork is a repository,</b> leaving the channel on the day it was made.</span>
          <span><b>Each bead is a merged change.</b> There are <Fig n={S.totals.mergedPublicAll} m={METHOD} />.</span>
          <span><b>Frosted glass is private work.</b> You can see it exists, not inside it.</span>
          <span><b>A clean break is work he cut.</b> Not everything is meant to last.</span>
          <span><b>Heat is now.</b> The glowing tips merged something in the last seven days.</span>
        </div>
      </section>

      <div id="descent" style={{ gridColumn: 1 }}>
        <Era depth="2024 to spring 2025" title="Small experiments.">
          <p className="fg-p">
            The record starts small: games, flashcards, a calculator, a video agent. Nothing here was meant to last. It
            was practice.
          </p>
        </Era>

        <Era depth="May to September 2025" title="The spray." thread="connectors">
          <p className="fg-p">
            Then a burst: <Fig n={sprayRepos} m={`Public repositories created from May to September 2025. ${METHOD}`} /> public
            repositories in five months. Among them, the <Thread id="connectors">connectors</Thread> that let an AI
            assistant use other apps, still his most-starred code. On 5 June, <Fig n={createdOn("2025-06-05")} m={`Repositories created on 2025-06-05. ${METHOD}`} />{" "}
            &ldquo;of one&rdquo; names in a single day: <Thread id="of-one">CEO of One, Director of One, VC of One</Thread>{" "}
            and the rest.
          </p>
          <p className="fg-era__cut">
            On 13 September, <Fig n={createdOn("2025-09-13")} m={`Repositories created on 2025-09-13. ${METHOD}`} /> landing pages in one day,
            all left within a fortnight. Ideas, not products. They&rsquo;re the short bare twigs near the top.
          </p>
        </Era>

        <Era depth="October 2025 to March 2026" title="Finding the threads." thread="found">
          <p className="fg-p">
            Fewer lines, longer ones. A <Thread id="minds">brainwave toolkit</Thread> in November. New Reward&rsquo;s{" "}
            <Thread id="found">visibility platform</Thread> starts, private, so its branch is frosted. This site begins
            on 29 November. Three <Thread id="teaching">teaching volumes</Thread> go up in February.
          </p>
          <p className="fg-era__cut">An earlier version of this site, and the teaching volumes, were later cut. Their branches end in a clean break.</p>
        </Era>

        <Era depth="April to July 2026" title="The deep systems." thread="plimsoll">
          <p className="fg-p">
            The record thickens. <Thread id="outside">Client work</Thread>: changes merged into a client&rsquo;s website,
            named here by industry only (heating and cooling). <Thread id="of-one">OfOne</Thread>, the decision method,
            on 13 May. <Thread id="plimsoll">Plimsoll</Thread> on 10 June, now the thickest branch on the specimen:{" "}
            <Fig n={plim.merges.length} m={`Merged pull requests in CryptoJym/plimsoll. ${METHOD}`} /> of its beads.
          </p>
          <p className="fg-p">
            He also forked <Thread id="methods">Dan McInerney&rsquo;s Architect Loop</Thread> and hardened it. The design
            is Dan&rsquo;s; the credit says so, and one of James&rsquo;s fixes was merged back into Dan&rsquo;s project.
          </p>
          <div className="fg-era__labels">
            <Label no={cat("CryptoJym/plimsoll")} name="Plimsoll" href="/work/plimsoll" rows={["A free meter for what AI coding helpers cost, matched to the work that merged.", { text: "github.com/CryptoJym/plimsoll", href: "https://github.com/CryptoJym/plimsoll" }, `since ${fmt(plim.created)}`]} state={{ text: "active", kind: "active" }} />
            <Label no={cat("CryptoJym/ofone-skillchain")} name="OfOne" href="/work/ofone" rows={["A method for hard decisions: Ask, Map, Move.", { text: "github.com/CryptoJym/ofone-skillchain", href: "https://github.com/CryptoJym/ofone-skillchain" }]} state={{ text: "active", kind: "active" }} />
          </div>
        </Era>

        <Era depth="August 2026" title="The fleet goes public." thread="fleet">
          <p className="fg-p">
            In the week of 22 to 27 August his agents merged <Fig n={147} m={PUBLISHED} /> changes across six
            repositories, with <Fig n={102} m={PUBLISHED} /> agents running at the peak. On one of those days,{" "}
            <Fig n="1,705" m={PUBLISHED} /> agent runs produced a single merge. That became the rule: merged on main, or it
            does not exist.
          </p>
          <p className="fg-p">
            <Thread id="fleet">BORG</Thread>, the shared memory his agents use, went public on 29 August, free to
            install.
          </p>
          {borg && (
            <div className="fg-era__labels">
              <Label no={cat("h3ro-dev/borg")} name="BORG" rows={["One shared memory for a fleet of AI agents, on your own Macs.", { text: "github.com/h3ro-dev/borg", href: "https://github.com/h3ro-dev/borg" }, `${borg.merges.length} merged changes`]} state={{ text: "active", kind: "active" }} />
            </div>
          )}
        </Era>

        <Era depth="September 2026" title="Consolidation." thread="minds">
          <p className="fg-p">
            Plimsoll shipped <Fig n={plimReleases.length} m={`Releases of CryptoJym/plimsoll. ${METHOD}`} /> releases in{" "}
            <Fig n={plimSpan} m="Days from the first to the latest of those releases." /> days. The Of One sites moved onto one
            template (frosted: that repository is private), and the method got its three words, Ask, Map, Move.{" "}
            <Thread id="minds">EEGT</Thread>, an open notebook asking whether computer models &ldquo;hear&rdquo; the same
            patterns in brainwaves, went public: <Fig n={eegtReleases} m={`Releases of h3ro-dev/eegt. ${METHOD}`} /> releases
            so far, and every main result marked inconclusive.
          </p>
          <p className="fg-p">On 27 September he commissioned this site.</p>
        </Era>
      </div>

      <section className="fg-tip" aria-labelledby="tip">
        <p className="fg-eyebrow" id="tip">The tip · now</p>
        <h2 className="fg-h2" style={{ marginTop: 14 }}>Still hot.</h2>
        <div className="fg-tip__grid">
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig n={week} live m={`Merged public changes in the seven days to ${now}. ${METHOD}`} /></span>
            <span className="fg-tip__k">changes merged in the last seven days</span>
          </div>
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig n={S.totals.mergedPublic30d} live m={`Merged public changes in the thirty days to ${now}. ${METHOD}`} /></span>
            <span className="fg-tip__k">in the last thirty</span>
          </div>
          {latest && (
            <div className="fg-tip__cell">
              <span className="fg-tip__n"><Fig n={latest.tag} live m={`The latest Plimsoll release, ${latest.date}. ${METHOD}`} /></span>
              <span className="fg-tip__k">latest Plimsoll release, {fmt(latest.date)}</span>
            </div>
          )}
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig n={activeThreads} live m="Threads of work marked active in content/history/threads.ts." /></span>
            <span className="fg-tip__k">threads still growing</span>
          </div>
        </div>
        <p className="fg-attrib" id="tip-end">Read from GitHub on {fmt(now)}. <Link href="/now">What he&rsquo;s working on now →</Link></p>
      </section>

      <section className="fg-said" aria-labelledby="said">
        <p className="fg-eyebrow" id="said">In his words</p>
        <div className="fg-said__list">
          {said.map((q) => (
            <figure key={q.id} style={{ margin: 0 }}>
              <blockquote className="fg-voice"><q>{q.text}</q></blockquote>
              <figcaption className="fg-attrib">{q.url ? <a href={q.url}>{q.context}</a> : q.context}, {fmt(q.date)}</figcaption>
            </figure>
          ))}
        </div>
        <p className="fg-attrib" style={{ marginTop: 26 }}><Link href="/words">More, exactly as he said it →</Link></p>
      </section>

      <section className="fg-doors" aria-labelledby="doors">
        <p className="fg-eyebrow" id="doors">Ways in</p>
        <h2 className="fg-h2" style={{ marginTop: 14 }}>{X_BIO.text}.</h2>
        <p className="fg-attrib"><a href={X_BIO.url}>his X bio</a></p>
        <div className="fg-doors__grid">
          <Link className="fg-door" href="/work-with-me">
            <h3>Work with his team</h3>
            <p>Build with Utlyze&rsquo;s build-with-you coaches, get your business found with New Reward, or run background checks with Vuplicity.</p>
            <span className="fg-door__go">Ways to work together →</span>
          </Link>
          <a className="fg-door" href="https://github.com/h3ro-dev/borg">
            <h3>Use what he gave away</h3>
            <p>BORG, Plimsoll, the OfOne method and the EEGT notebook are open source. Install them, fork them, fix them.</p>
            <span className="fg-door__go">Start with BORG →</span>
          </a>
          <a className="fg-door" href="https://x.com/of1ai" rel="me">
            <h3>Follow the work</h3>
            <p>Short notes on X as it happens, and longer build notes on Utlyze, each one credited to him and to the AI models that wrote it with him.</p>
            <span className="fg-door__go">@of1ai →</span>
          </a>
          <Link className="fg-door" href="/contact">
            <h3>Write to him</h3>
            <p>If you&rsquo;re curious and want to build this way, say so. He reads it.</p>
            <span className="fg-door__go">Contact →</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Era({ depth, title, thread, children }: { depth: string; title: string; thread?: string; children: React.ReactNode }) {
  return (
    <section className="fg-era" style={{ paddingInline: "var(--gutter)" }} data-thread={thread}>
      <p className="fg-era__depth">Depth · {depth}</p>
      <h2 className="fg-h2">{title}</h2>
      {children}
    </section>
  );
}

function Thread({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span className="fg-thread" data-thread={id} tabIndex={0}>
      {children}
    </span>
  );
}

function fmt(d: string) {
  const [y, m, dd] = d.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${dd} ${months[m - 1]} ${y}`;
}
