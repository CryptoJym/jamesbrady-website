import type { Metadata } from "next";

import { JsonLd } from "@/components/site/instruments";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { allQuotes, hasPrivateWords, THEMES } from "@/lib/words";
import { pageMetadata } from "@/lib/seo/metadata";
import { WORDS_CAPSULE } from "@/lib/seo/routes";

export const metadata: Metadata = pageMetadata({
  path: "/words",
  title: "In his words",
  description:
    "James Brady's own words, exactly as he said them: on why he builds, teaching, directing AI agents, questions, credit, clients, and owning what goes wrong.",
  og: { image: "/og/fulgurite.jpg", imageAlt: "James Brady, in his own words" },
});

function fmt(d: string) {
  const [y, m, dd] = d.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${dd} ${months[m - 1]} ${y}`;
}

export default function WordsPage() {
  const dates = allQuotes.map((q) => q.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  const groups = THEMES.map((t) => ({ ...t, quotes: allQuotes.filter((q) => q.theme === t.id) })).filter((g) => g.quotes.length);
  return (
    <main id="main" tabIndex={-1} className="fg-page">
      <JsonLd json={serializeGraph(collectionGraph({ path: "/words", name: "In his words", description: WORDS_CAPSULE, items: [] }))} />
      <header className="fg-page__head">
        <p className="fg-eyebrow">In his words</p>
        <h1 className="fg-h1">Exactly as he said it.</h1>
        <p className="fg-p">
          {hasPrivateWords
            ? `Most of these were typed or dictated to the AI agents he works with. The rest he said in public: posts on X, and what he said on podcasts and in videos. They run from ${fmt(first)} to ${fmt(last)}. Spelling and punctuation are his; nothing has been tidied. Where a quote is cut, […] marks the cut.`
            : `These are his public words, from ${fmt(first)} to ${fmt(last)}: posts on X, and what he said on podcasts and in videos, exactly as he said them.`}
        </p>
      </header>
      <div className="fg-words">
        {groups.map((g) => (
          <section key={g.id} className="fg-words__theme" aria-labelledby={`t-${g.id}`}>
            <div>
              <h2 id={`t-${g.id}`}>{g.title}</h2>
              <p className="fg-muted">{g.lede}</p>
            </div>
            <div className="fg-words__list">
              {g.quotes.map((q) => (
                <figure key={q.id} style={{ margin: 0 }}>
                  <blockquote className="fg-voice">
                    <q>{q.text}</q>
                  </blockquote>
                  <figcaption className="fg-attrib">
                    {q.url ? <a href={q.url}>{q.context}</a> : q.context}, {fmt(q.date)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
