import type { ReactNode } from "react";

/**
 * The parts of an archived volume (/primer, /manuscript, /workshop). The volumes are frozen as written, so these only
 * carry their text: anchors, headings and commands arrive unchanged.
 */

/** The contents list: every section, by its anchor. The anchors are link equity and never change. */
export function Contents({
  title,
  aside,
  items,
}: {
  title: string;
  aside: string;
  items: { id: string; num: string; label: string }[];
}) {
  return (
    <nav className="fga-contents" aria-labelledby="contents">
      <p className="fga-kick">Contents</p>
      <h2 className="fga-row__h" id="contents">
        {title}
      </h2>
      <p className="fg-muted fga-contents__aside">{aside}</p>
      <ol>
        {items.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`}>
              <span className="fga-contents__num">{s.num}</span>
              <span>{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** One numbered section of a volume. */
export function VolumeSection({
  id,
  num,
  eyebrow,
  heading,
  aside,
  className = "",
  children,
}: {
  id: string;
  num?: string;
  eyebrow: string;
  heading: string;
  aside?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={`fga-vsec ${className}`.trim()} id={id} aria-labelledby={`${id}-h`}>
      <p className="fga-vsec__no">{num ? `${num} · ${eyebrow}` : eyebrow}</p>
      <h2 className="fg-h2" id={`${id}-h`}>
        {heading}
      </h2>
      {aside ? <p className="fg-p fg-muted fga-vsec__aside">{aside}</p> : null}
      {children}
    </section>
  );
}

/** A command or a file, exactly as written. It scrolls inside its own box on a narrow screen. */
export function Cmd({ children }: { children: string }) {
  return (
    <figure className="fga-cmd">
      <pre>
        <code>{children}</code>
      </pre>
    </figure>
  );
}

/** An ordered list whose numbers come from a CSS counter, never typed. */
export function Steps({ children }: { children: ReactNode }) {
  return <ol className="fga-steps">{children}</ol>;
}

export function Step({
  label,
  command,
  note,
  children,
}: {
  label: string;
  command?: string;
  note?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className="fga-step">
      <p className="fga-step__label">{label}</p>
      {command ? <Cmd>{command}</Cmd> : null}
      {children}
      {note ? <p className="fga-step__detail">{note}</p> : null}
    </li>
  );
}

/** A sequence, drawn for sighted readers. The sentence before it says the same thing in words. */
export function Chain({ steps }: { steps: string[] }) {
  return (
    <p className="fga-chain" aria-hidden="true">
      {steps.join(" → ")}
    </p>
  );
}

/** Term and meaning pairs. */
export function Defs({ items }: { items: { term: string; desc: string }[] }) {
  return (
    <ul className="fga-defs">
      {items.map((d) => (
        <li key={d.term}>
          <p className="fga-defs__label">{d.term}</p>
          <p className="fga-defs__detail">{d.desc}</p>
        </li>
      ))}
    </ul>
  );
}
