import Link from "next/link";
import {
  BookOpen,
  Scroll,
  Wrench,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import AlchemyCanvas from "@/components/AlchemyCanvas";

const cards = [
  {
    number: "01",
    title: "The Primer",
    description:
      "How coding systems actually work. Code, the stack, AI agents, skills, and MCP — explained for humans.",
    href: "/primer",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "The Manuscript",
    description:
      "A curated catalog of the best tools, frameworks, and MCP servers. Each one vetted. Each one real.",
    href: "/manuscript",
    icon: Scroll,
  },
  {
    number: "03",
    title: "The Workshop",
    description:
      "Three practical guides. Set up an AI agent. Install skills. Connect MCP servers. Build something.",
    href: "/workshop",
    icon: Wrench,
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "James Brady — AI Alchemist",
            url: "https://jamesbrady.org",
            description:
              "AI systems, protocols, and programs on a mathematical substrate. Tools that work.",
            author: {
              "@type": "Person",
              name: "James Brady",
              jobTitle: "AI Alchemist",
              url: "https://jamesbrady.org/about",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: "https://jamesbrady.org/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <AlchemyCanvas />

      {/* Hero — left-aligned, editorial */}
      <section className="relative z-10 min-h-[100dvh] flex items-end px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
            {/* Left column — dominant */}
            <div className="md:col-span-7 animate-fade-up">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#D4A853]/30 text-[#D4A853]">
                  James Brady
                </span>
              </div>

              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-0">
                <span className="block text-[#E8E4DD]">AI</span>
                <span className="block text-[#D4A853]">Alchemist</span>
              </h1>

              <div className="w-24 h-[2px] bg-[#D4A853] mt-8 animate-gold-line" />

              <p className="text-neutral-400 text-lg leading-relaxed max-w-[50ch] mt-8 animate-fade-up stagger-2">
                Systems, protocols, and programs on a mathematical substrate.
                Turning raw AI into tools that work.
              </p>
            </div>

            {/* Right column — CTA */}
            <div className="md:col-span-4 md:col-start-9 animate-fade-up stagger-3">
              <div className="flex flex-col gap-4">
                <Link
                  href="/primer"
                  className="group inline-flex items-center gap-3 text-sm text-[#D4A853] hover:text-[#E5C87A] transition-all duration-500 ease-out-expo"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#D4A853]/20 group-hover:border-[#D4A853]/40 group-hover:bg-[#D4A853]/10 transition-all duration-500 ease-out-expo">
                    <ArrowUpRight size={14} weight="bold" />
                  </span>
                  <span className="tracking-wide uppercase text-xs font-medium">
                    Start reading
                  </span>
                </Link>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-3 text-sm text-neutral-500 hover:text-[#E5C87A] transition-all duration-500 ease-out-expo"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-700 group-hover:border-[#D4A853]/40 group-hover:bg-[#D4A853]/10 transition-all duration-500 ease-out-expo">
                    <ArrowUpRight size={14} weight="bold" />
                  </span>
                  <span className="tracking-wide uppercase text-xs font-medium">
                    About me
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards — editorial grid */}
      <section className="relative z-10 px-6 md:px-12 pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="border-t border-[#1E1E1E] pt-16 mb-12">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-medium">
              Explore
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative block p-8 md:p-10 border border-[#1E1E1E] bg-[#141414]/80 backdrop-blur-sm rounded-2xl hover:border-[#D4A853]/30 hover:shadow-[0_0_30px_-5px_rgba(212,168,83,0.15)] transition-all duration-600 ease-out-expo active:scale-[0.98] animate-fade-up"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-8">
                    <span className="font-mono text-xs text-neutral-600">
                      {card.number}
                    </span>
                    <Icon
                      size={24}
                      weight="light"
                      className="text-neutral-600 group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo"
                    />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-[#E8E4DD] group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo mb-3">
                    {card.title}
                  </h2>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-[40ch]">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 group-hover:text-[#D4A853] transition-all duration-500 ease-out-expo">
                    <span>Read</span>
                    <ArrowUpRight
                      size={14}
                      weight="bold"
                      className="transform group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-500 ease-out-expo"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
