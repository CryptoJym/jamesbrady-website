#!/usr/bin/env node
// Video poster plates — wave 4.
//
// WHY THESE EXIST. /watch and one Workshop guide used photographic posters:
// a robed figure conjuring glowing sacred geometry over a spellbook, gold-lit
// hands arranging glowing solids, stacked amber planes covered in glyphs. They
// were the most prominent thing on /watch and they are the exact costume the
// register rules retire — "the site proves competence; it never performs
// mystique" (SITE-BRIEF.md). A register cleanup that rewrote three sentences
// and left that image as the hero of the page would not have cleaned anything.
//
// The RECORDINGS ARE UNTOUCHED. A poster is the frame shown before play; it is
// chrome, not content. Each plate names the recording it fronts, so a reader
// knows what they are about to play before they play it — which is more than
// the photographs did.
//
// Same hand-rolled encoder and the same 5x7 face as the OG plates, and the same
// reason: a build should not gain an image dependency to write four static
// rectangles. Tokens are copied from :root by hand because a PNG cannot read
// CSS — verify-tokens allowlists nothing here, so if these drift off palette
// the drift is visible in the diff rather than hidden in a binary.
//
//   node scripts/make-posters.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { encodePng } from "./lib/png.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "video-posters");

/** 16:9, matching every recording in the archive (measured: all are 1920x1080). */
const W = 1600;
const H = 900;

// Tokens, copied from :root.
const BASE = [0x0a, 0x0e, 0x11]; // --c-base
const INSET = [0x08, 0x0c, 0x0e]; // --c-inset
const LINE = [0x1a, 0x25, 0x2a]; // --c-line
const SIG = [0x3f, 0xd9, 0xa0]; // --sig
const T_HI = [0xe9, 0xf1, 0xf3]; // --t-hi
const T_LO = [0x7e, 0x91, 0x99]; // --t-lo

const FONT = {
  A: [0x7e, 0x11, 0x11, 0x11, 0x7e], B: [0x7f, 0x49, 0x49, 0x49, 0x36],
  C: [0x3e, 0x41, 0x41, 0x41, 0x22], D: [0x7f, 0x41, 0x41, 0x22, 0x1c],
  E: [0x7f, 0x49, 0x49, 0x49, 0x41], F: [0x7f, 0x09, 0x09, 0x09, 0x01],
  G: [0x3e, 0x41, 0x49, 0x49, 0x7a], H: [0x7f, 0x08, 0x08, 0x08, 0x7f],
  I: [0x00, 0x41, 0x7f, 0x41, 0x00], J: [0x20, 0x40, 0x41, 0x3f, 0x01],
  K: [0x7f, 0x08, 0x14, 0x22, 0x41], L: [0x7f, 0x40, 0x40, 0x40, 0x40],
  M: [0x7f, 0x02, 0x0c, 0x02, 0x7f], N: [0x7f, 0x04, 0x08, 0x10, 0x7f],
  O: [0x3e, 0x41, 0x41, 0x41, 0x3e], P: [0x7f, 0x09, 0x09, 0x09, 0x06],
  Q: [0x3e, 0x41, 0x51, 0x21, 0x5e], R: [0x7f, 0x09, 0x19, 0x29, 0x46],
  S: [0x46, 0x49, 0x49, 0x49, 0x31], T: [0x01, 0x01, 0x7f, 0x01, 0x01],
  U: [0x3f, 0x40, 0x40, 0x40, 0x3f], V: [0x1f, 0x20, 0x40, 0x20, 0x1f],
  W: [0x3f, 0x40, 0x38, 0x40, 0x3f], X: [0x63, 0x14, 0x08, 0x14, 0x63],
  Y: [0x07, 0x08, 0x70, 0x08, 0x07], Z: [0x61, 0x51, 0x49, 0x45, 0x43],
  0: [0x3e, 0x51, 0x49, 0x45, 0x3e], 1: [0x00, 0x42, 0x7f, 0x40, 0x00],
  2: [0x42, 0x61, 0x51, 0x49, 0x46], 3: [0x21, 0x41, 0x45, 0x4b, 0x31],
  4: [0x18, 0x14, 0x12, 0x7f, 0x10], 5: [0x27, 0x45, 0x45, 0x45, 0x39],
  6: [0x3c, 0x4a, 0x49, 0x49, 0x30], 7: [0x01, 0x71, 0x09, 0x05, 0x03],
  8: [0x36, 0x49, 0x49, 0x49, 0x36], 9: [0x06, 0x49, 0x49, 0x29, 0x1e],
  " ": [0x00, 0x00, 0x00, 0x00, 0x00], ".": [0x00, 0x60, 0x60, 0x00, 0x00],
  "-": [0x08, 0x08, 0x08, 0x08, 0x08], "/": [0x20, 0x10, 0x08, 0x04, 0x02],
  "·": [0x00, 0x08, 0x08, 0x00, 0x00],
};

