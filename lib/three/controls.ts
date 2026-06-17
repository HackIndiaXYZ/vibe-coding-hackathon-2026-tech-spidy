import * as THREE from "three";
import type { Locomotion } from "../dream";

export interface JoyState { x: number; y: number }

export interface ControlOpts {
  locomotion: Locomotion;
  eye: number;
  gravityTilt?: number;
  joy: { current: JoyState };
}

// Walk / fly / float controls. Drag-to-look on the canvas + WASD/mouse on desktop;
// the virtual joystick is a DOM overlay that writes into opts.joy.current.
export function createControls(camera: THREE.Camera, dom: HTMLElement, opts: ControlOpts) {
  const loco = opts.locomotion;
  const eye = opts.eye;
  const roll = (opts.gravityTilt || 0) * Math.PI / 180;
  const flying = loco === "fly" || loco === "float";
  const joy = opts.joy;

  let yaw = 0, pitch = 0;
  let lookId: number | null = null, lx = 0, ly = 0;
  const keys: Record<string, boolean> = {};
  const vel = new THREE.Vector3();
  const DIR = new THREE.Vector3(), RIGHT = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);

  function onTouchStart(e: TouchEvent) {
    for (const t of Array.from(e.changedTouches)) {
      if (lookId === null) { lookId = t.identifier; lx = t.clientX; ly = t.clientY; }
    }
  }
  function onTouchMove(e: TouchEvent) {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === lookId) {
        yaw -= (t.clientX - lx) * 0.0042;
        pitch -= (t.clientY - ly) * 0.0042;
        pitch = Math.max(-1.45, Math.min(1.45, pitch));
        lx = t.clientX; ly = t.clientY;
      }
    }
  }
  function endTouch(e: TouchEvent) {
    for (const t of Array.from(e.changedTouches)) if (t.identifier === lookId) lookId = null;
  }

  let mouseDown = false;
  function onMouseDown(e: MouseEvent) { mouseDown = true; lx = e.clientX; ly = e.clientY; }
  function onMouseUp() { mouseDown = false; }
  function onMouseMove(e: MouseEvent) {
    if (!mouseDown) return;
    yaw -= (e.clientX - lx) * 0.0035;
    pitch -= (e.clientY - ly) * 0.0035;
    pitch = Math.max(-1.45, Math.min(1.45, pitch));
    lx = e.clientX; ly = e.clientY;
  }
  function onKeyDown(e: KeyboardEvent) { keys[e.key.toLowerCase()] = true; }
  function onKeyUp(e: KeyboardEvent) { keys[e.key.toLowerCase()] = false; }

  dom.addEventListener("touchstart", onTouchStart, { passive: true });
  dom.addEventListener("touchmove", onTouchMove, { passive: true });
  dom.addEventListener("touchend", endTouch);
  dom.addEventListener("touchcancel", endTouch);
  dom.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const SPEED = 4.2;

  function update(dt: number) {
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    camera.rotation.z = roll;

    const jx = joy.current.x, jy = joy.current.y;
    const f = -jy + ((keys["w"] ? 1 : 0) - (keys["s"] ? 1 : 0));
    const s = jx + ((keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0));
    const v = ((keys[" "] || keys["e"]) ? 1 : 0) - ((keys["shift"] || keys["q"]) ? 1 : 0);

    if (!flying) {
      const sin = Math.sin(yaw), cos = Math.cos(yaw);
      camera.position.x += (s * cos - f * sin) * SPEED * dt * -1;
      camera.position.z += (-s * sin - f * cos) * SPEED * dt;
      camera.position.y = eye;
      return;
    }

    camera.getWorldDirection(DIR);
    RIGHT.crossVectors(DIR, UP).normalize();
    const accel = loco === "float" ? 9 : 26;
    const damp = loco === "float" ? 1.6 : 8.0;
    vel.addScaledVector(DIR, f * accel * dt);
    vel.addScaledVector(RIGHT, s * accel * dt);
    vel.y += v * accel * dt;
    vel.multiplyScalar(Math.exp(-damp * dt));
    camera.position.addScaledVector(vel, dt);
    if (camera.position.y < 0.6) { camera.position.y = 0.6; if (vel.y < 0) vel.y = 0; }
  }

  function dispose() {
    dom.removeEventListener("touchstart", onTouchStart);
    dom.removeEventListener("touchmove", onTouchMove);
    dom.removeEventListener("touchend", endTouch);
    dom.removeEventListener("touchcancel", endTouch);
    dom.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  }

  return { update, dispose };
}
