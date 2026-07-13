import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/ContactForm";

const proofRows = [
  {
    type: "Company",
    state: "Live company site",
    title: "Utlyze",
    claim: "An AI-native venture studio built around smaller, accountable operating systems.",
    href: "https://www.utlyze.com",
    external: true,
  },
  {
    type: "Platform",
    state: "Live platform site",
    title: "New Reward",
    claim: "A system for measuring visibility, shipping the work, and preserving the evidence.",
    href: "https://www.newreward.com",
    external: true,
  },
  {
    type: "Open field notes",
    state: "Published here",
    title: "The operating library",
    claim: "Plain-language guides to agents, skills, tools, and the systems that connect them.",
    href: "/primer",
    external: false,
  },
];

const buildRows = [
  {
    number: "01",
    title: "AI-native products",
    description:
      "Products designed around what models, tools, and agents make possible now—not legacy software with a chat box attached.",
  },
  {
    number: "02",
    title: "Agent operating systems",
    description:
      "Bounded agents, durable context, clear permissions, and routing that can carry work across real business tools.",
  },
  {
    number: "03",
    title: "Human-and-AI workflows",
    description:
      "Operating loops with an explicit owner, review points, recovery paths, and a next action that survives the handoff.",
  },
  {
    number: "04",
    title: "Proof infrastructure",
    description:
      "Control planes and evidence surfaces that keep source, delivery, provider state, and actual impact from being confused.",
  },
];

