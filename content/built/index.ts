// What James built, won and made work: the site's own wording of the pieces of work it shows.
//
// Source: the successes list of the 2026-09-28 studies (the items marked possible for the site). Every entry keeps
// the study item's id, so each sentence here traces back to one item. Statuses are the study's, as it checked them on
// 2026-09-28: live (in use today), shipped (finished and delivered), retired (ended) or unknown.
//
// The rules this file is written under, and does not bend:
//   · Nothing invented. A sentence here says what its item says, or less.
//   · Clients are named by industry only: no names, domains, staff or repositories that name them.
//   · No family, health, faith or money: no revenue, fees, prices, stakes, spend, debts or pay.
//   · Vuplicity is not here. It appears on this site only as a way to work with him (/work-with-me).
//   · Work known only from his private messages gets one line at most (`mentionedOnly`, below), no detail, and is
//     listed for his yes.
//
// The specimen reads this file too (lib/specimen/grow.ts). A piece of work with a public repository colours that
// repository's branch with its status; work with no repository grows a branch of its own, dated where it began; and
// each outcome is a bead of the second kind: a result for a client, or people taught.

export type BuiltStatus = "live" | "shipped" | "retired" | "unknown";

export type BuiltKind = "clients" | "companies" | "tools" | "teaching" | "fleet";

/** A published figure, and where it was published. */
export type Figure = { n: number; unit?: string; method: string };

/** A result for a client, or people taught: the second kind of bead. */
export type Outcome = {
  /**
   * ISO date, or YYYY-MM when the source gives only the month. Absent when the source gives no date of its own: the
   * bead then sits evenly along its work's dates, and the site prints no date for it.
   */
  date?: string;
  for: "client" | "taught";
  /** The sentence the site prints. When there is a figure, it reads on from the figure. */
  text: string;
  figure?: Figure;
};

export type Built = {
  /** The study item's id. */
  id: string;
  /** The study's order, biggest first. Used only for how thick the work's own branch grows. */
  rank: number;
  kind: BuiltKind;
  name: string;
  what: string;
  /** YYYY-MM-DD, or YYYY-MM when only the month is known. */
  start: string;
  /** Absent while it is still running. */
  end?: string;
  status: BuiltStatus;
  /** The thread (content/history/threads.ts) whose side of the specimen it grows on. */
  thread: string;
  /** Public repositories in that thread that are this work. Their branches carry its status. */
  repos?: string[];
  /** A private branch of that thread (threads.ts) that is this work. */
  privateBranch?: string;
  /** The anonymous branch of changes merged into a client's website. */
  outside?: true;
  /** The thread's own dated branch (work with no repository, dated by this site: threads.ts `span`). */
  span?: true;
  outcomes?: Outcome[];
  /** A page on this site, or a public address that names no client. */
  href?: string;
  /** What is not published about it yet, in the third person. */
  note?: string;
};

export const KIND_LABEL: Record<BuiltKind, string> = {
  clients: "For clients",
  companies: "Companies",
  tools: "Tools he gave away",
  teaching: "Teaching and people",
  fleet: "The fleet",
};

export const STATUS_WORD: Record<BuiltStatus, string> = {
  live: "live",
  shipped: "shipped",
  retired: "retired",
  unknown: "status unknown",
};

/** How a status was read. */
export const STATUS_METHOD =
  "Status as the 2026-09-28 studies checked it. Live: in use today. Shipped: finished and delivered. Retired: ended. Unknown: the studies could not tell.";

const WATER_CASE =
  "Utlyze's published case study for a water-filtration company, comparing January to September 2026 with the same days of 2025. The company's figures as Utlyze published them; not checked from outside.";

/** Utlyze's own build notes, the source of the fleet's published counts (the home page's PUBLISHED line). */
export const FLEET_NOTES =
  "Published by Utlyze in its build notes (utlyze.com/notes/ox-alpha-week): its own count, not checked from outside.";

