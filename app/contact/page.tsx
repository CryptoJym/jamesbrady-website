import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/ContactForm";
import SectionDivider from "@/components/SectionDivider";

const bookingUrl =
  "https://www.utlyze.com/booking?utm_source=jamesbrady.org&utm_medium=referral&utm_campaign=personal-site-contact";

export const metadata: Metadata = {
  title: "Work with James",
  description:
    "Start a direct conversation with James Brady about AI strategy, agent architecture, production systems, integrations, speaking, or partnerships.",
  alternates: {
    canonical: "/contact",
  },
};

const fitSignals = [
  "A real operating problem—not an AI demo looking for a home",
  "Access to the people, process, or data the system must serve",
  "A willingness to define success before choosing the tools",
];

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Work with James Brady",
    url: "https://www.jamesbrady.org/contact",
    description:
      "Direct project inquiries for AI strategy, agent architecture, production systems, integrations, speaking, and partnerships.",
    mainEntity: {
      "@type": "Person",
      name: "James Brady",
      jobTitle: "Founder and AI Systems Builder",
      email: "james@utlyze.com",
      url: "https://www.jamesbrady.org",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="px-6 pb-16 pt-28 md:px-12 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-12">
            <div className="animate-fade-up md:col-span-5">
              <span className="eyebrow mb-7 inline-block text-[#D4A853]">
                Work with James
              </span>
              <h1 className="max-w-[8ch] font-editorial text-5xl font-medium leading-[0.92] tracking-[-0.035em] text-[#E8E4DD] md:text-7xl lg:text-8xl">
                Build the right system.
              </h1>
              <div className="my-8 h-px w-24 bg-[#D4A853] animate-gold-line" />
              <p className="max-w-[46ch] text-lg leading-relaxed text-neutral-400 md:text-xl">
                Tell me what needs to change, what makes it difficult, and what
                a useful outcome looks like. We&apos;ll start with the system—not
                the hype.
              </p>

              <div className="mt-10 space-y-4 border-t border-[#1E1E1E] pt-8">
                <p className="eyebrow text-neutral-600">Strong fit</p>
                {fitSignals.map((signal) => (
                  <div key={signal} className="flex items-start gap-3">
                    <Check
                      size={15}
                      weight="bold"
                      className="mt-1 shrink-0 text-[#D4A853]"
                    />
                    <p className="text-sm leading-relaxed text-neutral-500">
                      {signal}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-10 text-sm leading-relaxed text-neutral-600">
                Prefer email?{" "}
                <Link
                  href="mailto:james@utlyze.com"
                  className="group inline-flex items-center gap-1.5 text-neutral-400 transition-premium hover:text-[#D4A853]"
                >
                  james@utlyze.com
                  <ArrowUpRight size={12} weight="bold" />
                </Link>
              </p>

              <div className="mt-8 rounded-[22px] border border-[#D4A853]/15 bg-[#11100D] p-5">
                <p className="text-sm font-medium text-[#E8E4DD]">
                  Ready to put time on the calendar?
                </p>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-3 inline-flex items-center gap-2 text-sm text-[#D4A853] transition-premium hover:text-[#E5C87A]"
                >
                  Book 20 minutes with James
                  <ArrowUpRight
                    size={12}
                    weight="bold"
                    className="transition-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>

            <div className="animate-fade-up stagger-2 md:col-span-6 md:col-start-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <SectionDivider variant="metatron" className="my-6" />
    </>
  );
}
