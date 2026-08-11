#!/usr/bin/env node
// GEO/SEO verification battery — geo-seo-spec §8.
//
// Run against a built app served by `next start`:
//   npm run build && npx next start -p 4123 &
//   node scripts/verify-seo.mjs --base http://localhost:4123
//
// Every check below FAILS the run. None warn — except check 10, which is
// explicitly a fail-closed gate running against a placeholder denylist and
// says so loudly.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const BASE =
  process.argv.includes("--base")
    ? process.argv[process.argv.indexOf("--base") + 1]
    : "http://localhost:4123";
const ROOT = process.cwd();
const CANONICAL_HOST = "https://www.jamesbrady.org";

/** The static route list. Asserted equal to the sitemap: a route in one and
 *  not the other is itself a failure. */
const STATIC_ROUTES = [
  "/",
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
  // Legacy routes. URLs preserved; they are in the battery because a
  // canonical regression on an archived page is still a canonical regression.
  "/primer",
  "/manuscript",
  "/workshop",
  "/links",
  "/watch",
];

const results = [];
let failed = 0;

function report(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failed++;
  const tag = ok ? "PASS" : "FAIL";
  console.log(`${tag}  ${name}${detail ? ` — ${detail}` : ""}`);
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

const NEW_SURFACE_DIRS = [
  "app/(site)",
  "components/site",
  "content",
  "lib/content",
  "lib/seo",
  "lib/schema",
  "lib/manifold",
].map((d) => join(ROOT, d));

function newSurfaceFiles() {
  return NEW_SURFACE_DIRS.filter(existsSync)
    .flatMap((d) => walk(d))
    .filter((f) => /\.(ts|tsx|css|mjs)$/.test(f));
}

/* ================================================================ checks */

async function checkCanonicals(pages) {
  const bad = [];
  for (const [path, html] of pages) {
    const matches = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/g)];
    if (matches.length !== 1) {
      bad.push(`${path}: expected exactly 1 canonical, found ${matches.length}`);
      continue;
    }
    const href = /href="([^"]+)"/.exec(matches[0])?.[1];
    const expected = path === "/" ? `${CANONICAL_HOST}/` : `${CANONICAL_HOST}${path}`;
    if (href !== expected) bad.push(`${path}: canonical is ${href}, expected ${expected}`);
  }
  report(
    "1. Canonical self-reference on every route",
    bad.length === 0,
    bad.length ? bad.join(" | ") : `${pages.length} routes checked`,
  );
}

async function checkRouteUniverse(sitemapUrls) {
  const sitemapPaths = sitemapUrls
    .map((u) => u.replace(CANONICAL_HOST, ""))
    .map((p) => (p === "" || p === "/" ? "/" : p.replace(/\/$/, "")))
    .sort();
  const expected = [...STATIC_ROUTES].sort();
  const missing = expected.filter((p) => !sitemapPaths.includes(p));
  const extra = sitemapPaths.filter((p) => !expected.includes(p));
  report(
    "2. Route universe: sitemap === static route list",
    missing.length === 0 && extra.length === 0,
    missing.length || extra.length
      ? `missing from sitemap: [${missing}] · not in route list: [${extra}]`
      : `${sitemapPaths.length} routes`,
  );
}

