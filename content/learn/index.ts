import type { LearnEntry } from "@/lib/content/types";

/**
 * The three archived volumes. URLs are preserved — /primer, /manuscript and
 * /workshop stay exactly where they are (brief, 2026-08-11). This hub
 * introduces and links them; it never moves them.
 */
export const learn: LearnEntry[] = [
  {
    collection: "learn",
    slug: "primer",
    title: "The Primer",
    kicker: "How coding systems work",
    volumeRoute: "/primer",
    archivedDate: "2026-08-11",
    answerCapsule:
      "The Primer explains how modern coding systems fit together for a reader who does not write code: what code is, what a stack is, what an AI agent does, what a skill is, and what MCP connects. The volume is archived as written and kept at its original URL. Its prose was not rewritten when the page moved onto the current design; the archive date says when it stopped being maintained.",
    summary:
      "Code, the stack, AI agents, skills and MCP, explained for humans. Archived, kept at its original URL.",
    datePublished: "2026-02-01",
    dateModified: "2026-08-11",
    entities: ["person:james"],
    proof: [
      {
        label: "The volume itself",
        artifact: "/primer",
        method: "Published on this site at its original URL; archived in place with a dated badge.",
        capturedAt: "2026-08-11",
      },
    ],
    og: { image: "/og/learn.png", imageAlt: "James Brady — The Primer, archived" },
    body: `Start here if the vocabulary is the obstacle. The Primer walks from "what is code" to "what is an agent" without assuming a background, and it is the shortest path into the other two volumes.`,
  },
  {
    collection: "learn",
    slug: "manuscript",
    title: "The Manuscript",
    kicker: "Curated tools and servers",
    volumeRoute: "/manuscript",
    archivedDate: "2026-08-11",
    answerCapsule:
      "The Manuscript is a curated catalog of tools and MCP servers, grouped by the job each one does, with an install line and a source link for every entry. The catalog count shown anywhere on this site is computed from the catalog source at build. An earlier version of this site printed a hand-typed figure that was wrong by a factor of eight, and that class of defect is what the computed count exists to prevent.",
    summary:
      "A curated catalog of tools and MCP servers with install lines and sources. Archived, kept at its original URL.",
    datePublished: "2026-02-15",
    dateModified: "2026-08-11",
    entities: ["person:james"],
    proof: [
      {
        label: "The volume itself",
        artifact: "/manuscript",
        method: "Published on this site at its original URL; counts computed from the catalog source at build.",
        capturedAt: "2026-08-11",
      },
    ],
    og: { image: "/og/learn.png", imageAlt: "James Brady — The Manuscript, archived" },
    body: `The catalog is a shelf, not a ranking. Each entry names what the tool does, how to install it, and where the source lives, so the reader can check it rather than take the recommendation.`,
  },
  {
    collection: "learn",
    slug: "workshop",
    title: "The Workshop",
    kicker: "Build something",
    volumeRoute: "/workshop",
    archivedDate: "2026-08-11",
    answerCapsule:
      "The Workshop is three practical guides that end in a working setup: standing up an AI agent, installing a skill, and connecting an MCP server. Each guide is written to be followed once, start to finish, rather than skimmed. The volume is archived as written and kept at its original URL, with the archive date stated on the page.",
    summary:
      "Three practical guides: set up an AI agent, install skills, connect MCP servers. Archived, kept at its original URL.",
    datePublished: "2026-03-01",
    dateModified: "2026-08-11",
    entities: ["person:james"],
    proof: [
      {
        label: "The volume itself",
        artifact: "/workshop",
        method: "Published on this site at its original URL; archived in place with a dated badge.",
        capturedAt: "2026-08-11",
      },
    ],
    og: { image: "/og/learn.png", imageAlt: "James Brady — The Workshop, archived" },
    body: `Three guides that end with something running on your own machine. Follow one all the way through before starting the next.`,
  },
];
