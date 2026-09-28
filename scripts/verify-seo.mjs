#!/usr/bin/env node
// GEO/SEO verification battery — geo-seo-spec §8.
//
// Run against a built app served by `next start`:
//   npm run build && npx next start -p 4123 &
//   node scripts/verify-seo.mjs --base http://localhost:4123
//
// NUMBERING. The check numbers printed below are THIS SCRIPT'S numbers, in the
// order they run, and the map to the spec §8 table is stated once here so the
// two can never drift apart again (the old header said "check 10" about what
// was printed as check 9 — independent review, P1-7):
//
//   script 0  route liveness .................. (precondition, not in §8)
//   script 1  route universe .................. §8 preamble
//   script 2  canonical self-reference ........ §8.1
//   script 3  JSON-LD structure + vocabulary + @id resolution ....... §8.2
//   script 4  one Person node, deep-equal ..... §8.3
//   script 5  capsule integrity ............... §8.4
//   script 6  llms.txt + ai-manifest coverage . §8.5
//   script 7  sitemap lastmod, index === max(children) ............. §8.6
//   script 8  per-page OG at 1200×630 ......... §8.7
//   script 9  retired brand token, URL-anchored allowlist .......... §8.8
//   script 10 client-name denylist ............ §8.10
//   script 11 register rule ................... §8.11
//   script 12 host discipline ................. §8.12
//   script 13 robots .......................... ruling (B), §7.6
//   script 14 heading outline ................. §7.5
//   script 15 no unsourced numerals in display strings ............. P0-1
//   script 16 no title repeats the site name .................. wave-2 fix
//   script 17 open questions, third person, one note per gap ... 2026-09-27 ruling
//
// §8.9 (proof-link liveness) is NOT implemented and is not claimed. It needs
// network egress at verify time; it is named in the PR as an open gap.
//
// Every check FAILS the run. None warn. Check 10 has a third state, UNPROVEN,
// for the case where the denylist file exists but carries no terms — and in CI
// (env CI=true) UNPROVEN exits nonzero, because an unproven gate is not a
// passing gate.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { scanH3ro, scanH3roSource } from "./lib/h3ro-gate.mjs";

const BASE =
  process.argv.includes("--base")
    ? process.argv[process.argv.indexOf("--base") + 1]
    : "http://localhost:4123";
const ROOT = process.cwd();
const CANONICAL_HOST = "https://www.jamesbrady.org";
/** The site name as the root layout's title template appends it (check 16). */
const SITE_NAME = "James Brady";
const IN_CI = process.env.CI === "true";

/** The static route list. Asserted equal to the sitemap: a route in one and
 *  not the other is itself a failure. */
const STATIC_ROUTES = [
  "/",
  "/work-with-me",
  "/work-with-me/get-found",
  "/work-with-me/build-a-system",
  "/work-with-me/background-screening",
  "/work",
  "/work/ofone",
  "/work/plimsoll",
  "/work/visibility-platform",
  "/work/eeg-meditation-analysis",
  "/work/seopr1",
  "/work/ai-readiness-assessment",
  "/work/of-one-family",
  "/theories",
  "/theories/universal-question-geometry",
  "/theories/question-answer-dynamics",
  "/theories/architect-loop",
  "/theories/latent-emotions",
  "/theories/the-paper",
  "/theories/movement-economy",
  "/theories/function-first-orchestration",
  "/lab",
  "/learn",
  "/about",
  "/contact",
  "/now",
  // His words, verbatim: a Fulgurite route (2026-09-27) and in the sitemap.
  "/words",
  // The dated archives. URLs preserved, reskinned onto Direction B in wave 4,
  // and held to every check below with no deferral. /links and /watch left this
  // list on 2026-09-27: both redirect permanently (next.config.ts), and a
  // redirect is not a page.
  "/primer",
  "/manuscript",
  "/workshop",
];

/**
 * THE DEFERRAL LIST, NOW EMPTY.
 *
 * This held the routes whose defects were real, named and out of scope: the
 * five pages still wearing the old skin. /links left in wave 3; /primer,
 * /manuscript, /workshop and /watch left in wave 4, when they were reskinned
 * onto Direction B at the same URLs. Every check in this file now applies to
 * every route in STATIC_ROUTES.
 *
 * The array and the machinery below it stay rather than being deleted, and
 * that is deliberate: an empty exclusion list is a claim a reader can check in
 * one line, and the next route that needs a named, temporary exemption gets a
 * mechanism that has already been exercised instead of one invented under
 * deadline. If it is still empty several waves from now, delete it then.
 */
const LEGACY_ROUTES = [];

/**
 * Defects on a route named in LEGACY_ROUTES — currently none, see above. The
 * flag is kept so the escape hatch cannot be reached by accident: with the
 * list empty, `--strict-legacy` changes nothing, and that is the point.
 */
const STRICT_LEGACY = process.argv.includes("--strict-legacy");
const deferredLegacy = [];

const results = [];
let failed = 0;

