import { interpolate } from 'remotion';
import { Vector3 } from 'three';
import { RULES } from '../styleLock';

/** QC keras: render GAGAL bila kamera < 8 m dari Komodo mana pun. */
export const assertKomodoDistance = (scene: string, frame: number, cam: [number, number, number], komodo: Vector3[]) => {
  for (const k of komodo) {
    const d = k.distanceTo(new Vector3(...cam));
    if (d < RULES.minKomodoCameraDistance) {
      throw new Error(`QC ${scene}: kamera ${d.toFixed(2)} m dari Komodo di frame ${frame} (< ${RULES.minKomodoCameraDistance} m)`);
    }
  }
};

/** Opacity fade in/hold/out. */
export const fade = (f: number, a: number, b: number, c = 1e9, d = 1e9 + 1) =>
  interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

export const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
