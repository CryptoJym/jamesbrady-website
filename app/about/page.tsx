import type { Metadata } from "next";
import {
  ArrowUpRight,
  GithubLogo,
  XLogo,
  LinkedinLogo,
  TiktokLogo,
  YoutubeLogo,
  Butterfly,
  Envelope,
  Lightning,
  Brain,
  Code,
  GitBranch,
  Terminal,
  Cube,
} from "@phosphor-icons/react/dist/ssr";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";

export const metadata: Metadata = {
  title: "About",
  description:
    "James Brady — AI Alchemist. Mixing AI systems, protocols, and programs on a mathematical substrate.",
};

const socialLinks = [
  {
    label: "LinkedIn /in/jamesbrady1",
    href: "https://www.linkedin.com/in/jamesbrady1/",
    icon: LinkedinLogo,
    external: true,
  },
  {
    label: "x.com/h3roai",
    href: "https://x.com/h3roai",
    icon: XLogo,
    external: true,
  },
  {
    label: "TikTok @h3ro.ai",
    href: "https://www.tiktok.com/@h3ro.ai",
    icon: TiktokLogo,
    external: true,
  },
  {
    label: "Bluesky utlyzeit.bsky.social",
    href: "https://bsky.app/profile/utlyzeit.bsky.social",
    icon: Butterfly,
    external: true,
  },
  {
    label: "github.com/CryptoJym",
    href: "https://github.com/CryptoJym",
    icon: GithubLogo,
    external: true,
  },
  {
    label: "YouTube channel",
    href: "https://www.youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA",
    icon: YoutubeLogo,
    external: true,
  },
  {
    label: "james@utlyze.com",
    href: "mailto:james@utlyze.com",
    icon: Envelope,
    external: false,
  },
];

const disciplines = [
  {
    icon: Brain,
    title: "AI Agent Architecture",
    description:
      "Designing multi-agent systems that coordinate, reason, and execute with reliability at production scale.",
  },
  {
    icon: GitBranch,
    title: "MCP Integrations",
    description:
      "Building bridges between AI models and real-world tools through the Model Context Protocol.",
  },
  {
    icon: Terminal,
    title: "Production Systems",
    description:
      "Shipping AI that runs in production — not demos that break on real data.",
  },
  {
    icon: Code,
    title: "Developer Tooling",
    description:
      "Making AI genuinely useful for building software, not just generating it.",
  },
];

