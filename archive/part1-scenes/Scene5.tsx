import React from 'react';
import {Stage} from '../three/Stage';
import {VilliField, heroTop, HERO_VILLUS} from '../three/models/Villi';
import {Packet, Molecule, MolKind} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, ramp, sceneEnd, sceneStart, wordAt, V3, seeded, lerp3, clamp} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

const S = 5;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tVili = wordAt(5, 'vili');
const tPerluas = wordAt(5, 'memperluas');
const tMenembus = wordAt(5, 'menembus');
const r = seeded(57);
const rain = Array.from({length: 36}, (_, i) => ({x: (r() - 0.5) * 6, z: -3 + r() * 5, d: r() * 4, kind: (['glukosa', 'amino', 'lemak'] as MolKind[])[i % 3]}));

export const Scene5: React.FC<{t: number}> = ({t}) => {
  const top = heroTop();
  const entry: V3 = [top[0] + 0.32, top[1] - 0.35, top[2] + 0.12];
  const pk = kf3(t, [[t0, [0.6, 4.5, 2.6]], [tVili, [0.7, 2.9, 1.4]], [tPerluas, [top[0] + 0.55, top[1] + 0.25, top[2] + 0.45]], [tMenembus, [top[0] + 0.4, top[1] - 0.2, top[2] + 0.25]], [t1, entry]]);
  const base = {
    pos: kf3(t, [[t0, [0.8, 5.2, 4.5]], [t0 + 1.4, [0.5, 6.5, 8.5]], [tVili, [0.6, 3.6, 4.6]], [tPerluas, [top[0] + 0.9, top[1] + 0.7, top[2] + 2.0]], [t1, [top[0] + 0.9, top[1] + 0.9, top[2] + 1.7]]]),
    target: kf3(t, [[t0, [0.6, 4.3, 2.4]], [t0 + 1.4, [0.3, 0.6, -0.8]], [tVili, [0.4, 1.4, 0.3]], [tPerluas, [top[0], top[1] - 0.25, top[2]]], [t1, [entry[0] - 0.1, entry[1], entry[2]]]]),
    fov: 38,
  };
  const {cam, flash} = withDive(base, pk, t, t0, t1, {r: 0.34});
  const micro = ramp(t, tVili + 0.3, tPerluas + 0.4);
  const hp = project(cam, [HERO_VILLUS.x - HERO_VILLUS.r, top[1] - 0.7, HERO_VILLUS.z]);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={5}>
        <VilliField t={t} heroGlow={ramp(t, tVili, tVili + 0.4)} micro={micro} />
        {rain.map((d, i) => {
          // molekul turun ke karpet vili lalu terserap (memudar ke permukaan)
          const k = clamp((t - t0 - d.d * 0.6) / 3.2);
          if (k <= 0 || k >= 1) return null;
          const p = lerp3([d.x, 4.0, d.z], [d.x * 0.9, 1.3, d.z], k);
          return <Molecule key={i} kind={d.kind} position={p} size={0.07} rot={t + i} opacity={1 - ramp(k, 0.75, 1)} />;
        })}
        <Packet position={pk} t={t} size={0.34} gold={1} split={1} />
      </Stage>
      <Chip anchor={hp} box={{x: 360, y: 1150}} text="Vili & Mikrovili" sub={micro > 0.5 ? 'area penyerapan berlipat ganda' : undefined} color={C.accent} active={ramp(t, tVili, tVili + 0.3)} appear={ramp(t, tVili - 0.15, tVili + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} />
    </>
  );
};
