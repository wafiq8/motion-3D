import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy, haloMat} from '../materials';
import {varTube, curveOf} from '../VarTube';

// Interior satu vili: jaring kapiler (merah→biru) + pembuluh limfa sentral (lakteal, putih susu).
export const LOOP = curveOf([[-1.25, -6.2, -0.2], [-1.3, -2.5, -0.2], [-1.15, 0.8, -0.2], [-0.75, 2.45, -0.2], [0, 2.95, -0.2], [0.75, 2.45, -0.2], [1.15, 0.8, -0.2], [1.3, -2.5, -0.2], [1.25, -6.2, -0.2]]);
export const LACTEAL = curveOf([[0, 2.1, -0.1], [0.05, 0.5, -0.1], [-0.05, -2, -0.1], [0, -6.2, -0.1]]);
const red = new THREE.Color(C.bloodRed);
const blue = new THREE.Color(C.bloodBlue);
export const loopColor = (u: number) => red.clone().lerp(blue, THREE.MathUtils.smoothstep(u, 0.42, 0.6));
const crossCurves = [-3.4, -1.6, 0.1, 1.5].map((y, i) =>
  curveOf([[-1.22, y - 0.25, -0.2], [-0.6, y + 0.15 * (i % 2 ? 1 : -1), 0.45], [0.6, y - 0.1, 0.45], [1.24, y + 0.25, -0.2]]),
);

export const VillusInterior: React.FC<{glowCap: number; glowLym: number}> = ({glowCap, glowLym}) => {
  const g = useMemo(() => {
    const shellCurve = curveOf([[0, -6.4, 0], [0, -2, 0], [0, 1.2, 0], [0, 3.6, 0]]);
    const shell = varTube(
      shellCurve,
      (u, th) => {
        const d = 0.78;
        const base = u < d ? 2.05 : 2.05 * Math.sqrt(Math.max(0.0, 1 - ((u - d) / (1 - d)) ** 2));
        return Math.max(0.02, base) * (1 + 0.02 * Math.sin(th * 14));
      },
      {n: 120, m: 48, cut: 1.05},
    );
    const loop = varTube(LOOP, () => 0.17, {n: 160, m: 14, colors: loopColor});
    const cross = crossCurves.map((c) => varTube(c, () => 0.08, {n: 40, m: 10, colors: (u) => red.clone().lerp(blue, THREE.MathUtils.smoothstep(u, 0.4, 0.6))}));
    const lact = varTube(LACTEAL, (u) => 0.3 * Math.min(1, u / 0.06 + 0.15), {n: 80, m: 18});
    return {shell, loop, cross, lact};
  }, []);
  const m = useMemo(
    () => ({
      shell: glossy(C.villus, {side: THREE.DoubleSide, roughness: 0.4}),
      vessel: glossy('#ffffff', {vertexColors: true, roughness: 0.25}),
      lact: glossy(C.lymph, {roughness: 0.25}),
      halo: haloMat(C.lymph, 0.8),
    }),
    [],
  );
  m.vessel.emissive.set('#ffffff');
  m.vessel.emissiveIntensity = 0;
  m.lact.emissive.set(C.lymph);
  m.lact.emissiveIntensity = 0.35 * glowLym;
  return (
    <group>
      <mesh geometry={g.shell} material={m.shell} />
      <mesh geometry={g.loop} material={m.vessel} scale={[1, 1, 1]} />
      {g.cross.map((c, i) => (
        <mesh key={i} geometry={c} material={m.vessel} />
      ))}
      <mesh geometry={g.lact} material={m.lact} />
      {glowCap > 0 && null}
    </group>
  );
};
