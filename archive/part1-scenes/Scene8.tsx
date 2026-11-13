import React from 'react';
import * as THREE from 'three';
import {Stage} from '../three/Stage';
import {Body, IVC, PULM_A, PULM_V, AORTA, CAROTID_R, HEART_POS, BRAIN_POS} from '../three/models/Body';
import {Packet} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, ramp, sceneStart, wordAt, V3, clamp, TOTAL_S} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

const S = 8;
const t0 = sceneStart(S);
const tJantung = wordAt(8, 'jantung');
const tMemompa = wordAt(8, 'memompa');
const tNutrisi = wordAt(8, 'nutrisi');
const tTubuh = wordAt(8, 'tubuh');
const tOtak = wordAt(8, 'otak');
const tOtot = wordAt(8, 'otot');
const tSetiap = wordAt(8, 'setiap');
const at = (c: THREE.Curve<THREE.Vector3>, u: number): V3 => {
  const p = c.getPointAt(clamp(u));
  return [p.x, p.y, p.z + 0.08];
};
const aortaToArch = 0.3;
export const packet8 = (t: number): V3 => {
  if (t < tMemompa) return at(IVC, ramp(t, t0, tMemompa));
  if (t < tMemompa + 0.6) return at(PULM_A, ramp(t, tMemompa, tMemompa + 0.6));
  if (t < tNutrisi + 0.2) return at(PULM_V, ramp(t, tMemompa + 0.6, tNutrisi + 0.2));
  if (t < tTubuh) return at(AORTA, ramp(t, tNutrisi + 0.2, tTubuh) * aortaToArch);
  return at(CAROTID_R, ramp(t, tTubuh, tOtak + 0.1));
};

export const Scene8: React.FC<{t: number}> = ({t}) => {
  const pk = packet8(t);
  const beatPh = ((t - t0) % 0.82) / 0.82;
  const beat = Math.exp(-((beatPh - 0.1) ** 2) / 0.004) + 0.5 * Math.exp(-((beatPh - 0.3) ** 2) / 0.004);
  const base = {
    pos: kf3(t, [[t0, [1.3, 1.2, 1.9]], [tJantung, [0.45, 2.15, 3.0]], [tMemompa, [0.35, 2.35, 3.4]], [tNutrisi, [0.2, 2.6, 3.6]], [tTubuh, [0.1, 2.2, 9.5]], [tOtak, [0, 0.5, 20.5]], [tOtot, [0, 0.3, 22.0]], [55.3, [0, 0.3, 23.0]], [56.4, [0, 2.6, 31.5]], [TOTAL_S, [0, 2.6, 32.5]]]),
    target: kf3(t, [[t0, [0.45, 1.3, 0.15]], [tJantung, HEART_POS], [tMemompa, [-0.15, 2.45, 0.3]], [tNutrisi, [-0.1, 2.6, 0.3]], [tTubuh, [0, 2.4, 0]], [tOtak, [0, 0.4, 0]], [55.3, [0, 0.2, 0]], [56.4, [0, 2.5, 0]], [TOTAL_S, [0, 2.5, 0]]]),
    fov: 36,
  };
  const {cam, flash} = withDive(base, pk, t, t0, TOTAL_S, {out: false, r: 0.12});
  const net = ramp(t, tNutrisi, tTubuh + 0.4);
  const heartChip = project(cam, [HEART_POS[0] + 0.25, HEART_POS[1] - 0.1, 0.5]);
  const lung = project(cam, [-0.8, 2.6, 0.3]);
  const arch = project(cam, [-0.15, 3.15, 0.2]);
  const closing = ramp(t, 55.6, 55.9);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={8}>
        <Body t={t} beat={beat} net={net} brain={ramp(t, tOtak - 0.1, tOtak + 0.3)} muscle={ramp(t, tOtot - 0.1, tOtot + 0.3)} cells={ramp(t, tSetiap - 0.2, tSetiap + 0.4)} bodyOpacity={ramp(t, tNutrisi - 0.4, tTubuh)} />
        <Packet position={t > tOtak + 0.1 ? BRAIN_POS : pk} t={t} size={0.11 + 0.1 * ramp(t, tTubuh, tOtak)} gold={1} split={0.5} />
      </Stage>
      <Chip anchor={heartChip} box={{x: 720, y: 1180}} text="Jantung" sub={t > tMemompa ? 'lewat paru-paru dulu: ambil oksigen' : undefined} color={C.bloodRed} active={ramp(t, tJantung, tJantung + 0.3)} appear={ramp(t, tJantung - 0.15, tJantung + 0.25) * (1 - ramp(t, tTubuh - 0.5, tTubuh - 0.2))} />
      {t > tMemompa && t < tNutrisi + 0.4 && lung.x > 0 && null}
      <Chip anchor={arch} box={{x: 540, y: 520}} text="Distribusi Sistemik" sub="arteri membawa nutrisi ke seluruh sel" color={C.bloodRed} active={1} appear={ramp(t, tTubuh - 0.1, tTubuh + 0.3) * (1 - closing)} maxW={1080 * 0.88} />
    </>
  );
};
