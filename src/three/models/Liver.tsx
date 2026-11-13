import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy, haloMat} from '../materials';
import {varTube, curveOf} from '../VarTube';

// Hati glossy (lobus kanan besar + lobus kiri meruncing), vena porta & vena hepatika (BIRU = miskin O2).
const liverGeo = () => {
  // Bentuk baji: lobus kanan (kiri layar) tebal-membulat, lobus kiri menipis & meruncing ke atas,
  // permukaan atas berkubah, tepi bawah miring tajam, alur ligamen falsiformis memisah dua lobus.
  const g = new THREE.SphereGeometry(1, 128, 80);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const x = v.x;
    const k = THREE.MathUtils.clamp((x + 0.35) / 1.35, 0, 1);
    const hx = 1 - 0.78 * Math.pow(k, 1.1); // tinggi menyusut ke lobus kiri
    let y = v.y * 1.75 * hx;
    if (v.y < 0) y *= 0.7; // bawah lebih datar
    y += 0.9 * (1 - hx); // lobus kiri naik ke atas
    y -= 0.22 * (x + 1) * 0.5 * (v.y < 0 ? 1 : 0.2); // tepi bawah miring
    const groove = v.y > -0.2 && v.z > 0 ? 0.09 * Math.exp(-(((x - 0.12) / 0.06) ** 2)) : 0;
    const z = v.z * (0.45 + 0.55 * hx) * (1 - groove);
    p.setXYZ(i, x * 3.0 + 0.2 * (1 - x * x) * 0, y - groove * 0.4, z);
  }
  g.computeVertexNormals();
  return g;
};
export const PORTAL = curveOf([[-0.3, -4.6, 0.6], [-0.4, -3.0, 0.7], [-0.5, -1.4, 0.8], [-0.6, -0.3, 0.6]]);
export const THROUGH = curveOf([[-0.6, -0.3, 0.6], [-0.9, 0.2, 0.9], [-0.5, 0.6, 0.95], [0.1, 0.9, 0.7], [0.35, 1.5, 0.5]]);
export const HEPATIC = curveOf([[0.35, 1.5, 0.5], [0.4, 2.6, 0.3], [0.4, 4.4, 0.2], [0.4, 6.2, 0.1]]);
export const STORE: [number, number, number] = [-1.55, 0.25, 0.95];
export const FILTER: [number, number, number] = [-0.25, 0.1, 1.0];

export const Liver: React.FC<{opacity: number; glowFilter: number; glowStore: number; vessels?: boolean}> = ({opacity, glowFilter, glowStore, vessels = true}) => {
  const g = useMemo(() => ({liver: liverGeo(), portal: varTube(PORTAL, () => 0.32, {n: 40, m: 16}), hep: varTube(HEPATIC, () => 0.36, {n: 40, m: 16})}), []);
  const m = useMemo(
    () => ({
      liver: glossy(C.liver, {transparent: true, depthWrite: false, roughness: 0.3}),
      blue: glossy(C.bloodBlue, {roughness: 0.28, emissive: C.bloodBlue, emissiveIntensity: 0.25}),
      ring: new THREE.MeshStandardMaterial({color: C.enzyme, emissive: C.enzyme, emissiveIntensity: 1, transparent: true}),
      gb: glossy(C.gallbladder, {roughness: 0.25}),
      store: haloMat('#FFC460', 1),
    }),
    [],
  );
  m.liver.opacity = opacity;
  m.ring.opacity = 0.7 * glowFilter;
  m.store.uniforms.k.value = 0.9 * glowStore;
  return (
    <group>
      {vessels && <mesh geometry={g.portal} material={m.blue} />}
      {vessels && <mesh geometry={g.hep} material={m.blue} />}
      {glowFilter > 0 && (
        <mesh position={FILTER} material={m.ring} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.42, 0.035, 10, 48]} />
        </mesh>
      )}
      {glowStore > 0 && (
        <mesh position={STORE} material={m.store} renderOrder={6}>
          <sphereGeometry args={[0.5, 24, 16]} />
        </mesh>
      )}
      <mesh geometry={g.liver} material={m.liver} renderOrder={5} />
      {/* kantong empedu mengintip di bawah lobus kanan (konsisten dengan scene 4) */}
      <mesh material={m.gb} position={[-0.9, -1.35, 0.6]} rotation={[0.3, 0, 0.5]} scale={[0.28, 0.45, 0.26]}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
    </group>
  );
};
