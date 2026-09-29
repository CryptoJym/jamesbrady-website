#!/usr/bin/env node
// Visual + behavioural acceptance for wave 1.
//
// Run against `next start`:
//   NODE_PATH=<playwright> node scripts/verify-visual.mjs --base http://localhost:4123
//
// Proves the things a build log cannot: that the manifold canvas actually
// animates, that the readout numbers on screen equal the collection-derived
// values, that the CSS-counter tally really recounts when a filter changes,
// that reduced-motion and no-JS both fall back to the static SVG, and that the
// five archived routes render EXACTLY as they do on main.
//
// SCREENSHOT DESTINATION. By default screenshots go to the UNTRACKED out/
// directory. Pass --update-evidence to write docs/evidence/wave-1/ instead.
// Before this split, every run rewrote 16 tracked PNGs — a review lane watched
// them mutate by 8 bytes each on a re-run and had to work out whether that was
// drift or tampering. Evidence should change when someone decides to refresh
// it, not as a side effect of verifying.
//
// LEGACY PARITY — RETIRED IN WAVE 4, AND HERE IS WHY.
//
// The gate was: build `main` in a second worktree, serve it at --legacy-base,
// and require ZERO differing pixels on /primer, /manuscript, /workshop and
// /watch. It existed because those four routes shared a stylesheet, a Tailwind
// config and a root layout with the Direction B build while being explicitly
// out of scope, so a token change could silently re-render pages nobody had
// touched. It earned its keep: it caught a `colors.base` cross-scale collision
// that repainted a heading band on /manuscript, which no amount of reading
// found.
//
// Wave 4 reskinned all four onto Direction B at the same URLs. They are now
// INTENDED to differ from main in every pixel, so a zero-difference assertion
// against main would fail by design — and a gate that must be suppressed to
// pass is a gate that gets deleted for the wrong reason later. It is replaced
// below by the checks every other Direction B route already answers to:
// no horizontal overflow at 1440 and 375, a clean heading outline, the archive
// band present with a real date, and the chrome actually mounted.
//
// WHAT THE RETIREMENT COSTS, STATED. Nothing now pins those four routes
// against a previous build. That protection is no longer meaningful — after
// this wave they are built from the same components as every other route, so
// the leak the gate watched for cannot single them out. No other gate is
// weakened by this change.
//
// FULGURITE — 2026-09-27. The accepted design replaced Direction B, and every
// selector this file read (.mf, .readout, .rail, .hero__copy, .tally, .doors,
// .visit__*, .b-room, .dock) went with it. Each check below keeps its purpose
// and now reads the Fulgurite page:
//
//   the manifold animates         → the specimen animates (stage pixels, 1s)
//   readout === collection values → the home figures === the history snapshot
//                                   and threads.ts, read here from source
//   punch list 9/10, inline method → every figure carries its method, and the
//                                   method opens on focus
//   hero explains James            → h1 "James Brady · Lehi, Utah", his hero
//                                   quote verbatim from lib/words, the CTA row
//   counts never animate           → .fg-fig, .fg-tip__n, .fga-readout__n
//   pending marks, three places    → James's 2026-09-27 ruling: every open
//                                   question is a visible third-person note, and
//                                   no page shows the owner-facing mark
//   door row, 4 across / 2x2       → four doors, each a link naming where it
//                                   goes, filling whole rows at 1440 and at 375
//   work cards link to the repo    → a label that prints a repository URL links
//                                   to exactly that URL
//   archives: band, outline, chrome → the same, on the Fulgurite chrome, and no
//                                   gold or Direction B colour painted
//   dock clear space (375)         → the fixed chrome rule it enforced, applied
//                                   to the chrome that is fixed now: the header
//                                   covers no page's h1; on a phone the specimen
//                                   window sits above the text, never over it
//   reduced motion, static SVG     → the specimen stands still, the strike never
//                                   runs
//   no-JS static SVG               → the design's own fallback tier: with no
//                                   WebGL the Blender poster stands in; with no
//                                   JS the whole page is in the server response
//
// RETIRED, because the design no longer has the thing they measured:
//   · the /work filter recount (the CSS-counter tally): /work is now a tray of
//     labelled threads with no filter. Its counts are figures with methods and
//     are covered by the figure checks above;
//   · the "This visit" plate (issue 13): components/site/ThisVisit.tsx is not
//     mounted by any route;
//   · the /now open-items register: retired by the 2026-09-27 ruling.
// The star count beside a work card went with the card: Fulgurite labels carry
// no star count, so there is nothing for that half of the check to read.
//
// REBUILD — 2026-09-28. The home page now leads with what he built: outcome
// proofs under the lede, the merge count moved into the specimen's key, and the
// tip counts the work that is live today. Each check keeps its purpose and reads
// the new page; none is loosened:
//
//   home figures === their sources → the same comparison, over more figures: the
//                                   merge count (now in the key, data-fig
//                                   "merged-all"), the water-filtration and
//                                   set-up proofs, the live count in the key and
//                                   in the tip, all read from content/built and
//                                   the snapshot on disk
//   method opens on focus          → focused on the first figure of the hero, the
//                                   first proof, instead of a lede figure that
//                                   is no longer there
//   "threads still growing"        → retired from the tip, which now shows the
//                                   work live today; that figure is compared
//                                   with content/built the same way

