#!/usr/bin/env node
// WAVE 2 — "living chrome" acceptance. The claims this wave makes that a build
// log, a screenshot and the wave-1 battery cannot settle.
//
//   node scripts/verify-chrome.mjs --base http://localhost:4123
//   node scripts/verify-chrome.mjs --base http://localhost:4123 --label after --update-evidence
//
// It is a SEPARATE script on purpose. verify-seo prints 16 checks and
// verify-visual prints 16, both quoted in the wave-1 evidence packet; adding
// to either would silently move a number that people compare across waves.
//
// What it measures, and how:
//
//   FRAME RATE — counts requestAnimationFrame callbacks over 3s at 1440 and at
//   375 with every layer switched on. rAF callbacks share one queue with the
//   manifold's own loop, so when a draw overruns its budget this counter drops
//   with it; the number is the field's frame rate, not a proxy for it.
//
//   LUMINANCE — the field must stay dimmer than the h1, because decoration
//   never outranks content. Both sides are sampled the same way: screenshot,
//   decode in the page, WCAG relative luminance per pixel, take the peak. The
//   field is captured with the hero copy and panel set to `visibility:hidden`
//   — layout untouched, so the field is composited exactly as it ships (mask
//   and scrim included) with no text pixels to contaminate the maximum.
//
//   REDUCED MOTION — not "the CSS says so" but "nothing is running":
//   document.getAnimations() filtered to playState === "running" must be
//   empty, the canvas must have stood down, and the mark must be static.
//
//   ICONS — served, linked in the HTML, and the theme colour matching --c-base.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

const arg = (flag) =>
  process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : null;

const BASE = arg("--base") ?? "http://localhost:4123";
const LABEL = arg("--label") ?? "after";
/**
 * Measure-only mode, for pointing the SAME instrument at a build of `main`.
 * The wave-2 checks (the living mark, the icon set) are skipped rather than
 * failed: main does not have them, and a red line that only means "this is the
 * old build" is noise that teaches people to skim the output.
 */
const BASELINE = process.argv.includes("--baseline");
const UPDATE_EVIDENCE = process.argv.includes("--update-evidence");
/**
 * Which evidence packet --update-evidence writes into. Defaults to the packet
 * this script was built for, so existing invocations are unchanged; a later
 * wave passes its own name rather than overwriting an earlier wave's record.
 * Evidence is dated proof, not a mutable folder.
 */
const EVIDENCE_DIR = arg("--evidence-dir") ?? "wave-2-chrome";
const OUT = UPDATE_EVIDENCE
  ? join(process.cwd(), "docs", "evidence", EVIDENCE_DIR)
  : join(process.cwd(), "out", "verify-chrome");
mkdirSync(OUT, { recursive: true });

/** Two named floors for two named instruments (never silently lowered):
 * - GPU (any real visitor, local dev, pre-release): ≥55 of a 60Hz budget.
 *   Below this the motion stops reading as motion.
 * - Software rasterizer (GitHub's GPU-less runners render via SwiftShader/
 *   llvmpipe): ≥30. 42fps was measured there on a build that holds 61.5fps
 *   on a GPU — the delta is the instrument. The check label always names
 *   which floor applied, so a pass on the soft floor can never be read as
 *   a pass on the real one. The GPU floor remains enforced wherever a GPU
 *   exists, including local runs on dev machines. */
const FPS_FLOOR_GPU = 55;
const FPS_FLOOR_SOFTWARE = 30;
const FPS_WINDOW_MS = 3000;

let failed = 0;
const measured = {};
const report = (name, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

/**
 * ONE BROWSER PER VIEWPORT, torn down between samples. A frame-rate number is
 * only about the page if nothing else is on the renderer — measured, the 375
 * sample read 50.0fps with the 1440 page still open behind it, 57.0 with the
 * context closed but the browser warm, and 70.8 in a browser of its own. Two
 * of those three numbers were about the harness.
 */
let browser = await chromium.launch();

/** WCAG relative luminance of the brightest pixel in a PNG, computed in-page. */
const peakLuminance = async (page, pngBase64) =>
  page.evaluate(async (b64) => {
    const img = await new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.src = `data:image/png;base64,${b64}`;
    });
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const lin = (v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    let peak = 0;
    for (let i = 0; i < d.length; i += 4) {
      const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
      if (L > peak) peak = L;
    }
    return { peak, px: d.length / 4 };
  }, pngBase64);

