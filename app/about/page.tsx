import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "About",
  description:
    "James Brady is a founder and AI systems builder creating accountable products, agent operating systems, and human-and-AI workflows.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    number: "01",
    title: "Name the state",
    description:
      "Drafted is not sent. Source-ready is not live. A system becomes trustworthy when it preserves the difference.",
  },
  {
    number: "02",
    title: "Design for the exception",
    description:
      "The happy path is a demo. Production work needs ownership, recovery, escalation, and a human who can intervene.",
  },
  {
    number: "03",
    title: "Keep the evidence attached",
    description:
      "Claims should travel with a source, a freshness signal, and the proof surface that can confirm or refute them.",
  },
];

const work = [
  {
    type: "Company",
    title: "Utlyze",
    description: "An AI-native venture studio and the operating home of the Of One thesis.",
    href: "https://www.utlyze.com",
  },
  {
    type: "Platform",
    title: "New Reward",
    description: "Visibility measurement and execution with the evidence layer kept intact.",
    href: "https://www.newreward.com",
  },
  {
    type: "Open practice",
    title: "The operating library",
    description: "Field notes on agents, skills, systems, and what survives contact with real work.",
    href: "/primer",
  },
];

const socialLinks = [
  { label: "LinkedIn", detail: "/in/jamesbrady1", href: "https://www.linkedin.com/in/jamesbrady1/" },
  { label: "GitHub", detail: "/CryptoJym", href: "https://github.com/CryptoJym" },
  { label: "X", detail: "@h3roai", href: "https://x.com/h3roai" },
  { label: "TikTok", detail: "@h3ro.ai", href: "https://www.tiktok.com/@h3ro.ai" },
  { label: "YouTube", detail: "James Brady", href: "https://www.youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA" },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "James Brady",
      jobTitle: "Founder and AI Systems Builder",
      url: "https://www.jamesbrady.org/about",
      description:
        "Building accountable products, agent operating systems, and human-and-AI workflows.",
      sameAs: socialLinks.map((link) => link.href),
      email: "james@utlyze.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="border-b border-[#CDD3CF] py-16 md:py-24">
        <div className="site-shell grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="evidence-label text-[#B93620]">James Brady</p>
            <h1 className="thesis-display mt-8 max-w-[9ch] text-balance">I build what I am trying to understand.</h1>
          </div>
          <div className="md:col-span-4">
            <p className="text-lg leading-relaxed text-[#5E6864]">
              Founder, systems builder, and exacting optimist about what one
              committed operator can carry with the right tools.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="site-shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="evidence-label text-[#B93620]">The throughline</p>
          </div>
          <div className="md:col-span-7 md:col-start-5">
            <div className="max-w-[66ch] space-y-7 text-lg leading-relaxed text-[#5E6864]">
              <p className="text-xl font-medium leading-relaxed text-[#171A1B] md:text-2xl">
                I work where frontier capability meets operating reality: the
                point where an impressive model either becomes a dependable
                system or falls apart.
              </p>
              <p>
                Through Utlyze, New Reward, and a wider practice of product and
                systems work, I move across the full stack—strategy, agent
                architecture, tools, delivery, growth, and the control plane
                that keeps the work observable.
              </p>
              <p>
                The Of One thesis is not solo-founder mythology. It is an
                operating question: how much useful, accountable work can one
                person carry when specialized labor, durable context, and human
                judgment are assembled into a coherent system?
              </p>
            </div>
            <blockquote className="mt-12 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] md:text-5xl">
              The goal is not more AI. The goal is work that moves—and proof of
              what actually happened.
            </blockquote>
          </div>
        </div>
      </section>

      <section className="border-y border-[#CDD3CF] bg-white py-20 md:py-24">
        <div className="site-shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="evidence-label text-[#B93620]">Operating principles</p>
            <h2 className="section-title mt-5 max-w-[9ch] text-balance">Trust is a systems property.</h2>
          </div>
          <div className="border-b border-[#CDD3CF] md:col-span-7 md:col-start-6">
            {principles.map((principle) => (
              <article key={principle.number} className="grid gap-5 border-t border-[#CDD3CF] py-7 sm:grid-cols-[3rem_1fr]">
                <p className="evidence-label text-[#B93620]">{principle.number}</p>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.025em]">{principle.title}</h3>
                  <p className="mt-3 max-w-[58ch] leading-relaxed text-[#5E6864]">{principle.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="site-shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="evidence-label text-[#B93620]">Current work</p>
              <h2 className="section-title mt-5 max-w-[10ch] text-balance">The thesis has places to live.</h2>
            </div>
            <p className="max-w-[50ch] leading-relaxed text-[#5E6864] md:col-span-4 md:col-start-9">
              Public surfaces are linked directly. They are the best way to see
              the difference between a positioning statement and an operating practice.
            </p>
          </div>
          <div className="mt-14 border-b border-[#CDD3CF]">
            {work.map((item) => {
              const external = item.href.startsWith("http");
              const row = (
                <>
                  <p className="evidence-label text-[#B93620]">{item.type}</p>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.035em]">{item.title}</h3>
                    <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-[#5E6864]">{item.description}</p>
                  </div>
                  <ArrowUpRight size={15} weight="bold" />
                </>
              );
              const classes = "group grid gap-5 border-t border-[#CDD3CF] py-7 transition-colors hover:text-[#B93620] md:grid-cols-[10rem_1fr_auto] md:items-center";

              return external ? (
                <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className={classes}>
                  {row}
                </a>
              ) : (
                <Link key={item.title} href={item.href} className={classes}>
                  {row}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#171A1B] py-20 text-white md:py-24">
        <div className="site-shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="evidence-label text-[#E66C55]">Find James</p>
            <h2 className="section-title mt-5 max-w-[9ch] text-balance">Follow the work, not a content persona.</h2>
            <p className="mt-7 max-w-[48ch] leading-relaxed text-[#A5AEAA]">
              Different channels carry different parts of the practice. The
              canonical project conversation still starts here.
            </p>
            <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-[6px] bg-white px-5 font-mono text-xs font-semibold text-[#171A1B] transition-colors hover:bg-[#E66C55] hover:text-white">
              Talk with James
              <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>
          <div className="border-b border-[#4B5350] md:col-span-6 md:col-start-7">
            {socialLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[1fr_auto] items-center border-t border-[#4B5350] py-5 transition-colors hover:text-[#E66C55]">
                <div>
                  <p className="font-semibold">{link.label}</p>
                  <p className="evidence-label mt-1 text-[#8F9994]">{link.detail}</p>
                </div>
                <ArrowUpRight size={15} weight="bold" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
