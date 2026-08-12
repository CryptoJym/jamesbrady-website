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
const OUT = UPDATE_EVIDENCE
  ? join(process.cwd(), "docs", "evidence", "wave-2-chrome")
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
// Sampled across FRAMES, not from one. A window of brightness travels through
// the mesh, so a single capture measures whatever the wave happened to be
// doing — two runs of the earlier one-frame version read 0.095 and 0.084 off
// the same build. Twelve frames spread over ~2.4s cover a full pass, and the
// number reported is the peak of all of them.
let fieldPeak = 0;
const fieldFrames = [fieldT0, fieldT1];
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(240);
  fieldFrames.push(await page.screenshot({ clip: fieldClip }));
}
let fieldPx = 0;
for (const shot of fieldFrames) {
  const r = await peakLuminance(page, shot.toString("base64"));
  fieldPeak = Math.max(fieldPeak, r.peak);
  fieldPx = r.px;
}
const fieldLum = { peak: fieldPeak, px: fieldPx, frames: fieldFrames.length };
await hider.evaluate((el) => el.remove());
await page.waitForTimeout(200);

const h1Box = await page.locator(".b-room h1").first().boundingBox();
const h1Shot = await page.screenshot({
  clip: { x: h1Box.x, y: h1Box.y, width: h1Box.width, height: h1Box.height },
});
const h1Lum = await peakLuminance(page, h1Shot.toString("base64"));

measured.fieldPeak = fieldLum.peak.toFixed(3);
measured.h1Peak = h1Lum.peak.toFixed(3);
report(
  "Field peak luminance stays BELOW the h1's",
  fieldLum.peak < h1Lum.peak,
  `field ${measured.fieldPeak} vs h1 ${measured.h1Peak} ` +
    `(${fieldLum.px} px x ${fieldLum.frames} frames, h1 ${h1Lum.px} px)`,
);
/* The ceiling the wave was given: presence through structure, not brightness. */
report(
  "Field peak stays inside its 0.45 budget",
  fieldLum.peak <= 0.45,
  `${measured.fieldPeak} of 0.45`,
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
    ],
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
  "Reduced motion: the mark is fully static",
  rmState.markNames.every((n) => n === "none") &&
    rmState.markTransforms.every((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)"),
  `animations ${[...new Set(rmState.markNames)].join(",")} · transforms ${[...new Set(rmState.markTransforms)].join(" ")}`,
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
  `screenshots → ${UPDATE_EVIDENCE ? "docs/evidence/wave-2-chrome/" : "out/verify-chrome/ (untracked)"}`,
);
process.exit(failed ? 1 : 0);