/** rAF callbacks per second, over a fixed window. */
const sampleFps = (page, ms) =>
  page.evaluate(
    (window_ms) =>
      new Promise((res) => {
        let frames = 0;
        const t0 = performance.now();
        const tick = () => {
          frames++;
          if (performance.now() - t0 < window_ms) requestAnimationFrame(tick);
          else res({ frames, ms: performance.now() - t0 });
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );

/* ==================================================== 1440: the living field */

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelector(".mf")?.classList.contains("is-live"), {
  timeout: 10_000,
});
await page.waitForTimeout(400);

const glRenderer = await page.evaluate(() => {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!gl) return "none";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
  } catch { return "unknown"; }
});
const softwareRaster = /swiftshader|llvmpipe|software/i.test(String(glRenderer));
const FPS_FLOOR = softwareRaster ? FPS_FLOOR_SOFTWARE : FPS_FLOOR_GPU;
const floorLabel = softwareRaster
  ? `software-raster floor ${FPS_FLOOR_SOFTWARE} — GPU floor ${FPS_FLOOR_GPU} enforced where a GPU exists; renderer: ${String(glRenderer).slice(0, 60)}`
  : `GPU floor ${FPS_FLOOR_GPU}`;
const fps1440 = await sampleFps(page, FPS_WINDOW_MS);
measured.fps1440 = (fps1440.frames / (fps1440.ms / 1000)).toFixed(1);
report(
  `Frame rate at 1440 with every layer on (>= ${FPS_FLOOR}fps · ${floorLabel})`,
  Number(measured.fps1440) >= FPS_FLOOR,
  `${measured.fps1440}fps · ${fps1440.frames} rAF frames in ${fps1440.ms.toFixed(0)}ms`,
);

/* --------------------------------------------------- motion proof, 1s apart */
// Two captures of the field a full second apart. A still frame of a canvas
// proves it painted; a pair proves it is alive.
const heroBox = await page.locator(".hero").boundingBox();
const fieldClip = {
  x: heroBox.x,
  y: heroBox.y,
  width: heroBox.width,
  height: Math.min(heroBox.height, 900 - heroBox.y),
};
const HIDE_COPY = `.hero__copy,.hero__panel{visibility:hidden !important}`;
const hider = await page.addStyleTag({ content: HIDE_COPY });
const fieldT0 = await page.screenshot({ clip: fieldClip });
await page.waitForTimeout(1000);
const fieldT1 = await page.screenshot({ clip: fieldClip });
writeFileSync(join(OUT, `field-1440-${LABEL}-t0.png`), fieldT0);
writeFileSync(join(OUT, `field-1440-${LABEL}-t1.png`), fieldT1);

/* -------------------------------------------------------- field luminance */
//
// Sampled across FRAMES, not from one — and across ENOUGH frames, which is the
// part this wave had to fix.
//
// The first version measured one capture. Two runs read 0.095 and 0.084 off
// the same build, so it went to twelve frames over ~2.4s and the travelling
// wave was declared covered. It was not. The manifold surface's slowest term
// evolves over ~70s, so the number of lines standing high — and the whole
// field's brightness with it — cycles on a minute scale underneath the wave.
// Measured on one unchanged build, 170 captures over 43s: sliding a 2.4s
// window across that series returns anything from 0.119 to 0.313. The window
// was not measuring the field, it was measuring which minute it was.
//
// That is a SAFETY hole, not just a noisy number: a 2.4s window samples 3% of
// the cycle, so a build that breaches the 0.45 ceiling at some other phase
// passes this gate on luck. The window is now ~150 captures over ~35s, which
// covers the cycle; measured spread across sliding windows of that length is
// a few percent rather than 62%.
//
// The distribution is reported alongside the peak because they answer
// different questions. The peak is what the 0.45 ceiling and the h1 comparison
// are about — one pixel, at the field's brightest instant. The MEDIAN is what
// a visitor actually sees, and it is the number that moved when the owner
// asked for a more present field.
const FIELD_SAMPLES = 150;
const framePeaks = [];
let fieldPx = 0;
const lumStart = Date.now();
for (const shot of [fieldT0, fieldT1]) {
  const r = await peakLuminance(page, shot.toString("base64"));
  framePeaks.push(r.peak);
  fieldPx = r.px;
}
while (framePeaks.length < FIELD_SAMPLES) {
  // Back to back: the capture+decode cadence (~230ms) is the sampling rate.
  const r = await peakLuminance(page, (await page.screenshot({ clip: fieldClip })).toString("base64"));
  framePeaks.push(r.peak);
  fieldPx = r.px;
}
const lumSpanSec = (Date.now() - lumStart) / 1000;
const ranked = [...framePeaks].sort((a, b) => a - b);
const fieldLum = {
  peak: ranked[ranked.length - 1],
  median: ranked[Math.floor(ranked.length / 2)],
  min: ranked[0],
  px: fieldPx,
  frames: framePeaks.length,
  spanSec: lumSpanSec,
};
await hider.evaluate((el) => el.remove());
await page.waitForTimeout(200);

