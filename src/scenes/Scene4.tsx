import React from 'react';
import {Stage} from '../three/Stage';
import {Artery, PLQ, wallLine} from '../three/models/Artery';
import {HeroToxin, InflameFlow} from '../three/models/Toxin';
import {Chip} from '../overlay/Chip';
import {C, W} from '../lib/style';
import {kf3, ramp, sceneEnd, sceneStart, wordAt, V3} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

// Scene 4 — PEMBULUH DARAH: kilatan radang melukai dinding → kolesterol menempel → plak penyumbat.
const S = 4;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tMelukai = wordAt(4, 'melukai');
const tKolesterol = wordAt(4, 'kolesterol');
const tMenempel = wordAt(4, 'menempel');
const tMenumpuk = wordAt(4, 'menumpuk');
const tPlak = wordAt(4, 'plak');
const tPenyumbat = wordAt(4, 'penyumbat');
const WALLS = [0, -0.7, 0.55, Math.PI].map((th) => wallLine(th));
export const heroPath4 = (t: number): V3 => kf3(t, [[t0, [-3.6, 0.15, 0.35]], [tMelukai, [-1.7, -0.35, 0.25]], [tKolesterol, [-0.7, 0.05, 0.15]], [tMenumpuk, [0.3, 0.4, 0.05]], [t1, [2.6, 0.35, 0.1]]]);

export const Scene4: React.FC<{t: number}> = ({t}) => {
  const hero = heroPath4(t);
  const base = {
    pos: kf3(t, [[t0, [hero[0] + 0.2, hero[1] + 0.25, hero[2] + 1.4]], [t0 + 0.9, [-1.6, 1.2, 7.6]], [tMelukai + 0.5, [-0.5, 1.0, 7.0]], [tKolesterol, [0.2, 0.9, 6.6]], [tPlak, [0.8, 0.7, 6.0]], [tPenyumbat + 0.3, [1.5, 0.7, 5.4]], [t1, [hero[0] + 0.3, hero[1] + 0.3, 2.0]]]),
    target: kf3(t, [[t0, hero], [t0 + 0.9, [-0.9, -0.35, 0]], [tMelukai + 0.5, [0.0, -0.75, 0]], [tKolesterol, [0.4, -0.55, 0]], [tPlak, [0.7, -0.65, 0]], [tPenyumbat + 0.3, [1.3, -0.25, 0]], [t1, hero]]),
    fov: 40,
  };
  const {cam, flash} = withDive(base, hero, t, t0, t1, {r: 0.12});
  const lesion = ramp(t, tMelukai, tMelukai + 0.9);
  const ldl = ramp(t, tKolesterol - 0.2, tKolesterol + 0.4);
  const stick = ramp(t, tMenempel - 0.1, tMenumpuk + 0.4);
  const plaque = 0.1 * ramp(t, tMelukai + 0.4, tKolesterol) + 0.9 * ramp(t, tMenempel + 0.2, tPenyumbat + 0.3);
  const anchor = project(cam, [PLQ[0], PLQ[1] + 0.25 + 0.8 * plaque, 0.45]);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} flashColor="#FFC07A" seed={14} dim={1}>
        <Artery t={t} lesion={lesion} ldl={ldl} stick={stick} plaque={plaque} />
        <InflameFlow curves={WALLS} t={t} amount={0.6 + 0.4 * ramp(t, tMelukai - 0.3, tMelukai + 0.2)} count={36} size={0.07} speed={0.06} seed={4} zOff={0} />
        <HeroToxin position={hero} t={t} size={0.1} flare={1} />
      </Stage>
      <Chip
        anchor={anchor}
        box={{x: W / 2, y: 560}}
        text="Inflamasi & Plak Pembuluh Darah"
        color={C.inflame}
        active={ramp(t, tMelukai, tMelukai + 0.3)}
        appear={ramp(t, tMelukai - 0.15, tMelukai + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))}
        maxW={W * 0.9}
        subPrefix="• "
        subs={[
          {text: 'dinding pembuluh terluka', k: ramp(t, tMelukai + 0.2, tMelukai + 0.5)},
          {text: 'kolesterol menempel', k: ramp(t, tMenempel, tMenempel + 0.3)},
          {text: 'menumpuk jadi plak', k: ramp(t, tPlak, tPlak + 0.3)},
        ]}
      />
    </>
  );
};
