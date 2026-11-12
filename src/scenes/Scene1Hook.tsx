/**
 * S1 (frame 0–210) — Hook sabana NTT golden hour.
 * Kamera: dolly-in 18 m -> 11 m dari Komodo, tinggi 3 m (parallax nyata terhadap rumput,
 * batu, lontar, bukit, awan, dan kartu judul 3D yang berada di kedalaman berbeda).
 * Teks (3D, di dalam scene): "KOMODO LAHIR DI AUSTRALIA?" lalu sorot "BUKAN GIGANTISME PULAU".
 */
import React, { useMemo } from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { DioramaStage, CameraPose } from '../three/Stage';
import { Komodo, komodoCenter } from '../models/Komodo';
import { Grass, Terrain, makeHeightFn } from '../models/Terrain';
import { Cloud, Lontar, Rock, SkyDome } from '../models/Scenery';
import { Text3DBlock, TextLine } from '../three/Text3D';
import { RULES } from '../styleLock';

export const S1_DURATION = 210;

const KOMODO_SPEED = 0.25; // m/s
const KOMODO_X0 = -1.0;
const CAM_HEIGHT = 3;

const height = makeHeightFn({ seed: 3, flatCenter: [0, 0], flatRadius: 10, hillHeight: 28, hillStart: 40 });

export const s1Komodo = (f: number, fps: number) => {
  const t = f / fps;
  const x = KOMODO_X0 + KOMODO_SPEED * t;
  return { t, pos: [x, height(x, 0), 0] as [number, number, number] };
};

/** Pose kamera S1 — dihitung dari jarak 3D sebenarnya ke Komodo. */
export const s1Camera = (f: number, fps: number): { pose: CameraPose; distance: number } => {
  const { pos } = s1Komodo(f, fps);
  const c = komodoCenter(pos);
  const d = interpolate(f, [0, S1_DURATION - 1], [18, 11], {
    easing: Easing.bezier(0.35, 0.05, 0.45, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const theta = interpolate(f, [0, S1_DURATION - 1], [0.34, 0.16]);
  const dy = CAM_HEIGHT - c.y;
  const horiz = Math.sqrt(d * d - dy * dy);
  const position: [number, number, number] = [c.x + horiz * Math.sin(theta), CAM_HEIGHT, c.z + horiz * Math.cos(theta)];
  const target: [number, number, number] = [c.x + 0.4, 2.35, -3];
  const distance = Math.hypot(position[0] - c.x, position[1] - c.y, position[2] - c.z);
  return { pose: { position, target }, distance };
};

const TITLE: TextLine[] = [
  { words: [{ text: 'KOMODO' }, { text: 'LAHIR' }, { text: 'DI' }] },
  { words: [{ text: 'AUSTRALIA?', accent: true }], size: 1.18 },
];
const HIGHLIGHT: TextLine[] = [
  { words: [{ text: 'BUKAN', accent: true }], size: 1.25 },
  { words: [{ text: 'GIGANTISME' }, { text: 'PULAU' }] },
];

const fade = (f: number, a: number, b: number, c: number, d: number) =>
  interpolate(f, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const TREES: { p: [number, number]; h: number; seed: number }[] = [
  { p: [-7.5, -16], h: 12.5, seed: 1 },
  { p: [9.5, -24], h: 14, seed: 2 },
  { p: [-2.5, -38], h: 13, seed: 3 },
  { p: [15, -46], h: 12, seed: 4 },
  { p: [-13, -52], h: 14.5, seed: 5 },
  { p: [4.5, -66], h: 13.5, seed: 6 },
  { p: [-24, -30], h: 12, seed: 7 },
  { p: [22, -70], h: 13, seed: 8 },
  { p: [-6, -88], h: 14, seed: 9 },
];

const ROCKS: { p: [number, number]; s: [number, number, number]; r: number }[] = [
  { p: [3.2, -2.6], s: [0.55, 0.35, 0.45], r: 0.4 },
  { p: [-3.4, 1.9], s: [0.4, 0.25, 0.35], r: 1.2 },
  { p: [5.5, -8], s: [1.3, 0.8, 1.0], r: 2.1 },
  { p: [-5.2, -5.5], s: [0.9, 0.55, 0.7], r: 0.8 },
  { p: [6.5, 5.5], s: [0.5, 0.3, 0.4], r: 2.6 },
];

const CLOUDS: { p: [number, number, number]; s: number; seed: number }[] = [
  { p: [-30, 34, -150], s: 9, seed: 11 },
  { p: [18, 44, -170], s: 11, seed: 12 },
  { p: [-6, 56, -210], s: 13, seed: 13 },
  { p: [40, 30, -120], s: 7, seed: 14 },
  { p: [-48, 50, -190], s: 10, seed: 15 },
  { p: [6, 26, -105], s: 6, seed: 16 },
];

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { t, pos } = s1Komodo(frame, fps);
  const { pose, distance } = s1Camera(frame, fps);
  if (distance < RULES.minKomodoCameraDistance) {
    throw new Error(`QC: kamera terlalu dekat ke Komodo (${distance.toFixed(2)} m) di frame ${frame}`);
  }

  const titleOpacity = fade(frame, 10, 24, 98, 108);
  const hlOpacity = fade(frame, 114, 126, 400, 401);

  const clearings = useMemo<[number, number, number, number][]>(() => [[0.0, 0, 3.4, 1.7]], []);

  return (
    <DioramaStage pose={pose} shadowFocus={[pos[0], 0, -2]}>
      <SkyDome />
      <Terrain height={height} />
      <Grass height={height} t={t} count={16000} clearings={clearings} area={{ xMin: -26, xMax: 30, zMin: -62, zMax: 17 }} />
      <Komodo t={t} speed={KOMODO_SPEED} position={pos} />
      {TREES.map((tr) => (
        <Lontar key={tr.seed} position={[tr.p[0], height(tr.p[0], tr.p[1]) - 0.2, tr.p[1]]} height={tr.h} seed={tr.seed} t={t} />
      ))}
      {ROCKS.map((r, i) => (
        <Rock key={i} position={[r.p[0], height(r.p[0], r.p[1]) + r.s[1] * 0.25, r.p[1]]} scale={r.s} rotY={r.r} />
      ))}
      {CLOUDS.map((c) => (
        <Cloud key={c.seed} seed={c.seed} position={c.p} scale={c.s} />
      ))}
      {/* Kartu judul 3D — berdiri di kedalaman di belakang Komodo (z = -4), punya volume & parallax */}
      <Text3DBlock lines={TITLE} position={[0.6, 6.3, -4]} rotation={[0, 0.12, 0]} size={0.8} opacity={titleOpacity} />
      <Text3DBlock lines={HIGHLIGHT} position={[0.9, 6.2, -4]} rotation={[0, 0.1, 0]} size={0.7} opacity={hlOpacity} />
    </DioramaStage>
  );
};