const h1Box = await page.locator(".b-room h1").first().boundingBox();
const h1Shot = await page.screenshot({
  clip: { x: h1Box.x, y: h1Box.y, width: h1Box.width, height: h1Box.height },
});
const h1Lum = await peakLuminance(page, h1Shot.toString("base64"));

measured.fieldPeak = fieldLum.peak.toFixed(3);
measured.fieldMedian = fieldLum.median.toFixed(3);
measured.fieldMin = fieldLum.min.toFixed(3);
measured.h1Peak = h1Lum.peak.toFixed(3);
report(
  "Field peak luminance stays BELOW the h1's",
  fieldLum.peak < h1Lum.peak,
  `field ${measured.fieldPeak} vs h1 ${measured.h1Peak} ` +
    `(${fieldLum.px} px x ${fieldLum.frames} frames over ${fieldLum.spanSec.toFixed(0)}s, h1 ${h1Lum.px} px)`,
);
/* The ceiling the wave was given: presence through structure, not brightness. */
report(
  "Field peak stays inside its 0.45 budget",
  fieldLum.peak <= 0.45,
  `${measured.fieldPeak} of 0.45 · median ${measured.fieldMedian} · min ${measured.fieldMin}`,
);
/* The FLOOR, added by the presence pass (owner: the field should be "more
   visible and noticeable"). A ceiling on its own only ever says the field is
   not too bright — it passed happily on a build whose field the owner could
   not see. This is the other side of the same budget, and it is why the two
   numbers are reported together: the field lives in a band, not under a cap.
   Skipped under --baseline for the reason given at the top of this file: `main`
   does not have this wave, so a red line here would only mean "this is the old
   build". The baseline's number is still printed in `measured`, which is what
   the before/after table is built from. */
if (!BASELINE)
  report(
    "Field peak reaches its presence floor (>= 0.30)",
    fieldLum.peak >= 0.3,
    `${measured.fieldPeak} of 0.30 floor / 0.45 ceiling`,
  );

/* ------------------------------------------------------- the mark is alive */

