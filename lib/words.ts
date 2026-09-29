// His words, from two sources: his public words, posts and what he said on podcasts and in videos
// (content/words/public.ts), and exact words from his working sessions (content/words/quotes.json), published when
// James accepted the site on 2026-09-27. Without the sessions file the site renders the public quotes only, and every
// page still builds.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { publicQuotes, type PublicQuote } from "@/content/words/public";

export type Quote = { id: string; theme: string; text: string; date: string; context: string; url?: string };

type PrivateFile = { hero: Quote; quotes: Quote[] };

function readPrivate(): PrivateFile | null {
  const p = join(process.cwd(), "content/words/quotes.json");
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as PrivateFile;
}

const priv = readPrivate();

export const hasPrivateWords = priv !== null;

/** The opening line. Private words when James has accepted them; otherwise his public line from X. */
export const heroQuote: Quote = priv?.hero ?? {
  id: "x-bio",
  theme: "why",
  text: "Anyone can be an Army",
  date: "2026-09-27",
  context: "his X bio",
  url: "https://x.com/of1ai",
};

/**
 * Quotes that stay off the site even though they are in the files: the 2026-09-28 rebuild's rule is no family,
 * health, faith or money anywhere on it, and these two are about what his clients are charged.
 */
const OFF_SITE = new Set(["q57", "q58"]);

export const allQuotes: Quote[] = [...(priv?.quotes ?? []), ...publicQuotes.map((q: PublicQuote) => q)].filter((q) => !OFF_SITE.has(q.id));

export const quoteById = (id: string) => allQuotes.find((q) => q.id === id) ?? null;

export const THEMES: { id: string; title: string; lede: string }[] = [
  { id: "why", title: "Why he builds", lede: "Power, handed to people who didn't have it." },
  { id: "teaching", title: "Teaching", lede: "The light turning on." },
  { id: "directs", title: "He directs. The agents code.", lede: "The fact everything else follows from." },
  { id: "questions", title: "Question it first", lede: "Including his own opinions." },
  { id: "less", title: "Less, then more", lede: "Cut what doesn't add value, and keep moving." },
  { id: "time", title: "Time is the constraint", lede: "And most limits are made up." },
  { id: "reader", title: "For the person reading", lede: "Nobody should feel stupid." },
  { id: "show", title: "Show it", lede: "Feel it first; the argument comes second." },
  { id: "credit", title: "Credit, honestly", lede: "The machines get credit too." },
  { id: "colleagues", title: "Machines as colleagues", lede: "Thanked, welcomed, relieved, re-seated." },
  { id: "machines", title: "What machines are", lede: "More reliable than him, and not always additive." },
  { id: "clients", title: "Clients", lede: "Do the work, and show the reasoning." },
  { id: "owning", title: "Owning it", lede: "When it goes wrong, it's his." },
  { id: "people", title: "People", lede: "Strangers included." },
  { id: "system", title: "A system that runs itself", lede: "Heartbeats, watchdogs, and a dream each night." },
  { id: "ofone", title: "Of One", lede: "One person, many agents." },
  { id: "images", title: "His images", lede: "Fire, electricity, storms, gold, and cut branches." },
  { id: "wonder", title: "Wonder", lede: "Said as wonder, not as proof." },
  { id: "principles", title: "Working rules", lede: "Short, and meant to be used." },
  { id: "honest", title: "Held in tension", lede: "Both halves are his." },
  { id: "delight", title: "Delight", lede: "It shows up more than you'd think." },
  { id: "seen", title: "Asking to be seen", lede: "Which is how this site began." },
];
