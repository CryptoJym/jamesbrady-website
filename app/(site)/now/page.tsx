import type { Metadata } from "next";

import {
  Dot,
  JsonLd,
  Nameplate,
  PageNameplate,
  Prose,
} from "@/components/site/instruments";
import { daysSince, now, weeksSince } from "@/lib/content";
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
          <Prose html={renderMarkdown(now.body)} />

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
