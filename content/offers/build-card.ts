import type { PublishedOffer } from "@/lib/content/types";

// Utlyze's Consult and Build, word for word as they are live on its Of One sites. The network shares one source
// (src/lib/build-card.ts there); this is its copy for jamesbrady.org, read on 2026-09-27 from businessofone.ai and
// ctoofone.ai, which print the same card, levels and pace note.
//
// James approved the Build card on 2026-09-27 (card W3 of the U7c cold-read test), then the same day the three
// levels "in the three month term" and point 4 as it now reads. Keep every line word for word. The one line a site
// may change is the "Like:" example; this site uses the card's own, in the spelling the rest of this site uses.
// Change the card on the Of One sites first, then here, and re-read it: the date below is the method for every
// figure in this file.
//
// The people are build-with-you coaches: never "named people" or "a dedicated team", and the name is always
// followed by its promise line. Never "workstream", "beta" or "production testing", and never "from" before a
// price. lib/content/validate.ts fails the build on any of those in an offer.

export const COACH_PROMISE =
  "They build your AI systems with you and teach your team to run them. If you ever leave, the systems stay with you.";

export const CONSULT = {
  name: "Consult",
  price: "$400 an hour",
  terms: "in 5-hour blocks ($2,000 a block)",
  value: "Sit with our experts. Map the business, find the leverage, and leave with the plan and the skills to run it.",
};

/** The site's own example of one job a team repeats, without the closing full stop. */
const LIKE = "a new enquiry becomes a booked job";

export const BUILD = {
  name: "Build",
  price: "$15,000 a month",
  terms: "Build-with-you coaches · on call 24/7 on a shared rotation",
  value:
    "We help you find the leaks and stop them: hours lost, errors made and sales missed in work your team repeats.",
  points: [
    "Each month, pick up to 5 business processes for us to work on. Work starts in week one. Anything not finished carries into next month’s 5.",
    `A business process is one job your team repeats, start to finish. Like: ${LIKE}.`,
    "Each one becomes a working automation in your own tools, tested on your real work and taught to your team.",
    "Build Plus and Build Program handle more than 5 at once. New software products and replacing a core system are quoted separately.",
    "You own everything we build.",
  ],
};

export const BUILD_LEVELS = [
  { name: "Build", price: "$15,000 a month", atOnce: "Up to 5 business processes at once.", adds: "" },
  {
    name: "Build Plus",
    price: "$25,000 a month",
    atOnce: "Up to 10 business processes at once.",
    adds: "Adds processes that talk to your customers live or touch health, payment or student records, same-day requests, and 2 of your people trained as champions.",
  },
  {
    name: "Build Program",
    price: "$50,000 a month",
    atOnce: "Up to 20 business processes at once, across departments.",
    adds: "Adds a named person on call around the clock as your backup, one shared platform piece at a time, and an MSA, a DPA, insurance and a security review.",
  },
];

export const BUILD_CARD: PublishedOffer = {
  sources: [
    {
      label: "The Consult and Build cards and the pace note, on Business of One",
      url: "https://businessofone.ai/",
      capturedAt: "2026-09-27",
    },
    {
      label: "The three levels, the term and who does the work, on Business of One’s Build page",
      url: "https://businessofone.ai/build/",
      capturedAt: "2026-09-27",
    },
    {
      label: "The same levels and term, on CTO of One’s Build page",
      url: "https://ctoofone.ai/build/",
      capturedAt: "2026-09-27",
    },
  ],
  cards: [CONSULT, BUILD],
  levelsLink: "See Build Plus and Build Program",
  start: "Not sure where to start? Start with a Consult block ($2,000).",
  // BUILD_PACE on the Of One sites: James's own statement, kept exactly as it is.
  pace: "On Build, we get projects up and running within a week, depending on complexity and how quickly you give us access to your systems.",
  levels: {
    heading: "Three levels",
    intro: "Build comes in three levels, and each adds to the one before it. Each level has a three-month minimum term.",
    items: BUILD_LEVELS,
    separately: {
      heading: "Quoted separately",
      body: "New software products and replacing a core system are each quoted separately.",
    },
  },
  people: {
    heading: "Who does the work",
    lines: [
      `You work side by side with our build-with-you coaches. ${COACH_PROMISE}`,
      "Agents work only on your systems, and a shared 24/7 on-call rotation answers with response times in writing, so the systems your business depends on do not wait for office hours.",
    ],
  },
};
