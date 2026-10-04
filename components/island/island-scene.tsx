import { Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber/native";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  STAGES_PER_ISLAND,
  hashString,
  findPlantSpot,
  plantPhase,
  type Footprint,
  type Plant,
  type VisitorKind,
} from "@/lib/island/progress";
import { HUE_SHIFTED_MATERIALS, HUE_STEP, themeForIsland, type Backdrop } from "@/lib/island/themes";

const MODEL = require("../../assets/models/island.glb");

const NO_PLANTS: Plant[] = [];

/** Takımadada arkada gösterilen en fazla eski ada */
const MAX_MINI_ISLANDS = 6;

// ---------------------------------------------------------------------------
// Model yardımcıları
// ---------------------------------------------------------------------------

type StageRange = { first: number; last: number };

function parseStage(name: string): StageRange | null {
  const m = /^s(\d{2})-(\d{2})__/.exec(name);
  return m ? { first: Number(m[1]), last: Number(m[2]) } : null;
}

const visibleAt = (r: StageRange, stage: number) => stage >= r.first && stage <= r.last;
const isBody = (name: string) => name.includes("__island_");

/** Temaya göre materyal kopyaları; aynı tema için önbellekten */
const themedMaterialCache = new Map<number, Map<string, THREE.Material>>();

function themedMaterial(src: THREE.Material, islandIndex: number) {
  let cache = themedMaterialCache.get(islandIndex);
  if (!cache) {
    cache = new Map();
    themedMaterialCache.set(islandIndex, cache);
  }
  const hit = cache.get(src.uuid);
  if (hit) return hit;
  const theme = themeForIsland(islandIndex);
  const override = theme.colors[src.name];
  const shift = HUE_SHIFTED_MATERIALS.has(src.name) ? theme.cycle * HUE_STEP : 0;
  let out = src;
  if ((override || shift) && src instanceof THREE.MeshStandardMaterial) {
    const m = src.clone();
    if (override) m.color.set(override);
    if (shift) m.color.offsetHSL(shift, 0, 0);
    out = m;
  }
  cache.set(src.uuid, out);
  return out;
}

function applyTheme(root: THREE.Object3D, islandIndex: number) {
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.material = Array.isArray(o.material)
        ? o.material.map((m) => themedMaterial(m, islandIndex))
        : themedMaterial(o.material, islandIndex);
    }
  });
}

/** Ada gövdesinin (x, z) noktasındaki üst yüzey yüksekliği */
function surfaceY(body: THREE.Object3D | undefined, x: number, z: number) {
  if (!body) return 0;
  const ray = new THREE.Raycaster(new THREE.Vector3(x, 5, z), new THREE.Vector3(0, -1, 0));
  const hit = ray.intersectObject(body, true)[0];
  return hit ? hit.point.y : 0;
}

