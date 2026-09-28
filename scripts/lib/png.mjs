// A hand-rolled PNG encoder, and the ICO wrapper that carries PNGs.
//
// Lifted verbatim out of scripts/make-og.mjs when the icon generator needed the
// same thing (wave 2). Same reason it was hand-rolled in the first place: a
// build should not gain an image dependency to write a handful of static
// squares. The only thing added here is an alpha channel, which the OG plates
// never needed and a favicon does.

import { deflateSync, inflateSync } from "node:zlib";

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

export function crc32(buf) {
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

/**
 * @param {Buffer} px    packed pixels, `channels` bytes each, row-major
 * @param {number} w
 * @param {number} h
 * @param {number} channels 3 = truecolour, 4 = truecolour + alpha
 */
export function encodePng(px, w, h, channels = 3) {
  const stride = w * channels;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    px.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = channels === 4 ? 6 : 2; // colour type
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * An .ico is a tiny directory in front of its images, and since Vista each
 * image may simply BE a PNG. So the whole format here is a header, one entry
 * per size, and the PNG bytes we already know how to make.
 *
 * @param {{size:number, png:Buffer}[]} entries
 */
export function encodeIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach((e, i) => {
    const o = i * 16;
    dir[o] = e.size >= 256 ? 0 : e.size; // 0 means 256
    dir[o + 1] = e.size >= 256 ? 0 : e.size;
    dir[o + 2] = 0; // palette entries
    dir[o + 3] = 0; // reserved
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(e.png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.png.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

/**
 * The image a PNG carries: its IHDR and its scanlines, inflated. Two encodes of
 * the same pixels agree here even when their bytes do not, because deflate
 * output belongs to the zlib build (Homebrew's node@22 links the system zlib
 * 1.2.12; the official binaries bundle their own 1.3.1) and not to the image.
 */
export function decodePng(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let header = null;
  const idat = [];
  for (let o = 8; o + 12 <= buf.length; ) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString("ascii", o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === "IHDR") header = data;
    else if (type === "IDAT") idat.push(data);
    o += 12 + len;
  }
  if (!header || !idat.length) throw new Error("PNG has no IHDR or no IDAT");
  return { header, pixels: inflateSync(Buffer.concat(idat)) };
}

/** An .ico's directory entries, each with the PNG it carries. */
export function decodeIco(buf) {
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) throw new Error("not an ICO");
  return Array.from({ length: buf.readUInt16LE(4) }, (_, i) => {
    const o = 6 + 16 * i;
    const size = buf.readUInt32LE(o + 8);
    const at = buf.readUInt32LE(o + 12);
    return { entry: buf.subarray(o, o + 8), png: buf.subarray(at, at + size) };
  });
}

/** True when two PNGs, or two ICOs of PNGs, hold the same images: same headers, same pixels. */
export function sameImage(a, b) {
  const samePng = (x, y) => {
    const [dx, dy] = [decodePng(x), decodePng(y)];
    return dx.header.equals(dy.header) && dx.pixels.equals(dy.pixels);
  };
  if (a.readUInt32BE(0) === 0x89504e47) return b.readUInt32BE(0) === 0x89504e47 && samePng(a, b);
  const [ia, ib] = [decodeIco(a), decodeIco(b)];
  return ia.length === ib.length && ia.every((e, i) => e.entry.equals(ib[i].entry) && samePng(e.png, ib[i].png));
}
