"use client";
import { useEffect, useRef } from "react";
import type { JoyState } from "@/lib/three/controls";

export default function Joystick({ joy }: { joy: React.RefObject<JoyState> }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const base = baseRef.current!, knob = knobRef.current!;
    const R = 44;
    let active = false;

    function pos(e: PointerEvent) {
      const r = base.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1, cl = Math.min(len, R);
      dx = (dx / len) * cl; dy = (dy / len) * cl;
      joy.current.x = dx / R; joy.current.y = dy / R;
      knob.style.transform = `translate(${dx}px,${dy}px)`;
    }
    const down = (e: PointerEvent) => { active = true; base.setPointerCapture(e.pointerId); pos(e); };
    const move = (e: PointerEvent) => { if (active) pos(e); };
    const up = () => { active = false; joy.current.x = 0; joy.current.y = 0; knob.style.transform = "translate(0,0)"; };

    base.addEventListener("pointerdown", down);
    base.addEventListener("pointermove", move);
    base.addEventListener("pointerup", up);
    base.addEventListener("pointercancel", up);
    return () => {
      base.removeEventListener("pointerdown", down);
      base.removeEventListener("pointermove", move);
      base.removeEventListener("pointerup", up);
      base.removeEventListener("pointercancel", up);
    };
  }, [joy]);

  return (
    <div className="joy" ref={baseRef}><div className="knob" ref={knobRef} /></div>
  );
}
