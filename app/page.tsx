import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Scroll,
  Wrench,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import AlchemyCanvas from "@/components/AlchemyCanvas";
import SectionDivider from "@/components/SectionDivider";
import ScrollReveal from "@/components/ScrollReveal";

const cards = [
  {
    number: "I",
    title: "The Primer",
    description:
      "How coding systems actually work. Code, the stack, AI agents, skills, and MCP — explained for humans.",
    href: "/primer",
    icon: BookOpen,
  },
  {
    number: "II",
    title: "The Manuscript",
    description:
      "A curated catalog of the best tools, frameworks, and MCP servers. Each one vetted. Each one real.",
    href: "/manuscript",
    icon: Scroll,
  },
  {
    number: "III",
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
          }),
        }}
      />

      {/* Hero with Algorithmic Art Canvas */}
      <section className="relative min-h-[100dvh] flex items-end overflow-hidden">
        <Image
          src="/images/hero-alchemy.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-30 mix-blend-luminosity"
          sizes="100vw"
        />
        <AlchemyCanvas />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-7 animate-fade-up">
              <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#D4A853]/30 text-[#D4A853] mb-6">
                James Brady
              </span>

              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9]">
                <span className="block text-[#E8E4DD]">AI</span>
                <span className="block text-[#D4A853]">Alchemist</span>
              </h1>

              <div className="w-24 h-[2px] bg-[#D4A853] mt-8 animate-gold-line" />

              <p className="text-neutral-400 text-lg leading-relaxed max-w-[50ch] mt-8 animate-fade-up stagger-2">
                Systems, protocols, and programs on a mathematical substrate.
                Turning raw AI into tools that work.
              </p>
            </div>

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

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent z-[5]" />
      </section>

      {/* Geometric Divider */}
      <SectionDivider variant="metatron" className="my-8" />

      {/* Volumes — asymmetric card grid */}
      <section className="relative z-10 px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal>
            <p className="eyebrow mb-4">Volumes</p>
            <h2 className="section-header mb-16 max-w-lg">
              Three paths into the work
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const spans =
                index === 0
                  ? "md:col-span-5"
                  : index === 1
                    ? "md:col-span-4"
                    : "md:col-span-3";
              return (
                <ScrollReveal key={card.href} delay={index * 120} className={spans}>
                  <Link
                    href={card.href}
                    className="group relative block h-full p-8 md:p-10 border border-[#1E1E1E] bg-[#141414] rounded-lg card-glow"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <span className="font-mono text-xs text-neutral-600 tracking-wider">
                        {card.number}
                      </span>
                      <Icon
                        size={24}
                        weight="light"
                        className="text-neutral-600 group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo"
                      />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#E8E4DD] group-hover:text-[#D4A853] transition-colors duration-500 ease-out-expo mb-3">
                      {card.title}
                    </h3>
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
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Geometric Divider */}
      <SectionDivider variant="hexline" className="my-4" />

      {/* Philosophy split */}
      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <ScrollReveal className="md:col-span-5">
              <p className="eyebrow mb-4">Philosophy</p>
              <h2 className="section-header mb-6">
                Honest documentation of what works
              </h2>
              <div className="w-12 h-px bg-[#D4A853]/40" />
            </ScrollReveal>

            <ScrollReveal delay={150} className="md:col-span-6 md:col-start-7">
              <div className="space-y-6 text-neutral-400 leading-relaxed">
                <p>
                  Alchemy was the predecessor to chemistry — people experimenting
                  with combinations of materials, trying to understand
                  transformation at a fundamental level. The ones who succeeded
                  were the ones who documented their experiments honestly.
                </p>
                <p>
                  The tools that are actually useful, the patterns that actually
                  scale, the workflows that actually save time. No hype. No
                  vaporware.
                </p>
                <blockquote className="border-l-2 border-[#D4A853] pl-6 text-neutral-300 italic">
                  The substrate is mathematics. The medium is code. The goal is
                  tools that work.
                </blockquote>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Geometric Divider */}
      <SectionDivider variant="vesica" className="my-4" />

      {/* Numbers */}
      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { number: "298", label: "Tools cataloged" },
              { number: "9", label: "Categories" },
              { number: "3", label: "Practical guides" },
              { number: "5", label: "Core concepts" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 100}>
                <div className="text-center md:text-left">
                  <p className="font-mono text-3xl md:text-4xl font-bold text-[#D4A853] tracking-tight mb-2">
                    {stat.number}
                  </p>
                  <p className="text-neutral-500 text-sm">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