import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

import { importTs } from "./lib/ts-register.mjs";

const arg = (flag) =>
  process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : null;

const BASE = arg("--base") ?? "http://localhost:4123";
const UPDATE_EVIDENCE = process.argv.includes("--update-evidence");
/** Which packet --update-evidence writes into. Defaults to the wave-1 set. */
const EVIDENCE_WAVE = arg("--wave") ?? "wave-1";
const OUT = UPDATE_EVIDENCE
  ? join(process.cwd(), "docs", "evidence", EVIDENCE_WAVE)
  : join(process.cwd(), "out", "verify-visual");
mkdirSync(OUT, { recursive: true });

/**
 * The dated archives: same URLs, Direction B skin as of wave 4, Fulgurite as of
 * 2026-09-27.
 *
 * They are checked here the way every other route is checked, not against a
 * previous build. See the retirement note at the top of this file.
 */
// /watch left on 2026-09-27: it redirects permanently to /learn (next.config.ts).
const ARCHIVE_ROUTES = ["/primer", "/manuscript", "/workshop"];

/** Retired palettes, as computed style prints them: the old gold, and Direction B's signal and base. */
const RETIRED_COLOURS = ["212, 168, 83", "63, 217, 160", "10, 14, 17"];

/** The history the home page is grown from, read from source, not from the page. */
const SNAPSHOT = JSON.parse(
  readFileSync(join(process.cwd(), "content", "history", "history.snapshot.json"), "utf8"),
);
const { heroQuote } = await importTs("lib/words.ts");
const BUILT = await importTs("content/built/index.ts");

let failed = 0;
const report = (name, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

/** The WebGL canvas has taken over from the poster: it drew its first frame. */
const specimenLive = (p) =>
  p.waitForFunction(
    () => {
      const stage = document.querySelector(".fg-stage");
      return Boolean(stage?.querySelector("canvas") && !stage.querySelector("img"));
    },
    { timeout: 30_000 },
  );

/** The stage's box, cut to the viewport. */
const stageClip = async (p) => {
  const box = await p.locator(".fg-stage").boundingBox();
  const vh = p.viewportSize().height;
  return { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, vh - box.y) };
};

/** Pixels that differ by more than a rounding step between two PNG screenshots. */
const pixelDiff = (p, a, b) =>
  p.evaluate(
    async ([a64, b64]) => {
      const load = (src) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = `data:image/png;base64,${src}`;
        });
      const [ia, ib] = await Promise.all([load(a64), load(b64)]);
      const c = document.createElement("canvas");
      c.width = ia.width;
      c.height = ia.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(ia, 0, 0);
      const da = ctx.getImageData(0, 0, c.width, c.height).data;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(ib, 0, 0);
      const db = ctx.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < da.length; i += 4) {
        if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 12) n++;
      }
      return { changed: n, total: da.length / 4 };
    },
    [a.toString("base64"), b.toString("base64")],
  );

