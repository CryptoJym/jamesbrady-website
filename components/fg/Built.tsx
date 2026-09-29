import Link from "next/link";

import { Fig } from "@/components/fg/Fig";
import { STATUS_WORD, builtSpan, type Built } from "@/content/built";

/**
 * A piece of work as a catalogue label: what it is, what it did, its dates and its status. The same box as the
 * specimen tray's labels (fg.css, fg-a.css), so the whole /work page reads as one tray. There is no catalogue number:
 * most of this work has no public repository to number it by, and the status takes that row instead.
 */
export function BuiltLabel({ b }: { b: Built }) {
  const name = b.href ? (
    b.href.startsWith("/") ? (
      <Link href={b.href}>{b.name}</Link>
    ) : (
      <a href={b.href} rel="noopener noreferrer">
        {b.name}
      </a>
    )
  ) : (
    b.name
  );
  return (
    <div className="fg-label fga-label fga-built">
      <div className="fga-label__head">
        <h3 className="fg-label__name">{name}</h3>
      </div>
      <p className="fg-label__row fga-label__desc">{b.what}</p>
      {b.outcomes?.length ? (
        <ul className="fga-outcomes" aria-label="What it did">
          {b.outcomes.map((o, i) => (
            <li key={i}>
              {o.figure ? (
                <>
                  <Fig n={`${o.figure.n}${o.figure.unit ?? ""}`} m={o.figure.method} />{" "}
                </>
              ) : null}
              {o.text}
            </li>
          ))}
        </ul>
      ) : null}
      {b.note ? <p className="fg-label__row fga-note">{b.note}</p> : null}
      <p className="fg-label__row">{builtSpan(b)}</p>
      <p className={`fg-label__row fga-status fga-status--${b.status}`}>status: {STATUS_WORD[b.status]}</p>
    </div>
  );
}
