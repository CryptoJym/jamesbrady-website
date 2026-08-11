// Content collection types — geo-seo-spec §1.
//
// One typed source feeds seven outputs: pages, JSON-LD, llms.txt,
// ai-manifest.json, sitemap.xml, feed.xml and the Ask-dock grounding pack.
// Adding an eighth consumer means importing this module, never re-typing data.
//
// TypeScript enforces required fields at compile time; lib/content/validate.ts
// enforces the rules the type system cannot express, and it THROWS — an invalid
// entry fails the build, it never warns.

export type EntityRef = "person:james" | "org:utlyze" | "org:new-reward";

/**
 * A proof source. `method` is required — it is the METHOD line of the
 * provenance nameplate (design-system-spec §6.2). An entry with neither `url`
 * nor `artifact` fails validation: unlinkable proof is not proof.
 */
export type ProofSource = {
  label: string;
  url?: string;
  artifact?: string;
  method: string;
  capturedAt: string;
  redacted?: boolean;
};

export type OgMeta = {
  image: string;
  imageAlt: string;
  title?: string;
  description?: string;
};

/** Base fields — every entry, every collection. */
export type BaseEntry = {
  title: string;
  slug: string;
  answerCapsule: string;
  summary: string;
  datePublished: string;
  dateModified: string;
  entities: EntityRef[];
  proof: ProofSource[];
  og: OgMeta;
  noindex?: boolean;
  /** Markdown body. Renders as static HTML — chat is never the publishing destination. */
  body: string;
};

export type WorkCategory =
  | "products"
  | "open-source"
  | "client-work"
  | "experiments";

/** Maps the content vocabulary onto the comp's `data-cat` filter tokens. */
export const CATEGORY_TOKEN: Record<WorkCategory, string> = {
  products: "prod",
  "open-source": "oss",
  "client-work": "client",
  experiments: "exp",
};

export const CATEGORY_LABEL: Record<WorkCategory, string> = {
  products: "Products",
  "open-source": "Open source",
  "client-work": "Client work",
  experiments: "Experiments",
};

export type RepoRef = {
  owner: string;
  name: string;
  public: boolean;
  /** Star count as observed. Sourced, dated, and summed at build — never typed into JSX. */
  stars?: number;
  /** ISO date the star count and last-push date were observed. */
  snapshotAt?: string;
  /** ISO date of the last push observed in the same snapshot. */
  lastPush?: string;
  license?: string;
};

export type Delta = {
  metric: string;
  before?: string;
  after?: string;
  range?: string;
  method: string;
  timeframe: string;
};

/**
 * The single number a proof slot may print, plus how it was derived.
 * `value` is a number so nothing can smuggle prose into value typography;
 * a slot with no derivable figure sets `placeholder: true` and the template
 * renders the labelled `.np__ph` treatment instead of a plausible numeral.
 */
export type ProofMetric = {
  value?: number;
  /** Pad to two digits in the comp's instrument style. */
  pad?: boolean;
  prefix?: string;
  unit: string;
  method: string;
  source: string;
  /** ISO date this system was last active. */
  lastActive?: string;
  goLabel: string;
  goHref: string;
  placeholder?: boolean;
  state: "active" | "live" | "paused" | "dormant";
};

export type WorkEntry = BaseEntry & {
  collection: "work";
  kicker: string;
  categories: WorkCategory[];
  stack: string[];
  timeframe: { start: string; end?: string };
  deltas: Delta[];
  repo?: RepoRef;
  anonymized: boolean;
  clearance?: { clientName: string; grantedAt: string; scope: string };
  /** Card foot line — the unit this card is showing. */
  footUnit: string;
  /** Present only on entries that earn a slot in the home proof bank. */
  proofMetric?: ProofMetric;
  /** Live URLs checked read-only, with the date of the check. */
  liveUrls?: { url: string; checkedAt: string; status: number }[];
};

/** Ruling (C), 2026-08-11: four rungs, with `paused` as an orthogonal flag. */
export type Maturity = "named" | "sketched" | "developed" | "live-demo";

export const MATURITY_ORDER: Maturity[] = [
  "named",
  "sketched",
  "developed",
  "live-demo",
];

export const MATURITY_LABEL: Record<Maturity, string> = {
  named: "Named only",
  sketched: "Sketched",
  developed: "Developed",
  "live-demo": "Live demo",
};

export type TheoryEntry = BaseEntry & {
  collection: "theories";
  /** The theory's own name; the H1 is the question. */
  name: string;
  maturity: Maturity;
  /** Orthogonal status flag — amber means paused, only ever paused. */
  paused: boolean;
  /** The falsifiable proposition → JSON-LD Claim. */
  claim: string;
  abstract: string;
  /** One line under the name in the index row. */
  what: string;
  artifactUrl?: string;
  artifactLabel?: string;
  history: { date: string; state: string; note: string }[];
  flagLabel: string;
};

export type LabEntry = BaseEntry & {
  collection: "lab";
  /** Absent → the loader forces noindex. Not left to author discipline. */
  explanationUrl?: string;
  state: "live" | "paused" | "dormant";
  stateWord: string;
};

export type LearnEntry = BaseEntry & {
  collection: "learn";
  archivedDate: string;
  volumeRoute: "/primer" | "/manuscript" | "/workshop";
  kicker: string;
};

export type NowEntry = BaseEntry & {
  collection: "now";
  updated: string;
};

export type AnyEntry =
  | WorkEntry
  | TheoryEntry
  | LabEntry
  | LearnEntry
  | NowEntry;
