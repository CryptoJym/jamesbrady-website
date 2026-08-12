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
          {/*
            The mark: a 2x2 quad with the bottom-left cell left dark. Three
            painted cells, and each one is its own element because each one
            breathes on its own clock (globals.css, "LIVING MARK"). The inner
            <b> is the painted square; the outer <i> is the cell it moves in,
            so the tick and the breath are two transform layers that compose
            instead of one overwriting the other. Decoration, so aria-hidden —
            the link's accessible name stays "JAMES BRADY".
          */}
          <span className="mark__glyph" aria-hidden="true">
            <i>
              <b />
            </i>
            <i>
              <b />
            </i>
            <i>
              <b />
            </i>
          </span>
          JAMES&nbsp;BRADY
        </Link>
        <NavLinks />
        <DockTrigger className="ask">
          <>
            <Dot state="live" />
            ASK<span className="vh"> about my work.</span>
            <span className="kbd" aria-hidden="true">⌘K</span>
          </>
        </DockTrigger>
      </div>
    </nav>
  );
}

/**
 * Footer socials.
 *
 * All six profiles, not three. X, TikTok, YouTube and Bluesky existed only
 * inside the JSON-LD `sameAs` array: a machine reading the entity graph could
 * see them and a person reading the page could not, which is exactly backwards
 * for accounts whose whole job is to bring people here.
 *
 * X and TikTok print their FULL URL as the visible handle. The retired brand
 * token is permitted as those two exact URLs and in no other shape, so a
 * prettier "@handle" label would be a violation rather than a nicety.
 */
const SOCIAL = [
  { label: "GitHub", handle: "github.com/CryptoJym", href: SAME_AS[0] },
  { label: "LinkedIn", handle: "/in/jamesbrady1", href: SAME_AS[1] },
  { label: "X", handle: SAME_AS[2], href: SAME_AS[2] },
  { label: "TikTok", handle: SAME_AS[3], href: SAME_AS[3] },
  { label: "Bluesky", handle: "bsky.app/profile/utlyzeit.bsky.social", href: SAME_AS[4] },
  { label: "YouTube", handle: "youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA", href: SAME_AS[5] },
  { label: "Email", handle: SITE.email, href: `mailto:${SITE.email}` },
];

const FOOTER_NAV = [
  { href: "/work-with-me", label: "Work with me" },
  { href: "/work", label: "Work" },
  { href: "/theories", label: "Theories" },
  { href: "/lab", label: "Lab" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
  // The bridge from the social accounts, previously reachable from no page on
  // the site that linked to it.
  { href: "/links", label: "Links" },
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
          {/*
            The photo slot is gone from the footer, and stays on /about.
            An empty labelled box is honest once, on the page whose job is the
            person. Repeated in the footer of all 30 routes it stopped reading
            as candour and started reading as an unfinished template, which is
            the opposite of what the label was for. The build gate is unchanged:
            /about still shows the gap, and a real asset still closes it.
          */}
          <div className="who who--nophoto">
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
        {/* The entity line, with both entities now reachable. New Reward
            delivers the visibility engagement and had no link from any page on
            this site, which made "the agency that does it" an assertion rather
            than a destination. */}
        <div className="foot__stamp">
          <span>© {new Date().getFullYear()} James Brady</span>
          <span>
            <a href="https://utlyze.com" rel="noopener noreferrer">
              Utlyze
            </a>{" "}
            (studio) ·{" "}
            <a href="https://newreward.com" rel="noopener noreferrer">
              New Reward
            </a>{" "}
            (agency) — James operates both
          </span>
        </div>
      </div>
    </footer>
  );
}
