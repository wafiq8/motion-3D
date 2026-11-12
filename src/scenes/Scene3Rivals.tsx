/**
 * S3 (frame 568–786, narasi kalimat 5) — Sabana purba Australia.
 * Pan lebar + pull-back 14 m -> 20 m dari Komodo. Komodo 3 m vs Megalania 6 m (komponen Komodo yang sama,
 * diskala & lebih kekar). Latar: Thylacoleo, Diprotodon, Quinkana.
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { DioramaStage } from '../three/Stage';
import { Komodo, komodoCenter } from '../models/Komodo';
import { Quadruped } from '../models/Fauna';
import { Grass, Terrain, makeHeightFn } from '../models/Terrain';
import { Cloud, Rock, SavannaTree, SkyDome } from '../models/Scenery';
import { MeasureLine } from '../models/Markers';
import { Text3DBlock } from '../three/Text3D';
import { sceneDuration } from '../styleLock';
import { assertKomodoDistance, fade } from '../lib/qc';

const DUR = sceneDuration('S3');
const height = makeHeightFn({ seed: 21, flatCenter: [0, -2], flatRadius: 16, hillHeight: 22, hillStart: 50 });
const SPEED = 0.32;
const CLEAR: [number, number, number, number][] = [
  [0.5, 3.6, 3.5, 2.0],
  [0, -3, 5.5, 2.4],
];

export const Scene3Rivals: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const kx = -1.2 + SPEED * t;
  const komodoPos: [number, number, number] = [kx, height(kx, 3.2), 3.2];
  const mx = -2.6 + SPEED * t;
  const megaPos: [number, number, number] = [mx, height(mx, -3), -3];
  const kc = komodoCenter(komodoPos);

  const p = Easing.inOut(Easing.sin)(frame / (DUR - 1));
  const d = interpolate(p, [0, 1], [14, 20]);
  const theta = interpolate(p, [0, 1], [0.5, -0.12]); // pan lebar mengitari subjek
  const camY = interpolate(p, [0, 1], [3.2, 4.4]);
  const dy = camY - kc.y;
  const horiz = Math.sqrt(d * d - dy * dy);
  const position: [number, number, number] = [kc.x + horiz * Math.sin(theta), camY, kc.z + horiz * Math.cos(theta)];
  const target: [number, number, number] = [kc.x - 0.4, 2.6, -3];
  assertKomodoDistance('S3', frame, position, [kc, komodoCenter(megaPos, 6)]);

  const lineOp = fade(frame, 14, 26);
  const g1 = interpolate(frame, [18, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const g2 = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hlOp = fade(frame, 92, 106);

  return (
    <DioramaStage pose={{ position, target }} shadowFocus={[kx, 0, -3]}>
      <SkyDome />
      <Terrain height={height} seed={22} />
      <Grass height={height} t={t} count={13000} clearings={CLEAR} area={{ xMin: -30, xMax: 30, zMin: -55, zMax: 20 }} seed={51} />
      <Komodo t={t} speed={SPEED} position={komodoPos} />
      <Komodo t={t} speed={SPEED} position={megaPos} length={6} bulk={1.3} phase={0.3} />
      <MeasureLine start={[kx - 1.75, komodoPos[1] + 0.06, 4.6]} length={3} label="3 M" grow={g1} opacity={lineOp} labelSize={0.42} />
      <MeasureLine start={[mx - 3.5, megaPos[1] + 2.4, -3]} length={6} label="5–7 M" grow={g2} opacity={lineOp} labelSize={0.55} />

      <Quadruped species="thylacoleo" position={[-5, height(-5, -13), -13]} rotationY={0.4} t={t} speed={0.5} />
      <Quadruped species="diprotodon" position={[5.5, height(5.5, -19), -19]} rotationY={2.6} t={t} speed={0.25} />
      <Quadruped species="diprotodon" position={[8.5, height(8.5, -23), -23]} rotationY={2.4} t={t} grazing scale={0.85} />
      <Quadruped species="quinkana" position={[-1.5, height(-1.5, -26), -26]} rotationY={-0.3} t={t} speed={0.3} />

      {TREES.map((tr, i) => (
        <SavannaTree key={i} position={[tr[0], height(tr[0], tr[1]), tr[1]]} height={tr[2]} seed={i} />
      ))}
      <Rock position={[3.5, height(3.5, 4), 4]} scale={[0.6, 0.4, 0.5]} />
      <Rock position={[-6, height(-6, -1), -1]} scale={[1.1, 0.6, 0.9]} rotY={1} />
      {CLOUDS.map((c) => (
        <Cloud key={c.seed} seed={c.seed} position={c.p} scale={c.s} />
      ))}
      <Text3DBlock
        lines={[
          { words: [{ text: 'BUKAN' }, { text: 'KARENA' }, { text: 'PULAU' }], size: 0.8 },
          { words: [{ text: 'KARENA' }, { text: 'KOMPETISI', accent: true }] },
        ]}
        position={[-0.5, 7.4, -7]}
        rotation={[0, 0.05, 0]}
        size={0.95}
        opacity={hlOp}
      />
    </DioramaStage>
  );
};

const TREES: [number, number, number][] = [
  [-11, -20, 7],
  [12, -30, 8],
  [-16, -42, 9],
  [3, -48, 7.5],
  [19, -15, 6.5],
  [-24, -12, 7],
];
const CLOUDS: { p: [number, number, number]; s: number; seed: number }[] = [
  { p: [-28, 32, -140], s: 9, seed: 31 },
  { p: [20, 42, -165], s: 11, seed: 32 },
  { p: [-2, 52, -200], s: 13, seed: 33 },
  { p: [42, 28, -115], s: 7, seed: 34 },
];
