import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "James Brady — AI Alchemist. Mixing AI systems, protocols, and programs on a mathematical substrate.",
};

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

      <div className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-16">
            <p className="text-[#D4A853] text-sm tracking-[0.3em] uppercase mb-4">
              About
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              James Brady
            </h1>
            <div className="w-16 h-px bg-[#D4A853]" />
          </header>

          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <p className="text-lg">
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
              time. No hype. No vaporware. No &ldquo;10x your
              productivity&rdquo; clickbait.
            </p>

            <div className="border-l-2 border-[#D4A853]/40 pl-6 my-8 text-neutral-400 italic text-lg">
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
                className="text-[#D4A853] hover:underline underline-offset-4"
              >
                The Manuscript
              </a>
              . It&apos;s the proof of the pudding.
            </p>

            {/* Links */}
            <div className="pt-8 border-t border-[#1E1E1E]">
              <h2 className="text-lg font-semibold mb-4">Links</h2>
              <div className="space-y-3">
                <a
                  href="https://github.com/jamesbrady"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-neutral-400 hover:text-[#D4A853] transition-colors group"
                >
                  <span className="font-mono text-sm text-[#D4A853]/60 group-hover:text-[#D4A853]">
                    GH
                  </span>
                  <span>github.com/jamesbrady</span>
                  <span className="text-xs">&#8599;</span>
                </a>
                <a
                  href="https://x.com/jamesbrady"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-neutral-400 hover:text-[#D4A853] transition-colors group"
                >
                  <span className="font-mono text-sm text-[#D4A853]/60 group-hover:text-[#D4A853]">
                    X
                  </span>
                  <span>x.com/jamesbrady</span>
                  <span className="text-xs">&#8599;</span>
                </a>
                <a
                  href="mailto:hello@jamesbrady.org"
                  className="flex items-center gap-3 text-neutral-400 hover:text-[#D4A853] transition-colors group"
                >
                  <span className="font-mono text-sm text-[#D4A853]/60 group-hover:text-[#D4A853]">
                    @
                  </span>
                  <span>hello@jamesbrady.org</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
