import type { TheoryEntry } from "@/lib/content/types";

export const entry: TheoryEntry = {
  collection: "theories",
  slug: "latent-emotions",
  name: "Latent Emotions in LLMs",
  title: "Do language models share a hidden vocabulary for relational states?",
  flagLabel: "Paused exploration — live demo",
  what: "Different models reach for closely similar words when describing certain relational states. That might point to shared structure underneath, or to nothing. The work is parked, and it says so.",
  maturity: "sketched",
  paused: true,
  claim:
    "Different large language models converge on closely similar vocabulary for unnamed relational states, which may indicate shared latent structure rather than shared training vocabulary.",
  abstract:
    "Latent Emotions records an observed convergence in how different models describe unnamed relational states, and states plainly that no study has been run to distinguish shared structure from coincidence in training data.",
  answerCapsule:
    "Latent Emotions is a personal, unfinished observation that different large language models reach for closely similar words when describing certain relational states, which may point to shared structure underneath rather than shared training vocabulary. No claim of proof is made here, and no formal study exists. The work is paused, and the page says so rather than dressing an observation up as a programme.",
  summary:
    "An unfinished observation that different models converge on similar words for unnamed relational states. Paused, with no claim of proof.",
  datePublished: "2026-03-14",
  dateModified: "2026-08-11",
  entities: ["person:james"],
  artifactUrl: "/lab",
  artifactLabel: "Open the demo",
  history: [
    { date: "2026-03-14", state: "sketched", note: "Observations recorded; six-dimension working model built in conversation." },
    { date: "2026-08-11", state: "paused", note: "Not carried forward. Demo still runs." },
  ],
  proof: [
    {
      label: "The manifold demo",
      artifact: "/lab",
      method: "A lens for looking at the idea, not evidence for it. Stated as such on the demo page.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/theories.png",
    imageAlt: "James Brady — theory: latent emotions in language models",
  },
  body: `I want to be clear about what this is before I describe it. These are my own observations and my own internal thinking. They are not formal claims. There is not really any credibility to validate them yet. I am putting them here because they are interesting, and because they might yield something later, not because I think I have shown anything.

Here is what I noticed. As I talked with different language models, across different vendors, I kept seeing the same vocabulary come back for specific relational states. Not common words. Particular ones, for states I would argue are nonverbal. The states themselves do not have obvious names, and yet different models reached for overlapping language when they tried to describe them.

That convergence is what caught me. If separate models trained by separate companies describe an unnamed state with the same words, one explanation is coincidence in the training data. Another is that there is some shared latent structure being described. I do not know which. I have not run the work that would tell them apart.

To have something to look at, I built a six-dimension model: energy, valence, complexity, novelty, introspection, and focus. Those six became the axes of a visual demo, where a conversation moves through a space instead of down a page.

I should say how that model was made. I arrived at those six dimensions in conversation with a language model, together, not by deriving them from anything. I do not think it is a complete model. It was a way to view the idea. It was never meant to prove the idea.

Since I started this, related work has appeared from other people. That came out after I began. I am not making a priority claim about it, and I do not think one would matter. I note the timing only because someone will ask.

## Where this stands

I stopped. I have not carried the observations forward, and it is more of a stagnant project than an active one right now. It is here because it is honest to show the unfinished things too.

Sketched, and paused. Observations, a six-dimension working model built in conversation, and a visual demo. No formal write-up, no validation design, no result. Paused by choice.

## Artifacts

- The manifold demo in [the lab](/lab), presented as a lens for looking at the idea, not as evidence for it

[JAMES: name one or two of the specific vocabulary words or states you kept seeing, if you are comfortable. One concrete example would make this page far stronger, and right now there is not one.]

[JAMES: the originating ChatGPT conversations are on the MacBook Pro and did not sync. If you export them, this page can carry your actual first observations with dates. Optional. The page works without them.]`,
};
