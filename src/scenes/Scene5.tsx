import React from 'react';
import {Stage} from '../three/Stage';
import {BodyWorld, HEART_POS, BRAIN_POS, LIVER_POS, ORGANS} from '../three/models/BodyWorld';
import {HeroToxin} from '../three/models/Toxin';
import {Chip} from '../overlay/Chip';
import {C, W} from '../lib/style';
import {kf3, ramp, sceneEnd, sceneStart, wordAt, V3} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

// Scene 5 — ORGAN VITAL: darah penuh radang singgah di jantung → hati → otak; sel-sel rusak.
const S = 5;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tJantung = wordAt(5, 'jantung');
const tHati = wordAt(5, 'hati');
const tOtak = wordAt(5, 'otak');
const tSel = wordAt(5, 'sel-sel');
const tRusak = wordAt(5, 'rusak');
const tPenyakit = wordAt(5, 'penyakit');
const off = (p: V3, d: V3): V3 => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
export const heroPath5 = (t: number): V3 => kf3(t, [[t0, off(HEART_POS, [0.15, 0.05, 0.42])], [tJantung, off(HEART_POS, [-0.1, -0.05, 0.45])], [tHati, off(LIVER_POS, [0.15, 0.05, 0.38])], [tOtak, off(BRAIN_POS, [0.12, -0.05, 0.45])], [t1, off(BRAIN_POS, [0.0, 0.1, 0.5])]]);
export const beatAt = (t: number, period = 0.85) => {
  const ph = (t % period) / period;
  return Math.exp(-((ph - 0.1) ** 2) / 0.004) + 0.5 * Math.exp(-((ph - 0.3) ** 2) / 0.004);
};
export const dmg5 = (t: number) => ({
  heart: 0.3 * ramp(t, tJantung, tJantung + 0.5) + 0.7 * ramp(t, tSel, tRusak + 0.4),
  liver: 0.3 * ramp(t, tHati, tHati + 0.5) + 0.7 * ramp(t, tSel + 0.2, tRusak + 0.6),
  brain: 0.3 * ramp(t, tOtak, tOtak + 0.5) + 0.7 * ramp(t, tSel + 0.4, tRusak + 0.8),
});
export const CAM5_END = {pos: [0, 2.4, 12.5] as V3, target: [0, 2.3, 0] as V3};

export const Scene5: React.FC<{t: number}> = ({t}) => {
  const hero = heroPath5(t);
  const base = {
    pos: kf3(t, [[t0, off(HEART_POS, [0.7, 0.3, 3.4])], [tJantung, off(HEART_POS, [0.35, 0.1, 2.8])], [tHati, off(LIVER_POS, [0.1, 0.1, 2.8])], [tOtak, off(BRAIN_POS, [0.1, -0.05, 2.6])], [tSel + 0.3, off(BRAIN_POS, [0.0, -0.3, 3.2])], [tRusak + 0.5, [0, 2.9, 8.0]], [t1, CAM5_END.pos]]),
    target: kf3(t, [[t0, HEART_POS], [tJantung, HEART_POS], [tHati, ORGANS.liver.c], [tOtak, BRAIN_POS], [tSel + 0.3, off(BRAIN_POS, [0, -0.15, 0])], [tRusak + 0.5, [0, 2.9, 0]], [t1, CAM5_END.target]]),
    fov: 38,
  };
  const {cam, flash} = withDive(base, hero, t, t0, t1, {out: false, r: 0.05});
  const dmg = dmg5(t);
  const chipA = (tt: number, tn: number) => ramp(t, tt - 0.12, tt + 0.25) * (1 - ramp(t, tn - 0.2, tn + 0.05));
  const h = project(cam, off(HEART_POS, [0.3, -0.1, 0.3]));
  const l = project(cam, off(ORGANS.liver.c, [-0.35, 0.0, 0.2]));
  const b = project(cam, off(BRAIN_POS, [0.3, 0.1, 0.3]));
  const main = project(cam, off(BRAIN_POS, [0, 0.2, 0.3]));
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} flashColor="#FFC07A" seed={15} dim={1}>
        <BodyWorld t={t} beat={beatAt(t)} inflame={1} dmg={dmg} gut={{residue: 1, bact: 1, tox: 1, slits: 1}} />
        <HeroToxin position={hero} t={t} size={0.035} flare={1} />
      </Stage>
      <Chip anchor={h} box={{x: 700, y: 1180}} text="Jantung" color={C.inflame} active={1} appear={chipA(tJantung, tHati)} />
      <Chip anchor={l} box={{x: 380, y: 1180}} text="Hati" color={C.inflame} active={1} appear={chipA(tHati, tOtak)} />
      <Chip anchor={b} box={{x: 700, y: 1180}} text="Otak" color={C.inflame} active={1} appear={chipA(tOtak, tRusak - 0.2)} />
      <Chip anchor={main} box={{x: W / 2, y: 520}} text="Sel Rusak & Picu Penyakit" color={C.inflame} active={ramp(t, tRusak, tRusak + 0.3)} appear={ramp(t, tRusak - 0.1, tRusak + 0.3) * (1 - ramp(t, t1 - 0.5, t1 - 0.2))} maxW={W * 0.9} sub={t > tPenyakit - 0.1 ? 'jantung · hati · otak' : undefined} />
    </>
  );
};