const easeOutBack = (t: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// ---------------------------------------------------------------------------
// Sihirli parıltılar: tek Points havuzu, eklemeli karışım (siyah = görünmez)
// ---------------------------------------------------------------------------

const SPARKLE_CAPACITY = 600;
const SPARKLE_LIFE = 1.3;
const sparkleQueue: { pos: THREE.Vector3; radius: number; count: number }[] = [];

function sparkle(pos: THREE.Vector3, radius: number, count = 26) {
  sparkleQueue.push({ pos: pos.clone(), radius, count });
}

const SPARK_COLORS = [new THREE.Color("#ffe39a"), new THREE.Color("#fff6d8"), new THREE.Color("#ffc96b"), new THREE.Color("#d9f7ff")];

function Sparkles() {
  const state = useMemo(() => {
    const positions = new Float32Array(SPARKLE_CAPACITY * 3);
    const colors = new Float32Array(SPARKLE_CAPACITY * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particles = Array.from({ length: SPARKLE_CAPACITY }, () => ({
      age: Infinity,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      color: SPARK_COLORS[0],
    }));
    return { geometry, positions, colors, particles, cursor: 0 };
  }, []);

  useFrame((_, dt) => {
    while (sparkleQueue.length) {
      const burst = sparkleQueue.shift()!;
      for (let i = 0; i < burst.count; i++) {
        const p = state.particles[state.cursor];
        state.cursor = (state.cursor + 1) % SPARKLE_CAPACITY;
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * burst.radius;
        p.pos.set(burst.pos.x + Math.cos(a) * r, burst.pos.y + Math.random() * burst.radius * 0.8, burst.pos.z + Math.sin(a) * r);
        p.vel.set(Math.cos(a) * 0.25, 0.5 + Math.random() * 0.7, Math.sin(a) * 0.25);
        p.age = -Math.random() * 0.25;
        p.color = SPARK_COLORS[i % SPARK_COLORS.length];
      }
    }
    let alive = false;
    for (let i = 0; i < SPARKLE_CAPACITY; i++) {
      const p = state.particles[i];
      if (p.age < SPARKLE_LIFE) {
        p.age += dt;
        if (p.age > 0) {
          p.pos.addScaledVector(p.vel, dt);
          p.vel.multiplyScalar(Math.pow(0.35, dt));
        }
        alive = true;
      }
      const k = p.age < 0 || p.age >= SPARKLE_LIFE ? 0 : Math.sin((p.age / SPARKLE_LIFE) * Math.PI) * (0.6 + 0.4 * Math.sin(p.age * 30 + i));
      state.positions.set([p.pos.x, p.pos.y, p.pos.z], i * 3);
      state.colors.set([p.color.r * k, p.color.g * k, p.color.b * k], i * 3);
    }
    if (alive) {
      state.geometry.attributes.position.needsUpdate = true;
      state.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <points geometry={state.geometry} frustumCulled={false}>
      <pointsMaterial size={5} sizeAttenuation={false} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Tek ada: kalıcı sahne, değişiklikler fark (diff) olarak uygulanır
// ---------------------------------------------------------------------------

type Live = {
  obj: THREE.Object3D;
  /** in: beliriyor, alive: yerinde, out: kayboluyor */
  phase: "in" | "alive" | "out";
  start: number;
  delay: number;
  from: number;
  base: THREE.Vector3;
  kind: "stage" | "body" | "plant" | "visitor";
  sparkled: boolean;
};

type IslandProps = {
  gltf: THREE.Group;
  index: number;
  stage: number;
  /** İlk açılışta bu aşamada görünenler hazır gelir, sonrakiler belirir; null → hepsi hazır */
  popFromStage: number | null;
  /** Belirme animasyonunu yeniden tetikler (geliştirici "tekrar oynat") */
  popToken?: number;
  plants: Plant[];
  wateredDates: ReadonlySet<string>;
  today: string;
  growBonus?: number;
  visitor: VisitorKind | null;
  night: number;
  onBody?: (info: { radius: number; footprints: Footprint[] }) => void;
  onPopsDone?: () => void;
  /** Her sihirli belirme / kaybolmada (ses efekti için) */
  onMagic?: (kind: "appear" | "vanish") => void;
};

function Island({
  gltf,
  index,
  stage,
  popFromStage,
  popToken = 0,
  plants,
  wateredDates,
  today,
  growBonus = 0,
  visitor,
  night,
  onBody,
  onPopsDone,
  onMagic,
}: IslandProps) {
  const group = useMemo(() => new THREE.Group(), []);
  const live = useRef(new Map<string, Live>());
  const clock = useRef(0);
  const mounted = useRef(false);
  const lastToken = useRef(popToken);
  const pending = useRef(0);
  const callbacks = useRef({ onPopsDone, onMagic });
  callbacks.current = { onPopsDone, onMagic };

  // İstenen sahne içeriği: anahtar → şablon nesne adı + konum
  useEffect(() => {
    const map = live.current;
    const firstRun = !mounted.current;
    mounted.current = true;
    const desired = new Map<string, { name: string; kind: Live["kind"]; place?: (o: THREE.Object3D, body?: THREE.Object3D) => void; animate: boolean }>();

    // "Tekrar oynat": görülen aşamadan sonraki öğeleri anında kaldır ki yeniden belirsinler
    const replay = popToken !== lastToken.current;
    lastToken.current = popToken;
    if (replay && popFromStage !== null) {
      for (const [key, item] of map) {
        const range = parseStage(key);
        if (range && (popFromStage < 0 || !visibleAt(range, popFromStage))) {
          if (item.phase === "in") pending.current = Math.max(0, pending.current - 1);
          group.remove(item.obj);
          map.delete(key);
        }
      }
    }

    const isNew = (range: StageRange) =>
      popFromStage !== null && (popFromStage < 0 || !visibleAt(range, popFromStage));
    for (const child of gltf.children) {
      const range = parseStage(child.name);
      if (!range || !visibleAt(range, stage)) continue;
      // İlk açılışta yalnız görülmemiş aşamadakiler belirir; sonradan eklenen her öğe belirir
      const animate = firstRun ? isNew(range) : true;
      desired.set(child.name, { name: child.name, kind: isBody(child.name) ? "body" : "stage", animate });
    }
    for (const plant of plants) {
      const phase = plantPhase(plant, wateredDates, today, growBonus);
      const name = phase === "bloom" ? `plant__${plant.kind}__bloom` : `plant__any__${phase}`;
      desired.set(`plant:${plant.id}:${phase}`, {
        name,
        kind: "plant",
        animate: !firstRun,
        place: (o, body) => {
          o.position.set(plant.x, surfaceY(body, plant.x, plant.z), plant.z);
          o.rotation.y = (hashString(plant.id) % 628) / 100;
        },
      });
    }

    // Kaybolacaklar
    for (const [key, item] of map) {
      if (!desired.has(key) && item.phase !== "out") {
        item.phase = "out";
        item.start = clock.current;
        item.delay = 0;
        item.sparkled = false;
      }
    }

    // Gövde önce eklenir: bitki ve ziyaretçi yüksekliği ona göre hesaplanır
    const ordered = [...desired.entries()].sort((a, b) => Number(b[1].kind === "body") - Number(a[1].kind === "body"));
    let stagger = 0;
    const footprints: Footprint[] = [];
    for (const [key, want] of ordered) {
      const existing = map.get(key);
      if (existing && existing.phase !== "out") continue;
      const src = gltf.getObjectByName(want.name);
      if (!src) continue;
      // Kaybolurken geri istendi: eski kopya haritadan düşüp sahnede yarım boyda donmasın
      if (existing) group.remove(existing.obj);
      const obj = src.clone(true);
      applyTheme(obj, index);
      const body = [...map.values()].find((v) => v.kind === "body" && v.phase !== "out")?.obj;
      want.place?.(obj, body);
      group.add(obj);
      const from = want.kind === "body" ? 0.6 : 0;
      const item: Live = {
        obj,
        phase: want.animate ? "in" : "alive",
        start: clock.current,
        delay: want.animate ? 0.35 + stagger : 0,
        from,
        base: obj.position.clone(),
        kind: want.kind,
        sparkled: false,
      };
      if (want.animate) {
        obj.scale.setScalar(from);
        stagger += want.kind === "body" ? 0.25 : 0.14;
        pending.current += 1;
      }
      map.set(key, item);
    }

    // Gövde değiştiyse bitkileri yeni yüzeye oturt
    const body = [...map.values()].find((v) => v.kind === "body" && v.phase !== "out")?.obj;
    for (const plant of plants) {
      for (const [key, item] of map) {
        if (key.startsWith(`plant:${plant.id}:`) && item.phase !== "out") {
          item.obj.position.y = surfaceY(body, plant.x, plant.z);
          item.base.y = item.obj.position.y;
        }
      }
    }

    // Bitki dikilmesin diye öğe izdüşümleri (gelecek aşamalar dahil)
    for (const child of gltf.children) {
      const range = parseStage(child.name);
      if (!range || isBody(child.name) || range.last < stage) continue;
      const box = new THREE.Box3().setFromObject(child);
      const size = box.getSize(new THREE.Vector3());
      const c = box.getCenter(new THREE.Vector3());
      footprints.push({ x: c.x, z: c.z, r: Math.max(size.x, size.z) * 0.45 });
    }
    for (const p of plants) footprints.push({ x: p.x, z: p.z, r: 0.12 });

    // Günün ziyaretçisi
    const visitorKey = visitor ? `visitor:${visitor}` : null;
    for (const [key, item] of map) {
      if (key.startsWith("visitor:") && key !== visitorKey && item.phase !== "out") {
        item.phase = "out";
        item.start = clock.current;
        item.delay = 0;
        item.sparkled = false;
      }
    }
    if (visitorKey && body && !(map.has(visitorKey) && map.get(visitorKey)!.phase !== "out")) {
      const src = gltf.getObjectByName(`visitor__${visitor}`);
      const radius = new THREE.Box3().setFromObject(body).getSize(new THREE.Vector3()).x * 0.36;
      const spot = src && findPlantSpot(radius, footprints, hashString(`${today}:${visitor}`), 0.14);
      if (src && spot) {
        const leaving = map.get(visitorKey);
        if (leaving) group.remove(leaving.obj);
        const obj = src.clone(true);
        applyTheme(obj, index);
        obj.position.set(spot.x, surfaceY(body, spot.x, spot.z), spot.z);
        obj.rotation.y = Math.PI / 4 + ((hashString(today) % 60) - 30) / 100;
        group.add(obj);
        const animate = !firstRun || (popFromStage !== null);
        obj.scale.setScalar(animate ? 0 : 1);
        if (animate) pending.current += 1;
        map.set(visitorKey, {
          obj,
          phase: animate ? "in" : "alive",
          start: clock.current,
          delay: animate ? 0.6 + stagger : 0,
          from: 0,
          base: obj.position.clone(),
          kind: "visitor",
          sparkled: false,
        });
      }
    }

    if (body && onBody) {
      const size = new THREE.Box3().setFromObject(body).getSize(new THREE.Vector3());
      onBody({ radius: Math.min(size.x, size.z) * 0.4, footprints });
    }
    if (pending.current === 0) callbacks.current.onPopsDone?.();
    // onBody kasıtlı olarak dışarıda: üst bileşen yeniden render olunca sahne değişmesin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, index, stage, popFromStage, popToken, plants, wateredDates, today, growBonus, visitor, group]);

  // Ada değişince (ör. yeni ada) her şey sıfırdan
  useEffect(() => {
    const map = live.current;
    return () => {
      for (const item of map.values()) group.remove(item.obj);
      map.clear();
      mounted.current = false;
    };
  }, [gltf, index, group]);

  useFrame((state, dt) => {
    clock.current += dt;
    const t = clock.current;
    const map = live.current;
    let magicAppear = false;
    let magicVanish = false;

    for (const [key, item] of map) {
      const o = item.obj;
      if (item.phase === "in") {
        const k = Math.min(1, Math.max(0, (t - item.start - item.delay) / 0.6));
        if (k > 0 && !item.sparkled) {
          item.sparkled = true;
          const box = new THREE.Box3().setFromObject(o);
          const size = box.getSize(new THREE.Vector3());
          const radius = item.kind === "body" ? 1.2 : Math.max(0.12, Math.max(size.x, size.z) * 0.6);
          const center = o.getWorldPosition(new THREE.Vector3());
          sparkle(center, radius, item.kind === "body" ? 70 : 24);
          magicAppear = true;
        }
        o.scale.setScalar(item.from + (1 - item.from) * easeOutBack(k));
        if (k >= 1) {
          item.phase = "alive";
          o.scale.setScalar(1);
          pending.current = Math.max(0, pending.current - 1);
          if (pending.current === 0) callbacks.current.onPopsDone?.();
        }
      } else if (item.phase === "out") {
        const k = Math.min(1, (t - item.start) / (item.kind === "body" ? 0.25 : 0.4));
        if (!item.sparkled) {
          item.sparkled = true;
          if (item.kind !== "body") {
            sparkle(o.getWorldPosition(new THREE.Vector3()), 0.25, 18);
            magicVanish = true;
          }
        }
        o.scale.setScalar(Math.max(0.0001, 1 - k * k));
        if (k >= 1) {
          group.remove(o);
          map.delete(key);
        }
      }

      if (item.phase === "alive") {
        // Kelebekler daire çizip kanat çırpar
        if (o.name.includes("butterfly")) {
          const ph = hashString(o.name) % 100;
          const a = t * 0.8 + ph;
          o.position.set(item.base.x + Math.cos(a) * 0.35, item.base.y + Math.sin(t * 2 + ph) * 0.08, item.base.z + Math.sin(a) * 0.35);
          o.rotation.y = -a;
          o.scale.x = 0.55 + Math.abs(Math.sin(t * 14 + ph)) * 0.45;
        }
        // Ziyaretçi ara ara zıplar
        if (item.kind === "visitor") {
          const cycle = (t + 1.3) % 3.2;
          o.position.y = item.base.y + (cycle < 0.5 ? Math.sin((cycle / 0.5) * Math.PI) * 0.05 : 0);
        }
      }
    }

    if (magicAppear) callbacks.current.onMagic?.("appear");
    else if (magicVanish) callbacks.current.onMagic?.("vanish");

    // Fenerler: gece parlar
    group.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const m = o.material;
      if (m instanceof THREE.MeshStandardMaterial && m.name === "lamp") m.emissiveIntensity = 0.4 + night * 3.2;
    });
    void state;
  });

  return <primitive object={group} />;
}

// ---------------------------------------------------------------------------
// Arka plan
// ---------------------------------------------------------------------------

function SkyDome({ top, bottom }: { top: string; bottom: string }) {
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(60, 24, 16);
    const cTop = new THREE.Color(top);
    const cBottom = new THREE.Color(bottom);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const k = THREE.MathUtils.clamp((pos.getY(i) / 60 + 0.15) / 0.85, 0, 1);
      c.copy(cBottom).lerp(cTop, Math.pow(k, 0.8));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [top, bottom]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

function Stars({ opacity }: { opacity: number }) {
  const geometry = useMemo(() => {
    let seed = 42;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pts: number[] = [];
    for (let i = 0; i < 260; i++) {
      const theta = rand() * Math.PI * 2;
      const y = 0.15 + rand() * 0.85;
      const r = Math.sqrt(1 - y * y);
      pts.push(Math.cos(theta) * r * 55, y * 55, Math.sin(theta) * r * 55);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  if (opacity <= 0.01) return null;
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#ffffff" size={2.2} sizeAttenuation={false} transparent opacity={opacity} depthWrite={false} fog={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Kamera ve etkileşim
// ---------------------------------------------------------------------------

/** Kamera: dokunmayla değişen küresel koordinatlar (yörünge) */
export type Orbit = {
  yaw: number;
  pitch: number;
  /** 1 = varsayılan uzaklık; küçüldükçe yakınlaşır */
  zoom: number;
  yawVelocity: number;
  dragging: boolean;
  /** Son etkileşim (saniye, performance.now/1000); bir süre dokunulmazsa kendiliğinden döner */
  lastTouch: number;
};

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 1.5;
export const PITCH_MIN = 0.12;
export const PITCH_MAX = 1.25;
const IDLE_SPIN_AFTER = 4;

/** Seçme: dokunulan noktadan ışın, adadaki en üst adlı nesneyi bulur */
export type Picker = (x: number, y: number) => void;

export type PickInfo = {
  /** Nesne türü: tree, flower, visitor, plant … */
  kind: string;
  /** Bitki evresi / ziyaretçi türü gibi ek bilgi */
  detail?: string;
};

/** Dokunulan nesneye kısa zıplama */
const bounces = new Map<THREE.Object3D, { start: number; base: number }>();

function kindOf(name: string): PickInfo | null {
  if (name.startsWith("visitor__")) return { kind: "visitor", detail: name.split("__")[1] };
  if (name.startsWith("plant__")) {
    const [, plantKind, phase] = name.split("__");
    return { kind: "plant", detail: phase === "bloom" ? plantKind : phase };
  }
  const m = /^s\d{2}-\d{2}__([a-z]+)/.exec(name);
  if (!m) return null;
  const key = m[1];
  if (key === "island") return null;
  return { kind: key };
}

function Rig({
  orbit,
  distance,
  pickerRef,
  onPick,
  children,
}: {
  orbit: RefObject<Orbit>;
  distance: number;
  pickerRef: RefObject<Picker | null>;
  onPick?: (info: PickInfo) => void;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const currentDistance = useRef(distance);

  // Dokunma → ışın → adlı üst nesne
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    pickerRef.current = (x, y) => {
      if (!group.current) return;
      const ndc = new THREE.Vector2((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      for (const hit of raycaster.intersectObject(group.current, true)) {
        // Adından türü anlaşılan ilk ata (öğe, bitki, ziyaretçi); ada gövdesi atlanır
        let node: THREE.Object3D | null = hit.object;
        while (node && !kindOf(node.name)) node = node.parent;
        if (!node) continue;
        const info = kindOf(node.name);
        if (!info) continue;
        if (!bounces.has(node)) bounces.set(node, { start: -1, base: node.scale.x || 1 });
        onPick?.(info);
        return;
      }
    };
    return () => {
      pickerRef.current = null;
    };
  }, [camera, size, pickerRef, onPick]);

  useFrame((state, dt) => {
    const o = orbit.current;
    const now = state.clock.elapsedTime;
    if (!o.dragging) {
      o.yaw += o.yawVelocity * dt;
      o.yawVelocity *= Math.pow(0.05, dt);
      if (performance.now() / 1000 - o.lastTouch > IDLE_SPIN_AFTER) o.yaw += dt * 0.06;
    }
    if (group.current) group.current.position.y = Math.sin(now * 0.6) * 0.05;

    // Zıplamalar
    for (const [node, b] of bounces) {
      if (b.start < 0) b.start = now;
      const k = (now - b.start) / 0.6;
      if (k >= 1) {
        node.scale.setScalar(b.base);
        bounces.delete(node);
      } else {
        node.scale.setScalar(b.base * (1 + Math.sin(k * Math.PI * 3) * 0.16 * (1 - k)));
      }
    }

    const target = distance * o.zoom;
    currentDistance.current += (target - currentDistance.current) * Math.min(1, dt * 6);
    const d = currentDistance.current;
    const horizontal = Math.cos(o.pitch) * d;
    camera.position.set(Math.sin(o.yaw) * horizontal, Math.sin(o.pitch) * d, Math.cos(o.yaw) * horizontal);
    // Yakınlaştıkça bakış noktası adanın üstüne iner
    camera.lookAt(0, 0.05 * distance * o.zoom, 0);
  });

  return <group ref={group}>{children}</group>;
}

// ---------------------------------------------------------------------------
// Dışa açık bileşen
// ---------------------------------------------------------------------------

export type IslandSceneProps = {
  island: number;
  stage: number;
  popFromLevel: number | null;
  popToken?: number;
  plants: Plant[];
  wateredDates: ReadonlySet<string>;
  today: string;
  growBonus?: number;
  visitor: VisitorKind | null;
  backdrop: Backdrop;
  onBody?: IslandProps["onBody"];
  onPopsDone?: () => void;
  onPick?: (info: PickInfo) => void;
  onMagic?: IslandProps["onMagic"];
};

function World(
  props: IslandSceneProps & { orbit: RefObject<Orbit>; pickerRef: RefObject<Picker | null> },
) {
  // MODEL bir Metro asset id'si; r3f native polyfill'i expo-asset ile çözer
  const gltf = useLoader(GLTFLoader, MODEL) as GLTF;
  const scene = gltf.scene;
  const { island, stage, backdrop } = props;

  const plantsByIsland = useMemo(() => {
    const map = new Map<number, Plant[]>();
    for (const p of props.plants) map.set(p.island, [...(map.get(p.island) ?? []), p]);
    return map;
  }, [props.plants]);

  // Seviye → (ada, aşama). Önceki ada görülmüşse farklı adadaysa hepsi belirir.
  const popFromStage = useMemo(() => {
    if (props.popFromLevel === null) return null;
    const seenIsland = Math.floor(props.popFromLevel / STAGES_PER_ISLAND);
    if (seenIsland < island) return -1;
    const seenStage = props.popFromLevel % STAGES_PER_ISLAND;
    return seenStage >= stage ? null : seenStage;
  }, [props.popFromLevel, island, stage]);

  // Varsayılan kamera uzaklığı ada boyuna göre (gövde: küçük/orta/büyük)
  const distance = stage < 4 ? 7 : stage < 8 ? 9.8 : 13;

  const minis = [];
  for (let k = Math.max(0, island - MAX_MINI_ISLANDS); k < island; k++) {
    const slot = island - 1 - k;
    const a = Math.PI * 1.25 + (slot % 2 === 0 ? 1 : -1) * (0.55 + Math.floor(slot / 2) * 0.5);
    const r = 7.5 + slot * 0.8;
    minis.push(
      <group key={k} position={[Math.cos(a) * r, -0.6 + (slot % 3) * 0.5, Math.sin(a) * r]} scale={0.38}>
        <Island
          gltf={scene}
          index={k}
          stage={STAGES_PER_ISLAND - 1}
          popFromStage={null}
          plants={plantsByIsland.get(k) ?? NO_PLANTS}
          wateredDates={props.wateredDates}
          today={props.today}
          growBonus={props.growBonus}
          visitor={null}
          night={backdrop.night}
        />
      </group>,
    );
  }

  return (
    <>
      <SkyDome top={backdrop.top} bottom={backdrop.bottom} />
      <fog attach="fog" args={[backdrop.fog, distance * 1.4, distance * 3.2]} />
      <Stars opacity={backdrop.stars} />
      <hemisphereLight args={[backdrop.top, "#6b5a3e", backdrop.ambient * 0.6]} />
      <ambientLight intensity={backdrop.ambient * 0.5} />
      <directionalLight position={[4, 8, 3]} intensity={backdrop.sunIntensity} color={backdrop.sun} />
      <Rig orbit={props.orbit} distance={distance} pickerRef={props.pickerRef} onPick={props.onPick}>
        <Island
          key={island}
          gltf={scene}
          index={island}
          stage={stage}
          popFromStage={popFromStage}
          popToken={props.popToken}
          plants={plantsByIsland.get(island) ?? NO_PLANTS}
          wateredDates={props.wateredDates}
          today={props.today}
          growBonus={props.growBonus}
          visitor={props.visitor}
          night={backdrop.night}
          onBody={props.onBody}
          onPopsDone={props.onPopsDone}
          onMagic={props.onMagic}
        />
        {minis}
        <Sparkles />
      </Rig>
    </>
  );
}

const nowSec = () => performance.now() / 1000;

export function IslandScene(props: IslandSceneProps) {
  const orbit = useRef<Orbit>({
    yaw: 0.8,
    pitch: 0.62,
    zoom: 1,
    yawVelocity: 0,
    dragging: false,
    lastTouch: 0,
  });
  const pickerRef = useRef<Picker | null>(null);

  const gesture = useMemo(() => {
    const start = { yaw: 0, pitch: 0, zoom: 1 };
    // Tek parmak: yörünge (yatay = etrafında dön, dikey = eğim)
    const pan = Gesture.Pan()
      .runOnJS(true)
      .maxPointers(1)
      .onStart(() => {
        const o = orbit.current;
        o.dragging = true;
        o.yawVelocity = 0;
        o.lastTouch = nowSec();
        start.yaw = o.yaw;
        start.pitch = o.pitch;
      })
      .onUpdate((e) => {
        const o = orbit.current;
        o.yaw = start.yaw - e.translationX * 0.008;
        o.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, start.pitch + e.translationY * 0.005));
        o.lastTouch = nowSec();
      })
      .onEnd((e) => {
        const o = orbit.current;
        o.yawVelocity = -e.velocityX * 0.008;
        o.dragging = false;
        o.lastTouch = nowSec();
      });
    // İki parmak: yakınlaştır / uzaklaştır
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onStart(() => {
        start.zoom = orbit.current.zoom;
        orbit.current.lastTouch = nowSec();
      })
      .onUpdate((e) => {
        orbit.current.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, start.zoom / e.scale));
        orbit.current.lastTouch = nowSec();
      });
    // Dokun: nesne seç (zıplar + bilgi)
    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDuration(250)
      .onEnd((e, success) => {
        if (success) pickerRef.current?.(e.x, e.y);
        orbit.current.lastTouch = nowSec();
      });
    // Çift dokun: varsayılan görünüme dön
    const doubleTap = Gesture.Tap()
      .runOnJS(true)
      .numberOfTaps(2)
      .onEnd((_e, success) => {
        if (!success) return;
        orbit.current.zoom = 1;
        orbit.current.pitch = 0.62;
      });
    return Gesture.Race(Gesture.Simultaneous(pan, pinch), Gesture.Exclusive(doubleTap, tap));
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <View style={StyleSheet.absoluteFill}>
        <Canvas flat camera={{ fov: 38, near: 0.1, far: 200, position: [4, 3, 4] }}>
          <Suspense fallback={null}>
            <World {...props} orbit={orbit} pickerRef={pickerRef} />
          </Suspense>
        </Canvas>
      </View>
    </GestureDetector>
  );
}
