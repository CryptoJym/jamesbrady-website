import type { WorkEntry } from "@/lib/content/types";

export const entry: WorkEntry = {
  collection: "work",
  slug: "ofone",
  title: "OfOne",
  kicker: "Decision compiler",
  categories: ["products", "open-source"],
  answerCapsule:
    "OfOne is an open-source decision compiler that turns a hard question into a typed, checkable map before it writes any prose. The map holds evidence, claims, unknowns, kill tests, causal edges, options, triggers and human gates. A validator program checks the map, and only a map that passes gets rendered into an answer. When a new fact arrives, only the chain that depended on the changed fact is patched, and the system reports what it invalidated.",
  summary:
    "An open-source decision compiler: a hard question becomes a typed, validated map, and the prose you read is a rendering of that map.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  stack: [
    "Node.js",
    "JSON Schema",
    "Semantic graph validator",
    "Markdown skill definition (SKILL.md)",
    "GitHub Pages",
    "Vite",
    "React",
    "tRPC",
    "Drizzle",
    "Vercel",
    "Railway",
  ],
  timeframe: { start: "2026-05" },
  anonymized: false,
  footUnit: "Docs live · MIT",
  repo: {
    owner: "CryptoJym",
    name: "ofone-skillchain",
    public: true,
    stars: 0,
    license: "MIT",
    snapshotAt: "2026-08-11",
    lastPush: "2026-08-01",
  },
  liveUrls: [
    { url: "https://cryptojym.github.io/ofone-skillchain/", checkedAt: "2026-08-11", status: 200 },
    { url: "https://of1.ai", checkedAt: "2026-08-11", status: 200 },
  ],
  deltas: [
    {
      metric: "Predeclared benchmark run slots complete",
      before: "0 of 90",
      after: "52 of 90",
      method:
        "Counted from batch 01 of the project's own benchmark standard, which requires at least 21 retrospective cases across six task families before any performance claim.",
      timeframe: "Batch 01 opened 2026-05-17, read 2026-08-11",
    },
  ],
  proofMetric: {
    value: 52,
    unit: "of 90 predeclared benchmark slots run",
    method:
      "Counted from batch 01. The repo states in writing that the included interactive benchmark is a smoke test and establishes nothing.",
    source: "Public repo · docs site",
    lastActive: "2026-08-01",
    goLabel: "Read the docs",
    goHref: "/work/ofone",
    state: "active",
  },
  proof: [
    {
      label: "Repository — CryptoJym/ofone-skillchain",
      url: "https://github.com/CryptoJym/ofone-skillchain",
      method: "GitHub API read, public repo. MIT licensed. Version badge 0.7.0. Last push 2026-08-01.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Live walkthrough site",
      url: "https://cryptojym.github.io/ofone-skillchain/",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Live product front — of1.ai",
      url: "https://of1.ai",
      method: "HTTP GET following redirects, returned 200.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work.png",
    imageAlt: "James Brady — case study: OfOne, a decision compiler",
  },
  body: `## The problem

Ask an expert a hard question and you get an essay back. The essay reads well. You cannot check it. You cannot see which facts it rests on, how old those facts are, what would change the answer, or where a person was supposed to sign off. When the world moves, the whole essay has to be rewritten, because nobody can tell which parts still hold.

## What I built

OfOne turns a hard question into a map before it writes a single sentence of answer. The map is made of typed objects: evidence, claims, unknowns, kill tests, causal edges, options, triggers, and human gates. A validator program checks the map. Only a map that passes gets turned into prose. The answer you read is a rendering of the map, the way a photograph is a rendering of a building. The blueprint stays attached.

Two pieces ship. \`ofone-skillchain\` is the open method: the skill file, the schemas, the validator, the adapters, and a live walkthrough site. \`of1.ai\` is the product front that teaches the same method as three steps, Prism, Map, and Forge.

## How it works in plain words

You state what is being decided, over what time, at what stakes. That is the charter. Then you list your evidence, and each piece carries its source, how fresh it is, and how reliable it is. Claims sit on top of evidence. Anything you do not know becomes a real object called an unknown, and an unknown is allowed to block the recommendation. Every strong claim has to name the result that would prove it wrong.

Confidence is low, medium, or high, plus a named reason. Never a made-up percentage.

When a new fact shows up, the map does not get rewritten. The system patches only the chain of claims, options, and gates that actually depended on the fact that changed, and it reports what it invalidated.

Four adapters translate the same skeleton into four working languages: strategy and operations, science and engineering, formal proof, and contested-values questions. Real problems mix these, so a map can declare a mix instead of pretending one lens fits.

## What is not proven

The benchmark suite is a scaffold, not a result. The project's own standard requires at least 21 retrospective cases across six task families before any performance claim. Batch 01, opened 2026-05-17, records 52 of 90 predeclared run slots complete with local reviews. The repo says in writing that the included interactive benchmark is a smoke test and does not establish superiority. OfOne makes no speed or accuracy claim, and neither does this page.

One excluded run is kept on purpose. A full-OfOne slot was rejected because its artifact identity was copied from the wrong case. The failed run stays in the repo as immutable evidence, and the rerun is tracked separately so history is not rewritten.

[JAMES: of1.ai sign-in is currently broken, and the Cartographer feature is not working in production. Do you want that stated on this page, kept off it, or fixed before the page ships? Recommendation: fix or scope the page to the method and the open-source compiler, which are both provably live.]

## Stack

Node.js. JSON Schema plus a semantic graph validator. Markdown skill definition (\`SKILL.md\`). GitHub Pages for the walkthrough. Product front: Vite, React, wouter, shadcn/ui, tRPC, Drizzle, deployed on Vercel, API on Railway.`,
};
