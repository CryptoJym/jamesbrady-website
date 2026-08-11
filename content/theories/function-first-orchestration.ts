import type { TheoryEntry } from "@/lib/content/types";

export const entry: TheoryEntry = {
  collection: "theories",
  slug: "function-first-orchestration",
  name: "Function-First Orchestration",
  title: "Should proof of function come before proof of thoroughness?",
  flagLabel: "Sketched · standing rule",
  what: "Ship one honest happy-path test plus the refusals that protect money, custody and truth. Defer the rest deliberately, in writing, rather than skipping it.",
  maturity: "sketched",
  paused: false,
  claim:
    "Deferring broad test coverage in favour of one honest happy path plus mandatory refusal tests ships more working software per hour than a speculative test matrix.",
  abstract:
    "Function-First Orchestration puts proof of function ahead of proof of thoroughness, keeps refusal tests mandatory, and requires every deferral to be written down rather than felt.",
  answerCapsule:
    "Function-First Orchestration is an operating rule that puts proof of function ahead of proof of thoroughness. Under the rule, a piece of work ships with one honest happy-path test plus the specific refusals that protect money, custody, and truth, and nothing else. Broader test coverage is deliberately deferred rather than skipped, and the deferral is written into a parking file so that later is a real entry on a list rather than a feeling.",
  summary:
    "Prove function first: one honest happy path plus mandatory refusal tests, with every deferral written down.",
  datePublished: "2026-07-28",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  history: [
    { date: "2026-07-28", state: "sketched", note: "Named as a standing operating rule after test batteries outgrew the features they tested." },
  ],
  proof: [
    {
      label: "Applied practice — the Architect Loop",
      artifact: "/theories/architect-loop",
      method:
        "The rule governs lane briefs and gate scope in the loop described in the linked theory. No published measurement of its effect exists yet.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/theories.png",
    imageAlt: "James Brady — theory: Function-First Orchestration",
  },
  body: `The rule came out of watching build waves produce test batteries larger than the features they tested. The tests were not wrong. They were early. Every hour spent on a speculative test matrix was an hour not spent finding out whether the thing worked at all.

So the standing rule is: great is the enemy of good. Prove function. Refine later.

Two things keep this from becoming an excuse for sloppiness.

First, the refusals are not optional. A test that proves the system says no, correctly, when money moves, when custody changes, or when a truth claim is being made, is function-proof, not polish. Those tests ship in the first pass, every time.

Second, the deferral is written down. "Refine later" only works if later is a real entry on a list, not a feeling. Improvements go into a parking file, not into the current wave, and the current wave's scope is frozen and shrink-only.

There is a matching rule for the agents doing the work: give each one a narrow lane and all the surrounding context. Narrow, because a broad brief invites design beyond the ask. All the context, because an agent forced to re-derive a settled decision will sometimes derive a different one.

## Where this stands

Sketched. A standing operating rule with a clear origin and daily application. No measurement has been published on whether it produced more shipped work or more defects, and that measurement is the obvious next step. Until it exists, this page claims a practice, not a result.

## Artifacts

- Related theory: [The Architect Loop](/theories/architect-loop)

[JAMES: this rule came from your own words on 2026-07-28: "ensure that we do not over engineer the testing. We want to focus on function. We can refine later. Great is the enemy of good." Do you want that quoted on the page as yours? It is the strongest line on it, but it is from an internal working session.]`,
};
