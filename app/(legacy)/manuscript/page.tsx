import type { Metadata } from "next";
import Image from "next/image";
import { catalog } from "@/lib/catalog";
import { ArrowUpRight, Copy } from "@phosphor-icons/react/dist/ssr";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";
import GeometricIcon from "@/components/GeometricIcon";

export const metadata: Metadata = {
  title: "The Manuscript",
  description:
    "A curated catalog of the best AI tools, frameworks, and MCP servers. Each one vetted. Each one real.",
  alternates: {
    canonical: "/manuscript",
  },
};

const dividerVariants: Array<"metatron" | "wave" | "hexline" | "vesica"> = [
  "metatron",
  "wave",
  "hexline",
  "vesica",
];

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

      <div className="min-h-screen bg-[#0A0A0A]">
        {/* ── Header Background Image ── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 h-[50vh] md:h-[60vh]">
            <Image
              src="/images/manuscript-book.jpg"
              alt=""
              fill
              priority
              className="object-cover opacity-25"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/50 via-[#0A0A0A]/70 to-[#0A0A0A]" />
          </div>

          <div className="relative px-6 md:px-12 lg:px-16 py-24 md:py-32">
            <div className="max-w-[1400px] mx-auto">
              {/* Header */}
              <ScrollReveal>
                <header className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-16">
                  <div className="md:col-span-7">
                    <span className="eyebrow mb-6 block">The Manuscript</span>
                    <h1 className="section-header mb-6">
                      Curated Tools
                      <br />
                      <span className="text-neutral-500">&amp; Servers</span>
                    </h1>
                    <div className="w-20 h-px bg-[#D4A853] animate-gold-line" />
                  </div>
                  <div className="md:col-span-4 md:col-start-9 flex items-end">
                    <p className="text-neutral-400 text-base leading-relaxed">
                      Every tool here is real, maintained, and worth your time.
                      Organized by what you&apos;re trying to do, not by hype
                      cycle. Install commands included.
                    </p>
                  </div>
                </header>
              </ScrollReveal>

            {/* Category quick nav */}
            <ScrollReveal delay={100}>
              <nav className="mb-20">
                <p className="eyebrow mb-4 text-neutral-500">Jump to</p>
                <div className="flex flex-wrap gap-2">
                  {catalog.map((cat) => (
                    <a
                      key={cat.id}
                      href={`#${cat.id}`}
                      className="text-xs px-3.5 py-1.5 rounded-full border border-[#1E1E1E] text-neutral-500 hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-premium"
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </nav>
            </ScrollReveal>

            <SectionDivider variant="metatron" className="mb-20" />

            {/* Categories */}
            <div className="space-y-0">
              {catalog.map((category, catIndex) => (
                <section
                  key={category.id}
                  id={category.id}
                  className="scroll-mt-24"
                >
                  <ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                      <div className="md:col-span-6">
                        <div className="flex items-center gap-3 mb-3">
                          <GeometricIcon
                            category={category.id}
                            size={28}
                            className="opacity-80 flex-shrink-0"
                          />
                          <div className="flex items-baseline gap-3">
                            <span className="font-mono text-xs text-neutral-600">
                              {String(catIndex + 1).padStart(2, "0")}
                            </span>
                            <h2 className="text-2xl font-semibold tracking-tight text-[#E8E4DD]">
                              {category.name}
                            </h2>
                          </div>
                        </div>
                        <p className="text-neutral-500 text-sm leading-relaxed ml-[40px]">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {category.tools.map((tool, toolIndex) => (
                      <ScrollReveal
                        key={tool.name}
                        delay={toolIndex * 80}
                      >
                        <div className="tool-card group border border-[#1E1E1E] rounded-2xl p-6 md:p-8 bg-[#141414] h-full flex flex-col">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <h3 className="font-semibold text-[#E8E4DD] tracking-tight text-base">
                              {tool.name}
                            </h3>
                            <a
                              href={tool.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-neutral-600 hover:text-[#D4A853] transition-premium text-xs shrink-0 group/link"
                            >
                              <span>GitHub</span>
                              <ArrowUpRight
                                size={12}
                                weight="bold"
                                className="group-hover/link:translate-x-px group-hover/link:-translate-y-px transition-transform duration-500"
                              />
                            </a>
                          </div>
                          <p className="text-neutral-500 text-sm leading-relaxed mb-5 flex-1">
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
                      </ScrollReveal>
                    ))}
                  </div>

                  {catIndex < catalog.length - 1 && (
                    <ScrollReveal>
                      <SectionDivider
                        variant={
                          dividerVariants[(catIndex + 1) % dividerVariants.length]
                        }
                        className="my-20"
                      />
                    </ScrollReveal>
                  )}
                </section>
              ))}
            </div>

            {/* Footer note */}
            <ScrollReveal delay={200}>
              <div className="mt-28 pt-12 border-t border-[#1E1E1E]">
                <p className="text-neutral-600 text-sm leading-relaxed max-w-xl">
                  This catalog is updated regularly. Every tool listed has been
                  personally tested and verified. If something breaks or a better
                  alternative emerges, it gets swapped.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
