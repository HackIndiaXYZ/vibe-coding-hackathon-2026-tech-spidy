import * as THREE from "three";
import type { Dream, DreamObject } from "../dream";
import type { UpdateFn } from "./atmosphere";

function std(color: string, rough?: number) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough == null ? 0.9 : rough });
}

function glowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 1, 32, 32, 31);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function emissiveMat(color: string, intensity?: number, rough?: number) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: rough == null ? 0.6 : rough,
    emissive: new THREE.Color(color), emissiveIntensity: intensity == null ? 0.7 : intensity,
  });
}

function figure(spec: DreamObject, accent: string) {
  const g = new THREE.Group();
  const auraColor = spec.aura === "hostile" ? "#ff3b3b" : (spec.color || accent);
  const skin = new THREE.MeshStandardMaterial({
    color: spec.aura === "hostile" ? "#16080a" : "#11151f", roughness: 0.85,
    emissive: new THREE.Color(auraColor), emissiveIntensity: 0.06,
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.33, 1.2, 14), skin);
  body.position.y = 0.9;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skin);
  head.position.y = 1.72;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.03, 8, 40),
    new THREE.MeshBasicMaterial({ color: auraColor, transparent: true, opacity: 0.85 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06;
  const glow = new THREE.PointLight(auraColor, spec.aura === "hostile" ? 6 : 4, 8, 2);
  glow.position.y = 1.2;
  g.add(body, head, ring, glow);
  return g;
}

function tree(spec: DreamObject) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 2.6, 8), std("#191209", 1));
  trunk.position.y = 1.3;
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.2, 8), std(spec.color || "#0d211b", 1));
  c1.position.y = 3.9;
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.4, 8), std(spec.color || "#0f2a20", 1));
  c2.position.y = 5.3;
  g.add(trunk, c1, c2);
  return g;
}

function stall(spec: DreamObject) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.6), std("#1a2238", 0.95));
  base.position.y = 0.55;
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 1.7),
    new THREE.MeshStandardMaterial({ color: "#2a3450", emissive: new THREE.Color("#ffb35c"), emissiveIntensity: 0.25 }));
  counter.position.y = 1.16;
  const poleM = std("#141a2c", 0.9);
  [-0.95, 0.95].forEach((x) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), poleM);
    p.position.set(x, 1.9, 0); g.add(p);
  });
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.85, 0.8, 4),
    new THREE.MeshStandardMaterial({
      color: spec.color || "#3d2a4a", emissive: new THREE.Color("#ff9a4d"), emissiveIntensity: 0.32, roughness: 0.7,
    }));
  canopy.position.y = 3.0; canopy.rotation.y = Math.PI / 4;
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: "#ffd9a0" }));
  lamp.position.y = 2.2;
  g.add(base, counter, canopy, lamp);
  return g;
}

function shop(spec: DreamObject) {
  const g = stall(spec);
  g.scale.set(1.6, 1.4, 1.6);
  const light = new THREE.PointLight("#ffb35c", 9, 16, 2);
  light.position.y = 2.4;
  g.add(light);
  return g;
}

function door(spec: DreamObject, accent: string) {
  const g = new THREE.Group();
  const col = spec.color || accent;
  const frameM = std("#0d1018", 0.7);
  const W = 1.6, H = 3.0, T = 0.22;
  const left = new THREE.Mesh(new THREE.BoxGeometry(T, H, T), frameM);
  left.position.set(-W / 2, H / 2, 0);
  const right = left.clone(); right.position.x = W / 2;
  const top = new THREE.Mesh(new THREE.BoxGeometry(W + T, T, T), frameM);
  top.position.set(0, H, 0);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(W, H),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(col), transparent: true, opacity: 0.55,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  panel.position.set(0, H / 2, 0);
  const light = new THREE.PointLight(col, 10, 12, 2);
  light.position.set(0, H / 2, 0.4);
  g.add(left, right, top, panel, light);
  return g;
}

