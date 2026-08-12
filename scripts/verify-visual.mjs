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

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

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
 * The dated archives: same URLs, Direction B skin as of wave 4.
 *
 * They are checked here the way every other Direction B route is checked, not
 * against a previous build. See the retirement note at the top of this file.
 */
const ARCHIVE_ROUTES = ["/primer", "/manuscript", "/workshop", "/watch"];

let failed = 0;
const report = (name, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

/* ------------------------------------------------ 1440: the full home page */

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

// The canvas takes over from the SVG only once it has drawn real ink.
await page.waitForFunction(() => document.querySelector(".mf")?.classList.contains("is-live"), {
  timeout: 10_000,
});

const grabCanvas = () =>
  page.evaluate(() => {
    const cv = document.querySelector("canvas.mf-c");
    return cv.toDataURL("image/png");
  });

const frameA = await grabCanvas();
await page.waitForTimeout(900);
const frameB = await grabCanvas();

const diffPixels = await page.evaluate(
  async ([a, b]) => {
    const load = (src) =>
      new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
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
  [frameA, frameB],
);
const pct = ((diffPixels.changed / diffPixels.total) * 100).toFixed(2);
report(
  "Manifold tier-2 canvas animates (pixel diff over 900ms)",
  diffPixels.changed > 1000,
  `${diffPixels.changed} of ${diffPixels.total} px changed (${pct}%)`,
);

// Readout values, read off the rendered page.
const readout = await page.evaluate(() =>
  [...document.querySelectorAll(".readout li")].map((li) => ({
    key: li.querySelector(".k")?.textContent?.trim(),
    value: li.querySelector(".v")?.textContent?.trim(),
    sub: li.querySelector(".sub")?.textContent?.trim() ?? "",
  })),
);
const railText = await page.evaluate(() => document.querySelector(".rail")?.innerText.replace(/\s+/g, " "));

// The same values, derived independently from the JSON artifacts the build
// produced — so the comparison is not the page checking itself.
const manifest = await (await fetch(`${BASE}/.well-known/ai-manifest.json`)).json();
const counts = Object.fromEntries(manifest.collections.map((c) => [c.name, c.count]));

const expected = {
  "Systems listed": String(counts.work).padStart(2, "0"),
  Theories: String(counts.theories).padStart(2, "0"),
};
const mismatches = readout
  .filter((r) => expected[r.key] !== undefined && r.value !== expected[r.key])
  .map((r) => `${r.key}: page ${r.value} vs source ${expected[r.key]}`);
report(
  "Readout numbers === collection-derived values",
  mismatches.length === 0,
  mismatches.length
    ? mismatches.join(" | ")
    : readout.map((r) => `${r.key}=${r.value}`).join(" · "),
);
report(
  "Console rail count === work.length",
  railText.includes(`${counts.work} SYSTEMS TRACKED`),
  railText.trim(),
);

// Public-repo count must be checkable: the sub line names the repos.
const repoRow = readout.find((r) => r.key === "Public repos");
report(
  "Public-repo count is checkable inline (punch list 9)",
  repoRow && repoRow.sub.split("·").length === Number(repoRow.value),
  `${repoRow?.value} → "${repoRow?.sub}"`,
);
const starRow = readout.find((r) => r.key === "Outside stars");
report(
  "Outside-stars method stated inline (punch list 10)",
  Boolean(starRow && /summed across/i.test(starRow.sub)),
  starRow?.sub,
);

// The CSS-counter tally: it must recount from what is DISPLAYED.
//
// getComputedStyle() will not resolve counter() in generated content, and the
// accessibility tree does not expose it either, so the numeral is proved the
// only way it can be: by cropping the rendered element and showing its pixels
// change in lockstep with the number of displayed cards. That is the whole
// point of the mechanism — the count is whatever is on screen, by construction.
const tallyState = async () =>
  page.evaluate(() => {
    const cards = [...document.querySelectorAll(".work .card")];
    return {
      filter: getComputedStyle(document.querySelector(".tally .fname"), "::after")
        .content.replace(/"/g, ""),
      visible: cards.filter((c) => getComputedStyle(c).display !== "none").length,
    };
  });

// Independently derived from the data-cat attributes in the markup, which come
// from the content source down a different path than the CSS counter.
const expectedByCat = await page.evaluate(() => {
  const out = { all: 0 };
  for (const c of document.querySelectorAll(".work .card")) {
    out.all++;
    for (const t of (c.dataset.cat ?? "").split(/\s+/).filter(Boolean))
      out[t] = (out[t] ?? 0) + 1;
  }
  return out;
});

const shot = async () => (await page.locator(".tally .n").screenshot()).toString("base64");

const steps = [];
let tallyOk = true;
const seen = new Map();

for (const [id, cat] of [
  ["wf-all", "all"],
  ["wf-prod", "prod"],
  ["wf-oss", "oss"],
  ["wf-client", "client"],
  ["wf-exp", "exp"],
]) {
  await page.click(`label[for="${id}"]`);
  await page.waitForTimeout(150);
  const t = await tallyState();
  const img = await shot();
  steps.push(`${cat}:${t.visible}(${t.filter})`);
  if (t.visible !== expectedByCat[cat]) tallyOk = false;
  seen.set(cat, { count: t.visible, img });
}

// Distinct counts must render distinct pixels; equal counts must render equal
// pixels. Both directions, so a frozen numeral cannot pass.
for (const [a, va] of seen) {
  for (const [b, vb] of seen) {
    if (a === b) continue;
    const sameCount = va.count === vb.count;
    const samePixels = va.img === vb.img;
    if (sameCount !== samePixels) {
      tallyOk = false;
      steps.push(`MISMATCH ${a}(${va.count}) vs ${b}(${vb.count}): pixels ${samePixels ? "same" : "differ"}`);
    }
  }
}
await page.click('label[for="wf-all"]');
report(
  "Filter mechanism recounts (rendered CSS counter tracks displayed cards)",
  tallyOk,
  `${steps.join(" ")} · expected ${JSON.stringify(expectedByCat)}`,
);

// Counts must never animate.
const noAnim = await page.evaluate(() =>
  [".slot__val", ".readout .v", ".tally .n"].every((sel) =>
    [...document.querySelectorAll(sel)].every((el) => {
      const s = getComputedStyle(el);
      return s.animationName === "none" && s.transitionDuration === "0s";
    }),
  ),
);
report("Counts never animate", noAnim);

// Reset the filter and scroll back to the top so the evidence shows the page
// as a visitor first meets it, not the state the tally test left behind.
await page.click('label[for="wf-all"]');
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: join(OUT, "home-1440-hero.png") });
await page.screenshot({ path: join(OUT, "home-1440-full.png"), fullPage: true });

// No horizontal overflow at desktop.
const overflow1440 = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
report("No horizontal overflow at 1440", overflow1440 <= 0, `${overflow1440}px`);

/* ---------------------------------------------------------- inner surfaces */

for (const [path, file] of [
  ["/work-with-me", "work-with-me-1440.png"],
  ["/work-with-me/get-found", "offer-get-found-1440.png"],
  ["/work-with-me/build-a-system", "offer-build-a-system-1440.png"],
  ["/links", "links-1440.png"],
  ["/work", "work-1440.png"],
  ["/work/plimsoll", "work-plimsoll-1440.png"],
  ["/theories", "theories-1440.png"],
  ["/theories/latent-emotions", "theory-latent-emotions-1440.png"],
  ["/about", "about-1440.png"],
  ["/contact", "contact-1440.png"],
  ["/now", "now-1440.png"],
  ["/lab", "lab-1440.png"],
  ["/learn", "learn-1440.png"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(OUT, file), fullPage: true });
}

// PENDING-MARK PLACEMENT (wave 3). The gaps must still be VISIBLE — the
// original assertion — and they must now be visible in the right voice on the
// right page. A buyer page shows the absence in the third person; a builder
// page keeps the owner-facing question; /now carries the whole register.
await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
const aboutPending = await page.evaluate(() => ({
  secondPerson: document.querySelectorAll("mark.pending").length,
  notes: [...document.querySelectorAll(".pending-note")].map(
    (n) => getComputedStyle(n).display,
  ),
}));
report(
  "Buyer page /about: absences stated in the third person, and visible",
  aboutPending.secondPerson === 0 &&
    aboutPending.notes.length > 0 &&
    aboutPending.notes.every((d) => d !== "none"),
  `${aboutPending.secondPerson} owner-facing marks · ${aboutPending.notes.length} third-person notes`,
);

await page.goto(`${BASE}/theories/architect-loop`, { waitUntil: "networkidle" });
const builderPending = await page.evaluate(() =>
  [...document.querySelectorAll("mark.pending")].map((m) => getComputedStyle(m).display),
);
report(
  "Builder page keeps its inline questions, rendered visibly",
  builderPending.length > 0 && builderPending.every((d) => d !== "none"),
  `${builderPending.length} marks on /theories/architect-loop`,
);

await page.goto(`${BASE}/now`, { waitUntil: "networkidle" });
const openItems = await page.evaluate(() => {
  const block = document.querySelector("#open-items");
  return {
    present: Boolean(block),
    count: document.querySelectorAll(".open-items__q").length,
    visible: block ? getComputedStyle(block).display !== "none" : false,
  };
});
report(
  "/now carries the consolidated Open items register",
  openItems.present && openItems.visible && openItems.count > 0,
  `${openItems.count} open items listed`,
);
await page.screenshot({ path: join(OUT, "now-open-items-1440.png"), fullPage: true });

// The homepage door row: three doors, each a real link, each naming a visitor.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const doors = await page.evaluate(() =>
  [...document.querySelectorAll(".doors .door")].map((d) => ({
    href: d.getAttribute("href"),
    label: d.querySelector(".door__label")?.textContent?.trim(),
    who: d.querySelector(".door__who")?.textContent?.trim(),
  })),
);
report(
  "Homepage sorts visitors: three doors, each a link that names who it is for",
  doors.length === 3 && doors.every((d) => d.href && d.label && d.who),
  doors.map((d) => `${d.label} → ${d.href}`).join(" · "),
);
await page.screenshot({ path: join(OUT, "home-1440-doors.png") });

