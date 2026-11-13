import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {V3, seeded, clamp} from '../../lib/time';
import {haloMat} from '../materials';
import {Inst, InstItem} from '../Inst';

// Kerusakan sel organ (stilasi bersih, tanpa gore): bercak sel kusam abu-ungu bertepi oranye
// yang muncul menyebar di permukaan elipsoid organ. health: halo hangat organ sehat (pemulihan).
export const Damage: React.FC<{center: V3; radii: V3; t: number; amount: number; health?: number; seed?: number; n?: number}> = ({center, radii, t, amount, health = 0, seed = 1, n = 34}) => {
  const pts = useMemo(() => {
    const r = seeded(seed * 97 + 5);
    return Array.from({length: n}, () => {
      const u = r() * 2 - 1;
      const a = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      // condong ke sisi depan (+z) agar terlihat kamera
      const d = new THREE.Vector3(s * Math.cos(a), u, Math.abs(s * Math.sin(a)) * 0.9 + 0.1).normalize();
      return {d, k: r(), sz: 0.6 + r() * 0.6};
    });
  }, [seed, n]);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 14, 10), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: '#6B5A70', roughness: 0.7, emissive: C.inflame, emissiveIntensity: 0}), []);
  const hm = useMemo(() => haloMat(C.healthy, 1), []);
  mat.emissiveIntensity = 0.25 + 0.2 * Math.sin(t * 7);
  const items: InstItem[] = [];
  if (amount > 0.01)
    pts.forEach((p) => {
      const k = clamp((amount - p.k * 0.7) / 0.3);
      if (k <= 0.01) return;
      const pos: V3 = [center[0] + p.d.x * radii[0], center[1] + p.d.y * radii[1], center[2] + p.d.z * radii[2]];
      const s = 0.09 * Math.min(radii[0], radii[1]) * 2.2 * p.sz * k;
      items.push({p: pos, s: [s, s * 0.7, s]});
    });
  hm.uniforms.k.value = 1.1 * health;
  return (
    <>
      <Inst geo={geo} mat={mat} items={items} max={n} />
      {health > 0.01 && (
        <mesh material={hm} position={center} scale={[radii[0] * 1.5, radii[1] * 1.5, radii[2] * 1.5]} renderOrder={9}>
          <sphereGeometry args={[1, 32, 20]} />
        </mesh>
      )}
    </>
  );
};
