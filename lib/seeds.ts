import type { Dream } from "./dream";

// The 10 real parsed dreams (schema v1.4). Conventions: the unsaid-thing orb,
// the visible-exit door (IRT), child-POV giant_scale, peak-moment, abstraction.
const PI = Math.PI;

export const SEEDS: Record<string, Dream> = {
  wedding: {
    title: "The Wedding Letter",
    mood: "surreal",
    undertone: "wistful",
    locomotion: "float",
    palette: { sky_top: "#1a1730", sky_bottom: "#3a3352", fog: "#2a2740", ground: "#20203a", accent: "#d8c8a0" },
    environment: { terrain: "void", fog_density: 0.04, time: "unearthly" },
    lighting: { ambient: 0.5, key_color: "#cdbfe0", key_intensity: 0.6, key_position: [20, 40, -40] },
    sky_features: [{ type: "moon", scale: "normal", color: "#cfc6a8" }],
    objects: [
      { type: "figure", label: "someone half-remembered", aura: "neutral", position: [0, 0, -10] },
      { type: "window", label: "the letter", position: [0, 0, -6], color: "#e8d9a8" },
      { type: "orb", label: "what it was supposed to say", position: [1.6, 0, -9.2], float: true },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: false, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "dust", density: 300 },
    ambient_sound: "silence",
  },

  jhargram: {
    title: "Jhargram, Two Rainbows",
    mood: "euphoric",
    undertone: "fearful",
    locomotion: "walk",
    palette: { sky_top: "#0a0e2a", sky_bottom: "#2c4a7a", fog: "#16243f", ground: "#141b30", accent: "#7fe0d4" },
    environment: { terrain: "flat", fog_density: 0.016, time: "unearthly" },
    lighting: { ambient: 0.42, key_color: "#bcd0ff", key_intensity: 0.85, key_position: [-60, 90, -120] },
    sky_features: [
      { type: "moon", scale: "giant", color: "#efe8cd" },
      { type: "rainbow", count: 2, scale: "giant" },
      { type: "lightning", frequency: "occasional" },
    ],
    objects: [
      { type: "stall", label: "market stalls", count: 10, arrangement: "row", row_offset: 4.6, row_start: 5, spacing: 6.5 },
      { type: "shop", label: "jhal muri shop", position: [4.8, 0, -3], rotation_y: PI / 2 },
      { type: "figure", label: "dada", aura: "friendly", position: [2.4, 0, -3.5], rotation_y: -0.5 },
      { type: "tree", label: "sal trees", count: 14, scatter_radius: 46, color: "#0c1f19" },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: false, floating_islands: false },
    particles: { type: "fireflies", density: 240 },
    ambient_sound: "wind",
  },

  ghost: {
    title: "The Guest Who Wasn't There",
    mood: "eerie",
    undertone: "fearful",
    locomotion: "walk",
    palette: { sky_top: "#0a0a12", sky_bottom: "#161020", fog: "#0d0a14", ground: "#15131c", accent: "#6ad0ff" },
    environment: { terrain: "room", fog_density: 0.04, time: "night" },
    lighting: { ambient: 0.28, key_color: "#6a7fa0", key_intensity: 0.5, key_position: [10, 30, -20] },
    sky_features: [],
    objects: [
      { type: "figure", label: "the guest who came to kill", aura: "hostile", behavior: "approach", position: [0, 0, -12] },
      { type: "figure", label: "a relative, not noticing", aura: "neutral", position: [-4, 0, -5] },
      { type: "figure", label: "another, not noticing", aura: "neutral", position: [4.5, 0, -6] },
      { type: "cube", label: "the bed", color: "#1c1722", scale: [3, 0.8, 2], position: [-6, 0, -8] },
      { type: "door", label: "the way out (behind you)", color: "#5fe0a0", position: [0, 0, 12] },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: false, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "dust", density: 120 },
    ambient_sound: "silence",
  },

  teacher: {
    title: "The Art Room",
    mood: "eerie",
    undertone: "tense",
    locomotion: "walk",
    palette: { sky_top: "#12110e", sky_bottom: "#221d14", fog: "#1a160f", ground: "#211b12", accent: "#e8b84d" },
    environment: { terrain: "room", fog_density: 0.045, time: "day" },
    lighting: { ambient: 0.4, key_color: "#fff4e0", key_intensity: 0.7, key_position: [0, 40, 10] },
    sky_features: [],
    objects: [
      { type: "figure", label: "the art teacher, raised hand", aura: "hostile", behavior: "approach", scale: [1.8, 1.8, 1.8], position: [0, 0, -7] },
      { type: "cube", label: "school desks", count: 6, arrangement: "row", row_offset: 3.2, row_start: 3, spacing: 3, color: "#2a2418", scale: [1.4, 0.8, 1] },
      { type: "orb", label: "the thing you couldn't say back", position: [-1.4, 0, -2], float: true },
      { type: "door", label: "the way out (behind you)", color: "#5fe0a0", position: [0, 0, 12] },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: true, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "dust", density: 90 },
    ambient_sound: "silence",
  },

  weddingCrush: {
    title: "Brother's Wedding, the Temple, the Unsaid",
    mood: "melancholic",
    undertone: "wistful",
    locomotion: "walk",
    palette: { sky_top: "#2a1830", sky_bottom: "#b5654a", fog: "#5a3a44", ground: "#2a2030", accent: "#ffb38a" },
    environment: { terrain: "flat", fog_density: 0.03, time: "dusk" },
    lighting: { ambient: 0.5, key_color: "#ffd0a0", key_intensity: 1.0, key_position: [40, 30, -30] },
    sky_features: [{ type: "sun", scale: "normal", color: "#ff9a5a" }],
    objects: [
      { type: "pillar", label: "temple pillars", count: 8, arrangement: "row", row_offset: 3.6, row_start: 8, spacing: 4, color: "#5a4658", scale: [1, 4, 1] },
      { type: "stair", label: "temple steps", position: [0, 0, -15], color: "#6a5060" },
      { type: "door", label: "the temple arch", position: [0, 0, -20], color: "#ffcaa0", scale: [1.4, 1.4, 1.4] },
      { type: "figure", label: "your brother, married now", aura: "friendly", position: [-3, 0, -6] },
      { type: "figure", label: "the one you never told", aura: "friendly", position: [2.6, 0, -7] },
      { type: "orb", label: "the unsaid thing", position: [3.7, 0, -7.3], float: true },
      { type: "stall", label: "wedding stalls", count: 4, scatter_radius: 12, color: "#5a3a4a" },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: false, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "dust", density: 220 },
    ambient_sound: "wind",
  },

  godWishes: {
    title: "God, and Three Wishes",
    mood: "euphoric",
    undertone: "wondrous",
    locomotion: "float",
    palette: { sky_top: "#060418", sky_bottom: "#1a0d3a", fog: "#0a0820", ground: "#000000", accent: "#ffd97a" },
    environment: { terrain: "void", fog_density: 0.02, time: "unearthly" },
    lighting: { ambient: 0.45, key_color: "#fff0c0", key_intensity: 1.0, key_position: [0, 60, -40] },
    sky_features: [{ type: "moon", scale: "giant", color: "#fff0c0" }],
    objects: [
      { type: "figure", label: "the presence that filled the sky", aura: "friendly", scale: [3.4, 3.4, 3.4], position: [0, 4, -22], float: true, color: "#ffe6a0" },
      { type: "orb", label: "the first wish", position: [-4.5, 1, -12], float: true, color: "#a0d8ff" },
      { type: "orb", label: "the second wish", position: [0, 1, -10], float: true, color: "#ffd97a" },
      { type: "orb", label: "the wish you couldn't decide", position: [4.5, 1, -12], float: true, color: "#ffa0d0" },
      { type: "crystal", label: "shards of the moment", count: 6, scatter_radius: 30, emissive: true, color: "#c9a0ff" },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: false, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "stars", density: 700 },
    ambient_sound: "hum",
  },

  jungle: {
    title: "Jungle, Close",
    mood: "euphoric",
    undertone: "wondrous",
    locomotion: "walk",
    palette: { sky_top: "#0e1a12", sky_bottom: "#2a3a1e", fog: "#1a2614", ground: "#14210f", accent: "#ffd28a" },
    environment: { terrain: "flat", fog_density: 0.05, time: "dusk" },
    lighting: { ambient: 0.5, key_color: "#ffcaa0", key_intensity: 0.8, key_position: [20, 25, -20] },
    sky_features: [],
    objects: [
      { type: "figure", label: "you", aura: "friendly", position: [-0.8, 0, -5], rotation_y: 0.5 },
      { type: "figure", label: "them", aura: "friendly", position: [0.8, 0, -5.2], rotation_y: -0.5 },
      { type: "orb", label: "the warmth between", position: [0, 0, -5], float: true },
      { type: "tree", label: "the jungle, all around", count: 22, scatter_radius: 30, color: "#0c2410" },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: false, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "fireflies", density: 300 },
    ambient_sound: "wind",
  },

  flying: {
    title: "Flying, Until I Knew",
    mood: "euphoric",
    undertone: "wondrous",
    locomotion: "fly",
    palette: { sky_top: "#2a6ad0", sky_bottom: "#bfe0ff", fog: "#cfe5ff", ground: "#6a7a8a", accent: "#ffd14d" },
    environment: { terrain: "flat", fog_density: 0.008, time: "day" },
    lighting: { ambient: 0.7, key_color: "#fff6e0", key_intensity: 1.1, key_position: [60, 80, -40] },
    sky_features: [{ type: "sun", scale: "normal", color: "#fff0c0" }],
    objects: [
      { type: "cube", label: "the city below", count: 12, scatter_radius: 80, color: "#3a4a5a", scale: [3, 14, 3] },
      { type: "cube", label: "rooftops", count: 16, scatter_radius: 55, color: "#46566a", scale: [4, 6, 4] },
      { type: "orb", label: "the moment I knew I was dreaming", position: [0, 16, -22], float: true },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: false, floating_islands: true, ceiling_is_sky: false },
    particles: { type: "dust", density: 120 },
    ambient_sound: "wind",
  },

  mantra: {
    title: "Two Girls, the Mantra, the Road",
    mood: "chaotic",
    undertone: "fearful",
    locomotion: "walk",
    palette: { sky_top: "#05060a", sky_bottom: "#0e1018", fog: "#080a10", ground: "#0d0f16", accent: "#6ad0ff" },
    environment: { terrain: "flat", fog_density: 0.06, time: "night" },
    lighting: { ambient: 0.25, key_color: "#4a5a7a", key_intensity: 0.4, key_position: [0, 30, -30] },
    sky_features: [{ type: "moon", scale: "normal", color: "#aab4c8" }],
    objects: [
      { type: "cube", label: "office towers", count: 12, arrangement: "row", row_offset: 7, row_start: 6, spacing: 9, color: "#10141c", scale: [5, 16, 5] },
      { type: "figure", label: "first girl, reciting", aura: "neutral", position: [-1.2, 0, -6] },
      { type: "figure", label: "second girl, reciting", aura: "neutral", position: [0.4, 0, -6.4] },
      { type: "figure", label: "the thing that meant us harm", aura: "hostile", behavior: "approach", position: [0, 0, -18] },
      { type: "door", label: "the exit (behind you)", color: "#5fe0a0", position: [0, 0, 12] },
    ],
    anomalies: { gravity_tilt_deg: 4, giant_scale: false, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "dust", density: 100 },
    ambient_sound: "silence",
  },

  paperBoat: {
    title: "Paper Boat, Village Road",
    mood: "serene",
    undertone: "wistful",
    locomotion: "walk",
    palette: { sky_top: "#6a8ac0", sky_bottom: "#f0d8b0", fog: "#cdbf9a", ground: "#6a5a3a", accent: "#fff2d0" },
    environment: { terrain: "stream", fog_density: 0.03, time: "day" },
    lighting: { ambient: 0.6, key_color: "#fff0d0", key_intensity: 1.0, key_position: [30, 40, -20] },
    sky_features: [{ type: "sun", scale: "normal", color: "#fff2cf" }],
    objects: [
      { type: "boat", label: "the paper boat", color: "#f4f0e6", behavior: "drift", position: [0, 0, -6] },
      { type: "tree", label: "village trees", count: 10, scatter_radius: 28, color: "#1a3a1e" },
      { type: "house", label: "village houses", count: 6, scatter_radius: 24, color: "#3a2a1e", scale: [4, 4, 5] },
    ],
    anomalies: { gravity_tilt_deg: 0, giant_scale: true, floating_islands: false, ceiling_is_sky: false },
    particles: { type: "dust", density: 150 },
    ambient_sound: "wind",
  },
};

export const ORDER = [
  "wedding", "jhargram", "ghost", "teacher", "weddingCrush",
  "godWishes", "jungle", "flying", "mantra", "paperBoat",
];

export const DREAMS: Dream[] = ORDER.map((k) => ({ ...SEEDS[k], key: k }));

export function dreamByKey(key: string | null | undefined): Dream | null {
  return key && SEEDS[key] ? { ...SEEDS[key], key } : null;
}
