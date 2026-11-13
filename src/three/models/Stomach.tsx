import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';
import {varTube, curveOf} from '../VarTube';

// Lambung bentuk J: kardia (atas-kiri) → fundus → badan → antrum → pilorus (kanan).
export const STOMACH = curveOf([[-0.6, 2.25, 0], [-0.95, 1.2, 0], [-0.85, -0.3, 0], [-0.1, -1.35, 0], [1.1, -1.45, 0], [2.0, -0.75, 0], [2.45, 0.1, 0]]);
const prof = (u: number) => {
  // radius: sempit di kardia, mengembang (fundus/badan), menyempit ke pilorus
  const up = Math.min(1, u / 0.12);
  const body = 1.32 - 0.25 * u;
  const taper = u > 0.72 ? 1 - ((u - 0.72) / 0.28) * 0.72 : 1;
  return 0.32 + (body - 0.32) * Math.sin((up * Math.PI) / 2) * taper;
};
export const Stomach: React.FC<{t: number; churn: number; cut: number; glow?: number}> = ({t, churn, cut, glow = 0}) => {
  const mat = useMemo(() => glossy(C.stomach, {side: THREE.DoubleSide}), []);
  const inner = useMemo(() => glossy('#B04E62', {side: THREE.BackSide, roughness: 0.45}), []);
  mat.emissive.set(C.acid);
  mat.emissiveIntensity = 0.06 * glow;
  const ph = Math.round(t * 30) / 30;
  const geo = useMemo(() => {
    const r = (u: number, th: number) => prof(u) * (1 + 0.045 * Math.sin(th * 9 + u * 5) + 0.07 * churn * Math.sin(u * 16 - ph * 5.5));
    return varTube(STOMACH, r, {n: 140, m: 48, cut: cut * 0.95});
  }, [churn, cut, ph]);
  const pyl = useMemo(() => varTube(curveOf([[2.4, 0.0, 0], [2.75, 0.5, 0], [3.3, 0.7, 0]]), () => 0.3, {n: 20, m: 16, cut: cut * 0.95}), [cut]);
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      {cut > 0 && <mesh geometry={geo} material={inner} scale={0.985} />}
      <mesh geometry={pyl} material={mat} />
    </group>
  );
};