export const built: Built[] = [
  /* ---- For clients: named by industry only -------------------------------------------------------------------- */
  {
    id: "water-filtration-texting",
    rank: 2,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "Reminder texts for a water-filtration company",
    what: "A texting system driven by the company's own invoicing data. It reminds customers when a filter is due, and wins back the ones who lapsed.",
    start: "2025-10",
    outcomes: [
      {
        date: "2026-09-27",
        for: "client",
        figure: { n: 207, method: WATER_CASE },
        text: "past customers came back from January to September 2026, against about 145 in a typical year.",
      },
      {
        date: "2026-09-27",
        for: "client",
        figure: { n: 10.6, unit: "%", method: WATER_CASE },
        text: "of the customers it texted bought within 90 days, against 2.3%.",
      },
    ],
  },
  {
    id: "client-concrete-contractor",
    rank: 11,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "A lead site for a concrete contractor",
    what: "A lead-generation website and local visibility work for a concrete contractor.",
    start: "2026-01-03",
    outcomes: [{ for: "client", text: "The site serves on the contractor's own domain and brings in calls." }],
  },
  {
    id: "client-detox-center",
    rank: 9,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "Search and AI visibility for a detox and recovery center",
    what: "Search, speed, accessibility and compliance work for a detox and recovery center.",
    start: "2026-03-17",
    outcomes: [{ for: "client", text: "Measured gains in its Google positions, its clicks and its reviews." }],
    note: "The figures behind those gains are not published here yet.",
  },
  {
    id: "client-hvac",
    rank: 21,
    kind: "clients",
    thread: "outside",
    outside: true,
    status: "retired",
    name: "A new website for an HVAC company, handed over well",
    what: "A rebuilt website and blog for a heating and cooling company.",
    start: "2026-04-03",
    end: "2026-07",
    outcomes: [
      { date: "2026-04", for: "client", text: "The new site brought the company leads within days." },
      { date: "2026-07", for: "client", text: "When the client left, he handed over the code, the hosting and a migration guide." },
    ],
  },
  {
    id: "client-dog-breeding-group",
    rank: 6,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "AI for a dog-breeding and kennel business",
    what: "A new website, visibility reports and a records portal for a dog-breeding and kennel business.",
    start: "2026-04",
    outcomes: [
      { for: "taught", text: "AI training for the business's team." },
      { date: "2026-09", for: "client", text: "An AI system installed on the owner's own Mac, in September 2026." },
    ],
  },
  {
    id: "client-roofing",
    rank: 66,
    kind: "clients",
    thread: "clients",
    status: "retired",
    name: "An early New Reward client, a roofing company",
    what: "Onboarding, weekly performance reports and tracing where the company's leads came from.",
    start: "2026-02-04",
    end: "2026-06",
  },
  {
    id: "client-clean-energy-funnel",
    rank: 86,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "A lead funnel for a clean-energy tax credit",
    what: "A compliance-sensitive lead funnel that screens owners and investors for a clean-energy tax credit.",
    start: "2026-06-04",
    end: "2026-06-25",
  },
  {
    id: "client-iv-clinic",
    rank: 46,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "Advertising-compliance work for an IV-therapy clinic",
    what: "A compliance clean-up of the clinic's website: federal citations, policies rewritten in plain language, an owner-approval packet and a public task board.",
    start: "2026-06-16",
  },
  {
    id: "client-dental-marketing-site",
    rank: 87,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "A website for a dental-marketing agency",
    what: "The public site for an agency that sells local AI-visibility checks to dentists.",
    start: "2026-05-27",
    end: "2026-07-01",
  },
  {
    id: "client-equipment-finance-site",
    rank: 50,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "A lead site for equipment finance",
    what: "A fast 46-page lead-generation site, built to bring in qualified commercial-funding leads.",
    start: "2026-06-29",
    end: "2026-07-08",
  },
  {
    id: "new-reward-reports-prospects",
    rank: 69,
    kind: "clients",
    thread: "clients",
    status: "shipped",
    name: "Visibility reports for prospective clients",
    what: "Long visibility and forensics reports for a call-center software company, a promotional-products company, a surgery center and a clinic.",
    start: "2026-07-29",
    end: "2026-09-11",
  },
  {
    id: "utlyze-ai-setups-for-businesses",
    rank: 13,
    kind: "clients",
    thread: "clients",
    status: "shipped",
    name: "Hands-on AI set-ups for trade businesses",
    what: "AI set up inside each firm, plus an executive's workstation, each aimed at the firm's real bottleneck.",
    start: "2026-08-21",
    end: "2026-09-02",
    outcomes: [
      { for: "client", text: "A construction company." },
      { for: "client", text: "A glass company." },
      { for: "client", text: "A real-estate group." },
    ],
  },
  {
    id: "client-athletic-brand",
    rank: 47,
    kind: "clients",
    thread: "clients",
    status: "live",
    name: "Creator campaigns for an athletic-products brand",
    what: "Influencer research and campaign management, won in about two weeks by working with the brand's own platform instead of replacing it.",
    start: "2026-09-08",
  },
  {
    id: "client-law-firm",
    rank: 16,
    kind: "clients",
    thread: "clients",
    status: "shipped",
    name: "An AI working session for a law firm",
    what: "An AI working brief, a two-hour session and a public guide with homework. The managing partner then agreed to an audit of the firm's systems.",
    start: "2026-09-10",
    end: "2026-09-18",
    outcomes: [{ date: "2026-09-18", for: "taught", text: "A two-hour working session for the firm, and a public guide with homework." }],
  },
  {
    id: "other-client-work",
    rank: 88,
    kind: "clients",
    thread: "clients",
    status: "shipped",
    name: "Other client and prospect work",
    what: "Smaller builds, reviews and reports for businesses in manufacturing, roofing, beauty, financial services, retail marketing, treatment, gutters and more.",
    start: "2025-08",
    end: "2026-09",
  },

  /* ---- Companies ----------------------------------------------------------------------------------------------- */
  {
    id: "utlyze",
    rank: 4,
    kind: "companies",
    thread: "studio",
    status: "live",
    name: "Utlyze, the AI studio",
    what: "The AI studio he co-founded in 2025. It builds custom AI systems for businesses.",
    start: "2025-04",
    href: "https://utlyze.com",
  },
  {
    id: "new-reward",
    rank: 1,
    kind: "companies",
    thread: "found",
    status: "live",
    name: "New Reward, the AI-search visibility agency",
    what: "An agency he co-founded that gets local and B2B businesses found on Google and in AI answers, measures it, and does the fixes. It has had clients since early 2026.",
    start: "2025-09",
    href: "https://newreward.com",
  },
  {
    id: "new-reward-platform",
    rank: 26,
    kind: "companies",
    thread: "found",
    privateBranch: "The visibility platform",
    status: "live",
    name: "The New Reward platform",
    what: "The private platform behind New Reward, built with his teammates: a client portal, a CRM, a score of how findable a business is across 12 areas, and reports.",
    start: "2025-11-20",
    href: "/work/visibility-platform",
  },
  {
    id: "visibility-method-12-axis",
    rank: 41,
    kind: "companies",
    thread: "found",
    status: "live",
    name: "The 12-axis visibility method",
    what: "New Reward's way of scoring and fixing visibility across 12 areas, with a per-client report and a radar chart he designed.",
    start: "2026-06-16",
  },
  {
    id: "new-reward-case-studies",
    rank: 51,
    kind: "companies",
    thread: "found",
    status: "live",
    name: "New Reward's public case studies",
    what: "Case studies across industries, published under a rule that no result is claimed unless the source data proves it.",
    start: "2026-01",
  },
  {
    id: "new-reward-lead-sites",
    rank: 89,
    kind: "companies",
    thread: "found",
    status: "live",
    name: "Scroll-story lead sites",
    what: "Three scroll-story websites that send enquiries to New Reward, built on the Of One stage runtime.",
    start: "2026-03-20",
  },
  {
    id: "seopr1",
    rank: 68,
    kind: "companies",
    thread: "found",
    repos: ["CryptoJym/seopr1-site"],
    status: "live",
    name: "seopr1.com",
    what: "A fast five-page site selling AI-search visibility to professional firms, with a 3D tuning fork that turns as you scroll and works without it.",
    start: "2026-03-22",
    href: "/work/seopr1",
  },
  {
    id: "new-reward-scan",
    rank: 40,
    kind: "companies",
    thread: "found",
    status: "live",
    name: "A free AI-visibility scan",
    what: "A free public check of how ready a business is for AI search, rebuilt in September 2026 around seven fixed questions.",
    start: "2026-06-09",
    href: "https://newreward.com/scan",
  },
  {
    id: "nros",
    rank: 42,
    kind: "companies",
    thread: "found",
    status: "live",
    name: "The New Reward report factory",
    what: "The internal system that produces New Reward's three client reports: Foundation, Visibility and Competitive.",
    start: "2026-07-23",
  },
  {
    id: "new-reward-podcast-and-studio",
    rank: 84,
    kind: "companies",
    thread: "found",
    status: "live",
    name: "A podcast studio, built by hand",
    what: "An in-office podcast studio he designed and built by hand with his team in 2025. In 2026 he spoke on New Reward's podcast and hosted an interview.",
    start: "2025-07-04",
  },
  {
    id: "utlyze-advisor",
    rank: 39,
    kind: "companies",
    thread: "studio",
    status: "live",
    name: "The Utlyze Advisor",
    what: "Utlyze's home page since 2 September 2026: a chat and voice guide that asks about a visitor's business and maps where AI would be worth it.",
    start: "2026-09-02",
    href: "https://utlyze.com",
  },
  {
    id: "utlyze-proof",
    rank: 70,
    kind: "companies",
    thread: "studio",
    status: "live",
    name: "Utlyze Proof",
    what: "Case-study pages where a figure goes public only once it is approved. The first is the water-filtration case.",
    start: "2026-09-27",
  },
  {
    id: "of-one-network",
    rank: 15,
    kind: "companies",
    thread: "of-one",
    repos: [
      "CryptoJym/businessofone",
      "h3ro-dev/ceoofone",
      "h3ro-dev/directorofone",
      "h3ro-dev/vcofone",
      "h3ro-dev/vpofone",
      "h3ro-dev/companyofone",
      "h3ro-dev/unicornofone",
      "h3ro-dev/hrofone",
      "h3ro-dev/ofone-ui",
    ],
    privateBranch: "The Of One sites, on one template",
    status: "live",
    name: "The Of One network",
    what: "A network of 20 live websites on one template, each asking what a job looks like when it is one person plus AI. Business of One is the flagship.",
    start: "2025-06-05",
    href: "/work/of-one-family",
    note: "No traffic or lead figure exists for any of these sites yet, so none is claimed.",
  },
  {
    id: "of-one-journal",
    rank: 71,
    kind: "companies",
    thread: "of-one",
    status: "live",
    name: "The Of One daily journal",
    what: "A routine that writes, fact-checks with a second model and publishes journal posts across the Of One sites every morning, plus six guides.",
    start: "2026-09-24",
  },
  {
    id: "ai-readiness-assessment",
    rank: 113,
    kind: "companies",
    thread: "found",
    repos: ["CryptoJym/ai-readiness-assessment"],
    status: "live",
    name: "An AI-readiness assessment",
    what: "An online quiz that scores a company's AI readiness in seven areas, with charts and a PDF.",
    start: "2025-08-15",
    href: "/work/ai-readiness-assessment",
  },
  {
    id: "jamesbrady-org",
    rank: 32,
    kind: "companies",
    thread: "site",
    repos: ["CryptoJym/jamesbrady-website"],
    status: "live",
    name: "jamesbrady.org",
    what: "His own site: first sent to friends in 2022, rebuilt as a proof-first portfolio in August 2026, and reinvented as the Fulgurite portrait he accepted on 27 September 2026.",
    start: "2022-03",
    href: "/about#how-this-site-was-made",
  },

  /* ---- Tools he gave away -------------------------------------------------------------------------------------- */
  {
    id: "borg-shared-memory",
    rank: 17,
    kind: "tools",
    thread: "fleet",
    repos: ["h3ro-dev/borg"],
    status: "live",
    name: "BORG",
    what: "One shared memory that every Claude, Codex and Grok agent reads and writes, tidied nightly, and published free as the BORG kit.",
    start: "2026-07-13",
    href: "https://github.com/h3ro-dev/borg",
  },
  {
    id: "plimsoll",
    rank: 18,
    kind: "tools",
    thread: "plimsoll",
    repos: ["CryptoJym/plimsoll"],
    privateBranch: "Plimsoll's hosted version",
    status: "live",
    name: "Plimsoll",
    what: "A free program that records what AI coding agents cost and matches it to the work that merged, with a hosted team version.",
    start: "2026-06-10",
    href: "/work/plimsoll",
    note: "So far its only real workspace is his own.",
  },
  {
    id: "ofone-method",
    rank: 33,
    kind: "tools",
    thread: "of-one",
    repos: ["CryptoJym/ofone-skillchain"],
    status: "live",
    name: "OfOne: Ask, Map, Move",
    what: "His method for hard decisions, packaged as an AI skill with checkers: map the facts, the gaps and the options before answering.",
    start: "2026-05-13",
    href: "/work/ofone",
  },
  {
    id: "proof-doctrine",
    rank: 12,
    kind: "tools",
    thread: "fleet",
    repos: ["h3ro-dev/agent-landing-fleet"],
    status: "live",
    name: "His proof-first rules",
    what: "Rules that let a man who can't code trust machine work. First: if you cannot test it, it does not exist. Then, after the day 1,705 agent runs landed one merge: merged on main, or it does not exist. Published as an open kit.",
    start: "2026-01-03",
    href: "https://github.com/h3ro-dev/agent-landing-fleet",
  },
  {
    id: "eegt",
    rank: 52,
    kind: "tools",
    thread: "minds",
    repos: ["h3ro-dev/eegt", "CryptoJym/bci-research"],
    status: "live",
    name: "EEGT, an open research notebook",
    what: "A long-running question, whether brain signals can be turned into input a language model can read, published with honest results: every main one so far is inconclusive.",
    start: "2025-06-28",
    href: "https://github.com/h3ro-dev/eegt",
  },
  {
    id: "mcp-connectors",
    rank: 25,
    kind: "tools",
    thread: "connectors",
    repos: [
      "h3ro-dev/heygen-mcp-adapter",
      "h3ro-dev/tiktok-mcp-adapter",
      "h3ro-dev/TimingApp-MCP",
      "CryptoJym/marketing-mcp-servers",
      "h3ro-dev/cursor-admin-mcp",
      "h3ro-dev/motion-mcp-server",
      "h3ro-dev/limitless-mcp-server",
      "CryptoJym/gamma-mcp-server",
      "CryptoJym/oss-120b-pm-mcp",
      "CryptoJym/freshbooks-mcp-server",
      "CryptoJym/gohighlevel-mcp-server",
      "CryptoJym/gohighlevel-mcp",
    ],
    status: "shipped",
    name: "Connectors for AI assistants",
    what: "Small open-source bridges that let AI assistants use Cursor, Motion, Gamma and other apps. His code with the most outside interest in 2025.",
    start: "2025-06",
    end: "2025-10",
  },
  {
    id: "eeg-meditation-toolkit",
    rank: 112,
    kind: "tools",
    thread: "minds",
    repos: ["CryptoJym/eeg-meditation-analysis", "CryptoJym/eeg-burst-recorder", "CryptoJym/brain-visualization-app"],
    status: "shipped",
    name: "A brainwave toolkit",
    what: "Open-source tools that score meditation depth from a brainwave recording and record bursts from a headset, plus a 3D brain visualisation.",
    start: "2025-07",
    end: "2025-11-20",
    href: "/work/eeg-meditation-analysis",
  },
  {
    id: "open-skills",
    rank: 81,
    kind: "tools",
    thread: "methods",
    repos: ["CryptoJym/problem-solving-system", "CryptoJym/ux-design-laws"],
    status: "shipped",
    name: "Free agent skills and playbooks",
    what: "Ten UX laws, ten ranked problem-solving playbooks and other skills an AI agent can use, given away.",
    start: "2025-08",
    end: "2026-08",
  },
  {
    id: "upstream-contributions",
    rank: 22,
    kind: "tools",
    thread: "methods",
    repos: ["CryptoJym/architect-loop"],
    status: "shipped",
    name: "His fix, merged into another developer's project",
    what: "His hardening fix was merged into Dan McInerney's Architect Loop, an agent-loop project, on 13 September 2026: the only change merged there from anyone but its maintainer when the studies checked.",
    start: "2026-01-24",
    end: "2026-09-13",
    href: "https://github.com/DanMcInerney/architect-loop/pull/170",
  },
  {
    id: "student-models",
    rank: 60,
    kind: "tools",
    thread: "fleet",
    repos: ["h3ro-dev/loop-distillery"],
    status: "live",
    name: "Small models that took over big models' jobs",
    what: "Small local models trained from a big model's logs, which took over routine work in his memory system, including a published miss.",
    start: "2026-08-27",
  },
  {
    id: "capability-audit",
    rank: 74,
    kind: "tools",
    thread: "fleet",
    repos: ["CryptoJym/omnara-capability-audit"],
    status: "live",
    name: "An audit of his own systems",
    what: "Three AI auditors compared his BORG, memory and Plimsoll with an outside agent product and published the result, which started a program to close the gaps.",
    start: "2026-09-25",
  },
  {
    id: "essays-and-idea-apps",
    rank: 114,
    kind: "tools",
    thread: "minds",
    repos: ["CryptoJym/knowledge-divergence-model"],
    status: "live",
    name: "Essays and interactive idea apps",
    what: "Essays on LinkedIn since 2019, and interactive ones, among them a research-cited model of how AI may widen the gap between people who use it well and people who don't.",
    start: "2019-11",
  },
  {
    id: "games",
    rank: 121,
    kind: "tools",
    thread: "play",
    repos: ["h3ro-dev/Tanks-of-Glory", "CryptoJym/dbz-sidescroller", "CryptoJym/bomberman-classic-web", "CryptoJym/ember-dash"],
    status: "live",
    name: "Games made with AI",
    what: "Small games: a tank arena, a side-scroller, a bomb maze, a platformer and Ember, a running game in the browser.",
    start: "2025-02-16",
  },
  {
    id: "early-non-coder-guides",
    rank: 118,
    kind: "tools",
    thread: "play",
    repos: ["h3ro-dev/claude-power-tools", "h3ro-dev/FlashCardsofPOWER", "h3ro-dev/vibe-coder-flashcards"],
    status: "unknown",
    name: "Early guides for non-coders",
    what: "Guides to using Claude with power tools, with no coding experience needed, and flashcards on AI updates.",
    start: "2025-05-21",
    end: "2025-07-05",
  },
  {
    id: "early-agent-experiments",
    rank: 117,
    kind: "tools",
    thread: "fleet",
    repos: ["h3ro-dev/Agent-starter-kit", "h3ro-dev/autonomous-project-manager"],
    status: "unknown",
    name: "Early agent experiments",
    what: "Practice: a multi-agent starter kit and a GitHub Action that updates a roadmap from a repository's activity.",
    start: "2024-09",
    end: "2026-09",
  },
  {
    id: "agent-village-ui",
    rank: 116,
    kind: "tools",
    thread: "fleet",
    repos: ["CryptoJym/ai-agent-village-monitor"],
    status: "unknown",
    name: "A game-like control room for coding agents",
    what: "A map of little houses from which to watch and command coding agents; about 95% built in a day, by his account.",
    start: "2025-09-14",
    end: "2025-12",
  },
  {
    id: "orchestrator-experiments",
    rank: 122,
    kind: "tools",
    thread: "methods",
    repos: ["CryptoJym/symphony"],
    status: "retired",
    name: "Orchestrators he tried and dropped",
    what: "A string of multi-agent systems, some of them other people's that he forked and ran, each for one to three months, then dropped. They taught him gates, lane ownership and simplicity.",
    start: "2026-01-16",
    end: "2026-08-28",
  },

  /* ---- The fleet ------------------------------------------------------------------------------------------------ */
  {
    id: "agent-fleet",
    rank: 3,
    kind: "fleet",
    thread: "fleet",
    status: "live",
    name: "The agent fleet",
    what: "Macs running Claude, Codex and Grok agents under one lead agent, which writes the briefs and places each job where there is measured room. It is how he builds without writing code.",
    start: "2025-10-02",
  },
  {
    id: "codex-conductor",
    rank: 73,
    kind: "fleet",
    thread: "fleet",
    status: "live",
    name: "codex-conductor",
    what: "A small control program that lets a lead agent start, watch and steer Codex agents while they run: the seed of the fleet.",
    start: "2026-06-12",
  },
  {
    id: "scheduled-automations",
    rank: 78,
    kind: "fleet",
    thread: "fleet",
    status: "live",
    name: "Scheduled automations",
    what: "Named, scheduled jobs for content checks, blog drafts, social queues, meeting follow-ups, reply reviews and lead research.",
    start: "2026-04-23",
  },
  {
    id: "client-and-marketing-agents",
    rank: 79,
    kind: "fleet",
    thread: "fleet",
    status: "shipped",
    name: "Agents that work like account executives",
    what: "Agents that watch a client's funnel, research new leads and reach out, and a marketing agent that writes and posts within set limits, under his rule that clients are told when an AI is writing.",
    start: "2026-02",
    end: "2026-08",
  },
  {
    id: "fleet-self-healing",
    rank: 75,
    kind: "fleet",
    thread: "fleet",
    status: "live",
    name: "Monitors that watch the fleet and client sites",
    what: "Monitors that track every agent and watch each other, send alerts to fixing agents, restart dropped jobs, and check every client website every three minutes.",
    start: "2026-08-22",
  },
  {
    id: "studio-installer",
    rank: 77,
    kind: "fleet",
    thread: "fleet",
    status: "live",
    name: "One command that makes a Mac a fleet machine",
    what: "An installer that turns a new Mac into an AI-ready workstation. It enrolled two new Mac minis in his fleet, and it is meant for client Macs.",
    start: "2026-09-01",
    href: "https://setup.utlyze.com/studio",
  },
  {
    id: "fleet-routing-and-admission",
    rank: 76,
    kind: "fleet",
    thread: "fleet",
    status: "live",
    name: "Work admitted by measured room",
    what: "A dispatcher that admits work only onto machines and accounts with measured spare room, and a control-room board of the fleet, refreshed every minute.",
    start: "2026-09-04",
  },
  {
    id: "jev-experiments",
    rank: 80,
    kind: "fleet",
    thread: "fleet",
    status: "live",
    name: "A lightweight judge for memory and routing",
    what: "An outside, lightweight judge model wired into memory clean-up and routing decisions, with changes that can be undone and honest notes on what it did.",
    start: "2026-09-17",
  },

  /* ---- Teaching and people ------------------------------------------------------------------------------------- */
  {
    id: "prompt-library-and-guides",
    rank: 54,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "Free guides: a 50-technique prompt library",
    what: "Free guides on LinkedIn: 50 problem-solving techniques with prompts, and recipes for small businesses that pair GPT with Zapier and advise a human review.",
    start: "2023-03-07",
    end: "2024-07-24",
    outcomes: [{ for: "taught", text: "A free library of 50 problem-solving techniques with prompts." }],
  },
  {
    id: "argux",
    rank: 19,
    kind: "companies",
    thread: "studio",
    status: "retired",
    name: "Argux Labs, where he was CTO",
    what: "A three-partner AI build and consulting firm: a sales-training platform for a roofing company, chatbots and a market analysis, and a mention in Zapier's launch press release.",
    start: "2023-10",
    end: "2024-11",
  },
  {
    id: "podcast-2024",
    rank: 29,
    kind: "teaching",
    thread: "teaching",
    status: "retired",
    name: "His 2024 interview podcast",
    what: "Eleven recorded conversations and two solo teaching episodes. He asked guests' consent, offered them a review before publishing, and introduced them to people who could help them.",
    start: "2024-09-25",
    end: "2024-12",
  },
  {
    id: "university-teaching-and-board",
    rank: 10,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "Teaching AI at a Utah university",
    what: "A recorded guest class, free no-code classes, an invitation to co-teach, judging a competition, and a seat on the university's software-engineering advisory board.",
    start: "2024-11-20",
    outcomes: [{ date: "2024-11-20", for: "taught", text: "Classes on AI at a Utah university, since November 2024." }],
  },
  {
    id: "teaching-friends-one-to-one",
    rank: 30,
    kind: "teaching",
    thread: "teaching",
    status: "shipped",
    name: "Teaching friends to build with AI",
    what: "One-to-one help that turned friends into builders: a friend's app, mentored on a live stream; a friend he showed ChatGPT, who went on to build tools; and a coach's book, fixed with Claude.",
    start: "2024-07",
    end: "2026-09",
    outcomes: [
      { for: "taught", text: "A friend he showed ChatGPT, who went on to build tools." },
      { for: "taught", text: "A friend's app, mentored on a live stream." },
      { for: "taught", text: "A coach's book, fixed with Claude." },
    ],
  },
  {
    id: "growing-his-team",
    rank: 8,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "Growing young builders",
    what: "He recruits, trains and speaks up for young builders and teammates: daily teaching, a field guide, mentoring, and an internship whose first interview is with an AI voice agent.",
    start: "2025-05",
    href: "https://utlyze.com/intern",
    outcomes: [{ for: "taught", text: "An internship, with its first interview held by an AI voice agent." }],
  },
  {
    id: "youtube-teaching",
    rank: 44,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "Teaching on YouTube",
    what: "Tutorials and live streams on the Utlyze channel, among them a 35-minute tutorial on Taskmaster that credits the tool's maker, and live teaching for his team.",
    start: "2025-10-30",
  },
  {
    id: "free-help-on-x",
    rank: 43,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "Free help in public on X",
    what: "He answers people's questions in public for free, posts his own mistakes as lessons, and once audited another founder's agent platform unasked.",
    start: "2025-12",
    href: "https://x.com/of1ai",
  },
  {
    id: "social-video-and-posts",
    rank: 83,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "His public voice",
    what: "Thousands of posts on X written by hand, hundreds of short videos and a run of live streams, including video answers to commenters.",
    start: "2023-05",
  },
  {
    id: "notes-from-the-build",
    rank: 28,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "Notes from the build",
    what: "Public notes on how his fleet works, bylined to him and to the AI models that helped write them, plus a daily write-up that publishes itself.",
    start: "2026-08-25",
    href: "https://www.utlyze.com/notes",
  },
  {
    id: "university-ai-guide",
    rank: 14,
    kind: "teaching",
    thread: "teaching",
    status: "live",
    name: "A local-AI guide for a public university",
    what: "A local-AI build guide and a 198-page PDF prepared for a public university, followed by an offer of internships to its industry board.",
    start: "2026-09-02",
    end: "2026-09-06",
    outcomes: [{ date: "2026-09-06", for: "taught", text: "A local-AI build guide for a public university." }],
  },
  {
    id: "teaching-volumes",
    rank: 53,
    kind: "teaching",
    thread: "teaching",
    status: "retired",
    name: "The Primer, The Manuscript and The Workshop",
    what: "Three teaching volumes on this site for people who don't code: how coding systems work, a catalogue of tools, and build guides. Archived in place.",
    start: "2026-02-01",
    end: "2026-08-11",
    span: true,
    href: "/learn",
  },
];

