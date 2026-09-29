#!/usr/bin/env python3
# sculpture.py: the home page's sculpture images, cut from the Blender plate (fulgurite.py --variant plate).
#
#   python3 scripts/specimen/sculpture.py --plate plate-alpha.png --camera plate.camera.json --eras eras.json \
#       --specimen specimen.json --out public/specimen --ts lib/specimen/sculpture.generated.ts
#
# Needs Python 3 with Pillow and numpy. Everything here is measured from the render and the record; nothing is drawn:
#   · the plate, feathered to transparent at its edges, at widths for first paint (each at most 150 KB) and for the
#     descent on wide screens;
#   · one window per era for narrow screens: the glass that grew in the era's months (eras.mjs puts each era at its
#     depth), found by projecting the specimen's own points through the plate's camera, faded at top and bottom;
#   · lib/specimen/sculpture.generated.ts: the camera, the image sizes, and where each era sits in the plate.
import argparse
import hashlib
import json
import math
import os

import numpy as np
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("--plate", required=True)
ap.add_argument("--camera", required=True)
ap.add_argument("--eras", required=True)
ap.add_argument("--specimen", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--ts", required=True)
A = ap.parse_args()

POSTER_BUDGET = 150 * 1024  # first paint: a rendered poster of 150 KB or less
POSTER_WIDTHS = (450, 640, 900)
PLATE_WIDTHS = (1400, 2000)
ERA_WIDTHS = (800, 1320)
ERA_ASPECT = (1.1, 1.6)  # an era's window is between 1.1 and 1.6 times as wide as it is tall

cam = json.load(open(A.camera))
eras = json.load(open(A.eras))
spec = json.load(open(A.specimen))
plate = Image.open(A.plate).convert("RGBA")
W, H = plate.size
assert (W, H) == (cam["width"], cam["height"]), "the camera belongs to another render"


# ---- the camera: the plate's own projection (three.js coordinates, y up) ---------------------------------------
P = np.array(cam["three"]["position"], float)
T = np.array(cam["three"]["target"], float)
f = T - P
f /= np.linalg.norm(f)
r = np.cross(f, np.array([0.0, 1.0, 0.0]))
r /= np.linalg.norm(r)
u = np.cross(r, f)
tv = math.tan(math.radians(cam["vfov"]) / 2)
aspect = W / H


def project(X):
    X = np.atleast_2d(np.asarray(X, float)) - P
    x, y, z = X @ r, X @ u, X @ f
    return np.stack([((x / z) / (tv * aspect) + 1) / 2 * W, (1 - (y / z) / tv) / 2 * H], axis=1)


trunk = next(t for t in spec["tubes"] if t["id"] == "trunk")
TP = np.array(trunk["points"], float)


def on_trunk(y):
    """The trunk's point at depth y (it runs from the surface down, y decreasing), as grow.ts interpolates it."""
    if y >= TP[0][1]:
        return TP[0]
    for i in range(1, len(TP)):
        if y >= TP[i][1]:
            a, b = TP[i - 1], TP[i]
            k = (y - a[1]) / ((b[1] - a[1]) or 1)
            return a + (b - a) * k
    return TP[-1]


def py_at(y):
    return float(project(on_trunk(y))[0][1])


# ---- the plate, feathered: nothing may end in a hard line on the page's ground -----------------------------------
rgba = np.asarray(plate, dtype=np.float64) / 255.0
alpha = rgba[..., 3]
coverage = np.argwhere(alpha >= 8 / 255)
by0, bx0 = coverage.min(0)
by1, bx1 = coverage.max(0)


def ramp(n, lo, hi):
    """0 at the edge, 1 inside, a smoothstep over [lo, hi) pixels from each end."""
    i = np.arange(n, dtype=np.float64)
    d = np.minimum(i, n - 1 - i)
    t = np.clip((d - lo) / max(1.0, hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


alpha = alpha * ramp(H, 2, 0.03 * H)[:, None] * ramp(W, 2, 0.03 * W)[None, :]
rgba[..., 3] = alpha
feathered = Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")


def resized(im, w):
    h = round(im.height * w / im.width)
    return im.convert("RGBa").resize((w, h), Image.LANCZOS, reducing_gap=3.0).convert("RGBA")


GROUND = np.array([13.0, 12.0, 10.0])  # --ground, #0d0c0a, which the plate's alpha was unmixed from


def baked(im):
    """The render laid on the exact night ground (what the page shows), with a soft silhouette for its alpha.

    Lossy colour is cheap and lossless alpha is not, so the glass's translucency is carried in the colour, already
    over the ground it will sit on, and the alpha only says where the render differs from the ground by 2 levels or
    more, grown and softened by a few pixels. Wherever it is 0 the page's own ground shows, exactly; at its soft edge
    the colour it fades out is within 2 levels of that ground, so no box can show."""
    rgba = np.asarray(im, dtype=np.float64)
    a = rgba[..., 3:] / 255.0
    over = rgba[..., :3] * a + GROUND * (1 - a)
    diff = np.abs(over - GROUND).max(axis=2)
    k = max(3, im.width // 300)
    mask = Image.fromarray(((diff >= 2.0) * 255).astype(np.uint8), "L")
    mask = mask.filter(ImageFilter.MaxFilter(2 * k + 1)).filter(ImageFilter.GaussianBlur(k * 0.8))
    out = np.concatenate([np.clip(over + 0.5, 0, 255), np.asarray(mask, dtype=np.float64)[..., None]], axis=2)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def save_webp(im, path, quality):
    im.save(path, "WEBP", quality=quality, method=6, alpha_quality=100)
    return os.path.getsize(path)


os.makedirs(A.out, exist_ok=True)
files = {}


def write(name, im, quality, budget=None):
    path = os.path.join(A.out, name)
    im = baked(im)
    q = quality
    size = save_webp(im, path, q)
    while budget and size > budget and q > 50:
        q -= 4
        size = save_webp(im, path, q)
    assert not budget or size <= budget, f"{name}: {size} bytes is over the {budget}-byte budget"
    files[name] = {"w": im.width, "h": im.height, "bytes": size, "q": q}
    print(f"  {name:28s} {im.width}x{im.height}  q{q}  {size / 1024:7.1f} KB")


print("first paint (whole plate):")
for w in POSTER_WIDTHS:
    write(f"plate-{w}.webp", resized(feathered, w), 80, POSTER_BUDGET)
print("the descent (whole plate, sharp):")
for w in PLATE_WIDTHS:
    write(f"plate-{w}.webp", feathered if w == W else resized(feathered, w), 80)


# ---- the eras' windows ------------------------------------------------------------------------------------------
pts = np.concatenate([np.array(t["points"], float) for t in spec["tubes"]])
proj = project(pts)
pad = 0.02 * W
cx0, cx1 = max(0.0, bx0 - pad), min(float(W), bx1 + pad)
crop_w = cx1 - cx0


def window(ya, yb, focus=None):
    """The plate rows holding the glass that grew between depths ya (upper) and yb (lower)."""
    sel = (pts[:, 1] <= ya + 1e-6) & (pts[:, 1] >= yb - 1e-6)
    ys = np.concatenate([proj[sel, 1], [py_at(ya), py_at(yb)]])
    top, bot = float(ys.min()), float(ys.max())
    lo_h, hi_h = crop_w / ERA_ASPECT[1], crop_w / ERA_ASPECT[0]
    want = min(max(bot - top + 0.12 * crop_w, lo_h), hi_h)
    mid = (py_at(ya) + py_at(yb)) / 2 if focus is None else focus
    y0 = min(max(0.0, mid - want / 2), H - want)
    return [round(cx0), round(y0), round(crop_w), round(want)]


def cut(rect):
    x, y, w, h = rect
    im = np.asarray(plate.crop((x, y, x + w, y + h)), dtype=np.float64) / 255.0
    # the glass fades into the night at the window's top and bottom, and at its sides
    im[..., 3] *= ramp(h, 1, 0.14 * h)[:, None] * ramp(w, 1, 0.04 * w)[None, :]
    return Image.fromarray((np.clip(im, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")


windows = {}
for e in eras["eras"]:
    rect = window(e["y0"], e["y1"])
    windows[e["id"]] = rect
tip = eras["tip"]
tip_py = py_at(-eras["height"])
windows["tip"] = window(tip["y0"], tip["y1"], focus=tip_py - 0.1 * crop_w)
print("era windows:")
for k, rect in windows.items():
    im = cut(rect)
    for w in ERA_WIDTHS:
        ww = min(w, im.width)
        write(f"era-{k}-{w}.webp", im if ww == im.width else resized(im, ww), 80)


# ---- where the reader is, in the plate: the descent's path (plate pixels) -----------------------------------------
descent = [{"id": e["id"], "from": round(py_at(e["y0"]), 1), "to": round(py_at(e["yNext"]), 1)} for e in eras["eras"]]
surface_py = round(py_at(0.0), 1)
tip_py = round(tip_py, 1)

digest = hashlib.sha256(open(A.plate, "rb").read()).hexdigest()[:12]
module = {
    "plate": {"width": W, "height": H, "sha": digest, "bbox": [int(bx0), int(by0), int(bx1 - bx0), int(by1 - by0)]},
    "camera": {"position": cam["three"]["position"], "target": cam["three"]["target"], "vfov": cam["vfov"]},
    "specimen": cam["specimen"],
    "samples": cam.get("samples"),
    "surface": surface_py,
    "tip": tip_py,
    "descent": descent,
    "windows": windows,
    "files": files,
}
banner = (
    "// GENERATED by scripts/specimen/sculpture.py from the Blender plate (scripts/specimen/fulgurite.py --variant plate)\n"
    "// and the record it was rendered from. Do not edit: run scripts/specimen/make-sculpture.sh.\n"
    "// Plate pixels are measured from the plate's top left; the camera is the plate's own, in three.js coordinates.\n\n"
)
with open(A.ts, "w") as fh:
    fh.write(banner + "export const SCULPTURE = " + json.dumps(module, indent=2) + " as const;\n")
print("module ->", A.ts)
total = sum(v["bytes"] for v in files.values())
print(f"total {total / 1024:.0f} KB in {len(files)} files")
