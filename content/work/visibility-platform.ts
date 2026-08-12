import type { WorkEntry } from "@/lib/content/types";

export const entry: WorkEntry = {
  collection: "work",
  slug: "visibility-platform",
  title: "The visibility platform",
  kicker: "Findability, measured",
  categories: ["products", "client-work"],
  answerCapsule:
    "The visibility platform measures how findable a business is in ordinary search and inside AI assistants, then scores it against a fixed rubric of 12 axes and 76 measures. A fixed rubric is what makes this month comparable to last month, and one business comparable to another. Every client is a tenant with walled data. Missing evidence is recorded as missing and never scored as a zero, because a report that fills gaps with zeros misleads the person paying for it.",
  summary:
    "A multi-tenant platform that measures how findable a business is in search and in AI answers, and prints the evidence under every score.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:new-reward"],
  stack: [
    "Next.js",
    "TypeScript",
    "Vercel",
    "Prisma (multi-tenant schema)",
    "Clerk",
    "Search Console + analytics sync",
    "DataForSEO adapters",
    "Self-hosted CI runners with a merge queue",
  ],
  timeframe: { start: "2025-11" },
  anonymized: true,
  footFacts: [{ label: "In production" }, { field: "anonymized" }],
  liveUrls: [
    { url: "https://new-rewards.vercel.app", checkedAt: "2026-08-11", status: 200 },
    { url: "https://newreward.com", checkedAt: "2026-08-11", status: 200 },
    {
      url: "https://h3ro-dev.github.io/new-reward-seo-skills-os/",
      checkedAt: "2026-08-11",
      status: 200,
    },
  ],
  deltas: [
    {
      metric: "Measures behind one score",
      after: "76 measures under 12 fixed axes",
      method:
        "Counted from the scorecard source of 2026-08-11. The axes are fixed on purpose: a fixed rubric is what makes two runs comparable.",
      timeframe: "Rubric as of 2026-08-11",
    },
  ],
  proofMetric: {
    value: 76,
    unit: "measures under 12 fixed axes",
    method: "Counted from the scorecard source. Fixed rubric, so two runs stay comparable.",
    source: "Published method site",
    lastActive: "2026-08-11",
    goLabel: "How it's measured",
    goHref: "/work/visibility-platform",
    state: "live",
  },
  proof: [
    {
      label: "Live application",
      url: "https://new-rewards.vercel.app",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Published method — the scorecard documentation site",
      url: "https://h3ro-dev.github.io/new-reward-seo-skills-os/",
      method: "HTTP GET, returned 200. The underlying repository is private; the method site is public.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Agency front",
      url: "https://newreward.com",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work.png",
    imageAlt: "James Brady — case study: a platform that measures findability in search and AI answers",
  },
  /*
   * BUYER RENDER MODE (wave 3).
   *
   * This is the case study the visibility engagement points at, so the people
   * reading it are deciding whether to pay for the thing it describes. The
   * three marks below stay in the body, exactly as written, and /now still
   * prints them in full as open questions. Here they render as statements of
   * absence, because the reader is not the person who can close them.
   *
   * One note per gap, in gap order. lib/content/validate.ts fails the build if
   * the counts stop matching.
   */
  publicNotes: [
    "One client outcome figure, with its method and its window, is not published here yet.",
    "Neither is a recorded walkthrough of a real run.",
    "No client has cleared their name for publication, so this case study stays anonymized.",
  ],
  body: `> **Anonymization note.** Client names and identifying details are withheld per agreement. Industries are named, specific clients are not. Screenshots and metrics are otherwise unaltered. Named case studies get published only when a client gives written clearance.

## The problem

A business used to be findable in one place: Google. Now a buyer may never see a search result. They ask an assistant, and the assistant answers from sources the business has never checked. Most owners have no way to see what those answers say about them, no way to compare themselves to a rival, and no way to tell which fix is worth doing first.

## What I built

A multi-tenant platform that measures how findable a business is in ordinary search and inside AI assistants, scores it against a fixed rubric, turns the score into a report a non-technical owner can read, and then feeds the gaps back as work.

The rubric is a 12-axis scorecard with 76 measures underneath it. The axes are fixed on purpose. A fixed rubric is what makes this month comparable to last month, and one business comparable to another.

Industries served so far: medical and health services, HVAC, roofing, concrete, gutters, financial and commercial lending, custom software and IT staffing, pet breeding, background screening, promotional products, and call-center software.

## How it works in plain words

Every client is a tenant with its own walled data. Nothing crosses between tenants.

A run collects from outside first, using only what any member of the public could see, so a measurement never depends on getting access to a client's accounts. Where connections exist, the platform also reads Search Console and analytics directly. Each finding is stored with its source, the date, and the exact vantage point it was seen from, because the same page can look different to different visitors.

Missing evidence is recorded as missing. It is never scored as a zero. That single rule is the difference between a report that helps and a report that misleads.

The report leads with the comparison and the business conclusion. The score sits under a plain checklist and a visible formula. The technical evidence goes in an appendix, so an owner can act without reading it and a technician can check it without arguing.

## What is not shown here

The platform repository is private, so the proof on this page is the live application, the agency front, and the published method site.

[JAMES: supply one outcome number with its method, for one anonymized client. Example shape: "an HVAC client, over 90 days, moved from N of 76 measures passing to M." Nothing goes on this page until you give the figure and the window.]

[JAMES: do you want a redacted screen recording of a real run for this page? The site brief asks for a 60 to 90 second watch-it-run clip on flagship studies. Approve the recording and the redaction list.]

[JAMES: clearance question. Any client willing to be named yet? If yes, that becomes a second, named case study and this one stays anonymous.]

## Stack

Next.js and TypeScript on Vercel. Prisma with a multi-tenant schema keyed by tenant and client. Clerk for authentication. Search Console and analytics sync. DataForSEO adapters for backlinks, keyword data, and assistant-mention checks. Self-hosted CI runners with required checks and a merge queue.`,
};
