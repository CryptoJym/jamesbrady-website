# fulgurite.py: build and render the jamesbrady.org fulgurite in Blender Cycles from any specimen.json.
#
# The specimen is the one the site grows (lib/specimen/grow.ts) and exports (scripts/specimen/export.mjs):
# tubes with points, radii, heat, frosted and cut; beads with a position and a radius. Every visible form
# here is built from those numbers. What this script adds is only physical: a sand crust, fused glass with a
# hollow bore, bubbles in the glass, light, a camera, and time.
#
#   blender -b -P fulgurite.py -- --specimen specimen.json --variant VARIANT --out PATH [options]
#
# Variants
#   film-desktop    1920x1080 frames of the strike film   (--out is a directory; frames f_0001.png ...)
#   film-phone      1080x1920 frames of the strike film
#   still-desktop   1920x1080 reduced-motion still: the film's settled frame, rendered clean
#   still-phone     1080x1920 reduced-motion still
#   poster          1600x2000 standing specimen, the site's first paint (three.js start pose: yaw 0.6, fov 30)
#   og              2400x1260 share card plate, the specimen on its side like a museum drawer piece
#   print           4000x5000 the best frame
#   plate           2000x4000 the site's sculpture: the whole specimen standing, in the browser's pose (yaw 0.6, fov 30),
#                   framed tight so the home page can travel down it; also writes OUT.camera.json, the exact camera,
#                   so the page's three.js layer lays its hover and highlight on the same pixels
#   status-study    2400x1500 lookdev sheet: one real branch in each status (none, shipped, live), frosted, hot
#
# Options
#   --res WxH        override resolution          --pct N         resolution percentage (previews)
#   --samples N      Cycles samples               --frames A-B    film frame range (1-based, inclusive)
#   --fps N          film frame rate (30)         --seconds S     film length (12)
#   --time T         render a still at film time T (seconds) with the film camera (for checks)
#   --status FILE    optional JSON {"tube-id-or-index": "live" | "shipped"}; tube "status" fields win
#   --yaw DEG        override the still camera's turn      --save-blend FILE   also save the .blend
#
# Coordinates arrive y-up (three.js); Blender is z-up, so (x, y, z) becomes (x, -z, y).

import argparse
import json
import math
import os
import sys
import time

import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.kdtree import KDTree

T_START = time.time()


def log(*a):
    print("[fulgurite %6.1fs]" % (time.time() - T_START), *a, flush=True)


# ---- arguments ----------------------------------------------------------------------------------------

VARIANTS = {
    # name: (width, height, samples, kind)
    "film-desktop": (1920, 1080, 160, "film"),
    "film-phone": (1080, 1920, 160, "film"),
    "still-desktop": (1920, 1080, 768, "still"),
    "still-phone": (1080, 1920, 768, "still"),
    "poster": (1600, 2000, 768, "still"),
    "og": (2400, 1260, 768, "still"),
    "print": (4000, 5000, 1536, "still"),
    "status-study": (2400, 1500, 512, "still"),
    "plate": (2000, 4000, 768, "still"),
}


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    ap = argparse.ArgumentParser(prog="fulgurite.py")
    ap.add_argument("--specimen", required=True)
    ap.add_argument("--variant", default="poster", choices=sorted(VARIANTS))
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", default=None)
    ap.add_argument("--pct", type=int, default=100)
    ap.add_argument("--samples", type=int, default=None)
    ap.add_argument("--frames", default=None)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--seconds", type=float, default=12.0)
    ap.add_argument("--time", type=float, default=None)
    ap.add_argument("--status", default=None)
    ap.add_argument("--yaw", type=float, default=None)
    ap.add_argument("--save-blend", default=None)
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--cam", default=None, help="debug camera: x,y,z,tx,ty,tz,vfov (Blender coords)")
    ap.add_argument("--alpha", action="store_true", help="also write OUT-alpha.png: RGBA unmixed from the night ground (default for poster)")
    return ap.parse_args(argv)


ARGS = parse_args()
W, H, SAMPLES, KIND = VARIANTS[ARGS.variant]
if ARGS.res:
    W, H = (int(v) for v in ARGS.res.lower().split("x"))
if ARGS.samples:
    SAMPLES = ARGS.samples
FPS = ARGS.fps
SECONDS = ARGS.seconds
NFRAMES = int(round(FPS * SECONDS))
FILM = KIND == "film" or ARGS.time is not None
STILL_NOW = 1.0e4  # a still is the finished, cooled specimen: every point fused long ago

# ---- palette: the site's tokens (app/fg.css) ------------------------------------------------------------


