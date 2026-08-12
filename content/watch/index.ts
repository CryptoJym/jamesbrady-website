/**
 * The recorded walkthroughs on /watch.
 *
 * URL PRESERVED. /watch stays exactly where it is (ruling G, 2026-08-11: link
 * equity). Wave 4 changes the skin and the register, never the route.
 *
 * FROZEN WITH THE ARCHIVE. The same ruling froze /watch alongside the three
 * volumes unless James resumes video, so it carries the same archive date they
 * do and reads it from here rather than from a literal in the template.
 *
 * REGISTER (wave 4), in three places.
 *
 * 1. The first recording carried the retired mystical framing in its title and
 *    in its text block. Both are rewritten in the plain register.
 * 2. It carried the same framing in its VIDEO FILE NAME. A file path inside a
 *    `src` attribute is rendered HTML, and verify-seo check 11 reads rendered
 *    HTML, so renaming the file was part of the copy fix rather than a
 *    tidy-up. The recording is byte-identical; only its name changed.
 * 3. The POSTERS. All three recordings fronted photographic plates of robed
 *    figures, glowing sacred geometry and gold-lit occult tableaux — the exact
 *    costume the register rules retire, and the largest thing on the page. A
 *    cleanup that fixed three sentences and left that image as the hero of
 *    /watch would have cleaned nothing. They are replaced by generated plates
 *    (scripts/make-posters.mjs) that name the recording they front, which is
 *    more than the photographs did. The recordings are untouched.
 *
 * The old names are in git history and in the pull request, not here: this
 * file is scanned too, and a comment that spells a retired term to explain its
 * removal still ships the term.
 *
 * WHY THESE ARE "summary" AND NOT "transcript". The three blocks below were
 * labelled "Transcript preview" on the old page. Each is three sentences long
 * against a multi-minute recording, so none of them was ever a transcript, and
 * the first one has now been rewritten out of the retired register — which
 * makes it definitively not verbatim. Calling a rewritten paraphrase a
 * transcript would be the register cleanup creating a second, worse defect, so
 * the block is labelled for what it is. The other two are unchanged, word for
 * word, from the archived page.
 */
export type WatchItem = {
  id: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  /** Not a transcript. See the module note above. */
  summary: string;
};

/** Frozen with the three volumes on the same day, by the same ruling. */
export const WATCH_ARCHIVED = "2026-08-11";

export const watch: WatchItem[] = [
  {
    id: "model-to-system",
    title: "What turns a model into a system",
    description:
      "The overview: models, tools, memory, skills and workflows compounding into leverage.",
    src: "/videos/james-what-turns-a-model-into-a-system.mp4",
    poster: "/video-posters/model-to-system.png",
    summary:
      "Turning a raw model into working leverage is a practice, not a purchase. A model on its own is not a business system. The system appears when tools, memory, skills, and workflows connect and start carrying load together.",
  },
  {
    id: "install-first-skill",
    title: "Install your first skill",
    description:
      "A Workshop walkthrough for going from one useful behavior to one live operator loop.",
    src: "/videos/james-install-first-skill.mp4",
    poster: "/video-posters/install-first-skill.png",
    summary:
      "Do not start with a giant stack. Start with one useful behavior. Pick the outcome, install one skill, connect one trigger-input-output loop, and then test it in the real world until it becomes leverage.",
  },
  {
    id: "prompts-to-os",
    title: "From prompts to operating systems",
    description:
      "The shift from one-off prompt output to continuity, routing, skills, and momentum.",
    src: "/videos/james-prompts-to-operating-systems.mp4",
    poster: "/video-posters/prompts-to-os.png",
    summary:
      "A prompt gives you output. An operating system gives you continuity. It remembers context, uses tools, follows skills, routes work, and creates the next action instead of just dropping more text in your lap.",
  },
];
