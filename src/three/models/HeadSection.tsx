import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';
import {varTube, curveOf} from '../VarTube';

// Penampang kepala siluet profil (menghadap +x), gaya ilustrasi anatomi. Aset dipakai ulang seri.
export const HEAD_OUTLINE: [number, number][] = [
  [-0.95, -3.7], [-0.85, -2.3], [-1.25, -1.2], [-1.55, -0.3], [-1.6, 0.6], [-1.25, 1.55], [-0.5, 2.15], [0.35, 2.3], [1.05, 1.95],
  [1.42, 1.2], [1.52, 0.55], [1.48, 0.25], [1.62, -0.05], [1.92, -0.32], [1.78, -0.46], [1.56, -0.52], [1.6, -0.68], [1.56, -0.8],
  [1.48, -0.86], [1.58, -0.98], [1.5, -1.18], [1.48, -1.42], [1.26, -1.72], [0.75, -1.86], [0.38, -1.98], [0.36, -2.5], [0.5, -3.7],
];
const shapeOf = (pts: [number, number][]) => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  s.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
  s.lineTo(pts[0][0], pts[0][1]);
  return s;
};
const blob = (pts: [number, number][], depth: number) =>
  new THREE.ExtrudeGeometry(shapeOf(pts), {depth, bevelEnabled: true, bevelThickness: depth * 0.6, bevelSize: 0.05, bevelSegments: 4, curveSegments: 40});

export const JAW_PIVOT: [number, number] = [-0.2, -0.42];
export const ESO_CURVE = curveOf([[0.28, -0.92, 0.1], [0.12, -1.25, 0.1], [0.02, -1.9, 0.1], [-0.02, -2.8, 0.1], [-0.05, -3.9, 0.1]]);

export const HeadSection: React.FC<{jaw: number; t: number; glandGlow: number; teethGlow: number}> = ({jaw, glandGlow, teethGlow}) => {
  const g = useMemo(() => {
    const sil = new THREE.ExtrudeGeometry(shapeOf(HEAD_OUTLINE), {depth: 0.3, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.06, bevelSegments: 4, curveSegments: 64});
    const outlinePts = HEAD_OUTLINE.map(([x, y]) => new THREE.Vector3(x, y, 0.32));
    const rim = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outlinePts), 220, 0.022, 6, false);
    const cavity = blob([[0.2, -0.78], [0.7, -0.68], [1.3, -0.72], [1.46, -0.84], [1.3, -0.98], [0.75, -1.1], [0.3, -1.05], [0.15, -0.92]], 0.04);
    const palate = blob([[0.15, -0.72], [0.6, -0.6], [1.25, -0.62], [1.3, -0.7], [0.65, -0.7], [0.18, -0.8]], 0.08);
    const tongue = blob([[0.18, -1.02], [0.35, -0.88], [0.75, -0.84], [1.1, -0.9], [1.26, -0.98], [1.08, -1.08], [0.7, -1.24], [0.3, -1.3], [0.12, -1.2]], 0.16);
    const brain = blob([[-1.25, 0.55], [-1.05, 1.45], [-0.3, 1.95], [0.55, 1.98], [1.05, 1.55], [1.15, 0.8], [0.7, 0.45], [-0.2, 0.3], [-0.95, 0.15]], 0.1);
    const eso = varTube(ESO_CURVE, () => 0.15, {n: 60, m: 20, cut: 0.9});
    const trachea = varTube(curveOf([[0.4, -1.45, 0.05], [0.42, -2.4, 0.05], [0.42, -3.8, 0.05]]), () => 0.13, {n: 30, m: 16, cut: 0.9});
    return {sil, rim, cavity, palate, tongue, brain, eso, trachea};
  }, []);
  const m = useMemo(
    () => ({
      sil: glossy(C.silhouette, {roughness: 0.55}),
      rim: new THREE.MeshBasicMaterial({color: C.silhouetteRim, transparent: true, opacity: 0.85}),
      cavity: glossy('#3E1533', {roughness: 0.6}),
      palate: glossy(C.mucosa),
      tongue: glossy(C.tongue),
      brain: glossy('#3A2763', {roughness: 0.45}),
      teeth: glossy(C.teeth, {roughness: 0.22}),
      gland: glossy(C.gland, {roughness: 0.35}),
      eso: glossy(C.esophagus, {side: THREE.DoubleSide}),
      trachea: glossy('#8D6FA8', {side: THREE.DoubleSide, roughness: 0.4}),
    }),
    [],
  );
  m.teeth.emissive.set('#FFD84D');
  m.teeth.emissiveIntensity = 0.25 * teethGlow;
  m.gland.emissive.set('#E6DEFF');
  m.gland.emissiveIntensity = 0.5 * glandGlow;
  const upper = [0.62, 0.8, 0.98, 1.14, 1.3];
  // kelenjar ludah: parotis (dekat telinga), submandibula (bawah rahang), sublingual (bawah lidah)
  const glands: {c: [number, number]; r: number}[] = [
    {c: [-0.35, -0.55], r: 0.3},
    {c: [0.6, -1.5], r: 0.2},
    {c: [1.0, -1.2], r: 0.12},
  ];
  return (
    <group>
      <mesh geometry={g.sil} material={m.sil} position={[0, 0, -0.55]} />
      <mesh geometry={g.rim} material={m.rim} position={[0, 0, -0.55]} />
      <mesh geometry={g.brain} material={m.brain} position={[0, 0, -0.15]} />
      <mesh geometry={g.trachea} material={m.trachea} />
      <mesh geometry={g.eso} material={m.eso} />
      <mesh geometry={g.cavity} material={m.cavity} position={[0, 0, -0.12]} />
      <mesh geometry={g.palate} material={m.palate} position={[0, 0, 0]} />
      {upper.map((x, i) => (
        <mesh key={i} material={m.teeth} position={[x, -0.75, 0.12]} scale={[i === 4 ? 0.07 : 0.085, 0.09, 0.12]}>
          <capsuleGeometry args={[1, 0.6, 4, 10]} />
        </mesh>
      ))}
      {/* rahang bawah berputar di sendi rahang */}
      <group position={[JAW_PIVOT[0], JAW_PIVOT[1], 0]} rotation={[0, 0, -jaw]}>
        <group position={[-JAW_PIVOT[0], -JAW_PIVOT[1], 0]}>
          <mesh geometry={g.tongue} material={m.tongue} position={[0, 0, -0.02]} />
          {upper.map((x, i) => (
            <mesh key={i} material={m.teeth} position={[x - 0.02, -0.97, 0.12]} scale={[i === 4 ? 0.07 : 0.085, 0.085, 0.12]}>
              <capsuleGeometry args={[1, 0.6, 4, 10]} />
            </mesh>
          ))}
        </group>
      </group>
      {glands.map((gl, i) => (
        <group key={i} position={[gl.c[0], gl.c[1], 0.05]}>
          {Array.from({length: 7}, (_, k) => (
            <mesh key={k} material={m.gland} position={[Math.cos(k * 2.3) * gl.r * 0.55, Math.sin(k * 1.9) * gl.r * 0.5, Math.sin(k) * 0.05]} scale={gl.r * (0.5 + 0.12 * (k % 3))}>
              <sphereGeometry args={[1, 18, 12]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
