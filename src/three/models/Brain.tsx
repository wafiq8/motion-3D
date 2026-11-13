import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';

// Otak glossy stilasi: dua hemisfer bergiri (displacement prosedural), fisura tengah, serebelum, batang otak.
// Menghadap +z (depan), skala lokal ±1. Aset seri.
const hemi = (side: number) => {
  const g = new THREE.SphereGeometry(1, 96, 64);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const gyri = 0.032 * Math.sin(v.x * 11 + Math.sin(v.y * 6) * 2.0) * Math.sin(v.z * 9 + v.y * 5) + 0.018 * Math.sin(v.y * 14 + v.z * 8);
    let x = v.x * 0.56;
    if (x * side < 0) x *= 0.15; // sisi medial datar
    const k = 1 + gyri;
    const y = v.y * 0.72 * (v.y < 0 ? 0.75 : 1);
    p.setXYZ(i, x * k + side * (0.56 * 0.15 - 0.02), y * k, v.z * 0.95 * k);
  }
  g.computeVertexNormals();
  return g;
};
export const Brain: React.FC<{glow?: number; glowColor?: string}> = ({glow = 0, glowColor = C.healthy}) => {
  const g = useMemo(() => ({l: hemi(-1), r: hemi(1)}), []);
  const m = useMemo(() => ({b: glossy(C.brain, {roughness: 0.32}), cb: glossy('#D58FA3', {roughness: 0.35}), st: glossy('#C98597', {roughness: 0.4})}), []);
  for (const mm of [m.b, m.cb]) {
    mm.emissive.set(glowColor);
    mm.emissiveIntensity = 0.35 * glow;
  }
  return (
    <group>
      <mesh geometry={g.l} material={m.b} position={[-0.03, 0, 0]} />
      <mesh geometry={g.r} material={m.b} position={[0.03, 0, 0]} />
      <mesh material={m.cb} position={[0, -0.52, -0.62]} scale={[0.62, 0.3, 0.36]}><sphereGeometry args={[1, 32, 20]} /></mesh>
      <mesh material={m.st} position={[0, -0.75, -0.35]} rotation={[0.35, 0, 0]}><cylinderGeometry args={[0.13, 0.1, 0.7, 16]} /></mesh>
    </group>
  );
};