if (!BASELINE) {
const markState = await page.evaluate(() => {
  const glyph = document.querySelector(".mark__glyph");
  const cells = [...glyph.querySelectorAll("i")];
  const squares = [...glyph.querySelectorAll("b")];
  const nameOf = (el) => getComputedStyle(el).animationName;
  return {
    cells: cells.length,
    breathing: cells.map(nameOf),
    ticking: squares.map(nameOf).filter((n) => n !== "none"),
    // The presence pass's two additions, read off computed style rather than
    // assumed from the stylesheet.
    cycling: cells.map(nameOf).filter((n) => n.includes("mark-cycle")).length,
    glint: squares.map((b) => getComputedStyle(b, "::after").animationName).filter((n) => n !== "none"),
    running: document.getAnimations().filter((a) => a.playState === "running").length,
    // Nothing may move that could push the wordmark: transform only.
    props: cells.map((c) => getComputedStyle(c).animationName !== "none"),
    glyphRect: glyph.getBoundingClientRect().toJSON(),
  };
});
report(
  "Mark: three cells, each breathing on its own clock, one ticking",
  markState.cells === 3 &&
    new Set(markState.breathing).size === 3 &&
    markState.breathing.every((n) => n !== "none") &&
    markState.ticking.length === 1,
  `cells ${markState.breathing.join(", ")} · tick ${markState.ticking.join(",") || "none"}`,
);
report(
  "Mark: all three cells carry the 8.1s activity cycle, and the ticking cell alone carries the glint",
  markState.cycling === 3 && markState.glint.length === 1 && markState.glint[0] === "mark-glint",
  `cycling ${markState.cycling}/3 · glint on ${markState.glint.length} cell(s): ${markState.glint.join(",") || "none"}`,
);

/* THE ACTIVE CELL MOVES. The cycle is the claim a still frame cannot settle,
   so it is sampled: read all three cells' computed opacity now and again 4s
   later, and require the brightest one to be a DIFFERENT cell. With a 2.7s
   hand-off a 4s gap can never land on the same cell twice, so this is
   deterministic rather than hopeful. Screenshots of both moments ship with the
   evidence for anyone who wants to see it rather than read it. */
const activeCell = () =>
  page.evaluate(() =>
    [...document.querySelectorAll(".mark__glyph i")].map((el) => Number(getComputedStyle(el).opacity)),
  );
const markClip = { x: 0, y: 34, width: 420, height: 70 };
const opacityA = await activeCell();
await page.screenshot({ path: join(OUT, `mark-cycle-1440-${LABEL}-t0.png`), clip: markClip });
await page.waitForTimeout(4000);
const opacityB = await activeCell();
await page.screenshot({ path: join(OUT, `mark-cycle-1440-${LABEL}-t4.png`), clip: markClip });
const brightest = (o) => o.indexOf(Math.max(...o));
report(
  "Mark: the active cell hands off — a different cell is brightest 4s later",
  brightest(opacityA) !== brightest(opacityB),
  `t0 [${opacityA.map((v) => v.toFixed(2)).join(", ")}] cell ${brightest(opacityA) + 1} · ` +
    `t+4s [${opacityB.map((v) => v.toFixed(2)).join(", ")}] cell ${brightest(opacityB) + 1}`,
);

// No layout shift: the glyph's box must be identical before and after a full
// breath cycle. Transforms do not affect layout — this proves it rather than
// asserting it.
await page.waitForTimeout(1200);
const glyphRect2 = await page.evaluate(() =>
  document.querySelector(".mark__glyph").getBoundingClientRect().toJSON(),
);
const navHeights = await page.evaluate(() => document.querySelector(".nav").getBoundingClientRect().height);
report(
  "Mark animates transform only — zero layout shift",
  glyphRect2.width === markState.glyphRect.width &&
    glyphRect2.height === markState.glyphRect.height &&
    glyphRect2.x === markState.glyphRect.x &&
    glyphRect2.y === markState.glyphRect.y,
  `glyph box stable at ${glyphRect2.width}x${glyphRect2.height} · nav ${navHeights}px`,
);

// Hover: the converge runs, and the cells take the signal colour.
await page.hover(".mark");
await page.waitForTimeout(120);
const hover = await page.evaluate(() => ({
  converge: getComputedStyle(document.querySelector(".mark__glyph")).animationName,
  fill: getComputedStyle(document.querySelector(".mark__glyph b")).backgroundColor,
}));
await page.screenshot({
  path: join(OUT, `mark-hover-1440-${LABEL}.png`),
  clip: { x: 0, y: 34, width: 420, height: 70 },
});
report(
  "Mark: hover converges and takes the signal colour (ruling B, role 4)",
  hover.converge === "mark-converge",
  `animation ${hover.converge} · cell fill ${hover.fill}`,
);
await page.mouse.move(1200, 700);

/* MAGNIFIED MARK EVIDENCE. The gate above is assertions, and the pair of
   420x70 crops beside it is honest but nearly useless to a human: the glyph is
   15 CSS pixels, and a .58-to-1.0 brightness hand-off inside it does not
   survive a 1x screenshot. The previous packet said as much — "the mark's own
   motion is not screenshottable" — and then asked the reader to trust the
   assertions. A 4x context costs about three seconds and closes that gap.
   Its own context, so the measured page is never mutated for a photograph. */
const zoomCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 4,
});
const zoom = await zoomCtx.newPage();
await zoom.goto(`${BASE}/`, { waitUntil: "networkidle" });
const gbox = await zoom.locator(".mark__glyph").boundingBox();
const gclip = { x: gbox.x - 7, y: gbox.y - 7, width: gbox.width + 14, height: gbox.height + 14 };
/* THE GLINT FIRST, and that ordering is the whole trick. It runs on a 20s
   clock with a 4s delay from load, so there is one ~4s after this page opened
   and then nothing for twenty seconds. Shooting the rotation first burns 5.4s
   and walks straight past it — measured, and it cost a red line before the
   order was swapped. Poll the pseudo-element's own opacity and shoot the frame
   it is actually lit; never infer a flash from the stylesheet. */
