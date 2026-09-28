import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono, Newsreader } from "next/font/google";

import { SITE } from "@/lib/seo/site";
import "./globals.css";
import "./fg.css";
import "./fg-a.css";
import "./fg-b.css";

// Three voices, three faces (all SIL Open Font License, self-hosted by next/font):
// James's own words in Newsreader italic, the narrator in Archivo, the record in Martian Mono.
const voice = Newsreader({ subsets: ["latin"], style: ["italic"], variable: "--font-voice", display: "swap" });
const narr = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-narr", display: "swap" });
const rec = Martian_Mono({ subsets: ["latin"], variable: "--font-rec", display: "swap" });

/**
 * Root layout: the document, the three faces and the skip link. Chrome lives in app/(site)/layout.tsx.
 * Every route's own metadata comes from lib/seo/metadata.ts; nothing here sets a canonical.
 */
export const metadata: Metadata = {
  title: { default: SITE.title, template: "%s — James Brady" },
  description: SITE.description,
  metadataBase: new URL(SITE.host),
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0D0C0A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${voice.variable} ${narr.variable} ${rec.variable}`}>
      <body className="fg">
        <a className="fg-skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
