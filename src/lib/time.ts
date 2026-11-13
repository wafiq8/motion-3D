// Semua gerak diturunkan dari waktu absolut t (detik) = frame / fps.
import timeline from '../../docs/timeline.json';
import words from '../../docs/words.json';

export const FPS = timeline.fps;
export const TOTAL_S = timeline.total_duration_s;
export const TOTAL_FRAMES = Math.round(TOTAL_S * FPS);
export type Word = {w: string; s: number; e: number; sent: number};
export const WORDS = words as Word[];
export const SENTENCES = timeline.sentences;
export const SCENES = timeline.scenes;
export const sceneStart = (id: number) => SCENES[id - 1].start_s;
export const sceneEnd = (id: number) => SCENES[id - 1].end_s;
export const sceneFrames = (id: number) => [Math.round(sceneStart(id) * FPS), Math.round(sceneEnd(id) * FPS)] as const;

/** Waktu mulai kata ke-n (1-based) dari kalimat sId yang cocok dengan teks (tanpa tanda baca). */
export const wordAt = (sId: number, text: string, nth = 1): number => {
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, '');
  let c = 0;
  for (const w of WORDS) {
    if (w.sent === sId && norm(w.w) === norm(text)) {
      c++;
      if (c === nth) return w.s;
    }
  }
  throw new Error(`kata "${text}" (#${nth}) tidak ada di kalimat ${sId}`);
};
export const wordEnd = (sId: number, text: string, nth = 1): number => {
  const s = wordAt(sId, text, nth);
  return WORDS.find((w) => w.sent === sId && w.s === s)!.e;
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
export const smoother = (x: number) => {
  const c = clamp(x);
  return c * c * c * (c * (c * 6 - 15) + 10);
};
/** 0→1 antara t0..t1 dengan easing halus. */
export const ramp = (t: number, t0: number, t1: number) => smoother((t - t0) / (t1 - t0));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export type V3 = [number, number, number];
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Keyframe vektor: [[t, v], ...] diinterpolasi smoother antar kunci. */
export const kf3 = (t: number, keys: [number, V3][]): V3 => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1];
      const [t1, b] = keys[i];
      return lerp3(a, b, smoother((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};
export const kf1 = (t: number, keys: [number, number][]): number => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1];
      const [t1, b] = keys[i];
      return lerp(a, b, smoother((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};

/** Acak ber-seed tetap (mulberry32). */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
