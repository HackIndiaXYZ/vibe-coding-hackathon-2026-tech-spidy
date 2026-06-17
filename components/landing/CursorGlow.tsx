"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** A soft dream-light that trails the cursor. Skips touch + reduced-motion. */
export default function CursorGlow() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduce) return;

    el.style.opacity = "1";
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    // grow over anything interactive
    const grow = () => gsap.to(el, { scale: 2.6, opacity: 0.9, duration: 0.3 });
    const shrink = () => gsap.to(el, { scale: 1, opacity: 1, duration: 0.3 });
    const hot = () => document.querySelectorAll("a, button, .pill, [data-cursor]");

    window.addEventListener("pointermove", move);
    hot().forEach((n) => {
      n.addEventListener("pointerenter", grow);
      n.addEventListener("pointerleave", shrink);
    });
    return () => {
      window.removeEventListener("pointermove", move);
      hot().forEach((n) => {
        n.removeEventListener("pointerenter", grow);
        n.removeEventListener("pointerleave", shrink);
      });
    };
  }, []);

  return <div ref={dot} className="cursor-glow" aria-hidden />;
}