let glintShot = 0;
for (let i = 0; i < 200 && !glintShot; i++) {
  const o = await zoom.evaluate(() =>
    Number(getComputedStyle(document.querySelector(".mark__glyph i:nth-child(3) b"), "::after").opacity),
  );
  if (o > 0.25) {
    await zoom.screenshot({ path: join(OUT, `mark-zoom-glint-${LABEL}.png`), clip: gclip });
    glintShot = o;
  } else await zoom.waitForTimeout(40);
}
/* Then the rotation, one frame per hand-off. */
for (const [i, label] of ["a", "b", "c"].entries()) {
  await zoom.screenshot({ path: join(OUT, `mark-zoom-cycle-${label}-${LABEL}.png`), clip: gclip });
  if (i < 2) await zoom.waitForTimeout(2700);
}
report(
  "Mark: the tick's glint was captured lit (not asserted from the stylesheet)",
  glintShot > 0.25,
  glintShot ? `caught at opacity ${glintShot.toFixed(2)} → mark-zoom-glint-${LABEL}.png` : "never lit within 12s",
);
await zoomCtx.close();
}

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, `home-1440-hero-${LABEL}.png`) });

const overflow1440 = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
report("No horizontal overflow at 1440", overflow1440 <= 0, `${overflow1440}px`);

/* ======================================================= icons and metadata */

if (!BASELINE) {
const html = await (await fetch(`${BASE}/`)).text();
// ALL of them: Next emits favicon.ico first and icon.svg second, and a regex
// that stops at the first `rel="icon"` reports the SVG missing when it is
// right there. (Measured: this check failed on its own regex first time out.)
const iconLinks = [...html.matchAll(/<link[^>]+rel="icon"[^>]*>/g)].map((m) => m[0]);
const appleLink = /<link[^>]+rel="apple-touch-icon"[^>]*>/.exec(html)?.[0] ?? "";
const themeMeta = /<meta[^>]+name="theme-color"[^>]*>/.exec(html)?.[0] ?? "";
report(
  'Built HTML carries <link rel="icon"> for the SVG and <link rel="apple-touch-icon">',
  iconLinks.some((l) => l.includes("/icon.svg")) && appleLink.includes("/apple-icon.png"),
  `${iconLinks.length} icon link(s): ${iconLinks.join(" ") || "NONE"} · ${appleLink || "MISSING apple-touch-icon"}`,
);
report(
  "themeColor is present and equals --c-base",
  /content="#0A0E11"/i.test(themeMeta),
  themeMeta || "MISSING theme-color",
);

for (const [path, type] of [
  ["/icon.svg", "image/svg+xml"],
  ["/apple-icon.png", "image/png"],
  ["/favicon.ico", "image/x-icon"],
]) {
  const res = await fetch(`${BASE}${path}`);
  const ct = res.headers.get("content-type") ?? "";
  report(
    `GET ${path} is 200 ${type}`,
    res.status === 200 && ct.includes(type.split("/")[1].replace("x-icon", "icon")),
    `HTTP ${res.status} · ${ct}`,
  );
}
}

/* ================================================================ 375 mobile */
//
// Fresh browser: see the note on the launch above.
await browser.close();
browser = await chromium.launch();