/**
 * Work known only from his private messages. One line at most, no detail, and it stays out of the specimen, until
 * James says yes to each (out/REPORT.md in the rebuild packet lists them).
 */
export const mentionedOnly: { id: string; text: string }[] = [
  { id: "first-ai-builds-2023", text: "his first GPT app and his first agent" },
  { id: "ai-consulting-2023", text: "AI consulting and team training" },
  { id: "poetry-book-illustrations", text: "images for a published poetry book" },
  { id: "homeschool-ai-demo", text: "an AI learning demo for homeschool families" },
];

/* ---- Derived. Nothing below may be typed into a template. ---------------------------------------------------- */

export const builtById = (id: string): Built => {
  const b = built.find((x) => x.id === id);
  if (!b) throw new Error(`[built] no item "${id}"`);
  return b;
};

export const byKind = (kind: BuiltKind) => built.filter((b) => b.kind === kind);

export const countStatus = (s: BuiltStatus, list: Built[] = built) => list.filter((b) => b.status === s).length;

/** Every outcome, with its item: dated ones newest first, then the undated ones in the order they are listed. */
export const outcomes = built
  .flatMap((b) => (b.outcomes ?? []).map((o) => ({ ...o, item: b })))
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

/** The newest dated result for a client on or before a day: what the tip of the home page shows. */
export function latestClientResult(asOf: string) {
  return outcomes.find((o) => o.for === "client" && o.date && o.date.slice(0, 10) <= asOf) ?? null;
}