const milestones = [
  { year: "Now", label: "AI Alchemist — building at the frontier" },
  { year: "Ongoing", label: "Open-source MCP tooling and agent frameworks" },
  { year: "Always", label: "Documenting what actually works" },
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
                "https://www.linkedin.com/in/jamesbrady1/",
                "https://x.com/h3roai",
                "https://www.tiktok.com/@h3ro.ai",
                "https://bsky.app/profile/utlyzeit.bsky.social",
                "https://github.com/CryptoJym",
                "https://www.youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA",
              ],
              email: "james@utlyze.com",
            },
          }),
        }}
      />

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 pt-28 md:pt-40 pb-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left — name and headline */}
          <div className="md:col-span-8 animate-fade-up">
            <span className="eyebrow text-[#D4A853] mb-8 inline-block">
              About
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              James
              <br />
              <span className="text-[#D4A853]">Brady</span>
            </h1>
            <div className="w-24 h-px bg-[#D4A853] animate-gold-line mb-8" />
            <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-2xl">
              AI Alchemist. Building systems that think, connect, and ship.
            </p>
          </div>

          {/* Right — quick connect */}
          <div className="md:col-span-3 md:col-start-10 flex flex-col justify-end animate-fade-up stagger-3">
            <p className="eyebrow text-neutral-500 mb-5">Connect</p>
            <div className="space-y-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-3 text-neutral-400 hover:text-[#D4A853] transition-premium"
                >
                  <link.icon
                    size={18}
                    weight="regular"
                    className="text-[#D4A853]/40 group-hover:text-[#D4A853] transition-premium"
                  />
                  <span className="text-sm">{link.label}</span>
                  {link.external && (
                    <ArrowUpRight
                      size={12}
                      weight="bold"
                      className="text-neutral-600 group-hover:text-[#D4A853] group-hover:translate-x-px group-hover:-translate-y-px transition-premium ml-auto"
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider variant="metatron" className="my-4" />

      {/* ── Philosophy ── */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Offset label column */}
          <div className="md:col-span-3">
            <ScrollReveal>
              <span className="eyebrow text-[#D4A853]">Philosophy</span>
            </ScrollReveal>
          </div>

          {/* Content column — offset right for asymmetry */}
          <div className="md:col-span-7 md:col-start-5 space-y-8">
            <ScrollReveal>
              <p className="text-lg md:text-xl text-[#E8E4DD] leading-relaxed">
                I build with AI systems. Not demos — systems. The kind that run
                in production, process real data, and solve actual problems.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <p className="text-neutral-400 leading-relaxed">
                The &ldquo;AI Alchemist&rdquo; label isn&apos;t metaphor for
                mysticism. Alchemy was the predecessor to chemistry — people
                experimenting with combinations of materials, trying to
                understand transformation at a fundamental level. Some of it
                worked. Most of it didn&apos;t. The ones who succeeded were the
                ones who documented their experiments honestly.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-neutral-400 leading-relaxed">
                That&apos;s what this site is. Honest documentation of what
                works in AI tooling right now. The tools that are actually
                useful, the patterns that actually scale, the workflows that
                actually save time. No hype. No vaporware.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <blockquote className="border-l-2 border-[#D4A853] pl-6 my-4">
                <p className="text-lg md:text-xl text-neutral-300 italic leading-relaxed">
                  The substrate is mathematics. The medium is code. The goal is
                  tools that work.
                </p>
              </blockquote>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <p className="text-neutral-400 leading-relaxed">
                I work across the full AI stack — from model selection and
                prompt engineering to agent architecture, MCP integrations, and
                production deployment. I&apos;m particularly interested in the
                intersection of AI agents and developer tooling: how we can make
                AI systems that are genuinely useful for building software, not
                just generating it.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider variant="wave" className="my-4" />

      {/* ── Video essay ── */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          <ScrollReveal className="md:col-span-4">
            <span className="eyebrow text-[#D4A853] mb-4 inline-block">
              Video Essay
            </span>
            <h2 className="section-header mb-6">
              From prompts to operating systems
            </h2>
            <p className="text-neutral-400 leading-relaxed max-w-[42ch]">
              A James-voiced explanation of the shift from one-off prompting to
              real AI systems with continuity, skills, routing, and momentum.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={120} className="md:col-span-8">
            <div className="rounded-[28px] overflow-hidden border border-[#1E1E1E] bg-[#101010] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <video
                controls
                preload="metadata"
                playsInline
                className="w-full bg-black"
              >
                <source
                  src="/videos/james-prompts-to-operating-systems.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider variant="vesica" className="my-4" />

      {/* ── Disciplines ── */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal>
            <div className="mb-16">
              <span className="eyebrow text-[#D4A853] mb-4 inline-block">
                Focus Areas
              </span>
              <h2 className="section-header">What I Build</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1E1E1E]/50 border border-[#1E1E1E]/50 rounded-lg overflow-hidden">
            {disciplines.map((d, i) => (
              <ScrollReveal key={d.title} delay={i * 100}>
                <div className="bg-[#0A0A0A] p-8 md:p-10 h-full group hover:bg-[#111111] transition-premium">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-md border border-[#D4A853]/15 flex items-center justify-center bg-[#D4A853]/[0.04] group-hover:border-[#D4A853]/30 group-hover:bg-[#D4A853]/[0.08] transition-premium">
                      <d.icon
                        size={20}
                        weight="light"
                        className="text-[#D4A853]/70 group-hover:text-[#D4A853] transition-premium"
                      />
                    </div>
                    <div>
                      <h3 className="text-[#E8E4DD] font-semibold text-base mb-2 tracking-tight">
                        {d.title}
                      </h3>
                      <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-400 transition-premium">
                        {d.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="hexline" className="my-4" />

      {/* ── Proof ── */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Right-aligned label for asymmetry */}
          <div className="md:col-span-5 md:col-start-8 order-1 md:order-2">
            <ScrollReveal>
              <span className="eyebrow text-[#D4A853] mb-4 inline-block">
                The Proof
              </span>
              <h2 className="section-header mb-8">Built With Its Own Tools</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                This site itself was built with AI agents, using the tools
                documented in{" "}
                <a href="/manuscript" className="link-gold text-[#D4A853]">
                  The Manuscript
                </a>
                . It&apos;s the proof of the pudding — a production system
                assembled by the very workflows it describes.
              </p>
              <a
                href="/manuscript"
                className="group inline-flex items-center gap-2 text-sm text-[#D4A853]/80 hover:text-[#D4A853] transition-premium"
              >
                <Lightning size={16} weight="fill" className="text-[#D4A853]/60 group-hover:text-[#D4A853] transition-premium" />
                <span>Read The Manuscript</span>
                <ArrowUpRight
                  size={12}
                  weight="bold"
                  className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-premium"
                />
              </a>
            </ScrollReveal>
          </div>

          {/* Timeline on the left */}
          <div className="md:col-span-5 order-2 md:order-1">
            <ScrollReveal delay={200}>
              <div className="space-y-0">
                {milestones.map((m, i) => (
                  <div
                    key={m.year}
                    className="relative pl-8 pb-8 last:pb-0 border-l border-[#1E1E1E] group"
                  >
                    {/* Dot on the timeline */}
                    <div className="absolute left-0 top-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-[#D4A853]/30 bg-[#0A0A0A] group-hover:border-[#D4A853] group-hover:bg-[#D4A853]/20 transition-premium" />
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#D4A853]/60 font-medium mb-1">
                      {m.year}
                    </p>
                    <p className="text-neutral-300 text-sm leading-relaxed">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider variant="vesica" className="my-4" />

      {/* ── Approach / Toolkit ── */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-3">
            <ScrollReveal>
              <span className="eyebrow text-[#D4A853]">Approach</span>
            </ScrollReveal>
          </div>

          <div className="md:col-span-7 md:col-start-5">
            <ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
                {[
                  { value: "Systems", sub: "Not demos" },
                  { value: "Production", sub: "Not prototypes" },
                  { value: "Honest", sub: "Not hype" },
                ].map((stat) => (
                  <div key={stat.value}>
                    <p className="text-2xl md:text-3xl font-bold tracking-tight text-[#E8E4DD] mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                      {stat.sub}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="border border-[#1E1E1E] rounded-lg p-6 md:p-8 bg-[#0E0E0E]">
                <div className="flex items-center gap-3 mb-4">
                  <Cube
                    size={18}
                    weight="light"
                    className="text-[#D4A853]/60"
                  />
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                    Stack
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "TypeScript",
                    "Next.js",
                    "Python",
                    "LangChain",
                    "MCP",
                    "OpenAI",
                    "Anthropic",
                    "Vercel",
                    "Supabase",
                    "PostgreSQL",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 text-xs text-neutral-400 border border-[#1E1E1E] rounded-md bg-[#0A0A0A] hover:border-[#D4A853]/20 hover:text-neutral-300 transition-premium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="px-6 md:px-12 pb-28 md:pb-40 pt-8">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal>
            <div className="border border-[#1E1E1E] rounded-xl p-10 md:p-16 bg-gradient-to-br from-[#0E0E0E] to-[#0A0A0A] relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4A853]/[0.03] rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    Let&apos;s build something real.
                  </h2>
                  <p className="text-neutral-400 max-w-lg">
                    If you&apos;re working on AI systems that need to actually
                    ship, I&apos;d like to hear about it.
                  </p>
                </div>

                <div className="md:col-span-4 flex md:justify-end">
                  <a
                    href="mailto:james@utlyze.com"
                    className="group inline-flex items-center gap-3 px-6 py-3 border border-[#D4A853]/30 rounded-lg text-[#D4A853] hover:bg-[#D4A853]/10 hover:border-[#D4A853]/50 transition-premium"
                  >
                    <Envelope
                      size={18}
                      weight="regular"
                      className="text-[#D4A853]/70 group-hover:text-[#D4A853] transition-premium"
                    />
                    <span className="text-sm font-medium">Get in Touch</span>
                    <ArrowUpRight
                      size={14}
                      weight="bold"
                      className="opacity-60 group-hover:opacity-100 group-hover:translate-x-px group-hover:-translate-y-px transition-premium"
                    />
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
