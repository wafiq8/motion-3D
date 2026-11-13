/**
 * STYLE LOCK — "Diorama 3D Basabasi v1"
 * Dipakai oleh SEMUA scene tanpa pengecualian. Jangan hardcode warna/cahaya di scene;
 * selalu ambil dari sini.
 */
import { Color } from 'three';

export const STYLE_NAME = 'Diorama 3D Basabasi v1';

export const PALETTE = {
  sabana: '#C8A24A', // sabana kering
  pasir: '#EAD9B0', // pasir krem
  kayu: '#6B4226', // kayu cokelat
  laut: '#2E6E8E', // laut biru
  senja: '#F08A2E', // senja oranye
  emas: '#D9A62E', // emas angka
  kabut: '#F2D8AE', // kabut hangat
  komodo: '#57493A', // tubuh Komodo
  siluet: '#1F150C', // siluet manusia
} as const;

/** Warna tipografi (kartu judul). */
export const TYPE_COLORS = {
  utama: '#FFFFFF',
  aksen: '#FFB03A',
} as const;

/** Awan: SELALU merged spheres, warna tetap. */
export const CLOUD = {
  color: '#FFF3DC',
  minSpheres: 5,
  maxSpheres: 9,
} as const;

/**
 * Warna turunan — HANYA hasil campuran warna palet di atas (bukan warna baru).
 * Dipakai untuk variasi alami (daun lontar, pangkal rumput, perut Komodo, dsb).
 */
const mix = (a: string, b: string, t: number) =>
  '#' + new Color(a).lerp(new Color(b), t).getHexString();
const shade = (a: string, t: number) =>
  '#' + new Color(a).lerp(new Color('#000000'), t).getHexString();

export const DERIVED = {
  daunLontar: shade(mix(PALETTE.sabana, PALETTE.laut, 0.4), 0.08),
  rumputPangkal: shade(PALETTE.sabana, 0.3),
  rumputUjung: mix(PALETTE.sabana, PALETTE.pasir, 0.55),
  tanahGelap: mix(PALETTE.kayu, PALETTE.sabana, 0.35),
  komodoPerut: mix(PALETTE.komodo, PALETTE.pasir, 0.28),
  komodoGelap: shade(PALETTE.komodo, 0.35),
  lidah: mix(PALETTE.emas, PALETTE.senja, 0.4),
  langitAtas: mix(PALETTE.kabut, PALETTE.laut, 0.28),
  langitHorizon: mix(PALETTE.senja, PALETTE.kabut, 0.45),
  bukitJauh: mix(PALETTE.sabana, PALETTE.kabut, 0.3),
} as const;

/** Cahaya — sudut senja TETAP untuk semua scene. */
export const LIGHT = {
  hemisphere: { sky: '#FFE3B3', ground: '#8A6B45', intensity: 0.9 },
  sun: {
    color: '#FFD9A0',
    intensity: 2.2,
    // Arah datang matahari (dinormalisasi di rig). Elevasi ~19°, dari samping kiri (side-light senja).
    direction: [-0.85, 0.32, 0.22] as [number, number, number],
    distance: 60,
    shadowMapSize: 2048,
    shadowRadius: 6, // bayangan lembut
    shadowBias: -0.0004,
    shadowNormalBias: 0.03,
    shadowArea: 30, // setengah lebar frustum bayangan (meter)
  },
} as const;

export const RENDER = {
  toneMapping: 'ACESFilmic' as const,
  exposure: 1.1,
  fog: { color: PALETTE.kabut, near: 25, far: 260 },
  /** FOV vertikal kamera native 9:16. */
  fov: 42,
} as const;

/** Material: MeshStandardMaterial, roughness 0.85–1.0, metalness 0 (emas 0.65). */
export const MATERIAL = {
  roughnessMin: 0.85,
  roughnessMax: 1.0,
  metalness: 0,
  gold: { color: PALETTE.emas, metalness: 0.65, roughness: 0.85 },
} as const;

/** Aturan keras yang dicek di kode (QC). */
export const RULES = {
  /** Jarak kamera minimum ke Komodo di SEMUA scene (meter). */
  minKomodoCameraDistance: 8,
} as const;

/** Video global. */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1800,
} as const;

/**
 * NARASI = MASTER CLOCK. public/narasi-komodo.mp3 (48,04 dtk) dimulai di frame 0.
 * Batas kalimat diukur dari jeda hening (ffmpeg silencedetect, -35 dB, >=0,38 dtk):
 *   k1 3,39–6,21 | k2 6,76–10,71 | k3 11,16–13,76 | k4 14,28–18,72 | k5 19,14–25,95
 *   k6 26,43–37,18 | k7 37,60–40,78 | k8 41,16–43,46 | k9 43,88–47,83
 * (k5 berisi satu jeda napas 23,56–23,97 yang diperlakukan sebagai koma.)
 * Hard cut diletakkan di tengah jeda antar kalimat.
 */
export const NARRATION = {
  file: 'narasi-komodo.mp3',
  durationSec: 48.04,
  sentences: [
    [3.39, 6.21], [6.76, 10.71], [11.16, 13.76], [14.28, 18.72], [19.14, 25.95],
    [26.43, 37.18], [37.6, 40.78], [41.16, 43.46], [43.88, 47.83],
  ] as [number, number][],
} as const;

/** Batas scene (frame @30fps). Hard cut antar scene. */
export const SCENES = [
  { id: 'S1', from: 0, to: 328 }, // kalimat 1–2
  { id: 'S2', from: 328, to: 568 }, // kalimat 3–4
  { id: 'S3', from: 568, to: 786 }, // kalimat 5
  { id: 'S4', from: 786, to: 1122 }, // kalimat 6
  { id: 'S5', from: 1122, to: 1229 }, // kalimat 7
  { id: 'S6', from: 1229, to: 1310 }, // kalimat 8
  { id: 'S7', from: 1310, to: 1800 }, // kalimat 9 + kartu penutup s/d 60 dtk
] as const;

/** Frame lokal scene untuk detik narasi absolut. */
export const sceneLocal = (sceneId: string, sec: number) => {
  const s = SCENES.find((x) => x.id === sceneId)!;
  return Math.round(sec * VIDEO.fps) - s.from;
};
export const sceneDuration = (sceneId: string) => {
  const s = SCENES.find((x) => x.id === sceneId)!;
  return s.to - s.from;
};
