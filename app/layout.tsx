import type { Metadata, Viewport } from "next";

import { SITE } from "@/lib/seo/site";
import "./globals.css";

/**
 * Root layout. Holds only the document and the skip link — nothing that
 * paints. Page chrome lives in app/(site)/layout.tsx, which carries Direction
 * B: grain, console rail, nav, footer, Ask dock.
 *
 * The (legacy) route group is gone as of wave 4. /primer, /manuscript,
 * /workshop and /watch were the last routes on the old skin; they now render
 * on Direction B at the same URLs, so there is one chrome for the whole site
 * and no second layout for a change to leak across.
 *
 * NO WEBFONT. GeistSans and GeistMono were mounted here and consumed only by
 * the archived skin. Direction B is a system stack by design (design-system-
 * spec §1.5: "no webfont, no CLS"), so the fonts left with the skin that used
 * them.
 *
 * Every route's own metadata comes from lib/seo/metadata.ts. Nothing here sets
 * a canonical, because a layout-level canonical is exactly how the live site
 * ended up canonicalizing every subpage to the homepage.
 */
export const metadata: Metadata = {
  title: { default: SITE.title, template: "%s — James Brady" },
  description: SITE.description,
  metadataBase: new URL(SITE.host),
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  robots: { index: true, follow: true },
};

/**
 * The icons themselves are file-convention assets, not entries here:
 * app/icon.svg, app/apple-icon.png and app/favicon.ico are discovered by Next
 * and emitted as <link rel> tags. Declaring them twice is how one of the two
 * declarations goes stale.
 *
 * RASTERIZED BRAND ASSET — TOKEN VALUE FROZEN BY HAND, EXEMPT FROM THE NO-HEX
 * LINT (allowlisted by name in scripts/verify-tokens.mjs, which then asserts
 * this literal still EQUALS --c-base). It cannot be var(--c-base): the browser
 * paints its own chrome with this value before, and outside, any stylesheet.
 */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0A0E11", // --c-base
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
