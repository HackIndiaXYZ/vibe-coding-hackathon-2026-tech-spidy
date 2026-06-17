"use client";
import { useEffect, useRef } from "react";

// Portfolio-style custom cursor: lerp-follow ring + dot, swells over
// interactive elements and shows their data-cursor label. Desktop only.
export default function CursorLabel() {
  const root = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const label = labelRef.current;
    if (!el || !label) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    document.body.classList.add("cursor-on");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    let raf = 0;

    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const tick = () => {
      pos.x += (mouse.x - pos.x) * 0.18;
      pos.y += (mouse.y - pos.y) * 0.18;
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    const enter = (e: Event) => {
      const t = e.currentTarget as HTMLElement;
      el.classList.add("is-hover");
      label.textContent = t.getAttribute("data-cursor") || "";
    };
    const leave = () => { el.classList.remove("is-hover"); label.textContent = ""; };

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("a, button, [data-cursor], .dimg, .cta-btn")
    );
    nodes.forEach((n) => {
      n.addEventListener("pointerenter", enter);
      n.addEventListener("pointerleave", leave);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      nodes.forEach((n) => {
        n.removeEventListener("pointerenter", enter);
        n.removeEventListener("pointerleave", leave);
      });
      document.body.classList.remove("cursor-on");
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden>
      <div className="cursor__ring" />
      <div className="cursor__dot" />
      <div ref={labelRef} className="cursor__label" />
    </div>
  );
}
