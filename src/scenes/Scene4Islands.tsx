/**
 * S4 (frame 786–1122, narasi kalimat 6) — Diorama pulau timbul Sahul–Timor–Flores.
 * Laut surut (permukaan laut turun), Komodo berenang dari Timor ke Flores,
 * kamera dolly udara mengikuti pada tinggi 12 m.
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { DioramaStage } from '../three/Stage';
import { Komodo, komodoCenter } from '../models/Komodo';
import { Terrain } from '../models/Terrain';
import { Sea } from '../models/Sea';
import { Cloud, Lontar, SavannaTree, SkyDome } from '../models/Scenery';
import { Pin } from '../models/Markers';
import { Text3DBlock } from '../three/Text3D';
import { createSimplex2D, fbm } from '../lib/noise';
import { sceneDuration } from '../styleLock';
import { assertKomodoDistance, fade } from '../lib/qc';

const DUR = sceneDuration('S4');
const n = createSimplex2D(77);

type Isl = { c: [number, number]; r: [number, number]; rot: number; h: number };
const ISLANDS: Record<'sahul' | 'timor' | 'flores', Isl> = {
  sahul: { c: [9, -25], r: [15, 7], rot: 0.05, h: 4.2 },
  timor: { c: [4.5, -1.5], r: [6.5, 2.3], rot: 0.2, h: 2.4 },
  flores: { c: [-14.5, -2.5], r: [7.5, 2.4], rot: -0.12, h: 2.8 },
};
const islandH = (x: number, z: number) => {
  let best = -2.2;
  for (const k of Object.values(ISLANDS)) {
    const dx = x - k.c[0];
    const dz = z - k.c[1];
    const cs = Math.cos(k.rot);
    const sn = Math.sin(k.rot);
    const u = (dx * cs - dz * sn) / k.r[0];
    const v = (dx * sn + dz * cs) / k.r[1];
    const d = Math.sqrt(u * u + v * v) + fbm(n, x * 0.06, z * 0.06, 3) * 0.18;
    const prof = Math.max(0, 1 - d);
    const y = -2.2 + (k.h + 2.2) * Math.pow(prof, 0.6) + fbm(n, x * 0.3 + 9, z * 0.3, 3) * 0.35 * prof;
    best = Math.max(best, y);
  }
  return best;
};
const TERRAIN_C: [number, number] = [5, -20];

const KSPEED = 0.7;
const kStart: [number, number] = [-1.2, 0.7];
const kDir: [number, number] = [-0.995, -0.1];

export const Scene4Islands: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const seaLevel = interpolate(frame, [0, 70], [0.9, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const kx = kStart[0] + kDir[0] * KSPEED * t;
  const kz = kStart[1] + kDir[1] * KSPEED * t;
  const komodoPos: [number, number, number] = [kx, seaLevel - 0.24, kz];
  const kc = komodoCenter(komodoPos);

  const p = frame / (DUR - 1);
  // Dolly udara mengikuti Komodo dari belakang-atas (tinggi 12 m), pan dari Sahul/Timor ke Flores.
  const pan = interpolate(p, [0, 1], [2, -2.5], { easing: Easing.inOut(Easing.sin) });
  const position: [number, number, number] = [kx - 0.6, 12, kz + 13];
  const target: [number, number, number] = [kx + pan, 0, kz - 8];
  assertKomodoDistance('S4', frame, position, [kc]);

  const labelOp = fade(frame, 8, 22);
  const goldOp = fade(frame, 120, 134);
  const floresOp = fade(frame, 150, 164);
  const pinOp = fade(frame, 225, 240);
  const so = ISLANDS.flores.c;

  return (
    <DioramaStage pose={{ position, target }} shadowFocus={[kx - 6, 0, kz - 6]}>
      <SkyDome />
      <Terrain height={islandH} size={220} segments={260} center={TERRAIN_C} seed={78} island />
      <Sea t={t} level={seaLevel} size={420} segments={180} center={TERRAIN_C} amplitude={0.07} />
      <Komodo t={t} speed={KSPEED * 1.3} position={komodoPos} rotationY={Math.PI - 0.1} tongue={false} />
      {TREES.map((tr, i) =>
        i % 2 ? (
          <Lontar key={i} position={[tr[0], islandH(tr[0], tr[1]) - 0.05, tr[1]]} height={11} seed={i + 20} t={t} scale={tr[2] / 11} />
        ) : (
          <SavannaTree key={i} position={[tr[0], islandH(tr[0], tr[1]) - 0.05, tr[1]]} height={7} seed={i} scale={tr[2] / 7} />
        ),
      )}
      {CLOUDS.map((c) => (
        <Cloud key={c.seed} seed={c.seed} position={c.p} scale={c.s} />
      ))}

      <Text3DBlock
        variant="gold"
        lines={[{ words: [{ text: '900' }, { text: 'RIBU' }], size: 1 }, { words: [{ text: 'TAHUN' }, { text: 'LALU' }], size: 0.62 }]}
        position={[-5, 4.5, -16]}
        rotation={[-0.35, 0.05, 0]}
        size={1.7}
        opacity={goldOp}
      />
      <Text3DBlock lines={[{ words: [{ text: 'SAHUL', accent: true }] }]} position={[2.5, 3.6, -23]} rotation={[-0.3, -0.05, 0]} size={2} opacity={labelOp} />
      <Text3DBlock lines={[{ words: [{ text: 'TIMOR' }] }]} position={[1.4, 2.9, -0.2]} rotation={[-0.35, -0.05, 0]} size={0.95} opacity={labelOp} />
      <Text3DBlock lines={[{ words: [{ text: 'FLORES' }] }]} position={[-13, 4.0, -3.5]} rotation={[-0.35, 0.1, 0]} size={1.15} opacity={floresOp} />
      {pinOp > 0.01 ? (
        <>
          <Pin position={[so[0] + 1.5, islandH(so[0] + 1.5, so[1] - 0.5), so[1] - 0.5]} scale={0.7} />
          <Text3DBlock
            lines={[{ words: [{ text: 'FOSIL' }, { text: "SO'A", accent: true }] }, { words: [{ text: 'MATA' }, { text: 'MENGE', accent: true }] }]}
            position={[so[0] + 1.5, 7.6, so[1] - 1.5]}
            rotation={[-0.35, 0.1, 0]}
            size={0.6}
            opacity={pinOp}
          />
        </>
      ) : null}
    </DioramaStage>
  );
};

const TREES: [number, number, number][] = [
  [1.5, -2.2, 2.2], [7.5, -2.8, 1.8], [9.5, -2, 2.4], [-16, -2.5, 2.2], [-12, -3.2, 1.9], [-19, -2, 2.3], [-13.5, -1.6, 1.7],
  [2, -24, 3], [9, -27, 3.4], [15, -23, 3], [6, -20, 2.8],
];
const CLOUDS: { p: [number, number, number]; s: number; seed: number }[] = [
  { p: [130, 34, -20], s: 11, seed: 41 },
  { p: [-120, 32, 10], s: 10, seed: 42 },
  { p: [0, 40, -130], s: 12, seed: 43 },
  { p: [-90, 26, -60], s: 8, seed: 44 },
  { p: [100, 28, 60], s: 9, seed: 45 },
];
