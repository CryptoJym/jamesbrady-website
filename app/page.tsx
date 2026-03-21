import Link from "next/link";

const cards = [
  {
    title: "The Primer",
    description:
      "How coding systems actually work. Code, the stack, AI agents, skills, and MCP — explained for humans.",
    href: "/primer",
  },
  {
    title: "The Manuscript",
    description:
      "A curated catalog of the best tools, frameworks, and MCP servers. Each one vetted. Each one real.",
    href: "/manuscript",
  },
  {
    title: "The Workshop",
    description:
      "Three practical guides. Set up an AI agent. Install skills. Connect MCP servers. Build something.",
    href: "/workshop",
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
          }),
        }}
      />

      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col justify-center px-6">
        <div className="max-w-6xl mx-auto w-full">
          <p className="text-[#D4A853] text-sm tracking-[0.3em] uppercase mb-6">
            James Brady
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
            AI
            <br />
            Alchemist
          </h1>
          <div className="w-16 h-px bg-[#D4A853] mb-8" />
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Mixing AI systems, protocols, and programs on a mathematical
            substrate. Sharing powerful tools. No fluff.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group border border-[#1E1E1E] rounded-lg p-8 hover:border-[#D4A853]/40 transition-all duration-300 bg-[#141414]"
            >
              <h2 className="text-xl font-semibold text-white group-hover:text-[#D4A853] transition-colors mb-3">
                {card.title}
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                {card.description}
              </p>
              <span className="text-[#D4A853] text-sm">Read &rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
