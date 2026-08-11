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
// archived volumes still render. Screenshots land in docs/evidence/wave-1/.

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

const BASE = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "http://localhost:4123";
const OUT = join(process.cwd(), "docs", "evidence", "wave-1");
mkdirSync(OUT, { recursive: true });

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

// The pending-from-James marks must be visible, not hidden.
await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
const pending = await page.evaluate(() =>
  [...document.querySelectorAll("mark.pending")].map((m) => getComputedStyle(m).display),
);
report(
  "Pending-from-James gaps render visibly",
  pending.length > 0 && pending.every((d) => d !== "none"),
  `${pending.length} marks on /about`,
);

/* ----------------------------------------------------------- legacy render */

await page.goto(`${BASE}/primer`, { waitUntil: "networkidle" });
const primer = await page.evaluate(() => ({
  h1: document.querySelector("h1")?.textContent?.trim() ?? "",
  height: document.body.scrollHeight,
  nav: Boolean(document.querySelector("nav")),
}));
report(
  "Legacy /primer still renders",
  primer.h1.length > 0 && primer.height > 2000 && primer.nav,
  `h1 "${primer.h1.slice(0, 40)}" · ${primer.height}px tall`,
);
await page.screenshot({ path: join(OUT, "primer-legacy-1440.png"), fullPage: true });

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
console.log(`screenshots → docs/evidence/wave-1/`);
process.exit(failed ? 1 : 0);
