import type { OfferEntry } from "@/lib/content/types";

/*
 * A NAMED OPTION, AND WHERE IT STOPS.
 *
 * Vuplicity is named on this site under one owner ruling (2026-08-12): as a way to work with James, on this offer
 * and the Work-with-me hub, and nowhere else. It is never linked to his other work: no case study, no industry list
 * and no other offer connects them, and this page says nothing about how the checks are built or marketed.
 *
 * SOURCES. Every fact below comes from www.vuplicity.com, recaptured on 2026-09-27 over plain HTTP (each page
 * returned 200), and each is the page's own title, its own description, or its own visible text:
 *
 *   /            title     "Vuplicity — The agent-first background check company"
 *                meta      "Background checks your AI agents can run. MCP and API access, consent and FCRA workflows
 *                           built in, the same data sources the big providers use" (then a price, not copied here)
 *                text      "Gets a secure link to review the disclosure and give consent on their phone";
 *                          "County and state courts, federal courts, a national criminal database, sex offender
 *                          registries and global watchlists — depending on the package"; "Hiring decisions stay
 *                          with you"; "Guidance, not legal advice. Vuplicity isn't a law firm"
 *   /pricing     title     "Background Check Pricing | Vuplicity"; Basic, Essential, Complete and monitoring;
 *                          "Package prices are not an all-in quote"
 *   /offerings   title     "Background Screening Offerings | Vuplicity"; "One hosted flow: Disclosure, consent,
 *                          candidate intake, and need-info loops stay in the same screening session"
 *   /security    title     "Security and Compliance Overview | Vuplicity"; access and roles, audit trail
 *                          ("Candidate state, source activity, and release decisions remain reviewable"), privacy
 *                          handling, review support
 *   /faq         title     "Background Screening FAQ | Vuplicity"; "Reports are released only after terminal source
 *                          outcomes and compliance filtering gates are satisfied"; new organizations "begin on public
 *                          package pricing"
 *
 * What changed on that date: in August the home page's title was about nationwide screening with clear pricing;
 * today Vuplicity calls itself the agent-first background check company, and this page follows its words.
 *
 * Its prices are Vuplicity's and are not copied here: the page links to them, so none can go stale on this site.
 *
 * JAMES'S ROLE. Unstated on purpose. The ruling names Vuplicity as a path a visitor can take, not a title or an
 * ownership claim, and neither exists in a public source. The body carries that as a pending mark, and
 * `publicNotes` renders it to a buyer as a statement of absence.
 */
