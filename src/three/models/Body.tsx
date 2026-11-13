import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy, haloMat} from '../materials';
import {varTube, curveOf} from '../VarTube';
import {V3, seeded} from '../../lib/time';
import {Heart} from './Heart';

// Siluet tubuh utuh tanpa wajah + jantung glossy + paru + jaringan arteri. Koordinat dunia (tinggi ±10).
export const HEART_POS: V3 = [0.12, 2.25, 0.55];
export const IVC = curveOf([[0.45, 0.4, 0.1], [0.46, 1.3, 0.12], [0.42, 2.05, 0.22]]);
export const PULM_A = curveOf([[0.28, 2.3, 0.55], [0.0, 2.75, 0.5], [-0.45, 2.85, 0.35], [-0.8, 2.6, 0.2]]);
export const PULM_V = curveOf([[-0.8, 2.6, 0.2], [-0.6, 2.3, 0.25], [-0.25, 2.3, 0.35], [-0.02, 2.35, 0.42]]);
export const AORTA = curveOf([[0.05, 2.45, 0.45], [0.12, 2.95, 0.35], [-0.08, 3.18, 0.15], [-0.28, 2.9, -0.05], [-0.18, 1.5, -0.1], [-0.05, 0.0, -0.1], [0, -0.55, -0.1]]);
const L = (s: number) =>
  [
    curveOf([[0.0 * s, 3.12, 0.15], [0.12 * s, 3.6, 0.12], [0.15 * s, 4.15, 0.1], [0.1 * s, 4.75, 0.1]]), // karotis → otak
    curveOf([[0.05 * s, 3.1, 0.12], [0.6 * s, 3.4, 0.05], [1.12 * s, 3.25, 0.0], [1.35 * s, 1.8, 0.05], [1.5 * s, 0.4, 0.1], [1.6 * s, -0.5, 0.1]]), // lengan
    curveOf([[0, -0.55, -0.1], [0.3 * s, -1.2, 0.0], [0.45 * s, -2.6, 0.05], [0.45 * s, -3.9, 0.05], [0.45 * s, -5.0, 0.1]]), // kaki
  ] as THREE.CatmullRomCurve3[];
export const ARTERIES = [AORTA, ...L(1), ...L(-1)];
export const CAROTID_R = ARTERIES[1];
export const BRAIN_POS: V3 = [0.05, 4.65, 0.1];

const capsule = (a: V3, b: V3, r: number) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const g = new THREE.CapsuleGeometry(r, len, 8, 20);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  g.applyQuaternion(q);
  const mid = va.add(vb).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
};