function report(name, ok, detail) {
  results.push({ name, ok, detail, state: ok ? "PASS" : "FAIL" });
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

/**
 * A third state, used by exactly one check. UNPROVEN is never PASS: it is
 * counted separately in the tally and, under CI, it fails the run.
 */
function reportUnproven(name, detail) {
  results.push({ name, ok: false, detail, state: "UNPROVEN" });
  if (IN_CI) failed++;
  console.log(`UNPR  ${name} — ${detail}`);
}

function legacyDefect(check, message) {
  if (STRICT_LEGACY) return false;
  deferredLegacy.push(`${check}: ${message}`);
  return true;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const body = await res.text();
  return { status: res.status, body, headers: res.headers };
}

/* ---------------------------------------------------------- source walking */

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * The source files the static gates (register rule, brand token, host
 * discipline) read.
 *
 * The list used to stop at the Direction B directories, which is how
 * `/api/catalog` kept the retired job title in its `name` and a bare-host
 * `url` through a clean run (independent review, P1-3 / P2-11). Anything that
 * emits public bytes belongs here — a JSON endpoint is a public surface even
 * though it renders no HTML.
 *
 * The Fulgurite design (2026-09-27) renders through components/fg and the
 * specimen, grows the specimen in lib/specimen, and styles through three new
 * stylesheets; none of them was on the list, so these gates could not see the
 * surfaces the site now ships. They are now.
 */
const SCAN_DIRS = [
  "app/(site)",
  "app/api",
  "app/.well-known",
  "app/llms.txt",
  "app/feed.xml",
  "components/site",
  "components/fg",
  "components/specimen",
  "content",
  "lib/ask",
  "lib/content",
  "lib/seo",
  "lib/schema",
  "lib/manifold",
  "lib/specimen",
].map((d) => join(ROOT, d));

const SCAN_FILES = [
  "app/layout.tsx",
  "app/globals.css",
  "app/fg.css",
  "app/fg-a.css",
  "app/fg-b.css",
  "app/robots.ts",
  "app/sitemap.ts",
  "lib/catalog.ts",
  "lib/tray.ts",
  "lib/words.ts",
].map((f) => join(ROOT, f));

function newSurfaceFiles() {
  return [
    ...SCAN_DIRS.filter(existsSync).flatMap((d) => walk(d)),
    ...SCAN_FILES.filter(existsSync),
  ].filter((f) => /\.(ts|tsx|css|mjs|json)$/.test(f));
}

/* --------------------------------------------------------------- HTML text */

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&mdash;": "—",
  "&ndash;": "–",
  "&hellip;": "…",
  "&times;": "×",
  "&middot;": "·",
  "&copy;": "©",
};

/** Visible body text: scripts and styles removed, tags stripped, entities decoded. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x?[0-9a-fA-F]+;|&[a-zA-Z]+;/g, (e) => ENTITIES[e] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

const normalize = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

/* ================================================================ checks */

function checkRouteUniverse(sitemapUrls) {
  const sitemapPaths = sitemapUrls
    .map((u) => u.replace(CANONICAL_HOST, ""))
    .map((p) => (p === "" || p === "/" ? "/" : p.replace(/\/$/, "")))
    .sort();
  const expected = [...STATIC_ROUTES].sort();
  const missing = expected.filter((p) => !sitemapPaths.includes(p));
  const extra = sitemapPaths.filter((p) => !expected.includes(p));
  report(
    "1. Route universe: sitemap === static route list",
    missing.length === 0 && extra.length === 0,
    missing.length || extra.length
      ? `missing from sitemap: [${missing}] · not in route list: [${extra}]`
      : `${sitemapPaths.length} routes`,
  );
}

function checkCanonicals(pages) {
  const bad = [];
  for (const [path, html] of pages) {
    const matches = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/g)];
    if (matches.length !== 1) {
      bad.push(`${path}: expected exactly 1 canonical, found ${matches.length}`);
      continue;
    }
    const href = /href="([^"]+)"/.exec(matches[0])?.[1];
    // Root only: the bare host and the host with a trailing slash are the same
    // URL. Every other path must match exactly, trailing slash off.
    const ok =
      path === "/"
        ? href === CANONICAL_HOST || href === `${CANONICAL_HOST}/`
        : href === `${CANONICAL_HOST}${path}`;
    if (!ok) bad.push(`${path}: canonical is ${href}, expected ${CANONICAL_HOST}${path}`);
  }
  report(
    "2. Canonical self-reference on every route",
    bad.length === 0,
    bad.length ? bad.join(" | ") : `${pages.length} routes checked`,
  );
}

/* ------------------------------------------------------------- JSON-LD 3/4 */

/**
 * Vendored schema.org type list (geo-seo-spec §8.2: "validated against a
 * vendored type list"). Deliberately CLOSED, not a heuristic: an unlisted type
 * fails, and widening it is an edit someone makes on purpose. Every entry here
 * is a type this site's templates actually emit.
 */
const SCHEMA_TYPES = new Set([
  "Answer",
  "Article",
  "Audience",
  "Claim",
  "CollectionPage",
  "ContactPage",
  "CreativeWork",
  "DefinedTerm",
  "DefinedTermSet",
  "FAQPage",
  "ItemList",
  "ListItem",
  "Organization",
  "Person",
  "Place",
  "PostalAddress",
  "ProfilePage",
  "Question",
  "Service",
  "SoftwareSourceCode",
  "WebApplication",
  "WebPage",
  "WebSite",
]);

/** Every @type string anywhere in the graph, including nested nodes and arrays. */
function collectTypes(value, out = []) {
  if (Array.isArray(value)) {
    for (const v of value) collectTypes(v, out);
    return out;
  }
  if (value && typeof value === "object") {
    const t = value["@type"];
    if (typeof t === "string") out.push(t);
    else if (Array.isArray(t)) for (const x of t) if (typeof x === "string") out.push(x);
    for (const [k, v] of Object.entries(value)) {
      if (k === "@type") continue;
      collectTypes(v, out);
    }
  }
  return out;
}

/**
 * Split every object in the graph into DEFINITIONS (an @id plus other keys)
 * and REFERENCES (an object whose only key is @id).
 */
function collectIds(value, defined = new Set(), referenced = []) {
  if (Array.isArray(value)) {
    for (const v of value) collectIds(v, defined, referenced);
    return { defined, referenced };
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (typeof value["@id"] === "string") {
      if (keys.length === 1) referenced.push(value["@id"]);
      else defined.add(value["@id"]);
    }
    for (const v of Object.values(value)) collectIds(v, defined, referenced);
  }
  return { defined, referenced };
}

/**
 * A defect on one of the five archived routes is REAL but out of scope this
 * wave, so it goes to the deferred block instead of failing the run. Anywhere
 * else it fails. `--strict-legacy` removes the distinction.
 */
function pushOrDefer(bad, check, path, message) {
  const msg = `${path}: ${message}`;
  if (LEGACY_ROUTES.includes(path) && legacyDefect(check, msg)) return;
  bad.push(msg);
}