export const entry: OfferEntry = {
  collection: "offers",
  slug: "background-screening",
  title: "Background checks for your hires, run by Vuplicity",
  kicker: "For an employer with people to hire",
  capsuleQuestion: "Who runs the background checks, and what does starting one here involve?",
  answerCapsule:
    "Background screening means checking a person's record before hiring them, and the checks behind this page are run by Vuplicity. Vuplicity's own site calls it \"The agent-first background check company\": checks that AI agents or hiring teams can order, with consent and FCRA workflows built in and its package prices published. An enquiry started here reaches James Brady, and Vuplicity delivers the screening under its own terms. The hiring decision stays with the employer.",
  summary:
    "Background checks for hiring, run by Vuplicity on its own published packages and prices, with candidate consent and FCRA workflows built in.",
  datePublished: "2026-08-12",
  dateModified: "2026-09-27",
  entities: ["person:james"],
  deliveredBy: {
    name: "Vuplicity",
    url: "https://www.vuplicity.com",
    role: "the background check company that runs the checks, on its own published prices",
  },
  audience: [
    "Employers with people to hire",
    "Teams whose AI agents already source, screen and schedule",
    "Hiring teams who want the price before a sales call",
    "Teams that need the check inside their ATS or HRIS",
  ],
  steps: [
    {
      label: "Order the check",
      detail:
        "A hiring team starts a check on Vuplicity's site, or an AI agent orders one through its API, in sandbox mode first if it wants.",
    },
    {
      label: "The candidate consents",
      detail:
        "The candidate gets a secure link to review the disclosure and give consent on their phone, so sensitive details never pass through anyone's chat.",
    },
    {
      label: "The sources are searched",
      detail:
        "County and state courts, federal courts, a national criminal database, sex offender registries and global watchlists, depending on the package.",
    },
    {
      label: "The report comes back, and you decide",
      detail:
        "The report lands in the employer's portal. Vuplicity releases it only after the sources have returned and its compliance checks are satisfied, and the hiring decision stays with the employer.",
    },
  ],
  deliverables: [
    {
      label: "A price you can read before you ask",
      detail:
        "Vuplicity publishes its package prices on its own pricing page, and says they are not an all-in quote: court and data-access fees can vary by jurisdiction.",
    },
    {
      label: "A consent record for every candidate",
      detail: "Disclosure, consent and candidate intake stay in one hosted screening session.",
    },
    {
      label: "An audit trail",
      detail: "Vuplicity's security page says candidate state, source activity and release decisions remain reviewable.",
    },
    {
      label: "A route back to a person",
      detail:
        "An enquiry sent from this site reaches James Brady, and Vuplicity delivers the screening. Both halves are stated here, so neither is something you find out afterwards.",
    },
  ],
  price: {
    statement:
      "Vuplicity publishes its package prices on its own pricing page. This page copies none of them, because they are Vuplicity's to change.",
  },
  inquiryType: "background_screening",
  ctaLabel: "Start a screening enquiry",
  proof: [
    {
      label: "Vuplicity, the company that runs the checks",
      url: "https://www.vuplicity.com/",
      method:
        "HTTP GET, returned 200. Its own page title reads \"Vuplicity — The agent-first background check company\", and its description offers background checks AI agents can run, with consent and FCRA workflows built in.",
      capturedAt: "2026-09-27",
    },
    {
      label: "The published package prices",
      url: "https://www.vuplicity.com/pricing",
      method:
        "HTTP GET, returned 200. Titled \"Background Check Pricing\": Basic, Essential and Complete packages and monitoring, with a note that package prices are not an all-in quote.",
      capturedAt: "2026-09-27",
    },
    {
      label: "What the packages contain, and the consent flow",
      url: "https://www.vuplicity.com/offerings",
      method:
        "HTTP GET, returned 200. Titled \"Background Screening Offerings\": three packages, add-ons, motor vehicle reports and monitoring, with disclosure and consent in one hosted flow.",
      capturedAt: "2026-09-27",
    },
    {
      label: "The security and compliance overview",
      url: "https://www.vuplicity.com/security",
      method:
        "HTTP GET, returned 200. Titled \"Security and Compliance Overview\": access and roles, an audit trail, privacy handling and review support.",
      capturedAt: "2026-09-27",
    },
    {
      label: "Common questions, including when a report is released",
      url: "https://www.vuplicity.com/faq",
      method:
        "HTTP GET, returned 200. Titled \"Background Screening FAQ\": reports are released only after the sources return and its compliance gates are satisfied, and Vuplicity gives no legal advice.",
      capturedAt: "2026-09-27",
    },
  ],
  og: {
    image: "/og/default.png",
    imageAlt: "James Brady — background checks for your hires, run by Vuplicity",
  },
  /*
   * BUYER RENDER MODE.
   *
   * One note per gap, in gap order. lib/content/validate.ts fails the build if
   * the counts stop matching. A buyer reading this page sees the absence stated
   * plainly; the owner-facing question stays in the source.
   */
  publicNotes: [
    "James Brady's exact position at Vuplicity, and the date it started, are not published on this site yet. What this page states is that a screening enquiry reaches him and that Vuplicity delivers the work.",
    "No screening volume, turnaround figure or employer outcome is published here either, because none has been measured under a stated method and window.",
  ],
  body: `## What this page is

Hiring someone means trusting a stranger with your customers, your money or your keys. A background check is how that trust gets a foundation under it.

The checks behind this page are run by [Vuplicity](https://www.vuplicity.com). You can start here, and the work is Vuplicity's.

## What Vuplicity says about itself

Everything in this section comes from Vuplicity's public site, read on 27 September 2026. Nothing here is a measurement taken by this site.

Vuplicity calls itself "The agent-first background check company". Its home page describes background checks that AI agents can run, over MCP and an API, with consent and FCRA workflows built in and the same data sources the big providers use. A hiring team can start a check on the site itself, and its questions page says new organizations can begin on the public package prices.

Its pricing page publishes three packages, Basic, Essential and Complete, and a monthly monitoring option, and says the package prices are not an all-in quote, because court and data-access fees vary by jurisdiction. Its offerings page lists the add-ons and keeps disclosure, consent and candidate intake in one hosted flow. Its security page covers access and roles, an audit trail, privacy handling and review support. Its questions page says a report is released only after the sources have returned and its compliance checks are satisfied.

## Where the line sits

Vuplicity runs the checks. The employer makes the hiring decision. Vuplicity's own site says so, and says it is not a law firm: its compliance guidance is guidance, not legal advice. This page does not blur either line.

[JAMES: state your exact relationship to Vuplicity in one publishable line, with the date it became true. Title, ownership, operator, adviser, whichever is accurate. Until you supply it, this page says only that a screening enquiry reaches you and that Vuplicity delivers the work.]

[JAMES: is there a screening figure you want published, with its method and window? Volume run, average turnaround, anything measured. Nothing goes on this page until you give the figure and the window it covers.]

## What this page does not claim

No number from any screening engagement appears here: nothing about how fast a check comes back, how many have been run, or what any employer got out of it, because none of those has been measured on this site under a stated method.

The prices are Vuplicity's, and they live on Vuplicity's page. This page links to them rather than copying them, so a price cannot go stale here without going stale there first.`,
};
