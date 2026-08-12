import type { Metadata } from "next";

import { JsonLd, PageNameplate, Prose } from "@/components/site/instruments";
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
 * visitor with JavaScript off, and "the site is fully usable with JS off" is a
 * brief requirement, not a preference. The cost is that /contact renders per
 * request instead of at build. The canonical, the metadata and the JSON-LD are
 * unaffected.
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
    <main id="main" tabIndex={-1}>
      <JsonLd json={serializeGraph(contactGraph(FAQ))} />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>Contact</span>
            <i aria-hidden="true">/</i>
            <span>{SITE.location}</span>
          </p>
          <h1>Tell me what needs to change.</h1>
          <p className="page-lead">
            A project enquiry reaches James Brady through the same lead gateway the rest
            of the studio uses. Say what needs to change, what makes it difficult, and
            what a useful outcome looks like. The system comes after that, not before.
          </p>
        </div>

        <div className="article">
          <div>
            <Prose
              html={renderMarkdown(contactQualify.body, {
                mode: "public",
                notes: contactQualify.publicNotes,
              })}
            />
            <p className="form-note">
              Prefer email? <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <PageNameplate
              source="Existing lead gateway"
              method="No figure is printed on this page, so none is derived"
            />
          </div>

          <aside className="article__aside" aria-label="Send an enquiry">
            {preselected ? (
              <p className="form-status" role="status">
                Enquiry type set to &ldquo;{HELP_LABEL[preselected]}&rdquo; from the page
                you came from. Change it below if that is not right.
              </p>
            ) : null}
            <LeadForm preselectedHelpType={preselected} />
          </aside>
        </div>
      </div>
    </main>
  );
}
