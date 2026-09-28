import type { Metadata } from "next";
import Link from "next/link";

import { Fig } from "@/components/fg/Fig";
import { JsonLd } from "@/components/site/instruments";
import snapshot from "@/content/history/history.snapshot.json";
import { threads } from "@/content/history/threads";
import { now as nowEntry } from "@/lib/content";
import { nowGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/now",
  title: "Now",
  description: "What is growing at the tip of James Brady's public record: computed from GitHub when the site is built, plus one line he wrote himself.",
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

export default function NowPage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page">
      <JsonLd json={serializeGraph(nowGraph(nowEntry.updated))} />
      <header className="fg-page__head">
        <p className="fg-eyebrow">The tip · computed {fmt(today)}</p>
        <h1 className="fg-h1">What&rsquo;s growing now.</h1>
        <p className="fg-p">
          This page is read from his public record every time the site is built, so it can&rsquo;t go stale. The one
          line he wrote himself is below, with its age.
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
