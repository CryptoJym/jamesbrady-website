import {
  RssSimple,
  FileText,
  Code,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";

import { Navigation } from "@/components/Navigation";
import SectionDivider from "@/components/SectionDivider";

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
                  ["/learn", "Learn"],
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
              Utlyze (studio) · New Reward (agency) — James operates both
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
