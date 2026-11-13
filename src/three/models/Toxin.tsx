import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {C} from '../../lib/style';
import {V3} from '../../lib/time';
import {glossy, haloMat, haloMatInst} from '../materials';
import {Inst, InstItem} from '../Inst';

// Endotoksin: butir hijau keruh berduri pendek (stilasi molekul LPS) — BUKAN biru/merah.
export const toxinGeo = (() => {
  const parts: THREE.BufferGeometry[] = [new THREE.IcosahedronGeometry(1, 2)];
  const dirs = new THREE.IcosahedronGeometry(1, 0).attributes.position;
  const seen = new Set<string>();
  for (let i = 0; i < dirs.count; i++) {
    const d = new THREE.Vector3().fromBufferAttribute(dirs, i).normalize();
    const k = d.toArray().map((x) => x.toFixed(2)).join();
    if (seen.has(k)) continue;
    seen.add(k);
    const c = new THREE.ConeGeometry(0.32, 0.75, 8);
    c.translate(0, 1.1, 0);
    c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d));
    parts.push(c);
  }
  return mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)));
})();
export const toxinMat = glossy(C.endotoxin, {roughness: 0.42, emissive: C.endotoxin, emissiveIntensity: 0.35});

export const ToxinField: React.FC<{items: InstItem[]; max?: number}> = ({items, max = 120}) => <Inst geo={toxinGeo} mat={toxinMat} items={items} max={max} />;

/** Hero penghubung: satu endotoksin dengan halo hijau keruh (diikuti kamera). */
export const HeroToxin: React.FC<{position: V3; t: number; size?: number; halo?: number; flare?: number}> = ({position, t, size = 1, halo = 1, flare = 0}) => {
  const hm = useMemo(() => haloMat(C.endotoxinGlow, 1.1), []);
  const fm = useMemo(() => haloMat('#FF6A00', 1.2), []);
  const mat = useMemo(() => glossy(C.endotoxin, {roughness: 0.35, emissive: C.endotoxinGlow, emissiveIntensity: 0.45}), []);
  hm.uniforms.k.value = 1.0 * halo;
  fm.uniforms.k.value = 0.75 * flare;
  return (
    <group position={position} scale={size}>
      <mesh geometry={toxinGeo} material={mat} rotation={[t * 0.9, t * 0.6, 0]} />
      <mesh material={hm} scale={2.6 * (0.9 + 0.1 * Math.sin(t * 4))}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {flare > 0.01 && (
        <mesh material={fm} scale={3.4 + 1.2 * Math.sin(t * 9)}>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
      )}
    </group>
  );
};

/** Kilatan sinyal peradangan (oranye) yang berjalan di sepanjang kurva pembuluh. */
export const InflameFlow: React.FC<{curves: THREE.Curve<THREE.Vector3>[]; t: number; amount: number; count?: number; size?: number; speed?: number; seed?: number; zOff?: number}> = ({curves, t, amount, count = 40, size = 0.06, speed = 0.25, seed = 1, zOff = 0.05}) => {
  const core = useMemo(() => new THREE.MeshStandardMaterial({color: C.inflame, emissive: C.inflame, emissiveIntensity: 2.2, toneMapped: true}), []);
  const halo = useMemo(() => haloMatInst(C.inflame, 1.3), []);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);
  if (amount <= 0.01) return null;
  const items: InstItem[] = [];
  const hs: InstItem[] = [];
  for (let i = 0; i < count; i++) {
    const c = curves[i % curves.length];
    const o = ((i * 0.6180339 + seed * 0.37) % 1 + 1) % 1;
    const u = (o + t * speed) % 1;
    const p = c.getPointAt(u);
    const flick = 0.55 + 0.45 * Math.sin(t * 11 + i * 2.1);
    const s = size * amount * flick;
    items.push({p: [p.x, p.y, p.z + zOff], s});
    hs.push({p: [p.x, p.y, p.z + zOff], s: s * 3.2});
  }
  return (
    <>
      <Inst geo={geo} mat={core} items={items} max={count} />
      <Inst geo={geo} mat={halo} items={hs} max={count} renderOrder={8} />
    </>
  );
};
