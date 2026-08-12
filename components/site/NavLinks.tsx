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
const LINKS: { href: string; label: string; hint: string }[] = [
  {
    href: "/work-with-me",
    label: "Work with me",
    hint: "Work with me: the two engagements you can hire, and what each costs",
  },
  {
    href: "/work",
    label: "Work",
    hint: "Work: built systems, each with its proof attached",
  },
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
    href: "/about",
    label: "About",
    hint: "About: who does what, and how the work gets checked",
  },
  {
    href: "/now",
    label: "Now",
    hint: "Now: what is happening this month, including what is stuck",
  },
  {
    href: "/contact",
    label: "Contact",
    hint: "Contact: the enquiry form and what makes a strong fit",
  },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="nav__links">
      {LINKS.map((l) => {
        const current = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              title={l.hint}
              aria-label={l.hint}
              aria-current={current ? "page" : undefined}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
