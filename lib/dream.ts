// Scene JSON schema v1.4 — typed. The LLM compiles a dream into one of these;
// the renderer turns it into a walkable world.
export type Locomotion = "walk" | "fly" | "float";

export interface Palette {
  sky_top: string;
  sky_bottom: string;
  fog: string;
  ground: string;
  accent: string;
}

export interface SkyFeature {
  type: string; // moon | sun | rainbow | lightning | aurora
  scale?: string; // normal | giant
  count?: number;
  color?: string;
  frequency?: string;
}

export interface DreamObject {
  type: string;
  label?: string;
  aura?: string; // friendly | neutral | hostile
  behavior?: string; // static | approach | wander | drift
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation_y?: number;
  color?: string;
  emissive?: boolean;
  float?: boolean;
  spin?: boolean;
  count?: number;
  scatter_radius?: number;
  arrangement?: string; // scatter | row
  row_offset?: number;
  row_start?: number;
  spacing?: number;
}

export interface Anomalies {
  gravity_tilt_deg?: number;
  giant_scale?: boolean;
  floating_islands?: boolean;
  ceiling_is_sky?: boolean;
}

export interface Dream {
  key?: string;
  title: string;
  mood: string;
  undertone: string;
  locomotion: Locomotion;
  palette: Palette;
  environment: { terrain: string; fog_density: number; time: string };
  lighting: {
    ambient: number;
    key_color: string;
    key_intensity: number;
    key_position: [number, number, number];
  };
  sky_features: SkyFeature[];
  objects: DreamObject[];
  anomalies: Anomalies;
  particles: { type: string; density?: number };
  ambient_sound: string;
}
