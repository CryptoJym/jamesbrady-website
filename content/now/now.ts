import type { NowEntry } from "@/lib/content/types";

/**
 * The single hand-edited /now entry. Exactly one file; a second fails the
 * build. `updated` older than 42 days fails the build with the exact age
 * (geo-seo-spec §6) — a stale /now is a defect, not a warning.
 *
 * No auto-generation from GitHub activity. This is written by hand, monthly.
 *
 * OWNER DIRECTIVE, 2026-08-12: this page describes the current work as
 * research projects, not as rebuilding this site. James's words were "currently
 * working on a number of different research projects at this time". He named no
 * projects, so none are named here, and the earlier copy naming the rebuild,
 * the platform in production and the collector heading toward release came out
 * rather than being reworded. What is not stated is stated as not stated.
 */
export const now: NowEntry = {
  collection: "now",
  slug: "now",
  title: "Research projects",
  updated: "2026-08-12",
  answerCapsule:
    "James Brady is currently working on a number of different research projects. Which projects those are is not published here yet, and what ships from them will appear on this site with its numbers and its method when it is ready. This page is hand-edited rather than generated from repository activity, the age indicator beside it is computed from the date the file itself carries, and the open questions the whole site is still carrying are listed below.",
  summary:
    "Research projects are the current work. This page is hand-edited monthly, and the open questions the rest of the site is carrying are listed below.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-12",
  entities: ["person:james", "org:utlyze", "org:new-reward"],
  proof: [
    {
      label: "This page",
      artifact: "/now",
      method: "Hand-edited. The age indicator is computed from the entry's own `updated` field at render time.",
      capturedAt: "2026-08-12",
    },
  ],
  og: {
    image: "/og/default.png",
    imageAlt: "James Brady — what I'm working on now",
  },
  // No opening heading: the H1 is already "Research projects", and a heading
  // that restates the one above it is the fragmented-header pattern the
  // content register names (pattern 29).
  body: `James is currently working on a number of different research projects.

Which ones they are is not published here yet. What ships from them will be published on this site, with its numbers and the method behind them, when it is ready. Nothing goes up before that: a project described before it exists is a promise, and this site publishes results.

The rest of this page is the work log.`,
};