function orb(spec: DreamObject, accent: string) {
  const g = new THREE.Group();
  const col = spec.color || accent;
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16), emissiveMat(col, 1.1, 0.4));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex(), color: new THREE.Color(col), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85,
  }));
  halo.scale.set(2.4, 2.4, 1);
  const light = new THREE.PointLight(col, 6, 7, 2);
  g.add(core, halo, light);
  return g;
}

function crystal(spec: DreamObject, accent: string) {
  const col = spec.color || accent;
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(col), roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.82,
      emissive: new THREE.Color(col), emissiveIntensity: spec.emissive ? 0.6 : 0.18,
    }));
  m.scale.y = 1.8;
  const g = new THREE.Group(); g.add(m);
  g.add(new THREE.PointLight(col, 3, 6, 2));
  return g;
}

function stair(spec: DreamObject) {
  const g = new THREE.Group();
  const m = std(spec.color || "#2a3350", 0.9);
  const n = 12, sw = 2.2, sh = 0.4, sd = 0.7;
  for (let i = 0; i < n; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, sd), m);
    step.position.set(0, i * sh + sh / 2, -i * sd);
    g.add(step);
  }
  return g;
}

function windowObj(spec: DreamObject, accent: string) {
  const g = new THREE.Group();
  const col = spec.color || accent;
  const frameM = std("#0d1018", 0.7);
  const W = 1.4, H = 1.8, T = 0.14;
  const top = new THREE.Mesh(new THREE.BoxGeometry(W + T, T, T), frameM);
  top.position.y = H / 2;
  const bot = top.clone(); bot.position.y = -H / 2;
  const left = new THREE.Mesh(new THREE.BoxGeometry(T, H, T), frameM);
  left.position.x = -W / 2;
  const right = left.clone(); right.position.x = W / 2;
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(W, H),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(col), transparent: true, opacity: 0.4,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  g.add(top, bot, left, right, pane);
  g.position.y = 2.0;
  return g;
}

function primitive(spec: DreamObject, accent: string, type: string) {
  let geo: THREE.BufferGeometry;
  if (type === "pillar") geo = new THREE.CylinderGeometry(0.5, 0.55, 1, 12);
  else if (type === "sphere") geo = new THREE.SphereGeometry(0.6, 24, 18);
  else if (type === "torus") geo = new THREE.TorusGeometry(0.6, 0.22, 14, 36);
  else geo = new THREE.BoxGeometry(1, 1, 1);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.color || "#202a40"), roughness: 0.85,
    emissive: spec.emissive ? new THREE.Color(spec.color || accent) : new THREE.Color(0),
    emissiveIntensity: spec.emissive ? 0.7 : 0,
  }));
  m.position.y = 0.5;
  return m;
}

function divine(spec: DreamObject, accent: string) {
  const g = figure(spec, accent);
  g.scale.set(3.4, 3.4, 3.4);
  const col = spec.color || accent;
  g.traverse((o: THREE.Object3D) => {
    const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (mat && mat.emissive) mat.emissiveIntensity = 0.5;
  });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex(), color: new THREE.Color(col), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6,
  }));
  halo.scale.set(7, 9, 1); halo.position.y = 1.2;
  g.add(halo);
  g.add(new THREE.PointLight(col, 14, 40, 2));
  return g;
}

function build(spec: DreamObject, accent: string): THREE.Object3D {
  switch (spec.type) {
    case "figure": return spec.scale && spec.scale[0] >= 2.5 ? divine(spec, accent) : figure(spec, accent);
    case "tree": return tree(spec);
    case "stall": return stall(spec);
    case "shop": return shop(spec);
    case "door": return door(spec, accent);
    case "orb": return orb(spec, accent);
    case "crystal": return crystal(spec, accent);
    case "stair": return stair(spec);
    case "window": return windowObj(spec, accent);
    default: return primitive(spec, accent, spec.type);
  }
}

