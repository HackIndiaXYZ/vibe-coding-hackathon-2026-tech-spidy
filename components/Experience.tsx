"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { WebGLRenderer } from "three";
import { AnimatePresence, motion } from "framer-motion";
import SceneWorld from "./r3f/SceneWorld";
import ConstellationWorld from "./r3f/ConstellationWorld";
import PostFX from "./r3f/PostFX";
import Joystick from "./Joystick";
import { DREAMS, dreamByKey } from "@/lib/seeds";
import { computeInsights } from "@/lib/insight";
import { useMagnetic } from "@/lib/useMagnetic";
import type { Dream } from "@/lib/dream";
import type { JoyState } from "@/lib/three/controls";

function initialFromUrl(): Dream | null {
  if (typeof window === "undefined") return null;
  return dreamByKey(new URLSearchParams(window.location.search).get("dream"));
}

export default function Experience() {
  const [boot] = useState(initialFromUrl);
  const [mode, setMode] = useState<"constellation" | "scene">(boot ? "scene" : "constellation");
  const [dream, setDream] = useState<Dream | null>(boot);
  const [hover, setHover] = useState<Dream | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [fading, setFading] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const joy = useRef<JoyState>({ x: 0, y: 0 });
  const flashRef = useRef<HTMLDivElement>(null);
  const insights = useMemo(() => computeInsights(DREAMS), []);
  const signsBtn = useMagnetic<HTMLButtonElement>(0.3);
  const backBtn = useMagnetic<HTMLButtonElement>(0.3);

  const onFlash = useCallback((v: number) => {
    if (flashRef.current) flashRef.current.style.opacity = String(v);
  }, []);
  const onGl = useCallback((gl: WebGLRenderer) => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
  }, []);

  const transition = useCallback((fn: () => void) => {
    setFading(true);
    setLabel(null);
    setTimeout(() => { fn(); requestAnimationFrame(() => setFading(false)); }, 460);
  }, []);

  const enterScene = useCallback((d: Dream) => transition(() => {
    setDream(d); setMode("scene"); setShowInsights(false);
    history.replaceState(null, "", `?dream=${d.key}`);
  }), [transition]);

  const enterConstellation = useCallback(() => transition(() => {
    setMode("constellation"); setHover(null);
    history.replaceState(null, "", window.location.pathname);
  }), [transition]);

  return (
    <div className="exp">
      {mode === "constellation" ? (
        <Canvas key="constellation" camera={{ fov: 60, position: [0, 0, 56], near: 0.1, far: 600 }}
          gl={{ antialias: true }} onCreated={({ gl }) => onGl(gl)}>
          <ConstellationWorld dreams={DREAMS} onSelect={enterScene} onHover={setHover} />
          <PostFX strength={0.8} radius={0.6} threshold={0.2} />
        </Canvas>
      ) : dream ? (
        <Canvas key={dream.key} camera={{ fov: 70, position: [0, 1.65, 8], near: 0.1, far: 900 }}
          gl={{ antialias: true }} onCreated={({ gl }) => onGl(gl)}>
          <SceneWorld dream={dream} joy={joy} onFlash={onFlash} onLabel={setLabel} />
          <PostFX strength={1.05} radius={0.75} threshold={0.16} />
        </Canvas>
      ) : null}

      <div className="flash" ref={flashRef} />

      <AnimatePresence mode="wait">
        {mode === "constellation" ? (
          <motion.div key="hud-c" className="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="wordmark"
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
              <div className="kicker">Dream Architect</div>
              <div className="word-title display">Walk back into your dreams</div>
            </motion.div>

            <div className="hover-title display">{hover ? hover.title : ""}</div>
            <div className="c-hint">drag to orbit · tap a dream to enter</div>

            <button ref={signsBtn} className="pill signs-btn" onClick={() => setShowInsights((s) => !s)}>
              Dream signs
            </button>

            <AnimatePresence>
              {showInsights && (
                <motion.div className="insights"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                  <h3 className="display">What keeps coming back</h3>
                  <ul>
                    {insights.map((r, i) => (
                      <motion.li key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                        {r.text}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="hud-s" className="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button ref={backBtn} className="pill back-btn" onClick={enterConstellation}>← archive</button>
            {dream && (
              <motion.h1 key={dream.key} className="scene-title display"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, 0] }}
                transition={{ duration: 5, times: [0, 0.12, 0.62, 1], ease: "easeOut" }}>
                {dream.title}
              </motion.h1>
            )}
            <div className="scene-hint">
              {dream?.locomotion === "walk" ? "drag to look · joystick to move" : "drag to look · joystick to drift · look up to rise"}
            </div>
            <div className="reticle" aria-hidden />
            <div className={`scene-caption ${label ? "on" : ""}`}>{label || ""}</div>
            <Joystick joy={joy} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="exp-vignette" aria-hidden />
      <div className={`fade ${fading ? "on" : ""}`} />
    </div>
  );
}
