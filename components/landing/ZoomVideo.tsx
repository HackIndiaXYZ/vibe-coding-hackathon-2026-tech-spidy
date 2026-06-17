"use client";
import { useEffect, useRef } from "react";

// Endless forward zoom: two layers of the same clip crossfade — one always
// zooming in while the other resets behind it, so it never visibly ends.
// 2nd layer is offset in playback so the loop-cuts never coincide.
export default function ZoomVideo({ src, poster }: { src: string; poster?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const av = a.current, bv = b.current, el = root.current;
    if (!av || !bv || !el) return;

    const offset = () => { if (bv.duration) bv.currentTime = bv.duration / 2; };
    if (bv.readyState >= 1) offset();
    else bv.addEventListener("loadedmetadata", offset, { once: true });

    // play only while on screen (perf + battery)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { av.play().catch(() => {}); bv.play().catch(() => {}); }
        else { av.pause(); bv.pause(); }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const common = { loop: true, muted: true, playsInline: true, preload: "auto" as const, autoPlay: true };
  return (
    <div ref={root} className="zoomvid" aria-hidden>
      <video ref={a} {...common} className="zoomvid-el zoomvid-a" poster={poster}>
        <source src={src} type="video/mp4" />
      </video>
      <video ref={b} {...common} className="zoomvid-el zoomvid-b">
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