/** A date as the page prints it: "27 Sep 2026", or "Sep 2026" when only the month is known. */
export function builtDate(d: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, dd] = d.split("-").map(Number);
  if (!m) return String(y);
  return dd ? `${dd} ${months[m - 1]} ${y}` : `${months[m - 1]} ${y}`;
}

/** "Oct 2025 → now", "Aug 2026 → Sep 2026". */
export function builtSpan(b: Built): string {
  return `${builtDate(b.start)} → ${b.end ? builtDate(b.end) : "now"}`;
}

/*
 * Build-time checks. A bad entry fails the build rather than printing something the sources don't say.
 */
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
for (const b of built) {
  if (!DATE.test(b.start) || (b.end && !DATE.test(b.end))) throw new Error(`[built] ${b.id}: dates must be YYYY, YYYY-MM or YYYY-MM-DD`);
  if (b.end && b.end < b.start) throw new Error(`[built] ${b.id}: ends before it starts`);
  for (const o of b.outcomes ?? []) if (o.date && !DATE.test(o.date)) throw new Error(`[built] ${b.id}: outcome date "${o.date}"`);
  if (/vuplicity/i.test(`${b.name} ${b.what}`)) throw new Error(`[built] ${b.id}: Vuplicity appears only on /work-with-me`);
}
if (new Set(built.map((b) => b.id)).size !== built.length) throw new Error("[built] duplicate item id");
