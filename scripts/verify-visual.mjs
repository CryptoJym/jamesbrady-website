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
// LEGACY PARITY (independent review, P1-2). --legacy-base <url> points at a
// second server running a build of `main`; the two /primer renders are then
// pixel-diffed and any difference fails. Without it the legacy check degrades
// to "still renders", and says so rather than implying parity it did not test.

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

const arg = (flag) =>
  process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : null;

const BASE = arg("--base") ?? "http://localhost:4123";
/** A server running a build of `main`, for the legacy pixel-diff. */
const LEGACY_BASE = arg("--legacy-base");
const UPDATE_EVIDENCE = process.argv.includes("--update-evidence");
/** Which packet --update-evidence writes into. Defaults to the wave-1 set. */
const EVIDENCE_WAVE = arg("--wave") ?? "wave-1";
const OUT = UPDATE_EVIDENCE
  ? join(process.cwd(), "docs", "evidence", EVIDENCE_WAVE)
  : join(process.cwd(), "out", "verify-visual");
mkdirSync(OUT, { recursive: true });

/**
 * The archived routes, which must render exactly as they do on main.
 *
 * /links left this list in wave 3: it was reskinned onto Direction B at the
 * same URL, so a pixel diff against main is now guaranteed to differ and
 * proves nothing. The other four are untouched and stay at zero.
 */
const LEGACY_ROUTES = ["/primer", "/manuscript", "/workshop", "/watch"];

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
  ["/work-with-me/background-screening", "offer-background-screening-1440.png"],
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

