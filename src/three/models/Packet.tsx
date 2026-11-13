import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {V3, lerp} from '../../lib/time';
import {glossy, haloMat} from '../materials';

// Bentuk tiga molekul nutrisi — dipakai ulang di semua scene.
export const molGeo = {
  glukosa: new THREE.CylinderGeometry(1, 1, 0.55, 6), // cincin heksagon
  amino: new THREE.IcosahedronGeometry(1, 1), // butir (rantai)
  lemak: new THREE.CapsuleGeometry(0.42, 2.2, 4, 10), // batang panjang
};
export type MolKind = keyof typeof molGeo;
const goldMat = glossy(C.gold, {emissive: C.goldEmissive, emissiveIntensity: 0.9, roughness: 0.25});
export const goldMolMat = goldMat;

export const Molecule: React.FC<{kind: MolKind; position: V3; size: number; rot?: number; opacity?: number}> = ({kind, position, size, rot = 0, opacity = 1}) => {
  const m = useMemo(() => goldMat.clone(), []);
  m.transparent = opacity < 1;
  m.opacity = opacity;
  if (kind === 'amino') {
    return (
      <group position={position} rotation={[rot, rot * 0.7, rot * 0.3]} scale={size}>
        {[-1.6, 0, 1.6].map((x, i) => (
          <mesh key={i} geometry={molGeo.amino} material={m} position={[x, Math.sin(i * 2) * 0.4, 0]} scale={0.75} />
        ))}
      </group>
    );
  }
  return <mesh geometry={molGeo[kind]} material={m} position={position} rotation={[rot + 1.2, rot * 0.8, rot * 0.4]} scale={size} />;
};

/**
 * Paket nutrisi emas — hero penghubung seluruh video.
 * gold: 0 = makanan mentah (krem), 1 = paket emas bercahaya.
 * split: 0 = gumpalan utuh, 1 = pecah jadi 3 jenis molekul yang mengorbit inti.
 */
export const Packet: React.FC<{position: V3; t: number; size?: number; gold?: number; split?: number; lumpy?: number; halo?: number}> = ({position, t, size = 1, gold = 1, split = 0, lumpy = 0, halo = 1}) => {
  const core = useMemo(() => glossy(C.food, {roughness: 0.4}), []);
  const hm = useMemo(() => haloMat('#FFC460', 1.2), []);
  const col = new THREE.Color(C.food).lerp(new THREE.Color(C.gold), gold);
  core.color.copy(col);
  core.emissive.set(C.goldEmissive);
  core.emissiveIntensity = 0.85 * gold;
  hm.uniforms.k.value = 1.1 * gold * halo;
  const coreScale = lerp(1, 0.55, split);
  const lumps = useMemo(() => Array.from({length: 7}, (_, i) => [Math.cos(i * 2.4) * 0.55, Math.sin(i * 1.7) * 0.5, Math.sin(i * 3.1) * 0.5] as V3), []);
  const kinds: MolKind[] = ['glukosa', 'amino', 'lemak', 'glukosa', 'amino', 'lemak'];
  return (
    <group position={position} scale={size}>
      <mesh material={core} scale={coreScale}>
        <sphereGeometry args={[0.62, 40, 28]} />
      </mesh>
      {lumpy > 0 &&
        lumps.map((p, i) => (
          <mesh key={i} material={core} position={[p[0] * coreScale, p[1] * coreScale, p[2] * coreScale]} scale={0.34 * lumpy * coreScale}>
            <sphereGeometry args={[1, 20, 14]} />
          </mesh>
        ))}
      <mesh material={hm} scale={1.55 * (0.8 + 0.2 * Math.sin(t * 3))}>
        <sphereGeometry args={[0.62, 32, 20]} />
      </mesh>
      {split > 0 &&
        kinds.map((k, i) => {
          const a = (i / kinds.length) * Math.PI * 2 + t * 0.9;
          const rr = 0.95 * split;
          return <Molecule key={i} kind={k} position={[Math.cos(a) * rr, Math.sin(a * 1.3) * 0.35 * split, Math.sin(a) * rr]} size={0.13 * split} rot={t * 1.2 + i} />;
        })}
    </group>
  );
};
