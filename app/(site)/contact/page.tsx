import type { Metadata } from "next";

import { JsonLd, PageNameplate, Prose } from "@/components/site/instruments";
import { LeadForm } from "@/components/site/LeadForm";
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

const QUALIFY = `## What makes a strong fit

- A real operating problem, not an AI demo looking for a home.
- Access to the people, the process, or the data the system has to serve.
- A willingness to define what success means before choosing the tools.

## What this is not

If what you want is a headcount replacement, a number to put in a deck, or a system nobody will be allowed to check, we will both have a bad time. The work on this site is built to be inspected. That only pays off if you want it inspected.

[JAMES: what makes someone a strong fit to reach out, in one or two lines, in your words? The three bullets above are carried over from the current site. A real qualification in your voice would be stronger than a generic one.]`;

export default function ContactPage() {
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
            <Prose html={renderMarkdown(QUALIFY)} />
            <p className="form-note">
              Prefer email? <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <PageNameplate
              source="Existing lead gateway"
              method="No figure is printed on this page, so none is derived"
            />
          </div>

          <aside className="article__aside" aria-label="Send an enquiry">
            <LeadForm />
          </aside>
        </div>
      </div>
    </main>
  );
}
