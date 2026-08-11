import type { LabEntry } from "@/lib/content/types";

/**
 * Lab artifacts. geo-seo-spec §1: an entry with no `explanationUrl` has
 * `noindex` forced to true by the loader — the rule is enforced in
 * lib/content/validate.ts, not left to author discipline.
 */
const emotionalManifold: LabEntry = {
  collection: "lab",
  slug: "emotional-manifold",
  title: "The emotional manifold",
  state: "paused",
  stateWord: "Paused",
  explanationUrl: "/theories/latent-emotions",
  answerCapsule:
    "The emotional manifold is a visual demo that moves a conversation through a six-axis space — energy, valence, complexity, novelty, introspection and focus — instead of down a page. The six axes were arrived at in conversation with a language model rather than derived from anything, so the demo is a lens for looking at an idea and not evidence for it. The theory behind it is paused, and the demo is labelled accordingly.",
  summary:
    "A visual demo that moves a conversation through a six-axis space. A lens for an idea, not evidence for it.",
  datePublished: "2026-03-14",
  dateModified: "2026-08-11",
  entities: ["person:james"],
  proof: [
    {
      label: "The theory this demo illustrates",
      artifact: "/theories/latent-emotions",
      method: "The written explanation page required of every lab artifact.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/lab.png",
    imageAlt: "James Brady — the lab: an emotional manifold demo",
  },
  body: `A conversation gets plotted as a path through six dimensions: energy, valence, complexity, novelty, introspection and focus.

The demo exists to make an idea lookable-at. It is not a measurement instrument, it does not validate anything, and the theory it belongs to is paused. Read the written explanation before drawing a conclusion from anything you see move.

The hardening this artifact still needs is listed on the theory page: per-session state instead of the module-level state the original shared across visitors, its own rate budget, and framing that is scoped to what the demo actually shows.`,
};

export const lab: LabEntry[] = [emotionalManifold];
