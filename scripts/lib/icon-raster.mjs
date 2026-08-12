// Rasterize app/icon.svg into the formats a browser cannot get from an SVG.
//
// Driven by scripts/make-icons.mjs (which writes the files) and by
// scripts/verify-tokens.mjs (which renders again and compares bytes, so an
// edit to the SVG that never got rasterized is a red gate rather than a
// surprise in somebody's browser tab).
//
// PIPELINE. This reuses scripts/make-og.mjs's approach exactly — the same
// hand-rolled PNG encoder, now shared at scripts/lib/png.mjs — so the repo
// still rasterizes its static images with nothing but node. No headless
// browser, no sharp, no resvg: the icon is four rectangles and a corner
// radius, which is less code to draw than it is to install a library for.
//
// ONE SOURCE. Nothing here restates a colour or a coordinate. app/icon.svg is
// parsed, and whatever is in it is what gets drawn — so the SVG a browser
// fetches and the PNG Apple fetches cannot disagree. Edit the SVG, re-run.
//
// OUTPUTS
//   app/apple-icon.png  180x180, opaque. iOS applies its own mask, so the
//                       artwork is full-bleed base colour with no rounding of
//                       its own — a rounded PNG under an iOS mask double-rounds
//                       and reads as a shrunken sticker.
//   app/favicon.ico     16/32/48, transparent outside the rounded square. The
//                       repo shipped a black circle with a white triangle
//                       (a starter asset) until wave 2; a browser that prefers
//                       .ico would still be showing it if this only wrote PNG.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { encodeIco, encodePng } from "./png.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const ICON_SRC = join(ROOT, "app", "icon.svg");
export const APPLE_OUT = join(ROOT, "app", "apple-icon.png");
export const ICO_OUT = join(ROOT, "app", "favicon.ico");

/* ------------------------------------------------------------ parse the SVG */

const hex = (h) => {
  const m = h.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
};

// The leading \s matters: without it, a lookup for `x` happily returns `rx`.
const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}="([^"]+)"`).exec(tag);
  return m ? m[1] : null;
};

/** @returns {{ box:number, plate:object, cells:object[] }} */
export function parseIcon(svg) {
  const viewBox = /viewBox="([\d.\s-]+)"/.exec(svg);
  if (!viewBox) throw new Error("app/icon.svg: no viewBox");
  const [, , w, h] = viewBox[1].trim().split(/\s+/).map(Number);
  if (w !== h) throw new Error(`app/icon.svg: expected a square viewBox, got ${w}x${h}`);

  const rects = [...svg.matchAll(/<rect\b[^>]*>/g)].map(([tag]) => ({
    x: Number(attr(tag, "x")),
    y: Number(attr(tag, "y")),
    w: Number(attr(tag, "width")),
    h: Number(attr(tag, "height")),
    rx: Number(attr(tag, "rx") ?? 0),
    fill: hex(attr(tag, "fill")),
    alpha: Number(attr(tag, "fill-opacity") ?? 1),
  }));
  if (rects.length < 2) throw new Error("app/icon.svg: expected a plate and at least one cell");

  return { box: w, plate: rects[0], cells: rects.slice(1) };
}

/* ----------------------------------------------------------------- raster */

const SS = 4; // supersample factor per axis — 16 samples a pixel

/** Is this point inside a rect with rounded corners? */
function inRect(px, py, r) {
  if (px < r.x || py < r.y || px > r.x + r.w || py > r.y + r.h) return false;
  if (!r.rx) return true;
  const cx = Math.min(Math.max(px, r.x + r.rx), r.x + r.w - r.rx);
  const cy = Math.min(Math.max(py, r.y + r.rx), r.y + r.h - r.rx);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r.rx * r.rx;
}

/**
 * @param {ReturnType<typeof parseIcon>} icon
 * @param {number} size    output edge, in pixels
 * @param {boolean} opaque true drops the alpha channel and paints the plate
 *                         edge-to-edge (Apple); false keeps the rounded plate
 *                         on transparency (favicon).
 */
export function render(icon, size, opaque) {
  const { box, plate, cells } = icon;
  const channels = opaque ? 3 : 4;
  const px = Buffer.alloc(size * size * channels);
  const scale = box / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Accumulate straight-alpha colour over the supersamples.
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const ux = (x + (sx + 0.5) / SS) * scale;
          const uy = (y + (sy + 0.5) / SS) * scale;

          // Plate first, then every cell painted over it in document order.
          let sr = 0, sg = 0, sb = 0, sa = 0;
          if (opaque || inRect(ux, uy, plate)) {
            [sr, sg, sb] = plate.fill;
            sa = 1;
          }
          for (const c of cells) {
            if (!inRect(ux, uy, c)) continue;
            sr = c.fill[0] * c.alpha + sr * (1 - c.alpha);
            sg = c.fill[1] * c.alpha + sg * (1 - c.alpha);
            sb = c.fill[2] * c.alpha + sb * (1 - c.alpha);
            sa = c.alpha + sa * (1 - c.alpha);
          }
          r += sr; g += sg; b += sb; a += sa;
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * channels;
      px[i] = Math.round(r / n);
      px[i + 1] = Math.round(g / n);
      px[i + 2] = Math.round(b / n);
      if (channels === 4) px[i + 3] = Math.round((a / n) * 255);
    }
  }
  return encodePng(px, size, size, channels);
}

/** Both raster siblings, from the SVG on disk. Deterministic: same in, same bytes out. */
export function renderIcons(svgText = readFileSync(ICON_SRC, "utf8")) {
  const icon = parseIcon(svgText);
  return {
    apple: render(icon, 180, true),
    ico: encodeIco([16, 32, 48].map((size) => ({ size, png: render(icon, size, false) }))),
  };
}