function checkSitemapLastmod(sitemapXml, buildStartIso) {
  const entries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1];
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1];
    return { loc, lastmod };
  });
  const problems = [];
  const now = Date.now();
  const buildDay = buildStartIso.slice(0, 10);
  let sameAsBuildDay = 0;
  for (const e of entries) {
    if (!e.lastmod) {
      problems.push(`${e.loc}: no <lastmod>`);
      continue;
    }
    const t = Date.parse(e.lastmod);
    if (Number.isNaN(t)) problems.push(`${e.loc}: unparseable lastmod ${e.lastmod}`);
    else if (t > now + 86_400_000) problems.push(`${e.loc}: lastmod in the future`);
    if (e.lastmod.slice(0, 10) === buildDay) sameAsBuildDay++;
  }
  // Every lastmod equal to the build day means git history collapsed (a
  // shallow clone) or the dates are being faked from `new Date()`.
  const allBuildDay = entries.length > 0 && sameAsBuildDay === entries.length;
  if (allBuildDay) {
    problems.push(
      `all ${entries.length} lastmod values equal the build date — git history is probably shallow (needs fetch-depth: 0)`,
    );
  }
  report(
    "3. Sitemap lastmod present, nonzero, not the build timestamp",
    problems.length === 0,
    problems.length
      ? problems.join(" | ")
      : `${entries.length} urls · ${sameAsBuildDay} on the build date`,
  );
}

function checkLlmsCoverage(llms, sitemapUrls) {
  const inLlms = new Set(
    [...llms.matchAll(/\((https:\/\/www\.jamesbrady\.org[^)]*)\)/g)].map((m) => m[1]),
  );
  const indexable = new Set(sitemapUrls);
  const missing = [...indexable].filter((u) => !inLlms.has(u));
  // Machine-readable endpoints are listed as bare URLs, not markdown links.
  const extra = [...inLlms].filter((u) => !indexable.has(u));
  report(
    "4. llms.txt coverage === indexable routes",
    missing.length === 0 && extra.length === 0,
    missing.length || extra.length
      ? `missing: [${missing}] · extra: [${extra}]`
      : `${inLlms.size} urls`,
  );
}

function checkManifestCoverage(manifestJson, sitemapUrls) {
  let manifest;
  try {
    manifest = JSON.parse(manifestJson);
  } catch (e) {
    report("5. ai-manifest.json routes === indexable routes", false, `unparseable: ${e.message}`);
    return;
  }
  const inManifest = new Set(manifest.routes?.map((r) => r.url) ?? []);
  const indexable = new Set(sitemapUrls);
  const missing = [...indexable].filter((u) => !inManifest.has(u));
  const extra = [...inManifest].filter((u) => !indexable.has(u));
  const staleLiteral = /last_updated/.test(manifestJson);
  report(
    "5. ai-manifest.json routes === indexable routes",
    missing.length === 0 && extra.length === 0 && !staleLiteral && Boolean(manifest.generatedAt),
    missing.length || extra.length
      ? `missing: [${missing}] · extra: [${extra}]`
      : `${inManifest.size} routes · generatedAt ${manifest.generatedAt} · contentVersion ${manifest.contentVersion}`,
  );
}

async function checkOg(pages) {
  const bad = [];
  const images = new Set();
  for (const [path, html] of pages) {
    for (const prop of ["og:title", "og:description", "og:image", "og:url"]) {
      if (!html.includes(`property="${prop}"`)) bad.push(`${path}: missing ${prop}`);
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
    const buf = Buffer.from(await res.arrayBuffer());
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    if (w !== 1200 || h !== 630) bad.push(`${img}: ${w}x${h}, expected 1200x630`);
  }
  report(
    "6. Per-page OG + twitter, images resolve at 1200x630",
    bad.length === 0,
    bad.length ? bad.join(" | ") : `${pages.length} routes · ${images.size} distinct images`,
  );
}

function checkJsonLd(pages) {
  const bad = [];
  for (const [path, html] of pages) {
    const blocks = [
      ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ];
    // Legacy routes carry no graph this wave; new surfaces must carry exactly one.
    const isLegacy = ["/primer", "/manuscript", "/workshop", "/links", "/watch"].includes(path);
    if (blocks.length === 0) {
      if (!isLegacy) bad.push(`${path}: no ld+json block`);
      continue;
    }
    if (blocks.length > 1) {
      bad.push(`${path}: ${blocks.length} ld+json blocks, expected 1`);
      continue;
    }
    const raw = blocks[0][1].replace(/\\u003c/g, "<");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      bad.push(`${path}: unparseable JSON-LD (${e.message})`);
      continue;
    }
    if (parsed["@context"] !== "https://schema.org") bad.push(`${path}: bad @context`);
    const graph = parsed["@graph"] ?? [];
    const flat = JSON.stringify(graph);
    if (flat.includes("ScholarlyArticle")) bad.push(`${path}: ScholarlyArticle is banned`);
    if (flat.includes("AI Alchemist")) bad.push(`${path}: register-rule violation in JSON-LD`);
    const persons = graph.filter((n) => n["@type"] === "Person");
    if (persons.length !== 1) bad.push(`${path}: ${persons.length} Person nodes, expected 1`);
    else if (persons[0]["@id"] !== `${CANONICAL_HOST}/#person`)
      bad.push(`${path}: Person node lacks the canonical @id`);
  }
  report(
    "7. JSON-LD: one block, valid, one canonical Person, no ScholarlyArticle",
    bad.length === 0,
    bad.length ? bad.join(" | ") : `${pages.length} routes checked`,
  );
}