function parseGraphs(pages) {
  const graphs = new Map();
  const problems = [];
  for (const [path, html] of pages) {
    const blocks = [
      ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ];
    if (blocks.length === 0) {
      // The archived routes carry no graph at all this wave — a named gap,
      // not a silent one.
      pushOrDefer(problems, "3 JSON-LD", path, "no ld+json block");
      continue;
    }
    if (blocks.length > 1) {
      pushOrDefer(problems, "3 JSON-LD", path, `${blocks.length} ld+json blocks, expected 1`);
      continue;
    }
    const raw = blocks[0][1].replace(/\\u003c/g, "<");
    try {
      graphs.set(path, { parsed: JSON.parse(raw), raw });
    } catch (e) {
      pushOrDefer(problems, "3 JSON-LD", path, `unparseable JSON-LD (${e.message})`);
    }
  }
  return { graphs, problems };
}

/**
 * Check 3 — structure, vocabulary, and reference resolution.
 *
 * The @id half is the one that was missing (independent review, P1-4): every
 * template emitted `isPartOf: {"@id": …/#website"}` while only `/` DEFINED the
 * WebSite node, so 26 of 27 pages shipped a dangling edge. A graph that
 * references a node it does not define does not crawl standalone, which is the
 * entire reason the Person node rides on every page.
 */
function checkJsonLdStructure(graphs, structureProblems) {
  const bad = [...structureProblems];
  let strict = 0;
  for (const [path, { parsed, raw }] of graphs) {
    if (parsed["@context"] !== "https://schema.org") pushOrDefer(bad, "3 JSON-LD", path, "bad @context");
    const graph = parsed["@graph"] ?? [];
    if (!Array.isArray(graph) || graph.length === 0) {
      // The archived pages emit a bare inline object rather than an @graph, so
      // nothing on them can be referenced by @id from anywhere. Real defect,
      // deferred with the rest of their reskin.
      pushOrDefer(bad, "3 JSON-LD", path, "no @graph — inline node only, nothing is addressable by @id");
      continue;
    }
    strict++;
    if (raw.includes("ScholarlyArticle")) pushOrDefer(bad, "3 JSON-LD", path, "ScholarlyArticle is banned");
    if (/AI Alchemist/.test(raw)) pushOrDefer(bad, "3 JSON-LD", path, "register-rule violation in JSON-LD");

    const unknown = [...new Set(collectTypes(graph))].filter((t) => !SCHEMA_TYPES.has(t));
    if (unknown.length)
      pushOrDefer(bad, "3 JSON-LD", path, `@type not in the vendored vocabulary: ${unknown.join(", ")}`);

    const { defined, referenced } = collectIds(graph);
    const dangling = [...new Set(referenced)].filter((id) => !defined.has(id));
    if (dangling.length)
      pushOrDefer(bad, "3 JSON-LD", path, `@id reference(s) with no node in the same graph: ${dangling.join(", ")}`);

    const dupes = [...new Set([...defined].filter(
      (id) => graph.filter((n) => n["@id"] === id).length > 1,
    ))];
    if (dupes.length) pushOrDefer(bad, "3 JSON-LD", path, `duplicate top-level @id: ${dupes.join(", ")}`);
  }
  report(
    "3. JSON-LD: one block, valid, every @type in vocabulary, every @id resolves",
    bad.length === 0,
    bad.length
      ? bad.join(" | ")
      : `${strict} graphs fully resolved · ${SCHEMA_TYPES.size} vendored types`,
  );
}

/** Structural deep-equality, key order independent. */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (typeof a !== "object") return false;
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length || ka.some((k, i) => k !== kb[i])) return false;
  return ka.every((k) => deepEqual(a[k], b[k]));
}

/**
 * Check 4 — the Person node, in full.
 *
 * §8.3 asks for DEEP EQUALITY across pages, not just a matching @id. The old
 * check only counted nodes and compared the @id, so a page could have shipped
 * a Person with a different jobTitle or a shortened sameAs and passed.
 */
function checkPerson(graphs, pages) {
  const bad = [];
  let canonical = null;
  let canonicalPath = null;
  for (const [path, { parsed, raw }] of graphs) {
    const graph = parsed["@graph"] ?? [];
    const persons = graph.filter((n) => n["@type"] === "Person");
    const isLegacy = LEGACY_ROUTES.includes(path);
    const inlinePerson = /"@type":"Person"/.test(raw);
    if (persons.length !== 1) {
      const msg = `${path}: ${persons.length} Person nodes in @graph, expected 1${inlinePerson ? " (has an inline Person literal instead)" : ""}`;
      if (!(isLegacy && legacyDefect("4 Person node", msg))) bad.push(msg);
      continue;
    }
    const person = persons[0];
    if (person["@id"] !== `${CANONICAL_HOST}/#person`) {
      bad.push(`${path}: Person node lacks the canonical @id (got ${person["@id"]})`);
      continue;
    }
    if (!canonical) {
      canonical = person;
      canonicalPath = path;
      continue;
    }
    if (!deepEqual(canonical, person)) {
      const ka = Object.keys(canonical).sort().join(",");
      const kb = Object.keys(person).sort().join(",");
      bad.push(
        `${path}: Person node is not deep-equal to the one on ${canonicalPath}` +
          (ka === kb ? " (same keys, different values)" : ` (keys ${kb} vs ${ka})`),
      );
    }
  }
  // A Person literal in the HTML that never reaches the graph is the same
  // defect wearing a different hat.
  for (const [path, html] of pages) {
    if (graphs.has(path)) continue;
    if (/"@type":\s*"Person"/.test(html)) {
      const msg = `${path}: inline Person literal outside any parsed @graph`;
      if (!(LEGACY_ROUTES.includes(path) && legacyDefect("4 Person node", msg))) bad.push(msg);
    }
  }
  report(
    "4. One Person node, deep-equal on every page, canonical @id",
    bad.length === 0,
    bad.length
      ? bad.join(" | ")
      : `${graphs.size} graphs · ${canonical ? Object.keys(canonical).length : 0} fields compared field-by-field`,
  );
}

/**
 * Check 5 — capsule integrity (§8.4).
 *
 * Two halves, both previously unimplemented: the DefinedTerm.description in
 * the markup must appear VERBATIM in the rendered body text (markup and
 * visible text agree — §4.5 bans a capsule that exists only in markup), and
 * its first sentence must be pronoun-free (§4.2).
 */
const LEADING_DEICTIC =
  /^(it|this|that|these|those|they|he|she|we|i|our|its|their|the system|the project|as described|the above)\b/i;