// The work cards' repository link — one click from home to the source.
const cardRepos = await page.evaluate(() =>
  [...document.querySelectorAll(".work .card__repo a")].map((a) => ({
    href: a.getAttribute("href"),
    text: a.textContent.replace(/\s+/g, " ").trim(),
  })),
);
report(
  "Work cards link straight to the repository, with the star count beside it",
  cardRepos.length > 0 &&
    cardRepos.every((r) => r.href?.startsWith("https://github.com/") && /star/i.test(r.text)),
  cardRepos.map((r) => r.text).join(" | "),
);

/* ------------------------------------ THE DATED ARCHIVES, ON THE SYSTEM ---
   Wave 4. /primer, /manuscript, /workshop and /watch kept their URLs and moved
   onto Direction B. The pixel-parity-against-main gate that used to live here
   is retired — the reasoning is at the top of this file — and these are the
   checks that replace it, the same ones every other Direction B route answers
   to. They are ASSERTIONS, not screenshots: a screenshot proves a page
   rendered, not that it rendered correctly. */

const archiveFailures = [];
const archiveDetail = [];
for (const route of ARCHIVE_ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const state = await page.evaluate(() => {
    const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName[1]),
    );
    let skips = 0;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) skips++;
    }
    const badge = document.querySelector(".archive .badge-archived");
    return {
      overflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1s: levels.filter((l) => l === 1).length,
      skips,
      // The band, and a REAL date in it. "Archived" with nothing after it is
      // the failure this asserts against, not the absence of the element.
      badge: badge?.textContent?.trim() ?? "",
      // The chrome the reskin exists to deliver: one nav, one console rail,
      // one footer, the grain, and the Ask dock. A route that renders on
      // Direction B but mounts none of it is the old defect in a new palette.
      chrome: Boolean(
        document.querySelector(".b-room") &&
          document.querySelector(".rail") &&
          document.querySelector(".nav .mark") &&
          document.querySelector(".b-foot") &&
          document.querySelector(".dock"),
      ),
      // No colour from the retired palette survives anywhere on the page.
      gold: [...document.querySelectorAll("*")].some((el) => {
        const s = getComputedStyle(el);
        return `${s.color}${s.backgroundColor}${s.borderTopColor}`.includes(
          "212, 168, 83",
        );
      }),
    };
  });

  const problems = [];
  if (state.overflow > 0) problems.push(`${state.overflow}px of horizontal overflow`);
  if (state.h1s !== 1) problems.push(`${state.h1s} h1 elements, expected exactly 1`);
  if (state.skips > 0) problems.push(`${state.skips} skipped heading level(s)`);
  if (!/^Archived \d{4}-\d{2}-\d{2}$/.test(state.badge))
    problems.push(`archive band reads "${state.badge}", expected a dated badge`);
  if (!state.chrome) problems.push("Direction B chrome is not mounted");
  if (state.gold) problems.push("a retired-palette colour is still painted");

  if (problems.length) archiveFailures.push(`${route}: ${problems.join("; ")}`);
  else archiveDetail.push(`${route}:${state.badge.toLowerCase().replace(" ", "=")}`);

  await page.screenshot({
    path: join(OUT, `${route.slice(1)}-1440.png`),
    fullPage: true,
  });
}
report(
  `Dated archives on the design system (${ARCHIVE_ROUTES.length} routes: no overflow, one h1, no level skip, dated band, chrome mounted)`,
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
await mpage.waitForTimeout(600);
const overflow375 = await mpage.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
report("No horizontal overflow at 375", overflow375 <= 0, `${overflow375}px`);

// The dock must never overlap the page's own content at any width.
const dockClear = await mpage.evaluate(() => {
  const dock = document.querySelector(".dock").getBoundingClientRect();
  const foot = document.querySelector(".b-foot");
  const reserve = parseFloat(getComputedStyle(foot).paddingBottom);
  const tally = document.querySelector(".tally")?.getBoundingClientRect();
  return { dockH: dock.height, reserve, tallyExists: Boolean(tally) };
});
report(
  "Footer reserves the dock's clear space (96px)",
  dockClear.reserve >= 96,
  `padding-bottom ${dockClear.reserve}px vs dock ${dockClear.dockH}px`,
);
await mpage.screenshot({ path: join(OUT, "home-375-hero.png") });
await mpage.screenshot({ path: join(OUT, "home-375-full.png"), fullPage: true });

// The wave-3 surfaces at 375, and the overflow assertion on each of them. A
// three-across door row and a two-across offer grid are exactly the shapes
// that break a phone, so they are measured rather than eyeballed.
const narrowOverflow = [];
for (const [path, file] of [
  ["/work-with-me", "work-with-me-375.png"],
  ["/work-with-me/get-found", "offer-get-found-375.png"],
  ["/work-with-me/build-a-system", "offer-build-a-system-375.png"],
  ["/links", "links-375.png"],
  ["/now", "now-375.png"],
]) {
  await mpage.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(300);
  const over = await mpage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (over > 0) narrowOverflow.push(`${path}: ${over}px`);
  await mpage.screenshot({ path: join(OUT, file), fullPage: true });
}
report(
  "No horizontal overflow at 375 on the wave-3 routes",
  narrowOverflow.length === 0,
  narrowOverflow.length ? narrowOverflow.join(" | ") : "5 routes measured",
);

// The dated archives at 375. These four are the pages most likely to break a
// phone, because their content is not a card grid: a command line, a JSON
// config block, a 16:9 video and an install string are all fixed-width things
// inside a 375px column. Each of them has to scroll inside its own box rather
// than widen the document, so the measurement is the gate.
const archiveNarrow = [];
for (const route of ARCHIVE_ROUTES) {
  await mpage.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(300);
  const over = await mpage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
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

/* ------------------------------------------- reduced motion + no-JS fallback */

const rm = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rmPage = await rm.newPage();
await rmPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await rmPage.waitForTimeout(1200);
const rmState = await rmPage.evaluate(() => {
  const mf = document.querySelector(".mf");
  return {
    live: mf.classList.contains("is-live"),
    svgVisible: getComputedStyle(mf.querySelector("svg")).display !== "none",
    mfAnimation: getComputedStyle(mf).animationName,
  };
});
report(
  "Reduced motion: static SVG only, canvas stands down",
  !rmState.live && rmState.svgVisible && rmState.mfAnimation === "none",
  `is-live=${rmState.live} svg=${rmState.svgVisible} animation=${rmState.mfAnimation}`,
);
await rmPage.screenshot({ path: join(OUT, "home-1440-reduced-motion.png") });

const nojs = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  javaScriptEnabled: false,
});
const njPage = await nojs.newPage();
await njPage.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
const njState = await njPage.evaluate?.(() => null).catch(() => null);
void njState;
const njHtml = await njPage.content();
report(
  "No JS: static SVG manifold is in the server response",
  njHtml.includes('class="mf"') && njHtml.includes("<polyline") && !njHtml.includes("is-live"),
  `${(njHtml.match(/<polyline/g) ?? []).length} polylines server-rendered`,
);
report(
  "No JS: full theory text is in the server response",
  (await (await fetch(`${BASE}/theories/universal-question-geometry`)).text()).includes(
    "Universal Question Geometry starts from a different claim",
  ),
);
await njPage.screenshot({ path: join(OUT, "home-1440-no-js.png") });

await browser.close();

console.log("─".repeat(72));
console.log(failed ? `${failed} visual check(s) FAILED` : "all visual checks passed");
console.log(
  `screenshots → ${UPDATE_EVIDENCE ? `docs/evidence/${EVIDENCE_WAVE}/ (tracked evidence REFRESHED)` : "out/verify-visual/ (untracked; pass --update-evidence to refresh the committed set)"}`,
);
process.exit(failed ? 1 : 0);
