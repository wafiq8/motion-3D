// Deterministic helpers: no Math.random, everything from seeds + frame time.
export const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
export const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  const u = smooth(xf), v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm = (x: number, y: number, oct = 4) => {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += amp * vnoise(x * f, y * f); f *= 2.03; amp *= 0.5; }
  return s;
};
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
/** 0→1 ramp between times a and b (seconds) */
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export type V3 = [number, number, number];
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** Catmull-Rom style smooth keyframes: keys = [time, value][] */
export const keys3 = (t: number, ks: [number, V3][]): V3 => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [t0, a] = ks[i], [t1, b] = ks[i + 1];
    if (t <= t1) return lerp3(a, b, ease((t - t0) / (t1 - t0)));
  }
  return ks[ks.length - 1][1];
};
export const keys1 = (t: number, ks: [number, number][]): number => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [t0, a] = ks[i], [t1, b] = ks[i + 1];
    if (t <= t1) return lerp(a, b, ease((t - t0) / (t1 - t0)));
  }
  return ks[ks.length - 1][1];
};
