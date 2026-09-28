// The threads of James's public record: which repositories grow which branch of the specimen.
//
// Editorial, and sourced: dates and counts come from content/history/history.snapshot.json (GitHub,
// public data only) and the 2026-09-27 work study. Only repositories in allowlist.json may be named.
// A repository listed in no thread still grows, as an unlabelled twig on the trunk.

export type ThreadStatus = "active" | "dormant" | "paused" | "retired";

export type PrivateBranch = {
  label: string;
  /** First evidence of the private work (repository creation, or the site's own dating). */
  start: string;
  /** Last evidence, or omitted when it is still running. */
  end?: string;
  source: string;
};

export type Cut = { repo?: string; date: string; note: string };

export type Thread = {
  id: string;
  name: string;
  status: ThreadStatus;
  /** One plain sentence a stranger can read. */
  note: string;
  repos: string[];
  /** Work that exists but can't be seen from outside: drawn as frosted glass, with no beads. */
  private?: PrivateBranch[];
  /** Work with no repository (site content), dated by the site itself. */
  span?: { start: string; end?: string; source: string };
  cuts?: Cut[];
  /** The /work page for this thread, when one exists. */
  work?: string;
};

const LANDINGS_2025_09_13 = [
  "ceo-solace-hub", "code-relief-ai", "solo-advocate-ai", "people-first-hr-flow", "vp-bridgewise",
  "director-flow", "innovate-again", "unicorn-finder-ai", "revenue-unburdened", "solo-boss-boost",
  "founder-vision-unlocked", "unicorn-scale-ops", "tiny-team-tenx", "dev-people-ai", "solo-marketer-ignite",
  "cpo-vision-ai", "legal-zen-llc", "corp-scale-ai", "mission-amp-ai", "impact-amplify-ai", "meta-ai-lead",
  "alpha-deal-stream",
].map((r) => `h3ro-dev/${r}`);

