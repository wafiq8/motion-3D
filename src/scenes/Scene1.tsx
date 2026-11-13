import React from 'react';
import {Stage} from '../three/Stage';
import {HeadSection, ESO_CURVE} from '../three/models/HeadSection';
import {Packet} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, kf1, ramp, sceneEnd, sceneStart, wordAt, V3, seeded, lerp3, clamp} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';
import * as THREE from 'three';

const S = 1;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tGigi = wordAt(1, 'Gigi');
const tLiur = wordAt(1, 'liur');
const tAmilase = wordAt(1, 'amilase');
const tGumpal = wordAt(1, 'gumpalan');
const tTelan = wordAt(1, 'telan');
const MOUTH: V3 = [1.02, -0.86, 0.22];
const r = seeded(11);
const chunks = Array.from({length: 6}, () => [(r() - 0.5) * 0.36, (r() - 0.5) * 0.12, (r() - 0.5) * 0.14] as V3);
const sparks = Array.from({length: 14}, () => ({a: r() * 6.28, rr: 0.16 + r() * 0.16, sp: 1.5 + r() * 2, ph: r()}));
const ducts: V3[] = [[-0.1, -0.62, 0.2], [0.62, -1.38, 0.2], [0.98, -1.1, 0.2]];
const esoPt = (u: number): V3 => {
  const p = ESO_CURVE.getPointAt(u);
  return [p.x, p.y, p.z + 0.02];
};

export const packet1 = (t: number): V3 => {
  // ditelan: dari mulut melewati pangkal lidah ke kerongkongan
  const sw = ramp(t, tTelan + 0.05, t1);
  if (sw <= 0) return MOUTH;
  if (sw < 0.4) return lerp3(MOUTH, [0.3, -0.9, 0.12], sw / 0.4);
  return esoPt(((sw - 0.4) / 0.6) * 0.35);
};

export const Scene1: React.FC<{t: number}> = ({t}) => {
  const chew = t > tGigi - 0.1 && t < tLiur ? Math.max(0, Math.sin((t - tGigi + 0.1) * Math.PI * 2.6)) : 0;
  const jaw = 0.13 * chew;
  const pk = packet1(t);
  const base = {
    pos: kf3(t, [[0, [0.15, -0.35, 11.2]], [tGigi, [0.4, -0.55, 8.4]], [tLiur, [0.75, -0.85, 5.4]], [tGumpal, [0.85, -0.9, 4.4]], [t1, [0.3, -1.5, 4.8]]]),
    target: kf3(t, [[0, [0.15, -0.35, 0]], [tGigi, [0.4, -0.6, 0]], [tLiur, [0.8, -0.9, 0]], [tGumpal, [0.9, -0.92, 0]], [tTelan + 0.1, [0.75, -0.95, 0]], [t1, [0.1, -1.55, 0]]]),
    fov: 35,
  };
  const {cam, flash} = withDive(base, pk, t, t0, t1, {inn: false});
  const merge = ramp(t, tAmilase + 0.6, tTelan);
  const gold = ramp(t, tGumpal - 0.4, tTelan + 0.1);
  const crush = clamp((t - tGigi) / 1.4);
  const saliva = ramp(t, tLiur - 0.2, tLiur + 0.9);
  const amy = ramp(t, tAmilase - 0.1, tAmilase + 0.5) * (1 - ramp(t, tTelan, tTelan + 0.3));
  const foodMat = React.useMemo(() => new THREE.MeshStandardMaterial({color: C.food, roughness: 0.45}), []);
  const salMat = React.useMemo(() => new THREE.MeshStandardMaterial({color: C.enzyme, roughness: 0.15, transparent: true, opacity: 0.8, emissive: C.enzyme, emissiveIntensity: 0.3}), []);
  const amyMat = React.useMemo(() => new THREE.MeshStandardMaterial({color: C.enzyme, emissive: C.enzyme, emissiveIntensity: 1.2}), []);
  const teeth = project(cam, [1.25, -0.75, 0.2]);
  const gland = project(cam, [0.6, -1.5, 0.2]);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={1}>
        <HeadSection jaw={jaw} t={t} glandGlow={saliva * (1 - ramp(t, tGumpal, tTelan))} teethGlow={chew} />
        {/* potongan makanan dihancurkan gigi lalu menyatu jadi bolus */}
        {merge < 1 &&
          chunks.map((c, i) => {
            const sc = (0.11 - 0.035 * crush) * (1 - merge);
            const jitter = chew * 0.02 * Math.sin(i * 3 + t * 20);
            return (
              <mesh key={i} material={foodMat} position={[MOUTH[0] + c[0] * (1 - merge) + jitter, MOUTH[1] + c[1] * (1 - merge), MOUTH[2] + c[2]]} scale={sc}>
                <dodecahedronGeometry args={[1, 0]} />
              </mesh>
            );
          })}
        {/* air liur dari muara kelenjar */}
        {saliva > 0 &&
          saliva < 1 &&
          ducts.map((d, i) =>
            [0, 0.33, 0.66].map((o, j) => {
              const k = clamp(saliva * 1.4 - o * 0.4);
              return <mesh key={`${i}-${j}`} material={salMat} position={lerp3(d, MOUTH, k)} scale={0.04}><sphereGeometry args={[1, 12, 8]} /></mesh>;
            }),
          )}
        {/* enzim amilase: kilau lavender mengitari makanan */}
        {amy > 0 &&
          sparks.map((s, i) => {
            const a = s.a + t * s.sp;
            return (
              <mesh key={i} material={amyMat} position={[MOUTH[0] + Math.cos(a) * s.rr, MOUTH[1] + Math.sin(a * 1.3) * 0.08, MOUTH[2] + Math.sin(a) * s.rr]} scale={0.022 * amy}>
                <octahedronGeometry args={[1, 0]} />
              </mesh>
            );
          })}
        {merge > 0 && <Packet position={pk} t={t} size={0.17 + 0.05 * merge} gold={gold} lumpy={1 - gold} halo={gold} />}
      </Stage>
      <Chip anchor={teeth} box={{x: teeth.x + 60, y: teeth.y - 330}} text="Pencernaan Mekanis" active={ramp(t, tGigi, tGigi + 0.3) * (1 - ramp(t, tAmilase - 0.3, tAmilase))} appear={ramp(t, tGigi - 0.1, tGigi + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} color={C.accent} />
      <Chip anchor={gland} box={{x: gland.x - 60, y: gland.y + 200}} text="& Enzim Amilase" sub="memecah karbohidrat (pati)" active={ramp(t, tAmilase, tAmilase + 0.3)} appear={ramp(t, tAmilase - 0.15, tAmilase + 0.3) * (1 - ramp(t, t1 - 0.6, t1 - 0.3))} color={C.enzyme} />
    </>
  );
};
export const KF = kf1;
