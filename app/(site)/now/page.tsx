import type { Metadata } from "next";
import Link from "next/link";

import { Fig } from "@/components/fg/Fig";
import { JsonLd } from "@/components/site/instruments";
import { STATUS_WORD, built, builtDate, outcomes } from "@/content/built";
import snapshot from "@/content/history/history.snapshot.json";
import { threads } from "@/content/history/threads";
import { now as nowEntry } from "@/lib/content";
import { nowGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/now",
  title: "Now",
  description: "What is growing at the tip of James Brady's record: the newest work and results from what he built, and what GitHub shows, computed when the site is built, plus one line he wrote himself.",
  og: { image: "/og/fulgurite.jpg", imageAlt: "A fulgurite grown from James Brady's public record" },
});

const S = snapshot;
const today = S.generatedAt.slice(0, 10);
const day = (d: string) => Math.floor(Date.parse(d + "T00:00:00Z") / 864e5);
const within = (d: string, n: number) => day(today) - day(d) < n;
const METHOD = `GitHub, public data only, read ${today}.`;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (d: string) => {
  const [y, m, dd] = d.split("-").map(Number);
  return `${dd} ${months[m - 1]} ${y}`;
};

const allMerges = [...S.repos.flatMap((r) => r.merges), ...S.anonymous.ownRepos, ...S.anonymous.otherPeoplesRepos, ...S.upstream.map((u) => u.date)];
const byName = new Map(S.repos.map((r) => [r.name.toLowerCase(), r]));
const growing = threads
  .map((t) => {
    const reps = t.repos.map((n) => byName.get(n.toLowerCase())).filter((r): r is NonNullable<typeof r> => !!r);
    const merges = reps.flatMap((r) => r.merges);
    const recent = merges.filter((d) => within(d, 30));
    const last = merges.sort().at(-1) ?? null;
    return { t, recent: recent.length, last };
  })
  .filter((x) => x.recent > 0)
  .sort((a, b) => b.recent - a.recent);
const newRepos = S.repos.filter((r) => within(r.created, 30)).sort((a, b) => b.created.localeCompare(a.created));
const releases = Object.entries(S.releases)
  .map(([name, rs]) => ({ name, latest: [...rs].sort((a, b) => b.date.localeCompare(a.date))[0], count30: rs.filter((r) => within(r.date, 30)).length }))
  .filter((x) => x.latest);
const lineAge = day(today) - day(nowEntry.updated);

// The newest of what he built (content/built), in the 30 days to the read: one row per piece of work, dated where it
// ended if it ended in that window (with its status) and where it began otherwise, plus every published result.
// Only exact dates count here; work dated to the month stays on /work.
const exact = (d?: string): d is string => !!d && d.length === 10;
const inWindow = (d?: string): d is string => exact(d) && d <= today && within(d, 30);
const fresh = [
  ...built
    .filter((b) => inWindow(b.start) || inWindow(b.end))
    .map((b) => (inWindow(b.end) ? { date: b.end, what: b.name, word: STATUS_WORD[b.status] } : { date: b.start, what: b.name, word: "began" })),
  ...outcomes
    .filter((o) => o.figure && inWindow(o.date))
    .map((o) => ({ date: o.date!, what: `${o.item.name}: ${o.figure!.n}${o.figure!.unit ?? ""} ${o.text}`, word: "result" })),
].sort((a, b) => b.date.localeCompare(a.date));