// The homepage door row: four doors from wave 3b, each a real link, each
// naming a visitor. The count is asserted rather than described, because the
// row's whole job is that a reader sees every way in; a door that silently
// stopped rendering would leave the page looking finished.
//
// The row must also BE a row: four cells on one line at 1440. A door that
// wrapped onto a second line under a three-across rule would still pass a
// count check and would look like a mistake.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const doors = await page.evaluate(() =>
  [...document.querySelectorAll(".doors .door")].map((d) => ({
    href: d.getAttribute("href"),
    label: d.querySelector(".door__label")?.textContent?.trim(),
    who: d.querySelector(".door__who")?.textContent?.trim(),
    top: Math.round(d.getBoundingClientRect().top),
  })),
);
report(
  "Homepage sorts visitors: four doors, each a link that names who it is for",
  doors.length === 4 && doors.every((d) => d.href && d.label && d.who),
  doors.map((d) => `${d.label} → ${d.href}`).join(" · "),
);
const doorRows1440 = new Set(doors.map((d) => d.top)).size;
report(
  "Door row is one row at 1440",
  doorRows1440 === 1,
  `${doors.length} doors across ${doorRows1440} row(s)`,
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

/* ------------------------------------------- LEGACY PARITY AGAINST main --- */
//
// The gate the review asked for. A shared tailwind.config.js, a shared
// globals.css and a shared root layout mean a Direction B change can re-render
// five pages nobody touched: a `spacing` key moved p-8 from 32px to 64px, a
// `body{font-size:15px}` rule re-typeset all five, and the grain overlay and
// the Ask dock painted on pages that never had them. None of that showed up in
// a "still renders" assertion, which is why this one compares PIXELS.

if (LEGACY_BASE) {
  // Both sides are captured the SAME way, and the way removes TIME from the
  // comparison. The legacy skin's reveal animations run 800ms with staggered
  // delays, so two screenshots of the same page taken at different moments
  // differ by thousands of pixels for no reason at all — measured at 7,237 px
  // between two identical renders. So: settle past the longest reveal, then
  // freeze animations and transitions at whatever state they reached.
  //
  // Do NOT scroll here. Scrolling fires the IntersectionObserver that gates
  // the below-the-fold reveals, and whether it has fired by screenshot time is
  // a race — measured at 1,391,008 px of pure noise. A fullPage capture goes
  // through CDP captureBeyondViewport, which does not fire the observer, so
  // leaving the page at the top makes both sides deterministic.
  const FREEZE = `*,*::before,*::after{
    animation-duration:0s !important; animation-delay:0s !important;
    transition-duration:0s !important; transition-delay:0s !important;
  }`;
  const parityShot = async (base, route) => {
    const p = await desktop.newPage();
    await p.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(2000);
    await p.addStyleTag({ content: FREEZE });
    const buf = await p.screenshot({ fullPage: true });
    await p.close();
    return buf;
  };

  // All FIVE archived routes, not just /primer. They share one layout, one
  // stylesheet and one tailwind config, so a leak reaches all of them — and a
  // gate that watches one page while four go unwatched invites the next fix to
  // land on the page nobody is looking at.
  const parityFailures = [];
  const parityDetail = [];
  for (const route of LEGACY_ROUTES) {
    const branchShot = await parityShot(BASE, route);
    const mainShot = await parityShot(LEGACY_BASE, route);
    if (route === "/primer") {
      // Keep the pair on disk for the one route the evidence packet names.
      const { writeFileSync } = await import("node:fs");
      writeFileSync(join(OUT, "primer-main-1440.png"), mainShot);
    }

  const diff = await page.evaluate(
    async ([a, b]) => {
      const load = (b64) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = `data:image/png;base64,${b64}`;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      if (ia.width !== ib.width || ia.height !== ib.height) {
        return { sizeMismatch: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`, changed: -1, total: 0 };
      }
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
        if (
          Math.abs(da[i] - db[i]) +
            Math.abs(da[i + 1] - db[i + 1]) +
            Math.abs(da[i + 2] - db[i + 2]) >
          12
        )
          n++;
      }
      return { changed: n, total: da.length / 4 };
    },
    [branchShot.toString("base64"), mainShot.toString("base64")],
  );

    if (diff.sizeMismatch) {
      parityFailures.push(
        `${route}: page HEIGHT changed, ${diff.sizeMismatch} — a spacing or type token leaked into the archived skin`,
      );
    } else if (diff.changed !== 0) {
      // Zero, not "close enough". These pages were explicitly out of scope, so
      // any changed pixel is an unintended render change.
      parityFailures.push(
        `${route}: ${diff.changed} of ${diff.total} px differ (${((diff.changed / diff.total) * 100).toFixed(4)}%)`,
      );
    } else {
      parityDetail.push(`${route}:0/${diff.total}`);
    }
  }
  report(
    `Legacy routes are pixel-identical to main (${LEGACY_ROUTES.length} routes)`,
    parityFailures.length === 0,
    parityFailures.length ? parityFailures.join(" | ") : `${parityDetail.join(" · ")} vs ${LEGACY_BASE}`,
  );
} else {
  report(
    "Legacy routes are pixel-identical to main",
    false,
    "NOT RUN — pass --legacy-base <url> pointing at a server running a build of " +
      "main. A legacy check that does not compare against main is not a parity check.",
  );
}

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
// four-across door row and a three-across offer grid are exactly the shapes
// that break a phone, so they are measured rather than eyeballed.
const narrowOverflow = [];
const NARROW_ROUTES = [
  ["/work-with-me", "work-with-me-375.png"],
  ["/work-with-me/get-found", "offer-get-found-375.png"],
  ["/work-with-me/build-a-system", "offer-build-a-system-375.png"],
  ["/work-with-me/background-screening", "offer-background-screening-375.png"],
  ["/links", "links-375.png"],
  ["/now", "now-375.png"],
];
for (const [path, file] of NARROW_ROUTES) {
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
  narrowOverflow.length
    ? narrowOverflow.join(" | ")
    : `${NARROW_ROUTES.length} routes measured`,
);

// The door row at 375: four doors in two rows of two, and every door still
// wide enough to be a tap target rather than a sliver. Two rows is the claim
// the CSS makes, so it is the claim that gets measured.
await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mpage.waitForTimeout(300);
const doors375 = await mpage.evaluate(() =>
  [...document.querySelectorAll(".doors .door")].map((d) => {
    const r = d.getBoundingClientRect();
    return { top: Math.round(r.top), width: Math.round(r.width) };
  }),
);
const rows375 = new Set(doors375.map((d) => d.top)).size;
const narrowest = Math.min(...doors375.map((d) => d.width));
report(
  "Door row is two by two at 375, and no door is narrower than 140px",
  doors375.length === 4 && rows375 === 2 && narrowest >= 140,
  `${doors375.length} doors · ${rows375} rows · narrowest ${narrowest}px`,
);
await mpage.screenshot({ path: join(OUT, "home-375-doors.png") });

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
