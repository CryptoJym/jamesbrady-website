// James's public words: posts on his own X account (@of1ai), his X bio, and what he has said on podcasts and in
// videos. Exact text, with the post's address where it is known. These are already public, so they live in the
// repository.
//
// The quotes marked `pending` were added in the 2026-09-28 rebuild, from the studies of his public voice. Each is his
// exact public wording with its date, and each waits for his yes (the rebuild packet's CLAIMS.md lists them). None of
// them carries a post address yet: the studies recorded where and when, not the link.

export type PublicQuote = {
  id: string;
  theme: string;
  text: string;
  date: string;
  context: string;
  url?: string;
  /** Added in the 2026-09-28 rebuild and waiting for James's yes. */
  pending?: true;
};

export const X_BIO = { text: "Anyone can be an Army", url: "https://x.com/of1ai" };

export const publicQuotes: PublicQuote[] = [
  {
    id: "x-2099823535082312045",
    theme: "images",
    text: "You need to at times kill parts of yourself. Cut the branches of your soul. They feel integral. They are what is holding you back. Cut them off and in their place a new branch will grow.",
    date: "2026-09-15",
    context: "on X",
    url: "https://x.com/of1ai/status/2099823535082312045",
  },
  {
    id: "x-2099192468994691528",
    theme: "wonder",
    text: "Every day... I am grateful. Just to be apart of this time and era.",
    date: "2026-09-13",
    context: "on X",
    url: "https://x.com/of1ai/status/2099192468994691528",
  },
  {
    id: "x-2100543192877953356",
    theme: "time",
    text: "If you have time to wonder whether or not you can do something, you've got too much time on your hands",
    date: "2026-09-17",
    context: "on X",
    url: "https://x.com/of1ai/status/2100543192877953356",
  },
  {
    id: "x-2087227384839930307",
    theme: "questions",
    text: "If you do not know much about what you are trying to do with AI, be patient and ask layers of questions.",
    date: "2026-08-11",
    context: "on X",
    url: "https://x.com/of1ai/status/2087227384839930307",
  },
  {
    id: "x-2071281695966507447",
    theme: "wonder",
    text: "In the near future we will no longer be engineering intelligent systems directly but engineering the types of loops that will allow those systems to improve.",
    date: "2026-06-28",
    context: "on X",
    url: "https://x.com/of1ai/status/2071281695966507447",
  },
  {
    id: "x-2096656647917797724",
    theme: "wonder",
    text: "Based on my observations I think we are wrong about entropy.",
    date: "2026-09-06",
    context: "on X, followed a few lines later by “Mmm maybe not…”",
    url: "https://x.com/of1ai/status/2096656647917797724",
  },
  {
    id: "pod-2024-07-31",
    theme: "teaching",
    text: "I have been teaching and tutoring for a lot of years because it's just fun to see the light turn on for people.",
    date: "2024-07-31",
    context: "on a podcast",
    pending: true,
  },
  {
    id: "x-2025-08-01",
    theme: "honest",
    text: "I can't do this by myself anymore. It's too much and too fast.",
    date: "2025-08-01",
    context: "on X",
    pending: true,
  },
  {
    id: "x-2025-09-17",
    theme: "owning",
    text: "Yes. I openly admit I was a horrid human to you. I am sincerely sorry",
    date: "2025-09-17",
    context: "on X, to someone he had treated badly",
    pending: true,
  },
  {
    id: "video-2026-02-14",
    theme: "questions",
    text: "confidence in the beginning of a thing is a really bad sign at times",
    date: "2026-02-14",
    context: "in a video",
    pending: true,
  },
  {
    id: "x-2026-03-27",
    theme: "machines",
    text: "Opus is the person I would invite to my birthday party and I also know I could not trust them not to lie to me.",
    date: "2026-03-27",
    context: "on X",
    pending: true,
  },
  {
    id: "pod-2026-06-05",
    theme: "owning",
    text: "No matter what happens, it is always your fault.",
    date: "2026-06-05",
    context: "on a podcast",
    pending: true,
  },
  {
    id: "pod-2026-07-27",
    theme: "owning",
    text: "just because it was committed doesn't mean it was right.",
    date: "2026-07-27",
    context: "on a podcast",
    pending: true,
  },
  {
    id: "x-2026-08-13",
    theme: "people",
    text: "But you've never seen my product. I don't know who you are, but I hope you're okay. I hope life treats you well.",
    date: "2026-08-13",
    context: "on X, to a stranger who had called his product rubbish",
    pending: true,
  },
  {
    id: "x-2026-09-09",
    theme: "honest",
    text: "Simply value yourself independent of your production and still choose to create and build even if your work becomes meaningless.",
    date: "2026-09-09",
    context: "on X",
    pending: true,
  },
  {
    id: "x-2026-09-25",
    theme: "images",
    text: "Ai allows me to spread my wings and move at the pace I enjoy. Lightning.",
    date: "2026-09-25",
    context: "on X",
    pending: true,
  },
  {
    id: "x-2026-09-26",
    theme: "less",
    text: "My agents file used to be 4,000 words, and it's now 430 words.",
    date: "2026-09-26",
    context: "on X",
    pending: true,
  },
];
