import type { Metadata } from "next";

import { JsonLd, Prose } from "@/components/site/instruments";
import { LeadForm } from "@/components/site/LeadForm";
import { contactQualify } from "@/content/site";
import { HELP_LABEL, INQUIRY_PARAM, parseHelpType } from "@/lib/contact";
import { renderMarkdown } from "@/lib/content/markdown";
import { contactGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact",
  description:
    "What makes a project a strong fit, and a direct line to James Brady through the existing lead gateway.",
  og: { image: "/og/default.png", imageAlt: "James Brady — contact" },
});

/**
 * The questions this page answers, once. They render on the page AND as the FAQPage node in the graph, because
 * FAQPage belongs only where the route shows its questions and answers (geo-seo-spec §2.3).
 */
const FAQ = [
  {
    question: "What makes someone a strong fit to reach out?",
    answer:
      "A real operating problem rather than an AI demo looking for a home; access to the people, process or data the system has to serve; and a willingness to define what success means before choosing the tools.",
  },
  {
    question: "What happens after I send this?",
    answer:
      "The form posts to the existing lead gateway. If the gateway is unavailable the page says so on screen and gives you the email address instead. It never reports success it has not earned.",
  },
];

/**
 * PRESELECTING THE ENQUIRY TYPE.
 *
 * The offer pages link here with `?inquiry=<type>`, and the form arrives with
 * that type already chosen. Reading it on the SERVER, rather than with
 * useSearchParams in the form component, is a deliberate call: the client hook
 * forces a statically-rendered page to fall back to a Suspense boundary, which
 * would take the whole enquiry form out of the server response. A contact form
 * that only exists after hydration is a contact form that does not exist for a
 * visitor with JavaScript off. The cost is that /contact renders per request
 * instead of at build.
 *
 * Because it renders per request, this page lives in a running server, and the
 * server loads the content collections (lib/content) whatever route is asked
 * for, so their /now staleness gate runs here too. The gate throws in a build
 * and only warns in a running server (isLiveRequest in lib/content/validate.ts);
 * on 2026-09-27 the throw took this page down once /now passed 42 days. Keep
 * that split: a stale /now must fail the build, never this page.
 *
 * An unknown or absent value selects nothing, exactly as before.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params[INQUIRY_PARAM];
  const preselected = parseHelpType(Array.isArray(raw) ? raw[0] : raw);

  return (
    <main id="main" tabIndex={-1} className="fg-page fgb">
      <JsonLd json={serializeGraph(contactGraph(FAQ))} />

      <header className="fg-page__head">
        <p className="fg-eyebrow">Write to him</p>
        <h1 className="fg-h1">Tell him what needs to change.</h1>
        <p className="fg-p">
          A note sent from this page reaches James Brady through the same lead gateway Utlyze uses. Say what needs to
          change, what makes it hard, and what a useful outcome looks like. The system comes after that, not before.
        </p>
      </header>

      <div className="fgb-contact">
        <div className="fgb-contact__form">
          {preselected ? (
            <p className="fgb-status" role="status">
              Enquiry type set to &ldquo;{HELP_LABEL[preselected]}&rdquo; from the page you came from. Change it below
              if that is not right.
            </p>
          ) : null}
          <LeadForm preselectedHelpType={preselected} />
          <p className="fgb-mail">
            Prefer email? <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>

        <div className="fgb-contact__side">
          <div className="fgb-prose">
            <Prose html={renderMarkdown(contactQualify.body, { mode: "public", notes: contactQualify.publicNotes })} />
          </div>
          <section className="fgb-faq" aria-labelledby="before">
            <h2 id="before">Before you write</h2>
            {FAQ.map((f) => (
              <div key={f.question} className="fgb-faq__item">
                <h3>{f.question}</h3>
                <p>{f.answer}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
