/**
 * Strata galian (kotak bertumpuk warna tanah bergradasi) + tengkorak fosil stilasi setengah tenggelam.
 */
import React, { useMemo } from 'react';
import { BoxGeometry, Color, ConeGeometry, MeshStandardMaterial, SphereGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { DERIVED, PALETTE } from '../styleLock';
import { mulberry32 } from '../lib/noise';
import { noiseBump } from '../lib/proceduralTextures';

const mix = (a: string, b: string, t: number) => '#' + new Color(a).lerp(new Color(b), t).getHexString();

/** Warna lapisan dari atas (muda) ke bawah (tua). */
const LAYER_COLORS = [
  PALETTE.sabana,
  mix(PALETTE.pasir, PALETTE.sabana, 0.3),
  mix(PALETTE.senja, PALETTE.kayu, 0.45),
  PALETTE.pasir,
  DERIVED.tanahGelap,
  mix(PALETTE.kayu, PALETTE.senja, 0.25),
  mix(PALETTE.pasir, PALETTE.kayu, 0.35),
  PALETTE.kayu,
];

const layerMats = LAYER_COLORS.map((c, i) => {
  const b = noiseBump(30 + i, 128, 5).clone();
  b.repeat.set(4, 1);
  b.needsUpdate = true;
  return new MeshStandardMaterial({ color: c, roughness: 0.97, metalness: 0, bumpMap: b, bumpScale: 3 });
});
const box = new BoxGeometry(1, 1, 1);
const floorMat = new MeshStandardMaterial({
  color: mix(PALETTE.pasir, PALETTE.sabana, 0.5),
  roughness: 0.97,
  metalness: 0,
  bumpMap: noiseBump(36, 128, 6),
  bumpScale: 3,
});

/**
 * Dinding strata: muka dinding di z=0 menghadap +Z, puncak di y=0, dasar di y=-depth.
 * Lantai galian di y=-depth untuk z∈[0, floorDepth].
 */
export const StrataWall: React.FC<{ width?: number; depth?: number; floorDepth?: number; seed?: number }> = ({
  width = 22,
  depth = 3,
  floorDepth = 9,
  seed = 4,
}) => {
  const layers = useMemo(() => {
    const r = mulberry32(seed);
    const n = LAYER_COLORS.length;
    const out: { y: number; h: number; dz: number; i: number }[] = [];
    let y = 0;
    for (let i = 0; i < n; i++) {
      const h = (depth / n) * (0.6 + r() * 0.8);
      out.push({ y: y - h / 2, h, dz: (r() - 0.5) * 0.18, i });
      y -= h;
    }
    const scale = depth / -y;
    return out.map((l) => ({ ...l, y: l.y * scale, h: l.h * scale }));
  }, [depth, seed]);
  return (
    <group>
      {layers.map((l) => (
        <mesh
          key={l.i}
          geometry={box}
          material={layerMats[l.i]}
          position={[0, l.y, -4 + l.dz]}
          scale={[width, l.h + 0.002, 8]}
          castShadow
          receiveShadow
        />
      ))}
      {/* lantai galian */}
      <mesh geometry={box} material={floorMat} position={[0, -depth - 0.25, floorDepth / 2]} scale={[width, 0.5, floorDepth]} receiveShadow />
      {/* dinding samping galian */}
      {[1, -1].map((s) => (
        <mesh key={s} geometry={box} material={layerMats[2]} position={[s * (width / 2 + 0.5), -depth / 2, floorDepth / 2]} scale={[1, depth, floorDepth]} receiveShadow castShadow />
      ))}
    </group>
  );
};

const boneMat = new MeshStandardMaterial({
  color: mix(PALETTE.pasir, PALETTE.kabut, 0.4),
  roughness: 0.9,
  metalness: 0,
  bumpMap: noiseBump(41, 128, 8),
  bumpScale: 2,
});
const holeMat = new MeshStandardMaterial({ color: mix(PALETTE.kayu, PALETTE.siluet, 0.5), roughness: 1, metalness: 0 });

/** Tengkorak varanid stilasi (≈0,4 m × scale), menghadap +X. */
export const FossilSkull: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const g = useMemo(() => {
    const cran = new RoundedBoxGeometry(0.18, 0.1, 0.16, 3, 0.04);
    const snout = new RoundedBoxGeometry(0.24, 0.06, 0.11, 3, 0.025);
    const sp = snout.getAttribute('position');
    for (let i = 0; i < sp.count; i++) {
      const u = (sp.getX(i) + 0.12) / 0.24;
      sp.setZ(i, sp.getZ(i) * (1 - u * 0.45));
      sp.setY(i, sp.getY(i) * (1 - u * 0.3));
    }
    snout.computeVertexNormals();
    const jaw = new RoundedBoxGeometry(0.4, 0.03, 0.03, 2, 0.012);
    const orbit = new SphereGeometry(0.032, 10, 8);
    const tooth = new ConeGeometry(0.006, 0.022, 5);
    return { cran, snout, jaw, orbit, tooth };
  }, []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={g.cran} material={boneMat} castShadow />
      <mesh geometry={g.snout} material={boneMat} position={[0.2, -0.01, 0]} castShadow />
      <mesh geometry={g.orbit} material={holeMat} position={[0.07, 0.025, 0.065]} scale={[1.2, 0.9, 0.5]} />
      <mesh geometry={g.orbit} material={holeMat} position={[0.07, 0.025, -0.065]} scale={[1.2, 0.9, 0.5]} />
      <mesh geometry={g.orbit} material={holeMat} position={[0.29, 0.0, 0.025]} scale={[0.35, 0.3, 0.3]} />
      {[1, -1].map((s) => (
        <mesh key={s} geometry={g.jaw} material={boneMat} position={[0.12, -0.075, s * 0.055]} rotation={[0, s * 0.12, -0.06]} castShadow />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} geometry={g.tooth} material={boneMat} position={[0.1 + i * 0.024, -0.05, 0.045 - i * 0.002]} rotation={[Math.PI, 0, 0]} />
      ))}
    </group>
  );
};

/** Tulang lepas (untuk diorama Australia mengering). */
export const Bone: React.FC<{ position: [number, number, number]; length?: number; rotY?: number }> = ({
  position,
  length = 0.8,
  rotY = 0,
}) => (
  <group position={position} rotation={[0, rotY, Math.PI / 2]}>
    <mesh geometry={box} material={boneMat} scale={[0.06, length, 0.06]} castShadow />
    <mesh geometry={box} material={boneMat} position={[0, length / 2, 0]} scale={[0.12, 0.08, 0.12]} />
    <mesh geometry={box} material={boneMat} position={[0, -length / 2, 0]} scale={[0.12, 0.08, 0.12]} />
  </group>
);
