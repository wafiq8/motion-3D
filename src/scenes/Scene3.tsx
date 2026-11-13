import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage} from '../three/Stage';
import {Stomach, STOMACH} from '../three/models/Stomach';
import {Packet} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, kf1, ramp, sceneEnd, sceneStart, wordAt, V3, seeded} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

const S = 3;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tAsam = wordAt(3, 'asam');
const tPepsin = wordAt(3, 'pepsin');
const tAduk = wordAt(3, 'mengaduk');
const tKimus = wordAt(3, 'kimus');
const tProtein = wordAt(3, 'protein');
const r = seeded(33);
const drops = Array.from({length: 26}, () => ({u: 0.15 + r() * 0.6, a: r() * 6.28, rr: 0.4 + r() * 0.6, sp: 0.4 + r() * 0.8}));
const chyme = Array.from({length: 40}, () => ({a: r() * 6.28, b: r() * 6.28, rr: 0.3 + r() * 0.55, sp: 0.6 + r()}));
const sp = (u: number): V3 => {
  const p = STOMACH.getPointAt(u);
  return [p.x, p.y, p.z];
};
export const u3 = (t: number) => kf1(t, [[t0, 0.02], [t0 + 1.5, 0.3], [tKimus, 0.5], [t1 - 0.6, 0.72], [t1, 1.0]]);

export const Scene3: React.FC<{t: number}> = ({t}) => {
  const u = u3(t);
  const swirl = ramp(t, tAduk - 0.3, tAduk + 0.3);
  const c = sp(u);
  const pk: V3 = [c[0] + swirl * 0.25 * Math.sin(t * 3.2), c[1] + swirl * 0.2 * Math.cos(t * 2.7), c[2] + 0.1];
  const kimus = ramp(t, tAduk, tKimus + 0.3);
  const base = {
    pos: kf3(t, [[t0, [c[0] + 0.5, c[1] + 0.6, 5.5]], [t0 + 1.2, [0.7, 0.2, 11.8]], [tAduk, [0.6, -0.2, 9.4]], [tProtein, [1.0, -0.5, 8.0]], [t1, [2.3, -0.5, 6.0]]]),
    target: kf3(t, [[t0, c], [t0 + 1.2, [0.7, 0.0, 0]], [tAduk, [0.5, -0.4, 0]], [tProtein, [1.1, -0.6, 0]], [t1, [2.6, 0.1, 0]]]),
    fov: 36,
  };
  const {cam, flash} = withDive(base, pk, t, t0, t1);
  const acid = ramp(t, tAsam - 0.2, tAsam + 0.6);
  const pep = ramp(t, tPepsin - 0.1, tPepsin + 0.4);
  const m = useMemo(
    () => ({
      acid: new THREE.MeshStandardMaterial({color: C.acid, emissive: C.acid, emissiveIntensity: 0.5, roughness: 0.15, transparent: true, opacity: 0.85}),
      pep: new THREE.MeshStandardMaterial({color: C.enzyme, emissive: C.enzyme, emissiveIntensity: 1.2}),
      chyme: new THREE.MeshStandardMaterial({color: C.gold, emissive: C.goldEmissive, emissiveIntensity: 0.7, roughness: 0.3}),
    }),
    [],
  );
  const wall = project(cam, sp(0.3).map((v, i) => (i === 0 ? v - 1.2 : i === 2 ? 0.3 : v)) as V3);
  const pa = project(cam, pk);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={3}>
        <Stomach t={t} churn={swirl} cut={1} glow={acid} />
        {acid > 0 &&
          drops.map((d, i) => {
            const p = sp(d.u);
            const a = d.a + t * d.sp;
            return (
              <mesh key={i} material={m.acid} position={[p[0] + Math.cos(a) * d.rr, p[1] + Math.sin(a * 1.2) * d.rr * 0.7, 0.1 + Math.sin(a) * 0.3]} scale={0.06 * acid}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
            );
          })}
        {pep > 0 &&
          chyme.slice(0, 16).map((d, i) => {
            const a = d.a + t * d.sp * 2;
            return (
              <mesh key={i} material={m.pep} position={[pk[0] + Math.cos(a) * (0.55 + d.rr * 0.4), pk[1] + Math.sin(d.b + t) * 0.35, pk[2] + Math.sin(a) * 0.4]} scale={0.035 * pep}>
                <octahedronGeometry args={[1, 0]} />
              </mesh>
            );
          })}
        {/* kimus: bubur halus — bolus melebur jadi butir emas kecil */}
        {kimus > 0 &&
          chyme.map((d, i) => {
            const a = d.a + t * d.sp;
            const rr = d.rr * kimus;
            return (
              <mesh key={i} material={m.chyme} position={[pk[0] + Math.cos(a) * rr, pk[1] + Math.sin(d.b + t * d.sp) * rr * 0.8, pk[2] + Math.sin(a) * rr * 0.6]} scale={0.055 * kimus}>
                <sphereGeometry args={[1, 10, 8]} />
              </mesh>
            );
          })}
        <Packet position={pk} t={t} size={0.75 - 0.2 * kimus} gold={1} lumpy={0.25 * (1 - kimus)} split={0.35 * ramp(t, tProtein - 0.2, tProtein + 0.6)} />
      </Stage>
      <Chip anchor={wall} box={{x: wall.x + 40, y: wall.y - 300}} text="Asam Lambung (HCl)" color={C.acid} active={acid} appear={ramp(t, tAsam - 0.15, tAsam + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} />
      <Chip anchor={pa} box={{x: pa.x + 20, y: pa.y + 330}} text="& Enzim Pepsin → Kimus" color={C.enzyme} active={pep} appear={ramp(t, tPepsin - 0.15, tPepsin + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} />
    </>
  );
};
