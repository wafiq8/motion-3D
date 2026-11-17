// Jalur arus DISEDERHANAKAN (bukan lintasan terukur): titik bujur/lintang mengikuti
// koridor utama Arlindo menurut Gordon dkk. 2010 (program INSTANT).
import * as THREE from 'three';
import {v3} from './geo';
type LL = [number, number];
const Y = 0.035;
const mk = (pts: LL[], y = Y) => new THREE.CatmullRomCurve3(pts.map(([lo, la]) => v3(lo, la, y)), false, 'centripetal');

export const MAIN: LL[] = [[131.5, 7.6], [128.2, 6.4], [126.6, 5.0], [124.6, 3.9], [122.0, 2.9], [119.9, 1.4],
  [118.9, -0.4], [118.35, -2.6], [118.6, -4.8], [119.8, -6.1], [121.6, -6.6], [123.8, -6.3], [126.0, -5.6]];
export const T_BR: LL[] = [[126.0, -5.6], [127.3, -6.9], [127.7, -8.6], [126.4, -9.6], [124.4, -10.7], [122.4, -11.7], [119.6, -13.3]];
export const O_BR: LL[] = [[126.0, -5.6], [125.55, -7.2], [125.05, -8.42], [123.9, -8.95], [122.7, -9.7], [121.2, -11.3]];
export const L_BR: LL[] = [[121.6, -6.6], [119.3, -7.0], [117.2, -7.6], [115.95, -8.3], [115.72, -8.8], [115.55, -9.6], [115.2, -11.5]];
export const DEEP: LL[] = [[130.2, 1.6], [128.4, 0.6], [127.2, -0.8], [126.95, -1.9], [126.9, -3.4], [126.6, -4.8]];

export const curves = {
  main: mk(MAIN), timor: mk(T_BR), ombai: mk(O_BR), lombok: mk(L_BR), deep: mk(DEEP, -0.22),
  parcel: mk([...MAIN, ...T_BR.slice(1)]),
};
// debit (juta m3/dtk) -> jari-jari tabung
export const radiusFor = (q: number) => 0.016 + 0.0062 * q;

// parameter u (0..1) titik terdekat pada kurva parcel ke bujur/lintang
const nearestU = (c: THREE.Curve<THREE.Vector3>, lon: number, lat: number) => {
  const p = v3(lon, lat, Y); let best = 0, bd = 1e9;
  for (let i = 0; i <= 2000; i++) { const d = c.getPointAt(i / 2000).distanceToSquared(p); if (d < bd) { bd = d; best = i / 2000; } }
  return best;
};
const P = curves.parcel;
// waktu (detik, dari timeline) -> posisi paket air di sepanjang jalur
export const PARCEL_KEYS: [number, number][] = [
  [14.86, nearestU(P, 128.6, 6.3)], [18.6, nearestU(P, 127.9, 6.1)], [32.6, nearestU(P, 127.9, 6.1)],
  [34.2, nearestU(P, 127.6, 6.0)], [36.6, nearestU(P, 123.6, 3.5)], [38.5, nearestU(P, 119.6, 1.0)],
  [41.0, nearestU(P, 118.5, -1.8)], [47.1, nearestU(P, 118.55, -4.6)], [52.0, nearestU(P, 122.5, -6.5)],
  [54.7, nearestU(P, 125.6, -5.8)], [70.9, nearestU(P, 126.2, -5.6)], [75.5, nearestU(P, 125.6, -9.9)],
  [79.3, nearestU(P, 121.0, -12.5)], [102.2, 1.0],
];
export const parcelU = (t: number) => {
  const K = PARCEL_KEYS;
  if (t <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) {
    const [t0, u0] = K[i], [t1, u1] = K[i + 1];
    if (t <= t1) { const x = (t - t0) / (t1 - t0); const s = x * x * (3 - 2 * x); return u0 + (u1 - u0) * s; }
  }
  return 1;
};
