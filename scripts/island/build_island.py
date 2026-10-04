"""Gelişen ada modelini üretir: assets/models/island.glb

Çalıştırma:
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python scripts/island/build_island.py -- [--preview DIR]

Her nesnenin adı hangi aşamalarda görüneceğini taşır:
  s{ilk}-{son}__ad   (son = 99 → sonsuza kadar)
Uygulama, mevcut aşama bu aralıktaysa nesneyi gösterir.
Dokusuz, düz renkli low-poly; renkler glTF materyal rengi olarak gider.
"""

import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "assets", "models", "island.glb")
STAGE_COUNT = 12

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
PREVIEW_DIR = argv[argv.index("--preview") + 1] if "--preview" in argv else None

# ---------------------------------------------------------------------------
# Sahne ve materyaller
# ---------------------------------------------------------------------------

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

PALETTE = {
    "grass": (0.36, 0.66, 0.30),
    "grass_dark": (0.24, 0.50, 0.22),
    "grass_light": (0.55, 0.78, 0.36),
    "grass_soft": (0.43, 0.72, 0.33),
    "dirt": (0.47, 0.32, 0.20),
    "rock": (0.50, 0.48, 0.46),
    "rock_dark": (0.36, 0.35, 0.34),
    "bark": (0.42, 0.28, 0.17),
    "leaf": (0.30, 0.62, 0.26),
    "leaf_light": (0.46, 0.74, 0.30),
    "pine": (0.18, 0.45, 0.30),
    "petal_pink": (0.95, 0.55, 0.70),
    "petal_yellow": (0.98, 0.84, 0.30),
    "petal_white": (0.97, 0.96, 0.92),
    "petal_purple": (0.66, 0.50, 0.90),
    "flower_center": (0.98, 0.70, 0.20),
    "mushroom_cap": (0.88, 0.27, 0.22),
    "mushroom_stem": (0.95, 0.91, 0.82),
    "stone": (0.72, 0.70, 0.66),
    "wood": (0.66, 0.46, 0.28),
    "wood_dark": (0.48, 0.32, 0.19),
    "water": (0.32, 0.66, 0.86),
    "lily": (0.34, 0.68, 0.34),
    "lamp": (1.00, 0.82, 0.45),
    "metal": (0.22, 0.22, 0.24),
    "dome": (0.30, 0.62, 0.62),
    "plaster": (0.96, 0.93, 0.86),
    "fruit": (0.90, 0.22, 0.20),
    "wing_orange": (0.98, 0.60, 0.22),
    "wing_blue": (0.40, 0.62, 0.98),
    "petal_red": (0.88, 0.20, 0.28),
    "lavender": (0.62, 0.52, 0.86),
    "sunflower": (0.99, 0.78, 0.15),
    "seed_brown": (0.38, 0.24, 0.14),
    "fur_light": (0.90, 0.86, 0.80),
    "fur_brown": (0.62, 0.45, 0.30),
    "spine": (0.36, 0.26, 0.20),
    "eye": (0.08, 0.08, 0.09),
    "beak": (0.98, 0.66, 0.20),
    "bird_blue": (0.30, 0.55, 0.90),
    "duck_white": (0.97, 0.97, 0.95),
    "pink": (0.98, 0.70, 0.75),
}

_materials = {}