const GEOMETRIC: Record<string, number> = {
  figure: 1, tree: 1, stall: 1, shop: 1, door: 1, orb: 1, crystal: 1, stair: 1, window: 1,
};

function applyScale(o: THREE.Object3D, spec: DreamObject) {
  if (GEOMETRIC[spec.type]) {
    if (spec.scale && spec.type === "figure") o.scale.set(spec.scale[0], spec.scale[1], spec.scale[2]);
    return;
  }
  const s = spec.scale || [1, 1, 1];
  o.scale.set(s[0], s[1], s[2]);
  o.position.y = s[1] / 2;
}

function animator(o: THREE.Object3D, spec: DreamObject): UpdateFn | null {
  const base = o.position.clone();
  const phase = Math.random() * Math.PI * 2;
  const wantFloat = spec.float || spec.type === "orb" || spec.type === "window";
  const beh = spec.behavior || "static";
  if (!wantFloat && !spec.spin && beh === "static") return null;

  return (t, dt, camera) => {
    if (beh === "approach" && camera) {
      const dx = camera.position.x - o.position.x;
      const dz = camera.position.z - o.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 2.4) { o.position.x += (dx / dist) * 0.9 * dt; o.position.z += (dz / dist) * 0.9 * dt; }
      o.rotation.y = Math.atan2(dx, dz);
    } else if (beh === "drift") {
      o.position.z = base.z + (((t * 0.6 + phase) % 24) - 12);
      o.position.x = base.x + Math.sin(t * 0.7 + phase) * 0.25;
      o.rotation.y = phase + Math.sin(t * 0.5) * 0.15;
    } else if (beh === "wander") {
      o.position.x = base.x + Math.sin(t * 0.4 + phase) * 2.2;
      o.position.z = base.z + Math.cos(t * 0.33 + phase) * 2.2;
    }
    if (wantFloat) o.position.y = base.y + 1.4 + Math.sin(t * 1.1 + phase) * 0.28;
    if (spec.spin) o.rotation.y += dt * 0.6;
  };
}

// the emotional beats the dream narrates when you look at them
const NARRATIVE: Record<string, number> = { orb: 1, door: 1, figure: 1, window: 1, crystal: 1 };

function place(scene: THREE.Object3D, spec: DreamObject, accent: string, animated: UpdateFn[]) {
  const count = spec.count || 1;
  for (let i = 0; i < count; i++) {
    const o = build(spec, accent);
    applyScale(o, spec);
    if (spec.label) {
      o.userData.label = spec.label;
      o.userData.narrative = NARRATIVE[spec.type] || 0;
    }

    if (spec.arrangement === "row" && count > 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const step = Math.floor(i / 2);
      const sp = spec.spacing || 6;
      o.position.x = side * (spec.row_offset || 4.5) + (Math.random() - 0.5) * 0.6;
      o.position.z = -(spec.row_start || 4) - step * sp;
      o.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    } else if (count > 1 && spec.scatter_radius) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.8;
      const d = spec.scatter_radius * (0.45 + Math.random() * 0.55);
      o.position.x = Math.cos(a) * d;
      o.position.z = Math.sin(a) * d;
      o.rotation.y = Math.random() * Math.PI * 2;
    } else if (spec.position) {
      o.position.x += spec.position[0];
      o.position.y += spec.position[1];
      o.position.z += spec.position[2];
      if (spec.rotation_y) o.rotation.y = spec.rotation_y;
    }

    scene.add(o);
    const upd = animator(o, spec);
    if (upd) animated.push(upd);
  }
}

export function buildObjects(scene: THREE.Object3D, dream: Dream): UpdateFn | undefined {
  const animated: UpdateFn[] = [];
  (dream.objects || []).forEach((spec) => place(scene, spec, dream.palette.accent, animated));
  if (!animated.length) return undefined;
  return (t, dt, camera) => { for (let i = 0; i < animated.length; i++) animated[i](t, dt, camera); };
}
