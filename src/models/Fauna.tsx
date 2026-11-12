/**
 * Fauna latar stilasi dari primitif: Thylacoleo, Diprotodon, Quinkana, rusa timor.
 * Satu komponen Quadruped berparameter — siluet latar sederhana.
 * (Megalania & biawak pasir = komponen Komodo yang diskala, lihat Komodo.tsx.)
 */
import React, { useMemo } from 'react';
import { CapsuleGeometry, Color, CylinderGeometry, MeshStandardMaterial, SphereGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { DERIVED, PALETTE } from '../styleLock';

type Spec = {
  bodyLen: number;
  bodyR: number;
  bodyH: number; // tinggi pusat badan
  legLen: number;
  legR: number;
  neck: [number, number]; // panjang, sudut naik (rad)
  head: [number, number, number];
  tail: [number, number]; // panjang, radius
  color: string;
  antlers?: boolean;
  bodyScale?: [number, number, number];
};

const mix = (a: string, b: string, t: number) => '#' + new Color(a).lerp(new Color(b), t).getHexString();

export const SPECIES: Record<'thylacoleo' | 'diprotodon' | 'quinkana' | 'rusa', Spec> = {
  thylacoleo: {
    bodyLen: 1.0, bodyR: 0.26, bodyH: 0.72, legLen: 0.6, legR: 0.07,
    neck: [0.22, 0.35], head: [0.32, 0.24, 0.24], tail: [0.75, 0.06],
    color: mix(PALETTE.kayu, PALETTE.sabana, 0.25),
  },
  diprotodon: {
    bodyLen: 1.9, bodyR: 0.7, bodyH: 1.15, legLen: 0.65, legR: 0.17,
    neck: [0.2, 0.1], head: [0.7, 0.5, 0.45], tail: [0.1, 0.05],
    color: mix(PALETTE.kayu, PALETTE.komodo, 0.4), bodyScale: [1, 0.85, 0.95],
  },
  quinkana: {
    bodyLen: 1.5, bodyR: 0.24, bodyH: 0.55, legLen: 0.5, legR: 0.07,
    neck: [0.15, 0.0], head: [0.7, 0.16, 0.2], tail: [1.6, 0.17],
    color: mix(PALETTE.komodo, DERIVED.daunLontar, 0.3),
  },
  rusa: {
    bodyLen: 0.9, bodyR: 0.22, bodyH: 0.95, legLen: 0.9, legR: 0.04,
    neck: [0.5, 0.95], head: [0.3, 0.14, 0.13], tail: [0.12, 0.04],
    color: mix(PALETTE.kayu, PALETTE.sabana, 0.35), antlers: true,
  },
};

const geo = {
  capsule: new CapsuleGeometry(1, 1, 4, 12),
  cyl: new CylinderGeometry(1, 0.8, 1, 8),
  head: new RoundedBoxGeometry(1, 1, 1, 3, 0.2),
  sphere: new SphereGeometry(1, 12, 8),
};
const matCache = new Map<string, MeshStandardMaterial>();
const matFor = (c: string) => {
  if (!matCache.has(c)) matCache.set(c, new MeshStandardMaterial({ color: c, roughness: 0.93, metalness: 0 }));
  return matCache.get(c)!;
};

export const Quadruped: React.FC<{
  species: keyof typeof SPECIES;
  position: [number, number, number];
  rotationY?: number;
  t?: number;
  speed?: number;
  scale?: number;
  grazing?: boolean;
}> = ({ species, position, rotationY = 0, t = 0, speed = 0, scale = 1, grazing = false }) => {
  const s = SPECIES[species];
  const m = useMemo(() => matFor(s.color), [s.color]);
  const cyc = (t * speed) / (s.legLen * 1.1) + position[0];
  const swing = speed > 0 ? 0.45 : 0.04;
  const legs: [number, number, number][] = [
    [s.bodyLen * 0.42, 1, 0],
    [s.bodyLen * 0.42, -1, 0.5],
    [-s.bodyLen * 0.42, 1, 0.5],
    [-s.bodyLen * 0.42, -1, 0],
  ];
  const bs = s.bodyScale ?? [1, 1, 1];
  const neckAng = grazing ? -0.7 + Math.sin(t * 1.2) * 0.1 : s.neck[1];
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* badan: kapsul sumbu X */}
      <mesh
        geometry={geo.capsule}
        material={m}
        position={[0, s.bodyH, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[s.bodyR * bs[1], s.bodyLen / 2, s.bodyR * bs[2]]}
        castShadow
      />
      {legs.map(([x, side, ph], i) => {
        const a = Math.sin((cyc + ph) * Math.PI * 2) * swing;
        return (
          <group key={i} position={[x, s.bodyH - s.bodyR * 0.3, side * s.bodyR * 0.62]} rotation={[0, 0, a]}>
            <mesh
              geometry={geo.cyl}
              material={m}
              position={[0, -(s.bodyH - s.bodyR * 0.3) / 2, 0]}
              scale={[s.legR, s.bodyH - s.bodyR * 0.3, s.legR]}
              castShadow
            />
          </group>
        );
      })}
      {/* leher + kepala */}
      <group position={[s.bodyLen * 0.55 + s.bodyR * 0.5, s.bodyH + s.bodyR * 0.25, 0]} rotation={[0, 0, neckAng]}>
        <mesh geometry={geo.cyl} material={m} position={[s.neck[0] / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[s.bodyR * 0.45, s.neck[0] + 0.05, s.bodyR * 0.45]} castShadow />
        <group position={[s.neck[0], 0, 0]} rotation={[0, 0, -neckAng - (grazing ? 0.4 : 0.1)]}>
          <mesh geometry={geo.head} material={m} position={[s.head[0] / 2, 0, 0]} scale={s.head} castShadow />
          {s.antlers ? (
            <>
              {[1, -1].map((side) => (
                <group key={side} position={[0.02, s.head[1] / 2, side * 0.05]} rotation={[side * 0.35, 0, 0.35]}>
                  <mesh geometry={geo.cyl} material={m} position={[0, 0.22, 0]} scale={[0.015, 0.45, 0.015]} />
                  <mesh geometry={geo.cyl} material={m} position={[0.07, 0.2, 0]} rotation={[0, 0, -0.8]} scale={[0.012, 0.18, 0.012]} />
                  <mesh geometry={geo.cyl} material={m} position={[-0.04, 0.4, 0]} rotation={[0, 0, 0.6]} scale={[0.012, 0.14, 0.012]} />
                </group>
              ))}
            </>
          ) : null}
        </group>
      </group>
      {/* ekor */}
      <group position={[-s.bodyLen * 0.5 - s.bodyR * 0.6, s.bodyH, 0]} rotation={[0, Math.sin(t * 2) * 0.15, 0]}>
        <mesh
          geometry={geo.cyl}
          material={m}
          position={[-s.tail[0] / 2, -s.tail[0] * 0.12, 0]}
          rotation={[0, 0, Math.PI / 2 - 0.25]}
          scale={[s.tail[1], s.tail[0], s.tail[1]]}
          castShadow
        />
      </group>
    </group>
  );
};
