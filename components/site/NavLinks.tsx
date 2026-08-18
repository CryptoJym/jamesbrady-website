"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Nav labels and what they mean.
 *
 * The labels stay: Work, Theories, Lab and Learn are what these sections are,
 * and renaming them to "Portfolio", "Ideas", "Demos" and "Guides" would trade
 * a site's own vocabulary for a generic one. What the audit found is that
 * "Lab" and "Learn" are indistinguishable to a first-time visitor, and that
 * "Theories" reads as either academic papers or unfinished thoughts depending
 * on who is looking.
 *
 * So each link carries a `hint`: it becomes the tooltip and the accessible
 * name, so a hover, a screen reader and a link-preview all answer "what is
 * behind this" without the label having to.
 *
 * `title` and `aria-label` say the SAME thing on purpose. An aria-label that
 * contradicts the visible label breaks voice control, which types the label it
 * can see; the hint therefore starts with the label itself.
 */
const PRIMARY: { href: string; label: string; hint: string }[] = [
  {
    href: "/work-with-me",
    label: "Work with me",
    hint: "Work with me: the engagements you can hire, who delivers each, and what each costs",
  },
  {
    href: "/work",
    label: "Work",
    hint: "Work: built systems, each with its proof attached",
  },
  {
    href: "/about",
    label: "About",
    hint: "About: who does what, and how the work gets checked",
  },
  {
    href: "/contact",
    label: "Contact",
    hint: "Contact: the enquiry form and what makes a strong fit",
  },
];

const MORE: { href: string; label: string; hint: string }[] = [
  {
    href: "/theories",
    label: "Theories",
    hint: "Theories: open questions worked in public, labelled by how far along they are",
  },
  {
    href: "/lab",
    label: "Lab",
    hint: "Lab: interactive artifacts you can try in the browser",
  },
  {
    href: "/learn",
    label: "Learn",
    hint: "Learn: three archived volumes of long-form writing",
  },
  {
    href: "/now",
    label: "Now",
    hint: "Now: what is happening this month, including what is stuck",
  },
];

function Item({
  href,
  label,
  hint,
  pathname,
}: {
  href: string;
  label: string;
  hint: string;
  pathname: string;
}) {
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <li>
      <Link
        href={href}
        title={hint}
        aria-label={hint}
        aria-current={current ? "page" : undefined}
      >
        {label}
      </Link>
    </li>
  );
}

export function NavLinks() {
  const pathname = usePathname();
  const moreOpen = MORE.some(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`),
  );
  return (
    <ul className="nav__links">
      {PRIMARY.map((l) => (
        <Item key={l.href} {...l} pathname={pathname} />
      ))}
      <li className="nav__more">
        <details open={moreOpen || undefined}>
          <summary>More</summary>
          <ul>
            {MORE.map((l) => (
              <Item key={l.href} {...l} pathname={pathname} />
            ))}
          </ul>
        </details>
      </li>
    </ul>
  );
}
