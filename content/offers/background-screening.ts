import type { OfferEntry } from "@/lib/content/types";

/*
 * THE NAMED-CLIENT EXCEPTION, AND WHERE IT STOPS.
 *
 * Every other client on this site is anonymized by the 2026-08-11 policy:
 * industries are named, companies are not. This entry names Vuplicity, under a
 * single owner ruling made on 2026-08-12 ("list Vuplicity as an option too,
 * where they can work with me"). The ruling covers THIS OFFER SURFACE and
 * nothing else. /work/visibility-platform stays anonymized, the industries
 * list on /work-with-me/get-found stays an industries list, and no other page
 * gains a client name from this change. The CLIENT_DENYLIST secret was updated
 * the same day so the confidentiality gate permits the name here.
 *
 * SOURCES. Same discipline as content/work/seopr1.ts: nothing on this page
 * describes Vuplicity from memory or from an internal record. Every fact below
 * came from www.vuplicity.com on 2026-08-12, read over plain HTTP, and each is
 * either the page's own <title>, its own <meta name="description">, its own
 * JSON-LD Organization node, or a URL in its own sitemap.xml. Captured exactly:
 *
 *   /            <title>   "Nationwide background screening with clear pricing
 *                           and cleaner workflows | Vuplicity"
 *   /            <meta>    "Vuplicity helps hiring teams run nationwide
 *                           background screening with transparent pricing,
 *                           compliant workflows, and a direct path from
 *                           self-serve setup to guided rollout."
 *   /            JSON-LD   Organization "Vuplicity", url www.vuplicity.com,
 *                           support and privacy contact points.
 *   /pricing     <title>   "Background Check Pricing | Vuplicity"
 *   /pricing     <meta>    "Compare Vuplicity Basic, Essential, and Complete
 *                           background screening packages with clear public
 *                           package pricing and add-on guidance."
 *   /offerings   <meta>    "Review Vuplicity screening packages, add-ons,
 *                           monitoring options, candidate consent workflows,
 *                           and report release controls for hiring teams."
 *   /security    <meta>    "See how Vuplicity handles screening workflow
 *                           controls, audit trails, candidate consent, and
 *                           report release boundaries for hiring teams."
 *   /faq         <meta>    "Answers to common Vuplicity questions about
 *                           background screening packages, pricing, candidate
 *                           consent, report timing, and employer decision
 *                           boundaries."
 *   /sitemap.xml            lists /, /offerings, /pricing, /security, /faq,
 *                           /book-now, /developers, /privacy, /terms and
 *                           /fcra-rights.
 *
 * DELIBERATELY NOT USED. The same HTML also carries two JSON-LD blocks tagged
 * `data-newrewards-edge`, which are injected by the agency's edge layer rather
 * than authored by Vuplicity. They are on the public page, so they are public,
 * but their provenance is this side of the relationship, and a page that
 * quotes its own supplier's output back as the client's statement is quoting
 * itself. Their extra facts (a Lehi address, international checks, ATS
 * integrations) are therefore absent here rather than softened.
 *
 * JAMES'S ROLE. Unstated on purpose. The ruling authorises naming Vuplicity as
 * a path a visitor can take, not a title or an ownership claim, and neither
 * exists in a public source. The body carries that as a pending mark, and
 * `publicNotes` renders it to a buyer as a statement of absence.
 */
