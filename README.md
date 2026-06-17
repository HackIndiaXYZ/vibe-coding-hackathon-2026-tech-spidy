# Dream Architect

**Walk back into your dreams.**

A dream journal where every entry becomes a walkable 3D dreamscape. Describe a dream
in plain words and it's compiled into a navigable scene; dreams accumulate into a 3D
constellation archive, and a motif engine surfaces the recurring "dream signs" hiding
across them.

> Pitch flanks: lucid-dream training · nightmare therapy (imagery rehearsal) ·
> "Notion for your subconscious."

Built for the HackIndia Vibe Coding Hackathon 2026 — Team Tech Spidy.

## Experience

- **Landing** (`/`) — cinematic, scroll-driven intro: dream hero, pinned pipeline,
  a horizontal painterly dream gallery, doorway-of-light CTA.
- **Archive** (`/archive`) — the real thing: a 3D constellation of dreams you can
  fly through, then drop into any dream as a first-person walkable scene with a
  look-to-reveal narrative HUD.

## Stack

- **Next.js 16** (Turbopack, App Router) · **React 19** · **TypeScript**
- **react-three-fiber** + **drei** + **three** — the 3D renderer
- **GSAP** + **ScrollTrigger** · **Lenis** smooth scroll · **Framer Motion**
- UnrealBloom + ACES tone mapping for the dream-quality post-processing
- No backend, no auth — your dreams never leave your device

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build / type gate
```

## Structure

```
app/
  page.tsx            landing route
  archive/page.tsx    3D archive route
components/
  landing/*           scroll-driven landing sections
  r3f/*               SceneWorld, ConstellationWorld, PostFX
lib/
  three/*             terrain, objects, atmosphere, buildScene, controls
  dream.ts            Scene-JSON schema + parsing
  insight.ts          motif / dream-sign detection
  seeds.ts            seed dreams
public/dreams/        painterly dream imagery
```
