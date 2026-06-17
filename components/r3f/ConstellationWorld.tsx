"use client";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Dream } from "@/lib/dream";
import { motifTags } from "@/lib/insight";
import { disposeObject } from "@/lib/three/dispose";

interface Props {
  dreams: Dream[];
  onSelect: (d: Dream) => void;
  onHover: (d: Dream | null) => void;
}

function glowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 1, 32, 32, 31);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function labelSprite(text: string, color: string) {
  const pad = 24, fs = 44;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = `italic 600 ${fs}px Georgia, 'Times New Roman', serif`;
  ctx.font = font;
  c.width = Math.ceil(ctx.measureText(text).width) + pad * 2;
  c.height = fs + pad * 2;
  ctx.font = font;
  ctx.textBaseline = "middle"; ctx.textAlign = "center";
  ctx.shadowColor = color; ctx.shadowBlur = 18;
  ctx.fillStyle = "#f2f5fb";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthWrite: false, depthTest: false, opacity: 0,
  }));
  spr.scale.set(c.width * 0.018, c.height * 0.018, 1);
  return spr;
}

interface NodeData { dream: Dream; halo: THREE.Sprite; label: THREE.Sprite; phase: number }

export default function ConstellationWorld({ dreams, onSelect, onHover }: Props) {
  const { scene, camera, gl } = useThree();
  const stateRef = useRef<{
    nodes: THREE.Mesh[];
    group: THREE.Group;
    yaw: number; pitch: number; dist: number;
    dragging: boolean; moved: number; px: number; py: number; auto: boolean;
    hovered: THREE.Mesh | null; lastHover: THREE.Mesh | null;
  } | null>(null);

  useEffect(() => {
    scene.background = new THREE.Color("#05060f");
    scene.fog = new THREE.FogExp2(new THREE.Color("#05060f"), 0.004);

    // starfield
    const sn = 900, spos = new Float32Array(sn * 3);
    for (let i = 0; i < sn; i++) {
      const a = Math.random() * Math.PI * 2, e = (Math.random() - 0.5) * Math.PI;
      const r = 120 + Math.random() * 120;
      spos[i * 3] = Math.cos(a) * Math.cos(e) * r;
      spos[i * 3 + 1] = Math.sin(e) * r;
      spos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    const sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute("position", new THREE.BufferAttribute(spos, 3));
    scene.add(new THREE.Points(sgeo, new THREE.PointsMaterial({
      color: 0x9fb0d8, size: 1.1, transparent: true, opacity: 0.7,
      map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    const group = new THREE.Group();
    scene.add(group);

    const R = 22, nodes: THREE.Mesh[] = [];
    const GA = Math.PI * (3 - Math.sqrt(5));
    dreams.forEach((d, i) => {
      const y = 1 - (i / Math.max(1, dreams.length - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = GA * i;
      const p = new THREE.Vector3(Math.cos(th) * rad, y * 0.7, Math.sin(th) * rad).multiplyScalar(R);
      const col = new THREE.Color(d.palette.accent);

      const node = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 16), new THREE.MeshBasicMaterial({ color: col }));
      node.position.copy(p);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex(), color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85,
      }));
      halo.scale.set(4, 4, 1); halo.position.copy(p);
      const label = labelSprite(d.title, "#" + col.getHexString());
      label.position.copy(p).add(new THREE.Vector3(0, 1.8, 0));
      node.userData = { dream: d, halo, label, phase: i * 1.3 } as NodeData;
      group.add(node, halo, label);
      nodes.push(node);
    });

    // motif links
    const tagSets = dreams.map(motifTags);
    const lp: number[] = [];
    for (let i = 0; i < dreams.length; i++)
      for (let j = i + 1; j < dreams.length; j++)
        if (tagSets[i].some((t) => tagSets[j].includes(t))) {
          const a = nodes[i].position, b = nodes[j].position;
          lp.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
    if (lp.length) {
      const lg = new THREE.BufferGeometry();
      lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lp), 3));
      group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
        color: 0x6f86c8, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false,
      })));
    }

    stateRef.current = {
      nodes, group, yaw: 0.4, pitch: 0.25, dist: 56,
      dragging: false, moved: 0, px: 0, py: 0, auto: true, hovered: null, lastHover: null,
    };

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const canvas = gl.domElement;
    function setNdc(cx: number, cy: number) {
      const r = canvas.getBoundingClientRect();
      ndc.x = ((cx - r.left) / r.width) * 2 - 1;
      ndc.y = -((cy - r.top) / r.height) * 2 + 1;
    }
    function pick(): THREE.Mesh | null {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(nodes, false)[0];
      return hit ? (hit.object as THREE.Mesh) : null;
    }
    function down(cx: number, cy: number) { const s = stateRef.current!; s.dragging = true; s.moved = 0; s.px = cx; s.py = cy; s.auto = false; }
    function moveTo(cx: number, cy: number) {
      const s = stateRef.current!;
      if (s.dragging) {
        const dx = cx - s.px, dy = cy - s.py;
        s.moved += Math.abs(dx) + Math.abs(dy);
        s.yaw -= dx * 0.005;
        s.pitch = Math.max(-1.2, Math.min(1.2, s.pitch - dy * 0.005));
        s.px = cx; s.py = cy;
      } else {
        setNdc(cx, cy); s.hovered = pick();
        canvas.style.cursor = s.hovered ? "pointer" : "default";
        if (s.hovered !== s.lastHover) {
          s.lastHover = s.hovered;
          onHover(s.hovered ? (s.hovered.userData as NodeData).dream : null);
        }
      }
    }
    function up(cx: number, cy: number) {
      const s = stateRef.current!;
      if (s.dragging && s.moved < 8) { setNdc(cx, cy); const hit = pick(); if (hit) onSelect((hit.userData as NodeData).dream); }
      s.dragging = false;
    }
    const md = (e: MouseEvent) => down(e.clientX, e.clientY);
    const mm = (e: MouseEvent) => moveTo(e.clientX, e.clientY);
    const mu = (e: MouseEvent) => up(e.clientX, e.clientY);
    const ts = (e: TouchEvent) => { const t = e.changedTouches[0]; down(t.clientX, t.clientY); };
    const tm = (e: TouchEvent) => { const t = e.changedTouches[0]; moveTo(t.clientX, t.clientY); };
    const te = (e: TouchEvent) => { const t = e.changedTouches[0]; up(t.clientX, t.clientY); };
    canvas.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    canvas.addEventListener("touchstart", ts, { passive: true });
    canvas.addEventListener("touchmove", tm, { passive: true });
    canvas.addEventListener("touchend", te);

    return () => {
      canvas.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      canvas.removeEventListener("touchstart", ts);
      canvas.removeEventListener("touchmove", tm);
      canvas.removeEventListener("touchend", te);
      canvas.style.cursor = "default";
      scene.fog = null; scene.background = null;
      for (const c of [...scene.children]) { scene.remove(c); disposeObject(c); }
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dreams]);

  useFrame((state, dt) => {
    const s = stateRef.current;
    if (!s) return;
    const t = state.clock.elapsedTime;
    if (s.auto) s.yaw += dt * 0.05;
    const cp = Math.cos(s.pitch);
    camera.position.set(Math.sin(s.yaw) * cp * s.dist, Math.sin(s.pitch) * s.dist, Math.cos(s.yaw) * cp * s.dist);
    camera.lookAt(0, 0, 0);
    for (const n of s.nodes) {
      const u = n.userData as NodeData;
      const isHover = n === s.hovered;
      const pulse = 1 + Math.sin(t * 1.6 + u.phase) * 0.08;
      const target = (isHover ? 1.7 : 1) * pulse;
      n.scale.setScalar(n.scale.x + (target - n.scale.x) * Math.min(1, dt * 10));
      u.halo.scale.setScalar(4 * (isHover ? 1.5 : 1) * pulse);
      const mat = u.label.material as THREE.SpriteMaterial;
      mat.opacity += ((isHover ? 1 : 0) - mat.opacity) * Math.min(1, dt * 8);
    }
  });

  return null;
}
