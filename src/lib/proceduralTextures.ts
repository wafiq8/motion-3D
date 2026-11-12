// Tekstur bump PROSEDURAL dari kode (noise/pola matematis) — bukan foto, bukan file luar.
import { DataTexture, RepeatWrapping, RGBAFormat, LinearFilter, LinearMipmapLinearFilter } from 'three';
import { createSimplex2D, fbm } from './noise';

const toTexture = (data: Uint8Array, size: number) => {
  const tex = new DataTexture(data, size, size, RGBAFormat);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
};

const cache = new Map<string, DataTexture>();

/** Bump halus fBm (tileable lewat sampling torus). Untuk tanah, kayu, strata. */
export const noiseBump = (seed = 7, size = 256, scale = 4) => {
  const key = `n${seed}-${size}-${scale}`;
  if (cache.has(key)) return cache.get(key)!;
  const n = createSimplex2D(seed);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // tileable: campur 4 sampel bergeser
      const u = x / size;
      const v = y / size;
      const s = (a: number, b: number) => fbm(n, a * scale, b * scale, 4);
      const val =
        s(u, v) * (1 - u) * (1 - v) +
        s(u - 1, v) * u * (1 - v) +
        s(u, v - 1) * (1 - u) * v +
        s(u - 1, v - 1) * u * v;
      const c = Math.max(0, Math.min(255, Math.round((val * 0.5 + 0.5) * 255)));
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = c;
      data[i + 3] = 255;
    }
  }
  const t = toTexture(data, size);
  cache.set(key, t);
  return t;
};

/** Pola sisik reptil: grid heksagonal sel-sel membulat + noise kecil. Tileable. */
export const scaleBump = (seed = 11, size = 256, cells = 16) => {
  const key = `s${seed}-${size}-${cells}`;
  if (cache.has(key)) return cache.get(key)!;
  const n = createSimplex2D(seed);
  const data = new Uint8Array(size * size * 4);
  const cw = size / cells;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const row = Math.floor(y / cw);
      const off = row % 2 === 0 ? 0 : cw / 2;
      const cx = (((x + off) % cw) + cw) % cw;
      const cy = y % cw;
      const dx = (cx - cw / 2) / (cw / 2);
      const dy = (cy - cw / 2) / (cw / 2);
      const d = Math.sqrt(dx * dx * 0.9 + dy * dy * 1.1);
      const dome = Math.max(0, 1 - d * d); // kubah sisik
      const jitter = n(x * 0.15, y * 0.15) * 0.12;
      const val = Math.max(0, Math.min(1, dome * 0.9 + jitter + 0.05));
      const c = Math.round(val * 255);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = c;
      data[i + 3] = 255;
    }
  }
  const t = toTexture(data, size);
  cache.set(key, t);
  return t;
};
