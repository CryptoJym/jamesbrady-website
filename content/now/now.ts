import type { NowEntry } from "@/lib/content/types";

/**
 * The single hand-edited /now entry. Exactly one file; a second fails the
 * build. `updated` older than 42 days fails the build with the exact age
 * (geo-seo-spec §6) — a stale /now is a defect, not a warning.
 *
 * No auto-generation from GitHub activity. This is written by hand, monthly.
 */
export const now: NowEntry = {
  collection: "now",
  slug: "now",
  title: "What I'm working on now",
  updated: "2026-08-11",
  answerCapsule:
    "James Brady is currently rebuilding jamesbrady.org from the ground up, with the content pipeline and the page skeleton landing first and the grounded Ask dock following. Alongside that, the visibility platform is running in production for client accounts, and plimsoll is being prepared for release signing and npm publication. This page is hand-edited monthly; the age indicator beside it is computed from the date the file itself carries.",
  summary:
    "Hand-edited monthly: the site rebuild, the visibility platform in production, and plimsoll heading toward release.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze", "org:new-reward"],
  proof: [
    {
      label: "This page",
      artifact: "/now",
      method: "Hand-edited. The age indicator is computed from the entry's own `updated` field at render time.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/default.png",
    imageAlt: "James Brady — what I'm working on now",
  },
  body: `## Rebuilding this site

The site you are reading is being rebuilt from the ground up. Wave one is the foundation: a typed content source that every page, feed and machine-readable file reads from, the design system, and the page skeleton. The grounded Ask dock comes after, and until it does the dock states its terms and offers email instead of pretending to answer.

## In production

The visibility platform is running for client accounts, measuring how findable a business is in search and inside AI assistants. Client work stays anonymized by default here; industries are named, companies are not.

## Heading toward release

plimsoll — the collector that ties AI coding spend to merged pull requests — has release signing and npm publication outstanding. Background service mode for npm installs is not fitted yet, and the README says so.

## Open on my desk

The largest gap on this site is the human story on the about page, and it is mine to write. Several pages carry marked questions that only I can answer; they are shown on the page rather than filled in with something plausible.`,
};
