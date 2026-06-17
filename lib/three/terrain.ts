import * as THREE from "three";
import type { Dream } from "../dream";
import type { UpdateFn } from "./atmosphere";

function std(color: string, rough?: number, metal?: number) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: rough == null ? 1.0 : rough, metalness: metal || 0.0,
  });
}

function noise(x: number, z: number) {
  return Math.sin(x * 0.18) * Math.cos(z * 0.21) * 1.0
    + Math.sin(x * 0.05 + z * 0.07) * 2.4
    + Math.cos(x * 0.4 - z * 0.3) * 0.35;
}

function flat(scene: THREE.Scene, pal: Dream["palette"]) {
  const g = new THREE.Mesh(new THREE.CircleGeometry(220, 48), std(pal.ground, 1.0));
  g.rotation.x = -Math.PI / 2;
  scene.add(g);
}

function displaced(scene: THREE.Scene, pal: Dream["palette"], amp: number, color: string, rough?: number) {
  const geo = new THREE.PlaneGeometry(440, 440, 80, 80);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const fade = Math.min(1, Math.hypot(x, y) / 30);
    p.setZ(i, noise(x, y) * amp * fade);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, std(color || pal.ground, rough == null ? 1.0 : rough));
  m.rotation.x = -Math.PI / 2;
  scene.add(m);
}

function waterSheet(scene: THREE.Scene, pal: Dream["palette"], size: number, y: number, segs: number) {
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  const base = Float32Array.from(geo.attributes.position.array as Float32Array);
  const mat = std(pal.fog || pal.ground, 0.18, 0.55);
  mat.color.lerp(new THREE.Color("#000010"), 0.25);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  scene.add(mesh);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const update: UpdateFn = (t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], yv = base[i * 3 + 1];
      p.setZ(i, Math.sin(x * 0.25 + t * 1.1) * 0.35 + Math.cos(yv * 0.3 + t * 0.8) * 0.3);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  };
  return { mesh, update };
}

function room(scene: THREE.Scene, pal: Dream["palette"], ceilingIsSky?: boolean) {
  const S = 26, H = 7;
  const wallMat = std(pal.ground, 0.95);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), std(pal.ground, 0.92));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const defs: [number, number, number, number][] = [
    [0, H / 2, -S / 2, 0], [0, H / 2, S / 2, Math.PI],
    [-S / 2, H / 2, 0, Math.PI / 2], [S / 2, H / 2, 0, -Math.PI / 2],
  ];
  defs.forEach((d) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(S, H), wallMat);
    w.position.set(d[0], d[1], d[2]); w.rotation.y = d[3];
    scene.add(w);
  });
  if (!ceilingIsSky) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(S, S), std(pal.sky_top || pal.ground, 0.95));
    c.position.y = H; c.rotation.x = Math.PI / 2;
    scene.add(c);
  }
}

function stream(scene: THREE.Scene, pal: Dream["palette"]): UpdateFn {
  const ground = new THREE.Mesh(new THREE.CircleGeometry(220, 48), std(pal.ground, 1.0));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const { mesh, update } = waterSheet(scene, pal, 9, -0.18, 60);
  mesh.scale.set(1, 40, 1); // pre-rotation Y => world Z: a long channel
  return update;
}

function floatingIslands(scene: THREE.Scene, pal: Dream["palette"]) {
  const mat = std(pal.ground, 1.0);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + Math.random();
    const d = 16 + Math.random() * 60;
    const slab = new THREE.Mesh(
      new THREE.CylinderGeometry(3 + Math.random() * 5, 1.5 + Math.random() * 3, 1.4 + Math.random() * 2, 6), mat);
    slab.position.set(Math.cos(a) * d, -3 - Math.random() * 14, Math.sin(a) * d);
    slab.rotation.y = Math.random() * Math.PI;
    scene.add(slab);
  }
}

export function buildTerrain(scene: THREE.Scene, dream: Dream): UpdateFn | undefined {
  const t = dream.environment.terrain;
  const pal = dream.palette;
  const anom = dream.anomalies || {};
  let update: UpdateFn | undefined;

  if (t === "void") { /* sky + fog + floating objects only */ }
  else if (t === "room") room(scene, pal, anom.ceiling_is_sky);
  else if (t === "water") update = waterSheet(scene, pal, 460, -0.4, 96).update;
  else if (t === "stream") update = stream(scene, pal);
  else if (t === "hills") displaced(scene, pal, 6.0, pal.ground, 1.0);
  else if (t === "sand") displaced(scene, pal, 3.0, pal.ground, 1.0);
  else flat(scene, pal);

  if (anom.floating_islands) floatingIslands(scene, pal);
  return update;
}
