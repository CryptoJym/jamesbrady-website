# Render the fulgurite still in Blender (Cycles) from the exported geometry: the same object the browser grows.
#
#   blender -b -P scripts/specimen/render_still.py -- specimen.json out.png WIDTH HEIGHT SAMPLES [transparent]
#
# Coordinates arrive y-up (three.js); Blender is z-up, so (x, y, z) becomes (x, -z, y).

import json
import math
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
src, out = argv[0], argv[1]
W, H_PX, SAMPLES = int(argv[2]), int(argv[3]), int(argv[4])
TRANSPARENT = "transparent" in argv[5:]
LYING = "lying" in argv[5:]
data = json.load(open(src))
HGT = data["height"]


def v(p):
    return (p[0], -p[2], p[1])


# ---- scene ----------------------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
try:
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = "GPU"
except Exception:
    scene.cycles.device = "CPU"
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x = W
scene.render.resolution_y = H_PX
scene.render.film_transparent = TRANSPARENT
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"

world = bpy.data.worlds.new("night")
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (0.0042, 0.0038, 0.0032, 1)
bg.inputs["Strength"].default_value = 1.0
scene.world = world


# ---- materials ------------------------------------------------------------------------------------
def principled(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes["Principled BSDF"]


crust, n, l, p = principled("crust")
tex = n.new("ShaderNodeTexNoise")
tex.inputs["Scale"].default_value = 38.0
tex.inputs["Detail"].default_value = 12.0
tex.inputs["Roughness"].default_value = 0.62
ramp = n.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.32
ramp.color_ramp.elements[0].color = (0.085, 0.062, 0.041, 1)
ramp.color_ramp.elements[1].position = 0.72
ramp.color_ramp.elements[1].color = (0.58, 0.45, 0.29, 1)
l.new(tex.outputs["Fac"], ramp.inputs["Fac"])
l.new(ramp.outputs["Color"], p.inputs["Base Color"])
bump = n.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.7
bump.inputs["Distance"].default_value = 0.02
l.new(tex.outputs["Fac"], bump.inputs["Height"])
l.new(bump.outputs["Normal"], p.inputs["Normal"])
p.inputs["Roughness"].default_value = 0.78
p.inputs["Coat Weight"].default_value = 0.35
p.inputs["Coat Roughness"].default_value = 0.08

frost, n, l, p = principled("frost")
p.inputs["Base Color"].default_value = (0.84, 0.87, 0.83, 1)
p.inputs["Roughness"].default_value = 0.42
p.inputs["Transmission Weight"].default_value = 0.72
p.inputs["IOR"].default_value = 1.45

bead, n, l, p = principled("bead")
p.inputs["Base Color"].default_value = (0.93, 0.97, 0.94, 1)
p.inputs["Roughness"].default_value = 0.04
p.inputs["Transmission Weight"].default_value = 1.0
p.inputs["IOR"].default_value = 1.52
p.inputs["Emission Color"].default_value = (0.9, 0.95, 0.92, 1)
p.inputs["Emission Strength"].default_value = 0.35

hot = bpy.data.materials.new("heat")
hot.use_nodes = True
nt = hot.node_tree
for node in list(nt.nodes):
    nt.nodes.remove(node)
em = nt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (1.0, 0.36, 0.06, 1)
em.inputs["Strength"].default_value = 3.2
outn = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(em.outputs["Emission"], outn.inputs["Surface"])


# ---- geometry -------------------------------------------------------------------------------------
def curve_object(name, tubes, material, radius_scale=1.0):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 1.0
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    for t in tubes:
        pts = t["points"]
        sp = cu.splines.new("POLY")
        sp.points.add(len(pts) - 1)
        for i, q in enumerate(pts):
            x, y, z = v(q)
            sp.points[i].co = (x, y, z, 1)
            sp.points[i].radius = t["radii"][i] * radius_scale
    ob = bpy.data.objects.new(name, cu)
    ob.data.materials.append(material)
    bpy.context.collection.objects.link(ob)
    return ob


solid = [t for t in data["tubes"] if not t["frosted"]]
frosted = [t for t in data["tubes"] if t["frosted"]]
curve_object("glass", solid, crust)
if frosted:
    curve_object("private", frosted, frost)

# The hot tips: the stretch of each tube whose heat is on, redrawn slightly thicker in emission.
hot_tubes = []
for t in solid:
    idx = [i for i, h in enumerate(t["heat"]) if h > 0.08]
    if len(idx) >= 2:
        a = max(0, idx[0] - 1)
        hot_tubes.append({"points": t["points"][a:], "radii": t["radii"][a:]})
if hot_tubes:
    curve_object("heat", hot_tubes, hot, radius_scale=1.04)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.0)
proto = bpy.context.active_object
proto.data.materials.append(bead)
proto.hide_render = True
for b in data["beads"]:
    o = proto.copy()
    o.hide_render = False
    o.location = v(b["p"])
    o.scale = (b["r"],) * 3
    bpy.context.collection.objects.link(o)

# ---- light and camera ------------------------------------------------------------------------------
def area(name, loc, rot, power, size, color):
    li = bpy.data.lights.new(name, "AREA")
    li.energy = power
    li.size = size
    li.color = color
    ob = bpy.data.objects.new(name, li)
    ob.location = loc
    ob.rotation_euler = rot
    bpy.context.collection.objects.link(ob)


mid = -HGT / 2
area("key", (-9, -12, mid + 7), (math.radians(62), 0, math.radians(-38)), 2600, 6, (1.0, 0.86, 0.7))
area("rim", (7, 10, mid + 3), (math.radians(-70), 0, math.radians(150)), 1800, 5, (0.72, 0.82, 1.0))
area("fill", (6, -10, mid - 5), (math.radians(80), 0, math.radians(30)), 350, 8, (1.0, 0.9, 0.8))

cam = bpy.data.cameras.new("cam")
cam.lens = 85
cam.sensor_fit = "VERTICAL"
cam.sensor_height = 36
camo = bpy.data.objects.new("cam", cam)
aspect = W / H_PX
dist = (HGT * 1.08) / (2 * math.tan(cam.angle_y / 2)) if aspect < 1 else (HGT * 1.1) / (2 * math.tan(cam.angle_y / 2))
if LYING:
    # The specimen on its side, like a drawer in a museum: surface on the left, tip on the right.
    hfov = 2 * math.atan(math.tan(cam.angle_y / 2) * aspect)
    dist = (HGT * 1.12) / (2 * math.tan(hfov / 2))
    camo.location = (0.3, -dist, mid)
    camo.rotation_euler = (math.radians(90), math.radians(90), 0)
else:
    camo.location = (0.4, -dist, mid)
    camo.rotation_euler = (math.radians(90), 0, 0)
bpy.context.collection.objects.link(camo)
scene.camera = camo

scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("rendered", out)