const overflowOf = (p) =>
  p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** The fixed header's bottom edge against the page's h1 at load. */
const headerVsH1 = (p) =>
  p.evaluate(() => {
    const head = document.querySelector(".fg-head")?.getBoundingClientRect();
    const h1 = document.querySelector("h1")?.getBoundingClientRect();
    return { headBottom: head?.bottom ?? null, h1Top: h1?.top ?? null };
  });

/** Four doors that fill whole rows: equal widths, and every row the same length. */
const doorGrid = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll(".fg-doors__grid .fg-door")].map((d) => {
      const r = d.getBoundingClientRect();
      return {
        href: d.getAttribute("href"),
        title: d.querySelector("h3")?.textContent?.trim(),
        go: d.querySelector(".fg-door__go")?.textContent?.trim(),
        top: Math.round(r.top),
        width: Math.round(r.width),
      };
    }),
  );
const rowsOf = (doors) => {
  const rows = new Map();
  for (const d of doors) rows.set(d.top, (rows.get(d.top) ?? 0) + 1);
  return [...rows.values()];
};

/* ------------------------------------------------ 1440: the full home page */

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await specimenLive(page);
await page.waitForTimeout(400);

const clip1440 = await stageClip(page);
const frameA = await page.screenshot({ clip: clip1440 });
await page.waitForTimeout(1000);
const frameB = await page.screenshot({ clip: clip1440 });
const motion = await pixelDiff(page, frameA, frameB);
report(
  "The specimen animates (stage pixel diff over 1s)",
  motion.changed > 1000,
  `${motion.changed} of ${motion.total} px changed (${((motion.changed / motion.total) * 100).toFixed(2)}%)`,
);

// Figures, read off the rendered page — and the same values read from the
// history snapshot and content/built on disk, so the page is not checking itself.
const shownFigures = await page.evaluate(() => ({
  fig: Object.fromEntries([...document.querySelectorAll("[data-fig]")].map((f) => [f.getAttribute("data-fig"), f.innerText.trim()])),
  tip: [...document.querySelectorAll(".fg-tip__cell")].map((c) => ({
    k: c.querySelector(".fg-tip__k")?.textContent?.trim() ?? "",
    n: c.querySelector(".fg-tip__n")?.innerText.trim() ?? "",
  })),
}));
const tipValue = (label) => shownFigures.tip.find((t) => t.k.startsWith(label))?.n;
const plimsollReleases = [...(SNAPSHOT.releases["CryptoJym/plimsoll"] ?? [])].sort((a, b) => a.date.localeCompare(b.date));
const liveToday = String(BUILT.countStatus("live"));
const water = BUILT.builtById("water-filtration-texting").outcomes[0].figure.n;
const expectedFigures = [
  ["merged in public, all time (the key)", shownFigures.fig["merged-all"], SNAPSHOT.totals.mergedPublicAll.toLocaleString("en-US")],
  ["water filtration, past customers back (proof)", shownFigures.fig["water-back"], water.toLocaleString("en-US")],
  ["trade businesses set up (proof)", shownFigures.fig["setups"], String(BUILT.builtById("utlyze-ai-setups-for-businesses").outcomes.length)],
  ["outcomes, one bead each (the key)", shownFigures.fig["outcomes"], String(BUILT.outcomes.length)],
  ["live today (the key)", shownFigures.fig["live-key"], liveToday],
  ["merged in the last thirty days", tipValue("in the last thirty"), SNAPSHOT.totals.mergedPublic30d.toLocaleString("en-US")],
  ["live today (the tip)", tipValue("pieces of work live today"), liveToday],
  ["latest Plimsoll release", tipValue("latest Plimsoll release"), plimsollReleases.at(-1)?.tag],
];
const figureMismatches = expectedFigures.filter(([, shown, source]) => !source || shown !== source);
report(
  "Home figures === the record they are computed from (history snapshot, content/built)",
  figureMismatches.length === 0,
  figureMismatches.length
    ? figureMismatches.map(([k, shown, source]) => `${k}: page ${shown} vs source ${source}`).join(" | ")
    : expectedFigures.map(([k, shown]) => `${k}=${shown}`).join(" · "),
);

