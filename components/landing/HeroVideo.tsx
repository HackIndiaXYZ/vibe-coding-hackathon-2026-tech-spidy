"use client";
import ZoomVideo from "./ZoomVideo";

// Hero: the golden sun-portal, on an endless forward zoom.
export default function HeroVideo() {
  return (
    <div className="hero-vid" aria-hidden>
      <ZoomVideo src="/dreams/portal-gold.mp4" poster="/dreams/portal-gold-poster.jpg" />
      <div className="hero-vid-grade" />
    </div>
  );
}
