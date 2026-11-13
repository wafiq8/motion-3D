import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';
import {varTube, curveOf} from '../VarTube';

// Usus dua belas jari (lengkung C) + kantong empedu + pankreas. Aset dipakai ulang.
export const DUO = curveOf([[-2.4, 2.0, 0], [-0.6, 2.2, 0], [1.0, 1.75, 0], [1.85, 0.4, 0], [1.6, -1.2, 0], [0.3, -2.0, 0], [-1.3, -1.9, 0], [-2.4, -1.2, 0]]);
export const PAPILLA: [number, number, number] = [1.85, 0.25, 0.1];
export const BILE_DUCT = curveOf([[2.9, 3.1, -0.2], [2.85, 2.1, -0.1], [2.55, 1.0, 0.0], [2.15, 0.35, 0.05], PAPILLA]);
export const PANC_DUCT = curveOf([[-2.6, -0.1, -0.2], [-1.3, 0.05, 0.0], [0.2, 0.0, 0.05], [1.2, 0.15, 0.08], PAPILLA]);
const PANC = curveOf([[-3.0, 0.1, -0.3], [-1.6, 0.2, -0.2], [-0.2, -0.1, -0.1], [0.9, -0.3, -0.1], [1.15, -0.8, -0.1]]);

export const Duodenum: React.FC<{glowBile: number; glowPanc: number}> = ({glowBile, glowPanc}) => {
  const g = useMemo(() => {
    const duo = varTube(DUO, (u, th) => 0.62 * (1 + 0.05 * Math.sin(th * 8 + u * 40)), {n: 160, m: 36, cut: 0.95});
    const panc = varTube(PANC, (u, th) => (0.62 - 0.25 * (1 - u)) * (1 + 0.1 * Math.sin(u * 60) * Math.sin(th * 5)), {n: 120, m: 24});
    const bile = varTube(BILE_DUCT, () => 0.09, {n: 40, m: 10});
    const pd = varTube(PANC_DUCT, () => 0.07, {n: 50, m: 10});
    const gb = new THREE.SphereGeometry(1, 32, 20);
    gb.scale(0.55, 0.95, 0.5);
    return {duo, panc, bile, pd, gb};
  }, []);
  const m = useMemo(
    () => ({
      duo: glossy(C.mucosa, {side: THREE.DoubleSide}),
      panc: glossy(C.pancreas, {roughness: 0.45}),
      gb: glossy(C.gallbladder, {roughness: 0.25}),
      bile: glossy(C.bile),
      pd: glossy('#F0C9C0'),
    }),
    [],
  );
  m.gb.emissive.set(C.bile);
  m.gb.emissiveIntensity = 0.5 * glowBile;
  m.bile.emissive.set(C.bile);
  m.bile.emissiveIntensity = 0.8 * glowBile;
  m.panc.emissive.set(C.enzyme);
  m.panc.emissiveIntensity = 0.25 * glowPanc;
  m.pd.emissive.set(C.enzyme);
  m.pd.emissiveIntensity = 0.8 * glowPanc;
  return (
    <group>
      <mesh geometry={g.panc} material={m.panc} />
      <mesh geometry={g.pd} material={m.pd} />
      <mesh geometry={g.duo} material={m.duo} />
      <mesh geometry={g.gb} material={m.gb} position={[2.95, 3.7, -0.3]} rotation={[0, 0, 0.35]} />
      <mesh geometry={g.bile} material={m.bile} />
    </group>
  );
};
