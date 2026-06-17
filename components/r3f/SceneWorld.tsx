"use client";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Dream } from "@/lib/dream";
import { buildDream } from "@/lib/three/buildScene";
import { createControls, type JoyState } from "@/lib/three/controls";
import type { UpdateFn } from "@/lib/three/atmosphere";
import { disposeObject } from "@/lib/three/dispose";

interface Props {
  dream: Dream;
  joy: React.RefObject<JoyState>;
  onFlash: (v: number) => void;
  onLabel: (label: string | null) => void;
}

export default function SceneWorld({ dream, joy, onFlash, onLabel }: Props) {
  const { scene, camera, gl } = useThree();
  const updateRef = useRef<UpdateFn | null>(null);
  const ctrlRef = useRef<ReturnType<typeof createControls> | null>(null);

  // look-to-reveal label system
  const targets = useRef<THREE.Object3D[]>([]);
  const ray = useRef(new THREE.Raycaster());
  const center = useRef(new THREE.Vector2(0, 0));
  const lastLabel = useRef<string | null>(null);
  const acc = useRef(0);

  useEffect(() => {
    const anom = dream.anomalies || {};
    const eye = anom.giant_scale ? 0.9 : 1.65;
    const loco = dream.locomotion || "walk";
    const cam = camera as THREE.PerspectiveCamera;
    if (loco === "fly") cam.position.set(0, 14, 12);
    else if (loco === "float") cam.position.set(0, 3, 9);
    else cam.position.set(0, eye, 8);
    cam.rotation.set(0, 0, 0);

    updateRef.current = buildDream(scene, dream, onFlash);
    ctrlRef.current = createControls(camera, gl.domElement, {
      locomotion: loco, eye, gravityTilt: anom.gravity_tilt_deg, joy,
    });

    // collect everything that carries a story label
    const t: THREE.Object3D[] = [];
    scene.traverse((o) => { if (o.userData && o.userData.label) t.push(o); });
    targets.current = t;
    lastLabel.current = null;
    onLabel(null);

    return () => {
      ctrlRef.current?.dispose();
      ctrlRef.current = null;
      updateRef.current = null;
      targets.current = [];
      onLabel(null);
      scene.fog = null;
      for (const c of [...scene.children]) { scene.remove(c); disposeObject(c); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dream]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    updateRef.current?.(state.clock.elapsedTime, d, camera);
    ctrlRef.current?.update(d);

    // throttle the look-ray to ~7Hz — cheap, and it stops the caption flickering
    acc.current += d;
    if (acc.current >= 0.14 && targets.current.length) {
      acc.current = 0;
      ray.current.setFromCamera(center.current, camera);
      ray.current.far = 60;
      const hits = ray.current.intersectObjects(targets.current, true);
      let label: string | null = null;
      if (hits.length) {
        let p: THREE.Object3D | null = hits[0].object;
        while (p && !(p.userData && p.userData.label)) p = p.parent;
        if (p && hits[0].distance < 46) label = p.userData.label as string;
      }
      if (label !== lastLabel.current) {
        lastLabel.current = label;
        onLabel(label);
      }
    }
  });

  return null;
}
