import type { WorkEntry } from "@/lib/content/types";

export const entry: WorkEntry = {
  collection: "work",
  slug: "of-one-family",
  title: "The Of One family",
  kicker: "A thesis in progress",
  categories: ["experiments", "products"],
  answerCapsule:
    "The Of One family is a thesis being tested, not a finished product line: a governed set of domains and applications that each name a single company role and ask what that role looks like as one person plus AI. Two of them are live applications. The rest is staked ground — domains and landing pages that exist to find which role-shaped problem pulls interest before anything gets built. The page labels which is which, every time.",
  summary:
    "A governed family of role-shaped domains for one-person businesses: two live applications, the rest deliberately staked ground.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  stack: ["Next.js", "Vercel", "Shared component library (ofone-ui)"],
  timeframe: { start: "2025-06" },
  anonymized: false,
  footUnit: "Live apps vs staked ground — labelled",
  liveUrls: [
    { url: "https://businessofone.ai", checkedAt: "2026-08-11", status: 200 },
    { url: "https://financeofone.com", checkedAt: "2026-08-11", status: 200 },
    { url: "https://vcofone.ai", checkedAt: "2026-08-11", status: 200 },
  ],
  deltas: [],
  proof: [
    {
      label: "Live application — financeofone.com",
      url: "https://financeofone.com",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Live application — vcofone.ai",
      url: "https://vcofone.ai",
      method: "HTTP GET, returned 200. Note: vcofone.com resolves but serves nothing; the live domain is the .ai.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Landing page — businessofone.ai",
      url: "https://businessofone.ai",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work.png",
    imageAlt: "James Brady — case study: the Of One family, a thesis in progress",
  },
  body: `> **Read this first.** This entry is a thesis being tested, not a finished product line. Most of what is described below is staked ground: a registered domain and a landing page, nothing more. A small number are real, working applications. The page labels which is which, every time. Ideation repositories are not counted as products.

## The problem

Software for a one-person business is usually shrunken software for a big company. The work a solo operator actually has to do is different in kind, not just in size. One person is the CEO, the finance function, the legal review, and the marketing department in the same afternoon. The thesis is that each of those jobs deserves its own tool, built for one person, rather than a seat in a suite built for fifty.

## What I built

A governed family of domains and applications under the "of One" idea. Each one names a single company role and asks what that role looks like when the whole department is one person plus AI.

Two things are true at once, and the page says both.

First, the real ones. \`financeofone.com\` and \`vcofone.ai\` are live applications, not brochures. They are the ones worth judging.

Second, the staked ground. The rest of the family is domains and landing pages. They exist to test which role-shaped problem pulls the most interest before anything gets built. That is a legitimate way to find demand. It is not the same as shipping a product, and calling it shipping would be a lie.

## How it works in plain words

The family runs on one rule: a domain does not become a product until someone shows up wanting it. Landing pages carry the promise. Traffic and signups say which promise is real. Only then does a build start. That order is deliberate, and it is why the count of domains is much larger than the count of applications.

Shared UI components live in one place, \`ofone-ui\`, so a build that graduates does not start from an empty folder.

## What this page will not print

The family-wide counts of governed domains and live landing pages are not shown here. They come from a checked domain list that has to be re-checked at build with a date on it, and that check is not wired up yet. A count with no date is exactly the kind of number this site exists to avoid.

[JAMES: give the honest verdict line for this page. Which of these is getting real traffic, and what have you decided to kill? A thesis page with no result is just a list of domains. One sentence about what you learned makes it a case study.]

[JAMES: confirm the exact set of "real applications". The inventory says 2 to 4. Name them.]

## Stack

Mostly Next.js on Vercel for the landing pages. Shared component library \`ofone-ui\`. Domain and provider mapping tracked in a per-family audit document.`,
};
