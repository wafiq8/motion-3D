// Panggung peta: 1 unit dunia = 1 derajat; pusat 121.5°BT, 2°LS.
// Elevasi GEBCO (meter) dikali VS (eksagerasi vertikal 12x).
import * as THREE from 'three';
export const LON0 = 108, LON1 = 135, LAT0 = -14, LAT1 = 10;
export const CX = 121.5, CLAT = -2;
export const VS = 12 / 111000;
export const HW = 1080, HH = 960; // grid height.bin (40 px/derajat)
export const wx = (lon: number) => lon - CX;
export const wz = (lat: number) => -(lat - CLAT);
export const lonOf = (x: number) => x + CX;
export const latOf = (z: number) => -z + CLAT;

let H: Int16Array | null = null;
export const setHeights = (h: Int16Array) => { H = h; };
export const heightsReady = () => H !== null;

// elevasi (meter) bilinear
export const elevM = (lon: number, lat: number): number => {
  if (!H) return 0;
  const c = Math.min(HW - 1.001, Math.max(0, (lon - LON0) * 40 - 0.5));
  const r = Math.min(HH - 1.001, Math.max(0, (LAT1 - lat) * 40 - 0.5));
  const c0 = Math.floor(c), r0 = Math.floor(r), fc = c - c0, fr = r - r0;
  const g = (rr: number, cc: number) => H![rr * HW + cc];
  return (g(r0, c0) * (1 - fc) + g(r0, c0 + 1) * fc) * (1 - fr) +
    (g(r0 + 1, c0) * (1 - fc) + g(r0 + 1, c0 + 1) * fc) * fr;
};
export const v3 = (lon: number, lat: number, y = 0) => new THREE.Vector3(wx(lon), y, wz(lat));

let ALB: HTMLImageElement | null = null;
export const setAlbedo = (i: HTMLImageElement) => { ALB = i; };
export const getAlbedo = () => ALB;

// eksagerasi: darat 12x, laut 7.8x (palung tidak menelan frame)
export const yOf = (h: number) => (h > 0 ? h * VS : h * VS * 0.65);
