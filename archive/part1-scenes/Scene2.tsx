import React from 'react';
import {Stage} from '../three/Stage';
import {Esophagus, ESO2} from '../three/models/Esophagus';
import {Stomach} from '../three/models/Stomach';
import {Packet} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, kf1, ramp, sceneEnd, sceneStart, wordAt, V3} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

const S = 2;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tPeri = wordAt(2, 'peristaltik');
const tMeremas = wordAt(2, 'meremas');
const pt = (u: number): V3 => {
  const p = ESO2.getPointAt(u);
  return [p.x, p.y, p.z];
};
export const ub2 = (t: number) => kf1(t, [[t0, 0.04], [tPeri, 0.3], [t1, 0.97]]);

export const Scene2: React.FC<{t: number}> = ({t}) => {
  const ub = ub2(t);
  const pk = pt(ub);
  const squeeze = ramp(t, t0 + 0.6, tPeri);
  const base = {
    pos: kf3(t, [[t0, [pk[0] + 1.2, pk[1] + 0.2, 5]], [t0 + 1.2, [2.6, 0.2, 14.5]], [tPeri, [2.2, pk[1] - 0.6, 9.5]], [tMeremas, [1.6, pk[1], 6.4]], [t1, [1.8, pt(0.97)[1] - 0.2, 6.6]]]),
    target: kf3(t, [[t0, pk], [t0 + 1.2, [0, -1.8, 0]], [tPeri, [0, pk[1] - 0.9, 0]], [tMeremas, [pk[0], pk[1] - 0.7, 0]], [t1, [0.8, pt(0.97)[1] - 1.0, 0]]]),
    fov: 36,
  };
  // kamera mengikuti bolus setelah peristaltik disebut
  if (t > tMeremas) {
    base.pos = [base.pos[0], pk[1] + 0.4, base.pos[2]];
    base.target = [pk[0] * 0.5, pk[1] - 0.8, 0];
  }
  const {cam, flash} = withDive(base, pk, t, t0, t1, {r: 0.62});
  const ring = pt(Math.max(0, ub - 0.085));
  const a = project(cam, [ring[0] + 0.45, ring[1], 0.2]);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={2}>
        <Esophagus ub={ub} squeeze={squeeze} />
        <group position={[1.6, -7.9, -0.3]} scale={1.15}>
          <Stomach t={t} churn={0} cut={0} />
        </group>
        <Packet position={pk} t={t} size={0.62} gold={1} lumpy={0.25} />
      </Stage>
      <Chip anchor={a} box={{x: 760, y: 1130}} text="Gerak Peristaltik" sub="otot meremas bergelombang" color={C.accent} active={ramp(t, tPeri, tPeri + 0.3)} appear={ramp(t, tPeri - 0.15, tPeri + 0.25) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} />
    </>
  );
};