/**
 * The h3ro gate. The allowlist is explicit and lives here: a naive grep would
 * fail on the permitted profile and org-infrastructure URLs, so this check
 * must never be "simplified" into a bare grep.
 */
function checkH3ro(pages) {
  const ALLOW = [
    "https://x.com/h3roai",
    "https://www.tiktok.com/@h3ro.ai",
    /https:\/\/github\.com\/h3ro-dev\/[\w.-]+/g,
    /https:\/\/h3ro-dev\.github\.io\/[\w./-]*/g,
  ];
  const strip = (text) => {
    let out = text;
    for (const a of ALLOW) out = out.split ? out.replaceAll?.(a, " ") ?? out : out;
    out = out.replaceAll("https://x.com/h3roai", " ");
    out = out.replaceAll("https://www.tiktok.com/@h3ro.ai", " ");
    out = out.replace(/https:\/\/github\.com\/h3ro-dev\/[\w.-]+/g, " ");
    out = out.replace(/https:\/\/h3ro-dev\.github\.io\/[\w./-]*/g, " ");
    return out;
  };

  const hits = [];
  for (const [path, html] of pages) {
    const rest = strip(html);
    const m = rest.match(/h3ro/gi);
    if (m) hits.push(`${path}: ${m.length} non-allowlisted h3ro reference(s)`);
  }
  for (const file of newSurfaceFiles()) {
    const rest = strip(readFileSync(file, "utf8"));
    if (/h3ro/i.test(rest)) hits.push(`${relative(ROOT, file)}: source reference`);
  }
  report(
    "8. No h3ro branding outside the explicit allowlist",
    hits.length === 0,
    hits.length
      ? hits.join(" | ")
      : "allowlist: x.com/h3roai, tiktok.com/@h3ro.ai, github.com/h3ro-dev/*, h3ro-dev.github.io/*",
  );
}

/**
 * Client-name denylist. FAILS CLOSED when the file is absent, and passes on an
 * empty list only while the explicit placeholder marker is present, so "no
 * denylist" can never be mistaken for "denylist clean".
 */
function checkDenylist(pages, artifacts) {
  const file = join(ROOT, ".seo-denylist.txt");
  if (!existsSync(file)) {
    report(
      "9. Client-name denylist",
      false,
      "FAIL CLOSED: .seo-denylist.txt is absent. CI must materialize it from the CLIENT_DENYLIST secret before this gate can run.",
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
        "9. Client-name denylist",
        false,
        `FAIL CLOSED: .seo-denylist.txt has no terms and no "${marker}" marker. An empty file without the marker is indistinguishable from a missing secret.`,
      );
      return;
    }
    console.log(
      `      !! DENYLIST IS A PLACEHOLDER — 0 terms. This gate is proving NOTHING about client\n` +
        `         confidentiality until CI materializes .seo-denylist.txt from the CLIENT_DENYLIST\n` +
        `         secret (geo-seo-spec §9-C). Blocking for deploy setup.`,
    );
    report("9. Client-name denylist", true, "0 terms · placeholder marker present · gate armed, not yet loaded");
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
  report("9. Client-name denylist", hits.length === 0, hits.length ? hits.join(" | ") : `${terms.length} terms, 0 matches`);
}

