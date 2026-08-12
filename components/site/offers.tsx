import Link from "next/link";

import { BUDGET_LABEL, type BudgetRange } from "@/lib/contact";
import type { OfferEntry } from "@/lib/content/types";

/**
 * The door row.
 *
 * The audit's finding, in one sentence: the homepage sorted visitors by WHAT
 * THEY WOULD SEE (proof, work, theories) and never by WHO THEY WERE. Five
 * personas arrived at the same two buttons, and three of them had no reason to
 * press either. A door names the visitor before it names the destination.
 *
 * Three doors, not four: a row a reader has to choose from stops working when
 * it stops being scannable, and the fourth door on this site is the nav.
 */
export type Door = {
  /** What the visitor came to do, in their words. */
  label: string;
  /** Who this door is for. Read aloud after the label by a screen reader. */
  who: string;
  detail: string;
  href: string;
};

export function DoorRow({ doors, label }: { doors: Door[]; label: string }) {
  return (
    <nav className="doors" aria-label={label}>
      {doors.map((door, i) => (
        <Link key={door.href} className="door" href={door.href}>
          <span className="door__n" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="door__label">
            {door.label}
            <span className="arw" aria-hidden="true">
              →
            </span>
          </span>
          <span className="door__who">{door.who}</span>
          <span className="door__detail">{door.detail}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Who delivers the work, and where to go and look at them. */
export function DeliveryLine({ entry }: { entry: OfferEntry }) {
  return (
    <p className="delivery">
      <span className="delivery__k">Delivered by</span>{" "}
      <a href={entry.deliveredBy.url} rel="noopener noreferrer">
        {entry.deliveredBy.name}
        <span className="arw" aria-hidden="true">
          →
        </span>
      </a>{" "}
      <span className="delivery__role">{entry.deliveredBy.role}</span>
    </p>
  );
}

/** The named steps of an engagement, numbered by CSS rather than by hand. */
export function StepList({
  steps,
}: {
  steps: { label: string; detail: string }[];
}) {
  return (
    <ol className="steps">
      {steps.map((s) => (
        <li className="step" key={s.label}>
          <p className="step__label">{s.label}</p>
          <p className="step__detail">{s.detail}</p>
        </li>
      ))}
    </ol>
  );
}

export function DeliverableList({
  items,
}: {
  items: { label: string; detail: string }[];
}) {
  return (
    <ul className="deliverables">
      {items.map((d) => (
        <li key={d.label}>
          <p className="deliverable__label">{d.label}</p>
          <p className="deliverable__detail">{d.detail}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Budget orientation.
 *
 * The bands are the /contact form's own list, read from lib/contact.ts, so the
 * page cannot print a band the form will not accept. They are labelled as
 * orientation on purpose: a range that tells a reader whether to keep reading
 * is doing its job; the same range presented as a quote is a number with no
 * source behind it.
 */
export function BudgetBands({ bands }: { bands: BudgetRange[] }) {
  return (
    <div className="panel">
      <div className="panel__head">
        <span>Budget bands</span>
        <span>Orientation, not a quote</span>
      </div>
      <div className="panel__body">
        <ul className="bands">
          {bands.map((b) => (
            <li key={b}>{BUDGET_LABEL[b]}</li>
          ))}
        </ul>
        <p className="bands__note">
          These are the same ranges the enquiry form offers, read from one list so the
          page and the form cannot drift apart. Where a project lands inside a band
          depends on scope, and scope is the first thing an engagement writes down.
        </p>
      </div>
    </div>
  );
}