function checkCapsules(graphs, pages) {
  const html = new Map(pages);
  const bad = [];
  let checked = 0;
  for (const [path, { parsed }] of graphs) {
    const graph = parsed["@graph"] ?? [];
    const terms = graph.filter((n) => n["@type"] === "DefinedTerm" && n.description);
    if (terms.length === 0) continue;
    const text = normalize(visibleText(html.get(path) ?? ""));
    for (const term of terms) {
      checked++;
      const capsule = normalize(term.description);
      if (!text.includes(capsule)) {
        bad.push(
          `${path}: DefinedTerm.description is not in the rendered body text ` +
            `(markup-only capsule) — "${capsule.slice(0, 60)}…"`,
        );
      }
      const first = capsule.split(/(?<=[.!?])\s/)[0] ?? capsule;
      if (LEADING_DEICTIC.test(first)) {
        bad.push(`${path}: capsule first sentence opens with a pronoun/deictic — "${first.slice(0, 50)}…"`);
      }
    }
  }
  report(
    "5. Capsule integrity: markup capsule renders verbatim, first sentence pronoun-free",
    bad.length === 0,
    bad.length ? bad.join(" | ") : `${checked} capsules diffed against rendered text`,
  );
}

/* ------------------------------------------------------------- artifacts 6 */

function checkCoverage(llms, manifestJson, sitemapUrls) {
  const problems = [];
  const indexable = new Set(sitemapUrls);

  const inLlms = new Set(
    [...llms.matchAll(/\((https:\/\/www\.jamesbrady\.org[^)]*)\)/g)].map((m) => m[1]),
  );
  const llmsMissing = [...indexable].filter((u) => !inLlms.has(u));
  const llmsExtra = [...inLlms].filter((u) => !indexable.has(u));
  if (llmsMissing.length) problems.push(`llms.txt missing: [${llmsMissing}]`);
  if (llmsExtra.length) problems.push(`llms.txt extra: [${llmsExtra}]`);

  let manifest;
  try {
    manifest = JSON.parse(manifestJson);
  } catch (e) {
    report("6. llms.txt + ai-manifest coverage === indexable routes", false, `manifest unparseable: ${e.message}`);
    return null;
  }
  const inManifest = new Set(manifest.routes?.map((r) => r.url) ?? []);
  const mMissing = [...indexable].filter((u) => !inManifest.has(u));
  const mExtra = [...inManifest].filter((u) => !indexable.has(u));
  if (mMissing.length) problems.push(`ai-manifest missing: [${mMissing}]`);
  if (mExtra.length) problems.push(`ai-manifest extra: [${mExtra}]`);
  if (/last_updated/.test(manifestJson)) problems.push("ai-manifest carries a stale last_updated literal");
  if (!manifest.generatedAt) problems.push("ai-manifest has no generatedAt");

  report(
    "6. llms.txt + ai-manifest coverage === indexable routes",
    problems.length === 0,
    problems.length
      ? problems.join(" | ")
      : `${inLlms.size} llms urls · ${inManifest.size} manifest routes · contentVersion ${manifest.contentVersion}`,
  );
  return manifest;
}

/**
 * Check 7 — sitemap lastmod (§8.6), including the half that was missing:
 * an index route's lastmod must equal the max lastmod of its children.
 */
function checkSitemapLastmod(sitemapXml, buildStartIso) {
  const entries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1];
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1];
    return { loc, lastmod };
  });
  const problems = [];
  const now = Date.now();
  const buildDay = buildStartIso.slice(0, 10);
  const byDay = new Map();
  for (const e of entries) {
    if (!e.lastmod) {
      problems.push(`${e.loc}: no <lastmod>`);
      continue;
    }
    const t = Date.parse(e.lastmod);
    if (Number.isNaN(t)) {
      problems.push(`${e.loc}: unparseable lastmod ${e.lastmod}`);
      continue;
    }
    if (t > now + 86_400_000) problems.push(`${e.loc}: lastmod is in the future`);
    // The discriminator for `new Date()` leaking in: a real lastmod comes from
    // a DATE field (content frontmatter or a git commit day) and lands on
    // midnight UTC. A build timestamp does not.
    if (!/T00:00:00(\.000)?Z?$/.test(e.lastmod)) {
      problems.push(`${e.loc}: lastmod ${e.lastmod} carries a time-of-day — it looks like a build timestamp, not a content date`);
    }
    const day = e.lastmod.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  // Index lastmod === max(children). Only the two index routes that actually
  // HAVE child URLs in the sitemap can be checked this way; /lab and /learn
  // publish no child routes, so their lastmod has no children to be the max of
  // and the assertion would be vacuous. Stated, not silently skipped.
  const lastmodOf = (path) => entries.find((e) => e.loc === `${CANONICAL_HOST}${path}`)?.lastmod;
  const indexChecks = [];
  for (const index of ["/work", "/theories"]) {
    const children = entries.filter(
      (e) => e.loc?.startsWith(`${CANONICAL_HOST}${index}/`) && e.lastmod,
    );
    if (children.length === 0) continue;
    const max = children.map((c) => c.lastmod).sort().at(-1);
    const own = lastmodOf(index);
    if (own !== max) problems.push(`${index}: lastmod ${own} !== max(children) ${max}`);
    else indexChecks.push(`${index}=${max?.slice(0, 10)} over ${children.length} children`);
  }

  const days = [...byDay.entries()].sort();
  const spread = days.map(([d, n]) => `${d}×${n}`).join(", ");
  // Not a failure on its own: on a branch whose last commit touched every
  // route file, every date genuinely IS today. Reported so a shallow clone
  // (which collapses every git date to the clone day) is visible to a human.
  const collapsed = days.length === 1 && days[0][0] === buildDay;
  report(
    "7. Sitemap lastmod present, not a build timestamp, index === max(children)",
    problems.length === 0,
    problems.length
      ? problems.join(" | ")
      : `${entries.length} urls · ${indexChecks.join(" · ")} · dates: ${spread}${collapsed ? " · NOTE: all on the build day — confirm the checkout is not shallow (fetch-depth: 0)" : ""}`,
  );
}

