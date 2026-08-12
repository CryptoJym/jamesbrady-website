import type { Metadata } from "next";
import Link from "next/link";

import {
  Dot,
  JsonLd,
  Nameplate,
  PageNameplate,
  Prose,
} from "@/components/site/instruments";
import { daysSince, now, weeksSince } from "@/lib/content";
import { pendingCount, pendingItems, pendingPaths } from "@/lib/content/pending";
import { renderMarkdown } from "@/lib/content/markdown";
import { nowGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/now",
  title: now.title,
  description: now.summary,
  og: now.og,
});

export default function NowPage() {
  const weeks = weeksSince(now.updated);
  const days = daysSince(now.updated);
  // Computed from the entry's own `updated` field — never typed, and the
  // build already failed if this were past 42 days.
  const age =
    weeks === 0
      ? days === 0
        ? "Updated today"
        : `Updated ${days} day${days === 1 ? "" : "s"} ago`
      : `Updated ${weeks} week${weeks === 1 ? "" : "s"} ago`;

  return (
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(nowGraph(now.updated))} />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>Now</span>
            <i aria-hidden="true">/</i>
            <span>
              <Dot state="active" /> {age}
            </span>
          </p>
          <h1>{now.title}</h1>
          <p className="page-lead">{now.answerCapsule}</p>
        </div>

        <div className="article">
          <div>
            <Prose html={renderMarkdown(now.body)} />

            {/*
              OPEN ITEMS — the whole second-person register, in one place.
              Every question here is still in the source file it belongs to,
              and every page still shows that a fact is missing. What changed
              in wave 3 is placement: a buyer sizing James up on /about or on
              an offer page met four questions addressed to somebody else and
              read the page as unfinished. This page is the work log, and a
              work log is where a work log belongs.

              The list is derived from the same bodies the pages render, so an
              item cannot be closed here while its gap is still on the page,
              and closing the gap removes the item the same build.
            */}
            <section className="open-items" aria-labelledby="open-items">
              <h2 id="open-items">Open items</h2>
              <p className="open-items__lead">
                {pendingCount} questions the site is still carrying, across{" "}
                {pendingPaths.length} pages. Each one is a fact only James has. Where one
                of these is unanswered, the page it belongs to says the fact is not
                published rather than filling the hole.
              </p>
              <ol className="open-items__list">
                {pendingItems.map((item, i) => (
                  <li key={`${item.path}-${i}`}>
                    <p className="open-items__where">
                      <Link href={item.path}>{item.where}</Link>
                    </p>
                    <p className="open-items__q">{item.question}</p>
                  </li>
                ))}
              </ol>
              <Nameplate
                className="np--stamp"
                fields={[
                  { label: "Source", value: "Every pending mark in the content source" },
                  {
                    label: "Method",
                    value: "Scanned from the same bodies the pages render, counted at build",
                  },
                ]}
              />
            </section>
          </div>

          <aside className="article__aside" aria-label="Freshness">
            <div className="panel">
              <div className="panel__head">
                <span>Freshness</span>
                <span>
                  <Dot state="active" /> {age}
                </span>
              </div>
              <Nameplate
                fields={[
                  { label: "Updated", value: now.updated },
                  { label: "Age", value: `${days} days` },
                  { label: "Limit", value: "42 days, or the build fails" },
                ]}
              />
              <div className="panel__body">
                Hand-edited monthly, with no auto-generation from repository activity. An
                automatic “now” page tells you a machine is running, not what a person is
                doing.
              </div>
              <PageNameplate
                source="content/now/now.ts"
                method="Age computed from the entry's own updated field at render time"
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