export const threads: Thread[] = [
  {
    id: "of-one",
    name: "Of One",
    status: "active",
    note: "One person plus AI, for each job in a company: a decision method (Ask, Map, Move) and a network of sites that teach it and sell it.",
    repos: [
      "CryptoJym/businessofone",
      ...["ceoofone", "directorofone", "vcofone", "vpofone", "companyofone", "lawyerofone", "unicornofone", "hrofone", "ofone-ui"].map((r) => `h3ro-dev/${r}`),
      ...LANDINGS_2025_09_13,
      "CryptoJym/ofone-skillchain",
    ],
    private: [{ label: "The Of One sites, on one template", start: "2026-09-24", source: "private repository, created 2026-09-24" }],
    cuts: [{ date: "2025-09-24", note: "22 landing pages made in one day, then left: ideas, not products." }],
    work: "ofone",
  },
  {
    id: "plimsoll",
    name: "Plimsoll",
    status: "active",
    note: "A free meter for what AI coding helpers cost, matched to the work that actually merged.",
    repos: ["CryptoJym/plimsoll"],
    private: [{ label: "Plimsoll's hosted version", start: "2026-06-10", source: "private repository, created 2026-06-10" }],
    cuts: [{ date: "2026-09-07", note: "Rebuilt after the first version captured almost nothing; v0.7.0 shipped 2026-09-07." }],
    work: "plimsoll",
  },
  {
    id: "fleet",
    name: "The fleet",
    status: "active",
    note: "The agents, shared memory and tools that let one person run many agents at once.",
    repos: [
      "h3ro-dev/borg", "h3ro-dev/agent-landing-fleet", "h3ro-dev/loop-distillery", "CryptoJym/omnara-capability-audit",
      "CryptoJym/Overseer", "h3ro-dev/Agent-starter-kit", "h3ro-dev/autonomous-project-manager",
      "CryptoJym/ai-agent-village-monitor", "h3ro-dev/claude-power-tools", "h3ro-dev/codexinstructions",
      "CryptoJym/utlyze-taskmaster-mem0", "CryptoJym/Agent-Foundary", "CryptoJym/agent-foundry", "CryptoJym/CryptoJym",
    ],
  },
  {
    id: "connectors",
    name: "Connectors",
    status: "dormant",
    note: "Small bridges that let an AI assistant use other apps. Still his most-starred code.",
    repos: [
      "h3ro-dev/heygen-mcp-adapter", "h3ro-dev/tiktok-mcp-adapter", "h3ro-dev/TimingApp-MCP", "CryptoJym/marketing-mcp-servers",
      "h3ro-dev/cursor-admin-mcp", "h3ro-dev/motion-mcp-server", "h3ro-dev/limitless-mcp-server", "CryptoJym/gamma-mcp-server",
      "CryptoJym/oss-120b-pm-mcp", "CryptoJym/freshbooks-mcp-server", "CryptoJym/gohighlevel-mcp-server", "CryptoJym/gohighlevel-mcp",
      "h3ro-dev/heygenagent", "h3ro-dev/loom-autopublisher", "h3ro-dev/limitless-intake-pipeline", "h3ro-dev/website-eater",
      "h3ro-dev/ai-image-animation-pipeline", "CryptoJym/nanobanana-api",
    ],
  },
  {
    id: "minds",
    name: "Minds and brainwaves",
    status: "active",
    note: "An open question he keeps coming back to: what minds, human and machine, have in common. Every result so far is marked inconclusive.",
    repos: [
      "CryptoJym/bci-research", "CryptoJym/eeg-meditation-analysis", "CryptoJym/eeg-burst-recorder",
      "CryptoJym/brain-visualization-app", "CryptoJym/knowledge-divergence-model", "h3ro-dev/eegt",
    ],
    work: "eeg-meditation-analysis",
  },
  {
    id: "found",
    name: "Getting found",
    status: "active",
    note: "Measuring and fixing how findable a business is, on Google and inside AI answers.",
    repos: [
      "CryptoJym/seopr1-site", "h3ro-dev/visibility-portal", "CryptoJym/ai-readiness-assessment",
      "CryptoJym/ai-opportunity-analyzer", "CryptoJym/ai-analyzer-complete-docs", "CryptoJym/ai-lead-gen-pro",
    ],
    private: [{ label: "The visibility platform", start: "2025-11-01", source: "private; dated by this site's case study" }],
    work: "visibility-platform",
  },
  {
    id: "methods",
    name: "Methods",
    status: "active",
    note: "Playbooks and rules for getting reliable work out of AI, including one design that isn't his, credited.",
    repos: [
      "CryptoJym/problem-solving-system", "CryptoJym/ux-design-laws", "CryptoJym/architect-loop",
      "CryptoJym/symphony", "CryptoJym/repo-atlas-saas",
    ],
  },
  {
    id: "site",
    name: "This site",
    status: "active",
    note: "The page you are on, rebuilt more than once.",
    repos: ["CryptoJym/jamesbrady-website", "CryptoJym/oracles-not-orgcharts"],
    cuts: [{ repo: "CryptoJym/oracles-not-orgcharts", date: "2026-08-11", note: "An earlier version of this site, retired." }],
  },
  {
    id: "teaching",
    name: "Teaching",
    status: "retired",
    note: "Three volumes on building with AI when you don't code. Archived in place.",
    repos: [],
    span: { start: "2026-02-01", end: "2026-08-11", source: "this site's /learn, archived 2026-08-11" },
    cuts: [{ date: "2026-08-11", note: "Archived in place." }],
  },
  {
    id: "studio",
    name: "Utlyze, the studio",
    status: "active",
    note: "The studio's own sites and pieces.",
    repos: [
      "CryptoJym/utlyze-futuristic", "CryptoJym/utlyze-business-structure-site", "h3ro-dev/UtlyzeAnimationSequence-BGC",
      "h3ro-dev/EEX-Graphic---Horizontal---SVG", "h3ro-dev/Progress7bgc",
    ],
  },
  {
    id: "work-economy",
    name: "Work and the economy",
    status: "dormant",
    note: "A summer of charts and decks on how AI is changing work.",
    repos: [
      "CryptoJym/future-of-work-dashboard", "CryptoJym/ai-revolution-deck", "CryptoJym/ai-revolution-presentation",
      "CryptoJym/future-work-insights", "CryptoJym/employment-analytics",
    ],
  },
  {
    id: "compliance",
    name: "Compliance research",
    status: "dormant",
    note: "Research tools for background-check rules.",
    repos: ["CryptoJym/fcra-cra-checklist", "CryptoJym/fcra-compliance-researcher"],
  },
  {
    id: "play",
    name: "Play",
    status: "active",
    note: "Games and small learning apps, made to see what the tools could do.",
    repos: [
      "h3ro-dev/Tanks-of-Glory", "h3ro-dev/STRIDE", "h3ro-dev/Fitnessfuntimes", "h3ro-dev/cats", "h3ro-dev/Astroevents",
      "h3ro-dev/FlashCardsofPOWER", "h3ro-dev/vibe-coder-flashcards", "CryptoJym/dbz-sidescroller",
      "CryptoJym/bomberman-classic-web", "CryptoJym/ember-dash", "CryptoJym/hyrule-forge", "CryptoJym/math-common-core-missions",
    ],
  },
];

/** The anonymous bucket of merges in other people's repositories: a client's site and one other project. */
export const OUTSIDE_WORK = {
  id: "outside",
  name: "Client work",
  note: "Changes merged into a client's website and one other person's project. Clients are named by industry only.",
};

/** The one upstream contribution, credited to the project's author. */
export const UPSTREAM_NOTE = "His fix, merged into Dan McInerney's Architect Loop.";