/**
 * An image's size, read from its own header: a PNG's IHDR or a JPEG's
 * start-of-frame. The Fulgurite pages share a JPEG (/og/fulgurite.jpg), and
 * reading PNG offsets out of a JPEG reported it as 65536x4292542531. Any other
 * format returns null and fails the check rather than being guessed at.
 */
function imageSize(buf) {
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { format: "PNG", w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    for (let o = 2; o + 9 < buf.length; ) {
      if (buf[o] !== 0xff) return null;
      const marker = buf[o + 1];
      if (marker === 0xff) {
        o++;
        continue;
      }
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        o += 2;
        continue;
      }
      // SOF0-SOF15, less DHT (C4), JPG (C8) and DAC (CC): precision, height, width.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { format: "JPEG", w: buf.readUInt16BE(o + 7), h: buf.readUInt16BE(o + 5) };
      }
      o += 2 + buf.readUInt16BE(o + 2);
    }
  }
  return null;
}

async function checkOg(pages) {
  const bad = [];
  const deferred = [];
  const images = new Set();
  for (const [path, html] of pages) {
    // og:url used to be a named, deferred gap on the archived routes: they
    // inherited one OG block from app/(legacy)/layout.tsx, which could not
    // know which page it was describing. That layout is gone as of wave 4 and
    // all four declare their own metadata through pageMetadata(), so the gap
    // is closed and this branch is now unreachable.
    const isLegacy = LEGACY_ROUTES.includes(path);
    for (const prop of ["og:title", "og:description", "og:image", "og:url"]) {
      if (html.includes(`property="${prop}"`)) continue;
      if (prop === "og:url" && isLegacy) deferred.push(`${path}: og:url`);
      else bad.push(`${path}: missing ${prop}`);
    }
    if (!html.includes('name="twitter:card"')) bad.push(`${path}: missing twitter:card`);
    if (!html.includes('name="twitter:image"')) bad.push(`${path}: missing twitter:image`);
    const img = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
    if (img) images.add(img);
  }
  for (const img of images) {
    const path = img.replace(CANONICAL_HOST, "");
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
      bad.push(`${img}: HTTP ${res.status}`);
      continue;
    }
    const size = imageSize(Buffer.from(await res.arrayBuffer()));
    if (!size) bad.push(`${img}: neither a PNG nor a JPEG, so its size cannot be read`);
    else if (size.w !== 1200 || size.h !== 630) bad.push(`${img}: ${size.format} ${size.w}x${size.h}, expected 1200x630`);
  }
  report(
    "8. Per-page OG + twitter, images resolve at 1200x630",
    bad.length === 0,
    bad.length
      ? bad.join(" | ")
      : `${pages.length} routes · ${images.size} distinct images` +
        (deferred.length
          ? ` · DEFERRED (wave 2, archived routes only): ${deferred.join(", ")}`
          : ""),
  );
}

/**
 * Check 9 — the retired brand token. The scanner itself lives in
 * scripts/lib/h3ro-gate.mjs so the fixtures test exercises the SAME code path
 * this battery does (independent review, P2-8).
 */
function checkH3ro(pages) {
  const hits = [];
  for (const [path, html] of pages) {
    const { domainHits, brandHits } = scanH3ro(html);
    if (domainHits) hits.push(`${path}: ${domainHits} use(s) of the retired domain`);
    if (brandHits) {
      const msg = `${path}: ${brandHits} unanchored brand reference(s)`;
      if (!(LEGACY_ROUTES.includes(path) && legacyDefect("9 brand gate", msg))) hits.push(msg);
    }
  }
  // Source files, less the sentences pinned by file and exact text in
  // H3RO_SOURCE_FACTS. The rendered pages above get no such exemption.
  for (const file of newSurfaceFiles()) {
    const name = relative(ROOT, file).split("\\").join("/");
    const { domainHits, brandHits } = scanH3roSource(name, readFileSync(file, "utf8"));
    if (domainHits || brandHits) hits.push(`${name}: ${domainHits} domain, ${brandHits} unanchored`);
  }
  report(
    "9. Retired brand token: URL-anchored allowlist, nothing else",
    hits.length === 0,
    hits.length
      ? hits.join(" | ")
      : "allowed ONLY as x.com/h3roai, tiktok.com/@h3ro.ai, [https://]github.com/h3ro-dev/<repo>, " +
          "h3ro-dev.github.io/*, a repository's full name h3ro-dev/<repo>, and the pinned source facts",
  );
}

/**
 * Check 10 — client-name denylist.
 *
 * THREE states, not two (independent review, P2-12). The old gate printed a
 * loud warning and then reported PASS, so a battery running against a zero-term
 * placeholder tallied 13/13 and read as if client confidentiality had been
 * verified. It had not been. A gate that cannot fail is not a gate:
 *
 *   file missing         → FAIL (fail-closed, §9-C)
 *   0 terms + marker     → UNPROVEN; nonzero exit under CI=true
 *   0 terms, no marker   → FAIL (indistinguishable from a missing secret)
 *   terms present        → PASS/FAIL on matches
 *
 * The file it reads is GITIGNORED — see .seo-denylist.example.txt.
 */
function checkDenylist(pages, artifacts) {
  const file = join(ROOT, ".seo-denylist.txt");
  if (!existsSync(file)) {
    report(
      "10. Client-name denylist",
      false,
      "FAIL CLOSED: .seo-denylist.txt is absent. CI materializes it from the CLIENT_DENYLIST secret before this gate runs.",
    );
    return;
  }
  const raw = readFileSync(file, "utf8");
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const marker = "PLACEHOLDER-EMPTY-DENYLIST";
  const terms = lines.filter((l) => l !== marker);

  if (terms.length === 0) {
    if (!lines.includes(marker)) {
      report(
        "10. Client-name denylist",
        false,
        `FAIL CLOSED: .seo-denylist.txt has no terms and no "${marker}" marker. An empty file without the marker is indistinguishable from a missing secret.`,
      );
      return;
    }
    reportUnproven(
      "10. Client-name denylist",
      "UNPROVEN — 0 terms, placeholder marker present. This gate is proving NOTHING " +
        "about client confidentiality until the CLIENT_DENYLIST secret exists " +
        "(geo-seo-spec §9-C)." +
        (IN_CI
          ? " CI=true, so this run FAILS."
          : " Local run: reported, not failed. It fails under CI=true."),
    );
    return;
  }

  const hits = [];
  const haystacks = [...pages, ...artifacts];
  for (const [name, text] of haystacks) {
    const lc = text.toLowerCase();
    terms.forEach((term, i) => {
      const idx = lc.indexOf(term.toLowerCase());
      if (idx !== -1) {
        const line = text.slice(0, idx).split("\n").length;
        const hash = createHash("sha256").update(term).digest("hex").slice(0, 12);
        // Never echo the matched term into a CI log.
        hits.push(`${name}:${line} matched denylist entry #${i + 1} (sha256:${hash})`);
      }
    });
  }
  report("10. Client-name denylist", hits.length === 0, hits.length ? hits.join(" | ") : `${terms.length} terms, 0 matches`);
}

