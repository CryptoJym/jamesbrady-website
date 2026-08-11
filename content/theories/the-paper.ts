import type { TheoryEntry } from "@/lib/content/types";

export const entry: TheoryEntry = {
  collection: "theories",
  slug: "the-paper",
  name: "THE PAPER",
  title: "What is a five-layer operating system for an agent-run business?",
  flagLabel: "Introduction only — document unpublished",
  what: "A specification for running a business where AI agents do most of the labour, in five gated layers. The document itself stays private; this page introduces the idea and links nothing.",
  // Ruled "sketched" on this site's ladder, not "developed": the brief's rule is
  // that the full text must land as static HTML before a theory counts as
  // developed, and James's 2026-08-11 ruling keeps the document private.
  // The document's own maturity and this page's maturity are different claims.
  maturity: "sketched",
  paused: false,
  claim:
    "A business run mostly by agents needs its layers gated bottom-up, because execution that runs ahead of the plan that authorizes it produces confident work against an unverified truth.",
  abstract:
    "THE PAPER specifies five gated layers — business truth, intelligence, strategy, execution and visibility measurement — where each layer may act only on what the layer beneath it has established.",
  answerCapsule:
    "THE PAPER is a single working document that specifies a five-layer operating system for running a business where AI agents do most of the labour. The five layers are business truth, competitive monitoring and recommendation, strategy, execution, and visibility measurement, each one gated by the layer beneath it. The document is a specification under active revision, not a published theory, and this page introduces it without reproducing it.",
  summary:
    "An introduction to a private specification for a five-layer, gated operating system for an agent-run business.",
  datePublished: "2026-07-05",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  history: [
    { date: "2026-07-05", state: "sketched", note: "Revision R5. Sections 4 onward unreviewed." },
    {
      date: "2026-08-11",
      state: "sketched",
      // Attribution, not a bare assertion (review addendum, A4): a history
      // line that says "approved" without naming who approved it and where
      // is indistinguishable from a decision the build made for itself.
      note:
        "Introduction-only page per owner ruling 2026-08-11 (SITE-BRIEF decisions log); the document itself stays private.",
    },
  ],
  proof: [
    {
      label: "The specification document",
      artifact: "private",
      method:
        "Measured locally on 2026-08-11: Revision R5, dated 2026-07-05. The document is private by standing rule and is not linked from this site.",
      capturedAt: "2026-08-11",
      redacted: true,
    },
  ],
  og: {
    image: "/og/theories.png",
    imageAlt: "James Brady — theory: a five-layer operating system for an agent-run business",
  },
  body: `This page introduces the document. It does not reproduce it, and it does not link it. The document is private by a standing rule, and the rule is older than this website.

The idea it specifies is a stack. Each layer only gets to act on what the layer below it has established.

**Layer 1, business truth.** What the company actually sells, at what price, to whom, with what economics. Captured once, at onboarding, and treated as the cornerstone. Everything above it is wrong if this is wrong.

**Layer 2, intelligence.** Split in two on purpose. Layer 2a records facts about competitors, continuously, and only facts. Layer 2b applies judgment on top of those facts and proposes moves. Keeping observation separate from opinion is what stops a guess from hardening into a fact three steps later.

**Layer 3, strategy.** A versioned war plan derived from truth and intelligence. Every version has to carry its reasoning and the alternatives it rejected, so a future reader can see what was considered and not just what was chosen.

**Layer 4, execution.** The agent labour. Content, site, brand, go-to-market. Gated, so execution cannot run ahead of the plan that authorizes it.

**Layer 5, visibility measurement.** Search and AI-answer scanning. The document is firm that this is one instrument, not the whole system. That matters because measurement is the easiest layer to build and the most tempting to mistake for strategy.

## What makes the document itself unusual

Its tagging. Every load-bearing claim carries exactly one tag: locked, resolved, decision needed, assumption, unverified, or verified with an evidence path. You can strike any single line and immediately see what it takes down with it. Decisions sit at the top of each section, mechanics below, because decisions are what a reader is most likely to change.

## Where this stands

Revision R5, dated 2026-07-05. Sections 4 onward have not been reviewed. The decision register carries open items rated high, and building against an open decision is not permitted.

On this site's own ladder the page is **sketched**, not developed, and the reason is a rule rather than a judgement: a theory counts as developed here only once its full text is published as static HTML on its own page. That has not happened and is not going to happen while the document stays private. Calling it developed on the strength of a private file would be exactly the kind of unearned claim the rest of this site is built to avoid.

## Artifacts

None published. The document is not linked.`,
};
