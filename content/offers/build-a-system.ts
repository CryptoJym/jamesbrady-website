import type { OfferEntry } from "@/lib/content/types";

import { BUILD, BUILD_CARD, CONSULT } from "./build-card";

/*
 * UTLYZE'S OFFER, AS IT IS LIVE ON ITS SITES.
 *
 * Rewritten on 2026-09-27. Until then this page described a scoped engagement shipped in "verified waves", which is
 * not what Utlyze sells. It now carries Utlyze's Consult and Build word for word (content/offers/build-card.ts), read
 * the same day from businessofone.ai and ctoofone.ai, where the Of One sites print one shared card.
 *
 * Everything outside the card is this site's own plain description of it, and each claim in it comes from the same
 * pages: the steps from Business of One's "How it works", what the client keeps from its "What each becomes". Nothing
 * here promises a saving or an outcome, and the three-month term appears only as the levels print it.
 */
export const entry: OfferEntry = {
  collection: "offers",
  slug: "build-a-system",
  title: "Build your AI systems with Utlyze",
  kicker: "For a business with work that repeats",
  capsuleQuestion: "What does building with Utlyze look like, and what does it cost?",
  answerCapsule:
    `Building with Utlyze, the company James Brady operates, has two ways in. Consult is ${CONSULT.price}, ${CONSULT.terms}. Build is ${BUILD.price}: each month you pick up to 5 business processes, and each one becomes a working automation in your own tools, tested on your real work and taught to your team. The work is done by build-with-you coaches. They build your AI systems with you and teach your team to run them. If you ever leave, the systems stay with you.`,
  summary:
    "Utlyze builds AI systems with you: Consult at $400 an hour in 5-hour blocks, or Build at $15,000 a month for up to 5 business processes at once.",
  datePublished: "2026-08-12",
  dateModified: "2026-09-27",
  entities: ["person:james", "org:utlyze"],
  deliveredBy: {
    name: "Utlyze",
    url: "https://www.utlyze.com",
    role: "the company that builds custom AI systems around your work and the tools you already use",
  },
  audience: [
    "Established businesses with real revenue",
    "Owners who want to run lean and let AI carry the repeatable work",
    "Technical leads who want people who build with them, not around them",
  ],
  steps: [
    {
      label: "Map",
      detail:
        "Utlyze and the client use the Of One method to agree on the outcomes, the constraints and the order of work.",
    },
    {
      label: "Build",
      detail: "Small working systems ship early and grow, measured by the work they finish.",
    },
    {
      label: "Adapt",
      detail: "When models and tools change, the parts are swapped and the business keeps running.",
    },
  ],
  deliverables: [
    {
      label: "Working automations in your own accounts",
      detail:
        "Each process becomes an automation that runs on your real work, in your own accounts, and has passed a test your owner signed off.",
    },
    {
      label: "A way back if one fails",
      detail:
        "A person approves anything that can't be undone. If an automation fails, it falls back to today's way, and your owner can run it.",
    },
    {
      label: "A team that knows how it works",
      detail: "Each one is taught to your team, and you learn how each system works and how to change it.",
    },
    {
      label: "Everything that was built",
      detail: "You own everything built for you. If you ever leave, the systems stay with you.",
    },
  ],
  price: {
    statement: `Utlyze publishes its prices. Consult is ${CONSULT.price}, ${CONSULT.terms}. Build is ${BUILD.price}.`,
    source: BUILD_CARD.sources[0],
  },
  published: BUILD_CARD,
  inquiryType: "production_build",
  ctaLabel: "Start a build enquiry",
  proof: [
    {
      label: "Utlyze’s Consult and Build cards and the pace note, live on Business of One",
      url: "https://businessofone.ai/",
      method:
        "HTTP GET, returned 200. The two cards, the Build card’s five points and the pace note, read on the page.",
      capturedAt: "2026-09-27",
    },
    {
      label: "The three levels, the three-month term and who does the work",
      url: "https://businessofone.ai/build/",
      method:
        "HTTP GET, returned 200. The Three levels, Quoted separately and Who does the work sections, read on the page; ctoofone.ai/build/ prints the same levels and term.",
      capturedAt: "2026-09-27",
    },
    {
      label: "Utlyze, the company that does the work",
      url: "https://www.utlyze.com/",
      method:
        "HTTP GET, returned 200. Its own page says it builds custom AI systems around your work and the tools you already use.",
      capturedAt: "2026-09-27",
    },
  ],
  og: {
    image: "/og/default.png",
    imageAlt: "James Brady — build your AI systems with Utlyze: Consult or Build",
  },
  body: `## What this page does not claim

No client of this offer is named on this site, and no outcome is promised or published: no hours saved, no errors avoided, no sales won. Client work here is anonymized by agreement, and a named result goes up only with written clearance.

## Where these words come from

The prices, the two cards, the three levels, the pace note and the description of who does the work are Utlyze's own, copied word for word from its sites on 27 September 2026. The one line this site chose is the example of a business process: a new enquiry becoming a booked job.`,
};