// Every number carries its method, and the method opens on focus (the design's
// "method one tap away"; punch lists 9 and 10 asked the same of the readout).
const figures = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-fig")].map((f) => {
    const m = f.querySelector(".fg-fig__m")?.textContent?.trim() ?? "";
    return { m, labelled: Boolean(m) && (f.getAttribute("aria-label") ?? "").endsWith(`Method: ${m}`), focusable: f.tabIndex === 0 };
  }),
);
await page.focus(".fg-surface .fg-fig");
const methodOpens = await page.evaluate(
  () => getComputedStyle(document.querySelector(".fg-surface .fg-fig .fg-fig__m")).display !== "none",
);
await page.evaluate(() => document.activeElement?.blur());
report(
  "Every home figure states its method, and the method opens on focus",
  figures.length > 0 && figures.every((f) => f.m && f.labelled && f.focusable) && methodOpens,
  `${figures.length} figures · ${figures.filter((f) => f.m && f.labelled && f.focusable).length} with a method in text and in the label · opens on focus: ${methodOpens}`,
);

const hero = await page.evaluate(() => ({
  h1: document.querySelector("h1")?.textContent?.trim(),
  firstHeading: document.querySelector("h1,h2,h3")?.tagName,
  quote: document.querySelector(".fg-surface #hero q")?.textContent?.replace(/\s+/g, " ").trim(),
  attribution: document.querySelector(".fg-surface .fg-attrib")?.textContent?.trim() ?? "",
  cta: [...document.querySelectorAll(".fg-surface .fg-cta-row a")].map((a) => a.getAttribute("href")),
  descent: Boolean(document.getElementById("descent")),
  stageLabel: document.querySelector(".fg-stage")?.getAttribute("aria-label") ?? "",
}));
report(
  "Home says who and where: the h1, his hero quote verbatim, the CTA row, the stage described",
  hero.h1 === "James Brady · Lehi, Utah" &&
    hero.firstHeading === "H1" &&
    hero.quote === heroQuote.text.replace(/\s+/g, " ").trim() &&
    hero.attribution.includes(heroQuote.context) &&
    hero.cta.join(" ") === "#descent /work-with-me" &&
    hero.descent &&
    hero.stageLabel.length > 0,
  `h1 "${hero.h1}" · quote "${hero.quote}" · ${hero.attribution} · CTA ${hero.cta.join(", ")} · stage "${hero.stageLabel}"`,
);

// Counts never animate.
const countSelectors = ".fg-fig, .fg-tip__n, .fga-readout__n, .fga-delta__v";
let countsSeen = 0;
let countsMoving = [];
for (const path of ["/", "/work", "/work/plimsoll", "/manuscript"]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  const r = await page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)];
    return {
      n: els.length,
      moving: els.filter((el) => {
        const s = getComputedStyle(el);
        return s.animationName !== "none" || s.transitionDuration !== "0s";
      }).length,
    };
  }, countSelectors);
  countsSeen += r.n;
  if (r.moving) countsMoving.push(`${path}: ${r.moving}`);
}
report(
  "Counts never animate",
  countsSeen > 0 && countsMoving.length === 0,
  countsMoving.length ? countsMoving.join(" | ") : `${countsSeen} counts on 4 routes, none animated or transitioned`,
);

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await specimenLive(page);
await page.waitForTimeout(500);
await page.screenshot({ path: join(OUT, "home-1440-hero.png") });
await page.screenshot({ path: join(OUT, "home-1440-full.png"), fullPage: true });

// No horizontal overflow at desktop.
const overflow1440 = await overflowOf(page);
report("No horizontal overflow at 1440", overflow1440 <= 0, `${overflow1440}px`);

/* ---------------------------------------------------------- inner surfaces */

