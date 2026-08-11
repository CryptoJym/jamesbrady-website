#!/usr/bin/env node
// Static per-template OG images — v1 of geo-seo-spec §3.4.
//
// One 1200x630 PNG per template, chosen by the template rather than by the
// entry. Deliberately plain: base surface, one phosphor rule, the wordmark and
// the template name in a 5x7 bitmap face. Per-entry dynamic generation is v2.
//
// Written with a hand-rolled PNG encoder so the build gains no dependency for
// five static images. Run: node scripts/make-og.mjs

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "og");

const W = 1200;
const H = 630;

// Tokens, copied from :root. Kept in sync by hand because a PNG cannot read CSS.
const BASE = [0x0a, 0x0e, 0x11];
const PANEL = [0x0d, 0x13, 0x17];
const LINE = [0x1a, 0x25, 0x2a];
const SIG = [0x3f, 0xd9, 0xa0];
const T_HI = [0xe9, 0xf1, 0xf3];
const T_LO = [0x7e, 0x91, 0x99];

/* ---------------------------------------------------------------- 5x7 face */

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

/* ------------------------------------------------------------ tiny canvas */

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
        if (glyph[col] & (1 << row)) {
          rect(px, cx + col * scale, y + row * scale, scale, scale, c);
        }
      }
    }
    cx += (5 + tracking) * scale;
  }
  return cx;
}

/* ------------------------------------------------------------ png encoder */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(px) {
  const raw = Buffer.alloc(H * (W * 3 + 1));
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0; // filter: none
    px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ plates */

const PLATES = [
  { file: "default.png", label: "Builds AI systems that show their work" },
  { file: "work.png", label: "Work · products, open source, client work" },
  { file: "theories.png", label: "Theories · open questions in public" },
  { file: "lab.png", label: "Lab · things you can poke at" },
  { file: "learn.png", label: "Learn · three archived volumes" },
  { file: "about.png", label: "About · Lehi, Utah" },
];

mkdirSync(OUT, { recursive: true });

for (const plate of PLATES) {
  const px = makeCanvas(BASE);

  // Console rail across the top, and the inset foot.
  rect(px, 0, 0, W, 44, PANEL);
  rect(px, 0, 44, W, 1, LINE);
  rect(px, 0, H - 90, W, 90, PANEL);
  rect(px, 0, H - 90, W, 1, LINE);

  // The one phosphor rule.
  rect(px, 72, 214, 120, 4, SIG);

  // A faint instrument grid on the right, standing in for the manifold.
  for (let i = 0; i < 9; i++) rect(px, 760 + i * 44, 96, 1, 380, LINE);
  for (let i = 0; i < 7; i++) rect(px, 760, 96 + i * 62, 396, 1, LINE);
  rect(px, 760, 96, 4, 380, SIG);

  text(px, "JAMES BRADY", 72, 14, 2, T_LO, 2);
  text(px, "LEHI, UT", W - 320, 14, 2, T_LO, 2);

  text(px, "JAMES", 72, 108, 9, T_HI, 2);
  text(px, "BRADY", 72, 154, 9, T_HI, 2);

  const label = plate.label.replace(/[^A-Za-z0-9 ./·-]/g, " ");
  text(px, label.slice(0, 46), 72, 252, 3, T_LO, 2);

  text(px, "EVERY NUMBER COUNTED AT BUILD", 72, H - 58, 3, SIG, 2);
  text(px, "WWW.JAMESBRADY.ORG", W - 470, H - 58, 3, T_LO, 2);

  writeFileSync(join(OUT, plate.file), encodePng(px));
  console.log(`wrote public/og/${plate.file}`);
}
