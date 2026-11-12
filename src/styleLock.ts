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

/** Batas scene (frame @30fps). Hard cut antar scene. */
export const SCENES = [
  { id: 'S1', from: 0, to: 210 },
  { id: 'S2', from: 210, to: 480 },
  { id: 'S3', from: 480, to: 780 },
  { id: 'S4', from: 780, to: 1080 },
  { id: 'S5', from: 1080, to: 1290 },
  { id: 'S6', from: 1290, to: 1560 },
  { id: 'S7', from: 1560, to: 1800 },
] as const;
