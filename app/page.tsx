import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Code,
  GitBranch,
  Lightning,
  Scroll,
  Terminal,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import AlchemyCanvas from "@/components/AlchemyCanvas";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";

const proofPoints = [
  { value: "30+", label: "products built" },
  { value: "100+", label: "repositories" },
  { value: "13K", label: "people following the work" },
];

const systems = [
  {
    icon: Brain,
    title: "AI-native products",
    description:
      "Products and ventures designed around what AI makes possible now—not software with an assistant bolted on later.",
  },
  {
    icon: GitBranch,
    title: "Agent architecture",
    description:
      "Specialized agents, skills, tools, memory, and routing assembled into systems that can carry real work.",
  },
  {
    icon: Terminal,
    title: "Operating workflows",
    description:
      "Human-and-AI workflows with clear ownership, review points, and dependable handoffs across the business.",
  },
  {
    icon: Code,
    title: "Proof infrastructure",
    description:
      "Control planes, verification loops, and evidence surfaces that show what changed, what worked, and what is next.",
  },
];

const library = [
  {
    number: "I",
    title: "The Primer",
    description:
      "How code, stacks, agents, skills, and MCP actually fit together—written for people who want the system, not the jargon.",
    href: "/primer",
    icon: BookOpen,
  },
  {
    number: "II",
    title: "The Manuscript",
    description:
      "A living catalog of tools and frameworks that have earned a place in the work. Vetted, useful, and installable.",
    href: "/manuscript",
    icon: Scroll,
  },
  {
    number: "III",
    title: "The Workshop",
    description:
      "Practical guides for turning one useful AI behavior into a working operator loop, then building from there.",
    href: "/workshop",
    icon: Wrench,
  },
];