// The fixed header must never sit on a page's h1: the fixed-chrome rule the
// Direction B dock answered at the foot of the page, on the chrome that is
// fixed now.
const underHeader = [];
for (const [path, file] of [
  ["/work-with-me", "work-with-me-1440.png"],
  ["/work-with-me/get-found", "offer-get-found-1440.png"],
  ["/work-with-me/build-a-system", "offer-build-a-system-1440.png"],
  ["/work-with-me/background-screening", "offer-background-screening-1440.png"],
  ["/work", "work-1440.png"],
  ["/work/plimsoll", "work-plimsoll-1440.png"],
  ["/theories", "theories-1440.png"],
  ["/theories/latent-emotions", "theory-latent-emotions-1440.png"],
  ["/words", "words-1440.png"],
  ["/about", "about-1440.png"],
  ["/contact", "contact-1440.png"],
  ["/now", "now-1440.png"],
  ["/lab", "lab-1440.png"],
  ["/learn", "learn-1440.png"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  const { headBottom, h1Top } = await headerVsH1(page);
  if (headBottom === null || h1Top === null || h1Top < headBottom) underHeader.push(`${path}: h1 at ${h1Top}, header to ${headBottom}`);
  await page.screenshot({ path: join(OUT, file), fullPage: true });
}
report(
  "The fixed header covers no page's h1 at 1440 (14 inner routes)",
  underHeader.length === 0,
  underHeader.length ? underHeader.join(" | ") : "every h1 starts below the header",
);

// OPEN QUESTIONS (James, 2026-09-27): every one renders as its third-person
// note. The gaps must still be VISIBLE — the original assertion — and no page
// may show the owner-facing mark. Builder, buyer and hand-built pages, one each.
const openQuestions = [];
for (const path of ["/theories/architect-loop", "/work-with-me/background-screening", "/contact"]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  const state = await page.evaluate(() => ({
    marks: document.querySelectorAll("mark.pending, .pending__tag").length,
    notes: [...document.querySelectorAll(".pending-note")].map((n) => {
      const s = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      return s.display !== "none" && s.visibility === "visible" && r.width > 0 && r.height > 0;
    }),
  }));
  openQuestions.push({ path, ...state });
}
report(
  "Open questions are visible third-person notes, and no page shows the owner-facing mark",
  openQuestions.every((q) => q.marks === 0 && q.notes.length > 0 && q.notes.every(Boolean)),
  openQuestions.map((q) => `${q.path}: ${q.notes.filter(Boolean).length}/${q.notes.length} notes visible, ${q.marks} marks`).join(" · "),
);
await page.screenshot({ path: join(OUT, "contact-open-question-1440.png"), fullPage: true });

// The home page's doors: four, each a real link that says where it goes. The
// count is asserted rather than described, because a door that silently
// stopped rendering would leave the page looking finished — and the doors must
// fill whole rows, because an orphan on a row of its own reads as a mistake.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const doors = await doorGrid(page);
report(
  "Home doors: four, each a link with a title and a destination",
  doors.length === 4 && doors.every((d) => d.href && d.title && d.go),
  doors.map((d) => `${d.title} → ${d.href}`).join(" · "),
);
const rows1440 = rowsOf(doors);
report(
  "Door grid fills whole rows at 1440, no door narrower than 240px",
  doors.length === 4 &&
    rows1440.every((n) => n === rows1440[0]) &&
    Math.max(...doors.map((d) => d.width)) - Math.min(...doors.map((d) => d.width)) <= 1 &&
    Math.min(...doors.map((d) => d.width)) >= 240,
  `${doors.length} doors in rows of [${rows1440.join(", ")}] · widths ${[...new Set(doors.map((d) => d.width))].join("/")}px`,
);
await page.locator(".fg-doors").screenshot({ path: join(OUT, "home-1440-doors.png") });

// A label that prints a repository URL goes to exactly that repository.
await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
const repoLinks = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-label a, .fga-label a")]
    .filter((a) => /^github\.com\//.test(a.textContent.trim()))
    .map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim() })),
);
const misprinted = repoLinks.filter((r) => r.href !== `https://${r.text}`);
report(
  "Work labels link straight to the repository they print",
  repoLinks.length > 0 && misprinted.length === 0,
  misprinted.length
    ? misprinted.map((r) => `"${r.text}" → ${r.href}`).join(" | ")
    : `${repoLinks.length} repository labels, each linking to the URL it shows`,
);

