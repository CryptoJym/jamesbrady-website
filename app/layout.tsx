import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Dock } from "@/components/site/Dock";
import { SITE } from "@/lib/seo/site";
import "./globals.css";

/**
 * Root layout. Holds only what is genuinely sitewide: the document, the skip
 * link, the grain, and the Ask dock. Page chrome lives in the route-group
 * layouts — app/(site) carries Direction B, app/(legacy) keeps the archived
 * volumes on their existing skin at their existing URLs.
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <div className="grain" aria-hidden="true" />
        {children}
        <Dock />
      </body>
    </html>
  );
}
