import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage} from '../three/Stage';
import {Liver, PORTAL, THROUGH, HEPATIC, STORE, FILTER} from '../three/models/Liver';
import {Packet, Molecule} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, ramp, sceneEnd, sceneStart, wordAt, V3, lerp3, clamp, seeded} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

const S = 7;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tHati = wordAt(7, 'hati');
const tRacun = wordAt(7, 'racun');
const tKadar = wordAt(7, 'kadar');
const tSebagian = wordAt(7, 'sebagian');
const tCadangan = wordAt(7, 'cadangan');
const at = (c: THREE.Curve<THREE.Vector3>, u: number): V3 => {
  const p = c.getPointAt(clamp(u));
  return [p.x, p.y, p.z];
};
// jalur gabungan: vena porta → menembus hati → vena hepatika
const path = (u: number): V3 => (u < 0.4 ? at(PORTAL, u / 0.4) : u < 0.7 ? at(THROUGH, (u - 0.4) / 0.3) : at(HEPATIC, (u - 0.7) / 0.3));
const r = seeded(77);
const stream = Array.from({length: 22}, (_, i) => ({o: r(), kind: (['glukosa', 'amino', 'glukosa'] as const)[i % 3], store: i % 4 === 0, jx: (r() - 0.5) * 0.3, jz: (r() - 0.5) * 0.3}));
const toxins = Array.from({length: 7}, () => ({o: r(), jx: (r() - 0.5) * 0.3}));

export const Scene7: React.FC<{t: number}> = ({t}) => {
  const pu = kf3(t, [[t0, [0.02, 0, 0]], [tHati, [0.42, 0, 0]], [tSebagian, [0.62, 0, 0]], [t1, [0.86, 0, 0]]])[0];
  const pk = path(pu);
  const pkz: V3 = [pk[0], pk[1], pk[2] + 0.15];
  const base = {
    pos: kf3(t, [[t0, [pk[0] + 0.6, pk[1] - 0.3, pk[2] + 3.5]], [t0 + 1.3, [-0.2, -1.6, 16.5]], [tRacun, [-0.4, -1.2, 15.0]], [tSebagian, [-0.7, -1.0, 13.5]], [t1 - 0.5, [-0.4, -0.6, 13.5]], [t1, [0.9, pk[1] - 0.2, pk[2] + 5.0]]]),
    target: kf3(t, [[t0, pk], [t0 + 1.3, [-0.2, -1.2, 0]], [tRacun, [-0.4, -0.8, 0]], [tSebagian, [-0.7, -0.6, 0]], [t1 - 0.5, [-0.3, -0.3, 0]], [t1, [pk[0], pk[1] + 0.6, pk[2]]]]),
    fov: 38,
  };
  const {cam, flash} = withDive(base, pkz, t, t0, t1, {r: 0.42});
  const filt = ramp(t, tRacun - 0.15, tRacun + 0.4) * (1 - ramp(t, tSebagian, tSebagian + 0.5));
  const store = ramp(t, tSebagian, tCadangan + 0.3);
  const toxMat = useMemo(() => new THREE.MeshStandardMaterial({color: C.toxin, roughness: 0.6}), []);
  const flow = (o: number) => (o + (t - t0) * 0.16) % 1;
  const liverChip = project(cam, [-1.9, 0.9, 0.6]);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={7}>
        <Liver opacity={0.8} glowFilter={filt} glowStore={store} />
        {stream.map((s, i) => {
          let u = flow(s.o);
          let p = path(u);
          // sebagian glukosa ditahan sebagai cadangan
          if (s.store && t > tSebagian - 0.2 && u > 0.45) {
            const k = ramp(t, tSebagian - 0.2 + s.o * 0.5, tSebagian + 0.8 + s.o * 0.5);
            const slot: V3 = [STORE[0] + Math.cos(i * 1.7) * 0.22, STORE[1] + Math.sin(i * 2.3) * 0.2, STORE[2] + Math.sin(i) * 0.15];
            p = lerp3(path(0.5), slot, k);
            u = 0.5;
          }
          return <Molecule key={i} kind={s.kind} position={[p[0] + s.jx, p[1], p[2] + 0.3 + s.jz]} size={0.085} rot={t + i} />;
        })}
        {toxins.map((x, i) => {
          const u = flow(x.o);
          const p = path(Math.min(u, 0.52));
          const caught = u > 0.45 && t > tRacun - 0.2;
          const k = caught ? clamp((u - 0.45) / 0.07) : 0;
          const q = caught ? lerp3(p, FILTER, k) : p;
          return <mesh key={i} material={toxMat} position={[q[0] + x.jx, q[1], q[2] + 0.35]} scale={0.1 * (1 - k * 0.85)}><icosahedronGeometry args={[1, 0]} /></mesh>;
        })}
        <Packet position={pkz} t={t} size={0.42} gold={1} split={0.6} />
      </Stage>
      <Chip
        anchor={liverChip}
        box={{x: 330, y: 560}}
        text="Hati"
        color={C.accent}
        active={ramp(t, tHati - 0.1, tHati + 0.3)}
        appear={ramp(t, tHati - 0.2, tHati + 0.25) * (1 - ramp(t, t1 - 0.55, t1 - 0.3))}
        subs={[
          {text: 'racun disaring', k: ramp(t, tRacun - 0.05, tRacun + 0.25)},
          {text: 'kadar gula diatur', k: ramp(t, tKadar - 0.05, tKadar + 0.25)},
          {text: 'sebagian glukosa → cadangan', k: ramp(t, tSebagian - 0.05, tSebagian + 0.25)},
        ]}
      />
    </>
  );
};