/**
 * Check 11 — register rule.
 *
 * The scan set includes app/api/**, lib/catalog.ts, app/layout.tsx and
 * app/globals.css (P2-11). `/api/catalog` shipped the retired job title in its
 * `name` string through every previous green run precisely because the scan
 * stopped at the HTML-rendering surfaces.
 *
 * WAVE 4 — EVERY ROUTE, NO DEFERRAL. The volumes and /watch carried the last
 * of the banned register: sacred-geometry divider variants, the retired
 * mystical framing in a recording's title and text, and that framing again in
 * two asset FILE NAMES. A file path inside a `src` attribute is rendered HTML
 * and this check reads rendered HTML, so renaming the assets was part of the
 * copy fix, not decoration. The components that carried the rest of it
 * (AlchemyCanvas, SectionDivider, BootSequence, ChatPanel and the manifold
 * demo) are deleted — the scan set never reached them, which is precisely why
 * dead code with a banned register is worth removing rather than tolerating.
 */
function checkRegister(pages) {
  const BANNED = /alchemist|alchemy|metatron|vesica|neural link|semantic input/i;
  const bad = [];
  for (const file of newSurfaceFiles()) {
    const text = readFileSync(file, "utf8");
    if (BANNED.test(text)) bad.push(`${relative(ROOT, file)}`);
  }
  const NEW_ROUTES = STATIC_ROUTES.filter((p) => !LEGACY_ROUTES.includes(p));
  for (const [path, html] of pages) {
    if (!NEW_ROUTES.includes(path)) continue;
    if (BANNED.test(html)) bad.push(`rendered ${path}`);
  }
  report(
    "11. Register rule on new surfaces (incl. app/api, lib/catalog.ts, every stylesheet)",
    bad.length === 0,
    bad.length
      ? bad.join(" | ")
      : `${newSurfaceFiles().length} source files + ${NEW_ROUTES.length} routes, no route deferred`,
  );
}

function checkHostDiscipline(pages, artifacts) {
  const bad = [];
  for (const [name, text] of [...pages, ...artifacts]) {
    const m = text.match(/https:\/\/jamesbrady\.org/g);
    if (!m) continue;
    const msg = `${name}: ${m.length} bare-host reference(s)`;
    if (!(LEGACY_ROUTES.includes(name) && legacyDefect("12 host discipline", msg)))
      bad.push(msg);
  }
  for (const file of newSurfaceFiles()) {
    if (/https:\/\/jamesbrady\.org/.test(readFileSync(file, "utf8")))
      bad.push(`${relative(ROOT, file)}: bare-host reference in source`);
  }
  report(
    "12. Host discipline: www everywhere, never bare jamesbrady.org",
    bad.length === 0,
    bad.length ? bad.join(" | ") : "clean",
  );
}

function checkRobots(robots) {
  const ok = /Disallow: \/api\//.test(robots) && /Allow: \/api\/catalog/.test(robots);
  report(
    "13. robots: Disallow /api/ plus an explicit Allow /api/catalog",
    ok,
    ok ? "both rules present" : robots.slice(0, 200),
  );
}

/**
 * Check 14 — heading outline (§7.5).
 *
 * Exactly one h1 per route, and no skipped levels. /work, /theories, /lab and
 * /learn shipped with NO h1 at all (independent review, P1-5): their section
 * head was an h2 and the page had no top-level heading for a reader, a screen
 * reader or an extraction model to anchor on.
 */
function checkHeadings(pages) {
  const bad = [];
  const summary = [];
  for (const [path, html] of pages) {
    const body = html.replace(/<script[\s\S]*?<\/script>/g, " ");
    const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    const isLegacy = LEGACY_ROUTES.includes(path);
    const problems = [];
    const h1s = levels.filter((l) => l === 1).length;
    if (h1s !== 1) problems.push(`${h1s} h1 elements, expected exactly 1`);
    let previous = 0;
    for (const level of levels) {
      if (previous && level > previous + 1) problems.push(`h${previous} → h${level} skips a level`);
      previous = level;
    }
    if (problems.length) {
      const msg = `${path}: ${problems.join("; ")}`;
      if (!(isLegacy && legacyDefect("14 heading outline", msg))) bad.push(msg);
    } else {
      summary.push(`${path}:h1×${h1s}`);
    }
  }
  report(
    "14. Heading outline: exactly one h1 per route, no skipped levels",
    bad.length === 0,
    bad.length ? bad.join(" | ") : `${summary.length} routes with a clean outline`,
  );
}

/**
 * Check 15 — no unsourced numerals in short display strings (P0-1).
 *
 * lib/content/validate.ts already throws on this at build time; this is the
 * independent lane, run against the content SOURCE rather than against the
 * loader, so a change to the validator cannot also quietly retire the rule.
 * The allowlist matches the one documented in validate.ts.
 */
const NUMERAL_FIELDS = [
  ["kicker", /^\s*kicker:\s*"([^"]*)"/gm],
  ["flagLabel", /^\s*flagLabel:\s*"([^"]*)"/gm],
  ["stateWord", /^\s*stateWord:\s*"([^"]*)"/gm],
  ["footFacts[].label", /\{\s*label:\s*"([^"]*)"\s*\}/gm],
];

