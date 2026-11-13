import React from 'react';
import * as THREE from 'three';
import {Stage} from '../three/Stage';
import {Epithelium, CELL_TOP, CAP_Y, CAPILLARY} from '../three/models/Epithelium';
import {HeroToxin, ToxinField, InflameFlow} from '../three/models/Toxin';
import {BodyWorld, HEART_POS} from '../three/models/BodyWorld';
import {IVC} from '../three/models/Body';
import {Chip} from '../overlay/Chip';
import {C, W} from '../lib/style';
import {kf3, ramp, sceneEnd, sceneStart, wordAt, V3, lerp3, smoother, clamp, lerp} from '../lib/time';
import {withDive} from '../lib/dive';
import {project, Cam} from '../lib/project';
import {lumenTox} from './Scene2';

// Scene 3 — ALIRAN DARAH: hero lolos lewat celah → masuk kapiler → sinyal radang menyebar ke seluruh tubuh.
const S = 3;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tInilah = wordAt(3, 'inilah');
const tEndo = wordAt(3, 'endotoksin');
const tLolos = wordAt(3, 'lolos');
const tMasuk = wordAt(3, 'masuk');
const tDarah = wordAt(3, 'darah');
const tMemicu = wordAt(3, 'memicu');
const tPeradangan = wordAt(3, 'peradangan');
const tSeluruh = wordAt(3, 'seluruh');
const tTubuh = wordAt(3, 'tubuh');
const tSwitch = tPeradangan + 0.2; // pindah skala (mikro → tubuh) lewat hero
const DV = 0.3;
const microHero = (t: number): V3 =>
  kf3(t, [[t0, [0, 0.34, 0.08]], [tInilah, [0, -0.15, 0.1]], [tEndo, [0, -0.9, 0.1]], [tLolos, [0.04, -1.55, 0.1]], [tMasuk, [0.15, CAP_Y + 0.22, 0.02]], [tDarah, [0.85, CAP_Y + 0.05, 0]], [tSwitch, [2.3, CAP_Y, 0]]]);
const at = (c: THREE.Curve<THREE.Vector3>, u: number): V3 => {
  const p = c.getPointAt(clamp(u));
  return [p.x, p.y, p.z + 0.1];
};
export const bodyHero3 = (t: number): V3 => at(IVC, ramp(t, tSwitch, t1));
const FOLLOW = [0.5, 0.95, 1.4].map((d) => d);

export const Scene3: React.FC<{t: number}> = ({t}) => {
  const micro = t < tSwitch;
  let cam: Cam;
  let flash = 0;
  let hero: V3;
  if (micro) {
    hero = microHero(t);
    const base = {
      pos: kf3(t, [[t0, [0.35, 0.65, 2.7]], [tEndo, [0.55, -0.45, 3.6]], [tMasuk, [0.6, -1.5, 3.8]], [tDarah, [1.3, -1.8, 3.4]], [tSwitch, [hero[0] + 0.4, hero[1] + 0.3, 2.4]]]),
      target: kf3(t, [[t0, [0, -0.1, 0]], [tEndo, [0, -0.85, 0]], [tMasuk, [0.15, -2.1, 0]], [tDarah, [0.85, -2.4, 0]], [tSwitch, hero]]),
      fov: 38,
    };
    const d = withDive(base, hero, t, t0, tSwitch, {r: 0.12});
    cam = d.cam;
    flash = d.flash;
  } else {
    hero = bodyHero3(t);
    const base = {
      pos: kf3(t, [[tSwitch, [hero[0] + 0.3, hero[1] + 0.1, hero[2] + 1.4]], [tSeluruh + 0.15, [0.2, 1.7, 9.0]], [tTubuh + 0.25, [0.1, 2.0, 12.5]], [t1, [0.35, 2.0, 4.0]]]),
      target: kf3(t, [[tSwitch, hero], [tSeluruh + 0.15, [0, 1.6, 0]], [tTubuh + 0.25, [0, 1.9, 0]], [t1, [HEART_POS[0], HEART_POS[1] - 0.15, 0.3]]]),
      fov: 38,
    };
    // keluar dari hero di skala tubuh
    const k = 1 - smoother((t - tSwitch) / DV);
    const near: V3 = [hero[0] + 0.05, hero[1] + 0.03, hero[2] + 0.18];
    cam = {pos: lerp3(base.pos, near, k), target: lerp3(base.target, hero, k), fov: lerp(base.fov, base.fov * 1.15, k)};
    flash = 0.6 * clamp(1 - (t - tSwitch) / (DV * 0.6));
    const out = withDive(cam, hero, t, tSwitch, t1, {inn: false, r: 0.05});
    cam = out.cam;
    flash = Math.max(flash, out.flash);
  }
  // pengikut: beberapa racun lain ikut lolos lewat celah yang sama
  const followers = FOLLOW.map((dl, i) => ({p: microHero(Math.max(t0, t - dl)), s: 0.065, r: [t + i, t, 0] as V3}));
  const inflame = ramp(t, tMemicu, tPeradangan);
  const capAnchor = project(cam, [0.15, CAP_Y + 0.3, 0.4]);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} flashColor="#FFC07A" seed={micro ? 13 : 23} dim={1}>
        {micro ? (
          <>
            <Epithelium t={t} gap={1} irr={1} />
            <ToxinField items={[...lumenTox(t), ...followers.filter((f) => f.p[1] < CELL_TOP + 0.3)]} />
            <InflameFlow curves={[CAPILLARY]} t={t} amount={inflame} count={26} size={0.07} speed={0.12} seed={2} zOff={0.1} />
          </>
        ) : (
          <BodyWorld t={t} beat={0} inflame={ramp(t, tSwitch, tTubuh)} dmg={{heart: 0, liver: 0, brain: 0}} gut={{residue: 1, bact: 1, tox: 1, slits: 1}} />
        )}
        <HeroToxin position={hero} t={t} size={micro ? 0.1 : 0.035} flare={micro ? inflame : 0.8} />
      </Stage>
      <Chip anchor={capAnchor} box={{x: W / 2, y: 640}} text="Endotoksin Masuk ke Darah" color={C.endotoxinGlow} active={ramp(t, tEndo, tEndo + 0.3)} appear={micro ? ramp(t, tEndo - 0.15, tEndo + 0.3) * (1 - ramp(t, tSwitch - 0.5, tSwitch - 0.25)) : 0} maxW={W * 0.9} />
    </>
  );
};
