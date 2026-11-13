import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';
import {varTube, curveOf} from '../VarTube';

// Jantung glossy bergaya ilustrasi: ventrikel kerucut membulat (apeks ke kiri-bawah),
// dua aurikel, alur antar-ventrikel + pembuluh koroner (merah = arteri, biru = vena). Skala lokal ±1.
const ventR = (y: number) => {
  const k = (y + 1.2) / 1.95; // 0 apeks .. 1 dasar
  return 0.06 + 0.9 * Math.sin(Math.PI * 0.5 * Math.min(1, Math.pow(k, 0.62) * 1.08)) * (k > 0.88 ? 1 - (k - 0.88) * 1.6 : 1);
};
const ventPt = (y: number, th: number, out = 1): THREE.Vector3 => {
  const r = ventR(y) * out;
  // sedikit asimetris: ventrikel kiri lebih tebal (sisi -x)
  const bulge = 1 + 0.08 * Math.cos(th - Math.PI);
  return new THREE.Vector3(Math.cos(th) * r * bulge, y, Math.sin(th) * r * 0.8);
};
export const Heart: React.FC<{beat: number}> = ({beat}) => {
  const g = useMemo(() => {
    const n = 48;
    const m = 56;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= n; i++) {
      const y = -1.2 + (i / n) * 1.95;
      for (let j = 0; j <= m; j++) {
        const th = (j / m) * Math.PI * 2;
        const groove = 1 - 0.05 * Math.exp(-(((th - 1.35) / 0.08) ** 2)) - 0.04 * Math.exp(-(((th - 4.4) / 0.08) ** 2));
        const p = ventPt(y, th, groove);
        pos.push(p.x, p.y, p.z);
      }
    }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        const a = i * (m + 1) + j;
        const b = a + m + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const vent = new THREE.BufferGeometry();
    vent.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    vent.setIndex(idx);
    vent.computeVertexNormals();
    const line = (th: number, y0: number, y1: number, wob: number) =>
      curveOf(Array.from({length: 9}, (_, i) => {
        const y = y0 + ((y1 - y0) * i) / 8;
        const p = ventPt(y, th + wob * Math.sin(i * 1.3), 1.03);
        return [p.x, p.y, p.z] as [number, number, number];
      }));
    const corA = varTube(line(1.35, 0.6, -1.05, 0.04), () => 0.035, {n: 50, m: 8});
    const corA2 = varTube(line(2.2, 0.45, -0.5, 0.06), () => 0.026, {n: 40, m: 8});
    const corV = varTube(line(0.75, 0.55, -0.7, 0.05), () => 0.03, {n: 40, m: 8});
    const aur = new THREE.SphereGeometry(1, 32, 20);
    return {vent, corA, corA2, corV, aur};
  }, []);
  const m = useMemo(() => ({heart: glossy(C.heart, {roughness: 0.28}), aur: glossy('#B9475A', {roughness: 0.3}), fat: glossy('#E9C7A0', {roughness: 0.4}), red: glossy(C.bloodRed, {emissive: C.bloodRed, emissiveIntensity: 0.25}), blue: glossy(C.bloodBlue, {emissive: C.bloodBlue, emissiveIntensity: 0.25})}), []);
  const s = 1 + 0.06 * beat;
  return (
    <group scale={[s, s * 0.98, s]}>
      <mesh geometry={g.vent} material={m.heart} />
      {/* aurikel kanan & kiri (atrium) */}
      <mesh geometry={g.aur} material={m.aur} position={[0.62, 0.62, 0.12]} scale={[0.36, 0.3, 0.3]} rotation={[0, 0, 0.5]} />
      <mesh geometry={g.aur} material={m.aur} position={[-0.6, 0.66, 0.05]} scale={[0.3, 0.24, 0.26]} rotation={[0, 0, -0.5]} />

      <mesh geometry={g.corA} material={m.red} />
      <mesh geometry={g.corA2} material={m.red} />
      <mesh geometry={g.corV} material={m.blue} />
    </group>
  );
};