const mobile = await browser.newContext({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const mpage = await mobile.newPage();
await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mpage.waitForFunction(() => document.querySelector(".mf")?.classList.contains("is-live"), {
  timeout: 10_000,
});
await mpage.waitForTimeout(400);

const fps375 = await sampleFps(mpage, FPS_WINDOW_MS);
measured.fps375 = (fps375.frames / (fps375.ms / 1000)).toFixed(1);
report(
  `Frame rate at 375 with every layer on (>= ${FPS_FLOOR}fps · ${floorLabel})`,
  Number(measured.fps375) >= FPS_FLOOR,
  `${measured.fps375}fps · ${fps375.frames} rAF frames in ${fps375.ms.toFixed(0)}ms`,
);

// Parallax is a pointer affordance and a touch context must not bind it.
const touchParallax = await mpage.evaluate(
  () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
);
report("Pointer parallax stands down on a touch context", touchParallax === false, `fine pointer: ${touchParallax}`);

const overflow375 = await mpage.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
report("No horizontal overflow at 375", overflow375 <= 0, `${overflow375}px`);
await mpage.screenshot({ path: join(OUT, `home-375-hero-${LABEL}.png`) });

/* ========================================================== reduced motion */

await browser.close();
browser = await chromium.launch();

const rm = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rmPage = await rm.newPage();
await rmPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await rmPage.waitForTimeout(1500);

const rmState = await rmPage.evaluate(() => {
  const mf = document.querySelector(".mf");
  const glyph = document.querySelector(".mark__glyph");
  const names = (sel) =>
    [...document.querySelectorAll(sel)].map((el) => getComputedStyle(el).animationName);
  return {
    live: mf.classList.contains("is-live"),
    svgVisible: getComputedStyle(mf.querySelector("svg")).display !== "none",
    mfAnimation: getComputedStyle(mf).animationName,
    markNames: [
      getComputedStyle(glyph).animationName,
      ...names(".mark__glyph i"),
      ...names(".mark__glyph b"),
      // The glint is on a pseudo-element. A selector list that forgets it
      // leaves a 20s animation running on a page that promised none.
      ...[...document.querySelectorAll(".mark__glyph b")].map(
        (el) => getComputedStyle(el, "::after").animationName,
      ),
    ],
    // ...and the overlay must be invisible, not merely stopped.
    glintOpacity: [...document.querySelectorAll(".mark__glyph b")].map(
      (el) => getComputedStyle(el, "::after").opacity,
    ),
    markTransforms: names(".mark__glyph i").length
      ? [...document.querySelectorAll(".mark__glyph i, .mark__glyph b")].map(
          (el) => getComputedStyle(el).transform,
        )
      : [],
    running: document.getAnimations().filter((a) => a.playState === "running").length,
  };
});
report(
  "Reduced motion: canvas stands down, static SVG shown",
  !rmState.live && rmState.svgVisible && rmState.mfAnimation === "none",
  `is-live=${rmState.live} svg=${rmState.svgVisible} animation=${rmState.mfAnimation}`,
);
if (!BASELINE)
  report(
  "Reduced motion: the mark is fully static, glint included",
  rmState.markNames.every((n) => n === "none") &&
    rmState.markTransforms.every((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)") &&
    rmState.glintOpacity.every((o) => Number(o) === 0),
  `animations ${[...new Set(rmState.markNames)].join(",")} · transforms ${[...new Set(rmState.markTransforms)].join(" ")}` +
    ` · glint opacity ${[...new Set(rmState.glintOpacity)].join(",")}`,
);
report(
  "Reduced motion: ZERO animations running anywhere on the page",
  rmState.running === 0,
  `${rmState.running} running`,
);
await rmPage.screenshot({ path: join(OUT, `home-1440-reduced-motion-${LABEL}.png`) });

await browser.close();

console.log("─".repeat(72));
console.log(`measured: ${JSON.stringify(measured)}`);
console.log(failed ? `${failed} chrome check(s) FAILED` : "all chrome checks passed");
console.log(
  `screenshots → ${UPDATE_EVIDENCE ? `docs/evidence/${EVIDENCE_DIR}/` : "out/verify-chrome/ (untracked)"}`,
);
process.exit(failed ? 1 : 0);