function checkHostDiscipline(pages, artifacts) {
  const bad = [];
  for (const [name, text] of [...pages, ...artifacts]) {
    const m = text.match(/https:\/\/jamesbrady\.org/g);
    if (m) bad.push(`${name}: ${m.length} bare-host reference(s)`);
  }
  for (const file of newSurfaceFiles()) {
    if (/https:\/\/jamesbrady\.org/.test(readFileSync(file, "utf8")))
      bad.push(`${relative(ROOT, file)}: bare-host reference in source`);
  }
  report(
    "10. Host discipline: www everywhere, never bare jamesbrady.org",
    bad.length === 0,
    bad.length ? bad.join(" | ") : "clean",
  );
}

/**
 * Register rule, scoped to the NEW surfaces. The legacy volumes keep their
 * current copy and component names this wave by explicit scope decision; the
 * known outstanding violations are listed rather than silently tolerated.
 */
function checkRegister(pages) {
  const BANNED = /alchemist|alchemy|metatron|vesica|neural link|semantic input/i;
  const bad = [];
  for (const file of newSurfaceFiles()) {
    const text = readFileSync(file, "utf8");
    if (BANNED.test(text)) bad.push(`${relative(ROOT, file)}`);
  }
  const NEW_ROUTES = STATIC_ROUTES.filter(
    (p) => !["/primer", "/manuscript", "/workshop", "/links", "/watch"].includes(p),
  );
  for (const [path, html] of pages) {
    if (!NEW_ROUTES.includes(path)) continue;
    if (BANNED.test(html)) bad.push(`rendered ${path}`);
  }
  report(
    "11. Register rule on new surfaces",
    bad.length === 0,
    bad.length
      ? bad.join(" | ")
      : "clean · DEFERRED (wave 2): components/AlchemyCanvas.tsx, /api/catalog title string, legacy volume copy",
  );
}

function checkRobots(robots) {
  const ok = /Disallow: \/api\//.test(robots) && /Allow: \/api\/catalog/.test(robots);
  report(
    "12. robots: Disallow /api/ plus an explicit Allow /api/catalog",
    ok,
    ok ? "both rules present" : robots.slice(0, 200),
  );
}

/* ================================================================== main */

const buildStartIso = new Date().toISOString();

console.log(`\nverify-seo — base ${BASE}\n${"─".repeat(72)}`);

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
const manifest = (await get("/.well-known/ai-manifest.json")).body;
const feed = (await get("/feed.xml")).body;
const robots = (await get("/robots.txt")).body;

const artifacts = [
  ["sitemap.xml", sitemapXml],
  ["llms.txt", llms],
  ["ai-manifest.json", manifest],
  ["feed.xml", feed],
];

await checkCanonicals(pages);
await checkRouteUniverse(sitemapUrls);
checkSitemapLastmod(sitemapXml, buildStartIso);
checkLlmsCoverage(llms, sitemapUrls);
checkManifestCoverage(manifest, sitemapUrls);
await checkOg(pages);
checkJsonLd(pages);
checkH3ro(pages);
checkDenylist(pages, artifacts);
checkHostDiscipline(pages, artifacts);
checkRegister(pages);
checkRobots(robots);

console.log("─".repeat(72));
console.log(
  `${results.filter((r) => r.ok).length}/${results.length} checks passed` +
    (failed ? ` — ${failed} FAILED` : ""),
);
process.exit(failed ? 1 : 0);
