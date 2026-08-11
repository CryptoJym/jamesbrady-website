import type { Metadata } from "next";
import {
  RssSimple,
  FileText,
  Code,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";

import { Navigation } from "@/components/Navigation";
import SectionDivider from "@/components/SectionDivider";

/**
 * OG for the archived routes, supplied HERE rather than in the page files.
 *
 * geo-seo-spec §8.7 requires openGraph and twitter tags on every indexable
 * route, and these five had none. The page files are out of scope this wave
 * (they keep their URLs, copy and skin untouched), so the tags are inherited
 * from this layout instead — each page's own title and description flow into
 * the openGraph block, and the archive plate is the shared image.
 *
 * Wave 2, when these pages are reskinned: move each page onto pageMetadata()
 * so it declares its own OG image and alt like every other template.
 */
export const metadata: Metadata = {
  openGraph: {
    type: "article",
    locale: "en_US",
    siteName: "James Brady",
    images: [
      {
        url: "/og/learn.png",
        width: 1200,
        height: 630,
        alt: "James Brady — an archived volume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/og/learn.png", alt: "James Brady — an archived volume" }],
  },
};

/**
 * The archived volumes plus /links and /watch.
 *
 * These five routes KEEP their URLs and their existing skin this wave — no
 * moves, no redirects (site brief, 2026-08-11; a redirect on any of them is a
 * defect). The route group name is in parentheses, so it contributes nothing
 * to the URL. This layout is the old root layout's chrome, lifted here so the
 * new root layout can be minimal; the `legacy-skin` wrapper scopes the old
 * palette so it cannot leak onto a Direction B surface.
 *
 * EXACT-PORT RULE (independent review, P1-2): the markup below is the root
 * layout at 4217d37, character for character below the wrapper div. The
 * footer had drifted — a /learn link the old footer never had, and a new
 * closing stamp — which re-rendered five pages that were explicitly out of
 * scope. verify-visual pixel-diffs /primer against a worktree of main; any
 * further edit here has to survive that gate.
 *
 * Reskinning these pages under Direction B is a later wave.
 */
export default function LegacyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="legacy-skin antialiased bg-[#0A0A0A] text-[#E8E4DD] font-sans noise-overlay">
      <Navigation />
      <main id="main" tabIndex={-1} className="pt-20">
        {children}
      </main>

      <SectionDivider variant="wave" className="mt-32 mb-0" />

      <footer className="border-t border-[#1E1E1E]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-16 md:py-24">
            <div className="md:col-span-5">
              <p className="text-[#D4A853] font-semibold tracking-tight text-lg mb-3">
                James Brady
              </p>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-[35ch]">
                Production AI systems, agent architectures, and practical tools
                that work.
              </p>
            </div>
            <div className="md:col-span-3 md:col-start-8">
              <p className="eyebrow mb-4">Navigate</p>
              <div className="flex flex-col gap-2.5">
                {[
                  ["/primer", "The Primer"],
                  ["/manuscript", "The Manuscript"],
                  ["/workshop", "The Workshop"],
                  ["/about", "About"],
                  ["/links", "Links"],
                  ["/watch", "Watch"],
                  ["/contact", "Contact"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="eyebrow mb-4">Meta</p>
              <div className="flex flex-col gap-3">
                <a
                  href="/feed.xml"
                  className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                >
                  <RssSimple size={14} weight="light" />
                  RSS
                </a>
                <a
                  href="/llms.txt"
                  className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                >
                  <FileText size={14} weight="light" />
                  llms.txt
                </a>
                <a
                  href="/api/catalog"
                  className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-[#D4A853] transition-premium"
                >
                  <Code size={14} weight="light" />
                  API
                  <ArrowUpRight size={10} weight="bold" className="opacity-40" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#1E1E1E] py-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <span className="text-xs text-neutral-600">
              &copy; {new Date().getFullYear()} James Brady. All rights reserved.
            </span>
            <span className="text-xs text-neutral-700 font-mono">
              Built with AI agents
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