/* ------------------------------------ THE DATED ARCHIVES, ON THE SYSTEM ---
   Wave 4. /primer, /manuscript, /workshop and /watch kept their URLs and moved
   onto Direction B; on 2026-09-27 onto Fulgurite, and /watch now redirects.
   The pixel-parity-against-main gate that used to live here is retired — the
   reasoning is at the top of this file — and these are the checks that
   replace it, the same ones every other route answers to. They are
   ASSERTIONS, not screenshots: a screenshot proves a page rendered, not that
   it rendered correctly. */

const archiveFailures = [];
const archiveDetail = [];
for (const route of ARCHIVE_ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const state = await page.evaluate((retired) => {
    const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName[1]),
    );
    let skips = 0;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) skips++;
    }
    const badge = document.querySelector(".fga-archive .fga-archive__tag");
    return {
      overflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1s: levels.filter((l) => l === 1).length,
      skips,
      // The band, and a REAL date in it. "Archived" with nothing after it is
      // the failure this asserts against, not the absence of the element.
      badge: badge?.textContent?.trim() ?? "",
      // The chrome the reskin exists to deliver: the fixed header with the
      // mark linking home, the navigation, the footer and the main landmark.
      // A route that renders but mounts none of it is the old defect again.
      chrome: Boolean(
        document.querySelector('.fg-head .fg-wordmark[href="/"]') &&
          document.querySelector(".fg-head .fg-nav") &&
          document.querySelector(".fg-foot") &&
          document.querySelector("main#main"),
      ),
      // No colour from a retired palette survives anywhere on the page.
      retired: [...document.querySelectorAll("*")].some((el) => {
        const s = getComputedStyle(el);
        const paint = `${s.color}${s.backgroundColor}${s.borderTopColor}${s.borderLeftColor}`;
        return retired.some((c) => paint.includes(c));
      }),
    };
  }, RETIRED_COLOURS);

  const problems = [];
  if (state.overflow > 0) problems.push(`${state.overflow}px of horizontal overflow`);
  if (state.h1s !== 1) problems.push(`${state.h1s} h1 elements, expected exactly 1`);
  if (state.skips > 0) problems.push(`${state.skips} skipped heading level(s)`);
  if (!/^Archived \d{4}-\d{2}-\d{2}$/.test(state.badge))
    problems.push(`archive band reads "${state.badge}", expected a dated badge`);
  if (!state.chrome) problems.push("the Fulgurite chrome is not mounted");
  if (state.retired) problems.push("a retired-palette colour is still painted");

  if (problems.length) archiveFailures.push(`${route}: ${problems.join("; ")}`);
  else archiveDetail.push(`${route}:${state.badge.toLowerCase().replace(" ", "=")}`);

  await page.screenshot({
    path: join(OUT, `${route.slice(1)}-1440.png`),
    fullPage: true,
  });
}
report(
  `Dated archives on the design system (${ARCHIVE_ROUTES.length} routes: no overflow, one h1, no level skip, dated band, chrome mounted, no retired colour)`,
  archiveFailures.length === 0,
  archiveFailures.length ? archiveFailures.join(" | ") : archiveDetail.join(" · "),
);

/* --------------------------------------------------------------- 375 mobile */

