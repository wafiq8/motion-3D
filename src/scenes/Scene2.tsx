import React from 'react';
import {Stage} from '../three/Stage';
import {Epithelium, CELL_TOP} from '../three/models/Epithelium';
import {HeroToxin, ToxinField} from '../three/models/Toxin';
import {Chip} from '../overlay/Chip';
import {C, W} from '../lib/style';
import {kf3, ramp, sceneEnd, sceneStart, wordAt, V3, seeded} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';
import {InstItem} from '../three/Inst';

// Scene 2 — DINDING USUS: iritasi terus-menerus → sel merenggang, tight junction putus, celah bocor.
const S = 2;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tMembuat = wordAt(2, 'membuat');
const tMerenggang = wordAt(2, 'merenggang');
const tBocor = wordAt(2, 'bocor');
const tLeaky = wordAt(2, 'leaky');
const r = seeded(501);
export const LUMEN_TOX = Array.from({length: 34}, () => ({x: (r() - 0.5) * 7.5, y: 0.75 + r() * 2.6, z: -0.9 + r() * 1.6, ph: r() * 6.28, sp: 0.2 + r() * 0.3}));
export const lumenTox = (t: number, k = 1): InstItem[] =>
  LUMEN_TOX.map((d, i) => {
    // menumbuk dinding: bergoyang turun-naik di atas apeks sel
    const y = Math.max(CELL_TOP + 0.18, d.y - 0.35 * Math.abs(Math.sin(t * d.sp * 2 + d.ph)) - 0.15 * t * d.sp * 0.1);
    return {p: [d.x + 0.25 * Math.sin(t * d.sp + d.ph), y, d.z] as V3, s: 0.075 * k, r: [t * 0.7 + i, t * 0.5, i]};
  });
export const gapOf = (t: number) => ramp(t, tMerenggang - 0.1, tBocor + 0.25);
export const heroPath2 = (t: number): V3 => kf3(t, [[t0, [1.1, 1.55, 0.5]], [tMembuat, [0.7, 1.05, 0.35]], [tMerenggang, [0.2, 0.75, 0.2]], [tBocor, [0.0, 0.48, 0.12]], [t1, [0.0, 0.34, 0.08]]]);

export const Scene2: React.FC<{t: number}> = ({t}) => {
  const hero = heroPath2(t);
  const base = {
    pos: kf3(t, [[t0, [hero[0] + 0.2, hero[1] + 0.3, hero[2] + 1.6]], [t0 + 1.1, [0.4, 0.8, 8.4]], [tMerenggang - 0.2, [0.25, 0.6, 7.2]], [tBocor + 0.3, [0.15, 0.6, 5.2]], [tLeaky, [0.1, 0.55, 4.4]], [t1, [0.06, 0.55, 3.6]]]),
    target: kf3(t, [[t0, hero], [t0 + 1.1, [0, -0.55, 0]], [tMerenggang - 0.2, [0, -0.4, 0]], [tBocor + 0.3, [0, -0.1, 0]], [tLeaky, [0, 0.05, 0]], [t1, hero]]),
    fov: 38,
  };
  const {cam, flash} = withDive(base, hero, t, t0, t1, {r: 0.12});
  const gap = gapOf(t);
  const irr = ramp(t, t0 + 0.2, tMembuat + 0.4);
  const anchor = project(cam, [0, CELL_TOP - 0.35, 0.35]);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} flashColor="#CFE3A0" seed={12} dim={1}>
        <Epithelium t={t} gap={gap} irr={irr} />
        <ToxinField items={lumenTox(t)} />
        <HeroToxin position={hero} t={t} size={0.1} flare={0.25 * irr} />
      </Stage>
      <Chip anchor={anchor} box={{x: W / 2, y: 1180}} text="Leaky Gut (Usus Bocor)" color={C.endotoxinGlow} active={ramp(t, tBocor, tBocor + 0.3)} appear={ramp(t, tBocor - 0.1, tBocor + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} />
    </>
  );
};
