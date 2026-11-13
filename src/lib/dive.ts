import {Cam} from './project';
import {V3, lerp3, smoother, clamp, lerp} from './time';
/**
 * Transisi ikuti-paket: kamera keluar dari paket di awal scene dan menyelam
 * ke paket di akhir scene; kilau emas menutup sambungan (match-cut pada hero).
 */
export const DIVE = 0.28;
export const withDive = (cam: Cam, packet: V3, t: number, t0: number, t1: number, o: {inn?: boolean; out?: boolean; r?: number} = {}): {cam: Cam; flash: number} => {
  const inn = o.inn ?? true;
  const out = o.out ?? true;
  let k = 0;
  let flash = 0;
  if (inn && t < t0 + DIVE) {
    k = 1 - smoother((t - t0) / DIVE);
    flash = 0.6 * clamp(1 - (t - t0) / (DIVE * 0.6));
  }
  if (out && t > t1 - DIVE) {
    k = smoother((t - (t1 - DIVE)) / DIVE);
    flash = 0.6 * clamp((t - (t1 - DIVE * 0.4)) / (DIVE * 0.4));
  }
  if (k <= 0) return {cam, flash};
  const dir: V3 = [cam.pos[0] - packet[0], cam.pos[1] - packet[1], cam.pos[2] - packet[2]];
  const len = Math.hypot(...dir) || 1;
  const nd = Math.max(0.3, (o.r ?? 0.4) * 2.0);
  const near: V3 = [packet[0] + (dir[0] / len) * nd, packet[1] + (dir[1] / len) * nd, packet[2] + (dir[2] / len) * nd];
  return {cam: {pos: lerp3(cam.pos, near, k), target: lerp3(cam.target, packet, k), fov: lerp(cam.fov, cam.fov * 1.15, k)}, flash};
};