function checkDisplayNumerals() {
  const bad = [];
  let scanned = 0;
  const files = walk(join(ROOT, "content")).filter((f) => f.endsWith(".ts"));
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const [field, re] of NUMERAL_FIELDS) {
      re.lastIndex = 0;
      for (let m = re.exec(text); m; m = re.exec(text)) {
        scanned++;
        if (/\d/.test(m[1]))
          bad.push(`${relative(ROOT, file)}: ${field} carries a numeral — "${m[1]}"`);
      }
    }
    // The field the rule exists for: it must not come back as a string.
    if (/^\s*footUnit:/m.test(text))
      bad.push(`${relative(ROOT, file)}: footUnit is back — the card foot line is structured (FootFact[]), not a typed string`);
  }
  report(
    "15. Short display strings carry no unsourced numerals",
    bad.length === 0,
    bad.length
      ? bad.join(" | ")
      : `${scanned} display strings across ${files.length} content modules · numbers live in FootFact.count / ProofMetric, with a unit and a method`,
  );
}

/**
 * Check 16 — the site name appears once in a title, not twice.
 *
 * The root layout carries `template: "%s — James Brady"`, which is correct for
 * every route whose title is a page name. The home route's title IS the site
 * title, so the template appended the name to a string that already ended with
 * it: "James Brady — builds AI systems that show their work — James Brady".
 * lib/seo/metadata.ts now returns an absolute title on "/", and this is the
 * lane that keeps it fixed. A stutter in the one string every search result
 * shows is not cosmetic.
 */
function checkTitleStutter(pages) {
  const bad = [];
  for (const [path, html] of pages) {
    const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1];
    if (!title) {
      bad.push(`${path}: no <title>`);
      continue;
    }
    const decoded = visibleText(title);
    const hits = decoded.split(SITE_NAME).length - 1;
    if (hits > 1) bad.push(`${path}: "${decoded}" names the site ${hits} times`);
  }
  report(
    `16. No title repeats "${SITE_NAME}"`,
    bad.length === 0,
    bad.length ? bad.join(" | ") : `${pages.length} titles, each naming the site at most once`,
  );
}

/**
 * Check 17 — open questions, in the third person (James, 2026-09-27).
 *
 * The register was never dishonest; wave 3 found it mis-addressed. A buyer on
 * /about met four questions written TO James, in the imperative, and read the
 * page as unfinished rather than candid. So buyer routes stated the same
 * absences in the third person, builder routes kept the questions inline, and
 * the owner-facing register moved to /now. On 2026-09-27 James ruled that every
 * open question renders as its third-person `publicNotes` note, on every route:
 * the inline marks and the /now register are retired.
 *
 * The check still has BOTH directions, because a one-directional version
 * passes the day somebody deletes the notes:
 *   · the source: every entry with [JAMES: …] gaps carries publicNotes, one
 *     non-empty note per gap (the build checks the count only when notes exist);
 *   · no route renders a second-person owner mark: not the inline mark, and
 *     not any gap's question in its own words;
 *   · what renders is the notes: every rendered note is one of its own route's
 *     publicNotes, an entry whose prose is on its page shows ALL of its notes
 *     there, and at least one note renders somewhere;
 *   · no raw [JAMES: bracket reaches any page (the older defect).
 * An entry whose prose is not on its page at all is named in the detail line,
 * not passed over in silence.
 */
async function checkOpenQuestions(pages) {
  const { importTs } = await import("./lib/ts-register.mjs");
  const { extractGaps, toPlainText, PENDING_TOKEN } = await importTs("lib/content/markdown.ts");
  const content = await importTs("lib/content/index.ts");
  const { siteProse } = await importTs("content/site/index.ts");

  const routeOf = (e) =>
    ({
      work: `/work/${e.slug}`,
      theories: `/theories/${e.slug}`,
      lab: "/lab",
      learn: e.volumeRoute,
      now: "/now",
      offers: `/work-with-me/${e.slug}`,
    })[e.collection];
  const entries = [
    ...[...content.work, ...content.theories, ...content.lab, ...content.learn, ...content.offers, content.now].map(
      (e) => ({ id: `${e.collection}/${e.slug}`, path: routeOf(e), body: e.body, notes: e.publicNotes }),
    ),
    ...siteProse.map((p) => ({ id: `site/${p.id}`, path: p.path, body: p.body, notes: p.publicNotes })),
  ].map((e) => ({ ...e, gaps: extractGaps(e.body) }));

  const bad = [];
  const html = new Map(pages);

  // 1. The source: one note per gap, on every entry that has a gap.
  const withGaps = entries.filter((e) => e.gaps.length);
  for (const e of entries.filter((x) => x.gaps.length || x.notes?.length)) {
    if (!Array.isArray(e.notes)) bad.push(`${e.id}: ${e.gaps.length} [JAMES: …] gap(s) and no publicNotes`);
    else if (e.notes.length !== e.gaps.length) bad.push(`${e.id}: ${e.notes.length} publicNotes for ${e.gaps.length} gap(s)`);
    else e.notes.forEach((n, i) => String(n).trim() || bad.push(`${e.id}: publicNotes[${i}] is empty`));
  }

  // 2. No second-person owner mark anywhere, in markup or in words.
  const MARK = /class="pending"|Pending from James/g;
  const questions = withGaps.flatMap((e) => e.gaps.map(normalize)).filter((q) => q.length >= 24);
  for (const [path, body] of pages) {
    const marks = (body.match(MARK) ?? []).length;
    if (marks) bad.push(`${path}: ${marks} second-person owner mark(s)`);
    const text = normalize(visibleText(body));
    const said = questions.filter((q) => text.includes(q)).length;
    if (said) bad.push(`${path}: ${said} owner-facing question(s) printed in their own words`);
    if (body.includes("[JAMES:")) bad.push(`${path}: a raw [JAMES: bracket reached the page`);
  }

  // 3. What renders is the notes, on the right page, all of them.
  const notesOn = (body) =>
    [...body.replace(/<script[\s\S]*?<\/script>/g, " ").matchAll(/<span class="pending-note">([\s\S]*?)<\/span>/g)].map(
      (m) => normalize(visibleText(m[1])),
    );
  for (const [path, body] of pages) {
    const own = new Set(withGaps.filter((e) => e.path === path).flatMap((e) => e.notes ?? []).map(normalize));
    const stray = notesOn(body).filter((n) => !own.has(n));
    if (stray.length) bad.push(`${path}: ${stray.length} rendered note(s) that are not this route's publicNotes`);
  }
  let shown = 0;
  const absent = [];
  for (const e of withGaps) {
    const body = html.get(e.path);
    if (body === undefined) {
      bad.push(`${e.id}: its route ${e.path} was not fetched, so its notes are unverified`);
      continue;
    }
    const rendered = notesOn(body);
    const present = (e.notes ?? []).filter((n) => rendered.includes(normalize(n))).length;
    if (present === e.gaps.length) {
      shown += present;
      continue;
    }
    if (present > 0) {
      bad.push(`${e.id}: ${present} of ${e.gaps.length} notes on ${e.path}, so a gap lost its statement`);
      continue;
    }
    // None of its notes: either its prose is not on the page, or the gaps went silent in prose that is.
    const text = normalize(visibleText(body));
    const sentences = normalize(toPlainText(e.body))
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length >= 40 && !s.includes(PENDING_TOKEN));
    const onPage = sentences.filter((s) => text.includes(s)).length;
    if (onPage >= Math.max(2, Math.ceil(sentences.length / 3))) {
      bad.push(`${e.id}: its prose is on ${e.path} (${onPage}/${sentences.length} sentences) and none of its ${e.gaps.length} notes are`);
    } else absent.push(`${e.id} (${e.gaps.length}, prose not on ${e.path})`);
  }
  if (shown === 0) bad.push("no third-person note renders on any route: the notes were deleted, not shown");

  report(
    "17. Open questions: one third-person note per gap, no owner-facing mark on any route",
    bad.length === 0,
    bad.length
      ? bad.join(" | ")
      : `${withGaps.length} entries carry ${withGaps.reduce((n, e) => n + e.gaps.length, 0)} gaps, each with its note · ` +
          `${shown} notes render on their own routes · 0 owner-facing marks across ${pages.length} routes` +
          (absent.length ? ` · NOT RENDERED ANYWHERE: ${absent.join(", ")}` : ""),
  );
}

