/**
 * Manusia = SATU komponen figur primitif siluet gelap (#1F150C), kecil, tanpa wajah.
 * 3 varian properti: paleontolog, perwira 1910 (dilihat dari belakang), ranger.
 */
import React, { useMemo } from 'react';
import { CapsuleGeometry, ConeGeometry, CylinderGeometry, MeshStandardMaterial, SphereGeometry } from 'three';
import { PALETTE } from '../styleLock';

export type HumanVariant = 'paleontolog' | 'perwira1910' | 'ranger';

const mat = new MeshStandardMaterial({ color: PALETTE.siluet, roughness: 0.95, metalness: 0 });

const G = {
  limb: new CapsuleGeometry(1, 1, 4, 8),
  head: new SphereGeometry(0.11, 14, 10),
  torso: new CapsuleGeometry(0.17, 0.42, 4, 10),
  disc: new CylinderGeometry(1, 1, 1, 18),
  cone: new ConeGeometry(1, 1, 14, 1, true),
  rod: new CylinderGeometry(1, 1, 1, 6),
};

/** Segmen anggota badan dari pivot (atas) ke bawah sepanjang len, rot = [x,z] radian. */
const Limb: React.FC<{ at: [number, number, number]; len: number; r: number; rot: [number, number] }> = ({
  at,
  len,
  r,
  rot,
}) => (
  <group position={at} rotation={[rot[0], 0, rot[1]]}>
    <mesh geometry={G.limb} material={mat} position={[0, -len / 2, 0]} scale={[r, len / 2, r]} castShadow />
  </group>
);

export const Human: React.FC<{
  variant: HumanVariant;
  position: [number, number, number];
  rotationY?: number;
  /** Waktu (detik) untuk gerak kecil (napas / menyikat). */
  t?: number;
  scale?: number;
}> = ({ variant, position, rotationY = 0, t = 0, scale = 1 }) => {
  const kneel = variant === 'paleontolog';
  const breathe = Math.sin(t * 2) * 0.01;
  const brush = Math.sin(t * 6) * 0.25;
  const hipY = kneel ? 0.5 : 0.92;
  const torsoTilt = kneel ? 0.45 : 0;
  const shoulderY = 0.5;

  const parts = useMemo(() => variant, [variant]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Kaki */}
      {kneel ? (
        <>
          <Limb at={[0, hipY, 0.11]} len={0.46} r={0.075} rot={[0, 1.45]} />
          <Limb at={[0.44, 0.05, 0.11]} len={0.45} r={0.07} rot={[0, -1.55]} />
          <Limb at={[0, hipY, -0.11]} len={0.5} r={0.075} rot={[0, 0.05]} />
        </>
      ) : (
        <>
          <Limb at={[0, hipY, 0.1]} len={0.88} r={0.075} rot={[0, 0.02]} />
          <Limb at={[0, hipY, -0.1]} len={0.88} r={0.075} rot={[0, -0.02]} />
        </>
      )}
      {/* Badan + kepala */}
      <group position={[0, hipY, 0]} rotation={[0, 0, -torsoTilt]}>
        <mesh geometry={G.torso} material={mat} position={[0, 0.32 + breathe, 0]} scale={[1, 1, 1.25]} castShadow />
        <mesh geometry={G.head} material={mat} position={[0, 0.83 + breathe, 0]} castShadow />
        {/* Lengan */}
        {parts === 'paleontolog' ? (
          <>
            <Limb at={[0, shoulderY, 0.22]} len={0.62} r={0.055} rot={[0, -1.2 + brush]} />
            <Limb at={[0, shoulderY, -0.22]} len={0.6} r={0.055} rot={[0, -0.6]} />
            {/* kuas */}
            <mesh geometry={G.rod} material={mat} position={[0.62, shoulderY - 0.2 + brush * 0.2, 0.22]} rotation={[0, 0, 0.6]} scale={[0.015, 0.25, 0.015]} />
          </>
        ) : parts === 'ranger' ? (
          <>
            <Limb at={[0, shoulderY, 0.22]} len={0.62} r={0.055} rot={[-0.08, -0.35]} />
            <Limb at={[0, shoulderY, -0.22]} len={0.62} r={0.055} rot={[0.08, 0.05]} />
            {/* tongkat bercabang ranger */}
            <group position={[0.38, -0.92, 0.32]}>
              <mesh geometry={G.rod} material={mat} position={[0, 0.95, 0]} scale={[0.018, 1.9, 0.018]} castShadow />
              <mesh geometry={G.rod} material={mat} position={[0.05, 1.98, 0]} rotation={[0, 0, -0.45]} scale={[0.014, 0.22, 0.014]} />
              <mesh geometry={G.rod} material={mat} position={[-0.05, 1.98, 0]} rotation={[0, 0, 0.45]} scale={[0.014, 0.22, 0.014]} />
            </group>
          </>
        ) : (
          <>
            <Limb at={[0, shoulderY, 0.22]} len={0.64} r={0.06} rot={[-0.05, 0.03]} />
            <Limb at={[0, shoulderY, -0.22]} len={0.64} r={0.06} rot={[0.05, -0.03]} />
            {/* senapan disandang di punggung (diagonal) */}
            <mesh geometry={G.rod} material={mat} position={[-0.2, 0.35, 0]} rotation={[0.7, 0, 0]} scale={[0.02, 1.15, 0.02]} castShadow />
          </>
        )}
        {/* Topi / properti kepala */}
        {parts === 'perwira1910' ? (
          <>
            <mesh geometry={G.disc} material={mat} position={[0, 0.95, 0]} scale={[0.115, 0.12, 0.115]} />
            <mesh geometry={G.disc} material={mat} position={[0.07, 0.9, 0]} scale={[0.08, 0.012, 0.11]} />
          </>
        ) : (
          <>
            <mesh geometry={G.disc} material={mat} position={[0, 0.9, 0]} scale={[0.22, 0.012, 0.22]} castShadow />
            <mesh geometry={G.disc} material={mat} position={[0, 0.95, 0]} scale={[0.1, 0.09, 0.1]} />
          </>
        )}
        {parts === 'perwira1910' ? (
          // jas panjang berbentuk kerucut sampai lutut
          <mesh geometry={G.cone} material={mat} position={[0, 0.05, 0]} scale={[0.34, 0.95, 0.3]} castShadow />
        ) : null}
        {parts === 'ranger' ? (
          // ransel
          <mesh geometry={G.torso} material={mat} position={[-0.17, 0.38, 0]} scale={[0.75, 0.55, 0.9]} castShadow />
        ) : null}
      </group>
    </group>
  );
};