const libraryRows = [
  {
    index: "I",
    title: "The Primer",
    description: "Code, stacks, agents, skills, and MCP—explained without the jargon theater.",
    href: "/primer",
  },
  {
    index: "II",
    title: "The Manuscript",
    description: "A working catalog of tools and methods that have earned a place in the system.",
    href: "/manuscript",
  },
  {
    index: "III",
    title: "The Workshop",
    description: "Practical guides for turning one useful AI behavior into a repeatable operator loop.",
    href: "/workshop",
  },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "James Brady",
        url: "https://www.jamesbrady.org",
        description:
          "James Brady builds the operating layer between AI capability and accountable work.",
      },
      {
        "@type": "Person",
        name: "James Brady",
        jobTitle: "Founder and AI Systems Builder",
        url: "https://www.jamesbrady.org/about",
        worksFor: [
          { "@type": "Organization", name: "Utlyze", url: "https://www.utlyze.com" },
          { "@type": "Organization", name: "New Reward", url: "https://www.newreward.com" },
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

      <section className="border-b border-[#CDD3CF]">
        <div className="site-shell grid min-h-[calc(100dvh-72px)] gap-16 py-16 md:grid-cols-12 md:items-center md:py-24">
          <div className="animate-fade-up md:col-span-7">
            <p className="evidence-label flex items-center gap-3 text-[#5E6864]">
              <span className="h-2 w-2 rounded-full bg-[#D94A2E]" aria-hidden />
              James Brady · Founder and systems builder
            </p>
            <h1 className="thesis-display mt-10 max-w-[10ch] text-balance">
              One capable operator can now move like a company.
            </h1>
            <p className="mt-9 max-w-[58ch] text-lg leading-relaxed text-[#5E6864] md:text-xl">
              I build the operating layer between AI capability and accountable
              work: products, agents, workflows, and proof that survive the
              demo.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#work" className="button-primary">
                See the proof
                <ArrowUpRight size={14} weight="bold" />
              </Link>
              <Link href="/contact" className="button-secondary">
                Start a conversation
                <ArrowUpRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          <aside
            className="animate-fade-up stagger-2 border-y border-[#171A1B] md:col-span-4 md:col-start-9"
            aria-label="The Of One operating thesis"
          >
            <div className="flex items-center justify-between py-4">
              <p className="evidence-label">The working thesis</p>
              <p className="evidence-label text-[#B93620]">Of One / v1</p>
            </div>
            <ol>
              {[
                ["Context", "The system knows the company and the work."],
                ["Labor", "Agents carry bounded tasks across real tools."],
                ["Judgment", "A human owns the decision and the exception."],
                ["Proof", "The state, source, and next action stay visible."],
              ].map(([title, description], index) => (
                <li
                  key={title}
                  className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[#CDD3CF] py-5"
                >
                  <span className="evidence-label text-[#B93620]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-semibold tracking-[-0.02em]">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#5E6864]">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section id="work" className="scroll-mt-24 py-20 md:py-28">
        <div className="site-shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="evidence-label text-[#B93620]">Selected proof</p>
              <h2 className="section-title mt-5 max-w-[12ch] text-balance">
                The work is the credential.
              </h2>
            </div>
            <p className="max-w-[52ch] text-base leading-relaxed text-[#5E6864] md:col-span-4 md:col-start-9">
              No floating metrics and no vague transformation claims. These are
              the public systems where the thesis is being made concrete.
            </p>
          </div>

          <div className="mt-14 border-b border-[#CDD3CF]">
            {proofRows.map((item) => {
              const content = (
                <>
                  <div>
                    <p className="evidence-label text-[#5E6864]">{item.type}</p>
                    <p className="evidence-label mt-2 text-[#B93620]">{item.state}</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-[58ch] leading-relaxed text-[#5E6864]">
                      {item.claim}
                    </p>
                  </div>
                  <span className="evidence-label inline-flex items-center gap-2 md:justify-self-end">
                    Open proof
                    <ArrowUpRight size={13} weight="bold" />
                  </span>
                </>
              );

              const classes =
                "group grid gap-6 border-t border-[#CDD3CF] py-8 transition-colors duration-150 hover:text-[#B93620] md:grid-cols-[10rem_1fr_auto] md:items-start md:gap-10";

              return item.external ? (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes}
                >
                  {content}
                </a>
              ) : (
                <Link key={item.title} href={item.href} className={classes}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="thesis" className="scroll-mt-20 bg-[#171A1B] py-20 text-white md:py-28">
        <div className="site-shell">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="evidence-label text-[#E66C55]">The Of One thesis</p>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <h2 className="section-title max-w-[13ch] text-balance">
                AI lowers the cost of capability. Systems make it dependable.
              </h2>
              <div className="mt-9 max-w-[66ch] space-y-6 text-lg leading-relaxed text-[#B8C0BC]">
                <p>
                  One person can now reach across research, product, growth, and
                  operations. That does not automatically create a company. Raw
                  capability without context, ownership, and recovery is still
                  just a promising demo.
                </p>
                <p>
                  The operating advantage comes from assembling the missing
                  layer: named agents, durable memory, permissions, review
                  points, and proof of what actually happened.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid border-y border-[#4B5350] md:grid-cols-3">
            {[
              ["Capability", "Models, tools, and specialized labor."],
              ["Operation", "Context, routing, handoffs, and recovery."],
              ["Accountability", "An owner, an observable state, and evidence."],
            ].map(([title, description], index) => (
              <div
                key={title}
                className={`py-7 md:px-7 ${index > 0 ? "border-t border-[#4B5350] md:border-l md:border-t-0" : ""}`}
              >
                <p className="evidence-label text-[#E66C55]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A5AEAA]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="site-shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="evidence-label text-[#B93620]">What I build</p>
            <h2 className="section-title mt-5 max-w-[10ch] text-balance">
              Systems that carry real weight.
            </h2>
          </div>
          <div className="border-b border-[#CDD3CF] md:col-span-7 md:col-start-6">
            {buildRows.map((item) => (
              <article key={item.number} className="grid gap-5 border-t border-[#CDD3CF] py-7 sm:grid-cols-[3rem_1fr]">
                <p className="evidence-label text-[#B93620]">{item.number}</p>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.025em]">{item.title}</h3>
                  <p className="mt-3 max-w-[58ch] leading-relaxed text-[#5E6864]">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="library" className="border-y border-[#CDD3CF] bg-white py-20 md:py-28">
        <div className="site-shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="evidence-label text-[#B93620]">Open library</p>
              <h2 className="section-title mt-5 max-w-[12ch] text-balance">
                The system behind the work.
              </h2>
            </div>
            <p className="max-w-[50ch] leading-relaxed text-[#5E6864] md:col-span-4 md:col-start-9">
              A public record of useful tools, working patterns, and practical
              explanations. Keep what works. Show the method.
            </p>
          </div>

          <div className="mt-14 border-b border-[#CDD3CF]">
            {libraryRows.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group grid gap-5 border-t border-[#CDD3CF] py-7 md:grid-cols-[4rem_15rem_1fr_auto] md:items-center"
              >
                <span className="evidence-label text-[#B93620]">{item.index}</span>
                <h3 className="text-xl font-semibold tracking-[-0.025em] transition-colors group-hover:text-[#B93620]">
                  {item.title}
                </h3>
                <p className="max-w-[58ch] text-sm leading-relaxed text-[#5E6864]">
                  {item.description}
                </p>
                <ArrowUpRight size={16} weight="bold" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="site-shell grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="evidence-label text-[#B93620]">Strong-fit work</p>
            <h2 className="section-title mt-5 max-w-[10ch] text-balance">
              Bring me the real operating problem.
            </h2>
            <p className="mt-7 max-w-[48ch] text-lg leading-relaxed text-[#5E6864]">
              Tell me what is stuck, what the system touches, and what a useful
              outcome looks like. We will start with the work—not the AI pitch.
            </p>
            <p className="mt-8 max-w-[46ch] border-t border-[#CDD3CF] pt-6 text-sm leading-relaxed text-[#5E6864]">
              This goes directly into the Utlyze lead system. No mailing list.
              Replies come from james@utlyze.com.
            </p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <ContactForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
