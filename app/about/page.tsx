import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "About",
  description:
    "James Brady — AI Alchemist. Mixing AI systems, protocols, and programs on a mathematical substrate.",
};

const links = [
  {
    label: "GitHub",
    abbr: "GH",
    href: "https://github.com/jamesbrady",
    external: true,
  },
  {
    label: "x.com/jamesbrady",
    abbr: "X",
    href: "https://x.com/jamesbrady",
    external: true,
  },
  {
    label: "hello@jamesbrady.org",
    abbr: "@",
    href: "mailto:hello@jamesbrady.org",
    external: false,
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: "James Brady",
              jobTitle: "AI Alchemist",
              url: "https://jamesbrady.org",
              description:
                "Mixing AI systems, protocols, and programs on a mathematical substrate.",
              sameAs: [
                "https://github.com/jamesbrady",
                "https://x.com/jamesbrady",
              ],
            },
          }),
        }}
      />

      <div className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Header — editorial split */}
          <header className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 animate-fade-up">
            <div className="md:col-span-7">
              <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#D4A853]/30 text-[#D4A853] inline-block mb-8">
                About
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-6">
                James
                <br />
                Brady
              </h1>
              <div className="w-20 h-px bg-[#D4A853] animate-gold-line" />
            </div>
          </header>

          {/* Content — asymmetric two-column on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
            {/* Main content */}
            <div className="md:col-span-7 space-y-8 text-neutral-300 leading-relaxed animate-fade-up stagger-2">
              <p className="text-lg text-[#E8E4DD]">
                I build with AI systems. Not demos — systems. The kind that run in
                production, process real data, and solve actual problems.
              </p>

              <p>
                The &ldquo;AI Alchemist&rdquo; label isn&apos;t metaphor for
                mysticism. Alchemy was the predecessor to chemistry — people
                experimenting with combinations of materials, trying to
                understand transformation at a fundamental level. Some of it
                worked. Most of it didn&apos;t. The ones who succeeded were the
                ones who documented their experiments honestly.
              </p>

              <p>
                That&apos;s what this site is. Honest documentation of what works
                in AI tooling right now. The tools that are actually useful, the
                patterns that actually scale, the workflows that actually save
                time. No hype. No vaporware.
              </p>

              <div className="border-l-2 border-[#D4A853] pl-6 my-12 text-neutral-400 italic text-lg leading-relaxed">
                The substrate is mathematics. The medium is code. The goal is
                tools that work.
              </div>

              <p>
                I work across the full AI stack — from model selection and prompt
                engineering to agent architecture, MCP integrations, and
                production deployment. I&apos;m particularly interested in the
                intersection of AI agents and developer tooling: how we can make
                AI systems that are genuinely useful for building software, not
                just generating it.
              </p>

              <p>
                This site itself was built with AI agents, using the tools
                documented in{" "}
                <a
                  href="/manuscript"
                  className="text-[#D4A853] hover:text-[#E5C87A] underline underline-offset-4 decoration-[#D4A853]/30 hover:decoration-[#D4A853]/60 transition-all duration-500 ease-out-expo"
                >
                  The Manuscript
                </a>
                . It&apos;s the proof of the pudding.
              </p>
            </div>

            {/* Sidebar — links and meta */}
            <div className="md:col-span-3 md:col-start-10 animate-fade-up stagger-3">
              <div className="md:sticky md:top-28">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-medium mb-6">
                  Connect
                </p>
                <div className="space-y-4">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group flex items-center gap-3 text-neutral-400 hover:text-[#D4A853] transition-all duration-500 ease-out-expo"
                    >
                      <span className="font-mono text-xs text-[#D4A853]/40 group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo w-6">
                        {link.abbr}
                      </span>
                      <span className="text-sm">{link.label}</span>
                      {link.external && (
                        <ArrowUpRight
                          size={12}
                          weight="bold"
                          className="text-neutral-600 group-hover:text-[#D4A853] group-hover:translate-x-px group-hover:-translate-y-px transition-all duration-500 ease-out-expo ml-auto"
                        />
                      )}
                    </a>
                  ))}
                </div>

                <div className="border-t border-[#1E1E1E] mt-8 pt-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-medium mb-4">
                    Focus
                  </p>
                  <div className="space-y-2">
                    {[
                      "AI Agent Architecture",
                      "MCP Integrations",
                      "Production Systems",
                      "Developer Tooling",
                    ].map((item) => (
                      <p
                        key={item}
                        className="text-sm text-neutral-500"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
