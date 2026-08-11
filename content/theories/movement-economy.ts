import type { TheoryEntry } from "@/lib/content/types";

export const entry: TheoryEntry = {
  collection: "theories",
  slug: "movement-economy",
  name: "Movement Economy",
  title: "What is a style rule a program can check?",
  flagLabel: "Sketched · enforced in code",
  what: "Every sentence in a piece of analysis must do one of ten declared jobs or be deleted. Enforced on map objects inside OfOne rather than applied by taste to prose.",
  maturity: "sketched",
  paused: false,
  claim:
    "A writing rule enforced by a program on structured objects removes decoration more reliably than the same rule applied by taste to prose.",
  abstract:
    "Movement Economy declares ten jobs a unit of analysis may do, requires every emitted unit to name its job, and deletes anything that cannot.",
  answerCapsule:
    "Movement Economy is a rule that every sentence in a piece of analysis must do one of ten declared jobs or be deleted. The ten jobs are: bound the question, ground it in evidence, make a claim, link two things, state a test, propose a move, evaluate options, warn, set a trigger, and gate a decision. Anything that does none of these is decoration, and decoration is removed.",
  summary:
    "Ten declared jobs a unit of analysis may do. Anything that does none of them is decoration, and gets deleted.",
  datePublished: "2026-06-18",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  artifactUrl: "https://github.com/CryptoJym/ofone-skillchain",
  artifactLabel: "Rule 8 in the repo",
  history: [
    { date: "2026-06-18", state: "sketched", note: "Named, defined, and enforced as rule 8 of the OfOne compiler." },
  ],
  proof: [
    {
      label: "Rule 8 in CryptoJym/ofone-skillchain",
      url: "https://github.com/CryptoJym/ofone-skillchain",
      method: "Read from the public README section \"The rules that keep it honest\", 2026-08-11.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/theories.png",
    imageAlt: "James Brady — theory: Movement Economy",
  },
  body: `Analysis bloats for a reason. Writing that sounds thoughtful gets rewarded. Framing, throat-clearing, restatement, and hedging all read as care. None of them change what a reader can do.

Movement Economy makes that testable. Ten jobs are declared up front. Every emitted piece has to name the job it does. If it cannot name one, it goes.

The effect is not shorter writing for its own sake. It is that everything left standing moves the decision somewhere. A reader can point at any sentence and ask which of the ten it is doing, and there is an answer or there is a deletion.

The rule lives inside OfOne, where it is enforced on the map objects rather than applied by taste to prose. That is the part worth stealing: a style rule that a program can check is a different kind of rule from a style rule you have to remember.

## Where this stands

Sketched. Named, defined, and enforced in code as rule 8 of the OfOne compiler. No standalone write-up exists yet, and no measurement of its effect on real documents. Until that measurement exists, the honest claim is that the rule is enforceable, not that enforcing it improves anything.

## Artifacts

- Rule 8 in [github.com/CryptoJym/ofone-skillchain](https://github.com/CryptoJym/ofone-skillchain), under "The rules that keep it honest"
- Related theory: [Universal Question Geometry](/theories/universal-question-geometry)`,
};
