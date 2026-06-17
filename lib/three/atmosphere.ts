import * as THREE from "three";
import type { Dream } from "../dream";

export type UpdateFn = (t: number, dt: number, camera?: THREE.Camera) => void;

function glowTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function gradientSky(scene: THREE.Scene, palette: Dream["palette"]) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color(palette.sky_top) },
      bottom: { value: new THREE.Color(palette.sky_bottom) },
      flash: { value: 0.0 },
    },
    vertexShader: `varying vec3 vPos;
      void main(){ vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform float flash;
      varying vec3 vPos;
      void main(){
        float h = normalize(vPos).y * 0.5 + 0.5;
        vec3 c = mix(bottom, top, smoothstep(0.05, 0.85, h));
        c += vec3(0.85, 0.9, 1.0) * flash;
        gl_FragColor = vec4(c, 1.0); }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(420, 24, 16), mat));
  return mat;
}

function stars(scene: THREE.Scene) {
  const n = 350, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI * 0.42 + 0.06;
    pos[i * 3] = Math.cos(a) * Math.cos(e) * 400;
    pos[i * 3 + 1] = Math.sin(e) * 400;
    pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 400;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xcfd8ee, size: 1.6, fog: false, transparent: true, opacity: 0.8,
    map: glowTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)"),
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  scene.add(new THREE.Points(geo, mat));
}

function moon(scene: THREE.Scene, spec: Dream["sky_features"][number]) {
  const giant = spec.scale === "giant";
  const r = giant ? 36 : 12;
  const col = new THREE.Color(spec.color || "#efe9cf");
  const pos = new THREE.Vector3(-95, giant ? 110 : 140, -300);
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24),
    new THREE.MeshBasicMaterial({ color: col, fog: false }));
  m.position.copy(pos);
  scene.add(m);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture("rgba(238,230,200,0.55)", "rgba(238,230,200,0)"),
    fog: false, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.scale.set(r * 7, r * 7, 1);
  halo.position.copy(pos);
  scene.add(halo);
}

const SPECTRUM = ["#ff4d4d", "#ff9a3d", "#ffd93d", "#5fe07a", "#46c8e8", "#5a7df0", "#a060e8"];

function rainbow(scene: THREE.Scene, x: number, z: number, radius: number) {
  const group = new THREE.Group();
  const band = radius * 0.035;
  SPECTRUM.forEach((c, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(radius - i * band * 0.95, band * 0.55, 6, 90, Math.PI),
      new THREE.MeshBasicMaterial({
        color: c, transparent: true, opacity: 0.68, fog: false,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
    group.add(arc);
  });
  group.position.set(x, -6, z);
  scene.add(group);
}

function fireflies(scene: THREE.Scene, density: number, accent: string): UpdateFn {
  const n = Math.min(density || 200, 500);
  const pos = new Float32Array(n * 3), phase = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 70;
    pos[i * 3 + 1] = 0.4 + Math.random() * 5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    phase[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(accent), size: 0.5, transparent: true,
    map: glowTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)"),
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return (t) => {
    const p = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = p.array as Float32Array;
    for (let i = 0; i < n; i++) {
      arr[i * 3 + 1] += Math.sin(t * 1.2 + phase[i]) * 0.0035;
      arr[i * 3] += Math.cos(t * 0.7 + phase[i]) * 0.0025;
    }
    p.needsUpdate = true;
    mat.opacity = 0.7 + 0.3 * Math.sin(t * 2.2);
  };
}

function dust(scene: THREE.Scene, density: number, color: string): UpdateFn {
  const n = Math.min(density || 200, 700);
  const pos = new Float32Array(n * 3), phase = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 120;
    pos[i * 3 + 1] = Math.random() * 24;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    phase[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(color || "#cdd6e8"), size: 0.32, transparent: true, opacity: 0.5,
    map: glowTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)"),
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return (t) => {
    const p = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = p.array as Float32Array;
    for (let i = 0; i < n; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.3 + phase[i]) * 0.0015 + 0.004;
      if (arr[i * 3 + 1] > 24) arr[i * 3 + 1] = 0;
      arr[i * 3] += Math.cos(t * 0.2 + phase[i]) * 0.0018;
    }
    p.needsUpdate = true;
  };
}

function lightning(skyMat: THREE.ShaderMaterial, amb: THREE.AmbientLight, onFlash?: (v: number) => void): UpdateFn {
  let next = 4 + Math.random() * 6, strobe = 0, strobesLeft = 0;
  return (t, dt) => {
    next -= dt;
    if (next <= 0 && strobesLeft === 0) {
      strobesLeft = 1 + Math.floor(Math.random() * 3);
      next = 6 + Math.random() * 9;
    }
    if (strobesLeft > 0 && strobe <= 0) { strobe = 0.1 + Math.random() * 0.12; strobesLeft--; }
    if (strobe > 0) {
      strobe -= dt;
      const k = Math.max(strobe, 0) * 6.0;
      skyMat.uniforms.flash.value = Math.min(k, 0.6);
      amb.intensity = (amb.userData.base ?? amb.intensity) + k * 1.2;
      onFlash?.(Math.min(k * 0.4, 0.3));
    } else {
      skyMat.uniforms.flash.value *= 0.85;
      onFlash?.(0);
    }
  };
}

export function buildAtmosphere(scene: THREE.Scene, dream: Dream, onFlash?: (v: number) => void): UpdateFn {
  const pal = dream.palette;
  const updates: UpdateFn[] = [];
  scene.fog = new THREE.FogExp2(new THREE.Color(pal.fog), dream.environment.fog_density || 0.03);
  const skyMat = gradientSky(scene, pal);
  if (dream.environment.time === "night" || dream.environment.time === "unearthly") stars(scene);

  (dream.sky_features || []).forEach((f) => {
    if (f.type === "moon" || f.type === "sun") moon(scene, f);
    if (f.type === "rainbow") {
      const nrb = f.count || 1;
      for (let i = 0; i < nrb; i++)
        rainbow(scene, -55 + i * 110, -230 - i * 30, f.scale === "giant" ? 110 + i * 25 : 50);
    }
  });

  const ambBase = dream.lighting.ambient || 0.4;
  const amb = new THREE.AmbientLight(0xffffff, ambBase * 0.7);
  amb.userData.base = amb.intensity;
  scene.add(amb);
  // sky/ground hemisphere fill — gives rounded forms a value gradient (lit from
  // the sky tone above, the ground tone below) instead of reading as flat cutouts.
  const skyCol = new THREE.Color(pal.sky_top).lerp(new THREE.Color(pal.sky_bottom), 0.5);
  const hemi = new THREE.HemisphereLight(skyCol, new THREE.Color(pal.ground), ambBase * 0.6);
  hemi.position.set(0, 60, 0);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(dream.lighting.key_color || "#ffffff", dream.lighting.key_intensity || 1.0);
  const kp = dream.lighting.key_position || [40, 60, -80];
  key.position.set(kp[0], kp[1], kp[2]);
  scene.add(key);

  const pt = dream.particles && dream.particles.type;
  if (pt === "fireflies") updates.push(fireflies(scene, dream.particles.density || 200, pal.accent));
  else if (pt === "dust" || pt === "bubbles")
    updates.push(dust(scene, dream.particles.density || 200, pt === "bubbles" ? pal.accent : "#cdd6e8"));
  else if (pt === "stars" && !(dream.environment.time === "night" || dream.environment.time === "unearthly"))
    stars(scene);

  if ((dream.sky_features || []).some((f) => f.type === "lightning"))
    updates.push(lightning(skyMat, amb, onFlash));

  return (t, dt) => updates.forEach((u) => u(t, dt));
}