export const entry: OfferEntry = {
  collection: "offers",
  slug: "background-screening",
  title: "Background screening for your hires, done clearly",
  kicker: "For an employer with people to hire",
  capsuleQuestion: "Who runs the background checks, and what does starting one here involve?",
  answerCapsule:
    "Background screening means checking a person's record before hiring them, and the checks behind this page are run by Vuplicity. Vuplicity's public site describes nationwide background screening with clear pricing and cleaner workflows, publishes packages named Basic, Essential and Complete, and keeps separate pages for security, candidate consent and common questions. An enquiry started here reaches James Brady, and Vuplicity delivers the screening under its own published terms. No screening figure from any employer is published on this site.",
  summary:
    "Background checks for hiring, run by Vuplicity on its own published packages and pricing, with the enquiry starting here.",
  datePublished: "2026-08-12",
  dateModified: "2026-08-12",
  entities: ["person:james"],
  deliveredBy: {
    name: "Vuplicity",
    url: "https://www.vuplicity.com",
    role: "the background screening company that runs the checks, on its own published pricing",
  },
  audience: [
    "Employers hiring in more than one state",
    "Small teams with no screening process yet",
    "Operations and HR leads who own onboarding",
    "Staffing and contract firms placing people",
    "Anyone who has been quoted for screening and could not tell what was in the price",
  ],
  steps: [
    {
      label: "Say what you are hiring for",
      detail:
        "The enquiry form on this site is the same one every other engagement uses, and this page's button arrives with the screening enquiry type already selected. Roles, volume and where you hire are the three things that decide everything after this.",
    },
    {
      label: "Pick a package from published prices",
      detail:
        "Vuplicity's pricing page is public and names three packages, Basic, Essential and Complete, with add-on guidance beside them. You can read the prices before anyone speaks to you, which is the part of screening that usually requires a call.",
    },
    {
      label: "Candidates consent, then the check runs",
      detail:
        "Vuplicity's offerings page describes candidate consent workflows as part of the product rather than as paperwork you chase. Its frequently-asked-questions page covers consent and report timing.",
    },
    {
      label: "Reports come back under release controls",
      detail:
        "Vuplicity's security page describes screening workflow controls, audit trails and report release boundaries. Who may see a report, and when, is a setting rather than an understanding.",
    },
  ],
  deliverables: [
    {
      label: "A price you could read before you asked",
      detail:
        "Vuplicity publishes package pricing on a public page. Nothing on this site quotes a figure for it, because the figure belongs to Vuplicity and it can change without this page hearing about it.",
    },
    {
      label: "A consent record for every candidate",
      detail:
        "Candidate intake and consent are described on Vuplicity's own offerings page as part of the screening workflow.",
    },
    {
      label: "Reports with release boundaries around them",
      detail:
        "Vuplicity's security overview names report release controls and audit trails. The employer decision itself stays with the employer; Vuplicity's own frequently-asked-questions page draws that boundary.",
    },
    {
      label: "A route back to a person",
      detail:
        "The enquiry lands with James Brady, and Vuplicity delivers the screening. Both halves of that are stated on this page, so neither is something you find out afterwards.",
    },
  ],
  budgetBands: ["not_applicable", "under_5k"],
  inquiryType: "background_screening",
  ctaLabel: "Start a screening enquiry",
  proof: [
    {
      label: "Vuplicity, the company that runs the checks",
      url: "https://www.vuplicity.com",
      method:
        "HTTP GET, returned 200. Its own page title reads \"Nationwide background screening with clear pricing and cleaner workflows\", and its own description says it helps hiring teams run nationwide background screening with transparent pricing and compliant workflows.",
      capturedAt: "2026-08-12",
    },
    {
      label: "The published package pricing, readable without an enquiry",
      url: "https://www.vuplicity.com/pricing",
      method:
        "HTTP GET, returned 200. Titled \"Background Check Pricing\", describing Basic, Essential and Complete packages with clear public package pricing and add-on guidance.",
      capturedAt: "2026-08-12",
    },
    {
      label: "What the packages contain, and the consent workflow",
      url: "https://www.vuplicity.com/offerings",
      method:
        "HTTP GET, returned 200. Titled \"Background Screening Offerings\", describing packages, add-ons, monitoring options, candidate consent workflows and report release controls.",
      capturedAt: "2026-08-12",
    },
    {
      label: "The security and compliance overview",
      url: "https://www.vuplicity.com/security",
      method:
        "HTTP GET, returned 200. Titled \"Security and Compliance Overview\", describing screening workflow controls, audit trails, candidate consent and report release boundaries.",
      capturedAt: "2026-08-12",
    },
  ],
  og: {
    image: "/og/work-with-me.png",
    imageAlt: "James Brady — background screening, delivered by Vuplicity",
  },
  /*
   * BUYER RENDER MODE.
   *
   * One note per gap, in gap order. lib/content/validate.ts fails the build if
   * the counts stop matching, and /now still prints the full second-person
   * question. A buyer reading this page sees the absence stated plainly; the
   * owner-facing version of it lives in the work log where it belongs.
   */
  publicNotes: [
    "James Brady's exact position at Vuplicity, and the date it started, are not published on this site yet. What this page states is that a screening enquiry reaches him and that Vuplicity delivers the work.",
    "No screening volume, turnaround figure or employer outcome is published here either, because none has been measured under a stated method and window.",
  ],
  body: `## What this page is

Hiring someone means trusting a stranger with your customers, your money, or your keys. A background check is how that trust gets a foundation under it, and most employers meet the process at its worst: a quote that does not say what is in it, a candidate who never got a clear consent request, and a report that arrives with no rule about who may read it.

The screening behind this page is run by [Vuplicity](https://www.vuplicity.com). Its own site describes nationwide background screening with clear pricing and cleaner workflows. You can start here, and the work is Vuplicity's.

## What Vuplicity says about itself

Everything in this section comes from Vuplicity's public site, read on the date in the proof list. Nothing here is a measurement taken by this site.

Its own description says it helps hiring teams run nationwide background screening with transparent pricing, compliant workflows, and a direct path from self-serve setup to guided rollout. That last phrase is worth reading twice, because it is the choice most employers actually face: set it up yourself, or be walked through it.

Its pricing page is public and names three packages, Basic, Essential and Complete, with add-on guidance beside them. A published price is a checkable fact. A price you have to ask for is a negotiation you did not know you had entered.

Its offerings page describes packages, add-ons, monitoring options, candidate consent workflows and report release controls. Its security page describes screening workflow controls, audit trails, candidate consent and report release boundaries. Its questions page covers packages, pricing, candidate consent, report timing, and where the employer's own decision begins.

## Where the line sits

Vuplicity runs the checks. The employer makes the hiring decision. Vuplicity's own questions page draws that boundary, and this page does not blur it: a screening company reports what the record says, and it does not tell you whom to hire.

[JAMES: state your exact relationship to Vuplicity in one publishable line, with the date it became true. Title, ownership, operator, adviser, whichever is accurate. Until you supply it, this page says only that a screening enquiry reaches you and that Vuplicity delivers the work.]

[JAMES: is there a screening figure you want published, with its method and window? Volume run, average turnaround, anything measured. Nothing goes on this page until you give the figure and the window it covers.]

## What this page does not claim

No number from any screening engagement appears here. No claim is made about how fast a check comes back, how many have been run, or what any employer got out of it, because none of those has been measured on this site under a stated method.

The prices are Vuplicity's and they live on Vuplicity's page. This page links to them rather than copying them, so a price cannot go stale here without going stale there first.`,
};
