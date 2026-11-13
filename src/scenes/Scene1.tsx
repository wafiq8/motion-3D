import React from 'react';
import {Stage} from '../three/Stage';
import {Gut, lumenPt, transR, RESIDUE} from '../three/models/Gut';
import {HeroToxin} from '../three/models/Toxin';
import {Chip} from '../overlay/Chip';
import {C, W} from '../lib/style';
import {kf3, kf1, ramp, sceneEnd, sceneStart, wordAt, V3} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

// Scene 1 — USUS: organ hero utuh (hook) → masuk rongga kolon: sisa menumpuk, bakteri jahat, racun.
const S = 1;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tUsus = wordAt(1, 'usus', 1);
const tSisa = wordAt(1, 'sisa');
const tMenumpuk = wordAt(1, 'menumpuk');
const tBakteri = wordAt(1, 'bakteri');
const tMenghasilkan = wordAt(1, 'menghasilkan');
const tRacun = wordAt(1, 'racun');
export const HERO_U = 0.56;
export const heroPath1 = (t: number): V3 =>
  kf3(t, [
    [tMenghasilkan, lumenPt(HERO_U, 4.35, transR(HERO_U) * 0.82)],
    [tRacun + 0.4, lumenPt(HERO_U + 0.01, 4.2, transR(HERO_U) * 0.55)],
    [t1, lumenPt(HERO_U + 0.02, 4.55, transR(HERO_U) * 0.72)],
  ]);

export const Scene1: React.FC<{t: number}> = ({t}) => {
  const hero = heroPath1(t);
  const a = kf1(t, [[t0, -0.2], [tUsus, -0.06]]);
  const base = {
    pos: kf3(t, [
      [t0, [Math.sin(a) * 17.5, -0.4, Math.cos(a) * 17.5]],
      [tUsus, [Math.sin(-0.06) * 15.5, -0.1, Math.cos(-0.06) * 15.5]],
      [tSisa + 0.5, [0.3, 2.5, 5.0]],
      [tMenumpuk + 0.3, [-0.3, 2.35, 3.2]],
      [tBakteri + 0.2, [0.25, 2.25, 2.8]],
      [tRacun + 0.3, [hero[0] + 0.2, hero[1] + 0.45, hero[2] + 1.75]],
      [t1, [hero[0] + 0.15, hero[1] + 0.35, hero[2] + 1.3]],
    ]),
    target: kf3(t, [
      [t0, [0, -0.75, 0]],
      [tUsus, [0, -0.6, 0]],
      [tSisa + 0.5, [0, 1.45, 0.3]],
      [tMenumpuk + 0.3, [-0.1, 1.42, 0.35]],
      [tBakteri + 0.2, [0.15, 1.45, 0.3]],
      [tRacun + 0.3, hero],
      [t1, hero],
    ]),
    fov: 40,
  };
  const {cam, flash} = withDive(base, hero, t, t0, t1, {inn: false, r: 0.08});
  const residue = 0.3 + 0.7 * ramp(t, tSisa, tMenumpuk + 0.5);
  const bact = ramp(t, tBakteri - 0.15, tBakteri + 0.45);
  const tox = ramp(t, tMenghasilkan, tRacun + 0.2);
  const heroK = ramp(t, tMenghasilkan, tRacun);
  const lump = RESIDUE[11];
  const anchor = project(cam, lumenPt(lump.u, lump.th, transR(lump.u) * 0.7));
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} flashColor="#CFE3A0" seed={11} dim={1}>
        <Gut t={t} residue={residue} bact={bact} tox={tox} />
        {heroK > 0.01 && <HeroToxin position={hero} t={t} size={0.06 * heroK} halo={heroK} />}
      </Stage>
      <Chip anchor={anchor} box={{x: W / 2, y: 1150}} text="Penumpukan Sisa & Racun Usus" color={C.endotoxinGlow} active={ramp(t, tMenumpuk, tMenumpuk + 0.3)} appear={ramp(t, tMenumpuk - 0.15, tMenumpuk + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} maxW={W * 0.9} />
    </>
  );
};
