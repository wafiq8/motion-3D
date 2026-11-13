/**
 * S5 (frame 1122–1229, narasi kalimat 7) — DNA 3D bercahaya dua warna menyatu di atas
 * diorama mini Australia (kiri) dan NTT (kanan). Kamera zoom-in (dolly) 10 m -> 6 m.
 */
import React from 'react';
import { CylinderGeometry, MeshStandardMaterial, Color } from 'three';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { DioramaStage } from '../three/Stage';
import { DNAHelix } from '../models/DNA';
import { Plinth } from '../models/Markers';
import { Grass, Terrain, makeHeightFn } from '../models/Terrain';
import { Cloud, Lontar, SavannaTree, SkyDome, Rock } from '../models/Scenery';
import { Text3DBlock } from '../three/Text3D';
import { DERIVED, PALETTE, sceneDuration } from '../styleLock';
import { fade } from '../lib/qc';

const DUR = sceneDuration('S5');
const height = makeHeightFn({ seed: 55, flatCenter: [0, 0], flatRadius: 14, hillHeight: 16, hillStart: 40 });
const PL = 1.35; // jari-jari plinth
const PH = 1.1; // tinggi plinth
const AUS: [number, number, number] = [-1.55, PH, 0.4];
const NTT: [number, number, number] = [1.55, PH, 0.4];
const DNA_POS: [number, number, number] = [0, 2.3, 0.2];

const mix = (a: string, b: string, t: number) => '#' + new Color(a).lerp(new Color(b), t).getHexString();
const diskGeo = new CylinderGeometry(1, 1, 1, 40);
const ausMat = new MeshStandardMaterial({ color: mix(PALETTE.sabana, PALETTE.senja, 0.35), roughness: 0.95, metalness: 0 });
const nttLand = new MeshStandardMaterial({ color: mix(PALETTE.sabana, DERIVED.daunLontar, 0.35), roughness: 0.95, metalness: 0 });
const nttSea = new MeshStandardMaterial({ color: PALETTE.laut, roughness: 0.85, metalness: 0 });

const MiniAustralia: React.FC = () => (
  <group position={AUS}>
    <mesh geometry={diskGeo} material={ausMat} position={[0, 0.04, 0]} scale={[PL * 0.97, 0.08, PL * 0.97]} receiveShadow />
    <Rock position={[-0.5, 0.1, -0.3]} scale={[0.35, 0.22, 0.3]} />
    <Rock position={[0.45, 0.1, 0.35]} scale={[0.25, 0.16, 0.22]} rotY={1} />
    <SavannaTree position={[0.2, 0.08, -0.5]} height={7} scale={0.09} seed={3} />
    <SavannaTree position={[-0.3, 0.08, 0.5]} height={7} scale={0.08} seed={5} />
  </group>
);
const MiniNTT: React.FC = () => (
  <group position={NTT}>
    <mesh geometry={diskGeo} material={nttSea} position={[0, 0.03, 0]} scale={[PL * 0.97, 0.06, PL * 0.97]} receiveShadow />
    <mesh geometry={diskGeo} material={nttLand} position={[0.1, 0.09, -0.1]} scale={[0.8, 0.12, 0.55]} receiveShadow castShadow />
    <mesh geometry={diskGeo} material={nttLand} position={[-0.75, 0.08, 0.5]} scale={[0.3, 0.1, 0.22]} receiveShadow />
    <Lontar position={[0.3, 0.15, -0.2]} height={11} scale={0.06} seed={4} />
    <Lontar position={[-0.2, 0.15, 0.05]} height={11} scale={0.05} seed={6} />
  </group>
);

export const Scene5DNA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = Easing.inOut(Easing.sin)(frame / (DUR - 1));
  const d = interpolate(p, [0, 1], [10, 6]);
  const tgt: [number, number, number] = [0, interpolate(p, [0, 1], [3.3, 4.0]), DNA_POS[2]];
  const position: [number, number, number] = [0.9 * (d / 10), tgt[1] - 0.3, DNA_POS[2] + d];
  const grow = interpolate(frame, [0, 55], [0.3, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const titleOp = fade(frame, 4, 16);
  const lblOp = fade(frame, 2, 12);
  return (
    <DioramaStage pose={{ position, target: tgt }} shadowFocus={[0, 1, 0]}>
      <SkyDome />
      <Terrain height={height} seed={56} />
      <Grass height={height} t={t} count={6000} area={{ xMin: -14, xMax: 14, zMin: -30, zMax: 6 }} clearings={CLEAR} seed={57} />
      <Plinth position={[AUS[0], PH, AUS[2]]} radius={PL} height={PH + 0.3} />
      <Plinth position={[NTT[0], PH, NTT[2]]} radius={PL} height={PH + 0.3} />
      <MiniAustralia />
      <MiniNTT />
      <DNAHelix position={DNA_POS} t={t} leftFrom={[AUS[0], PH + 0.1, AUS[2]]} rightFrom={[NTT[0], PH + 0.1, NTT[2]]} height={3.2} radius={0.5} turns={2.2} grow={grow} />
      <Text3DBlock
        lines={[{ words: [{ text: 'HIBRIDISASI', accent: true }] }, { words: [{ text: 'GENOMIK' }, { text: '2021' }], size: 0.8 }]}
        position={[0, 6.35, -0.6]}
        size={0.4}
        opacity={titleOp}
      />
      <Text3DBlock lines={[{ words: [{ text: 'V.' }, { text: 'GOULDII', accent: true }] }]} position={[-0.95, 1.55, 1.75]} size={0.17} opacity={lblOp} />
      <Text3DBlock lines={[{ words: [{ text: 'V.' }, { text: 'SPENCERI', accent: true }] }]} position={[0.95, 1.55, 1.75]} size={0.17} opacity={lblOp} />
      {CLOUDS.map((c) => (
        <Cloud key={c.seed} seed={c.seed} position={c.p} scale={c.s} />
      ))}
    </DioramaStage>
  );
};

const CLEAR: [number, number, number, number][] = [[0, 0.4, 4, 2.2]];
const CLOUDS: { p: [number, number, number]; s: number; seed: number }[] = [
  { p: [-20, 26, -90], s: 8, seed: 51 },
  { p: [16, 34, -120], s: 10, seed: 52 },
  { p: [2, 44, -160], s: 12, seed: 53 },
];