def mat(name):
    if name in _materials:
        return _materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    r, g, b = (c ** 2.2 for c in PALETTE[name])  # palet sRGB, glTF lineer ister
    bsdf.inputs["Base Color"].default_value = (r, g, b, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.9
    if name == "water":
        bsdf.inputs["Roughness"].default_value = 0.25
    if name == "lamp":
        bsdf.inputs["Emission Color"].default_value = (r, g, b, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 2.0
    _materials[name] = m
    return m


# ---------------------------------------------------------------------------
# Yardımcılar
# ---------------------------------------------------------------------------

rng = random.Random(7)


def stage_name(first, last, name):
    return f"s{first:02d}-{last:02d}__{name}"


def finish(obj, material, flat=True):
    if material:
        obj.data.materials.clear()
        obj.data.materials.append(mat(material))
    if flat:
        for p in obj.data.polygons:
            p.use_smooth = False
    return obj


def jitter(obj, amount, seed, keep_bottom=False):
    r = random.Random(seed)
    for v in obj.data.vertices:
        if keep_bottom and v.co.z <= min(w.co.z for w in obj.data.vertices) + 1e-4:
            continue
        v.co += Vector((r.uniform(-1, 1), r.uniform(-1, 1), r.uniform(-1, 1))) * amount


def ico(loc, radius, material, subdiv=1, scale=(1, 1, 1), seed=0, rough=0.08):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdiv, radius=radius, location=loc)
    o = bpy.context.active_object
    o.scale = scale
    jitter(o, radius * rough, seed)
    return finish(o, material)


def cyl(loc, radius, depth, material, verts=8, radius_top=None, rot=(0, 0, 0)):
    if radius_top is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(
            vertices=verts, radius1=radius, radius2=radius_top, depth=depth, location=loc, rotation=rot
        )
    return finish(bpy.context.active_object, material)


def box(loc, size, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = size
    return finish(o, material)


def group(name, parts):
    """Parçaları tek nesnede birleştirir; materyaller alt-mesh olarak kalır."""
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    if len(parts) > 1:
        bpy.ops.object.join()
    o = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    o.name = name
    o.data.name = name
    return o


def place(obj, x, y, rot_z=0.0):
    obj.location = (x, y, 0)
    obj.rotation_euler = (0, 0, rot_z)
    return obj


# ---------------------------------------------------------------------------
# Ada gövdesi: aynı açısal gürültü ölçeklenir → küçük ada büyüğün içinde kalır
# ---------------------------------------------------------------------------

SEG = 28
_phase = [random.Random(11).uniform(0, math.tau) for _ in range(3)]


def outline(theta):
    return (
        1.0
        + 0.07 * math.sin(2 * theta + _phase[0])
        + 0.05 * math.sin(3 * theta + _phase[1])
        + 0.03 * math.sin(5 * theta + _phase[2])
    )


def island_body(name, base_r, seed):
    r = random.Random(seed)
    bm = bmesh.new()
    rings = []

    def ring(z, scale, jit=0.0, zjit=0.0, offset=0.0):
        verts = []
        for i in range(SEG):
            t = (i + offset) / SEG * math.tau
            rr = base_r * outline(t) * scale * (1 + r.uniform(-jit, jit))
            verts.append(bm.verts.new((math.cos(t) * rr, math.sin(t) * rr, z + r.uniform(-zjit, zjit))))
        rings.append(verts)
        return verts

    # Çimen üstü hafif kubbe: merkez + iç halka + kenar
    center = bm.verts.new((0, 0, 0.06))
    # Kaydırılmış iç halkalar → yüzeyde radyal dilim deseni oluşmaz
    inners = [ring(top_z(s_ * base_r, 0, base_r), s_, jit=0.06, zjit=0.008, offset=0.5 * (k % 2)) for k, s_ in enumerate((0.22, 0.45, 0.68, 0.86))]
    top = ring(0.0, 1.0)
    lip = ring(-0.10, 1.02)
    dirt = ring(-0.30, 0.94, jit=0.03)
    depth = base_r * 1.25
    rock_rings = []
    steps = 4
    for k in range(1, steps + 1):
        f = k / (steps + 1)
        rock_rings.append(ring(-0.30 - depth * f, 0.94 * (1 - f) ** 1.15, jit=0.10, zjit=0.06))
    tip = bm.verts.new((r.uniform(-0.1, 0.1), r.uniform(-0.1, 0.1), -0.30 - depth))

    bm.verts.ensure_lookup_table()
    faces = {"grass": [], "dirt": [], "rock": []}
    for i in range(SEG):
        j = (i + 1) % SEG
        faces["grass"].append(bm.faces.new((center, inners[0][i], inners[0][j])))
        for k, (a, b) in enumerate(zip(inners, inners[1:] + [top])):
            # Komşu halkalar yarım adım kaydırılmış: iki üçgen
            if k % 2 == 0:  # b[i], a[i] ile a[j] arasında
                faces["grass"].append(bm.faces.new((a[i], b[i], a[j])))
                faces["grass"].append(bm.faces.new((a[j], b[i], b[j])))
            else:  # a[i], b[i] ile b[j] arasında
                faces["grass"].append(bm.faces.new((a[i], b[i], b[j])))
                faces["grass"].append(bm.faces.new((a[i], b[j], a[j])))
        faces["grass"].append(bm.faces.new((top[i], lip[i], lip[j], top[j])))
        faces["dirt"].append(bm.faces.new((lip[i], dirt[i], dirt[j], lip[j])))
        prev = dirt
        for rr in rock_rings:
            faces["rock"].append(bm.faces.new((prev[i], rr[i], rr[j], prev[j])))
            prev = rr
        faces["rock"].append(bm.faces.new((prev[i], tip, prev[j])))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    for key in ("grass", "dirt", "rock", "grass_soft", "rock_dark"):
        me.materials.append(mat(key))
    index = {"grass": 0, "dirt": 1, "rock": 2}
    for key, fl in faces.items():
        for f in fl:
            f.material_index = index[key]
            c = f.calc_center_median()
            # Yüzey tek düze görünmesin: yumuşak çimen lekeleri, koyu kaya yüzleri
            if key == "grass" and math.sin(c.x * 2.3 + 1.1) + math.sin(c.y * 2.9 - 0.4) + r.uniform(-0.6, 0.6) > 0.7:
                f.material_index = 3
            elif key == "rock" and r.random() < 0.35:
                f.material_index = 4
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    scene.collection.objects.link(o)
    return finish(o, None)


def top_z(x, y, base_r):
    """Adanın kubbeli üst yüzeyinde (x, y) noktasının yüksekliği."""
    d = math.hypot(x, y) / base_r
    if d < 0.55:
        return 0.06 - (0.02 * d / 0.55)
    return max(0.0, 0.04 * (1 - (d - 0.55) / 0.45))


# ---------------------------------------------------------------------------
# Öğeler
# ---------------------------------------------------------------------------


def sapling(name):
    stem = cyl((0, 0, 0.11), 0.018, 0.22, "bark", verts=6, radius_top=0.012)
    leaves = [
        ico((0.06, 0, 0.21), 0.075, "leaf_light", scale=(1.4, 0.7, 0.3), seed=1),
        ico((-0.055, 0.02, 0.16), 0.065, "leaf_light", scale=(1.4, 0.7, 0.3), seed=2),
        ico((0, -0.01, 0.25), 0.055, "leaf", scale=(0.9, 0.9, 0.9), seed=3),
    ]
    leaves[0].rotation_euler = (0, -0.4, 0)
    leaves[1].rotation_euler = (0, 0.4, 2.8)
    return group(name, [stem] + leaves)


def young_tree(name):
    trunk = cyl((0, 0, 0.3), 0.05, 0.6, "bark", verts=7, radius_top=0.03)
    blobs = [
        ico((0, 0, 0.68), 0.24, "leaf", seed=10),
        ico((0.13, 0.05, 0.56), 0.16, "leaf_light", seed=11),
        ico((-0.12, -0.06, 0.58), 0.15, "leaf", seed=12),
    ]
    return group(name, [trunk] + blobs)


def mature_tree(name):
    trunk = cyl((0, 0, 0.5), 0.10, 1.0, "bark", verts=8, radius_top=0.05)
    branch_a = cyl((0.12, 0, 0.82), 0.03, 0.35, "bark", verts=6, radius_top=0.015, rot=(0, 0.8, 0))
    branch_b = cyl((-0.1, 0.05, 0.9), 0.03, 0.3, "bark", verts=6, radius_top=0.015, rot=(0.3, -0.8, 0))
    blobs = [
        ico((0, 0, 1.18), 0.40, "leaf", seed=20),
        ico((0.30, 0.08, 1.0), 0.28, "leaf_light", seed=21),
        ico((-0.28, 0.10, 1.05), 0.27, "leaf", seed=22),
        ico((0.05, -0.28, 1.02), 0.26, "leaf_light", seed=23),
        ico((-0.05, 0.22, 1.38), 0.24, "leaf_light", seed=24),
    ]
    return group(name, [trunk, branch_a, branch_b] + blobs)


def fruits(name):
    spots = [(0.32, -0.12, 0.92), (-0.36, 0.0, 0.98), (0.1, -0.44, 0.98), (0.2, 0.3, 1.2), (-0.2, -0.25, 1.25), (0.42, 0.18, 1.1)]
    return group(name, [ico(p, 0.045, "fruit", subdiv=1, seed=i, rough=0.02) for i, p in enumerate(spots)])


def grass_tuft(name, seed):
    r = random.Random(seed)
    parts = []
    for i in range(3):
        a = i / 3 * math.tau + r.uniform(0, 1)
        h = r.uniform(0.07, 0.12)
        c = cyl((math.cos(a) * 0.02, math.sin(a) * 0.02, h / 2), 0.012, h, r.choice(["grass_dark", "grass_light"]), verts=4, radius_top=0.0)
        c.rotation_euler = (r.uniform(-0.3, 0.3), r.uniform(-0.3, 0.3), 0)
        parts.append(c)
    return group(name, parts)


def rock(name, size, seed):
    o = ico((0, 0, size * 0.35), size, rng.choice(["rock", "rock_dark", "stone"]), seed=seed, scale=(1.2, 1.0, 0.7), rough=0.18)
    return group(name, [o])


def flower(name, petal, seed):
    r = random.Random(seed)
    h = r.uniform(0.08, 0.13)
    stem = cyl((0, 0, h / 2), 0.006, h, "grass_dark", verts=4)
    parts = [stem]
    for i in range(5):
        a = i / 5 * math.tau
        parts.append(ico((math.cos(a) * 0.022, math.sin(a) * 0.022, h), 0.017, petal, subdiv=1, scale=(1, 1, 0.4), seed=seed + i, rough=0.02))
    parts.append(ico((0, 0, h + 0.004), 0.012, "flower_center", subdiv=1, rough=0.0))
    return group(name, parts)


def bush(name, seed):
    r = random.Random(seed)
    parts = [ico((r.uniform(-0.06, 0.06), r.uniform(-0.06, 0.06), 0.09), r.uniform(0.09, 0.13), r.choice(["leaf", "leaf_light", "grass_dark"]), seed=seed + i) for i in range(3)]
    return group(name, parts)


def mushroom(name, scale, seed):
    stem = cyl((0, 0, 0.03 * scale), 0.012 * scale, 0.06 * scale, "mushroom_stem", verts=6)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=0.035 * scale, location=(0, 0, 0.06 * scale))
    cap = bpy.context.active_object
    cap.scale = (1, 1, 0.65)
    bm = bmesh.new()
    bm.from_mesh(cap.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
    bm.to_mesh(cap.data)
    bm.free()
    finish(cap, "mushroom_cap")
    return group(name, [stem, cap])


def stepping_stones(name, points):
    parts = []
    for i, (x, y) in enumerate(points):
        s = cyl((x, y, 0.012), rng.uniform(0.07, 0.09), 0.03, "stone", verts=7)
        jitter(s, 0.008, 100 + i)
        parts.append(s)
    return group(name, parts)


def bench(name):
    parts = [
        box((0, 0, 0.12), (0.36, 0.11, 0.025), "wood"),
        box((0, 0.05, 0.22), (0.36, 0.02, 0.09), "wood"),
    ]
    for x in (-0.15, 0.15):
        parts.append(box((x, 0, 0.055), (0.025, 0.09, 0.11), "wood_dark"))
        parts.append(box((x, 0.055, 0.16), (0.02, 0.02, 0.2), "wood_dark"))
    return group(name, parts)


def lantern(name):
    parts = [
        cyl((0, 0, 0.16), 0.015, 0.32, "metal", verts=6),
        box((0, 0, 0.36), (0.07, 0.07, 0.08), "lamp"),
        cyl((0, 0, 0.42), 0.06, 0.04, "metal", verts=4, radius_top=0.0, rot=(0, 0, math.pi / 4)),
        box((0, 0, 0.315), (0.08, 0.08, 0.012), "metal"),
    ]
    return group(name, parts)


def pond(name, radius):
    water = cyl((0, 0, 0.012), radius, 0.01, "water", verts=12)
    for v in water.data.vertices:
        if math.hypot(v.co.x, v.co.y) > 0.01:
            v.co.x *= 1.25
    parts = [water]
    for i in range(14):
        a = i / 14 * math.tau
        parts.append(ico((math.cos(a) * radius * 1.3, math.sin(a) * radius * 1.05, 0.02), rng.uniform(0.035, 0.05), rng.choice(["stone", "rock"]), seed=200 + i, scale=(1.2, 1, 0.6), rough=0.15))
    return group(name, parts)


def lilies(name, radius):
    parts = []
    for i, (x, y) in enumerate([(0.3, 0.1), (-0.25, -0.12), (0.05, -0.2)]):
        pad = cyl((x * radius * 2, y * radius * 2, 0.02), 0.045, 0.006, "lily", verts=8)
        parts.append(pad)
    parts.append(flower("tmp", "petal_pink", 77))
    parts[-1].location = (0.3 * radius * 2, 0.1 * radius * 2, -0.06)
    return group(name, parts)


def pine(name, height, seed):
    trunk = cyl((0, 0, height * 0.12), 0.035, height * 0.24, "bark", verts=6)
    parts = [trunk]
    for k in range(3):
        f = k / 3
        c = cyl((0, 0, height * (0.3 + f * 0.42)), height * (0.28 - f * 0.07), height * 0.42, "pine", verts=7, radius_top=0.0)
        jitter(c, 0.012, seed + k)
        parts.append(c)
    return group(name, parts)


def pavilion(name):
    """Kubbeli küçük köşk."""
    parts = [cyl((0, 0, 0.04), 0.38, 0.08, "stone", verts=8)]
    for i in range(8):
        a = i / 8 * math.tau + math.pi / 8
        parts.append(cyl((math.cos(a) * 0.3, math.sin(a) * 0.3, 0.3), 0.025, 0.44, "plaster", verts=6))
    parts.append(cyl((0, 0, 0.55), 0.38, 0.07, "plaster", verts=8))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.3, location=(0, 0, 0.585))
    dome = bpy.context.active_object
    bm = bmesh.new()
    bm.from_mesh(dome.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
    bm.to_mesh(dome.data)
    bm.free()
    parts.append(finish(dome, "dome"))
    parts.append(cyl((0, 0, 0.93), 0.012, 0.1, "lamp", verts=6))
    parts.append(ico((0, 0, 0.99), 0.022, "lamp", subdiv=1, rough=0.0))
    return group(name, parts)


def butterfly(name, wing):
    parts = [cyl((0, 0, 0), 0.006, 0.05, "metal", verts=4, rot=(math.pi / 2, 0, 0))]
    for side in (-1, 1):
        w = ico((side * 0.028, 0, 0), 0.026, wing, subdiv=1, scale=(1, 1.2, 0.15), rough=0.0)
        w.rotation_euler = (0, side * 0.5, 0)
        parts.append(w)
    return group(name, parts)


# ---------------------------------------------------------------------------
# Tohum bitkileri: plant__{tür}__{evre}; uygulama kopyalayıp boş yuvalara diker
# ---------------------------------------------------------------------------


def mound():
    m = ico((0, 0, 0.0), 0.07, "dirt", subdiv=1, scale=(1, 1, 0.35), seed=300, rough=0.1)
    return m


def plant_sprout(name):
    parts = [mound(), cyl((0, 0, 0.04), 0.008, 0.07, "grass_light", verts=5)]
    for side in (-1, 1):
        leaf = ico((side * 0.022, 0, 0.075), 0.022, "leaf_light", subdiv=1, scale=(1.4, 0.7, 0.3), rough=0.0)
        leaf.rotation_euler = (0, side * -0.5, 0)
        parts.append(leaf)
    return group(name, parts)


def plant_seedling(name):
    parts = [mound(), cyl((0, 0, 0.08), 0.011, 0.16, "grass_dark", verts=5)]
    for k, (z, a) in enumerate([(0.08, 0.3), (0.12, 2.3), (0.16, 4.2)]):
        leaf = ico((math.cos(a) * 0.035, math.sin(a) * 0.035, z), 0.03, "leaf", subdiv=1, scale=(1.5, 0.7, 0.3), seed=310 + k, rough=0.0)
        leaf.rotation_euler = (0, 0, a)
        parts.append(leaf)
    return group(name, parts)


def plant_tulip(name):
    parts = [mound(), cyl((0, 0, 0.1), 0.01, 0.2, "grass_dark", verts=5)]
    leaf = ico((0.02, 0, 0.07), 0.03, "leaf", subdiv=1, scale=(0.6, 0.4, 2.0), rough=0.0)
    leaf.rotation_euler = (0, 0.35, 0)
    parts.append(leaf)
    cup = cyl((0, 0, 0.23), 0.03, 0.06, "petal_red", verts=6, radius_top=0.042)
    parts.append(cup)
    return group(name, parts)


def plant_rose(name):
    parts = [mound()]
    parts += [ico((math.cos(a) * 0.05, math.sin(a) * 0.05, 0.07), 0.06, "leaf", seed=320 + k) for k, a in enumerate((0.3, 2.4, 4.4))]
    for k, (x, y, z) in enumerate([(0.03, 0.02, 0.13), (-0.04, 0.01, 0.12), (0.0, -0.04, 0.14)]):
        parts.append(ico((x, y, z), 0.028, "pink" if k == 1 else "petal_red", subdiv=1, seed=330 + k, rough=0.12))
    return group(name, parts)


def plant_lavender(name):
    parts = [mound()]
    for k in range(6):
        a = k / 6 * math.tau
        x, y = math.cos(a) * 0.03, math.sin(a) * 0.03
        h = 0.16 + (k % 3) * 0.025
        st = cyl((x, y, h / 2), 0.004, h, "grass_dark", verts=4)
        st.rotation_euler = (-y * 4, x * 4, 0)
        parts.append(st)
        parts.append(ico((x * 1.6, y * 1.6, h + 0.02), 0.016, "lavender", subdiv=1, scale=(0.8, 0.8, 2.2), rough=0.05))
    return group(name, parts)


def plant_sunflower(name):
    parts = [mound(), cyl((0, 0, 0.15), 0.012, 0.3, "grass_dark", verts=5)]
    for side in (-1, 1):
        leaf = ico((side * 0.04, 0, 0.13), 0.035, "leaf", subdiv=1, scale=(1.4, 0.8, 0.25), rough=0.0)
        parts.append(leaf)
    head_z = 0.31
    for k in range(10):
        a = k / 10 * math.tau
        p = ico((math.cos(a) * 0.045, 0.012, head_z + math.sin(a) * 0.045), 0.02, "sunflower", subdiv=1, scale=(1, 0.3, 1), rough=0.0)
        parts.append(p)
    center = cyl((0, 0.016, head_z), 0.032, 0.02, "seed_brown", verts=8, rot=(math.pi / 2, 0, 0))
    parts.append(center)
    return group(name, parts)


def plant_fruit_tree(name):
    parts = [mound(), cyl((0, 0, 0.12), 0.022, 0.24, "bark", verts=6, radius_top=0.014)]
    parts.append(ico((0, 0, 0.3), 0.11, "leaf_light", seed=340))
    parts.append(ico((0.06, 0.03, 0.26), 0.07, "leaf", seed=341))
    for k, (x, y, z) in enumerate([(0.08, -0.06, 0.27), (-0.07, -0.05, 0.31), (0.02, -0.1, 0.34)]):
        parts.append(ico((x, y, z), 0.022, "fruit", subdiv=1, rough=0.0))
    return group(name, parts)


# ---------------------------------------------------------------------------
# Ziyaretçiler: visitor__{ad}; -Y yönüne (kameraya) bakar
# ---------------------------------------------------------------------------


def eyes(x_off, y, z, r=0.009):
    return [ico((sx * x_off, y, z), r, "eye", subdiv=1, rough=0.0) for sx in (-1, 1)]


def visitor_rabbit(name):
    parts = [
        ico((0, 0, 0.07), 0.07, "fur_light", subdiv=2, scale=(0.9, 1.1, 0.9), rough=0.03),
        ico((0, -0.06, 0.13), 0.048, "fur_light", subdiv=2, rough=0.03),
        ico((0, 0.075, 0.06), 0.025, "petal_white", subdiv=1, rough=0.0),
        ico((0, -0.105, 0.125), 0.008, "pink", subdiv=1, rough=0.0),
    ]
    for sx in (-1, 1):
        ear = ico((sx * 0.02, -0.05, 0.21), 0.018, "fur_light", subdiv=1, scale=(0.8, 0.5, 2.6), rough=0.0)
        ear.rotation_euler = (0.2, sx * 0.25, 0)
        parts.append(ear)
    parts += eyes(0.022, -0.098, 0.145)
    return group(name, parts)


def visitor_bird(name):
    parts = [
        ico((0, 0, 0.06), 0.045, "bird_blue", subdiv=2, scale=(0.9, 1.2, 0.9), rough=0.03),
        ico((0, -0.04, 0.1), 0.032, "bird_blue", subdiv=2, rough=0.03),
        cyl((0, -0.078, 0.098), 0.01, 0.025, "beak", verts=4, radius_top=0.0, rot=(math.pi / 2, 0, 0)),
        ico((0, 0.06, 0.07), 0.025, "bird_blue", subdiv=1, scale=(0.6, 1.4, 0.3), rough=0.0),
        ico((0, -0.022, 0.05), 0.03, "petal_white", subdiv=1, scale=(0.8, 0.6, 0.8), rough=0.0),
    ]
    for sx in (-1, 1):
        parts.append(ico((sx * 0.04, 0.005, 0.065), 0.025, "bird_blue", subdiv=1, scale=(0.3, 1.2, 0.7), rough=0.0))
        parts.append(cyl((sx * 0.015, 0, 0.01), 0.004, 0.025, "beak", verts=4))
    parts += eyes(0.018, -0.065, 0.108, 0.006)
    return group(name, parts)


def visitor_hedgehog(name):
    body = ico((0, 0.01, 0.05), 0.07, "spine", subdiv=2, scale=(0.9, 1.15, 0.75), rough=0.0)
    spikes = []
    r = random.Random(400)
    for k in range(22):
        a, e = r.uniform(0, math.tau), r.uniform(0.2, 1.3)
        d = Vector((math.cos(a) * math.cos(e) * 0.9, math.sin(a) * math.cos(e) * 1.15 + 0.01, math.sin(e) * 0.75)).normalized()
        if d.y < -0.55:
            continue
        c = cyl(tuple(Vector((0, 0.01, 0.05)) + d * 0.065), 0.012, 0.04, "spine", verts=4, radius_top=0.0)
        c.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
        spikes.append(c)
    face = ico((0, -0.07, 0.04), 0.035, "fur_brown", subdiv=1, scale=(0.9, 1.3, 0.8), rough=0.0)
    nose = ico((0, -0.115, 0.042), 0.009, "eye", subdiv=1, rough=0.0)
    return group(name, [body, face, nose] + spikes + eyes(0.018, -0.085, 0.058, 0.007))


def visitor_duck(name):
    parts = [
        ico((0, 0, 0.05), 0.06, "duck_white", subdiv=2, scale=(0.85, 1.3, 0.7), rough=0.02),
        ico((0, -0.06, 0.12), 0.036, "duck_white", subdiv=2, rough=0.02),
        box((0, -0.105, 0.115), (0.03, 0.035, 0.012), "beak"),
        ico((0, 0.08, 0.075), 0.02, "duck_white", subdiv=1, scale=(0.8, 1.2, 0.8), rough=0.0),
    ]
    parts += eyes(0.022, -0.088, 0.132, 0.006)
    return group(name, parts)


# ---------------------------------------------------------------------------
# Aşamalar
# ---------------------------------------------------------------------------
# Ada boyları: küçük s00-03, orta s04-07, büyük s08+
R_SMALL, R_MED, R_LARGE = 1.1, 1.9, 2.8

objects = []


def add(obj, x=0.0, y=0.0, rot_z=0.0, base_r=R_LARGE, scale=1.0):
    if scale != 1.0:
        obj.scale = (scale,) * 3
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    # Öğe ilk göründüğü adanın kenarına taşmasın: gerekirse merkeze çek
    first = int(obj.name[1:3])
    body_r = R_SMALL if first < 4 else R_MED if first < 8 else R_LARGE
    limit = body_r * outline(math.atan2(y, x)) * 0.86
    d = math.hypot(x, y)
    if d > limit:
        x, y = x * limit / d, y * limit / d
    place(obj, x, y, rot_z)
    obj.location.z = top_z(x, y, body_r)
    objects.append(obj)
    return obj


def polar(r, deg):
    a = math.radians(deg)
    return r * math.cos(a), r * math.sin(a)


# Gövdeler (yükseklik sıfırda hizalı, öğeler yer değiştirmez)
objects.append(island_body(stage_name(0, 3, "island_small"), R_SMALL, 1))
objects.append(island_body(stage_name(4, 7, "island_medium"), R_MED, 2))
objects.append(island_body(stage_name(8, 99, "island_large"), R_LARGE, 3))

# Ağaç: fidan → genç → olgun
TREE = (0.15, 0.1)
add(sapling(stage_name(0, 2, "tree_sapling")), *TREE, scale=1.8)
add(young_tree(stage_name(3, 5, "tree_young")), *TREE)
add(mature_tree(stage_name(6, 99, "tree_mature")), *TREE)
add(fruits(stage_name(11, 99, "tree_fruits")), *TREE)

# s01: çimen tutamları ve taşlar
for i, (r_, d) in enumerate([(0.55, 200), (0.75, 40), (0.85, 285), (0.45, 120), (0.9, 160)]):
    add(grass_tuft(stage_name(1, 99, f"tuft_{i}"), 30 + i), *polar(r_, d), rng.uniform(0, 6), scale=1.9)
add(rock(stage_name(1, 99, "rock_0"), 0.09, 40), *polar(0.85, 230), 0.4)
add(rock(stage_name(1, 99, "rock_1"), 0.06, 41), *polar(0.95, 250), 1.2)

# s02: çiçekler
petals = ["petal_pink", "petal_yellow", "petal_white", "petal_purple"]
for i, (r_, d) in enumerate([(0.6, 70), (0.68, 85), (0.5, 330), (0.78, 350), (0.62, 180), (0.4, 260)]):
    add(flower(stage_name(2, 99, f"flower_{i}"), petals[i % 4], 50 + i), *polar(r_, d), rng.uniform(0, 6), scale=1.9)

# s03: çalı
add(bush(stage_name(3, 99, "bush_0"), 60), *polar(0.8, 120))

# s04: (ada genişler) daha çok çimen ve çiçek kenarda
for i, (r_, d) in enumerate([(1.4, 10), (1.55, 140), (1.3, 220), (1.6, 270), (1.45, 75)]):
    add(grass_tuft(stage_name(4, 99, f"tuft_m{i}"), 70 + i), *polar(r_, d), rng.uniform(0, 6), scale=1.9)
for i, (r_, d) in enumerate([(1.35, 30), (1.5, 45), (1.25, 300), (1.6, 190)]):
    add(flower(stage_name(4, 99, f"flower_m{i}"), petals[(i + 1) % 4], 80 + i), *polar(r_, d), rng.uniform(0, 6), scale=1.9)
add(bush(stage_name(4, 99, "bush_1"), 90), *polar(1.45, 250))

# s05: mantarlar + basamak taşları
for i, (r_, d, s) in enumerate([(1.2, 165, 1.3), (1.28, 175, 0.9), (1.15, 182, 0.7)]):
    add(mushroom(stage_name(5, 99, f"mushroom_{i}"), s, 95 + i), *polar(r_, d), scale=1.6)
add(stepping_stones(stage_name(5, 99, "path"), [polar(r_, 300 + r_ * 8) for r_ in (0.55, 0.8, 1.05, 1.3, 1.55)]))

# Ön taraf (kameraya bakan ~300-340°) boş kalmasın
add(rock(stage_name(4, 99, "rock_m0"), 0.08, 135), *polar(1.5, 320), 2.0)
add(bush(stage_name(5, 99, "bush_2"), 136), *polar(1.35, 345))

# s06: ağaç olgunlaşır, bank
add(bench(stage_name(6, 99, "bench")), *polar(1.0, 10), math.radians(100))

# s07: fener
add(lantern(stage_name(7, 99, "lantern_0")), *polar(1.25, 335))

# s08: ada büyür, çam ağaçları
for i, (r_, d, h) in enumerate([(2.35, 150, 0.9), (2.55, 170, 0.7), (2.2, 200, 0.6)]):
    add(pine(stage_name(8, 99, f"pine_{i}"), h, 110 + i), *polar(r_, d))
for i, (r_, d) in enumerate([(2.3, 30), (2.5, 260), (2.1, 320), (2.4, 100)]):
    add(grass_tuft(stage_name(8, 99, f"tuft_l{i}"), 120 + i), *polar(r_, d), rng.uniform(0, 6), scale=1.9)
add(rock(stage_name(8, 99, "rock_2"), 0.14, 130), *polar(2.45, 230), 0.7)
add(bush(stage_name(8, 99, "bush_3"), 137), *polar(2.2, 340))
add(pine(stage_name(8, 99, "pine_3"), 0.55, 138), *polar(2.3, 15))
for i, (r_, d) in enumerate([(1.9, 315), (2.1, 350), (1.75, 5)]):
    add(flower(stage_name(8, 99, f"flower_f{i}"), petals[(i + 2) % 4], 150 + i), *polar(r_, d), scale=1.9)

# s09: gölet + nilüfer
POND = polar(2.0, 55)
add(pond(stage_name(9, 99, "pond"), 0.32), *POND, 0.3)
add(lilies(stage_name(9, 99, "lilies"), 0.32), *POND, 0.3)

# s10: köşk
add(pavilion(stage_name(10, 99, "pavilion")), *polar(2.0, 285), 0.2)
add(lantern(stage_name(10, 99, "lantern_1")), *polar(2.25, 262))
for i, (r_, d) in enumerate([(2.45, 300), (2.5, 315), (2.3, 330)]):
    add(flower(stage_name(10, 99, f"flower_l{i}"), petals[i % 4], 140 + i), *polar(r_, d), scale=1.9)

# s11: meyveler + kelebekler (uçuşu uygulamada canlandırılır)
for i, (r_, d, z, wing) in enumerate([(1.6, 60, 0.45, "wing_orange"), (2.2, 330, 0.6, "wing_blue"), (0.9, 210, 0.55, "wing_orange")]):
    b = add(butterfly(stage_name(11, 99, f"butterfly_{i}"), wing), *polar(r_, d), rng.uniform(0, 6))
    b.location.z = z

# Şablonlar (aşama öğesi değil; uygulama kopyalar)
TEMPLATES = []
for kind, fn in [("tulip", plant_tulip), ("rose", plant_rose), ("lavender", plant_lavender), ("sunflower", plant_sunflower), ("fruit", plant_fruit_tree)]:
    TEMPLATES.append(fn(f"plant__{kind}__bloom"))
TEMPLATES.append(plant_sprout("plant__any__sprout"))
TEMPLATES.append(plant_seedling("plant__any__seedling"))
for kind, fn in [("rabbit", visitor_rabbit), ("bird", visitor_bird), ("hedgehog", visitor_hedgehog), ("duck", visitor_duck)]:
    TEMPLATES.append(fn(f"visitor__{kind}"))
objects += TEMPLATES

# Uygulamanın bulmaması için geçici nesneleri temizle
for o in list(scene.objects):
    if o not in objects:
        bpy.data.objects.remove(o, do_unlink=True)

# ---------------------------------------------------------------------------
# Dışa aktarma
# ---------------------------------------------------------------------------

os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
    export_cameras=False,
    export_lights=False,
)
print(f"[island] {len(objects)} nesne → {OUT} ({os.path.getsize(OUT) / 1024:.0f} KB)")

# ---------------------------------------------------------------------------
# Önizleme: her aşamayı PNG'ye render et
# ---------------------------------------------------------------------------

if PREVIEW_DIR:
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    world = bpy.data.worlds.new("sky")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.62, 0.80, 0.95, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.7
    scene.world = world

    sun_data = bpy.data.lights.new("sun", "SUN")
    sun_data.energy = 2.6
    sun = bpy.data.objects.new("sun", sun_data)
    sun.rotation_euler = (math.radians(50), 0, math.radians(35))
    scene.collection.objects.link(sun)

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

    for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            scene.render.engine = engine
            break
        except TypeError:
            continue
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.view_settings.view_transform = "Standard"

    def visible(name, stage):
        if not name.startswith("s"):
            return False
        head = name.split("__")[0][1:]
        first, last = (int(x) for x in head.split("-"))
        return first <= stage <= last

    stages = [int(s) for s in os.environ.get("ISLAND_STAGES", "").split(",") if s] or range(STAGE_COUNT)
    for stage in stages:
        for o in objects:
            v = visible(o.name, stage)
            o.hide_render = not v
        r = R_SMALL if stage < 4 else R_MED if stage < 8 else R_LARGE
        dist = r * 2.5 + 1.0
        cam.location = (dist * 0.72, -dist * 0.72, dist * 0.62)
        target = Vector((0, 0, -0.25))
        cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(PREVIEW_DIR, f"stage_{stage:02d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"[island] önizleme aşama {stage}")

    # Şablonlar: yan yana dizip tek karede render et
    if os.environ.get("ISLAND_TEMPLATES"):
        for o in objects:
            o.hide_render = o not in TEMPLATES
        for k, o in enumerate(TEMPLATES):
            o.location = ((k % 6 - 2.5) * 0.36, (k // 6) * 0.5, 0)
        cam.location = (0.0, -3.0, 1.3)
        cam.rotation_euler = (Vector((0, 0.2, 0.08)) - cam.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(PREVIEW_DIR, "templates.png")
        bpy.ops.render.render(write_still=True)
