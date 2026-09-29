import Link from "next/link";

import PhoneMenu from "@/components/fg/PhoneMenu";
import { SAME_AS } from "@/lib/schema/entities";
import { SITE } from "@/lib/seo/site";

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/words", label: "In his words" },
  { href: "/theories", label: "Theories" },
  { href: "/now", label: "Now" },
];

export function FgHeader() {
  return (
    <header className="fg-head">
      <Link className="fg-wordmark" href="/" aria-label="James Brady, home">
        JAMES BRADY
      </Link>
      <nav className="fg-nav" aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}>
            {n.label}
          </Link>
        ))}
        <Link className="fg-nav__cta fg-nav__keep" href="/work-with-me">
          Work with him
        </Link>
      </nav>
      <PhoneMenu items={NAV} />
    </header>
  );
}

export function FgFooter() {
  return (
    <footer className="fg-foot">
      <div>
        <h2>The work</h2>
        <ul>
          <li><Link href="/work">What he has built</Link></li>
          <li><Link href="/theories">Theories</Link></li>
          <li><Link href="/lab">Lab</Link></li>
          <li><Link href="/learn">Archived teaching</Link></li>
          <li><Link href="/now">Now</Link></li>
        </ul>
      </div>
      <div>
        <h2>Work with him</h2>
        <ul>
          <li><Link href="/work-with-me">Ways in</Link></li>
          <li><Link href="/contact">Write to him</Link></li>
          <li><span className="fg-rec">{SITE.email}</span></li>
        </ul>
      </div>
      <div>
        <h2>Elsewhere</h2>
        <ul>
          <li><a href={SAME_AS[2]} rel="me">X, @of1ai</a></li>
          <li><a href={SAME_AS[0]} rel="me">GitHub</a></li>
          <li><a href={SAME_AS[1]} rel="me">LinkedIn</a></li>
          <li><a href={SAME_AS[4]} rel="me">YouTube</a></li>
          <li><a href="https://www.utlyze.com/notes">Notes from the build</a></li>
        </ul>
      </div>
      <p className="fg-colophon">
        James commissioned this site from Claude (Anthropic&rsquo;s Opus 5.5), which studied him and made it; he
        accepted it on 27 September 2026. Every number on it is computed from its source, with the method one tap away.{" "}
        <Link href="/about#how-this-site-was-made">How it was made</Link>
      </p>
    </footer>
  );
}
