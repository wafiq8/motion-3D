export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const easeInOut = (x: number) => { const t = clamp(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 0..1 naik di [a, a+d], turun di [b-d2, b]
export const win = (t: number, a: number, b: number, d = 0.35, d2 = d) =>
  Math.min(easeOut((t - a) / d), 1 - easeInOut((t - (b - d2)) / d2));
export const ramp = (t: number, a: number, d: number) => easeInOut((t - a) / d);
// acak ber-seed tetap (mulberry32)
export const seeded = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const fmtID = (v: number, dec = 0) =>
  v.toLocaleString('id-ID', {minimumFractionDigits: dec, maximumFractionDigits: dec});
