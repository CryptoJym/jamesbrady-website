import type { ReactNode } from "react";

import { Fig, Label } from "@/components/fg/Fig";
import type { OfferEntry, PriceSource, ProofSource, PublishedOffer } from "@/lib/content/types";

// The pieces of /work-with-me, its offers and /contact, in the Fulgurite system. Styles live in app/fg-b.css.

const COUNT = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** A count in words, for a heading, derived from the thing it counts rather than typed. */
export function countWord(n: number): string {
  return COUNT[n] ?? String(n);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "27 Sep 2026", the record's date, as on the home page and /words. */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "www.newreward.com/ai-visibility-score": a URL as a reader checks it, without the scheme or a trailing slash. */
export function bareUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** The method behind every figure in a company's published card: whose words, and where and when they were read. */
export function publishedMethod(company: string, source: PriceSource): string {
  return `Published by ${company} on its own sites, and read from ${bareUrl(source.url)} on ${fmtDate(source.capturedAt)}.`;
}

/**
 * A sentence whose figures carry their method: each `figures[i].n` found in `text` renders as a <Fig>. The text
 * stays one string, so the same sentence can feed JSON-LD, llms.txt and the page without a second copy.
 */
export function WithFigs({ text, figures }: { text: string; figures: { n: string; m: string }[] }) {
  const parts: ReactNode[] = [text];
  for (const f of figures) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      if (typeof part !== "string" || !part.includes(f.n)) continue;
      const pieces = part.split(f.n);
      const out: ReactNode[] = [];
      pieces.forEach((piece, j) => {
        if (j > 0) out.push(<Fig key={`${f.n}-${i}-${j}`} n={f.n} m={f.m} />);
        if (piece) out.push(piece);
      });
      parts.splice(i, 1, ...out);
    }
  }
  return <>{parts}</>;
}

/** The amount at the head of a price ("$15,000" of "$15,000 a month"), which is what a sentence sets as a figure. */
export function amount(price: string): string {
  return price.split(" ")[0];
}

/** One section of an inner page: its heading at the left and its content at the right, stacked on a phone. */
export function Row({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="fgb-row" id={id} aria-labelledby={`${id}-h`}>
      <div className="fgb-row__head">
        <h2 className="fgb-row__h" id={`${id}-h`}>
          {title}
        </h2>
        {note ? <div className="fgb-row__note">{note}</div> : null}
      </div>
      <div className="fgb-row__body">{children}</div>
    </section>
  );
}

/** Who delivers an offer, in the record's voice. */
export function DeliveredBy({ entry }: { entry: OfferEntry }) {
  return (
    <p className="fgb-by">
      <span className="fgb-by__k">Delivered by</span>{" "}
      <a href={entry.deliveredBy.url} rel="noopener noreferrer">
        {entry.deliveredBy.name}
      </a>
      , {entry.deliveredBy.role}
    </p>
  );
}

/** The provenance mark beside a company's own words: published, by whom, read where and when. */
export function Published({ company, sources }: { company: string; sources: PriceSource[] }) {
  return (
    <p className="fgb-prov">
      <span className="fgb-prov__tag">Published</span> {company}&rsquo;s own words, read on{" "}
      {fmtDate(sources[0].capturedAt)} from{" "}
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 ? (i === sources.length - 1 ? " and " : ", ") : null}
          <a href={s.url} rel="noopener noreferrer">
            {bareUrl(s.url)}
          </a>
        </span>
      ))}
    </p>
  );
}

/** The company's cards, word for word, then where to start and the pace note. */
export function PublishedCards({ published, company }: { published: PublishedOffer; company: string }) {
  const m = publishedMethod(company, published.sources[0]);
  return (
    <>
      <div className="fgb-cards">
        {published.cards.map((c) => (
          <article key={c.name} className={`fgb-card${c.points ? " fgb-card--main" : ""}`}>
            <h3 className="fgb-card__name">{c.name}</h3>
            <p className="fgb-card__price">
              <Fig n={c.price} m={m} />
            </p>
            <p className="fgb-card__terms">{c.terms}</p>
            <p className="fgb-card__value">{c.value}</p>
            {c.points ? (
              <>
                <ul className="fgb-card__points">
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p className="fgb-card__more">
                  <a href="#levels">{published.levelsLink} ↓</a>
                </p>
                <p className="fgb-card__start">{published.start}</p>
              </>
            ) : null}
          </article>
        ))}
      </div>
      <p className="fgb-pace">{published.pace}</p>
    </>
  );
}

/** The levels, word for word, and what stays quoted separately. */
export function Levels({ published, company }: { published: PublishedOffer; company: string }) {
  const { levels } = published;
  const m = publishedMethod(company, published.sources[1] ?? published.sources[0]);
  return (
    <>
      <p className="fgb-lead">{levels.intro}</p>
      <ol className="fgb-levels">
        {levels.items.map((l) => (
          <li key={l.name} className="fgb-level">
            <h3 className="fgb-level__name">{l.name}</h3>
            <p className="fgb-level__price">
              <span className="fgb-vh"> · </span>
              <Fig n={l.price} m={m} />
            </p>
            <p className="fgb-level__at">{l.atOnce}</p>
            {l.adds ? <p className="fgb-level__adds">{l.adds}</p> : null}
          </li>
        ))}
      </ol>
      <h3 className="fgb-sub">{levels.separately.heading}</h3>
      <p className="fgb-lead">{levels.separately.body}</p>
    </>
  );
}

/** The steps of an engagement, numbered by CSS. */
export function Steps({ steps }: { steps: { label: string; detail: string }[] }) {
  return (
    <ol className="fgb-steps">
      {steps.map((s) => (
        <li key={s.label} className="fgb-step">
          <p className="fgb-step__label">{s.label}</p>
          <p className="fgb-step__detail">{s.detail}</p>
        </li>
      ))}
    </ol>
  );
}

/** What a client keeps. */
export function Keeps({ items }: { items: { label: string; detail: string }[] }) {
  return (
    <ul className="fgb-keeps">
      {items.map((d) => (
        <li key={d.label}>
          <p className="fgb-keeps__label">{d.label}</p>
          <p className="fgb-keeps__detail">{d.detail}</p>
        </li>
      ))}
    </ul>
  );
}

/** Who an offer is for, as the reader would say it. */
export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="fgb-chips">
      {items.map((a) => (
        <li key={a}>{a}</li>
      ))}
    </ul>
  );
}

/** Every source an offer cites, as specimen labels: where it lives, what was read there, and when. */
export function ProofLabels({ proof }: { proof: ProofSource[] }) {
  return (
    <ul className="fgb-proof">
      {proof.map((p) => {
        const where = p.url ?? p.artifact ?? "no link recorded";
        return (
          <li key={p.label}>
            <Label
              no={`checked ${fmtDate(p.capturedAt)}`}
              name={bareUrl(where).split("/")[0].replace(/^www\./, "")}
              rows={[p.url ? { text: p.label, href: p.url } : p.label, bareUrl(where), p.method]}
            />
          </li>
        );
      })}
    </ul>
  );
}
