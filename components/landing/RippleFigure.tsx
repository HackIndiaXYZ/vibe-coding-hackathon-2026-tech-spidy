"use client";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

// Monochrome line-art hero: a glowing figure rising from concentric ripples,
// in a faint starfield. Crisp vector (SVG) for fidelity to the reference.
const RINGS = 5;

// Minimal seated/rising figure silhouette, symmetric about x=400.
const BODY =
  "M400,196 C432,196 448,222 450,250 C470,300 510,360 524,420 " +
  "C532,452 520,470 492,470 L308,470 C280,470 268,452 276,420 " +
  "C290,360 330,300 350,250 C352,222 368,196 400,196 Z";

export default function RippleFigure() {
  const root = useRef<SVGSVGElement>(null);
  const stars = useMemo(
    () =>
      Array.from({ length: 44 }, () => ({
        x: Math.random() * 800,
        y: Math.random() * 540,
        r: Math.random() * 1.3 + 0.3,
        o: Math.random() * 0.5 + 0.18,
      })),
    []
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGCircleElement>(".rf-ring").forEach((ring, i) => {
        gsap.fromTo(
          ring,
          { attr: { r: 28 }, opacity: 0.5 },
          { attr: { r: 360 }, opacity: 0, duration: 5, ease: "sine.out", repeat: -1, delay: i * 1.0 }
        );
      });
      gsap.fromTo(".rf-figure", { y: 6 }, { y: -6, duration: 3.8, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".rf-stars circle", { opacity: "+=0.15", duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: { each: 0.05, from: "random" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <svg ref={root} className="rf" viewBox="0 0 800 820" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g className="rf-stars">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
        ))}
      </g>

      {/* a far planet */}
      <circle className="rf-moon" cx="150" cy="142" r="62" />
      <circle className="rf-moon-shade" cx="180" cy="128" r="62" />

      {/* ripples on a tilted plane */}
      <g className="rf-ripples" transform="translate(400 488) scale(1 0.4)">
        <circle className="rf-base" r="300" vectorEffect="non-scaling-stroke" />
        {Array.from({ length: RINGS }).map((_, i) => (
          <circle className="rf-ring" key={i} r="28" vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      {/* the dreamer */}
      <g className="rf-figure">
        <circle className="rf-fill" cx="400" cy="150" r="46" />
        <path className="rf-fill" d={BODY} />
        <circle className="rf-line" cx="400" cy="150" r="46" />
        <path className="rf-line" d={BODY} />
      </g>
    </svg>
  );
}