export const Body: React.FC<{t: number; beat: number; net: number; brain: number; muscle: number; cells: number; bodyOpacity: number}> = ({t, beat, net, brain, muscle, cells, bodyOpacity}) => {
  const g = useMemo(() => {
    const parts = [
      capsule([0, 4.2, 0], [0, 4.85, 0], 0.62), // kepala
      capsule([0, 3.3, 0], [0, 3.9, 0], 0.26), // leher
      capsule([0, 0.2, 0], [0, 2.95, 0], 0.95), // torso
      capsule([0, -0.6, 0], [0, 0.0, 0], 0.85), // panggul
      ...[1, -1].flatMap((s) => [capsule([1.05 * s, 3.05, 0], [1.4 * s, 1.0, 0], 0.28), capsule([1.4 * s, 1.0, 0], [1.6 * s, -0.7, 0.05], 0.23), capsule([0.45 * s, -0.7, 0], [0.5 * s, -2.9, 0], 0.4), capsule([0.5 * s, -2.9, 0], [0.48 * s, -5.0, 0], 0.3)]),
    ];
    const arts = ARTERIES.map((c, i) => varTube(c, () => (i === 0 ? 0.1 : 0.065), {n: 80, m: 10}));
    const ivc = varTube(IVC, () => 0.07, {n: 30, m: 10});
    const pa = varTube(PULM_A, () => 0.06, {n: 30, m: 10});
    const pv = varTube(PULM_V, () => 0.055, {n: 30, m: 10});
    // jantung: lathe ventrikel + dua atrium
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const k = i / 24;
      const y = -1.15 + k * 1.8;
      const rr = Math.sin(Math.PI * Math.pow(k, 0.75)) * 0.85 + 0.02;
      prof.push(new THREE.Vector2(rr, y));
    }
    const vent = new THREE.LatheGeometry(prof, 40);
    vent.scale(1, 1, 0.82);
    const rims = parts.map((pg) => {
      const c = pg.clone();
      const ps = c.attributes.position;
      const ns = c.attributes.normal;
      for (let i = 0; i < ps.count; i++) ps.setXYZ(i, ps.getX(i) + ns.getX(i) * 0.045, ps.getY(i) + ns.getY(i) * 0.045, ps.getZ(i) + ns.getZ(i) * 0.045);
      return c;
    });
    return {parts, rims, arts, ivc, pa, pv, vent};
  }, []);
  const m = useMemo(
    () => ({
      sil: glossy(C.silhouette, {side: THREE.BackSide, transparent: true, roughness: 0.6}),
      rim: new THREE.MeshBasicMaterial({color: C.silhouetteRim, side: THREE.BackSide, transparent: true}),
      art: glossy(C.bloodRed, {emissive: C.bloodRed, roughness: 0.25}),
      blue: glossy(C.bloodBlue, {emissive: C.bloodBlue, emissiveIntensity: 0.3, roughness: 0.25}),
      heart: glossy(C.heart, {roughness: 0.3}),
      lung: glossy('#B48AC9', {transparent: true, opacity: 0.4, depthWrite: false}),
      brain: glossy('#E3A2B4', {roughness: 0.35}),
      muscle: glossy(C.tissue, {roughness: 0.35}),
      cell: new THREE.MeshStandardMaterial({color: C.gold, emissive: C.goldEmissive, emissiveIntensity: 1.2}),
      gold: glossy(C.gold, {emissive: C.goldEmissive, emissiveIntensity: 1.0}),
      halo: haloMat('#FFC460', 1.2),
    }),
    [],
  );
  m.sil.opacity = bodyOpacity;
  m.sil.transparent = bodyOpacity < 0.99;
  m.rim.opacity = 0.8 * bodyOpacity;
  m.art.emissiveIntensity = 0.25 + 0.55 * net;
  m.brain.emissive.set(C.goldEmissive);
  m.brain.emissiveIntensity = 0.55 * brain;
  m.muscle.emissive.set(C.goldEmissive);
  m.muscle.emissiveIntensity = 0.45 * muscle;
  const r = useMemo(() => seeded(88), []);
  const cellPts = useMemo(() => {
    const pts: V3[] = [];
    while (pts.length < 140) {
      const p: V3 = [(r() - 0.5) * 3.4, -5 + r() * 10.2, (r() - 0.5) * 0.6];
      const inTorso = Math.abs(p[0]) < 0.9 && p[1] > -0.6 && p[1] < 3.2;
      const inLeg = Math.abs(Math.abs(p[0]) - 0.48) < 0.3 && p[1] < -0.6;
      const inArm = Math.abs(Math.abs(p[0]) - (1.05 + (3.05 - p[1]) * 0.15)) < 0.2 && p[1] > -0.6 && p[1] < 3.0;
      const inHead = Math.hypot(p[0], p[1] - 4.5) < 0.55;
      if (inTorso || inLeg || inArm || inHead) pts.push(p);
    }
    return pts;
  }, [r]);
  const flowPts: {c: number; o: number}[] = useMemo(() => Array.from({length: 42}, (_, i) => ({c: i % ARTERIES.length, o: (i * 0.237) % 1})), []);
    return (
    <group>
      {/* siluet (transparan) + garis tepi */}
      {g.parts.map((p, i) => (
        <React.Fragment key={i}>
          <mesh geometry={p} material={m.sil} renderOrder={1} />
          <mesh geometry={g.rims[i]} material={m.rim} renderOrder={0} />
        </React.Fragment>
      ))}
      <mesh material={m.lung} position={[-0.55, 2.55, 0.0]} scale={[0.45, 0.85, 0.32]} renderOrder={2}><sphereGeometry args={[1, 32, 20]} /></mesh>
      <mesh material={m.lung} position={[0.6, 2.55, 0.0]} scale={[0.45, 0.85, 0.32]} renderOrder={2}><sphereGeometry args={[1, 32, 20]} /></mesh>
      <mesh material={m.brain} position={BRAIN_POS} scale={[0.46, 0.34, 0.4]}><sphereGeometry args={[1, 32, 20]} /></mesh>
      {[1, -1].map((s) => (
        <mesh key={s} material={m.muscle} position={[0.48 * s, -1.85, 0.05]} scale={[0.3, 0.95, 0.28]}><sphereGeometry args={[1, 24, 16]} /></mesh>
      ))}
      {g.arts.map((a, i) => (
        <mesh key={i} geometry={a} material={m.art} />
      ))}
      <mesh geometry={g.ivc} material={m.blue} />
      <mesh geometry={g.pa} material={m.blue} />
      <mesh geometry={g.pv} material={m.art} />
      <group position={HEART_POS} rotation={[0.15, -0.25, -0.55]} scale={0.5}>
        <Heart beat={beat} />
      </group>
      {/* nutrisi emas mengalir di arteri */}
      {net > 0 &&
        flowPts.map((f, i) => {
          const u = (f.o + t * 0.22) % 1;
          const p = ARTERIES[f.c].getPointAt(u);
          return <mesh key={i} material={m.gold} position={[p.x, p.y, p.z + 0.06]} scale={0.07 * net}><sphereGeometry args={[1, 10, 8]} /></mesh>;
        })}
      {cells > 0 &&
        cellPts.map((p, i) => (
          <mesh key={i} material={m.cell} position={p} scale={0.04 * cells * (0.8 + 0.4 * Math.sin(t * 4 + i))}><sphereGeometry args={[1, 8, 6]} /></mesh>
        ))}
    </group>
  );
};
