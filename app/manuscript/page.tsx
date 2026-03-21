import type { Metadata } from "next";
import { catalog } from "@/lib/catalog";
import { ArrowUpRight, Copy } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "The Manuscript",
  description:
    "A curated catalog of the best AI tools, frameworks, and MCP servers. Each one vetted. Each one real.",
};

export default function ManuscriptPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "The Manuscript — Curated AI Tool Catalog",
            description:
              "A curated catalog of the best AI tools, frameworks, and MCP servers.",
            author: { "@type": "Person", name: "James Brady" },
            url: "https://jamesbrady.org/manuscript",
          }),
        }}
      />

      <div className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Header — asymmetric editorial */}
          <header className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 animate-fade-up">
            <div className="md:col-span-7">
              <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#D4A853]/30 text-[#D4A853] inline-block mb-8">
                The Manuscript
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-6">
                Curated Tools
                <br />
                <span className="text-neutral-500">&amp; Servers</span>
              </h1>
              <div className="w-20 h-px bg-[#D4A853] animate-gold-line" />
            </div>
            <div className="md:col-span-4 md:col-start-9 flex items-end">
              <p className="text-neutral-400 text-base leading-relaxed">
                Every tool here is real, maintained, and worth your time. Organized
                by what you&apos;re trying to do, not by hype cycle. Install
                commands included.
              </p>
            </div>
          </header>

          {/* Category quick nav */}
          <nav className="mb-20 animate-fade-up stagger-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-medium mb-4">
              Jump to
            </p>
            <div className="flex flex-wrap gap-2">
              {catalog.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="text-xs px-3.5 py-1.5 rounded-full border border-[#1E1E1E] text-neutral-500 hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-all duration-500 ease-out-expo"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </nav>

          {/* Categories */}
          <div className="space-y-28">
            {catalog.map((category, catIndex) => (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-24"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                  <div className="md:col-span-5">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-xs text-neutral-600">
                        {String(catIndex + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {category.name}
                      </h2>
                    </div>
                    <p className="text-neutral-500 text-sm ml-8">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="group border border-[#1E1E1E] rounded-2xl p-6 md:p-8 bg-[#141414] hover:border-[#D4A853]/20 transition-all duration-500 ease-out-expo"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="font-semibold text-[#E8E4DD] tracking-tight">
                          {tool.name}
                        </h3>
                        <a
                          href={tool.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-neutral-600 hover:text-[#D4A853] transition-all duration-500 ease-out-expo text-xs shrink-0 group/link"
                        >
                          <span>GitHub</span>
                          <ArrowUpRight
                            size={12}
                            weight="bold"
                            className="group-hover/link:translate-x-px group-hover/link:-translate-y-px transition-transform duration-500 ease-out-expo"
                          />
                        </a>
                      </div>
                      <p className="text-neutral-500 text-sm leading-relaxed mb-5">
                        {tool.description}
                      </p>
                      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-2.5">
                        <Copy
                          size={14}
                          weight="light"
                          className="text-neutral-600 flex-shrink-0"
                        />
                        <code className="text-xs font-mono text-[#D4A853]/70 truncate">
                          {tool.install}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
