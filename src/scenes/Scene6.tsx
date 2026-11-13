import React from 'react';
import {Stage} from '../three/Stage';
import {BodyWorld, toBody} from '../three/models/BodyWorld';
import {Cam} from '../lib/project';
import {kf3, kf1, ramp, sceneStart, wordAt, TOTAL_S, V3} from '../lib/time';
import {CAM5_END, beatAt} from './Scene5';

// Scene 6 — PEMULIHAN (payoff): rig yang sama naik terang & hangat; gelombang bilasan membersihkan
// rongga usus, celah menutup, darah merah terang, jantung/hati/otak menyala sehat.
const S = 6;
const t0 = sceneStart(S);
const tHidup = wordAt(6, 'hidup');
const tDiawali = wordAt(6, 'diawali');
const tUsus = wordAt(6, 'usus');
const tRawat = wordAt(6, 'rawat');
const tJangan = wordAt(6, 'jangan');
const GUT_C: V3 = toBody([0, 1.62, 0.46]);

export const Scene6: React.FC<{t: number}> = ({t}) => {
  const cam: Cam = {
    pos: kf3(t, [[t0, CAM5_END.pos], [tHidup + 0.35, [GUT_C[0] + 0.05, GUT_C[1] + 0.02, GUT_C[2] + 2.6]], [tUsus, [GUT_C[0] + 0.12, GUT_C[1] + 0.05, GUT_C[2] + 2.4]], [tRawat + 0.6, [0, 3.6, 21]], [TOTAL_S, [0, 3.8, 22.5]]]),
    target: kf3(t, [[t0, CAM5_END.target], [tHidup + 0.35, [GUT_C[0], GUT_C[1] + 0.3, GUT_C[2]]], [tUsus, [GUT_C[0] + 0.05, GUT_C[1] + 0.3, GUT_C[2]]], [tRawat + 0.6, [0, 3.55, 0]], [TOTAL_S, [0, 3.75, 0]]]),
    fov: 38,
  };
  const mood = ramp(t, t0 + 0.05, tHidup + 0.9);
  const rinse = kf1(t, [[tHidup - 0.1, -0.12], [tUsus, 1.12]]);
  const heal = ramp(t, tDiawali, tUsus + 0.35);
  const health = ramp(t, tDiawali, tRawat + 0.4);
  const clear = 1 - ramp(t, tHidup, tUsus);
  const fix = 1 - ramp(t, tUsus, tJangan);
  return (
    <Stage cam={cam} t={t} seed={16} dim={1 - mood} warm={mood}>
      <BodyWorld
        t={t}
        beat={beatAt(t, 0.95) * (0.6 + 0.4 * mood)}
        inflame={clear}
        dmg={{heart: fix, liver: fix, brain: fix}}
        health={health}
        artBright={ramp(t, tUsus - 0.2, tRawat + 0.2)}
        gut={{residue: 1, bact: 1, tox: 1, rinse, slits: 1, heal}}
      />
    </Stage>
  );
};
