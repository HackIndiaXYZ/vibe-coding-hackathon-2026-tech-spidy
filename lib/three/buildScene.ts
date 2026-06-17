import * as THREE from "three";
import type { Dream } from "../dream";
import { buildAtmosphere, type UpdateFn } from "./atmosphere";
import { buildTerrain } from "./terrain";
import { buildObjects } from "./objects";

// Assemble a dream into the given scene; returns a combined per-frame updater.
export function buildDream(scene: THREE.Scene, dream: Dream, onFlash?: (v: number) => void): UpdateFn {
  const updates: UpdateFn[] = [];
  updates.push(buildAtmosphere(scene, dream, onFlash));
  const terr = buildTerrain(scene, dream);
  if (terr) updates.push(terr);
  const objs = buildObjects(scene, dream);
  if (objs) updates.push(objs);
  return (t, dt, camera) => { for (let i = 0; i < updates.length; i++) updates[i](t, dt, camera); };
}
