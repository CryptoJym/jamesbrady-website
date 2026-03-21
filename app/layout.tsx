import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "James Brady — AI Alchemist",
    template: "%s — James Brady",
  },
  description:
    "AI systems, protocols, and programs on a mathematical substrate. Tools that work.",
  metadataBase: new URL("https://jamesbrady.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "James Brady — AI Alchemist",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-[#0A0A0A] text-[#E8E4DD] font-sans noise-overlay">
        <Navigation />
        <main className="pt-20">{children}</main>
        <footer className="border-t border-[#1E1E1E] mt-32">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-16 md:py-24">
              <div className="md:col-span-5">
                <p className="text-[#D4A853] font-semibold tracking-tight text-lg mb-3">
                  James Brady
                </p>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-[35ch]">
                  AI systems, protocols, and programs on a mathematical substrate.
                </p>
              </div>
              <div className="md:col-span-3 md:col-start-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 mb-4 font-medium">
                  Navigate
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="/primer"
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    The Primer
                  </a>
                  <a
                    href="/manuscript"
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    The Manuscript
                  </a>
                  <a
                    href="/workshop"
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    The Workshop
                  </a>
                  <a
                    href="/about"
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    About
                  </a>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 mb-4 font-medium">
                  Meta
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="/feed.xml"
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    RSS
                  </a>
                  <a
                    href="/llms.txt"
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    llms.txt
                  </a>
                  <a
                    href="/api/catalog"
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    API
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-[#1E1E1E] py-6 flex flex-col md:flex-row justify-between items-center gap-3">
              <span className="text-xs text-neutral-600">
                &copy; 2025 James Brady. All rights reserved.
              </span>
              <span className="text-xs text-neutral-700 font-mono">
                Built with AI agents
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