const bookingUrl =
  "https://www.utlyze.com/booking?utm_source=jamesbrady.org&utm_medium=referral&utm_campaign=personal-site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "James Brady",
        url: "https://www.jamesbrady.org",
        description:
          "James Brady builds AI-native companies, production systems, agent architectures, and operating workflows.",
      },
      {
        "@type": "Person",
        name: "James Brady",
        jobTitle: "Founder and AI Systems Builder",
        url: "https://www.jamesbrady.org/about",
        worksFor: [
          {
            "@type": "Organization",
            name: "Utlyze",
            url: "https://www.utlyze.com",
          },
          {
            "@type": "Organization",
            name: "New Reward",
            url: "https://www.newreward.com",
          },
        ],
        sameAs: [
          "https://www.linkedin.com/in/jamesbrady1/",
          "https://x.com/h3roai",
          "https://github.com/CryptoJym",
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative min-h-[calc(100dvh-5rem)] overflow-hidden border-b border-[#1E1E1E]">
        <Image
          src="/images/hero-alchemy.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.22] mix-blend-luminosity"
          sizes="100vw"
        />
        <AlchemyCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(212,168,83,0.09),transparent_32%),linear-gradient(90deg,rgba(10,10,10,0.98)_0%,rgba(10,10,10,0.78)_52%,rgba(10,10,10,0.42)_100%)]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1400px] grid-cols-1 items-end gap-12 px-6 pb-16 pt-28 md:grid-cols-12 md:px-12 md:pb-24">
          <div className="animate-fade-up md:col-span-8">
            <p className="mb-7 text-[10px] font-medium uppercase tracking-[0.24em] text-[#D4A853]">
              James Brady · Founder &amp; AI systems builder
            </p>
            <h1 className="max-w-[11ch] font-editorial text-6xl font-medium leading-[0.88] tracking-[-0.045em] text-[#E8E4DD] sm:text-7xl md:text-8xl lg:text-[7.4rem]">
              Building the companies AI makes possible.
            </h1>
            <div className="mt-8 h-px w-24 origin-left bg-[#D4A853] animate-gold-line" />
            <p className="mt-8 max-w-[58ch] text-lg leading-relaxed text-neutral-300 md:text-xl">
              I turn frontier models into products, workflows, and operating
              systems that real businesses can use—then document what actually
              works.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-between gap-5 rounded-full bg-[#D4A853] px-6 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-premium hover:bg-[#E5C87A]"
              >
                Work with James
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight size={15} weight="bold" />
                </span>
              </Link>
              <Link
                href="#work"
                className="group inline-flex items-center justify-between gap-5 rounded-full border border-[#D4A853]/25 bg-[#0A0A0A]/50 px-6 py-3.5 text-sm font-medium text-[#E8E4DD] transition-premium hover:border-[#D4A853]/45 hover:bg-[#D4A853]/[0.06]"
              >
                Explore the systems
                <ArrowUpRight
                  size={15}
                  weight="bold"
                  className="text-[#D4A853] transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>

          <div className="animate-fade-up stagger-3 md:col-span-3 md:col-start-10">
            <div className="rounded-[28px] border border-white/[0.08] bg-[#0D0D0C]/80 p-2 shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
              <div className="rounded-[22px] border border-[#D4A853]/10 bg-[#11110F] p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-600">
                  The operating thesis
                </p>
                <p className="mt-5 text-xl font-semibold leading-snug tracking-tight text-[#E8E4DD]">
                  One serious operator can now move with the capacity of a
                  company.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-neutral-500">
                  The advantage is not more AI. It is better systems, clearer
                  ownership, and proof that the work actually shipped.
                </p>
                <Link
                  href="#thesis"
                  className="mt-7 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#D4A853]"
                >
                  The Of One idea
                  <ArrowUpRight size={12} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#1E1E1E] px-6 py-8 md:px-12">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 sm:grid-cols-3">
          {proofPoints.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 90}>
              <div className="flex items-baseline gap-3 sm:block">
                <p className="font-mono text-3xl font-semibold tracking-tight text-[#D4A853] md:text-4xl">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{item.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="thesis" className="scroll-mt-28 px-6 py-24 md:px-12 md:py-36">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <ScrollReveal className="md:col-span-3">
            <p className="eyebrow text-[#D4A853]">The thesis</p>
          </ScrollReveal>
          <ScrollReveal delay={100} className="md:col-span-7 md:col-start-5">
            <h2 className="max-w-[15ch] font-editorial text-4xl font-medium leading-[0.98] tracking-[-0.035em] text-[#E8E4DD] md:text-6xl">
              The era of leverage is becoming the era of one.
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-neutral-400">
              <p>
                AI gives one capable person reach that used to require layers of
                staff, agencies, and handoffs. But raw capability is not the
                same as a working company.
              </p>
              <p>
                I build the missing operating layer: context, specialized
                agents, permissions, workflows, human judgment, and visible
                proof. The result is not a louder demo. It is a smaller,
                faster, more accountable way to build.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[24px] border border-[#1E1E1E] bg-[#1E1E1E] sm:grid-cols-3">
              {[
                ["Context", "The system knows the company and the work."],
                ["Execution", "The system carries work across real tools."],
                ["Proof", "The system shows what changed and what remains."],
              ].map(([title, copy]) => (
                <div key={title} className="bg-[#0E0E0E] p-6">
                  <p className="text-sm font-semibold text-[#E8E4DD]">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider variant="metatron" className="my-0" />

      <section id="work" className="scroll-mt-28 px-6 py-24 md:px-12 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal>
            <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <p className="eyebrow mb-4 text-[#D4A853]">Selected systems</p>
                <h2 className="max-w-[12ch] font-editorial text-4xl font-medium leading-[0.96] tracking-[-0.035em] text-[#E8E4DD] md:text-6xl">
                  The thesis, made concrete.
                </h2>
              </div>
              <p className="max-w-[48ch] text-sm leading-relaxed text-neutral-500 md:col-span-4 md:col-start-9">
                Companies, platforms, and public working notes built around the
                same idea: AI matters when it carries accountable work.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <ScrollReveal className="md:col-span-7">
              <a
                href="https://www.utlyze.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full rounded-[30px] border border-[#D4A853]/20 bg-[#11100D] p-2 transition-premium hover:border-[#D4A853]/40"
              >
                <div className="flex h-full min-h-[360px] flex-col justify-between rounded-[24px] border border-white/[0.06] bg-[radial-gradient(circle_at_75%_20%,rgba(212,168,83,0.11),transparent_32%),#121210] p-8 md:p-11">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[#D4A853]">
                        Founder · Active
                      </p>
                      <h3 className="mt-5 text-4xl font-bold tracking-tighter text-[#E8E4DD] md:text-5xl">
                        Utlyze
                      </h3>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A853]/20 bg-[#D4A853]/[0.06] text-[#D4A853] transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight size={17} weight="bold" />
                    </span>
                  </div>
                  <div>
                    <p className="max-w-[46ch] text-xl leading-relaxed text-neutral-300">
                      The AI accelerator lab behind the Of One thesis—a digital
                      workforce for research, product, growth, and operations.
                    </p>
                    <p className="mt-6 text-sm leading-relaxed text-neutral-600">
                      Turning solo operators into AI-native builders who can
                      carry company-scale work with smaller, better systems.
                    </p>
                  </div>
                </div>
              </a>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-6 md:col-span-5">
              <ScrollReveal delay={100}>
                <a
                  href="https://www.newreward.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-[28px] border border-[#1E1E1E] bg-[#101010] p-8 transition-premium hover:border-[#D4A853]/30 md:p-9"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">
                        Platform · Shipping
                      </p>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#E8E4DD]">
                        New Reward
                      </h3>
                    </div>
                    <ArrowUpRight
                      size={16}
                      weight="bold"
                      className="text-[#D4A853] transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-neutral-500">
                    Brand SEO and AI visibility with execution built in—score
                    the gap, ship the fix, and preserve the proof.
                  </p>
                </a>
              </ScrollReveal>

              <ScrollReveal delay={180}>
                <Link
                  href="/manuscript"
                  className="group block rounded-[28px] border border-[#1E1E1E] bg-[#101010] p-8 transition-premium hover:border-[#D4A853]/30 md:p-9"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">
                        Field notes · Open
                      </p>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#E8E4DD]">
                        The Alchemist&apos;s Library
                      </h3>
                    </div>
                    <ArrowUpRight
                      size={16}
                      weight="bold"
                      className="text-[#D4A853] transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-neutral-500">
                    The public record of tools, methods, experiments, and
                    practical guides behind the systems.
                  </p>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider variant="hexline" className="my-0" />

      <section className="px-6 py-24 md:px-12 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal>
            <p className="eyebrow mb-4 text-[#D4A853]">What I build</p>
            <h2 className="mb-14 max-w-[13ch] font-editorial text-4xl font-medium leading-[0.96] tracking-[-0.035em] text-[#E8E4DD] md:text-6xl">
              Systems that carry real weight.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[28px] border border-[#1E1E1E] bg-[#1E1E1E] md:grid-cols-2">
            {systems.map((system, index) => (
              <ScrollReveal key={system.title} delay={index * 80}>
                <div className="group h-full bg-[#0B0B0B] p-8 transition-premium hover:bg-[#10100F] md:p-10">
                  <div className="flex items-start gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#D4A853]/15 bg-[#D4A853]/[0.04] text-[#D4A853] transition-premium group-hover:border-[#D4A853]/30 group-hover:bg-[#D4A853]/[0.08]">
                      <system.icon size={21} weight="light" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-[#E8E4DD]">
                        {system.title}
                      </h3>
                      <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-neutral-500 transition-premium group-hover:text-neutral-400">
                        {system.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="vesica" className="my-0" />

      <section id="library" className="scroll-mt-28 px-6 py-24 md:px-12 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal>
            <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <p className="eyebrow mb-4 text-[#D4A853]">The library</p>
                <h2 className="max-w-[14ch] font-editorial text-4xl font-medium leading-[0.96] tracking-[-0.035em] text-[#E8E4DD] md:text-6xl">
                  Learn the system behind the work.
                </h2>
              </div>
              <p className="max-w-[48ch] text-sm leading-relaxed text-neutral-500 md:col-span-4 md:col-start-9">
                Alchemy remains the editorial language: experiment honestly,
                keep what works, and make the method available to others.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {library.map((item, index) => {
              const Icon = item.icon;
              const span =
                index === 0
                  ? "md:col-span-5"
                  : index === 1
                    ? "md:col-span-4"
                    : "md:col-span-3";

              return (
                <ScrollReveal key={item.href} delay={index * 90} className={span}>
                  <Link
                    href={item.href}
                    className="group flex h-full min-h-[330px] flex-col rounded-[26px] border border-[#1E1E1E] bg-[#101010] p-8 transition-premium hover:-translate-y-1 hover:border-[#D4A853]/30 md:p-9"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs text-neutral-700">
                        {item.number}
                      </span>
                      <Icon
                        size={24}
                        weight="light"
                        className="text-neutral-700 transition-premium group-hover:text-[#D4A853]"
                      />
                    </div>
                    <div className="mt-auto pt-16">
                      <h3 className="text-2xl font-semibold tracking-tight text-[#E8E4DD] transition-premium group-hover:text-[#D4A853]">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-neutral-500">
                        {item.description}
                      </p>
                      <span className="mt-7 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#D4A853]">
                        Start here
                        <ArrowUpRight
                          size={12}
                          weight="bold"
                          className="transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 pt-10 md:px-12 md:pb-36">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[34px] border border-[#D4A853]/20 bg-[#11100D] p-2">
              <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] px-7 py-12 md:px-14 md:py-16">
                <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#D4A853]/[0.09] blur-3xl" />
                <div className="relative grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
                  <div className="md:col-span-8">
                    <div className="mb-5 flex items-center gap-3 text-[#D4A853]">
                      <Lightning size={16} weight="fill" />
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em]">
                        Work with James
                      </p>
                    </div>
                    <h2 className="max-w-[13ch] font-editorial text-4xl font-medium leading-[0.96] tracking-[-0.035em] text-[#E8E4DD] md:text-6xl">
                      Bring me a real operating problem.
                    </h2>
                    <p className="mt-6 max-w-[58ch] leading-relaxed text-neutral-400">
                      Tell me what is stuck, what the system touches, and what a
                      useful outcome looks like. We&apos;ll determine where AI
                      creates leverage—and what it takes to ship responsibly.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 md:col-span-3 md:col-start-10">
                    <Link
                      href="/contact"
                      className="group inline-flex items-center justify-between rounded-full bg-[#D4A853] px-6 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-premium hover:bg-[#E5C87A]"
                    >
                      Send the context
                      <ArrowUpRight
                        size={15}
                        weight="bold"
                        className="transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-between rounded-full border border-[#D4A853]/25 px-6 py-3.5 text-sm font-medium text-[#E8E4DD] transition-premium hover:border-[#D4A853]/45 hover:bg-[#D4A853]/[0.05]"
                    >
                      Book 20 minutes
                      <ArrowUpRight
                        size={15}
                        weight="bold"
                        className="text-[#D4A853] transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
