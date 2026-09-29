import type { Metadata } from "next";
import Link from "next/link";

import { Fig, Label } from "@/components/fg/Fig";
import { JsonLd } from "@/components/site/instruments";
import EraWindow from "@/components/fg/EraWindow";
import HomeStage from "@/components/fg/HomeStage";
import { FLEET_NOTES, STATUS_METHOD, built, builtById, builtDate, countStatus, latestClientResult, mentionedOnly, outcomes } from "@/content/built";
import snapshot from "@/content/history/history.snapshot.json";
import { X_BIO } from "@/content/words/public";
import { hasPrivateWords, heroQuote, quoteById, type Quote } from "@/lib/words";
import { homeGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import type { ERAS } from "@/lib/specimen/eras";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "James Brady",
  description: hasPrivateWords
    ? "James Brady can't code. With a small team and a fleet of AI agents, he builds AI systems for businesses, co-founded Utlyze and New Reward, gives tools away and teaches. What he built, and what went wrong."
    : "With a small team and a fleet of AI agents, James Brady builds AI systems for businesses, co-founded Utlyze and New Reward, gives tools away and teaches. What he built, and what went wrong.",
  og: { image: "/og/fulgurite.jpg", imageAlt: "A fulgurite grown from what James Brady built" },
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

// What he built, from content/built: the proofs, the counts and the tip's latest result are read from there.
const water = builtById("water-filtration-texting");
const [waterBack, waterBought] = water.outcomes!;
const setups = builtById("utlyze-ai-setups-for-businesses");
const liveToday = countStatus("live");
const LIVE_METHOD = `Pieces of work on this site's /work page whose status is live: ${liveToday} of ${built.length}. ${STATUS_METHOD}`;
const lastResult = latestClientResult(now);

const said = ["q0", "q54", "q8"].map(quoteById).filter((q): q is Quote => !!q);
const said1 = (id: string) => quoteById(id);

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="fg-home">
      <JsonLd json={serializeGraph(homeGraph())} />
      <aside className="fg-stage" aria-label="A fulgurite grown from what James Brady built. Described in the text beside it.">
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
          {hasPrivateWords ? "So he builds with people and machines:" : "He builds with people and machines:"} a small team, and
          a fleet of AI agents that write the code.
        </p>
        <p className="fg-eyebrow fg-proofs__h" id="proofs">What it did</p>
        <ul className="fg-proofs" aria-labelledby="proofs">
          <li className="fg-proof">
            <p className="fg-proof__k">Water filtration · <span className="fg-proof__live">live</span></p>
            <p className="fg-proof__t">
              <span className="fg-proof__n"><Fig k="water-back" n={waterBack.figure!.n} m={waterBack.figure!.method} /></span>{" "}
              {waterBack.text}{" "}
              Reminder texts he built from the company’s own invoices.
            </p>
          </li>
          <li className="fg-proof">
            <p className="fg-proof__k">Trade businesses · shipped</p>
            <p className="fg-proof__t">
              <span className="fg-proof__n">
                <Fig k="setups" n={setups.outcomes!.length} m="Counted from this site's record of the work (content/built): a construction company, a glass company and a real-estate group, 21 August to 2 September 2026." />
              </span>{" "}
              firms given hands-on AI set-ups in August and September 2026: a construction company, a glass company and a
              real-estate group.
            </p>
          </li>
          <li className="fg-proof">
            <p className="fg-proof__k">A Utah university · <span className="fg-proof__live">live</span></p>
            <p className="fg-proof__t">
              <span className="fg-proof__n fg-rec">Since 2024</span> he has taught AI there, and he sits on its software-engineering
              advisory board.
            </p>
          </li>
          <li className="fg-proof">
            <p className="fg-proof__k">The fleet · <span className="fg-proof__live">live</span></p>
            <p className="fg-proof__t">
              <span className="fg-proof__n"><Fig k="fleet-peak" n={102} m={FLEET_NOTES} /></span> AI agents running at once, at the peak of
              the week of 22 to 27 August 2026. They merged <Fig n={147} m={FLEET_NOTES} /> changes that week.
            </p>
          </li>
        </ul>
        <nav className="fg-cta-row" aria-label="Where next">
          <a href="#descent">See what he built ↓</a>
          <Link className="fg-cta--primary" href="/work-with-me">
            Work with him →
          </Link>
        </nav>
      </section>

      <section className="fg-what" aria-labelledby="what">
        <p className="fg-eyebrow" id="what">What you’re looking at</p>
        <p className="fg-p" style={{ marginTop: 14 }}>
          When lightning hits sand, the strike is gone in a millisecond. What it leaves behind is glass, fused along
          the path it took. That glass is called a fulgurite.
        </p>
        <p className="fg-p">
          The object beside this text is one, grown from what he built: his public code, and the work that has no public
          code, for clients, for his companies and for the people he teaches. The clearest, brightest glass is the work
          that is live today or shipped. Nobody drew it; every fork comes from the record.
        </p>
        <div className="fg-key" aria-label="How to read it">
          <span><b>Depth is time.</b> The surface is 2023, his first public work with AI; the tip is {fmt(now)}.</span>
          <span><b>Each fork is a piece of work,</b> leaving the channel on the day it began: a repository, a client’s system, a company, a class.</span>
          <span><b>The clearest glass is live or shipped.</b> <Fig k="live-key" n={liveToday} m={LIVE_METHOD} /> of the pieces named on this site are live today.</span>
          <span><b>Each small bead is a merged change.</b> There are <Fig k="merged-all" n={S.totals.mergedPublicAll} m={`Pull requests authored by his GitHub account and merged, in public repositories. ${METHOD}`} />.</span>
          <span><b>Each large bead is an outcome:</b> a result for a client, or people taught. There are <Fig k="outcomes" n={outcomes.length} m="Outcomes listed in this site's content (content/built), one bead each." />.</span>
          <span><b>Frosted glass is private work.</b> You can see it exists, not inside it.</span>
          <span><b>A clean break is work he cut.</b> Not everything is meant to last.</span>
          <span><b>Heat is now.</b> The glowing tips merged something in the last seven days.</span>
        </div>
      </section>

      <div id="descent" style={{ gridColumn: 1 }}>
        <Era era="2023-2024" depth="2023 to 2024" title="Learning AI, and teaching it." thread="teaching">
          <p className="fg-p">
            In 2023 he started giving it away: free guides on LinkedIn, among them{" "}
            <Thread id="teaching">a library of 50 problem-solving techniques</Thread> with prompts, and recipes that pair GPT with
            Zapier for small businesses and tell them to keep a person checking. From October 2023 he was CTO of{" "}
            <Thread id="studio">Argux Labs</Thread>, a three-partner AI build and consulting firm that made a sales-training
            platform for a roofing company and was mentioned in Zapier’s launch press release.
          </p>
          <p className="fg-p">
            In 2024 he ran <Thread id="teaching">his own interview podcast</Thread>: eleven recorded conversations and two solo
            teaching episodes. He asked each guest’s consent, offered them a review before publishing, and introduced them
            to people who could help them. In November 2024 he began teaching AI at a Utah university.
          </p>
          <Said q={said1("pod-2024-07-31")} />
          <p className="fg-era__also">Also from those years: {listOf(mentionedOnly.map((m) => m.text))}.</p>
        </Era>

        <Era era="2025" depth="2025" title="Building companies with AI." thread="studio">
          <p className="fg-p">
            In April 2025 he co-founded <Thread id="studio">Utlyze</Thread>, an AI studio that builds custom AI systems for
            businesses. His public record bursts: <Fig n={sprayRepos} m={`Public repositories created from May to September 2025. ${METHOD}`} />{" "}
            repositories in five months. Among them, the <Thread id="connectors">connectors</Thread> that let an AI assistant
            use other apps, his code with the most outside interest that year. On 5 June,{" "}
            <Fig n={createdOn("2025-06-05")} m={`Repositories created on 2025-06-05. ${METHOD}`} /> “of one” names
            in a single day began <Thread id="of-one">the Of One network</Thread>, now 20 live sites on one template.
          </p>
          <p className="fg-p">
            In July he and his team built an in-office podcast studio by hand. In September he co-founded{" "}
            <Thread id="found">New Reward</Thread>, an agency that gets businesses found on Google and in AI answers.
          </p>
          <Said q={said1("x-2025-08-01")} />
          <p className="fg-era__cut">
            On 13 September, <Fig n={createdOn("2025-09-13")} m={`Repositories created on 2025-09-13. ${METHOD}`} /> landing
            pages in one day, all left within a fortnight. Ideas, not products. They’re the short bare twigs near the top.
          </p>
        </Era>

        <Era era="2025-10-2026-03" depth="October 2025 to March 2026" title="The first clients." thread="clients">
          <p className="fg-p">
            In October his <Thread id="fleet">agent fleet</Thread> began: Macs running Claude, Codex and Grok agents under one
            lead agent that writes the briefs. The same month he began a{" "}
            <Thread id="clients">reminder-texting system for a water-filtration company</Thread>, driven by its own invoices.
            Utlyze’s published case: <Fig n={waterBack.figure!.n} m={waterBack.figure!.method} /> {waterBack.text} And{" "}
            <Fig n={`${waterBought.figure!.n}${waterBought.figure!.unit}`} m={waterBought.figure!.method} /> {waterBought.text}
          </p>
          <p className="fg-p">
            In November, New Reward’s <Thread id="found">platform</Thread> began, built with his teammates; it is private,
            so its branch is frosted. In January 2026 came a lead site for a <Thread id="clients">concrete contractor</Thread>{" "}
            that now brings in calls on the contractor’s own domain; in February, work for a roofing company, one of New
            Reward’s early clients; in March, search and AI-visibility work for a detox and recovery center, with measured
            gains in its Google positions, its clicks and its reviews.
          </p>
          <p className="fg-p">
            He taught as he went: <Thread id="teaching">tutorials on YouTube</Thread> from October, and free answers in public on
            X from December. In January he wrote the first of his rules for trusting work he can’t read: if you cannot test
            it, it does not exist. Three <Thread id="teaching">teaching volumes</Thread> went up on this site in February.
          </p>
          <Said q={said1("video-2026-02-14")} />
          <p className="fg-era__cut">
            From January he ran a string of multi-agent orchestrators, some of them other people’s, each for one to three
            months, then dropped them. They taught him gates, lane ownership and simplicity.
          </p>
        </Era>

        <Era era="2026-04-2026-07" depth="April to July 2026" title="The deep systems." thread="plimsoll">
          <p className="fg-p">
            More clients. A new website for an <Thread id="outside">HVAC company</Thread> brought it leads within days. A{" "}
            <Thread id="clients">dog-breeding and kennel business</Thread> got a new site, visibility reports, a records portal
            and AI training for its team. Then a lead site for equipment finance, a lead funnel for a clean-energy tax credit,
            a site for a dental-marketing agency, and compliance work for an IV-therapy clinic.
          </p>
          <p className="fg-p">
            <Thread id="of-one">OfOne</Thread>, his method for hard decisions, on 13 May. <Thread id="plimsoll">Plimsoll</Thread>{" "}
            on 10 June, now the thickest branch on the specimen:{" "}
            <Fig n={plim.merges.length} m={`Merged pull requests in CryptoJym/plimsoll. ${METHOD}`} /> of its beads. In June,
            New Reward’s <Thread id="found">free AI-visibility scan</Thread> and its 12-axis visibility method; in July, the
            shared memory that became <Thread id="fleet">BORG</Thread>.
          </p>
          <p className="fg-p">
            He also forked <Thread id="methods">Dan McInerney’s Architect Loop</Thread> and hardened it. The design is
            Dan’s; the credit says so, and one of James’s fixes was merged back into Dan’s project.
          </p>
          <div className="fg-era__labels">
            <Label no={cat("CryptoJym/plimsoll")} name="Plimsoll" href="/work/plimsoll" rows={["A free meter for what AI coding helpers cost, matched to the work that merged.", { text: "github.com/CryptoJym/plimsoll", href: "https://github.com/CryptoJym/plimsoll" }, `since ${fmt(plim.created)}`]} state={{ text: "active", kind: "active" }} />
            <Label no={cat("CryptoJym/ofone-skillchain")} name="OfOne" href="/work/ofone" rows={["A method for hard decisions: Ask, Map, Move.", { text: "github.com/CryptoJym/ofone-skillchain", href: "https://github.com/CryptoJym/ofone-skillchain" }]} state={{ text: "active", kind: "active" }} />
          </div>
          <p className="fg-era__cut">
            Plimsoll’s first version captured almost nothing, so it was rebuilt; so far its only real workspace is his
            own. Two client engagements ended: the roofing company’s in June, and the HVAC company’s in July, when he
            handed over its code, its hosting and a migration guide.
          </p>
        </Era>

        <Era era="2026-08" depth="August 2026" title="The fleet goes public." thread="fleet">
          <p className="fg-p">
            In the week of 22 to 27 August his agents merged <Fig n={147} m={FLEET_NOTES} /> changes across six repositories,
            with <Fig n={102} m={FLEET_NOTES} /> agents running at the peak. <Thread id="fleet">BORG</Thread>, the shared memory
            his agents use, went public on 29 August, free to install. From 25 August his notes from the build were published,
            bylined to him and to the AI models that helped write them.
          </p>
          <p className="fg-p">
            From 21 August to 2 September, <Thread id="clients">hands-on AI set-ups</Thread> for a construction company, a glass
            company and a real-estate group, each aimed at the firm’s real bottleneck.
          </p>
          {borg && (
            <div className="fg-era__labels">
              <Label no={cat("h3ro-dev/borg")} name="BORG" rows={["One shared memory for a fleet of AI agents, on your own Macs.", { text: "github.com/h3ro-dev/borg", href: "https://github.com/h3ro-dev/borg" }, `${borg.merges.length} merged changes`]} state={{ text: "active", kind: "active" }} />
            </div>
          )}
          <p className="fg-era__cut">
            On one of those days, <Fig n="1,705" m={FLEET_NOTES} /> agent runs produced a single merge. That became the rule:
            merged on main, or it does not exist.
          </p>
        </Era>

        <Era era="2026-09" depth="September 2026" title="Clients, a classroom, a case study." thread="studio">
          <p className="fg-p">
            On 2 September Utlyze’s home page became <Thread id="studio">the Advisor</Thread>, a chat and voice guide that
            maps where AI would be worth it in a visitor’s business. That week he prepared a{" "}
            <Thread id="teaching">local-AI guide for a public university</Thread>. The kennel business got an AI system
            installed on its owner’s own Mac.
          </p>
          <p className="fg-p">
            A <Thread id="clients">law firm</Thread> got an AI working session and a public guide with homework, and its
            managing partner agreed to an audit of the firm’s systems. An athletic-products brand signed on, won by working
            with its own platform instead of replacing it. On 13 September his fix was merged into Dan McInerney’s
            Architect Loop.
          </p>
          <p className="fg-p">
            Plimsoll shipped <Fig n={plimReleases.length} m={`Releases of CryptoJym/plimsoll. ${METHOD}`} /> releases in{" "}
            <Fig n={plimSpan} m="Days from the first to the latest of those releases." /> days.{" "}
            <Thread id="minds">EEGT</Thread>, an open notebook asking whether computer models “hear” the same patterns
            in brainwaves, went public: <Fig n={eegtReleases} m={`Releases of h3ro-dev/eegt. ${METHOD}`} /> releases so far,
            and every main result marked inconclusive.
          </p>
          <p className="fg-p">
            On 27 September Utlyze published its first case study with approved figures, the water-filtration system. The same
            day he commissioned this site.
          </p>
          <Said q={said1("x-2026-09-25")} />
        </Era>
      </div>

      <section className="fg-lessons" aria-labelledby="lessons" id="lessons-section">
        <p className="fg-eyebrow" id="lessons">What went wrong, and what he learned</p>
        <h2 className="fg-h2" style={{ marginTop: 14 }}>Not all of it turned to glass.</h2>
        <ul className="fg-lessons__list">
          <li>
            <b>Busy is not done.</b> On one August day his fleet ran <Fig n="1,705" m={FLEET_NOTES} /> agent runs and merged one
            change. The rule since: merged on main, or it does not exist.
          </li>
          <li>
            <b>Tools tried and dropped.</b> A string of orchestrators, each run for one to three months and then dropped.
          </li>
          <li>
            <b>Few outside users yet.</b> Plimsoll’s first version captured almost nothing and was rebuilt, and so far its
            only real workspace is his own. The Of One network is 20 live sites, and no traffic or lead figure exists for any
            of them yet.
          </li>
          <li>
            <b>Engagements that ended.</b> A roofing company’s in June 2026, and an HVAC company’s in July; the HVAC company
            left with its code, its hosting and a migration guide.
          </li>
          <li>
            <b>Not proven yet.</b> Every main result in his brainwave notebook, EEGT, is marked inconclusive, and the site says
            so.
          </li>
        </ul>
        <div className="fg-said__list" style={{ marginTop: 34 }}>
          {["pod-2026-06-05", "pod-2026-07-27", "x-2025-09-17"].map((id) => (
            <Said key={id} q={said1(id)} />
          ))}
        </div>
      </section>

      <section className="fg-tip" aria-labelledby="tip">
        <p className="fg-eyebrow" id="tip">The tip · now</p>
        <EraWindow id="tip" />
        <h2 className="fg-h2" style={{ marginTop: 14 }}>Still hot.</h2>
        <div className="fg-tip__grid fg-tip__grid--four">
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig n={week} live m={`Merged public changes in the seven days to ${now}. ${METHOD}`} /></span>
            <span className="fg-tip__k">changes merged in the last seven days</span>
          </div>
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig n={S.totals.mergedPublic30d} live m={`Merged public changes in the thirty days to ${now}. ${METHOD}`} /></span>
            <span className="fg-tip__k">in the last thirty</span>
          </div>
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig n={liveToday} live m={LIVE_METHOD} /></span>
            <span className="fg-tip__k">pieces of work live today</span>
          </div>
          {latest && (
            <div className="fg-tip__cell">
              <span className="fg-tip__n"><Fig n={latest.tag} live m={`The latest Plimsoll release, ${latest.date}. ${METHOD}`} /></span>
              <span className="fg-tip__k">latest Plimsoll release, {fmt(latest.date)}</span>
            </div>
          )}
        </div>
        {lastResult && (
          <p className="fg-tip__latest">
            <span className="fg-tip__when">Latest result for a client · {builtDate(lastResult.date!)}</span>{" "}
            {lastResult.item.name}.{" "}
            {lastResult.figure ? (
              <>
                <Fig n={`${lastResult.figure.n}${lastResult.figure.unit ?? ""}`} m={lastResult.figure.method} />{" "}
              </>
            ) : null}
            {lastResult.text}
          </p>
        )}
        <p className="fg-attrib" id="tip-end">
          Merges read from GitHub on {fmt(now)}; results from this site’s record of what he built.{" "}
          <Link href="/now">What he’s working on now →</Link>
        </p>
      </section>

      <section className="fg-said" aria-labelledby="said">
        <p className="fg-eyebrow" id="said">In his words</p>
        <div className="fg-said__list">
          {said.map((q) => (
            <Said key={q.id} q={q} />
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
            <p>Build with Utlyze, on Consult or Build; get your business found with New Reward; or run background checks with Vuplicity.</p>
            <span className="fg-door__go">Ways to work together →</span>
          </Link>
          <a className="fg-door" href="https://github.com/h3ro-dev/borg">
            <h3>Use what he gave away</h3>
            <p>BORG, Plimsoll, the OfOne method, the EEGT notebook and his connectors are open source. Install them, fork them, fix them.</p>
            <span className="fg-door__go">Start with BORG →</span>
          </a>
          <a className="fg-door" href="https://x.com/of1ai" rel="me">
            <h3>Follow the work</h3>
            <p>Short notes and free answers on X as it happens, and longer build notes on Utlyze, bylined to him and to the AI models that helped write them.</p>
            <span className="fg-door__go">@of1ai →</span>
          </a>
          <Link className="fg-door" href="/contact">
            <h3>Write to him</h3>
            <p>If you’re curious and want to build this way, say so. He reads it.</p>
            <span className="fg-door__go">Contact →</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Era({ era, depth, title, thread, children }: { era: EraId; depth: string; title: string; thread?: string; children: React.ReactNode }) {
  return (
    <section className="fg-era" style={{ paddingInline: "var(--gutter)" }} data-thread={thread} data-era={era}>
      <p className="fg-era__depth">Depth · {depth}</p>
      <EraWindow id={era} />
      <h2 className="fg-h2">{title}</h2>
      {children}
    </section>
  );
}

/** An era of the descent: its window onto the glass, and its depth in the specimen (lib/specimen/eras.ts). */
type EraId = (typeof ERAS)[number]["id"];

function Thread({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span className="fg-thread" data-thread={id} tabIndex={0}>
      {children}
    </span>
  );
}

/** One of his sentences, exactly as he said it, with where and when. Renders nothing if the quote is absent. */
function Said({ q }: { q: Quote | null }) {
  if (!q) return null;
  return (
    <figure className="fg-era__said">
      <blockquote className="fg-voice"><q>{q.text}</q></blockquote>
      <figcaption className="fg-attrib">{q.url ? <a href={q.url}>{q.context}</a> : q.context}, {fmt(q.date)}</figcaption>
    </figure>
  );
}

/** "a, b, c and d". */
function listOf(items: string[]) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function fmt(d: string) {
  const [y, m, dd] = d.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${dd} ${months[m - 1]} ${y}`;
}
