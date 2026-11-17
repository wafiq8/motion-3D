// Satu penerbangan kamera kontinu. Semua posisi = fungsi murni dari waktu (detik).
// Titik kunci terikat ke awal kalimat/kata di docs/timeline.json.
import * as THREE from 'three';
import {easeInOut, lerp} from './anim';
import {wx, wz} from './geo';

type Key = [t: number, lon: number, lat: number, dist: number, pitch: number, heading: number];
export const KEYS: Key[] = [
  [0.0, 122.8, -1.6, 38, 62, -30],      // S1 establishing seluruh Nusantara
  [5.9, 122.4, -2.0, 34, 58, -26],
  [10.8, 123.2, 0.4, 24, 54, -14],
  [12.4, 126.9, 4.9, 10.5, 54, -18],     // S2 zoom ngebut ke gerbang Pasifik (kal. 3)
  [18.4, 127.4, 5.6, 8.5, 48, -8],
  [19.6, 122.4, -1.8, 36, 62, -24],      // S3 tarik mundur: 15 juta (kal. 5)
  [24.0, 122.4, -1.8, 34, 64, -20],
  [25.4, 121.2, -4.4, 30, 58, -18],      // mooring INSTANT (kal. 6)
  [32.2, 121.4, -4.6, 28, 56, -22],
  [33.8, 127.2, 6.0, 6.5, 44, 30],     // S4 Mindanao (kal. 7)
  [36.6, 124.0, 3.4, 7.5, 46, 24],
  [39.0, 118.8, -1.0, 6.8, 48, 10],    // Selat Makassar
  [44.0, 118.4, -3.0, 6.2, 50, 0],
  [47.0, 118.9, -4.6, 7.0, 52, -10],
  [48.6, 127.6, -3.1, 9.0, 26, 74],    // S5 potongan Lifamatola→Banda (kal. 9)
  [54.4, 127.6, -3.4, 8.4, 28, 84],
  [55.8, 122.6, -7.0, 14, 58, 0],      // S6 tiga pintu (kal. 10)
  [58.0, 121.6, -7.8, 13, 56, 0],
  [59.4, 115.75, -8.6, 2.7, 50, -10],  // Selat Lombok (kal. 11)
  [66.8, 115.8, -8.85, 3.1, 46, 10],
  [68.3, 125.0, -8.55, 3.8, 48, 0],    // S7 Selat Ombai (kal. 12)
  [70.9, 124.9, -8.7, 4.0, 50, 8],
  [72.4, 123.8, -11.0, 6.2, 52, -8],   // Celah Timor (kal. 13)
  [76.4, 122.4, -11.9, 7.2, 50, -16],
  [78.9, 121.6, -10.4, 12, 56, -6],
  [80.6, 122.2, -2.4, 36, 62, -28],      // S8 verdict + napas arus (kal. 14)
  [92.8, 122.6, -2.8, 33, 60, -20],
  [94.6, 120.0, -9.0, 16, 50, -6],      // S9 Lombok vs Timor (kal. 16)
  [102.2, 119.8, -9.6, 13.5, 44, 10],
];
export const FOV = 38;

export type Cam = {pos: THREE.Vector3; target: THREE.Vector3; dist: number};
export const camAt = (t: number): Cam => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = easeInOut((t - a[0]) / (b[0] - a[0]));
  const lon = lerp(a[1], b[1], u), lat = lerp(a[2], b[2], u);
  const dist = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u));
  const p = (lerp(a[4], b[4], u) * Math.PI) / 180;
  const h = (lerp(a[5], b[5], u) * Math.PI) / 180;
  const target = new THREE.Vector3(wx(lon), 0, wz(lat));
  const pos = target.clone().add(new THREE.Vector3(
    dist * Math.cos(p) * Math.sin(h), dist * Math.sin(p), dist * Math.cos(p) * Math.cos(h)));
  return {pos, target, dist};
};

// kamera Three untuk proyeksi overlay DOM (sama persis dengan kamera render)
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.05, 400);
export const projector = (t: number) => {
  const c = camAt(t);
  projCam.position.copy(c.pos); projCam.lookAt(c.target); projCam.updateMatrixWorld(); projCam.updateProjectionMatrix();
  return (p: THREE.Vector3) => {
    const q = p.clone().project(projCam);
    const behind = p.clone().sub(c.pos).dot(c.target.clone().sub(c.pos)) <= 0;
    return {x: (q.x * 0.5 + 0.5) * 1080, y: (-q.y * 0.5 + 0.5) * 1920, ok: !behind && q.z < 1};
  };
};
// kecepatan kamera relatif (untuk blur gerak saat zoom ngebut)
export const camSpeed = (t: number) => {
  const a = camAt(t), b = camAt(t - 1 / 30);
  return a.pos.distanceTo(b.pos) / a.dist + a.target.distanceTo(b.target) / a.dist;
};
