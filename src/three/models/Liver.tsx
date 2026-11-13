import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';
import {varTube, curveOf} from '../VarTube';

// Hati glossy (lobus kanan besar + lobus kiri meruncing), vena porta & vena hepatika (BIRU = miskin O2).
const liverGeo = () => {
  const g = new THREE.SphereGeometry(1, 96, 64);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    // x: -1 (lobus kanan, kiri layar) .. 1 (lobus kiri meruncing)
    const x = v.x;
    const taper = x > 0 ? 1 - 0.62 * x * x : 1 - 0.1 * x * x;
    let y = v.y * 1.25 * taper;
    if (y < 0) y *= 0.55; // permukaan bawah lebih datar
    y += 0.25 * (1 - x * x) * (v.y > 0 ? 0.6 : 0.0);
    const z = v.z * 0.95 * taper;
    p.setXYZ(i, x * 2.9, y, z);
  }
  g.computeVertexNormals();
  return g;
};
export const PORTAL = curveOf([[-0.3, -4.6, 0.6], [-0.4, -3.0, 0.7], [-0.5, -1.4, 0.8], [-0.6, -0.3, 0.6]]);
export const THROUGH = curveOf([[-0.6, -0.3, 0.6], [-0.9, 0.2, 0.9], [-0.5, 0.6, 0.95], [0.1, 0.9, 0.7], [0.35, 1.5, 0.5]]);
export const HEPATIC = curveOf([[0.35, 1.5, 0.5], [0.4, 2.6, 0.3], [0.4, 4.4, 0.2], [0.4, 6.2, 0.1]]);
export const STORE: [number, number, number] = [-1.55, 0.25, 0.95];
export const FILTER: [number, number, number] = [-0.25, 0.1, 1.0];

export const Liver: React.FC<{opacity: number; glowFilter: number; glowStore: number}> = ({opacity, glowFilter, glowStore}) => {
  const g = useMemo(() => ({liver: liverGeo(), portal: varTube(PORTAL, () => 0.32, {n: 40, m: 16}), hep: varTube(HEPATIC, () => 0.36, {n: 40, m: 16})}), []);
  const m = useMemo(
    () => ({
      liver: glossy(C.liver, {transparent: true, depthWrite: false, roughness: 0.3}),
      blue: glossy(C.bloodBlue, {roughness: 0.28, emissive: C.bloodBlue, emissiveIntensity: 0.25}),
      ring: new THREE.MeshStandardMaterial({color: C.enzyme, emissive: C.enzyme, emissiveIntensity: 1, transparent: true}),
      store: new THREE.MeshStandardMaterial({color: C.gold, emissive: C.goldEmissive, emissiveIntensity: 0.6, transparent: true}),
    }),
    [],
  );
  m.liver.opacity = opacity;
  m.ring.opacity = 0.7 * glowFilter;
  m.store.opacity = 0.35 * glowStore;
  return (
    <group>
      <mesh geometry={g.portal} material={m.blue} />
      <mesh geometry={g.hep} material={m.blue} />
      {glowFilter > 0 && (
        <mesh position={FILTER} material={m.ring} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.42, 0.035, 10, 48]} />
        </mesh>
      )}
      {glowStore > 0 && (
        <mesh position={STORE} material={m.store}>
          <sphereGeometry args={[0.5, 24, 16]} />
        </mesh>
      )}
      <mesh geometry={g.liver} material={m.liver} renderOrder={5} />
    </group>
  );
};
