import type { Dream, DreamObject } from "./dream";

// Motif detection across the archive — the "dream signs" pitch beat.
const has = (d: Dream, p: (o: DreamObject) => boolean) => (d.objects || []).some(p);

type Motif = { test: (d: Dream) => boolean; say: (n: number, t: number) => string };

const MOTIFS: Motif[] = [
  { test: (d) => d.environment.terrain === "water" || d.environment.terrain === "stream",
    say: (n, t) => `Water runs through ${n} of ${t} dreams.` },
  { test: (d) => has(d, (o) => o.behavior === "approach" || o.aura === "hostile"),
    say: (n, t) => `Something approaches you in ${n} of ${t}.` },
  { test: (d) => has(d, (o) => o.type === "orb"),
    say: (n, t) => `The unsaid-thing orb recurs in ${n} of ${t}.` },
  { test: (d) => has(d, (o) => o.type === "door"),
    say: (n, t) => `You leave yourself a way out in ${n} of ${t}.` },
  { test: (d) => (d.sky_features || []).some((f) => f.type === "moon" || f.type === "sun"),
    say: (n, t) => `A moon or sun watches over ${n} of ${t}.` },
  { test: (d) => d.undertone === "fearful" || d.undertone === "tense",
    say: (n, t) => `Fear colors ${n} of ${t} dreams.` },
  { test: (d) => d.locomotion === "fly" || d.locomotion === "float",
    say: (n, t) => `You leave the ground in ${n} of ${t}.` },
  { test: (d) => d.environment.time === "night" || d.environment.time === "unearthly",
    say: (n, t) => `${n} of ${t} happen after dark.` },
  { test: (d) => has(d, (o) => o.type === "figure"),
    say: (n, t) => `People you know appear in ${n} of ${t}.` },
];

export interface InsightRow { count: number; total: number; text: string }

export function computeInsights(dreams: Dream[]): InsightRow[] {
  const total = dreams.length;
  return MOTIFS.map((m) => {
    const count = dreams.filter(m.test).length;
    return { count, total, text: m.say(count, total) };
  })
    .filter((r) => r.count >= 2)
    .sort((a, b) => b.count - a.count);
}

export function motifTags(d: Dream): number[] {
  const out: number[] = [];
  MOTIFS.forEach((m, i) => { if (m.test(d)) out.push(i); });
  return out;
}