export default function NowPage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page">
      <JsonLd json={serializeGraph(nowGraph(nowEntry.updated))} />
      <header className="fg-page__head">
        <p className="fg-eyebrow">The tip · computed {fmt(today)}</p>
        <h1 className="fg-h1">What’s growing now.</h1>
        <p className="fg-p">
          This page is read from his public record and from this site’s record of what he built, every time the site is
          built, so it can’t go stale. The one line he wrote himself is below, with its age.
        </p>
      </header>

      <section style={{ marginTop: 48 }} aria-labelledby="line">
        <p className="fg-eyebrow" id="line">In his words</p>
        <blockquote className="fg-voice" style={{ fontSize: "clamp(24px, 2.4vw, 32px)", lineHeight: 1.25, marginTop: 14, maxWidth: "30ch" }}>
          <q>currently working on a number of different research projects at this time.</q>
        </blockquote>
        <p className="fg-attrib">
          his line for this page, {fmt(nowEntry.updated)} · {lineAge} days ago
        </p>
      </section>

      {fresh.length > 0 && (
        <section style={{ marginTop: 64 }} aria-labelledby="fresh">
          <p className="fg-eyebrow" id="fresh">The newest of what he built (last 30 days)</p>
          <ul className="fg-p" style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "grid", gap: 10, maxWidth: "none" }}>
            {fresh.map((f, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0, 118px) minmax(0, 1fr)", gap: "4px 18px" }}>
                <span className="fg-rec fg-muted" style={{ fontSize: 13 }}>{builtDate(f.date)}</span>
                <span>
                  {f.what} <span className="fg-rec" style={{ fontSize: 12, color: f.word === "live" || f.word === "began" ? "var(--heat)" : "var(--ink-2)" }}>· {f.word}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="fg-attrib" style={{ marginTop: 18 }}>
            From this site’s record of what he built (content/built), with the 2026-09-28 studies’ dates and statuses. <Link href="/work">All of it →</Link>
          </p>
        </section>
      )}

      <section style={{ marginTop: 64 }} aria-labelledby="pace">
        <p className="fg-eyebrow" id="pace">The pace</p>
        <div className="fg-tip__grid">
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig live n={allMerges.filter((d) => within(d, 7)).length} m={`Merged public changes in the 7 days to ${today}. ${METHOD}`} /></span>
            <span className="fg-tip__k">changes merged in the last 7 days</span>
          </div>
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig live n={S.totals.mergedPublic30d} m={`Merged public changes in the 30 days to ${today}. ${METHOD}`} /></span>
            <span className="fg-tip__k">in the last 30</span>
          </div>
          <div className="fg-tip__cell">
            <span className="fg-tip__n"><Fig live n={newRepos.length} m={`Public repositories he may name, created in the 30 days to ${today}. ${METHOD}`} /></span>
            <span className="fg-tip__k">new public repositories in 30 days</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 64 }} aria-labelledby="threads">
        <p className="fg-eyebrow" id="threads">Threads with fresh glass (last 30 days)</p>
        <div className="fg-era__labels" style={{ marginTop: 18 }}>
          {growing.map(({ t, recent, last }) => (
            <div key={t.id} className="fg-label">
              <span className="fg-label__row"><span className="fg-label__name">{t.name}</span></span>
              <span className="fg-label__row">{t.note}</span>
              <span className="fg-label__row fg-label__state--active">
                {recent} merged in 30 days{last ? ` · latest ${fmt(last)}` : ""}
              </span>
              {t.work && (
                <span className="fg-label__row">
                  <Link href={`/work/${t.work}`}>The case study →</Link>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {newRepos.length > 0 && (
        <section style={{ marginTop: 64 }} aria-labelledby="new">
          <p className="fg-eyebrow" id="new">New branches</p>
          <ul className="fg-p" style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "grid", gap: 8, fontFamily: "var(--f-rec)", fontSize: 14 }}>
            {newRepos.map((r) => (
              <li key={r.name}>
                <a href={`https://github.com/${r.name}`}>{r.name}</a> <span className="fg-muted">· {fmt(r.created)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ marginTop: 64 }} aria-labelledby="releases">
        <p className="fg-eyebrow" id="releases">Latest releases</p>
        <ul className="fg-p" style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "grid", gap: 8, fontFamily: "var(--f-rec)", fontSize: 14 }}>
          {releases.map((r) => (
            <li key={r.name}>
              <a href={`https://github.com/${r.name}/releases`}>{r.name}</a> {r.latest!.tag}{" "}
              <span className="fg-muted">· {fmt(r.latest!.date)} · {r.count30} in 30 days</span>
            </li>
          ))}
        </ul>
        <p className="fg-attrib" style={{ marginTop: 22 }}>{METHOD} Private work is not counted here.</p>
      </section>
    </main>
  );
}
