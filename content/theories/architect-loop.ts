import type { TheoryEntry } from "@/lib/content/types";

export const entry: TheoryEntry = {
  collection: "theories",
  slug: "architect-loop",
  name: "The Architect Loop",
  title: "Can one person run a software team by splitting judgment from building?",
  flagLabel: "Field-proven · fork, not mine",
  what: "One model holds judgment, a separate set of models does all the building, and a git repository is the only shared memory. A fork of Dan McInerney's project, hardened and run daily.",
  maturity: "developed",
  paused: false,
  claim:
    "A model that writes code and also grades that code will grade it kindly, so the grading authority must sit outside the building context and the standard must be frozen before work starts.",
  abstract:
    "The Architect Loop separates judgment from building, freezes the gates before work starts, and hands the final verdict to a judge with no memory of the build conversation.",
  answerCapsule:
    "The Architect Loop is a working arrangement in which one AI model does judgment only and a separate set of AI models does all the building, with a git repository as the only shared memory. Judgment means arbitration, verdicts against frozen gates, splitting work into lanes, and deciding whether to continue or kill. Building means writing code in isolated worktrees, with no authority to decide whether its own work passed.",
  summary:
    "One model judges, others build, and the repository is the only memory. A hardened fork of Dan McInerney's architect-loop.",
  datePublished: "2026-04-20",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  artifactUrl: "https://github.com/DanMcInerney/architect-loop",
  artifactLabel: "Upstream project",
  history: [
    { date: "2026-04-20", state: "sketched", note: "Fork taken; local hardening begins." },
    { date: "2026-08-11", state: "developed", note: "Two full delivery cycles run end to end; local v2.4 pass fixed five audit findings." },
  ],
  proof: [
    {
      label: "Upstream project — DanMcInerney/architect-loop",
      url: "https://github.com/DanMcInerney/architect-loop",
      method: "The original design is Dan McInerney's. This entry describes a fork, hardened locally.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/theories.png",
    imageAlt: "James Brady — theory: the Architect Loop",
  },
  body: `The separation is the whole idea. A model that writes code and also grades that code will grade it kindly. Not from dishonesty, but because the same context that produced the work produces the standard.

So the loop puts a wall in the middle. One model holds judgment. One to four builders run in parallel, each in its own isolated git worktree. They never share a directory, because parallel agents in one directory tidy up after each other and destroy each other's work.

## The repository is the only memory

The memory is not chat history and not a scratch folder. It is a handoff file, a gates directory, and a lanes directory. Anything not written to the repository did not happen. That rule sounds bureaucratic until the first time a lane dies mid-run and everything it "knew" turns out to have been in a conversation nobody can replay.

## Gates are frozen before the work starts

Most systems get this wrong. If the test that decides "done" can be edited by the thing being tested, the test decides nothing. So the gate has a tamper perimeter, and it covers more than the gate file: it includes the validators, the test files, and the script entries the gate command depends on. After the run, the loop diffs that whole set. A fix that touched the checker has to be re-verified against a known-bad input before it counts.

The failure this prevents is specific and common: a guard gets broken by the diff that was supposed to satisfy it, someone narrows the guard so the run goes green, and the narrowed guard still looks like coverage from the outside.

## Disagreement stops the run before code

If the plan and the request materially disagree, the run ends as blocked rather than proceeding on a guess. A blocked run is cheap. A run that guessed at the intent and built the wrong thing correctly is expensive.

## The verdict comes from a fresh judge

The final verdict is given by a judge with no memory of the build conversation, and that judge is handed pointers only: the handoff file, the gates, and the frozen commit, without the story of how the work went. A judge who watched the struggle grades the struggle.

This is the same principle as the wall in the middle, applied at the end instead of the beginning. Anyone who has watched a difficult piece of work come together starts to price in the difficulty, and a verdict that prices in difficulty is no longer a verdict about the artifact. Handing over pointers rather than a narrative is not a slight against the builders. It is the only way the grade means what it says.

## What the loop costs

Honesty about the price matters as much as the design. Isolated worktrees mean more disk and slower setup. Frozen gates mean a mid-run realization that the gate was wrong becomes a stop-and-restart rather than a quiet edit. Writing everything to the repository is slower than remembering it. Each of those costs is real, and each is the direct price of the property it buys.

The trade is worth taking when the work is going to be judged by someone who was not in the room: a client, a future maintainer, or the person you will be in three months. It is probably not worth taking for a throwaway script.

## Attribution, stated plainly

The Architect Loop is not mine. It is a fork of \`DanMcInerney/architect-loop\`, heavily customized, run daily, and hardened locally. Five audit findings were fixed in a local v2.4 pass, and one of those fixes was offered back upstream as a pull request. What I contribute is the hardening and the operating discipline, not the original design.

I say that here rather than in a footnote because a portfolio that quietly absorbs other people's work is exactly the kind of thing this site is supposed to be the opposite of.

## Where this stands

Developed and field-proven, on a fork I do not own. Two full delivery cycles have run end to end under it, in client engagements described here by industry only: pet breeding, and financial and commercial lending. The upstream project has since been rebuilt into a different architecture, and my install deliberately stays on the older shape.

## Artifacts

- Upstream project: [github.com/DanMcInerney/architect-loop](https://github.com/DanMcInerney/architect-loop)
- Related theory: [Function-First Orchestration](/theories/function-first-orchestration)

[JAMES: the local hardened copy is unpublished. Publish a write-up of the v2.4 changes, link the upstream pull request, or keep both private? Recommendation: publish the write-up, link upstream, credit Dan by name in the first paragraph.]`,
};
