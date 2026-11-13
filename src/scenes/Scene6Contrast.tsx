/**
 * S6 (frame 1229–1310, narasi kalimat 8) — Kontras dua diorama, hard cut di tengah:
 *  A) Australia mengering — kamera dolly MUNDUR. Angka emas "50 RIBU TAHUN LALU" + "PUNAH DI AUSTRALIA".
 *  B) NTT hijau-keemasan — kamera dolly MAJU. "SELAMAT DI NTT".
 */
import React from 'react';
import { Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { DioramaStage } from '../three/Stage';
import { Komodo, komodoCenter } from '../models/Komodo';
import { Quadruped } from '../models/Fauna';
import { Bone } from '../models/Fossil';
import { Grass, Terrain, makeHeightFn } from '../models/Terrain';
import { Cloud, Lontar, Rock, SavannaTree, SkyDome } from '../models/Scenery';
import { Sea } from '../models/Sea';
import { Text3DBlock } from '../three/Text3D';
import { DERIVED, PALETTE, sceneDuration } from '../styleLock';
import { assertKomodoDistance, fade } from '../lib/qc';

const DUR = sceneDuration('S6');
const CUT = Math.round(DUR / 2);

const hA = makeHeightFn({ seed: 61, flatCenter: [0, 0], flatRadius: 14, hillHeight: 14, hillStart: 45 });
const hB = makeHeightFn({ seed: 62, flatCenter: [0, 0], flatRadius: 12, hillHeight: 20, hillStart: 42 });
const hB2 = (x: number, z: number) => hB(x, z) - (z < -45 ? Math.min(6, (-45 - z) * 0.4) : 0);
const CLEAR_A: [number, number, number, number][] = [[0, 0, 6, 4]];
const CLEAR_B: [number, number, number, number][] = [[0.5, -1, 3.5, 1.8]];

const ShotAustralia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = Easing.out(Easing.quad)(frame / (CUT - 1));
  const d = interpolate(p, [0, 1], [9, 14]);
  const position: [number, number, number] = [1.2, 2.6 + p * 0.8, d];
  const target: [number, number, number] = [0, 2.6, -4];
  return (
    <DioramaStage pose={{ position, target }} shadowFocus={[0, 0, -3]}>
      <SkyDome />
      <Terrain height={hA} seed={63} tint={DERIVED.tanahGelap} tintAmount={0.55} />
      <Grass height={hA} t={t} count={3500} clearings={CLEAR_A} area={{ xMin: -25, xMax: 25, zMin: -50, zMax: 12 }} seed={64} maxH={0.4} tint={PALETTE.kayu} tintAmount={0.6} />
      <SavannaTree position={[-3.5, hA(-3.5, -5), -5]} height={6} dry seed={2} />
      <SavannaTree position={[4.5, hA(4.5, -11), -11]} height={7} dry seed={3} />
      <SavannaTree position={[-8, hA(-8, -18), -18]} height={6.5} dry seed={4} />
      {/* tulang megafauna (Diprotodon) */}
      {BONES.map((b, i) => (
        <Bone key={i} position={[b[0], hA(b[0], b[1]) + 0.05, b[1]]} length={b[2]} rotY={b[3]} />
      ))}
      <Quadruped species="thylacoleo" position={[6, hA(6, -24), -24]} rotationY={2.8} t={t} grazing />
      <Rock position={[1.8, hA(1.8, -1), -1]} scale={[0.6, 0.35, 0.5]} />
      <Cloud seed={71} position={[-18, 28, -110]} scale={9} />
      <Cloud seed={72} position={[20, 36, -140]} scale={11} />
      <Text3DBlock
        variant="gold"
        lines={[{ words: [{ text: '50' }, { text: 'RIBU' }] }, { words: [{ text: 'TAHUN' }, { text: 'LALU' }], size: 0.6 }]}
        position={[0, 5.6, -6]}
        size={1.2}
        opacity={fade(frame, 0, 6)}
      />
      <Text3DBlock
        lines={[{ words: [{ text: 'PUNAH', accent: true }, { text: 'DI' }, { text: 'AUSTRALIA' }] }]}
        position={[0, 3.25, -6]}
        size={0.62}
        opacity={fade(frame, 8, 14)}
      />
    </DioramaStage>
  );
};

const ShotNTT: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const kPos: [number, number, number] = [-0.6 + 0.25 * t, hB2(-0.6, -1), -1];
  const kc = komodoCenter(kPos);
  const p = Easing.out(Easing.quad)(frame / (DUR - CUT - 1));
  const d = interpolate(p, [0, 1], [15, 11.5]);
  const position: [number, number, number] = [kc.x + 1.5, 3, kc.z + d];
  const target: [number, number, number] = [kc.x, 2.6, -5];
  assertKomodoDistance('S6', frame + CUT, position, [kc]);
  return (
    <DioramaStage pose={{ position, target }} shadowFocus={[0, 0, -3]}>
      <SkyDome />
      <Terrain height={hB2} seed={65} tint={DERIVED.daunLontar} tintAmount={0.38} />
      <Sea t={t} level={-1.2} size={400} segments={60} center={[0, -200]} amplitude={0.15} />
      <Grass height={hB2} t={t} count={11000} clearings={CLEAR_B} area={{ xMin: -25, xMax: 25, zMin: -45, zMax: 14 }} seed={66} tint={DERIVED.daunLontar} tintAmount={0.45} />
      <Komodo t={t} speed={0.25} position={kPos} />
      {LONTAR.map((l, i) => (
        <Lontar key={i} position={[l[0], hB2(l[0], l[1]) - 0.2, l[1]]} height={l[2]} seed={i + 30} t={t} />
      ))}
      <Quadruped species="rusa" position={[5.5, hB2(5.5, -12), -12]} rotationY={2.6} t={t} grazing />
      <Cloud seed={73} position={[-16, 30, -120]} scale={9} />
      <Cloud seed={74} position={[22, 38, -150]} scale={11} />
      <Text3DBlock
        lines={[{ words: [{ text: 'SELAMAT', accent: true }] }, { words: [{ text: 'DI' }, { text: 'NTT' }], size: 0.9 }]}
        position={[0.6, 5.6, -6]}
        size={1.05}
        opacity={fade(frame, 0, 5)}
      />
    </DioramaStage>
  );
};

export const Scene6Contrast: React.FC = () => (
  <>
    <Sequence durationInFrames={CUT} name="S6A Australia" layout="none">
      <ShotAustralia />
    </Sequence>
    <Sequence from={CUT} durationInFrames={DUR - CUT} name="S6B NTT" layout="none">
      <ShotNTT />
    </Sequence>
  </>
);

const BONES: [number, number, number, number][] = [
  [-1.2, -2, 0.9, 0.3], [-0.6, -2.4, 0.7, 1.2], [0.4, -1.8, 1.1, -0.4], [-0.2, -3, 0.6, 2.2], [1.2, -2.8, 0.8, 0.9],
];
const LONTAR: [number, number, number][] = [
  [-6, -9, 11], [7, -15, 12.5], [-2.5, -26, 12], [12, -32, 13], [-12, -34, 12],
];
