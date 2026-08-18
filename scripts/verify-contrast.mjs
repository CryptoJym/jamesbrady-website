#!/usr/bin/env node
// WCAG contrast for the primary CTA tokens. No browser.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
const root = css.slice(css.indexOf(":root{"), css.indexOf("\n}\n", css.indexOf(":root{")));

function token(name) {
  const m = root.match(new RegExp(`${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`missing ${name}`);
  return m[1];
}

function lin(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function lum(hex) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const ink = token("--ink-on-btn");
const fill = token("--sig-btn");
const hover = token("--sig-btn-hi");
const rest = contrast(ink, fill);
const over = contrast(ink, hover);
const ok = rest >= 4.5 && over >= 4.5;
console.log(`primary ${ink} on ${fill} = ${rest.toFixed(2)}:1`);
console.log(`hover   ${ink} on ${hover} = ${over.toFixed(2)}:1`);
if (!ok) {
  console.error("FAIL  primary button contrast below 4.5:1");
  process.exit(1);
}
console.log("PASS  primary button contrast ≥ 4.5:1");