/* ================================================================== main */

const buildStartIso = new Date().toISOString();

console.log(`\nverify-seo — base ${BASE}${IN_CI ? " · CI mode (UNPROVEN fails)" : ""}\n${"─".repeat(72)}`);

const pages = [];
for (const path of STATIC_ROUTES) {
  const res = await get(path);
  if (res.status !== 200) {
    report(`0. Route ${path} responds 200`, false, `HTTP ${res.status}`);
    continue;
  }
  pages.push([path, res.body]);
}
report("0. Every route responds 200", pages.length === STATIC_ROUTES.length, `${pages.length}/${STATIC_ROUTES.length}`);

const sitemapXml = (await get("/sitemap.xml")).body;
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const llms = (await get("/llms.txt")).body;
const manifestJson = (await get("/.well-known/ai-manifest.json")).body;
const feed = (await get("/feed.xml")).body;
const robots = (await get("/robots.txt")).body;
const catalog = (await get("/api/catalog")).body;

// The Ask dock's grounding pack. It is not served at a URL — publishing the
// exact system prompt would hand an attacker the map — so it is read from the
// generated module instead of fetched. It goes in `artifacts` rather than
// beside the source files because it is CONTENT, and the checks that matter
// for it are the content ones: no client name may appear in it (check 10) and
// no bare-host URL may be cited out of it (check 12). Wave 2, chatbot-spec.
const packModule = readFileSync(join(ROOT, "lib", "ask", "grounding-pack.generated.ts"), "utf8");

const artifacts = [
  ["sitemap.xml", sitemapXml],
  ["llms.txt", llms],
  ["ai-manifest.json", manifestJson],
  ["feed.xml", feed],
  // The catalog endpoint is public bytes and is held to the same rules.
  ["api/catalog", catalog],
  ["ask/grounding-pack", packModule],
];

const { graphs, problems: graphProblems } = parseGraphs(pages);

checkRouteUniverse(sitemapUrls);
checkCanonicals(pages);
checkJsonLdStructure(graphs, graphProblems);
checkPerson(graphs, pages);
checkCapsules(graphs, pages);
checkCoverage(llms, manifestJson, sitemapUrls);
checkSitemapLastmod(sitemapXml, buildStartIso);
await checkOg(pages);
checkH3ro(pages);
checkDenylist(pages, artifacts);
checkRegister(pages);
checkHostDiscipline(pages, artifacts);
checkRobots(robots);
checkHeadings(pages);
checkDisplayNumerals();
checkTitleStutter(pages);
await checkOpenQuestions(pages);

console.log("─".repeat(72));
const passed = results.filter((r) => r.state === "PASS").length;
const unproven = results.filter((r) => r.state === "UNPROVEN").length;
const hardFailed = results.filter((r) => r.state === "FAIL").length;
console.log(
  `${passed}/${results.length} checks passed` +
    (unproven ? ` · ${unproven} UNPROVEN` : "") +
    (hardFailed ? ` · ${hardFailed} FAILED` : ""),
);
if (unproven && !IN_CI) {
  console.log(
    `NOTE: an UNPROVEN check is NOT a pass. This run exits 0 only because CI is unset;\n` +
      `      the same run in CI (CI=true) exits nonzero.`,
  );
}

if (deferredLegacy.length) {
  console.log(
    `\nDEFERRED — defects on ${LEGACY_ROUTES.length} named route(s) (${LEGACY_ROUTES.join(" ")}).\n` +
      `These are REAL and they are not fixed. Re-run with --strict-legacy to fail on them.\n`,
  );
  for (const d of deferredLegacy) console.log(`  · ${d}`);
  console.log("");
} else {
  // Say it out loud. "No deferred block printed" and "nothing was deferred"
  // look identical in a log, and the difference is the whole point of the
  // block existing.
  console.log(
    `\nNo deferred routes. Every check above ran against all ${STATIC_ROUTES.length} routes.\n` +
      `/primer, /manuscript and /workshop cleared in wave 4 when they were reskinned\n` +
      `onto Direction B at the same URLs; /links and /watch now redirect.\n`,
  );
}

process.exit(failed ? 1 : 0);
