// James's public words: posts on his own X account (@of1ai) and his X bio. Exact text, with the post's
// address. These are already public, so they live in the repository.

export type PublicQuote = { id: string; theme: string; text: string; date: string; context: string; url: string };

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
];
