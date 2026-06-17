"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "./SmoothScroll";
import CursorLabel from "./CursorLabel";
import DreamGallery from "./DreamGallery";
import HeroVideo from "./HeroVideo";
import ZoomVideo from "./ZoomVideo";
import { DREAMS } from "@/lib/seeds";
import { computeInsights } from "@/lib/insight";
import { useMagnetic } from "@/lib/useMagnetic";

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="reveal-word">{w}&nbsp;</span>
      ))}
    </>
  );
}

const BEATS: [string, string, string][] = [
  ["Speak it.", "Any language. Bengali, Hindi, English — half-asleep is fine.", "/dreams/temple.jpg"],
  ["Compile it.", "An LLM writes the screenplay. Never the film.", "/dreams/wedding.jpg"],
  ["Walk it.", "A dreamscape you move through, first person.", "/dreams/jhargram.jpg"],
  ["Keep it.", "Every dream becomes a star in your archive.", "/dreams/wishes.jpg"],
  ["Read it.", "Patterns surface across dreams. Your dream signs.", "/dreams/flying.jpg"],
];

// Smooth-scroll a nav anchor through Lenis (falls back to native).
function goTo(e: React.MouseEvent, sel: string) {
  e.preventDefault();
  const el = document.querySelector(sel);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: 0 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const cta = useMagnetic<HTMLAnchorElement>(0.35);
  const signs = computeInsights(DREAMS).slice(0, 4);
  const DREAM_WORDS = [
    "You forget 95% by morning",
    "Sleep builds whole worlds",
    "Lucid is a muscle",
    "The subconscious repeats itself",
    "Walk back into the dream",
    "Every night, a new place",
  ];
  const marquee = [...DREAM_WORDS, ...DREAM_WORDS]; // doubled for the -50% loop

  useEffect(() => {
    const r = root.current;
    if (!r) return;
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // One context = one coordinated refresh. Pins are created in DOM order so
    // ScrollTrigger lays their spacers out correctly and they never overlap.
    const ctx = gsap.context(() => {
      // hero intro + parallax
      gsap.from(".hero .reveal-word", {
        yPercent: 120, opacity: 0, stagger: 0.05, duration: 1, ease: "power3.out", delay: 0.25,
      });
      gsap.to(".hero-inner", {
        yPercent: -28, opacity: 0, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-canvas", {
        yPercent: 18, scale: 1.25, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // scrubbed word reveals
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el.querySelectorAll(".reveal-word"), {
          yPercent: 120, opacity: 0, stagger: 0.03, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%", end: "top 45%", scrub: true },
        });
      });

      // image-filled headlines (photos clipped into the type) — rise on scroll
      gsap.utils.toArray<HTMLElement>(".reveal-fill").forEach((el) => {
        gsap.from(el, {
          yPercent: 18, opacity: 0, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", end: "top 52%", scrub: true },
        });
      });

      // parallax depth
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        gsap.to(el, {
          yPercent: -100 * parseFloat(el.dataset.speed || "0"), ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // PIN 1 — pipeline beats reveal in sequence
      const beats = gsap.utils.toArray<HTMLElement>(".beat");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".pipeline", start: "top top", end: "+=2000", scrub: 1, pin: ".pipeline-inner" },
      });
      beats.forEach((b, i) => {
        tl.fromTo(b, { opacity: 0.12, x: 60 }, { opacity: 1, x: 0, duration: 1 }, i * 0.7);
      });

      // dream-signs reveal
      gsap.from(".sign", {
        opacity: 0, y: 40, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".signs", start: "top 70%" },
      });

      // scroll-progress hairline
      if (progress.current) {
        gsap.to(progress.current, {
          scaleX: 1, ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        });
      }
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const id = setTimeout(refresh, 700); // after webfonts + images settle
    return () => { clearTimeout(id); window.removeEventListener("load", refresh); ctx.revert(); };
  }, []);

  return (
    <SmoothScroll>
      <div ref={progress} className="progress" aria-hidden />
      <div className="grain" aria-hidden />
      <CursorLabel />

      <nav className="nav">
        <a href="#top" className="nav-brand" onClick={(e) => goTo(e, "#top")}>Dream Architect</a>
        <div className="nav-links">
          <a href="#how" onClick={(e) => goTo(e, "#how")}>Story</a>
          <a href="#archive" onClick={(e) => goTo(e, "#archive")}>Archive</a>
          <a href="#signs" onClick={(e) => goTo(e, "#signs")}>Signs</a>
          <Link href="/archive" className="nav-cta" data-cursor="ENTER">Enter →</Link>
        </div>
      </nav>

      <main ref={root} className="landing">
        {/* HERO */}
        <section className="hero" id="top">
          <div className="hero-canvas"><HeroVideo /></div>
          <div className="hero-vignette" />
          <div className="hero-inner">
            <div className="l-kicker">A dream journal, but walkable</div>
            <h1 className="hero-h1 heavy"><Words text="95% of dreams are gone by breakfast." /></h1>
            <p className="hero-sub">Dream Architect keeps the other 5% — as places you can walk back into.</p>
            <div className="scroll-cue">scroll</div>
          </div>
        </section>

        {/* STATEMENT */}
        <section className="statement">
          <h2 className="big display imgfill reveal-fill" style={{ backgroundImage: "url(/dreams/jhargram.jpg)" }}>
            You don’t read a dream. You walk back into it.
          </h2>
        </section>

        {/* MARQUEE — the archive, drifting (real dream titles) */}
        <div className="marquee" aria-hidden>
          <div className="marquee-row">
            {marquee.map((t, i) => (
              <span className="marquee-item" key={i}>
                {t}<span className="dot">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* PIPELINE (pinned) */}
        <section className="pipeline" id="how">
          <div className="pipeline-inner">
            <div className="l-label">How it works</div>
            <ol className="beats">
              {BEATS.map(([h, b, img], i) => (
                <li className="beat" key={i}>
                  <span className="beat-n">0{i + 1}</span>
                  <div className="beat-img" data-cursor="DREAM">
                    <Image src={img} alt="" fill sizes="160px" className="beat-img-el" />
                  </div>
                  <div className="beat-txt">
                    <h3 className="beat-h display">{h}</h3>
                    <p className="beat-b">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* VIDEO INTERLUDE — a cinematic breather mid-scroll */}
        <section className="interlude">
          <ZoomVideo src="/dreams/portal-road.mp4" poster="/dreams/portal-poster.jpg" />
          <div className="interlude-grade" />
          <h2 className="interlude-h heavy">Where do you go when you sleep?</h2>
        </section>

        {/* ARCHIVE GALLERY (pinned horizontal) */}
        <DreamGallery />

        {/* DREAM SIGNS */}
        <section className="signs" id="signs">
          <div className="signs-bg" aria-hidden>
            <Image src="/dreams/temple.jpg" alt="" fill sizes="100vw" className="signs-bg-img" />
          </div>
          <h2 className="big reveal display"><Words text="Your subconscious repeats itself." /></h2>
          <p className="signs-sub">Across ten real dreams, the same shapes keep returning:</p>
          <ul className="sign-list">
            {signs.map((s, i) => (
              <li className="sign" key={i}>
                <span className="sign-count">{s.count}<em>/{s.total}</em></span>
                <span className="sign-text">{s.text.replace(/\s*\d+ of \d+\.?$/, "")}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FRAMINGS */}
        <section className="framings">
          <div className="frame imgfill reveal-fill" style={{ backgroundImage: "url(/dreams/wedding.jpg)" }}>Lucid training.</div>
          <div className="frame imgfill reveal-fill" style={{ backgroundImage: "url(/dreams/temple.jpg)" }}>Nightmare therapy.</div>
          <div className="frame imgfill reveal-fill" style={{ backgroundImage: "url(/dreams/lotus.png)" }}>Notion for your subconscious.</div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="cta-bg" data-speed="0.12" aria-hidden>
            <Image src="/dreams/doorway.jpg" alt="" fill sizes="100vw" className="cta-bg-img" />
          </div>
          <h2 className="cta-h heavy reveal"><Words text="Enter the archive." /></h2>
          <Link ref={cta} href="/archive" className="cta-btn" data-cursor="WALK IN">Walk in →</Link>
          <p className="cta-foot">No account. No upload. Dreams never leave your device.</p>
        </section>

        {/* FOOTER */}
        <footer className="foot">
          <div className="foot-top">
            <div className="foot-brand display">Dream Architect</div>
            <p className="foot-line">A dream journal you can walk into.</p>
          </div>
          <div className="foot-row">
            <div className="foot-links">
              <a href="https://github.com/Subha-jit007" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.instagram.com/_subh_a15_" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/in/subhajit-mahata" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://x.com/subhajitmahata_" target="_blank" rel="noreferrer">X</a>
            </div>
            <div className="foot-credit">Built by Subhajit — an AI developer who makes things move.</div>
          </div>
        </footer>
      </main>
    </SmoothScroll>
  );
}
