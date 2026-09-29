/**
 * A number in the record's voice, with its method one hover or tap away. `k` names the figure for the checks
 * (scripts/verify-visual.mjs reads the page's figures by it and compares them with their sources).
 */
export function Fig({ n, m, live = false, k }: { n: number | string; m: string; live?: boolean; k?: string }) {
  const shown = typeof n === "number" ? n.toLocaleString("en-US") : n;
  return (
    <span className={`fg-fig${live ? " fg-live" : ""}`} tabIndex={0} aria-label={`${shown}. Method: ${m}`} data-fig={k}>
      {shown}
      <span className="fg-fig__m" aria-hidden="true">
        {m}
      </span>
    </span>
  );
}

/** One specimen label: the catalogue card beside a piece of work. */
export function Label({
  no,
  name,
  rows,
  state,
  href,
}: {
  no: string;
  name: string;
  rows: (string | { text: string; href: string })[];
  state?: { text: string; kind: "active" | "dormant" | "private" | "cut" };
  href?: string;
}) {
  return (
    <div className="fg-label">
      <span className="fg-label__row">
        <span className="fg-label__no">{no}</span> · <span className="fg-label__name">{href ? <a href={href}>{name}</a> : name}</span>
      </span>
      {rows.map((r, i) =>
        typeof r === "string" ? (
          <span key={i} className="fg-label__row">
            {r}
          </span>
        ) : (
          <span key={i} className="fg-label__row">
            <a href={r.href}>{r.text}</a>
          </span>
        ),
      )}
      {state && <span className={`fg-label__row fg-label__state--${state.kind}`}>condition: {state.text}</span>}
    </div>
  );
}
