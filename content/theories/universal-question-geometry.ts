import type { TheoryEntry } from "@/lib/content/types";

export const entry: TheoryEntry = {
  collection: "theories",
  slug: "universal-question-geometry",
  name: "Universal Question Geometry",
  title: "Why do questions have geometry?",
  flagLabel: "Flagship · working paper",
  what: "Questions have shape, and the shape predicts what an answer can reach. A map of how questions sit next to each other, and why some open doors that others structurally cannot.",
  maturity: "developed",
  paused: false,
  claim:
    "A question is an operator on a belief state, so a set of candidate questions has a computable value landscape and the next question can be selected rather than guessed.",
  abstract:
    "Universal Question Geometry treats inquiry as a search over a value landscape of questions rather than a list to be worked through, and it refuses to stop while a positive-expected-value question remains open.",
  answerCapsule:
    "Universal Question Geometry treats a question as an operation that changes the state of knowledge, which means questions can be ranked and scored before any of them are asked. The method keeps a running picture of the current state of knowledge, estimates how much each candidate question would move that picture, and selects the next question from the top of that ranking. Stopping is not allowed on the feeling of being finished; a stop attempt is rejected while a question with positive expected value is still open.",
  summary:
    "Treating a question as an operator on a belief state, so the next question can be ranked and selected instead of guessed.",
  datePublished: "2026-05-17",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  artifactUrl: "https://cryptojym.github.io/ofone-skillchain/",
  artifactLabel: "Read the walkthrough",
  history: [
    { date: "2026-05-17", state: "sketched", note: "Benchmark batch 01 opened with 90 predeclared run slots." },
    { date: "2026-08-01", state: "developed", note: "Engine, protocol, enforcement layer and documentation all run; evidence still open." },
  ],
  proof: [
    {
      label: "QUESTION_GEOMETRY.md in CryptoJym/ofone-skillchain",
      url: "https://github.com/CryptoJym/ofone-skillchain",
      method: "GitHub API read of the public repository, 2026-08-11.",
      capturedAt: "2026-08-11",
    },
    {
      label: "The walkthrough site",
      url: "https://cryptojym.github.io/ofone-skillchain/",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/theories.png",
    imageAlt: "James Brady — theory: Universal Question Geometry",
  },
  body: `Most inquiry runs on habit. Someone asks what comes to mind, gets an answer, asks the next thing that comes to mind, and stops when the list of questions runs out or the clock does. The order is accidental. The stopping point is a mood.

Universal Question Geometry starts from a different claim: questions have shape. A question is not a request for a fact. It is an operator that moves a belief state from one position to another. Some moves are large and some are tiny. Others open doors that later questions can walk through, which means their real value is not in their own answer but in what they unlock. If that is true, then a set of candidate questions has a landscape, with peaks, valleys, and a frontier of choices where you cannot improve one thing without giving up another.

The implementation makes that landscape computable. It ranks candidate questions over the current state, records the peaks, the valleys and the frontier, and re-ranks when an answer comes back and updates the beliefs and the causal structure underneath them.

## Three rules do most of the work

**Answers are qualified before they count.** A challenge pass is not complete because someone marked it complete. It is complete when the answers meet the conditions.

**Provenance is chained.** Every answer event is hashed with SHA-256 and linked to the one before it, so a state that was quietly edited after the fact does not pass verification.

**Depth is typed, not counted.** The familiar "five whys" rule stops at five because five is a memorable number. Here, the traversal continues by the type of thing you are standing on. You stop when you reach bedrock: a primary source, a named mechanism, or a human ruling. You do not stop when you get tired.

## Stopping has guards

A stop request is checked against residual expected value of information, decision robustness, whether a question was actually selected by the runtime, and whether any positive-value question remains. A rejected stop exits with code 2 and hands back the next required question. That is the part that changes behaviour most: a person who wants to be finished cannot simply declare it, because the runtime is holding an open question with a positive score and will say so.

Two more things exist because inquiry gets stuck rather than wrong. Stall detection notices when the loop is circling and switches operator. And a configured safety boundary sends the whole thing to a human before it can run away.

## What is proven, and what is not

The engine, the protocol, the enforcement layer, and the documentation all exist and run. The evidence does not exist yet, and this page is not going to imply otherwise.

The project's own benchmark standard demands at least 21 retrospective cases across six task families before any performance claim, and batch 01 stands at 52 of 90 predeclared run slots. The repository states in writing that the included benchmark is a smoke test and establishes nothing. So the honest state of this theory is: developed, and deliberately unproven. The machinery is real and the discipline around it is real. The result is still outstanding.

That gap is stated here rather than papered over, because a theory page exists to be checked. A reader who wants to disagree with this one has everything needed to do it: the runnable loop, the standard it will be judged against, and the count of how far the evidence has got.

## Artifacts

- \`QUESTION_GEOMETRY.md\` and \`docs/question-geometry-engine.md\` in \`github.com/CryptoJym/ofone-skillchain\`
- The runnable loop: \`node scripts/ofone-question-loop.mjs\`
- The walkthrough site: [cryptojym.github.io/ofone-skillchain](https://cryptojym.github.io/ofone-skillchain/)
- Related case study: [OfOne](/work/ofone)`,
};
