import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/ContactForm";

const bookingUrl =
  "https://www.utlyze.com/booking?utm_source=jamesbrady.org&utm_medium=referral&utm_campaign=personal-site-contact";

export const metadata: Metadata = {
  title: "Work with James",
  description:
    "Start a direct conversation with James Brady about AI strategy, agent architecture, production systems, speaking, or partnerships.",
  alternates: { canonical: "/contact" },
};

const fitSignals = [
  "A real operating problem—not a demo looking for a home.",
  "Access to the people, process, or data the system must serve.",
  "A willingness to define success before choosing the tools.",
];

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Work with James Brady",
    url: "https://www.jamesbrady.org/contact",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="border-b border-[#CDD3CF] py-16 md:py-24">
        <div className="site-shell grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="evidence-label text-[#B93620]">Work with James</p>
            <h1 className="thesis-display mt-8 max-w-[10ch] text-balance">Bring the real operating problem.</h1>
          </div>
          <p className="max-w-[46ch] text-lg leading-relaxed text-[#5E6864] md:col-span-4">
            This is a working conversation, not a funnel. Start with what needs
            to change and what makes it difficult.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="site-shell grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="evidence-label text-[#B93620]">Strong fit</p>
            <div className="mt-6 border-b border-[#CDD3CF]">
              {fitSignals.map((signal) => (
                <div key={signal} className="flex items-start gap-3 border-t border-[#CDD3CF] py-5">
                  <Check size={15} weight="bold" className="mt-1 shrink-0 text-[#B93620]" />
                  <p className="text-sm leading-relaxed text-[#5E6864]">{signal}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-[#171A1B] pt-6">
              <p className="text-sm font-semibold">Prefer another path?</p>
              <Link href="mailto:james@utlyze.com" className="text-link mt-3 inline-flex items-center gap-2 text-sm">
                james@utlyze.com
                <ArrowUpRight size={13} weight="bold" />
              </Link>
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-link mt-3 flex w-fit items-center gap-2 text-sm">
                Book 20 minutes
                <ArrowUpRight size={13} weight="bold" />
              </a>
            </div>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <ContactForm source="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
