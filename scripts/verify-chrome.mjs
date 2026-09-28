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
//
// FULGURITE — 2026-09-27. The field, the living glyph and --c-base are retired
// with Direction B. The four claims stand; this is what each reads now.
//
//   FRAME RATE — the living layer is the specimen, a three.js scene, so the
//   rAF counter now drops with the WebGL render loop. That changes what a
//   software rasterizer can prove. On one machine and one build the specimen
//   ran at 77fps on the GPU and 20fps on SwiftShader: on a CPU rasterizer a
//   WebGL frame rate measures the CPU. So: the browser is given the GPU where
//   the platform offers one to headless Chromium (macOS, through ANGLE on
//   Metal), and there the GPU floor of 55fps is asserted as before. On a
//   software rasterizer (GitHub's runners) the rate is printed, labelled as the
//   instrument's, and NOT asserted; what is asserted everywhere is the frame's
//   cost that no instrument can distort: WebGL draw calls per frame, counted
//   by wrapping the context's draw methods. The design draws three: the glass,
//   the frosted glass and the beads, each one call ("Beads: one instanced
//   draw", Specimen.tsx). A specimen that turned into a draw call per tube
//   would fail here on any runner.
//
//   CONTRAST — decoration never outranks content, where content is read. The
//   specimen stands BESIDE the text (and above it on a phone), never behind
//   it, so the claim is now measured directly: with the hero text hidden, the
//   pixels where it sits must be the ground and nothing else; the text's own
//   colour must then clear WCAG against that measured ground (4.5:1, and 7:1
//   for --ink, the design's own claim for reading text). The field's 0.45
//   ceiling existed to keep a background under the h1; there is no background
//   under the text any more, and the two assertions above say so directly. The
//   PRESENCE floor stands: the specimen must actually be drawn, peak >= 0.30.
//
//   THE MARK — the wordmark in the fixed header. It is static type: it must be
//   in the header, link home, never move or shift (its box is identical after
//   time and after scrolling), and take the heat focus ring, which is the
//   accent's interaction role (the ruling-B hover the glyph used to answer).
//   The breathing, cycling, glint and hand-off checks measured the Direction B
//   glyph's animation; Fulgurite's mark has none, so they are retired.
//
//   REDUCED MOTION — unchanged in kind: the specimen stands still, the strike
//   never runs, the mark and every transition are still, and
//   document.getAnimations() reports nothing running.
//
//   ICONS — served and linked as before; the theme colour must equal the
//   page's ground as the browser renders it, read from the page rather than
//   typed here.

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

/** The GPU floor, never silently lowered: >= 55 of a 60Hz budget. Below this
 * the motion stops reading as motion. Asserted wherever the page is drawn on a
 * GPU; see the FULGURITE note above for what a software rasterizer asserts. */
const FPS_FLOOR_GPU = 55;
const FPS_WINDOW_MS = 3000;
/** WebGL draw calls one frame of the specimen may cost: glass, frosted glass, beads. */
const DRAW_CALLS_PER_FRAME = 3;
/** Headless Chromium draws WebGL on the GPU only when asked; macOS offers it through ANGLE on Metal. */
const GPU_ARGS = process.platform === "darwin" ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : [];

let failed = 0;
const measured = {};
const report = (name, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const note = (text) => console.log(`      ${text}`);

/**
 * ONE BROWSER PER VIEWPORT, torn down between samples. A frame-rate number is
 * only about the page if nothing else is on the renderer — measured, the 375
 * sample read 50.0fps with the 1440 page still open behind it, 57.0 with the
 * context closed but the browser warm, and 70.8 in a browser of its own. Two
 * of those three numbers were about the harness.
 */
let browser = await chromium.launch({ args: GPU_ARGS });

/** Counts WebGL draw calls per animation frame, from before the page's own scripts run. */
const COUNT_DRAWS = () => {
  const stats = { frames: [], current: 0 };
  window.__jbDraws = stats;
  for (const proto of [window.WebGLRenderingContext?.prototype, window.WebGL2RenderingContext?.prototype]) {
    if (!proto) continue;
    for (const name of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced", "drawRangeElements"]) {
      const original = proto[name];
      if (typeof original !== "function") continue;
      proto[name] = function (...args) {
        stats.current++;
        return original.apply(this, args);
      };
    }
  }
  const tick = () => {
    stats.frames.push(stats.current);
    stats.current = 0;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/** Draw calls in each of the frames drawn during the last sampling window (frames that drew nothing are idle, not cheap). */
const drawsSince = (page, from) =>
  page.evaluate((i) => window.__jbDraws.frames.slice(i).filter((n) => n > 0), from);

/** WCAG relative luminance of the brightest pixel in a PNG, and how much of it is lit, computed in-page. */
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
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) {
      const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
      if (L > peak) peak = L;
      if (L > 0.02) lit++;
    }
    return { peak, lit: lit / (d.length / 4), px: d.length / 4 };
  }, pngBase64);

