import type { Metadata } from "next";
import { catalog } from "@/lib/catalog";

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

      <div className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-16 max-w-3xl">
            <p className="text-[#D4A853] text-sm tracking-[0.3em] uppercase mb-4">
              The Manuscript
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Curated Tools &amp; Servers
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Every tool here is real, maintained, and worth your time. Organized
              by what you&apos;re trying to do, not by hype cycle. Install
              commands included.
            </p>
            <div className="w-16 h-px bg-[#D4A853] mt-8" />
          </header>

          {/* Category quick nav */}
          <nav className="mb-12 flex flex-wrap gap-2">
            {catalog.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="text-xs px-3 py-1.5 rounded border border-[#1E1E1E] text-neutral-400 hover:text-[#D4A853] hover:border-[#D4A853]/40 transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </nav>

          {/* Categories */}
          <div className="space-y-20">
            {catalog.map((category) => (
              <section key={category.id} id={category.id}>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2">
                    {category.name}
                  </h2>
                  <p className="text-neutral-500 text-sm">
                    {category.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="border border-[#1E1E1E] rounded-lg p-6 bg-[#141414] hover:border-[#D4A853]/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-white">
                          {tool.name}
                        </h3>
                        <a
                          href={tool.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-500 hover:text-[#D4A853] transition-colors text-xs shrink-0"
                        >
                          GitHub &#8599;
                        </a>
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                        {tool.description}
                      </p>
                      <code className="block text-xs font-mono bg-black/50 text-[#D4A853]/80 px-3 py-2 rounded border border-[#1E1E1E]">
                        {tool.install}
                      </code>
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