function makeCanvas(bg) {
  const px = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    px[i * 3] = bg[0];
    px[i * 3 + 1] = bg[1];
    px[i * 3 + 2] = bg[2];
  }
  return px;
}

function rect(px, x, y, w, h, c) {
  for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) {
    for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) {
      const i = (yy * W + xx) * 3;
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
    }
  }
}

function text(px, str, x, y, scale, c, tracking = 1) {
  let cx = x;
  for (const ch of str.toUpperCase()) {
    const glyph = FONT[ch] ?? FONT[" "];
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 7; row++) {
        if (glyph[col] & (1 << row)) rect(px, cx + col * scale, y + row * scale, scale, scale, c);
      }
    }
    cx += (5 + tracking) * scale;
  }
  return cx;
}

/** Break a label onto lines that fit the plate at the given scale. */
function wrap(label, scale, maxWidth, tracking = 2) {
  const per = (5 + tracking) * scale;
  const perLine = Math.floor(maxWidth / per);
  const out = [];
  let line = "";
  for (const word of label.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > perLine && line) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}

const PLATES = [
  { file: "model-to-system.png", label: "What turns a model into a system" },
  { file: "install-first-skill.png", label: "Install your first skill" },
  { file: "prompts-to-os.png", label: "From prompts to operating systems" },
];

mkdirSync(OUT, { recursive: true });

for (const plate of PLATES) {
  const px = makeCanvas(BASE);

  // A recessed foot and a single phosphor rule: the same two devices the OG
  // plates use, so a poster and a share card read as one system.
  //
  // NOTHING IS PRINTED IN THE BOTTOM BAND. The browser's own video controls
  // are drawn over the bottom of the poster, and a first pass put the plate's
  // foot line directly under them — half-legible text with a scrubber through
  // it. The band is kept as a surface and left empty; the words moved up.
  rect(px, 0, H - 120, W, 120, INSET);
  rect(px, 0, H - 120, W, 1, LINE);
  rect(px, 96, 250, 160, 5, SIG);

  // The instrument grid, well under the title's luminance — decoration is
  // always dimmer than the thing it sits behind (design-system-spec §5.6).
  for (let i = 0; i < 11; i++) rect(px, 980 + i * 56, 120, 1, 560, LINE);
  for (let i = 0; i < 11; i++) rect(px, 980, 120 + i * 56, 560, 1, LINE);

  text(px, "JAMES BRADY · ARCHIVED WALKTHROUGH", 96, 120, 3, T_LO, 2);

  // The title column stops short of the grid at x=980. A bitmap face has no
  // metrics to ask, so the wrap width is the measured gap, not a guess.
  const safe = plate.label.replace(/[^A-Za-z0-9 ./·-]/g, " ");
  const lines = wrap(safe, 7, 980 - 96 - 48);
  lines.forEach((line, i) => {
    text(px, line, 96, 330 + i * 78, 7, T_HI, 2);
  });

  // Under the title, clear of the control bar by more than 200px at every
  // rendered size.
  text(px, "PRESS PLAY", 96, 330 + lines.length * 78 + 40, 4, SIG, 2);

  writeFileSync(join(OUT, plate.file), encodePng(px, W, H, 3));
  console.log(`wrote public/video-posters/${plate.file}`);
}
