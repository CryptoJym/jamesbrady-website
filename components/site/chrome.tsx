import Link from "next/link";

import { OPERATORS, now, systemsListed, weeksSince } from "@/lib/content";
import { BUILD_STAMP, SITE } from "@/lib/seo/site";
import { SAME_AS } from "@/lib/schema/entities";
import { Dot, PageNameplate } from "./instruments";
import { DockTrigger } from "./Dock";
import { NavLinks } from "./NavLinks";

/**
 * Console rail. Landmark region, mono, 34px, --c-inset. Left set is live
 * status, right set is location and the index-built stamp. Every count here is
 * derived; "1 operator" is a maintained constant, and the content contract
 * says which is which (design-system-spec §6.6).
 */
export function ConsoleRail() {
  const nowAgeWeeks = weeksSince(now.updated);
  return (
    <div className="rail" role="region" aria-label="Page status">
      <div className="wrap rail__in">
        <div className="rail__set">
          <span className="rail__i">
            <Dot state="live" /> <span className="tag-live">OPERATING</span>
          </span>
          <span className="rail__i">{systemsListed} SYSTEMS TRACKED</span>
          <span className="rail__i">{OPERATORS} OPERATOR</span>
        </div>
        <div className="rail__set">
          <span className="rail__i">
            <Link href="/now">
              NOW · UPDATED {nowAgeWeeks === 0 ? "THIS WEEK" : `${nowAgeWeeks}W AGO`}
            </Link>
          </span>
          <span className="rail__i">{SITE.location.toUpperCase()}</span>
          <span className="rail__i">INDEX BUILT {BUILD_STAMP}</span>
        </div>
      </div>
    </div>
  );
}

export function SiteNav() {
  return (
    <nav className="nav" aria-label="Primary">
      <div className="wrap nav__in">
        <Link href="/" className="mark">
          <span className="mark__glyph" aria-hidden="true" />
          JAMES&nbsp;BRADY
        </Link>
        <NavLinks />
        <DockTrigger className="ask">
          <>
            <Dot state="live" />
            ASK<span className="vh"> about my work.</span>
          </>
        </DockTrigger>
      </div>
    </nav>
  );
}

const SOCIAL = [
  { label: "GitHub", handle: "github.com/CryptoJym", href: SAME_AS[0] },
  { label: "LinkedIn", handle: "/in/jamesbrady1", href: SAME_AS[1] },
  { label: "Email", handle: SITE.email, href: `mailto:${SITE.email}` },
];

const FOOTER_NAV = [
  { href: "/work", label: "Work" },
  { href: "/theories", label: "Theories" },
  { href: "/lab", label: "Lab" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
  { href: "/contact", label: "Contact" },
  { href: "/feed.xml", label: "RSS" },
  { href: "/llms.txt", label: "llms.txt" },
];

export function SiteFooter() {
  return (
    <footer className="b-foot">
      <div className="wrap">
        <nav className="foot__nav" aria-label="Footer">
          {FOOTER_NAV.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="foot">
          <div className="foot__links">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} rel="me noopener">
                <span>{s.label}</span>
                {s.handle}
              </a>
            ))}
          </div>
          <div className="who">
            {/* BUILD-GATE (punch list 19): a real photo asset replaces this box. */}
            <div className="who__ph" aria-hidden="true">
              <span>
                PHOTO
                <br />
                PENDING
              </span>
            </div>
            <p className="colophon">
              <b>One person, operating at fleet scale.</b>
              Every figure on this site is counted from a public repo or a live page when
              the page is built. Where the number is not available, the page says so
              instead of estimating.
            </p>
          </div>
        </div>
        <PageNameplate
          className="np--stamp"
          source="Public repos · live pages · the typed content source"
          method="Counted at build, never rounded up"
        />
        <div className="foot__stamp">
          <span>© {new Date().getFullYear()} James Brady</span>
          <span>Utlyze (studio) · New Reward (agency) — James operates both</span>
        </div>
      </div>
    </footer>
  );
}