const mobile = await browser.newContext({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const mpage = await mobile.newPage();
await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await specimenLive(mpage);
await mpage.waitForTimeout(600);
const overflow375 = await overflowOf(mpage);
report("No horizontal overflow at 375", overflow375 <= 0, `${overflow375}px`);

// On a phone the specimen is a window at the top that descends with the
// reader. It must stick, and the text must start below it, never under it.
const window375 = await mpage.evaluate(() => {
  const stage = document.querySelector(".fg-stage");
  const r = stage.getBoundingClientRect();
  return {
    position: getComputedStyle(stage).position,
    bottom: Math.round(r.bottom),
    height: Math.round(r.height),
    h1Top: Math.round(document.querySelector("h1").getBoundingClientRect().top),
    vh: window.innerHeight,
  };
});
report(
  "At 375 the specimen is a sticky window above the text, and the h1 starts below it",
  window375.position === "sticky" && window375.h1Top >= window375.bottom && window375.height < window375.vh * 0.6,
  `${window375.position}, ${window375.height}px of ${window375.vh}px · stage ends ${window375.bottom}px · h1 at ${window375.h1Top}px`,
);
await mpage.screenshot({ path: join(OUT, "home-375-hero.png") });
await mpage.screenshot({ path: join(OUT, "home-375-full.png"), fullPage: true });

// The wave-3 surfaces at 375, and the overflow assertion on each of them. A
// door grid and an offer grid are exactly the shapes that break a phone, so
// they are measured rather than eyeballed.
const narrowOverflow = [];
const narrowUnderHeader = [];
const NARROW_ROUTES = [
  ["/work-with-me", "work-with-me-375.png"],
  ["/work-with-me/get-found", "offer-get-found-375.png"],
  ["/work-with-me/build-a-system", "offer-build-a-system-375.png"],
  ["/work-with-me/background-screening", "offer-background-screening-375.png"],
  ["/now", "now-375.png"],
  ["/words", "words-375.png"],
];
for (const [path, file] of NARROW_ROUTES) {
  await mpage.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(300);
  const over = await overflowOf(mpage);
  if (over > 0) narrowOverflow.push(`${path}: ${over}px`);
  const { headBottom, h1Top } = await headerVsH1(mpage);
  if (headBottom === null || h1Top === null || h1Top < headBottom) narrowUnderHeader.push(`${path}: h1 at ${h1Top}, header to ${headBottom}`);
  await mpage.screenshot({ path: join(OUT, file), fullPage: true });
}
report(
  "No horizontal overflow at 375 on the wave-3 routes and /words",
  narrowOverflow.length === 0,
  narrowOverflow.length
    ? narrowOverflow.join(" | ")
    : `${NARROW_ROUTES.length} routes measured`,
);
report(
  "The fixed header covers no page's h1 at 375",
  narrowUnderHeader.length === 0,
  narrowUnderHeader.length ? narrowUnderHeader.join(" | ") : `${NARROW_ROUTES.length} routes measured`,
);

// The dated archives at 375. These are the pages most likely to break a
// phone, because their content is not a card grid: a command line, a JSON
// config block, a 16:9 video and an install string are all fixed-width things
// inside a 375px column. Each of them has to scroll inside its own box rather
// than widen the document, so the measurement is the gate.
const archiveNarrow = [];
for (const route of ARCHIVE_ROUTES) {
  await mpage.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(300);
  const over = await overflowOf(mpage);
  if (over > 0) archiveNarrow.push(`${route}: ${over}px`);
  await mpage.screenshot({
    path: join(OUT, `${route.slice(1)}-375.png`),
    fullPage: true,
  });
}
report(
  `No horizontal overflow at 375 on the dated archives (${ARCHIVE_ROUTES.length} routes)`,
  archiveNarrow.length === 0,
  archiveNarrow.length ? archiveNarrow.join(" | ") : `${ARCHIVE_ROUTES.length} routes measured`,
);
// The doors at 375: the same four, still filling whole rows, and every door a
// full-width tap target rather than a sliver.
await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mpage.waitForTimeout(300);
const doors375 = await doorGrid(mpage);
const rows375 = rowsOf(doors375);
const narrowest = Math.min(...doors375.map((d) => d.width));
report(
  "Door grid fills whole rows at 375, no door narrower than 240px",
  doors375.length === 4 && rows375.every((n) => n === rows375[0]) && narrowest >= 240,
  `${doors375.length} doors in rows of [${rows375.join(", ")}] · narrowest ${narrowest}px`,
);
await mpage.locator(".fg-doors").screenshot({ path: join(OUT, "home-375-doors.png") });

/* ----------------------------------- reduced motion, no WebGL and no JS */

const rm = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rmPage = await rm.newPage();
await rmPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await specimenLive(rmPage);
await rmPage.waitForTimeout(1200);
const rmClip = await stageClip(rmPage);
const stillA = await rmPage.screenshot({ clip: rmClip });
await rmPage.waitForTimeout(1000);
const stillB = await rmPage.screenshot({ clip: rmClip });
const stillness = await pixelDiff(rmPage, stillA, stillB);
const strike = await rmPage.evaluate(() => sessionStorage.getItem("jb-strike"));
// A rasterizer may round a pixel differently from one frame to the next; a
// turning specimen changes thousands (see the first check), so the allowance
// is 0.05% of the stage.
report(
  "Reduced motion: the specimen stands still and the strike never runs",
  stillness.changed <= stillness.total * 0.0005 && strike === null,
  `${stillness.changed} of ${stillness.total} px changed over 1s · strike ${strike === null ? "never ran" : "RAN"}`,
);
await rmPage.screenshot({ path: join(OUT, "home-1440-reduced-motion.png") });

// No WebGL: the design's own fallback tier. The poster is the same object,
// rendered in Blender from the same geometry, and it has to stay up.
const noGl = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await noGl.addInitScript(() => {
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    return /webgl/i.test(String(type)) ? null : getContext.call(this, type, ...rest);
  };
});
const ngPage = await noGl.newPage();
await ngPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await ngPage.waitForTimeout(1500);
const poster = await ngPage.evaluate(() => {
  const img = document.querySelector(".fg-stage img");
  return {
    src: img?.getAttribute("src") ?? null,
    loaded: Boolean(img?.complete && img.naturalWidth > 0),
    shown: img ? getComputedStyle(img).display !== "none" && img.getBoundingClientRect().width > 0 : false,
    canvas: Boolean(document.querySelector(".fg-stage canvas")),
  };
});
report(
  "No WebGL: the specimen's poster stands in, loaded and shown",
  poster.src === "/specimen/poster.webp" && poster.loaded && poster.shown && !poster.canvas,
  `poster ${poster.src} loaded=${poster.loaded} shown=${poster.shown} · canvas ${poster.canvas ? "present" : "absent"}`,
);
await ngPage.screenshot({ path: join(OUT, "home-1440-no-webgl.png") });

const nojs = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  javaScriptEnabled: false,
});
const njPage = await nojs.newPage();
await njPage.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
const njHtml = await njPage.content();
// React escapes these five in text; the response carries the quote either way.
const quoteHtml = heroQuote.text
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#x27;");
report(
  "No JS: the home page's words are in the server response (h1, hero quote, CTA, the stage described)",
  njHtml.includes("James Brady · Lehi, Utah") &&
    (njHtml.includes(heroQuote.text) || njHtml.includes(quoteHtml)) &&
    njHtml.includes('href="#descent"') &&
    /<aside class="fg-stage" aria-label="[^"]+"/.test(njHtml),
);
report(
  "No JS: full theory text is in the server response",
  (await (await fetch(`${BASE}/theories/universal-question-geometry`)).text()).includes(
    "Universal Question Geometry starts from a different claim",
  ),
);
// With JavaScript off the four doors are plain server-rendered anchors —
// navigation works, nothing waits on a click handler.
report(
  "No JS: the four homepage doors are ordinary links in the server response",
  doors.length === 4 && doors.every((d) => njHtml.includes(`href="${d.href}"`)),
  doors.map((d) => d.href).join(" · "),
);
await njPage.screenshot({ path: join(OUT, "home-1440-no-js.png") });

await browser.close();

console.log("─".repeat(72));
console.log(failed ? `${failed} visual check(s) FAILED` : "all visual checks passed");
console.log(
  `screenshots → ${UPDATE_EVIDENCE ? `docs/evidence/${EVIDENCE_WAVE}/ (tracked evidence REFRESHED)` : "out/verify-visual/ (untracked; pass --update-evidence to refresh the committed set)"}`,
);
process.exit(failed ? 1 : 0);