/** Pixels that differ by more than a rounding step between two PNG screenshots. */
const pixelDiff = (page, a, b) =>
  page.evaluate(
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

/** The WebGL canvas has taken over from the poster: it drew its first frame. */
const specimenLive = (page) =>
  page.waitForFunction(
    () => {
      const stage = document.querySelector(".fg-stage");
      return Boolean(stage?.querySelector("canvas") && !stage.querySelector("img"));
    },
    { timeout: 30_000 },
  );

const stageClip = async (page) => {
  const box = await page.locator(".fg-stage").boundingBox();
  const vh = page.viewportSize().height;
  return { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, vh - box.y) };
};

const rendererOf = (page) =>
  page.evaluate(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) return "none";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
    } catch {
      return "unknown";
    }
  });

/** A CSS colour string, as computed style prints it, to [r, g, b, a] in 0..255 / 0..1. */
const parseColour = (css) => {
  const rgb = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/.exec(css);
  if (rgb) {
    const a = rgb[4] === undefined ? 1 : rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : Number(rgb[4]);
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), a];
  }
  const srgb = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/.exec(css);
  if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] === undefined ? 1 : Number(srgb[4])];
  const hex = /^#([0-9a-f]{6})$/i.exec(css.trim());
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1);
  return null;
};
const luminance = ([r, g, b]) => {
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/* ==================================================== 1440: the living stage */

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await desktop.addInitScript(COUNT_DRAWS);
const page = await desktop.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await specimenLive(page);
await page.waitForTimeout(400);

const glRenderer = String(await rendererOf(page));
const softwareRaster = /swiftshader|llvmpipe|software/i.test(glRenderer);
measured.renderer = glRenderer.slice(0, 80);
const drawStart1440 = await page.evaluate(() => window.__jbDraws.frames.length);
const fps1440 = await sampleFps(page, FPS_WINDOW_MS);
measured.fps1440 = (fps1440.frames / (fps1440.ms / 1000)).toFixed(1);
const draws1440 = await drawsSince(page, drawStart1440);
if (!softwareRaster)
  report(
    `Frame rate at 1440 with the specimen live (>= ${FPS_FLOOR_GPU}fps · GPU floor · ${measured.renderer})`,
    Number(measured.fps1440) >= FPS_FLOOR_GPU,
    `${measured.fps1440}fps · ${fps1440.frames} rAF frames in ${fps1440.ms.toFixed(0)}ms`,
  );
else
  note(
    `frame rate at 1440 on a software rasterizer: ${measured.fps1440}fps (${measured.renderer}). ` +
      `The instrument's number, not a visitor's; the GPU floor is asserted on a GPU run.`,
  );
report(
  `Frame cost at 1440: every drawn frame is <= ${DRAW_CALLS_PER_FRAME} WebGL draw calls`,
  draws1440.length > 0 && draws1440.every((n) => n <= DRAW_CALLS_PER_FRAME),
  `${draws1440.length} drawn frames · calls per frame: ${[...new Set(draws1440)].sort().join(", ")}`,
);
measured.drawsPerFrame = Math.max(0, ...draws1440);

/* --------------------------------------------------- motion proof, 1s apart */
// Two captures of the stage a full second apart. A still frame of a canvas
// proves it painted; a pair proves it is alive.
const clip1440 = await stageClip(page);
const stageT0 = await page.screenshot({ clip: clip1440 });
await page.waitForTimeout(1000);
const stageT1 = await page.screenshot({ clip: clip1440 });
writeFileSync(join(OUT, `stage-1440-${LABEL}-t0.png`), stageT0);
writeFileSync(join(OUT, `stage-1440-${LABEL}-t1.png`), stageT1);

/* --------------------------------------------------- the specimen's presence */
// The floor from the presence pass, applied to the living layer the site has
// now: the specimen must actually be drawn. Sampled across frames while it
// turns, and the WORST frame must clear it.
const presence = [];
for (const shot of [stageT0, stageT1]) presence.push(await peakLuminance(page, shot.toString("base64")));
while (presence.length < 12) {
  presence.push(await peakLuminance(page, (await page.screenshot({ clip: clip1440 })).toString("base64")));
}
const worstPeak = Math.min(...presence.map((p) => p.peak));
const worstLit = Math.min(...presence.map((p) => p.lit));
measured.specimenPeakMin = worstPeak.toFixed(3);
measured.specimenLitMin = `${(worstLit * 100).toFixed(1)}%`;
report(
  "Specimen reaches its presence floor in every sampled frame (peak >= 0.30, >= 1% of the stage lit)",
  worstPeak >= 0.3 && worstLit >= 0.01,
  `${presence.length} frames · worst peak ${measured.specimenPeakMin} · worst lit ${measured.specimenLitMin} of ${presence[0].px} px`,
);

/* -------------------------------------------------------------- contrast */
// Where the hero text sits, with the text (and the fixed header over it)
// hidden: layout untouched, so this is exactly what shows through behind the
// words as the page ships. It has to be the ground, and only the ground.
const groundCss = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
const ground = parseColour(groundCss);
const groundL = luminance(ground);
const surfaceBox = await page.locator(".fg-surface").boundingBox();
const surfaceClip = {
  x: surfaceBox.x,
  y: Math.max(0, surfaceBox.y),
  width: surfaceBox.width,
  height: Math.min(surfaceBox.y + surfaceBox.height, 900) - Math.max(0, surfaceBox.y),
};
const hider = await page.addStyleTag({ content: ".fg-surface > *, .fg-head { visibility: hidden !important; }" });
await page.waitForTimeout(100);
let behindPeak = 0;
for (let i = 0; i < 3; i++) {
  const r = await peakLuminance(page, (await page.screenshot({ clip: surfaceClip })).toString("base64"));
  behindPeak = Math.max(behindPeak, r.peak);
  await page.waitForTimeout(400);
}
await hider.evaluate((el) => el.remove());
measured.behindTextPeak = behindPeak.toFixed(4);
measured.groundL = groundL.toFixed(4);
report(
  "Nothing but the ground is painted behind the hero text",
  behindPeak <= groundL + 0.002,
  `peak ${measured.behindTextPeak} behind the text vs ground ${measured.groundL} (${groundCss}) · ${surfaceClip.width.toFixed(0)}x${surfaceClip.height.toFixed(0)} px`,
);

// The text's own colour against that measured ground. 4.5:1 is WCAG AA for
// body-size text; 7:1 is the design's own claim for --ink reading text.
const textColours = await page.evaluate(() => {
  const pick = (sel, need) => [...document.querySelectorAll(sel)].map((el) => ({ sel, need, color: getComputedStyle(el).color }));
  return [
    ...pick(".fg-surface h1", 4.5),
    ...pick(".fg-surface #hero", 7),
    ...pick(".fg-surface .fg-attrib", 4.5),
    ...pick(".fg-surface .fg-lede", 7),
    ...pick(".fg-surface .fg-cta-row a", 4.5),
  ];
});
const ratios = textColours.map((t) => {
  const c = parseColour(t.color);
  const blended = c ? [0, 1, 2].map((i) => c[i] * c[3] + ground[i] * (1 - c[3])) : null;
  return { ...t, ratio: blended ? contrast(luminance(blended), groundL) : 0 };
});
const lowContrast = ratios.filter((r) => r.ratio < r.need);
measured.heroContrast = ratios.map((r) => `${r.sel.replace(".fg-surface ", "")} ${r.ratio.toFixed(2)}`);
report(
  "Hero text clears contrast against that ground (4.5:1; 7:1 for the quote and lede)",
  textColours.length >= 5 && lowContrast.length === 0,
  lowContrast.length
    ? lowContrast.map((r) => `${r.sel} ${r.ratio.toFixed(2)}:1 < ${r.need}:1`).join(" | ")
    : ratios.map((r) => `${r.sel.replace(".fg-surface ", "")} ${r.ratio.toFixed(1)}:1`).join(" · "),
);

/* ---------------------------------------------------------------- the mark */

if (!BASELINE) {
  const markOf = () =>
    page.evaluate(() => {
      const mark = document.querySelector(".fg-head .fg-wordmark");
      if (!mark) return null;
      const r = mark.getBoundingClientRect();
      return {
        href: mark.getAttribute("href"),
        name: mark.getAttribute("aria-label") ?? "",
        text: mark.textContent.trim(),
        imagery: mark.querySelectorAll("img, svg, canvas").length,
        headPosition: getComputedStyle(document.querySelector(".fg-head")).position,
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
      };
    });
  const mark0 = await markOf();
  report(
    "Mark: the wordmark sits in the fixed header, links home, and is type, not an image",
    Boolean(mark0) &&
      mark0.href === "/" &&
      mark0.name.includes("James Brady") &&
      mark0.text === "JAMES BRADY" &&
      mark0.imagery === 0 &&
      mark0.headPosition === "fixed",
    mark0 ? `"${mark0.text}" → ${mark0.href} · "${mark0.name}" · header ${mark0.headPosition}` : "NO WORDMARK",
  );

  // No layout shift: the mark's box must be identical after time passes and
  // after the page scrolls under it. This proves it rather than asserting it.
  await page.waitForTimeout(2000);
  const mark1 = await markOf();
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(300);
  const mark2 = await markOf();
  await page.evaluate(() => window.scrollTo(0, 0));
  const sameBox = (a, b) => a && b && ["x", "y", "width", "height"].every((k) => a.rect[k] === b.rect[k]);
  report(
    "Mark stays put — zero layout shift over 2s and after a 1500px scroll",
    sameBox(mark0, mark1) && sameBox(mark0, mark2),
    mark0 ? `box ${mark0.rect.width.toFixed(1)}x${mark0.rect.height.toFixed(1)} at (${mark0.rect.x}, ${mark0.rect.y}) every time` : "",
  );

  // Keyboard focus draws the heat ring: the accent's interaction role, which
  // ruling B gave the old signal colour and Fulgurite gives heat.
  await page.evaluate(() => document.activeElement?.blur());
  let focused = false;
  for (let i = 0; i < 6 && !focused; i++) {
    await page.keyboard.press("Tab");
    focused = await page.evaluate(() => document.activeElement?.classList.contains("fg-wordmark") ?? false);
  }
  const ring = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement);
    return {
      style: s.outlineStyle,
      width: parseFloat(s.outlineWidth),
      colour: s.outlineColor,
      heat: getComputedStyle(document.documentElement).getPropertyValue("--heat").trim(),
    };
  });
  const heat = parseColour(ring.heat);
  const drawn = parseColour(ring.colour);
  await page.screenshot({ path: join(OUT, `mark-focus-1440-${LABEL}.png`), clip: { x: 0, y: 0, width: 420, height: 70 } });
  report(
    "Mark: keyboard focus draws the heat ring (the accent's interaction role)",
    focused && ring.style === "solid" && ring.width >= 2 && Boolean(heat && drawn) && [0, 1, 2].every((i) => Math.abs(heat[i] - drawn[i]) < 1),
    `reached by Tab: ${focused} · ${ring.style} ${ring.width}px ${ring.colour} · --heat ${ring.heat}`,
  );
  await page.evaluate(() => document.activeElement?.blur());

  /* MAGNIFIED MARK EVIDENCE, in its own 4x context so the measured page is
     never mutated for a photograph. */
  const zoomCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 });
  const zoom = await zoomCtx.newPage();
  await zoom.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const box = await zoom.locator(".fg-wordmark").boundingBox();
  await zoom.screenshot({
    path: join(OUT, `mark-zoom-${LABEL}.png`),
    clip: { x: box.x - 7, y: box.y - 7, width: box.width + 14, height: box.height + 14 },
  });
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
// The browser paints its own chrome in this colour before any stylesheet
// loads, so it must be the ground the page then paints: read from the page.
const theme = parseColour(/content="([^"]+)"/.exec(themeMeta)?.[1] ?? "");
report(
  "themeColor is present and equals the page's ground as rendered",
  Boolean(theme) && [0, 1, 2].every((i) => theme[i] === ground[i]),
  `${themeMeta || "MISSING theme-color"} · page ground ${groundCss}`,
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
browser = await chromium.launch({ args: GPU_ARGS });

const mobile = await browser.newContext({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
await mobile.addInitScript(COUNT_DRAWS);
const mpage = await mobile.newPage();
await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await specimenLive(mpage);
await mpage.waitForTimeout(400);

const drawStart375 = await mpage.evaluate(() => window.__jbDraws.frames.length);
const fps375 = await sampleFps(mpage, FPS_WINDOW_MS);
measured.fps375 = (fps375.frames / (fps375.ms / 1000)).toFixed(1);
const draws375 = await drawsSince(mpage, drawStart375);
if (!softwareRaster)
  report(
    `Frame rate at 375 with the specimen live (>= ${FPS_FLOOR_GPU}fps · GPU floor · ${measured.renderer})`,
    Number(measured.fps375) >= FPS_FLOOR_GPU,
    `${measured.fps375}fps · ${fps375.frames} rAF frames in ${fps375.ms.toFixed(0)}ms`,
  );
else note(`frame rate at 375 on a software rasterizer: ${measured.fps375}fps. The instrument's number, not a visitor's.`);
report(
  `Frame cost at 375: every drawn frame is <= ${DRAW_CALLS_PER_FRAME} WebGL draw calls`,
  draws375.length > 0 && draws375.every((n) => n <= DRAW_CALLS_PER_FRAME),
  `${draws375.length} drawn frames · calls per frame: ${[...new Set(draws375)].sort().join(", ")}`,
);

// On a touch screen the specimen must not take the page's scroll: its host
// hands vertical pans back to the page (drag-to-turn stays horizontal).
const touch = await mpage.evaluate(() => {
  const host = document.querySelector(".fg-stage canvas")?.parentElement;
  return host ? getComputedStyle(host).touchAction : "no specimen";
});
report("Touch: the specimen lets the page scroll (touch-action: pan-y)", touch === "pan-y", `touch-action: ${touch}`);

const overflow375 = await mpage.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
report("No horizontal overflow at 375", overflow375 <= 0, `${overflow375}px`);
await mpage.screenshot({ path: join(OUT, `home-375-hero-${LABEL}.png`) });

/* ========================================================== reduced motion */

await browser.close();
browser = await chromium.launch({ args: GPU_ARGS });

const rm = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rmPage = await rm.newPage();
await rmPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await specimenLive(rmPage);
await rmPage.waitForTimeout(1500);

const rmClip = await stageClip(rmPage);
const stillA = await rmPage.screenshot({ clip: rmClip });
await rmPage.waitForTimeout(1000);
const stillB = await rmPage.screenshot({ clip: rmClip });
const stillness = await pixelDiff(rmPage, stillA, stillB);
const rmState = await rmPage.evaluate(() => {
  const seconds = (d) => Math.max(...d.split(",").map((x) => parseFloat(x) * (x.trim().endsWith("ms") ? 0.001 : 1)));
  const mark = document.querySelector(".fg-wordmark");
  const moving = [...document.querySelectorAll(".fg-wordmark, .fg-door, .fg-fig__m, .fg-cta-row a")].filter((el) => {
    const s = getComputedStyle(el);
    return (s.animationName !== "none" && seconds(s.animationDuration) > 0.001) || seconds(s.transitionDuration) > 0.001;
  });
  return {
    strike: sessionStorage.getItem("jb-strike"),
    markAnimation: mark ? getComputedStyle(mark).animationName : "NO MARK",
    moving: moving.map((el) => el.className),
    checked: document.querySelectorAll(".fg-wordmark, .fg-door, .fg-fig__m, .fg-cta-row a").length,
    running: document.getAnimations().filter((a) => a.playState === "running").length,
  };
});
// A rasterizer may round a pixel differently from one frame to the next; a
// turning specimen changes thousands, so the allowance is 0.05% of the stage.
report(
  "Reduced motion: the specimen stands still and the strike never runs",
  stillness.changed <= stillness.total * 0.0005 && rmState.strike === null,
  `${stillness.changed} of ${stillness.total} px changed over 1s · strike ${rmState.strike === null ? "never ran" : "RAN"}`,
);
if (!BASELINE)
  report(
    "Reduced motion: the mark and every transition are still (doors, figure methods, CTA links)",
    rmState.markAnimation === "none" && rmState.checked > 0 && rmState.moving.length === 0,
    `mark animation ${rmState.markAnimation} · ${rmState.checked} elements, ${rmState.moving.length} moving${rmState.moving.length ? `: ${rmState.moving.join(", ")}` : ""}`,
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
