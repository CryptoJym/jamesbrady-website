import type { WorkEntry } from "@/lib/content/types";

export const entry: WorkEntry = {
  collection: "work",
  slug: "ai-readiness-assessment",
  title: "AI-readiness assessment",
  kicker: "A shared frame, in one sitting",
  categories: ["products", "open-source"],
  answerCapsule:
    "The AI-readiness assessment scores an organization across seven competency domains using 28 questions, and returns four views of the same result rather than a single number. Questions filter by role, so an executive, a manager, an IT lead and an HR lead each answer what they can actually judge. Four views matter because one number hides which two domains are dragging the average down. Results export as a formatted PDF or as raw JSON.",
  summary:
    "An interactive assessment scoring seven AI-competency domains across 28 role-filtered questions, with four views of the same result.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  stack: [
    "Next.js 15 App Router",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "Framer Motion",
    "Recharts",
    "Vercel",
  ],
  timeframe: { start: "2025-07", end: "2025-08" },
  anonymized: false,
  footFacts: [
    // Measured off the shipped assessment: seven competency domains, 28
    // questions. Held as numbers with their unit and method, not as prose.
    {
      count: 7,
      unit: "domains",
      method:
        "Counted from the shipped assessment's domain list, ai-readiness-assessment, read 2026-08-11.",
    },
    {
      count: 28,
      unit: "questions",
      method:
        "Counted from the shipped assessment's question bank, ai-readiness-assessment, read 2026-08-11.",
    },
  ],
  repo: {
    owner: "CryptoJym",
    name: "ai-readiness-assessment",
    public: true,
    stars: 0,
    license: "MIT",
    snapshotAt: "2026-08-11",
    lastPush: "2025-08-15",
  },
  liveUrls: [
    {
      url: "https://ai-readiness-assessment-eight.vercel.app",
      checkedAt: "2026-08-11",
      status: 200,
    },
  ],
  deltas: [],
  proof: [
    {
      label: "Live assessment",
      url: "https://ai-readiness-assessment-eight.vercel.app",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Repository — CryptoJym/ai-readiness-assessment",
      url: "https://github.com/CryptoJym/ai-readiness-assessment",
      method: "GitHub API read, public repo. MIT licensed. Last push 2025-08-15.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work.png",
    imageAlt: "James Brady — case study: an AI-readiness assessment",
  },
  body: `## The problem

Most organizations answer "are we ready for AI" with a feeling. The people who ask are usually executives, and the answer they get back is a vendor's opinion. There is no shared frame, so two departments in the same company can disagree without ever finding out why.

## What I built

An interactive assessment that scores an organization across seven competency domains, using 28 questions, and returns charts and a downloadable report. It filters questions by role, so an executive, a manager, an IT lead, and an HR lead each answer what they can judge.

## How it works in plain words

The seven domains are: mindset and ethics, governance and risk, opportunity discovery, workflow integration and prompting, verification and quality, execution discipline, and culture and change.

You answer one domain at a time, with a progress bar showing where you are. Every domain has its own color, used consistently across every chart, so a weak area looks the same wherever it appears.

At the end you get four views of the same data: a bar chart by domain, a radar chart for the overall shape, a distribution, and a maturity matrix showing where you sit on the journey. Four views matter because a single number hides which two domains are dragging the average down.

Results export as a formatted PDF for sharing, or as raw JSON if you want to track scores over time rather than take a snapshot and forget it.

## Honest status

The tool is live and working, and it has not been changed in about a year. Last commit 2025-08-15.

[JAMES: the README calls the 28 questions "research-based". Name the sources, or the page will say "questions drawn from an internal rubric" instead. Do not publish "research-based" without citations.]

[JAMES: has this been run by any real organization? If yes, how many, and can any of them be described anonymously by industry? If no, the page says so plainly.]

## Stack

Next.js 15 with the App Router. TypeScript. Tailwind CSS. shadcn/ui components. Framer Motion. Recharts. PDF export. Deployed on Vercel.`,
};
