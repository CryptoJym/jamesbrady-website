import type { WorkEntry } from "@/lib/content/types";

export const entry: WorkEntry = {
  collection: "work",
  slug: "plimsoll",
  title: "plimsoll",
  kicker: "Spend telemetry",
  categories: ["open-source", "products"],
  answerCapsule:
    "Plimsoll is a local-first collector that ties AI coding spend to shipped outcomes, so a team can say what its tokens actually bought. The collector watches Claude Code and Codex on your own machine, records what each session cost, and joins those sessions to merged pull requests and passing checks. Content is discarded before anything reaches disk and identifying strings are hashed. The published unit is cost per merged pull request.",
  summary:
    "A local-first collector that joins AI coding spend to merged pull requests, so cost per shipped outcome stops being a guess.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:utlyze"],
  stack: [
    "TypeScript",
    "Node 20–24",
    "OpenTelemetry logs, traces and metrics",
    "Local SQLite ledger (90-day retention)",
    "pnpm monorepo",
    "macOS LaunchAgent",
  ],
  timeframe: { start: "2026-06" },
  anonymized: false,
  footFacts: [{ label: "Unit: dollars per merged pull request" }],
  repo: {
    owner: "CryptoJym",
    name: "plimsoll",
    public: true,
    stars: 0,
    license: "Apache-2.0",
    snapshotAt: "2026-08-11",
    lastPush: "2026-07-20",
  },
  liveUrls: [{ url: "https://plimsoll.dev", checkedAt: "2026-08-11", status: 200 }],
  deltas: [
    {
      metric: "Cost of one merged pull request, measured end to end",
      after: "$48.46",
      method:
        "Published in the project README: pull request #28, merged, checks passed. One session: 41,799 input tokens, 188,834 output tokens, 30.4M cache reads. Plimsoll measuring the pull request that built Plimsoll.",
      timeframe: "Single session, read 2026-08-11",
    },
  ],
  proofMetric: {
    value: 48.46,
    prefix: "$",
    unit: "one merged PR, measured end to end",
    method:
      "Published in the project README for PR #28: one session, 41,799 input tokens, 188,834 output tokens, 30.4M cache reads.",
    source: "Public repo README",
    lastActive: "2026-07-20",
    goLabel: "See the method",
    goHref: "/work/plimsoll",
    state: "active",
  },
  proof: [
    {
      label: "Repository — CryptoJym/plimsoll",
      url: "https://github.com/CryptoJym/plimsoll",
      method: "GitHub API read, public repo. Apache-2.0. TypeScript. Last push 2026-07-20.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Project site — plimsoll.dev",
      url: "https://plimsoll.dev",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Measured cost of PR #28",
      url: "https://github.com/CryptoJym/plimsoll",
      method:
        "Read from the published README: merged pull request, checks passed, one session, $48.46.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work.png",
    imageAlt: "James Brady — case study: plimsoll, telemetry for AI coding spend",
  },
  body: `## The problem

Teams spend real money on AI coding agents and cannot say what they got. Vendor dashboards stop at an org-level total. Nobody joins the spend to the thing that shipped. So the honest answer to "what did those tokens buy us" is a guess, and the guess is usually flattering.

## What I built

Plimsoll is a local-first collector that watches Claude Code and Codex on your own machine, records what each session cost, and joins those sessions to shipped outcomes: merged pull requests and passing checks. Then it does the division. Tokens per merged pull request. Cost per validated outcome. Where the spend produced nothing.

The name comes from Samuel Plimsoll, who in 1876 forced shipowners to paint a load line on every hull. Deaths from overloading fell, not because the rule was clever, but because the limit became visible to anyone standing on the dock.

## How it works in plain words

Claude Code sends hook events. Both tools send OpenTelemetry data. The collector listens on your machine at \`127.0.0.1:48271\` and writes to a local SQLite file. It does not send your work anywhere.

Before anything is written to disk, the collector throws away the content: prompts, model outputs, command bodies, file contents, diffs, and tool arguments. It hashes the things that identify you: emails, file paths, branch names, repository remotes. It keeps the boring parts plain: timestamps, tool names, models, token counts, costs, durations, and commit hashes.

Sessions join to pull requests by matching hashes, not names. Both sides hash the same normalized inputs, so the join works while the raw strings never leave your machine.

The health check is honest by design. \`doctor\` climbs four rungs, from \`not_installed\` to \`signal_verified\`, and only the top rung exits zero. A fresh install with no real token traffic fails, on purpose, instead of reporting a green light it has not earned.

## What is not finished

Stated as unfinished in the README: background service mode for npm installs is not fitted yet, and the lifecycle command set is proofed in isolation but not released. Release signing and npm publication are tracked in issue #103.

The privacy claim is testable rather than promised. The suppression rules live in \`packages/shared/src/policy.ts\` and the forbidden-field list lives in \`packages/shared/src/schemas.ts\`. A fidelity test plants sentinel commands, paths, and prompts, then fails if any of them survive to disk.

[JAMES: is there a second published cost-per-merged-PR figure you want on this page, from your own fleet rather than from the repo? If yes, supply the number, the window, and the repo it covers. Do not publish a fleet figure without your clearance.]

## Stack

TypeScript. Node 20 to 24. OpenTelemetry logs, traces, and metrics. Local SQLite ledger with 90-day retention. pnpm monorepo. macOS LaunchAgent. Optional hosted sync that is off by default.`,
};