def srgb(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


GROUND_HEX = "#0d0c0a"  # --ground, the night
SAND = srgb("#bfa985")  # --sand
SAND_DIM = srgb("#6e6352")  # --sand-dim
GLASS = srgb("#cfe0d6")  # --glass
HEAT = srgb("#ffb45c")  # --heat: the only accent, "live" or "now"
STRIKE = srgb("#dde6ff")  # --strike

# ---- small math ----------------------------------------------------------------------------------------


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def smoothstep(e0, e1, x):
    t = clamp((x - e0) / (e1 - e0))
    return t * t * (3 - 2 * t)


def smootherstep(e0, e1, x):
    t = clamp((x - e0) / (e1 - e0))
    return t * t * t * (t * (t * 6 - 15) + 10)


def lerp(a, b, t):
    return a + (b - a) * t


def v3(p):
    """three.js y-up to Blender z-up."""
    return (p[0], -p[2], p[1])


# Hash-based value noise, vectorised. Deterministic: the same specimen always gets the same crust.
_M = np.uint64(0xFFFFFFFF)


def _hash(ix, iy, iz, seed):
    h = (ix.astype(np.int64) * 73856093) ^ (iy.astype(np.int64) * 19349663) ^ (iz.astype(np.int64) * 83492791) ^ (seed * 2654435761)
    h = h.astype(np.uint64) & _M
    h = (h ^ (h >> np.uint64(15))) * np.uint64(0x2C1B3C6D) & _M
    h = (h ^ (h >> np.uint64(12))) * np.uint64(0x297A2D39) & _M
    h = h ^ (h >> np.uint64(15))
    return (h & np.uint64(0xFFFFFF)).astype(np.float64) / float(0x1000000)


def vnoise(p, seed=0):
    """3D value noise in [0, 1). p: (N, 3)."""
    fl = np.floor(p)
    f = p - fl
    i = fl.astype(np.int64)
    u = f * f * (3 - 2 * f)
    out = np.zeros(len(p))
    for dx in (0, 1):
        wx = u[:, 0] if dx else 1 - u[:, 0]
        for dy in (0, 1):
            wy = u[:, 1] if dy else 1 - u[:, 1]
            for dz in (0, 1):
                wz = u[:, 2] if dz else 1 - u[:, 2]
                out += _hash(i[:, 0] + dx, i[:, 1] + dy, i[:, 2] + dz, seed) * wx * wy * wz
    return out


def fbm(p, octaves=4, seed=0, lac=2.03, gain=0.5):
    amp, tot, norm = 1.0, np.zeros(len(p)), 0.0
    q = p.copy()
    for o in range(octaves):
        tot += amp * vnoise(q, seed + o * 17)
        norm += amp
        amp *= gain
        q = q * lac + 11.7
    return tot / norm


def rand01(n, seed):
    return np.random.default_rng(seed).random(n)


# ---- the specimen --------------------------------------------------------------------------------------

SRC = json.load(open(ARGS.specimen))
HGT = float(SRC["height"])
MID_Z = -HGT / 2
STATUS_CODE = {"none": 0.0, "shipped": 1.0, "live": 2.0}

status_map = {}
if ARGS.status:
    status_map = json.load(open(ARGS.status))


def tube_status(i, t):
    s = t.get("status")
    if s is None:
        s = status_map.get(str(t.get("id", ""))) or status_map.get(str(i))
    return s if s in STATUS_CODE else "none"


def catmull_rom(P, ds):
    """Centripetal Catmull-Rom through every data point, sampled about every ds units.
    Returns samples (M,3) and the fractional data index of each sample (M,)."""
    P = np.asarray(P, dtype=np.float64)
    n = len(P)
    if n == 2:
        P = np.array([P[0], (P[0] + P[1]) / 2, P[1]])
        n = 3
    ext = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    pts, idx = [], []
    for i in range(n - 1):
        p0, p1, p2, p3 = ext[i], ext[i + 1], ext[i + 2], ext[i + 3]
        seg = np.linalg.norm(p2 - p1)
        m = max(2, int(math.ceil(seg / ds)))
        t0 = 0.0
        t1 = t0 + max(np.linalg.norm(p1 - p0), 1e-6) ** 0.5
        t2 = t1 + max(seg, 1e-6) ** 0.5
        t3 = t2 + max(np.linalg.norm(p3 - p2), 1e-6) ** 0.5
        u = np.arange(m) / m if i < n - 2 else np.arange(m + 1) / m
        t = t1 + (t2 - t1) * u[:, None]
        a1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1
        a2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
        a3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
        b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2
        b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3
        c = (t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2
        pts.append(c)
        idx.append(i + u)
    return np.vstack(pts), np.concatenate(idx)


def interp_idx(values, fidx):
    """Smooth (Catmull-Rom) interpolation of per-point data at fractional indices."""
    v = np.asarray(values, dtype=np.float64)
    n = len(v)
    i = np.clip(np.floor(fidx).astype(int), 0, n - 1)
    f = fidx - i
    g = lambda k: v[np.clip(k, 0, n - 1)]
    p0, p1, p2, p3 = g(i - 1), g(i), g(i + 1), g(i + 2)
    return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f ** 3)


def frames_along(C):
    """Parallel-transport frames along a polyline: tangent, normal, binormal. No twisting."""
    m = len(C)
    T = np.zeros_like(C)
    T[1:-1] = C[2:] - C[:-2]
    T[0] = C[1] - C[0]
    T[-1] = C[-1] - C[-2]
    T /= np.maximum(np.linalg.norm(T, axis=1, keepdims=True), 1e-9)
    N = np.zeros_like(C)
    ref = np.array([0.0, 0.0, 1.0]) if abs(T[0][2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    n0 = ref - T[0] * ref.dot(T[0])
    N[0] = n0 / np.linalg.norm(n0)
    for k in range(1, m):
        nn = N[k - 1] - T[k] * N[k - 1].dot(T[k])
        ln = np.linalg.norm(nn)
        N[k] = nn / ln if ln > 1e-9 else N[k - 1]
    B = np.cross(T, N)
    return T, N, B


class Tube:
    pass


def build_tubes():
    tubes = []
    for i, t in enumerate(SRC["tubes"]):
        tb = Tube()
        tb.i = i
        tb.kind = t["kind"]
        tb.frosted = bool(t["frosted"])
        tb.cut = bool(t["cut"])
        tb.status = tube_status(i, t)
        tb.P = np.array([v3(p) for p in t["points"]])
        tb.R = np.array(t["radii"], dtype=np.float64)
        tb.Hd = np.array(t["heat"], dtype=np.float64)
        rmax = float(tb.R.max())
        ds = float(np.clip(0.2 * rmax, 0.0045, 0.022))
        C, fidx = catmull_rom(tb.P, ds)
        tb.C = C
        tb.fidx = fidx
        tb.r = np.maximum(interp_idx(tb.R, fidx), 0.0045)
        tb.h = np.clip(interp_idx(tb.Hd, fidx), 0.0, 1.0)
        seg = np.linalg.norm(np.diff(C, axis=0), axis=1)
        tb.s = np.concatenate([[0.0], np.cumsum(seg)])
        tb.L = float(tb.s[-1])
        # Data time along the tube: the trunk carries depth (= time) in its height; a fork leaves at its date.
        tb.depth0 = clamp(-tb.P[0][2] / HGT)
        tubes.append(tb)
    return tubes


TUBES = build_tubes()
TRUNK = TUBES[0]
log("specimen: %d tubes, %d beads, height %.1f" % (len(TUBES), len(SRC["beads"]), HGT))

# ---- the status study: one real fork, shown in every state the materials know ------------------------------
STUDY = [("none", False, False, "no status"), ("shipped", False, False, "shipped"), ("live", False, False, "live"),
         ("none", True, False, "private (frosted)"), ("none", False, True, "hot (last 7 days)")]


def build_study_src():
    """Five copies of one real fork, stood upright side by side (three.js coordinates, y up). Beads are the
    fork's own; the frosted copy has none, as private work never does; only the hot copy keeps the heat."""
    src_i = int(os.environ.get("FULG_STUDY_TUBE", "0")) or max(range(1, len(TUBES)), key=lambda k: (TUBES[k].R.max() if not TUBES[k].frosted else 0) * (len(TUBES[k].P) > 12))
    t = SRC["tubes"][src_i]
    P = np.array(t["points"], dtype=np.float64)
    D = P[-1] - P[0]
    D /= np.linalg.norm(D)
    down = np.array([0.0, -1.0, 0.0])
    v = np.cross(D, down)
    c = float(D.dot(down))
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    Rm = np.eye(3) + vx + vx @ vx * (1 / (1 + c)) if c > -0.999 else np.diag([1.0, -1.0, -1.0])
    # beads that sit on this fork
    kd = KDTree(sum(len(tb.C) for tb in TUBES))
    owner = []
    j = 0
    for tb in TUBES:
        for k in range(len(tb.C)):
            kd.insert(tb.C[k], j)
            owner.append(tb.i)
            j += 1
    kd.balance()
    mine = [b for b in SRC["beads"] if owner[kd.find(Vector(v3(b["p"])))[1]] == src_i]
    tubes = [{"kind": "trunk", "frosted": False, "cut": False, "points": [[0, 900, 0], [0, 901, 0], [0, 902, 0]], "radii": [0.01] * 3, "heat": [0] * 3, "dummy": True}]
    beads = []
    gap = 1.25
    n = len(STUDY)
    for k, (status, frosted, hot, label) in enumerate(STUDY):
        off = np.array([(k - (n - 1) / 2) * gap, -0.5, 0.0])
        Q = (P - P[0]) @ Rm.T + off
        tubes.append({"kind": "branch", "frosted": frosted, "cut": bool(t["cut"]), "points": Q.tolist(), "radii": t["radii"], "heat": t["heat"] if hot else [0.0] * len(t["heat"]), "status": status, "label": label})
        if not frosted:
            for b in mine:
                beads.append({"p": ((np.array(b["p"]) - P[0]) @ Rm.T + off).tolist(), "r": b["r"]})
    log("status study: tube %d (%d points, %d beads) x %d states" % (src_i, len(P), len(mine), n))
    return {"generatedAt": SRC.get("generatedAt"), "height": HGT, "tubes": tubes, "beads": beads}


if ARGS.variant == "status-study":
    SRC = build_study_src()
    TUBES = build_tubes()
    for _tb, _t in zip(TUBES, SRC["tubes"]):
        _tb.dummy = bool(_t.get("dummy"))
        _tb.label = _t.get("label")
    TRUNK = TUBES[0]

# ---- time: the film's clock ------------------------------------------------------------------------------
# Depth is time. The fusing front runs down the trunk from the surface (depth 0) to the tip (depth 1); each
# fork starts growing the moment the front reaches the depth of its creation, and grows out along its own path.

TL = {
    "strike": 0.50,  # the leader leaves the sky
    "leader": 0.22,  # seconds for the leader to reach the tip
    "strokes": [0.74, 0.90, 1.10],  # return strokes: the flash, and its flicker
    "fuse0": 0.95,  # the fusing front leaves the surface
    "fuse1": 6.60,  # ...and reaches the tip
    "settle0": 6.20,  # camera begins to pull back and settle
    "settle1": 8.40,
    "fade0": SECONDS - 0.95,  # the night returns: last frame == first frame
    "fade1": SECONDS - 0.10,
}


def front_ease(x):
    x = clamp(x)
    return 0.7 * x + 0.3 * (x * x * (3 - 2 * x))


_FX = np.linspace(0, 1, 2001)
_FY = np.array([front_ease(x) for x in _FX])


def trunk_arrival(depth):
    """Film time at which the fusing front reaches a depth (0..1)."""
    x = np.interp(np.clip(depth, 0, 1), _FY, _FX)
    return TL["fuse0"] + x * (TL["fuse1"] - TL["fuse0"])


def trunk_front_depth(tau):
    return front_ease((tau - TL["fuse0"]) / (TL["fuse1"] - TL["fuse0"]))


def grow_ease(x):
    x = np.clip(x, 0, 1)
    return 1 - (1 - x) ** 2


def grow_ease_inv(p):
    p = np.clip(p, 0, 1)
    return 1 - np.sqrt(1 - p)


for tb in TUBES:
    if tb is TRUNK:
        # depth of each sample, from the data points' own heights (monotonic by construction)
        dpt = np.clip(-interp_idx(tb.P[:, 2], tb.fidx) / HGT, 0, 1)
        dpt = np.maximum.accumulate(dpt)
        tb.arrive = trunk_arrival(dpt)
        tb.t0 = float(tb.arrive[0])
        tb.grow = float(tb.arrive[-1] - tb.arrive[0])
    else:
        tb.t0 = float(trunk_arrival(tb.depth0))
        tb.grow = float(np.clip(0.30 + 0.36 * tb.L, 0.38, 1.55))
        tb.arrive = tb.t0 + tb.grow * grow_ease_inv(tb.s / max(tb.L, 1e-6))


def point_at(tb, s):
    s = clamp(s, 0.0, tb.L)
    k = int(np.searchsorted(tb.s, s))
    k = min(max(k, 1), len(tb.s) - 1)
    f = (s - tb.s[k - 1]) / max(tb.s[k] - tb.s[k - 1], 1e-9)
    return tb.C[k - 1] + (tb.C[k] - tb.C[k - 1]) * f, tb.r[k - 1] + (tb.r[k] - tb.r[k - 1]) * f


# ---- geometry: hollow glass tubes under a sand crust ----------------------------------------------------

# A trunk kd-tree, to start each fork where it leaves the trunk's crust rather than at the trunk's axis.
_TK = KDTree(len(TRUNK.C))
for k, c in enumerate(TRUNK.C):
    _TK.insert(c, k)
_TK.balance()


def trunk_dist(c):
    co, k, d = _TK.find(c)
    return d, TRUNK.r[k]


class MeshAcc:
    """Accumulates quads/triangles and per-vertex attributes, then writes one Blender mesh."""

    def __init__(self, name):
        self.name = name
        self.co = []
        self.faces = []  # list of (M, k) int arrays
        self.mat = []  # material index per face block
        self.attrs = {}
        self.nv = 0

    def add_vertices(self, co, **attrs):
        base = self.nv
        n = len(co)
        self.co.append(np.asarray(co, dtype=np.float64))
        for k, v in attrs.items():
            self.attrs.setdefault(k, []).append((base, np.asarray(v, dtype=np.float64)))
        self.nv += n
        return base

    def add_faces(self, f, mat=0):
        f = np.asarray(f, dtype=np.int64)
        self.faces.append(f)
        self.mat.append(np.full(len(f), mat, dtype=np.int64))

    def build(self, materials, smooth=True):
        if not self.faces:
            return None
        co = np.vstack(self.co) if self.co else np.zeros((0, 3))
        me = bpy.data.meshes.new(self.name)
        me.vertices.add(len(co))
        me.vertices.foreach_set("co", co.astype(np.float32).ravel())
        sizes = np.concatenate([np.full(len(f), f.shape[1]) for f in self.faces])
        loops = np.concatenate([f.ravel() for f in self.faces])
        starts = np.concatenate([[0], np.cumsum(sizes)[:-1]])
        me.loops.add(len(loops))
        me.loops.foreach_set("vertex_index", loops.astype(np.int32))
        me.polygons.add(len(sizes))
        me.polygons.foreach_set("loop_start", starts.astype(np.int32))
        me.polygons.foreach_set("material_index", np.concatenate(self.mat).astype(np.int32))
        me.polygons.foreach_set("use_smooth", np.full(len(sizes), smooth))
        for name, blocks in self.attrs.items():
            dim = 1 if blocks[0][1].ndim == 1 else blocks[0][1].shape[1]
            arr = np.zeros((len(co), dim))
            for base, v in blocks:
                arr[base : base + len(v)] = v.reshape(len(v), dim)
            if dim == 1:
                a = me.attributes.new(name, "FLOAT", "POINT")
                a.data.foreach_set("value", arr.ravel().astype(np.float32))
            else:
                a = me.attributes.new(name, "FLOAT_VECTOR", "POINT")
                a.data.foreach_set("vector", arr.astype(np.float32).ravel())
        me.update(calc_edges=True)
        me.validate(clean_customdata=False)
        for m in materials:
            me.materials.append(m)
        ob = bpy.data.objects.new(self.name, me)
        bpy.context.scene.collection.objects.link(ob)
        return ob


def ring_grid_faces(base, rings, K, flip=False):
    """Quads between consecutive rings of K vertices (closed around)."""
    i = np.arange(rings - 1)[:, None]
    k = np.arange(K)[None, :]
    a = base + i * K + k
    b = base + (i + 1) * K + k
    a1 = base + i * K + (k + 1) % K
    b1 = base + (i + 1) * K + (k + 1) % K
    q = np.stack([a, a1, b1, b], axis=-1).reshape(-1, 4) if not flip else np.stack([a, b, b1, a1], axis=-1).reshape(-1, 4)
    return q


KIND_CODE = {"trunk": 0.0, "branch": 1.0, "twig": 2.0, "private": 3.0}

# Crust cover by kind: the trunk carries the most sand; thin glass the least. Status clears it further.
CRUST_COVER = {"trunk": 0.80, "branch": 0.62, "twig": 0.50, "private": 0.36}
STATUS_CRUST = {"none": 1.0, "shipped": 0.55, "live": 0.28}


def tube_surfaces(tb, glass_acc, bore_acc, seed):
    C, r0 = tb.C, tb.r
    m = len(C)
    T, N, B = frames_along(C)
    s = tb.s
    rmax = float(r0.max())
    K = int(np.clip(round(2 * math.pi * rmax / 0.0105), 10, 64))
    if tb.kind == "trunk":
        K = 72

    # Where does this fork leave the trunk? Start just inside the trunk's crust.
    i0 = 0
    if tb is not TRUNK:
        for k in range(m):
            d, rt = trunk_dist(Vector(C[k]))
            if d > rt * 0.72:
                i0 = max(0, k - 1)
                break
    sl = slice(i0, m)
    C, T, N, B, s, r0 = C[sl], T[sl], N[sl], B[sl], s[sl], r0[sl]
    arrive = tb.arrive[sl]
    heat = tb.h[sl]
    m = len(C)
    if m < 3:
        return

    rng = np.random.default_rng(seed)
    th = np.linspace(0, 2 * np.pi, K, endpoint=False)
    ct, st = np.cos(th), np.sin(th)

    rmean = max(float(np.mean(r0)), 0.006)
    # The profile: fused glass is never a clean cylinder. Lumps along the length, a flattened section that
    # turns slowly, and a few longitudinal fins, all small beside the data's own thickness.
    lump = fbm(np.stack([s / (3.2 * rmean) + seed * 3.1, np.zeros(m) + seed, np.zeros(m)], 1), 3, seed) - 0.5
    phase = fbm(np.stack([s / (9 * rmean), np.full(m, seed * 1.7), np.ones(m)], 1), 2, seed + 5) * 6.0
    flat = 0.10 + 0.08 * fbm(np.stack([s / (6 * rmean), np.full(m, 2.0 + seed), np.zeros(m)], 1), 2, seed + 9)

    SS, TH = np.meshgrid(s, th, indexing="ij")  # (m, K)
    ring_r = r0[:, None]
    tex = np.stack([np.cos(TH).ravel() * 1.3, np.sin(TH).ravel() * 1.3, (SS / (7.5 * rmean)).ravel()], 1)
    fins = fbm(tex + seed * 0.37, 3, seed + 21).reshape(m, K)
    fins = (1 - np.abs(2 * fins - 1)) ** 3
    prof = 1 + 0.16 * lump[:, None] + flat[:, None] * np.cos(2 * (TH - phase[:, None])) * 0.8 + 0.16 * (fins - 0.25)

    # Fork flare: a fused fillet where the fork leaves the trunk.
    if tb is not TRUNK:
        ds0 = s - s[0]
        prof *= 1 + 0.55 * np.exp(-ds0 / (2.5 * rmean))[:, None]

    # Crust cover: where sand stayed fused to the glass. Patchy, stretched along the tube like real crust.
    cover = CRUST_COVER[tb.kind] * STATUS_CRUST[tb.status]
    pw = np.stack([np.cos(TH).ravel() * 2.2, np.sin(TH).ravel() * 2.2, (SS / (2.6 * rmean)).ravel()], 1) * (1.0 + 0.2 * (rmean > 0.05))
    cn = fbm(pw + seed * 1.13, 4, seed + 33).reshape(m, K)
    # Heat clears the crust: fresh glass at a live tip. Thin tips keep a little sand.
    cov = cover * (1 - 0.85 * heat)[:, None]
    rank = np.empty(cn.size)
    rank[np.argsort(cn, axis=None)] = np.linspace(0, 1, cn.size)
    crust = np.clip((cov - rank.reshape(m, K)) * 7.0 + 0.5, 0, 1)

    # Surface relief: the crust stands proud of the glass by a sand-grain layer; grains roughen it.
    grain = fbm(np.stack([np.cos(TH).ravel(), np.sin(TH).ravel(), (SS / max(rmean, 0.02)).ravel()], 1) * (rmean / 0.011) + seed, 2, seed + 41).reshape(m, K)
    crust_h = np.minimum(0.18 * ring_r, 0.016) * crust * (0.65 + 0.7 * grain)
    R_out = ring_r * prof + crust_h

    # Tip closure: a taper to a rounded point unless the work was cut (then the break is left open).
    # Tip closure: a natural tip rounds off into a dome inside the data's own length; a clean break
    # (work that was cut) keeps its full section and ends flat.
    if not tb.cut:
        r_end = float(r0[-1])
        lc = min(1.3 * r_end, 0.3 * (s[-1] - s[0]))
        x = np.clip((s - (s[-1] - lc)) / max(lc, 1e-6), 0, 1)
        R_out *= np.sqrt(np.clip(1 - x ** 2, 0.0025, 1))[:, None]

    X = C[:, None, :] + R_out[..., None] * (ct[None, :, None] * N[:, None, :] + st[None, :, None] * B[:, None, :])
    co = X.reshape(-1, 3)
    n = m * K

    tc = np.stack([(np.cos(TH) * ring_r).ravel(), (np.sin(TH) * ring_r).ravel(), SS.ravel()], 1)
    common = dict(
        arrive=np.repeat(arrive, K),
        heat7=np.repeat(heat, K),
        rb=np.repeat(r0, K),
        kind=np.full(n, KIND_CODE[tb.kind]),
        status=np.full(n, STATUS_CODE[tb.status]),
        tid=np.full(n, float(tb.i)),
    )
    base = glass_acc.add_vertices(co, crust=crust.ravel(), surf=np.zeros(n), tc=tc, **common)
    glass_acc.add_faces(ring_grid_faces(base, m, K), 0)

    # ---- the bore: a hollow core where the glass is thick enough to hold one
    has_bore = (not tb.frosted) and rmax > 0.028
    bore_r = 0.42 * r0 * (1 + 0.08 * lump) * (1 - 0.35 * heat)
    bore_ok = r0 > 0.026
    if tb is not TRUNK:
        for k in range(m):
            d, rt = trunk_dist(Vector(C[k]))
            if d < rt * 1.05:
                bore_ok[k] = False
    if has_bore and bore_ok.sum() >= 4:
        idxs = np.nonzero(bore_ok)[0]
        b0, b1 = int(idxs[0]), int(idxs[-1])
        # one continuous run (from the first to the last point with room for it)
        run = np.arange(b0, b1 + 1)
        br = bore_r[run].copy()
        # the bore narrows to nothing at its closed ends (not at an open mouth)
        open_start = tb is TRUNK
        open_end = tb.cut and b1 == m - 1
        nb = len(run)
        ramp = np.ones(nb)
        tl = max(3, min(nb // 3, int(4 * np.mean(br) / max(np.mean(np.diff(s)), 1e-4))))
        if not open_start:
            ramp[:tl] *= np.sin(np.linspace(0, np.pi / 2, tl)) ** 0.7
        if not open_end:
            ramp[-tl:] *= np.sin(np.linspace(np.pi / 2, 0, tl)) ** 0.7
        br = np.maximum(br * ramp, 1e-4)
        wob = 1 + 0.07 * (fbm(tex + 5.3, 2, seed + 51).reshape(m, K)[run] - 0.5)
        XB = C[run][:, None, :] + (br[:, None] * wob)[..., None] * (ct[None, :, None] * N[run][:, None, :] + st[None, :, None] * B[run][:, None, :])
        cob = XB.reshape(-1, 3)
        nbv = len(cob)
        bb = bore_acc.add_vertices(
            cob,
            crust=np.zeros(nbv),
            surf=np.ones(nbv),
            tc=tc.reshape(m, K, 3)[run].reshape(-1, 3),
            arrive=np.repeat(arrive[run], K),
            heat7=np.repeat(heat[run], K),
            rb=np.repeat(r0[run], K),
            kind=np.full(nbv, KIND_CODE[tb.kind]),
            status=np.full(nbv, STATUS_CODE[tb.status]),
            tid=np.full(nbv, float(tb.i)),
        )
        # normals face into the air of the bore: glass -> air, like every other surface here
        bore_acc.add_faces(ring_grid_faces(bb, nb, K, flip=True), 1)
        # mouths: an annulus of glass joining the outer surface to the bore at an open end
        if open_start:
            ann_faces(glass_acc, base + 0, bb + 0, K, outer_first=True, arrive=arrive[0])
        if open_end:
            ann_faces(glass_acc, base + (m - 1) * K, bb + (nb - 1) * K, K, outer_first=False, arrive=arrive[-1])
        close_start = not open_start
        close_end = not open_end
        if close_start:
            bore_acc.add_faces(fan(bore_acc, XB[0].mean(0), bb, K, flip=True, like=bb), 1)
        if close_end:
            bore_acc.add_faces(fan(bore_acc, XB[-1].mean(0), bb + (nb - 1) * K, K, flip=False, like=bb + (nb - 1) * K), 1)
        glass_closed_start = open_start
        glass_closed_end = open_end
    else:
        glass_closed_start = glass_closed_end = False

    # close the outer surface where there is no mouth
    if not glass_closed_start:
        glass_acc.add_faces(fan(glass_acc, C[0], base, K, flip=False, like=base), 0)
    if not glass_closed_end:
        # a clean break is a flat face of glass; a natural tip closes to a point
        tipc = C[-1] + T[-1] * (0.0 if tb.cut else 0.02 * float(r0[-1]))
        glass_acc.add_faces(fan(glass_acc, tipc, base + (m - 1) * K, K, flip=True, like=base + (m - 1) * K, surf=2.0 if tb.cut else 0.0), 2 if tb.cut else 0)


def fan(acc, center, ring_base, K, flip, like, surf=None):
    """A triangle fan from a new center vertex to a ring. Attributes copied from the ring's first vertex."""
    # find attribute values of the ring's first vertex
    attrs = {}
    for name, blocks in acc.attrs.items():
        for b, v in blocks:
            if b <= like < b + len(v):
                val = v[like - b]
                attrs[name] = np.array([val])
                break
    if surf is not None:
        attrs["surf"] = np.array([surf])
    if "crust" in attrs:
        attrs["crust"] = np.array([0.0])
    c = acc.add_vertices(np.array([center]), **attrs)
    k = np.arange(K)
    a = ring_base + k
    b = ring_base + (k + 1) % K
    return np.stack([np.full(K, c), b, a] if not flip else [np.full(K, c), a, b], axis=-1)


def ann_faces(acc, outer_base, inner_base, K, outer_first, arrive):
    """An annulus (glass mouth) between an outer ring and a bore ring."""
    k = np.arange(K)
    o0, o1 = outer_base + k, outer_base + (k + 1) % K
    i0, i1 = inner_base + k, inner_base + (k + 1) % K
    q = np.stack([o0, i0, i1, o1], -1) if outer_first else np.stack([o0, o1, i1, i0], -1)
    acc.add_faces(q, 2)


def build_specimen_meshes(mats):
    # One closed glass body per tube: outer surface (0), bore (1), breaks and mouths (2), bubbles (3). One
    # object per body lets Cycles nest the glass volume correctly (air in the bore, air in each bubble), and
    # lets the film switch each body's volume on only once that fork has finished growing.
    obs = {}
    nb = 0
    for tb in TUBES:
        if getattr(tb, "dummy", False):
            continue
        acc = MeshAcc("tube_%03d" % tb.i)
        tube_surfaces(tb, acc, acc, seed=tb.i * 7 + 3)
        if not acc.faces:
            continue
        nb += add_bubbles_for(tb, acc)
        mset = [mats["frost"], mats["frost"], mats["fracture"], mats["bubble"]] if tb.frosted else [mats["tube"], mats["bore"], mats["fracture"], mats["bubble"]]
        ob = acc.build(mset)
        ob["tube"] = tb.i
        ob["status"] = STATUS_CODE[tb.status]
        ob.color = (STILL_NOW, 1.0, STATUS_CODE[tb.status], 1.0)
        obs[acc.name] = ob
        tb.ob = ob
    log("glass bodies: %d, bubbles: %d" % (len(obs), nb))
    return obs


# ---- beads: each merged change, a drop of glass where the data put it -------------------------------------


def build_beads(mat):
    kd_n = sum(len(tb.C) for tb in TUBES)
    kd = KDTree(kd_n)
    owners = []
    j = 0
    for tb in TUBES:
        for k in range(len(tb.C)):
            kd.insert(tb.C[k], j)
            owners.append((tb, k))
            j += 1
    kd.balance()
    acc = MeshAcc("beads")
    # an icosphere, subdivided twice
    bm_verts, bm_faces = icosphere(2)
    for bi, b in enumerate(SRC["beads"]):
        p = np.array(v3(b["p"]))
        r = float(b["r"])
        best = None
        for co, j, d in kd.find_n(Vector(p), 8):
            tb, k = owners[j]
            score = d - tb.r[k]
            if best is None or score < best[0]:
                best = (score, tb, k)
        _, tb, k = best
        arr = float(tb.arrive[k]) + 0.04
        # a drop fused to the crust: slightly flattened against the glass it sits on
        axis = p - tb.C[k]
        ln = np.linalg.norm(axis)
        axis = axis / ln if ln > 1e-9 else np.array([0, 0, 1.0])
        v = bm_verts.copy()
        along = v @ axis
        v = v - np.outer(along, axis) * 0.18
        co = p + v * r
        n = len(co)
        base = acc.add_vertices(co, arrive=np.full(n, arr), heat7=np.full(n, float(tb.h[k])), rb=np.full(n, r), status=np.full(n, STATUS_CODE[tb.status]), tid=np.full(n, float(tb.i)))
        acc.add_faces(bm_faces + base, 0)
    return acc.build([mat])


def icosphere(sub):
    t = (1 + 5 ** 0.5) / 2
    V = [(-1, t, 0), (1, t, 0), (-1, -t, 0), (1, -t, 0), (0, -1, t), (0, 1, t), (0, -1, -t), (0, 1, -t), (t, 0, -1), (t, 0, 1), (-t, 0, -1), (-t, 0, 1)]
    F = [(0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11), (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8), (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9), (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)]
    V = [np.array(v, dtype=np.float64) / np.linalg.norm(v) for v in V]
    for _ in range(sub):
        cache = {}
        nf = []

        def mid(a, b):
            key = (min(a, b), max(a, b))
            if key not in cache:
                m = (V[a] + V[b]) / 2
                V.append(m / np.linalg.norm(m))
                cache[key] = len(V) - 1
            return cache[key]

        for a, b, c in F:
            ab, bc, ca = mid(a, b), mid(b, c), mid(c, a)
            nf += [(a, ab, ca), (b, bc, ab), (c, ca, bc), (ab, bc, ca)]
        F = nf
    return np.array(V), np.array(F, dtype=np.int64)


# ---- bubbles: air caught in the glass wall ----------------------------------------------------------------


_BUB = icosphere(1)


def add_bubbles_for(tb, acc, density=3200.0):
    bv, bf = _BUB
    rng = np.random.default_rng(11 + tb.i * 131)
    total = 0
    for _once in (0,):
        if tb.frosted:
            continue  # private: nothing inside is shown
        r = tb.r
        ds = np.diff(tb.s, prepend=tb.s[0])
        vol = math.pi * r ** 2 * np.maximum(ds, 0)
        expected = vol * density
        cnt = rng.poisson(expected)
        ks = np.repeat(np.arange(len(r)), cnt)
        if len(ks) == 0:
            continue
        T, N, B = frames_along(tb.C)
        th = rng.random(len(ks)) * 2 * np.pi
        # between the bore wall and the outer glass
        rin = 0.46 * r[ks]
        rout = 0.80 * r[ks]
        rho = np.sqrt(rng.uniform(rin ** 2, rout ** 2))
        # skip bubbles inside the trunk when they belong to a fork's base
        pos = tb.C[ks] + rho[:, None] * (np.cos(th)[:, None] * N[ks] + np.sin(th)[:, None] * B[ks]) + T[ks] * (rng.random(len(ks)) - 0.5)[:, None] * ds[ks, None]
        br = np.minimum(0.18 * (rout - rin), 0.0022 + 0.009 * rng.random(len(ks)) ** 3)
        for j in range(len(ks)):
            if tb is not TRUNK:
                d, rt = trunk_dist(Vector(pos[j]))
                if d < rt * 1.02:
                    continue
            k = ks[j]
            co = pos[j] + bv * br[j]
            n = len(co)
            base = acc.add_vertices(co, arrive=np.full(n, float(tb.arrive[k])), heat7=np.full(n, float(tb.h[k])), rb=np.full(n, float(br[j])), status=np.full(n, STATUS_CODE[tb.status]), tid=np.full(n, float(tb.i)), crust=np.zeros(n), surf=np.full(n, 3.0), tc=co - tb.C[k], kind=np.full(n, KIND_CODE[tb.kind]))
            # inward normals: glass -> air
            acc.add_faces(bf[:, ::-1] + base, 3)
            total += 1
    return total


# ---- the strike: a channel of light down the trunk's own path ----------------------------------------------


def build_bolt(mat):
    rng = np.random.default_rng(1729)
    P = TRUNK.P
    # above the surface: the lightning, from out of frame down to the first point (not glass, not data)
    top = P[0].copy()
    sky = [top + np.array([0.0, 0.0, 9.0])]
    for k in range(1, 9):
        f = k / 9
        sky.append(top + np.array([(rng.random() - 0.5) * 0.9 * (1 - f), (rng.random() - 0.5) * 0.9 * (1 - f), 9.0 * (1 - f)]))
    path = [*sky]
    # below: exactly the trunk's polyline, with the fine zigzag every channel has between its data points
    for i in range(len(P) - 1):
        a, b = P[i], P[i + 1]
        path.append(a)
        seg = b - a
        L = np.linalg.norm(seg)
        for f in (0.33, 0.66):
            j = rng.normal(size=3)
            j -= seg * j.dot(seg) / max(L * L, 1e-9)
            path.append(a + seg * f + j * 0.12 * L)
    path.append(P[-1])
    path = np.array(path)
    seg = np.linalg.norm(np.diff(path, axis=0), axis=1)
    sarc = np.concatenate([[0], np.cumsum(seg)])
    # the bolt's clock runs with depth, so the leader arrives at the surface, then races down the trunk
    zz = path[:, 2]
    sb = np.clip((top[2] + 9.0 - zz) / (9.0 + HGT), 0, 1)
    sb = np.maximum.accumulate(sb)
    K = 8
    T, N, B = frames_along(path)
    th = np.linspace(0, 2 * np.pi, K, endpoint=False)
    rad = 0.012
    X = path[:, None, :] + rad * (np.cos(th)[None, :, None] * N[:, None, :] + np.sin(th)[None, :, None] * B[:, None, :])
    acc = MeshAcc("bolt")
    base = acc.add_vertices(X.reshape(-1, 3), sb=np.repeat(sb, K))
    acc.add_faces(ring_grid_faces(base, len(path), K), 0)
    ob = acc.build([mat])
    ob.visible_shadow = False
    ob.visible_diffuse = False
    return ob


# ---- sparks: the white-hot growing tip of each fork, while it grows ---------------------------------------

SPARK_V, SPARK_F = icosphere(2)


def build_sparks(mat):
    acc = MeshAcc("sparks")
    n = len(TUBES)
    for i in range(n):
        base = acc.add_vertices(SPARK_V * 0.0 + np.array([0, 0, 1000.0]), glow=np.zeros(len(SPARK_V)))
        acc.add_faces(SPARK_F + base, 0)
    ob = acc.build([mat])
    ob.visible_shadow = False
    return ob


def update_sparks(ob, tau):
    me = ob.data
    nv = len(SPARK_V)
    co = np.zeros((len(TUBES) * nv, 3))
    glow = np.zeros(len(TUBES) * nv)
    for i, tb in enumerate(TUBES):
        blk = slice(i * nv, (i + 1) * nv)
        co[blk] = np.array([0, 0, 1000.0]) + SPARK_V * 1e-4
        if tb is TRUNK:
            if TL["fuse0"] <= tau <= TL["fuse1"] + 0.05:
                d = trunk_front_depth(tau)
                # the trunk's front: the point whose arrival is now
                k = int(np.clip(np.searchsorted(tb.arrive, tau), 1, len(tb.C) - 1))
                p, r = tb.C[k], tb.r[k]
                co[blk] = p + SPARK_V * r * 0.78
                glow[blk] = 0.34
            continue
        x = (tau - tb.t0) / tb.grow
        if 0.0 <= x <= 1.0:
            sfrac = float(grow_ease(x))
            p, r = point_at(tb, sfrac * tb.L)
            k = 1.0 - 0.75 * x ** 2
            co[blk] = p + SPARK_V * (r * 1.1 + 0.004)
            glow[blk] = k
    me.vertices.foreach_set("co", co.astype(np.float32).ravel())
    me.attributes["glow"].data.foreach_set("value", glow.astype(np.float32))
    me.update()


# ---- materials ------------------------------------------------------------------------------------------


class NB:
    """A small builder for shader node trees."""

    def __init__(self, nt):
        self.nt = nt
        for n in list(nt.nodes):
            nt.nodes.remove(n)
        self.out = nt.nodes.new("ShaderNodeOutputMaterial") if isinstance(nt.id_data, bpy.types.Material) or True else None

    def n(self, typ, inputs=None, **props):
        node = self.nt.nodes.new(typ)
        for k, v in props.items():
            setattr(node, k, v)
        for key, val in (inputs or {}).items():
            self.set(self.sock_in(node, key), val)
        return node

    @staticmethod
    def sock_in(node, key):
        if isinstance(key, int):
            return node.inputs[key]
        for s in node.inputs:
            if s.identifier == key:
                return s
        return node.inputs[key]

    @staticmethod
    def sock_out(node, key=0):
        if isinstance(key, int):
            return node.outputs[key]
        for s in node.outputs:
            if s.identifier == key:
                return s
        return node.outputs[key]

    def set(self, sock, val):
        if isinstance(val, bpy.types.NodeSocket):
            self.nt.links.new(val, sock)
        elif isinstance(val, bpy.types.Node):
            self.nt.links.new(val.outputs[0], sock)
        else:
            if hasattr(sock, "default_value"):
                dv = sock.default_value
                try:
                    n = len(dv)
                except TypeError:
                    n = 0
                if n and not isinstance(val, (tuple, list)):
                    val = (val,) * n
                if n == 4 and isinstance(val, (tuple, list)) and len(val) == 3:
                    val = (*val, 1.0)
                sock.default_value = val

    def math(self, op, a, b=None, c=None, clamp=False):
        m = self.n("ShaderNodeMath", operation=op, use_clamp=clamp)
        self.set(m.inputs[0], a)
        if b is not None:
            self.set(m.inputs[1], b)
        if c is not None:
            self.set(m.inputs[2], c)
        return m.outputs[0]

    def vmath(self, op, a, b=None, scale=None):
        m = self.n("ShaderNodeVectorMath", operation=op)
        self.set(m.inputs[0], a)
        if b is not None:
            self.set(m.inputs[1], b)
        if scale is not None:
            self.set(m.inputs["Scale"], scale)
        return m.outputs[1] if op in ("DOT_PRODUCT", "LENGTH", "DISTANCE") else m.outputs[0]

    def attr(self, name, kind="GEOMETRY"):
        return self.n("ShaderNodeAttribute", attribute_type=kind, attribute_name=name)

    def fac(self, name, kind="GEOMETRY"):
        return self.attr(name, kind).outputs["Fac"]

    def vec(self, name):
        return self.attr(name).outputs["Vector"]

    def mixc(self, fac, a, b, blend="MIX"):
        m = self.n("ShaderNodeMix", data_type="RGBA", blend_type=blend)
        self.set(self.sock_in(m, "Factor_Float"), fac)
        self.set(self.sock_in(m, "A_Color"), a)
        self.set(self.sock_in(m, "B_Color"), b)
        return self.sock_out(m, "Result_Color")

    def mixf(self, fac, a, b):
        m = self.n("ShaderNodeMix", data_type="FLOAT")
        self.set(self.sock_in(m, "Factor_Float"), fac)
        self.set(self.sock_in(m, "A_Float"), a)
        self.set(self.sock_in(m, "B_Float"), b)
        return self.sock_out(m, "Result_Float")

    def mixs(self, fac, a, b):
        m = self.n("ShaderNodeMixShader")
        self.set(m.inputs[0], fac)
        self.set(m.inputs[1], a)
        self.set(m.inputs[2], b)
        return m.outputs[0]

    def adds(self, a, b):
        m = self.n("ShaderNodeAddShader")
        self.set(m.inputs[0], a)
        self.set(m.inputs[1], b)
        return m.outputs[0]

    def maprange(self, x, a, b, c=0.0, d=1.0, interp="SMOOTHSTEP"):
        m = self.n("ShaderNodeMapRange", interpolation_type=interp, clamp=True)
        self.set(m.inputs["Value"], x)
        self.set(m.inputs["From Min"], a)
        self.set(m.inputs["From Max"], b)
        self.set(m.inputs["To Min"], c)
        self.set(m.inputs["To Max"], d)
        return m.outputs["Result"]

    def rgb(self, c):
        n = self.n("ShaderNodeRGB")
        n.outputs[0].default_value = (*c, 1.0) if len(c) == 3 else c
        return n.outputs[0]

    def value(self, v):
        n = self.n("ShaderNodeValue")
        n.outputs[0].default_value = v
        return n.outputs[0]

    def blackbody(self, temp):
        b = self.n("ShaderNodeBlackbody")
        self.set(b.inputs["Temperature"], temp)
        return b.outputs[0]

    def cscale(self, col, s):
        m = self.n("ShaderNodeVectorMath", operation="SCALE")
        self.set(m.inputs[0], col)
        self.set(m.inputs["Scale"], s)
        return m.outputs[0]

    def output(self, surface, displacement=None):
        self.set(self.out.inputs["Surface"], surface)
        if displacement is not None:
            self.set(self.out.inputs["Displacement"], displacement)


def new_material(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    return m, NB(m.node_tree)


# Look parameters, gathered so a later pass can tune them in one place.
LOOK = {
    "glass_tint": (0.905, 0.958, 0.93),
    "glass_tint_shipped": (0.86, 0.94, 0.905),
    "glass_tint_live": (0.965, 0.988, 0.975),
    "glass_rough": 0.035,
    "glass_ior": 1.46,  # lechatelierite: fused quartz
    "bead_ior": 1.52,
    "grain": 0.0048,  # sand grain size, world units
    "clump": 0.028,  # grains fused into clumps
    "fuse_strength": 7.0,
    "fuse_decay": 0.22,  # seconds: how fast the fusing flash fades...
    "fuse_cool": 0.30,  # ...and cools through the blackbody
    "heat_strength": 2.4,
    "heat_k0": 1500.0,  # colour temperature of the faintest heat...
    "heat_k1": 2150.0,  # ...and of the hottest tip: orange, the site's --heat
    "vol_density": 5.0,  # the glass is milky with micro-bubbles: light scatters inside it
    "vol_color": (0.93, 0.96, 0.94),
    "vol_absorb": (0.86, 0.93, 0.89),
    "live_glow": 0.14,  # live glass is brighter: a faint light of its own, in the glass colour, never the heat
    "live_vol": 0.4,  # ...and clearer: 40% of the milk
    "ship_vol": 1.15,
    "bead_glow": 0.3,
    "glaze_scale": 0.09,
    "frost_tint": (0.86, 0.89, 0.87),
    "frost_rough": 0.46,
    "frost_coat": 0.0,
    "frost_vol": 9.0,
    "glaze_min": 0.0,
    "glaze_max": 0.75,
    "back_power": 4200.0,
    "key_power": 1900.0,
    "key_height": 11.0,
    "key_spread": 70.0,
    # bloom belongs to light sources (heat, the strike, sparks), not to glass highlights
    "bloom_threshold": 0.25,  # on the emission pass: every light source glows a little
    "bloom_strength": 0.7,
    "bloom_size": 0.62,
}


for _k, _v in os.environ.items():
    # look overrides for lookdev: FULG_LOOK_heat_strength=6 etc.
    if _k.startswith("FULG_LOOK_") and _k[10:] in LOOK:
        LOOK[_k[10:]] = type(LOOK[_k[10:]])(float(_v)) if not isinstance(LOOK[_k[10:]], tuple) else tuple(float(x) for x in _v.split(","))


def obj_clock(g):
    """Per-object values carried in the object's colour (a constant Cycles updates without touching the
    mesh): R = the film clock, G = the glass volume gate, B = the body's status code (0 none, 1 shipped, 2 live)."""
    oi = g.n("ShaderNodeObjectInfo")
    return g.n("ShaderNodeSeparateColor", inputs={"Color": oi.outputs["Color"]}).outputs


def time_nodes(g):
    """(visible, age) from the object's clock and the vertex's arrival."""
    now = obj_clock(g)[0]
    arr = g.fac("arrive")
    age = g.math("SUBTRACT", now, arr)
    vis = g.math("GREATER_THAN", age, -1e-4)
    return vis, age


def glow_color(g, age, heat, fuse_scale=1.0, heat_scale=1.0):
    """Emission: the fusing flash as a point first turns to glass, cooling through the blackbody; then the
    steady heat of the last seven days at the live tips."""
    agec = g.math("MAXIMUM", age, 0.0)
    fuse_e = g.math("MULTIPLY", g.math("EXPONENT", g.math("DIVIDE", agec, -LOOK["fuse_decay"])), LOOK["fuse_strength"] * fuse_scale)
    fuse_t = g.math("ADD", g.math("MULTIPLY", g.math("EXPONENT", g.math("DIVIDE", agec, -LOOK["fuse_cool"])), 3000.0), 1300.0)
    heat_e = g.math("MULTIPLY", g.math("POWER", g.math("MAXIMUM", heat, 0.0), 1.4), LOOK["heat_strength"] * heat_scale)
    heat_t = g.math("ADD", g.math("MULTIPLY", heat, LOOK["heat_k1"] - LOOK["heat_k0"]), LOOK["heat_k0"])
    c1 = g.cscale(g.blackbody(fuse_t), fuse_e)
    c2 = g.cscale(g.blackbody(heat_t), heat_e)
    g.last_hot = g.math("MINIMUM", g.math("MULTIPLY", fuse_e, 0.45), 1.0)
    return g.vmath("ADD", c1, c2)


def glass_bsdf(g, status, rough_extra=None, tint_mul=1.0, ior=None, normal=None):
    st = status
    is_ship = g.math("COMPARE", st, 1.0, 0.5)
    is_live = g.math("COMPARE", st, 2.0, 0.5)
    tint = g.mixc(is_ship, g.rgb(LOOK["glass_tint"]), g.rgb(LOOK["glass_tint_shipped"]))
    tint = g.mixc(is_live, tint, g.rgb(LOOK["glass_tint_live"]))
    if tint_mul != 1.0:
        tint = g.cscale(tint, tint_mul)
    rough = g.mixf(g.math("MAXIMUM", is_ship, is_live), LOOK["glass_rough"], 0.012)
    if rough_extra is not None:
        rough = g.math("ADD", rough, rough_extra)
    p = g.n("ShaderNodeBsdfPrincipled", inputs={"Base Color": tint, "Roughness": rough, "Transmission Weight": 1.0, "IOR": ior or LOOK["glass_ior"], "Specular IOR Level": 0.5})
    if normal is not None:
        g.set(p.inputs["Normal"], normal)
    return p.outputs[0], is_live


def glass_volume(g, frosted=False):
    """The milk of the glass. Gated per body: off until that body has finished forming, so nothing shows
    before the strike reaches it. Kept homogeneous (no spatial inputs) so Cycles samples it analytically."""
    d = LOOK["frost_vol"] if frosted else LOOK["vol_density"]
    oc = obj_clock(g)
    volon, st = oc[1], oc[2]
    # status, per body: live glass is clearer (a thinner milk), shipped glass a little denser
    k_live = g.math("COMPARE", st, 2.0, 0.5)
    k_ship = g.math("COMPARE", st, 1.0, 0.5)
    stat_k = g.math("ADD", g.math("SUBTRACT", 1.0, g.math("MULTIPLY", k_live, 1.0 - LOOK["live_vol"])), g.math("MULTIPLY", k_ship, LOOK["ship_vol"] - 1.0))
    dens = g.math("MULTIPLY", g.math("MULTIPLY", volon, stat_k), d)
    v = g.n("ShaderNodeVolumePrincipled", inputs={"Color": (0.95, 0.96, 0.95) if frosted else LOOK["vol_color"], "Density": dens, "Anisotropy": 0.25, "Absorption Color": LOOK["vol_absorb"]})
    return v.outputs[0]


def crust_and_mask(g, tc, crust_attr, geo):
    """The sand crust shader, and the mask (0 glass .. 1 crust) that decides where it lies."""
    tc = g.n("ShaderNodeTexCoord").outputs["Object"]  # isotropic: no stretching on tight bends
    # sand grains: a Voronoi field on the tube's own surface coordinates
    vor = g.n("ShaderNodeTexVoronoi", voronoi_dimensions="3D", feature="F1", inputs={"Vector": tc, "Scale": 1.0 / LOOK["grain"], "Randomness": 0.9})
    gd = vor.outputs["Distance"]
    gc = vor.outputs["Color"]
    gsep = g.n("ShaderNodeSeparateColor", inputs={"Color": gc})
    grand = gsep.outputs[0]
    grand2 = gsep.outputs[1]
    ghei = g.math("POWER", g.math("SUBTRACT", 1.0, g.math("MINIMUM", g.math("MULTIPLY", gd, 1.6), 1.0)), 0.7)
    fine = g.n("ShaderNodeTexNoise", inputs={"Vector": tc, "Scale": 0.35 / LOOK["grain"], "Detail": 3.0, "Roughness": 0.6})
    mott = g.n("ShaderNodeTexNoise", inputs={"Vector": tc, "Scale": 9.0, "Detail": 4.0, "Roughness": 0.55})
    clump = g.n("ShaderNodeTexVoronoi", voronoi_dimensions="3D", feature="SMOOTH_F1", inputs={"Vector": tc, "Scale": 1.0 / LOOK["clump"], "Smoothness": 0.6})
    chei = g.maprange(clump.outputs["Distance"], 0.0, 0.75, 1.0, 0.0)

    # crust edge: sharpen the vertex mask and fray it with the grains so flakes have ragged edges
    edge = g.math("ADD", crust_attr, g.math("MULTIPLY", g.math("SUBTRACT", g.math("MULTIPLY", ghei, 0.6), g.math("MULTIPLY", fine.outputs["Fac"], 0.4)), 0.34))
    cm = g.maprange(edge, 0.42, 0.62)

    # sand colour: tan grains, cream grains, a few dark and a few clear quartz, mottled
    lum = 0.2126 * SAND[0] + 0.7152 * SAND[1] + 0.0722 * SAND[2]
    sand = g.rgb(tuple((0.8 * c + 0.2 * lum) * 0.88 for c in SAND))
    cream = g.rgb((0.64, 0.585, 0.48))
    dark = g.rgb((0.07, 0.058, 0.046))
    quartz = g.rgb((0.74, 0.735, 0.71))
    col = g.mixc(g.maprange(grand, 0.50, 0.62), sand, cream)
    col = g.mixc(g.maprange(grand, 0.80, 0.84), col, dark)
    col = g.mixc(g.maprange(grand, 0.90, 0.93), col, quartz)
    col = g.mixc(g.maprange(mott.outputs["Fac"], 0.3, 0.75, 0.0, 1.0), g.cscale(col, 0.62), col)
    crev = g.maprange(ghei, 0.0, 0.7, 0.35, 1.0)
    col = g.cscale(col, crev)
    col = g.cscale(col, g.maprange(chei, 0.0, 1.0, 0.72, 1.05))
    bump_h = g.math("ADD", g.math("ADD", g.math("MULTIPLY", ghei, 1.0), g.math("MULTIPLY", fine.outputs["Fac"], 0.35)), g.math("MULTIPLY", chei, 4.0))
    bump = g.n("ShaderNodeBump", inputs={"Height": bump_h, "Strength": 0.8, "Distance": LOOK["grain"] * 0.45})
    # the glaze: where the sand melted further, grains sit under a skin of glass
    glz = g.n("ShaderNodeTexNoise", inputs={"Vector": tc, "Scale": 1.0 / LOOK["glaze_scale"], "Detail": 3.0, "Roughness": 0.55})
    glaze = g.maprange(glz.outputs["Fac"], 0.38, 0.68, LOOK["glaze_min"], LOOK["glaze_max"])
    crust = g.n("ShaderNodeBsdfPrincipled", inputs={"Base Color": col, "Roughness": 0.86, "Specular IOR Level": 0.3, "Normal": bump.outputs[0], "Diffuse Roughness": 0.6,
                                                     "Coat Weight": glaze, "Coat Roughness": 0.07, "Coat IOR": 1.5, "Coat Tint": (0.95, 0.98, 0.96)})
    # glints: quartz grains are tiny facets of glass; each catches the light at its own angle
    facet = g.vmath("NORMALIZE", g.vmath("ADD", geo.outputs["Normal"], g.vmath("SCALE", g.vmath("SUBTRACT", gc, (0.5, 0.5, 0.5)), scale=1.5)))
    glint = g.n("ShaderNodeBsdfGlossy", inputs={"Color": (1.0, 0.98, 0.95), "Roughness": 0.12, "Normal": facet})
    gl_mask = g.math("MULTIPLY", g.maprange(grand2, 0.94, 0.96), 0.35)
    crust_s = g.mixs(gl_mask, crust.outputs[0], glint.outputs[0])

    return crust_s, cm


def body_material(name, frosted):
    """One glass body: fused sand crust over glass, clear for public work, etched for private work."""
    m, g = new_material(name)
    vis, age = time_nodes(g)
    heat = g.fac("heat7")
    status = g.fac("status")
    tc = g.vec("tc")
    crust_attr = g.fac("crust")
    geo = g.n("ShaderNodeNewGeometry")
    crust_s, cm = crust_and_mask(g, tc, crust_attr, geo)
    if frosted:
        # private work: the glass is etched. You can see it exists, not inside it.
        is_live = g.math("COMPARE", status, 2.0, 0.5)
        etch = g.n("ShaderNodeTexNoise", inputs={"Vector": tc, "Scale": 420.0, "Detail": 2.0})
        ebump = g.n("ShaderNodeBump", inputs={"Height": etch.outputs["Fac"], "Strength": 0.25, "Distance": 0.002})
        fr = g.n("ShaderNodeBsdfPrincipled", inputs={"Base Color": LOOK["frost_tint"], "Roughness": g.mixf(is_live, LOOK["frost_rough"], LOOK["frost_rough"] * 0.7), "Transmission Weight": 1.0, "IOR": LOOK["glass_ior"], "Normal": ebump.outputs[0], "Specular IOR Level": 0.5,
                                                      "Coat Weight": LOOK["frost_coat"], "Coat Roughness": 0.18})
        glass_s = fr.outputs[0]
    else:
        # fused glass beneath: smooth, with the slight ripple of glass that cooled fast
        ripple = g.n("ShaderNodeTexNoise", inputs={"Vector": tc, "Scale": 55.0, "Detail": 2.0})
        gbump = g.n("ShaderNodeBump", inputs={"Height": ripple.outputs["Fac"], "Strength": 0.18, "Distance": 0.004})
        glass_s, is_live = glass_bsdf(g, status, normal=gbump.outputs[0])
    surf = g.mixs(cm, glass_s, crust_s)
    em = glow_color(g, age, heat)
    # while it is fusing, the glass is its own light: the lit surface gives way to the glow
    surf = g.mixs(g.last_hot, surf, g.n("ShaderNodeEmission", inputs={"Color": (0, 0, 0), "Strength": 0.0}).outputs[0])
    em = g.cscale(em, g.mixf(cm, 1.0, 0.75))
    live_glow = g.cscale(g.rgb(GLASS), g.math("MULTIPLY", g.math("MULTIPLY", is_live, LOOK["live_glow"]), g.math("SUBTRACT", 1.0, cm)))
    em = g.vmath("ADD", em, live_glow)
    emis = g.n("ShaderNodeEmission", inputs={"Color": em, "Strength": 1.0})
    shaded = g.adds(surf, emis.outputs[0])
    transp = g.n("ShaderNodeBsdfTransparent")
    g.output(g.mixs(vis, transp.outputs[0], shaded))
    g.set(g.out.inputs["Volume"], glass_volume(g, frosted=frosted))
    return m


def make_materials():
    mats = {}

    mats["tube"] = body_material("tube", frosted=False)
    mats["frost"] = body_material("frost", frosted=True)

    # ---- a clean break, and the open mouth at the surface: polished glass, a lighter face ----------------
    m, g = new_material("fracture")
    vis, age = time_nodes(g)
    heat = g.fac("heat7")
    status = g.fac("status")
    glass_s, _ = glass_bsdf(g, status, rough_extra=-0.02, tint_mul=1.02)
    em = glow_color(g, age, heat)
    emis = g.n("ShaderNodeEmission", inputs={"Color": em})
    transp = g.n("ShaderNodeBsdfTransparent")
    g.output(g.mixs(vis, transp.outputs[0], g.adds(glass_s, emis.outputs[0])))
    g.set(g.out.inputs["Volume"], glass_volume(g))
    mats["fracture"] = m

    # ---- the bore: the hollow core's glass wall, pitted by bubbles that burst into it -------------------
    m, g = new_material("bore")
    vis, age = time_nodes(g)
    heat = g.fac("heat7")
    status = g.fac("status")
    tc = g.vec("tc")
    pits = g.n("ShaderNodeTexVoronoi", voronoi_dimensions="3D", feature="F1", inputs={"Vector": tc, "Scale": 60.0})
    ph = g.maprange(pits.outputs["Distance"], 0.0, 0.35, 0.0, 1.0)
    pb = g.n("ShaderNodeBump", inputs={"Height": ph, "Strength": 0.35, "Distance": 0.003})
    glass_s, _ = glass_bsdf(g, status, rough_extra=-0.015, normal=pb.outputs[0])
    em = glow_color(g, age, heat, fuse_scale=1.2, heat_scale=1.35)
    emis = g.n("ShaderNodeEmission", inputs={"Color": em})
    transp = g.n("ShaderNodeBsdfTransparent")
    g.output(g.mixs(vis, transp.outputs[0], g.adds(glass_s, emis.outputs[0])))
    g.set(g.out.inputs["Volume"], glass_volume(g))
    mats["bore"] = m

    # ---- bubbles: air in glass (the geometry's normals point into the air) ------------------------------
    m, g = new_material("bubble")
    vis, age = time_nodes(g)
    p = g.n("ShaderNodeBsdfPrincipled", inputs={"Base Color": (1, 1, 1), "Roughness": 0.0, "Transmission Weight": 1.0, "IOR": LOOK["glass_ior"]})
    transp = g.n("ShaderNodeBsdfTransparent")
    g.output(g.mixs(vis, transp.outputs[0], p.outputs[0]))
    g.set(g.out.inputs["Volume"], glass_volume(g))
    mats["bubble"] = m

    # ---- beads: merged changes, drops of clear glass that flash as they form ----------------------------
    m, g = new_material("bead")
    vis, age = time_nodes(g)
    heat = g.fac("heat7")
    p = g.n("ShaderNodeBsdfPrincipled", inputs={"Base Color": (0.95, 0.985, 0.965), "Roughness": 0.0, "Transmission Weight": 1.0, "IOR": LOOK["bead_ior"]})
    agec = g.math("MAXIMUM", age, 0.0)
    pop = g.math("MULTIPLY", g.math("EXPONENT", g.math("DIVIDE", agec, -0.11)), 40.0)
    popc = g.cscale(g.blackbody(4200.0), pop)
    em = g.vmath("ADD", popc, glow_color(g, age, heat, fuse_scale=0.0, heat_scale=1.2))
    em = g.vmath("ADD", em, g.cscale(g.rgb(GLASS), LOOK["bead_glow"]))
    emis = g.n("ShaderNodeEmission", inputs={"Color": em})
    transp = g.n("ShaderNodeBsdfTransparent")
    g.output(g.mixs(vis, transp.outputs[0], g.adds(p.outputs[0], emis.outputs[0])))
    mats["bead"] = m

    # ---- the bolt: the strike's light, down the trunk's path ---------------------------------------------
    m, g = new_material("bolt")
    sb = g.fac("sb")
    oc = obj_clock(g)
    lead, power, tipb = oc[0], oc[1], oc[2]
    shown = g.math("LESS_THAN", sb, lead)
    near = g.math("EXPONENT", g.math("DIVIDE", g.math("MAXIMUM", g.math("SUBTRACT", lead, sb), 0.0), -0.03))
    strength = g.math("MULTIPLY", g.math("ADD", power, g.math("MULTIPLY", near, tipb)), shown)
    emis = g.n("ShaderNodeEmission", inputs={"Color": STRIKE, "Strength": strength})
    transp = g.n("ShaderNodeBsdfTransparent")
    g.output(g.mixs(g.math("MINIMUM", g.math("MULTIPLY", strength, 50.0), 1.0), transp.outputs[0], emis.outputs[0]))
    mats["bolt"] = m

    # ---- sparks: the white-hot growing tip of a fork -----------------------------------------------------
    m, g = new_material("spark")
    glow = g.fac("glow")
    emis = g.n("ShaderNodeEmission", inputs={"Color": g.blackbody(g.math("ADD", g.math("MULTIPLY", glow, 3200.0), 1800.0)), "Strength": g.math("MULTIPLY", g.math("POWER", glow, 1.5), 28.0)})
    transp = g.n("ShaderNodeBsdfTransparent")
    g.output(g.mixs(g.math("GREATER_THAN", glow, 0.001), transp.outputs[0], emis.outputs[0]))
    mats["spark"] = m
    return mats


# ---- world, ground and light ------------------------------------------------------------------------------


def calibrate_ground(scene):
    """Find the scene-linear colour that the view transform maps exactly to the site's --ground (#0d0c0a),
    so the film sits on the page with no visible edge. Searched through the real transform, not assumed."""
    target = np.array([int(GROUND_HEX[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float64)
    guess = np.array(srgb(GROUND_HEX))
    tmp = os.path.join(bpy.app.tempdir or "/tmp", "fulgurite_calib.png")
    lo, hi = guess * 0.25, guess * 4.0
    best = guess
    for it in range(3):
        n = 16
        grid = [np.geomspace(max(lo[c], 1e-5), hi[c], n) for c in range(3)]
        R, G, B = np.meshgrid(grid[0], grid[1], grid[2], indexing="ij")
        cand = np.stack([R.ravel(), G.ravel(), B.ravel()], 1)
        side = 64
        img = bpy.data.images.new("calib", side, side, float_buffer=True, alpha=False)
        img.colorspace_settings.name = "Linear Rec.709"
        px = np.ones((side * side, 4))
        px[: len(cand), :3] = cand
        img.pixels.foreach_set(px.ravel().astype(np.float32))
        img.save_render(tmp, scene=scene)
        bpy.data.images.remove(img)
        back = bpy.data.images.load(tmp, check_existing=False)
        out = np.array(back.pixels[:]).reshape(-1, 4)[: len(cand), :3] * 255.0
        bpy.data.images.remove(back)
        # pixels come back bottom-up in the same order they were written
        err = np.abs(out - target).sum(1) + 1e-3 * np.abs(np.log(cand / guess)).sum(1)
        k = int(np.argmin(err))
        best = cand[k]
        lo, hi = best * 0.8, best * 1.25
        if np.abs(np.round(out[k]) - target).max() == 0 and it >= 1:
            break
    log("ground calibrated: linear", np.round(best, 6), "->", np.round(out[k], 2))
    return tuple(float(x) for x in best)


def make_world(scene, ground):
    w = bpy.data.worlds.new("night")
    try:
        w.use_nodes = True
    except Exception:
        pass
    g = NB(w.node_tree)
    g.nt.nodes.remove(g.out)
    out = g.n("ShaderNodeOutputWorld")
    lp = g.n("ShaderNodeLightPath")
    # what the glass reflects and refracts: a dark studio with a faint warm floor-glow and cool sky
    tcoord = g.n("ShaderNodeTexCoord")
    sep = g.n("ShaderNodeSeparateXYZ", inputs={"Vector": tcoord.outputs["Generated"]})
    gen_z = g.math("MULTIPLY_ADD", sep.outputs[2], 1.0, 0.0)
    env = g.mixc(g.maprange(gen_z, 0.25, 0.95), g.rgb(tuple(c * 1.2 for c in ground)), g.rgb((0.03, 0.032, 0.037)))
    bg_env = g.n("ShaderNodeBackground", inputs={"Color": env, "Strength": 1.0})
    bg_cam = g.n("ShaderNodeBackground", inputs={"Color": ground, "Strength": 1.0})
    mix = g.mixs(lp.outputs["Is Camera Ray"], bg_env.outputs[0], bg_cam.outputs[0])
    g.set(out.inputs["Surface"], mix)
    scene.world = w
    return w


def area_light(name, loc, target, power, size, size_y=None, color=(1, 1, 1), shape="RECTANGLE", spread=None):
    li = bpy.data.lights.new(name, "AREA")
    li.energy = power
    li.shape = shape
    li.size = size
    if size_y is not None:
        li.size_y = size_y
    li.color = color
    if spread is not None:
        li.spread = spread
    ob = bpy.data.objects.new(name, li)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    ob.visible_camera = False
    bpy.context.scene.collection.objects.link(ob)
    if LIGHT_RIG is not None:
        ob.parent = LIGHT_RIG
    return ob


LIGHT_RIG = None


def kelvin(k):
    """Approximate blackbody RGB (linear) for a light's colour, normalised to max 1."""
    t = k / 100.0
    r = 255 if t <= 66 else 329.698727446 * (t - 60) ** -0.1332047592
    gg = 99.4708025861 * math.log(t) - 161.1195681661 if t <= 66 else 288.1221695283 * (t - 60) ** -0.0755148492
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    c = [max(0, min(255, x)) / 255 for x in (r, gg, b)]
    c = [x ** 2.2 for x in c]
    mx = max(c)
    return tuple(x / mx for x in c)


def make_lights(rig, center):
    """Lights live on a rig centred on the specimen; the rig turns with the camera so the look holds all the
    way round the turn."""
    global LIGHT_RIG
    LIGHT_RIG = bpy.data.objects.new("light_rig", None)
    LIGHT_RIG.location = center
    bpy.context.scene.collection.objects.link(LIGHT_RIG)
    center = (0.0, 0.0, 0.0)
    cx, cy, cz = center
    L = {}
    if rig == "stand":
        # key: warm, soft, high and to the left, raking across the crust so the grains read
        # key: high above the front-left, so it falls off down the specimen: the old glass is lit, the tip
        # lives by its own heat
        L["key"] = area_light("key", (cx - 6.5, cy - 7.5, cz + LOOK["key_height"]), (cx, cy, cz + 1.5), LOOK["key_power"], 3.0, 4.0, kelvin(4300), spread=math.radians(LOOK["key_spread"]))
        # two tall strips behind: the glass's edges, the lines that say "glass" on a dark ground
        L["rimL"] = area_light("rimL", (cx - 7.0, cy + 7.5, cz), (cx, cy, cz), 2300, 0.8, 18.0, kelvin(6200))
        L["rimR"] = area_light("rimR", (cx + 7.5, cy + 6.0, cz + 1.0), (cx, cy, cz), 2100, 0.8, 18.0, kelvin(5200))
        # a soft top light, like a case light in a museum
        L["top"] = area_light("top", (cx + 1.0, cy - 1.5, cz + 11.0), (cx, cy, cz + 4.0), 900, 5.0, 5.0, kelvin(4300))
        # low warm fill from the front, so the shadow side of the crust keeps its colour
        L["fill"] = area_light("fill", (cx + 7.0, cy - 11.0, cz - 5.0), (cx, cy, cz - 1.0), 260, 8.0, 8.0, kelvin(3300))
        # a broad, dim sweep behind: what the glass is seen against, so it glows instead of going black
        L["back"] = area_light("back", (cx + 1.5, cy + 12.0, cz + 1.5), (cx, cy, cz), LOOK["back_power"], 9.0, 22.0, kelvin(5400))
        L["backlow"] = area_light("backlow", (cx - 3.0, cy + 9.0, cz - 7.5), (cx, cy, cz - 3.0), LOOK["back_power"] * 0.35, 8.0, 4.0, kelvin(3400))
        # the strike's flash (off unless the film lights it)
        L["flash"] = area_light("flash", (cx - 2.0, cy - 4.0, cz + 12.0), (cx, cy, cz + 2.0), 0.0, 6.0, 6.0, (0.86, 0.9, 1.0))
    elif rig == "print":
        L["key"] = area_light("key", (cx + 7.0, cy - 7.0, cz + LOOK["key_height"]), (cx, cy, cz + 1.5), LOOK["key_power"] * 1.15, 3.0, 4.0, kelvin(4200), spread=math.radians(LOOK["key_spread"]))
        L["rimL"] = area_light("rimL", (cx - 7.5, cy + 6.5, cz + 0.5), (cx, cy, cz), 3200, 0.8, 18.0, kelvin(7000))
        L["rimR"] = area_light("rimR", (cx + 7.0, cy + 7.0, cz + 1.0), (cx, cy, cz), 1500, 0.8, 18.0, kelvin(5000))
        L["top"] = area_light("top", (cx - 1.0, cy - 1.0, cz + 11.0), (cx, cy, cz + 4.0), 700, 5.0, 5.0, kelvin(4300))
        L["fill"] = area_light("fill", (cx - 8.0, cy - 10.0, cz - 4.0), (cx, cy, cz - 1.0), 110, 8.0, 8.0, kelvin(3300))
        L["back"] = area_light("back", (cx - 1.0, cy + 12.0, cz + 1.5), (cx, cy, cz), LOOK["back_power"] * 1.1, 9.0, 22.0, kelvin(5400))
        L["backlow"] = area_light("backlow", (cx + 3.0, cy + 9.0, cz - 7.5), (cx, cy, cz - 3.0), LOOK["back_power"] * 0.35, 8.0, 4.0, kelvin(3400))
    else:  # "drawer": the specimen lies on its side, lit from above like a museum drawer
        L["top"] = area_light("top", (cx - 1.0, cy - 2.0, cz + 9.0), (cx, cy, cz), 3000, 10.0, 3.0, kelvin(4000))
        L["key"] = area_light("key", (cx - 9.0, cy - 7.0, cz + 5.0), (cx, cy, cz), 1500, 4.0, 4.0, kelvin(3500))
        L["rimB"] = area_light("rimB", (cx + 0.5, cy + 8.0, cz + 2.5), (cx, cy, cz), 3400, 18.0, 0.7, kelvin(6000))
        # behind and a little below the drawer's plane: what the glass refracts toward the lens
        L["back"] = area_light("back", (cx + 1.0, cy + 11.0, cz - 2.5), (cx, cy, cz), LOOK["back_power"] * 0.9, 20.0, 6.0, kelvin(5400))
        L["rimR"] = area_light("rimR", (cx + 10.0, cy + 3.0, cz + 1.0), (cx, cy, cz), 900, 0.8, 6.0, kelvin(5200))
        L["fill"] = area_light("fill", (cx + 4.0, cy - 10.0, cz - 3.0), (cx, cy, cz), 220, 10.0, 6.0, kelvin(3300))
        L["flash"] = area_light("flash", (cx, cy, cz + 12.0), (cx, cy, cz), 0.0, 6.0, 6.0, (0.86, 0.9, 1.0))
    return L


# ---- camera -----------------------------------------------------------------------------------------------


def bbox():
    lo = np.full(3, 1e9)
    hi = np.full(3, -1e9)
    for tb in TUBES:
        if getattr(tb, "dummy", False):
            continue
        lo = np.minimum(lo, (tb.C - tb.r[:, None]).min(0))
        hi = np.maximum(hi, (tb.C + tb.r[:, None]).max(0))
    return lo, hi


BB_LO, BB_HI = bbox()
CENTER = ((BB_LO[0] + BB_HI[0]) / 2, (BB_LO[1] + BB_HI[1]) / 2, (BB_LO[2] + BB_HI[2]) / 2)
FULL_H = float(BB_HI[2] - BB_LO[2])


def make_camera(scene):
    cam = bpy.data.cameras.new("cam")
    cam.sensor_fit = "VERTICAL"
    cam.sensor_height = 24.0
    cam.clip_start = 0.05
    cam.clip_end = 500.0
    ob = bpy.data.objects.new("cam", cam)
    scene.collection.objects.link(ob)
    scene.camera = ob
    return ob


def set_vfov(cam, vfov_deg):
    cam.data.lens = 12.0 / math.tan(math.radians(vfov_deg) / 2)


def orbit_pos(center, dist, az, el):
    return Vector((center[0] + dist * math.cos(el) * math.sin(az), center[1] - dist * math.cos(el) * math.cos(az), center[2] + dist * math.sin(el)))


RIG_FOLLOWS = True


def aim(cam, pos, target, roll_deg=0.0):
    if LIGHT_RIG is not None and RIG_FOLLOWS:
        c = LIGHT_RIG.location
        LIGHT_RIG.rotation_euler = (0.0, 0.0, math.atan2(pos[0] - c[0], -(pos[1] - c[1])))
    cam.location = pos
    q = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y")
    if roll_deg:
        q = q @ Matrix.Rotation(math.radians(roll_deg), 4, "Z").to_quaternion()
    cam.rotation_euler = q.to_euler()


FILM_VFOV = 27.0
FILM_AZ0 = math.radians(-18.0)  # where the film's turn starts


def _omega(tau):
    # the turn: brisk while the glass forms, settling to a slow museum turn (degrees per second)
    return lerp(12.0, 5.5, smootherstep(TL["settle0"] - 0.6, TL["settle1"] + 0.6, tau))


_OT = np.linspace(0, 40, 40001)
_OA = np.concatenate([[0], np.cumsum([_omega(t) * 0.001 for t in _OT[1:]])])


def film_camera_pose(tau, portrait):
    push = smootherstep(0.85, 2.6, tau)
    settle = smootherstep(TL["settle0"], TL["settle1"], tau)
    full = FULL_H * 1.13
    close = full * (0.62 if portrait else 0.58)
    fh = lerp(lerp(full * 1.04, close, push), full, settle)
    zmid = CENTER[2]
    front_z = BB_HI[2] - (BB_HI[2] - BB_LO[2]) * trunk_front_depth(tau)
    zf = clamp(front_z + 0.1 * close, BB_LO[2] + close / 2 - 0.35, BB_HI[2] - close / 2 + 0.35)
    tz = lerp(lerp(zmid, zf, push), zmid, settle)
    az = FILM_AZ0 + math.radians(float(np.interp(tau, _OT, _OA)))
    el = math.radians(lerp(lerp(-3.0, 1.0, push), 2.5, settle))
    dist = (fh / 2) / math.tan(math.radians(FILM_VFOV) / 2)
    target = (CENTER[0], CENTER[1], tz)
    return orbit_pos(target, dist, az, el), target


def fit_dist_threejs():
    """The browser's own framing (components/specimen/Specimen.tsx): fov 30, fitDist from the bounding box."""
    sy = FULL_H * 1.02  # the browser's crust roughness adds a little to the box
    sx = float(BB_HI[0] - BB_LO[0]) * 1.02
    return (max(sy * 0.55, sx * 0.75) / math.tan(math.radians(15))) * 1.02


# ---- compositor -------------------------------------------------------------------------------------------


def make_compositor(scene, ground, glare=True):
    """The specimen over the night ground, then bloom, then the fade.

    The film is rendered transparent and laid over the calibrated ground, so every pixel the specimen doesn't
    touch is the ground exactly: no denoiser drift, no dark specks where rays cross the not-yet-formed glass.
    Bloom comes from the emission pass only (hot glass, the strike, sparks, beads as they form): light
    sources glow; glass highlights never halo the ground. Then the fade: the same ground, for the loop."""
    ng = bpy.data.node_groups.new("post", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    bpy.context.view_layer.use_pass_emit = True
    rl = ng.nodes.new("CompositorNodeRLayers")
    over = ng.nodes.new("CompositorNodeAlphaOver")
    over.inputs["Background"].default_value = (*ground, 1.0)
    try:
        over.inputs["Straight Alpha"].default_value = False
    except Exception:
        pass
    ng.links.new(rl.outputs["Image"], over.inputs["Foreground"])
    src = over.outputs["Image"]
    if glare:
        gl = ng.nodes.new("CompositorNodeGlare")
        gl.inputs["Type"].default_value = "Bloom"
        assert gl.inputs["Type"].default_value == "Bloom", gl.inputs["Type"].default_value
        for k, v in (("Threshold", LOOK["bloom_threshold"]), ("Strength", LOOK["bloom_strength"]), ("Size", LOOK["bloom_size"]), ("Quality", "High"), ("Saturation", 1.0)):
            try:
                gl.inputs[k].default_value = v
            except Exception as e:
                log("glare input", k, "not set:", e)
        ng.links.new(rl.outputs["Emission"], gl.inputs["Image"])
        add = ng.nodes.new("ShaderNodeMix")
        add.data_type = "RGBA"
        add.blend_type = "ADD"
        NB.sock_in(add, "Factor_Float").default_value = 1.0
        ng.links.new(src, NB.sock_in(add, "A_Color"))
        ng.links.new(gl.outputs["Glare"], NB.sock_in(add, "B_Color"))
        src = NB.sock_out(add, "Result_Color")
    mix = ng.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    NB.sock_in(mix, "Factor_Float").default_value = 0.0
    ng.links.new(src, NB.sock_in(mix, "A_Color"))
    NB.sock_in(mix, "B_Color").default_value = (*ground, 1.0)
    out = ng.nodes.new("NodeGroupOutput")
    ng.links.new(NB.sock_out(mix, "Result_Color"), out.inputs[0])
    scene.compositing_node_group = ng
    scene.render.use_compositing = True
    scene.render.film_transparent = True
    return NB.sock_in(mix, "Factor_Float")


# ---- scene ------------------------------------------------------------------------------------------------


def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    try:
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type == "METAL"
        scene.cycles.device = "GPU"
    except Exception:
        scene.cycles.device = "CPU"
    cy = scene.cycles
    cy.samples = SAMPLES
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.014 if KIND == "film" else 0.006
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    try:
        cy.denoising_use_gpu = True
    except Exception:
        pass
    cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    cy.denoising_prefilter = "ACCURATE"
    cy.denoising_quality = "HIGH"
    cy.max_bounces = 18
    cy.transmission_bounces = 18
    cy.transparent_max_bounces = 160
    cy.glossy_bounces = 6
    cy.diffuse_bounces = 3
    cy.volume_bounces = 2
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.blur_glossy = 0.7
    cy.sample_clamp_direct = 0.0
    cy.sample_clamp_indirect = 6.0
    cy.use_light_tree = True
    r = scene.render
    r.resolution_x, r.resolution_y = W, H
    r.resolution_percentage = ARGS.pct
    r.film_transparent = False
    r.dither_intensity = 0.0
    r.use_persistent_data = True
    r.fps = FPS
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGB"
    r.image_settings.color_depth = "8"
    r.image_settings.compression = 15
    return scene


class Ctx:
    pass


def assemble(scene):
    ctx = Ctx()
    ctx.scene = scene
    ctx.ground = calibrate_ground(scene)
    make_world(scene, ctx.ground)
    mats = make_materials()
    ctx.mats = mats
    obs = build_specimen_meshes(mats)
    beads = build_beads(mats["bead"]) if SRC.get("beads") else None
    if beads is not None:
        obs["beads"] = beads
    ctx.obs = obs
    ctx.timed = list(obs.values())
    for ob in ctx.timed:
        ob.color = (STILL_NOW, 1.0, ob.get("status", 0.0), 1.0)
    # a parent for posing the whole specimen (the share card lays it on its side)
    root = bpy.data.objects.new("specimen", None)
    scene.collection.objects.link(root)
    for ob in ctx.timed:
        ob.parent = root
    ctx.root = root
    ctx.bolt = ctx.sparks = None
    if KIND == "film" or ARGS.time is not None:
        ctx.bolt = build_bolt(mats["bolt"])
        ctx.sparks = build_sparks(mats["spark"])
        ctx.bolt.parent = root
        ctx.sparks.parent = root
    ctx.cam = make_camera(scene)
    return ctx


def bolt_state(tau):
    s0, dl = TL["strike"], TL["leader"]
    lead, power, tip = 0.0, 0.0, 0.0
    if tau >= s0:
        lead = min(1.02, (tau - s0) / dl)
        if tau < s0 + dl:
            tip = 60.0
            power += 2.5  # the stepped leader: a faint channel with a bright head
    for i, ts in enumerate(TL["strokes"]):
        if tau >= ts:
            power += (120.0, 70.0, 45.0)[i] * math.exp(-(tau - ts) / 0.05)
    ts0 = TL["strokes"][0]
    if tau >= ts0:
        power += 5.0 * math.exp(-(tau - ts0) / 0.55)  # the channel's afterglow
    if tau > TL["strokes"][-1] + 3.0:
        lead, power, tip = 0.0, 0.0, 0.0
    flash = sum((1.0, 0.6, 0.4)[i] * math.exp(-(tau - ts) / 0.06) for i, ts in enumerate(TL["strokes"]) if tau >= ts)
    return lead, power, tip, flash


def volume_gates(tau):
    """The glass volume gate per tube at film time tau: 0 while it forms, 1 once formed."""
    out = {}
    for tb in TUBES:
        if not hasattr(tb, "ob"):
            continue
        t_end = tb.t0 + tb.grow
        if tau >= STILL_NOW * 0.5:
            out[tb.i] = 1.0
        elif tb is TRUNK:
            out[tb.i] = smootherstep(t_end + 0.1, t_end + 0.9, tau)
        else:
            out[tb.i] = smootherstep(t_end + 0.05, t_end + 0.45, tau)
    return out


def apply_time(ctx, tau):
    gates = volume_gates(tau)
    for ob in ctx.timed:
        i = ob.get("tube")
        ob.color = (tau, gates.get(i, 1.0) if i is not None else 1.0, ob.get("status", 0.0), 1.0)
    if ctx.bolt is not None:
        lead, power, tip, flash = bolt_state(tau)
        ctx.bolt.color = (lead, power, tip, 1.0)
        ctx.bolt.hide_render = power <= 0 and tip <= 0
        if "flash" in ctx.lights:
            ctx.lights["flash"].data.energy = 9000.0 * flash
        update_sparks(ctx.sparks, tau)
    if ctx.fade is not None:
        ctx.fade.default_value = smootherstep(TL["fade0"], TL["fade1"], tau)


def configure_view(ctx):
    """Place the camera and lights for the variant."""
    v = ARGS.variant
    cam = ctx.cam
    ctx.film_pose = None
    if v in ("film-desktop", "film-phone", "still-desktop", "still-phone") or ARGS.time is not None:
        portrait = H > W
        set_vfov(cam, FILM_VFOV)
        ctx.lights = make_lights("stand", CENTER)
        ctx.film_pose = lambda tau: film_camera_pose(tau, portrait)
        return
    if v == "plate":
        # The site's sculpture. The browser's own view (yaw 0.6 about the up axis, vertical fov 30, level), aimed at the
        # middle of the specimen and framed tight: the frame is 1.2 times the specimen's height, set a little low so the
        # tip's glow ends inside it, and the home page can zoom into it without running off its edge.
        ctx.lights = make_lights(os.environ.get("FULG_RIG", "stand"), CENTER)
        set_vfov(cam, 30.0)
        yaw = math.radians(ARGS.yaw) if ARGS.yaw is not None else 0.6
        d = (FULL_H * 1.2 / 2) / math.tan(math.radians(15.0))
        target = (CENTER[0], CENTER[1], CENTER[2] - 0.035 * FULL_H)
        aim(cam, orbit_pos(target, d, -yaw, 0.0), target)
        ctx.plate_camera = {"vfov": 30.0, "yaw": yaw, "distance": d, "target": [float(c) for c in target]}
        return
    if v in ("poster", "print"):
        ctx.lights = make_lights(os.environ.get("FULG_RIG", "print" if v == "print" else "stand"), CENTER)
        if v == "poster":
            # the browser's first frame: yaw 0.6 about the up axis, fov 30, its own fit distance, looking level
            set_vfov(cam, 30.0)
            yaw = math.radians(ARGS.yaw) if ARGS.yaw is not None else 0.6
            d = fit_dist_threejs()
            target = (0.0, 0.0, -HGT / 2)
            aim(cam, orbit_pos(target, d, -yaw, 0.0), target)
        else:
            set_vfov(cam, 22.0)
            yaw = math.radians(ARGS.yaw if ARGS.yaw is not None else 75.0)
            fh = FULL_H * 1.075
            d = (fh / 2) / math.tan(math.radians(22.0) / 2)
            target = (CENTER[0], CENTER[1], CENTER[2] - 0.05)
            aim(cam, orbit_pos(target, d, -yaw, math.radians(1.5)), target)
        return
    if v == "status-study":
        ctx.lights = make_lights("stand", CENTER)
        set_vfov(cam, 18.0)
        w = float(BB_HI[0] - BB_LO[0]) * 1.3
        hgt = float(BB_HI[2] - BB_LO[2]) * 1.3
        vf = math.radians(18.0)
        d = max((hgt / 2) / math.tan(vf / 2), (w / 2) / (math.tan(vf / 2) * W / H))
        target = (CENTER[0], CENTER[1], CENTER[2] - 0.12 * hgt / 1.3)
        aim(cam, orbit_pos(target, d, 0.0, math.radians(4.0)), target)
        ink = bpy.data.materials.new("ink")
        g = NB(ink.node_tree)
        g.output(g.n("ShaderNodeEmission", inputs={"Color": srgb("#a69c8b"), "Strength": 1.0}).outputs[0])
        for tb in TUBES:
            if getattr(tb, "dummy", False) or not getattr(tb, "label", None):
                continue
            cu = bpy.data.curves.new("label_%d" % tb.i, "FONT")
            cu.body = tb.label
            cu.align_x = "CENTER"
            cu.size = 0.11
            ob = bpy.data.objects.new("label_%d" % tb.i, cu)
            ob.data.materials.append(ink)
            ob.location = (float(tb.C[0][0]), float(BB_LO[1]) - 0.3, float(BB_LO[2]) - 0.28)
            ob.rotation_euler = (math.radians(90), 0, 0)
            ob.visible_shadow = False
            bpy.context.scene.collection.objects.link(ob)
        return
    if v == "og":
        global RIG_FOLLOWS
        RIG_FOLLOWS = False
        # on its side, surface to the left and tip to the right, seen from a little above: a drawer
        roll = math.radians(ARGS.yaw) if ARGS.yaw is not None else math.radians(230.0)
        M = Matrix.Rotation(math.radians(-90.0), 4, "Y") @ Matrix.Rotation(roll, 4, "Z") @ Matrix.Translation((-CENTER[0], -CENTER[1], -CENTER[2]))
        ctx.root.matrix_world = M
        ctx.lights = make_lights("drawer", (0.0, 0.0, 0.0))
        vf = 16.0
        set_vfov(cam, vf)
        # frame the length across the card's width
        aspect = W / H
        hf = 2 * math.atan(math.tan(math.radians(vf) / 2) * aspect)
        d = (FULL_H * 1.24 / 2) / math.tan(hf / 2)
        target = (0.15, 0.0, 1.25)
        aim(cam, orbit_pos(target, d, 0.0, math.radians(24.0)), target)
        return
    raise SystemExit("unknown variant " + v)


def write_alpha_version(ctx, scene, out):
    """An RGBA copy of a still, for pages that composite it over their own ground: render the object's
    coverage cheaply, then unmix the known night ground so edges and glow keep their true falloff.
    Over #0d0c0a it reproduces the opaque render exactly."""
    tmp = os.path.join(os.path.dirname(out), ".alpha_pass_%d.png" % os.getpid())
    cy = scene.cycles
    keep = (cy.samples, cy.use_denoising, scene.render.film_transparent, scene.render.use_compositing, scene.render.image_settings.color_mode)
    cy.samples, cy.use_denoising = 24, False
    scene.render.film_transparent = True
    scene.render.use_compositing = False
    scene.render.image_settings.color_mode = "RGBA"
    render_to(scene, tmp)
    cy.samples, cy.use_denoising, scene.render.film_transparent, scene.render.use_compositing, scene.render.image_settings.color_mode = keep
    a_img = bpy.data.images.load(tmp, check_existing=False)
    o_img = bpy.data.images.load(out, check_existing=False)
    w, h = o_img.size
    O = np.array(o_img.pixels[:], dtype=np.float64).reshape(h, w, 4)[..., :3]
    A = np.array(a_img.pixels[:], dtype=np.float64).reshape(h, w, 4)[..., 3]
    G = np.array([int(GROUND_HEX[i : i + 2], 16) / 255.0 for i in (1, 3, 5)])
    glow = np.clip(((O - G) / (1 - G)).max(axis=2), 0, 1)
    a = np.maximum(A, glow)
    F = np.where(a[..., None] > 1e-4, (O - (1 - a[..., None]) * G) / np.maximum(a[..., None], 1e-4), 0.0)
    rgba = np.concatenate([np.clip(F, 0, 1), a[..., None]], axis=2)
    res = bpy.data.images.new("alpha_out", w, h, alpha=True, float_buffer=False)
    res.alpha_mode = "STRAIGHT"
    res.pixels.foreach_set(rgba.astype(np.float32).ravel())
    apath = os.path.splitext(out)[0] + "-alpha.png"
    res.filepath_raw = apath
    res.file_format = "PNG"
    res.save()
    os.remove(tmp)
    log("alpha version ->", apath)


def write_camera(ctx, out):
    """The plate's camera, in Blender's coordinates and in the browser's (three.js, y up: Blender (x, y, z) is
    three.js (x, z, -y)), so the page can project the same geometry onto the same pixels."""
    import hashlib

    c = ctx.plate_camera
    loc = [float(v) for v in ctx.cam.location]
    tgt = c["target"]
    three = lambda p: [round(p[0], 6), round(p[2], 6), round(-p[1], 6)]
    spec = open(ARGS.specimen, "rb").read()
    info = {
        "variant": ARGS.variant,
        "width": int(round(W * ARGS.pct / 100)),
        "height": int(round(H * ARGS.pct / 100)),
        "vfov": c["vfov"],
        "yaw": round(c["yaw"], 6),
        "distance": round(c["distance"], 6),
        "blender": {"position": [round(v, 6) for v in loc], "target": [round(v, 6) for v in tgt]},
        "three": {"position": three(loc), "target": three(tgt), "up": [0, 1, 0]},
        "specimen": {"generatedAt": SRC.get("generatedAt"), "sha256": hashlib.sha256(spec).hexdigest(), "tubes": len(SRC["tubes"]), "beads": len(SRC.get("beads", []))},
        "samples": SAMPLES,
    }
    path = os.path.splitext(out)[0] + ".camera.json"
    with open(path, "w") as f:
        json.dump(info, f, indent=2)
    log("camera ->", path)


def render_to(scene, path):
    scene.render.filepath = path
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    return time.time() - t0


def main():
    scene = setup_scene()
    ctx = assemble(scene)
    configure_view(ctx)
    ctx.fade = make_compositor(scene, ctx.ground, glare=os.environ.get("FULG_NOGLARE") is None)
    if os.environ.get("FULG_NODENOISE"):
        scene.cycles.use_denoising = False
    if ARGS.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ARGS.save_blend))
    if ARGS.no_render:
        return
    out = os.path.abspath(ARGS.out)
    if KIND == "film" and ARGS.time is None:
        os.makedirs(out, exist_ok=True)
        if ARGS.frames and "," in ARGS.frames:
            flist = [int(x) for x in ARGS.frames.split(",")]
        elif ARGS.frames:
            a, b = (int(x) for x in ARGS.frames.split("-"))
            flist = list(range(a, b + 1))
        else:
            flist = list(range(1, NFRAMES + 1))
        b = flist[-1]
        times = []
        for f in flist:
            tau = (f - 1) / FPS
            apply_time(ctx, tau)
            pos, target = ctx.film_pose(tau)
            aim(ctx.cam, pos, target)
            scene.frame_set(f)
            path = os.path.join(out, "f_%04d.png" % f)
            dt = render_to(scene, path)
            times.append(dt)
            log("frame %d/%d  tau %.3f  %.1fs  (avg %.1fs)" % (f, b, tau, dt, sum(times) / len(times)))
        log("film done: %d frames, %.1f min" % (len(times), sum(times) / 60))
        return
    # stills
    if ctx.film_pose is not None:
        tau = ARGS.time if ARGS.time is not None else 10.0
        pos, target = ctx.film_pose(tau)
        aim(ctx.cam, pos, target)
        if ARGS.time is not None:
            apply_time(ctx, tau)
        else:
            apply_time(ctx, STILL_NOW)
            ctx.fade.default_value = 0.0
    if ARGS.cam:
        x, y, z, tx, ty, tz, vf = (float(v) for v in ARGS.cam.split(","))
        set_vfov(ctx.cam, vf)
        aim(ctx.cam, (x, y, z), (tx, ty, tz))
    dt = render_to(scene, out)
    if ARGS.alpha or ARGS.variant in ("poster", "plate"):
        write_alpha_version(ctx, scene, out)
    if ARGS.variant == "plate":
        write_camera(ctx, out)
    log("still %s: %dx%d @ %d%%, %d samples, %.1fs -> %s" % (ARGS.variant, W, H, ARGS.pct, SAMPLES, dt, out))


main()
