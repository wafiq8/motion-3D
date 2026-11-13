/**
 * S2 (frame 328–568, narasi kalimat 3–4) — Galian fosil Queensland.
 * Kamera dolly menyusuri dinding strata lalu naik & tilt ke tengkorak fosil.
 * Siluet paleontolog berlutut. Rangka fosil 3 m setengah tenggelam di strata + garis ukur 3 m.
 */
import React, { useMemo } from 'react';
import { BoxGeometry, MeshStandardMaterial, Color } from 'three';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { DioramaStage } from '../three/Stage';
import { StrataWall, FossilSkull } from '../models/Fossil';
import { Grass, Terrain, makeHeightFn } from '../models/Terrain';
import { Cloud, SkyDome } from '../models/Scenery';
import { Human } from '../models/Human';
import { MeasureLine } from '../models/Markers';
import { Text3DBlock } from '../three/Text3D';
import { PALETTE, sceneDuration, sceneLocal } from '../styleLock';
import { fade, lerp3 } from '../lib/qc';
import { noiseBump } from '../lib/proceduralTextures';

const DUR = sceneDuration('S2');
const K4 = sceneLocal('S2', 14.28);
const PIT_W = 14;
const PIT_DEPTH = 3;
const PIT_FLOOR = 10;

const height = makeHeightFn({ seed: 8, flatCenter: [0, -10], flatRadius: 22, hillHeight: 18, hillStart: 55 });

const flat0 = () => 0;
const heightLow = (x: number, z: number) => height(x, z) - 0.12;
const TERRAIN_C: [number, number] = [0, -142];

const boneMat = new MeshStandardMaterial({
  color: '#' + new Color(PALETTE.pasir).lerp(new Color(PALETTE.kabut), 0.4).getHexString(),
  roughness: 0.9,
  metalness: 0,
  bumpMap: noiseBump(41, 128, 8),
  bumpScale: 2,
});
const groundMat = new MeshStandardMaterial({ color: PALETTE.sabana, roughness: 0.97, metalness: 0, bumpMap: noiseBump(9, 256, 6), bumpScale: 2 });
const box = new BoxGeometry(1, 1, 1);

/** Rangka fosil 3 m (tengkorak + ruas tulang belakang + rusuk) setengah tenggelam di muka strata. */
const FossilSkeleton: React.FC<{ y: number }> = ({ y }) => {
  const verts = useMemo(() => {
    const out: { x: number; s: number }[] = [];
    for (let x = 1.55; x > -1.0; x -= 0.07) {
      const u = (1.55 - x) / 2.55;
      const s = u < 0.45 ? 1 : 1 - (u - 0.45) * 1.55;
      out.push({ x, s: Math.max(0.18, s) });
    }
    return out;
  }, []);
  return (
    <group position={[0, y, 0]}>
      <FossilSkull position={[1.62, 0.02, 0.02]} rotation={[0.2, 0, 0.05]} scale={1.6} />
      {verts.map((v, i) => (
        <mesh key={i} geometry={box} material={boneMat} position={[v.x, Math.sin(v.x * 1.6) * 0.06, 0]} scale={[0.05, 0.07 * v.s, 0.08 * v.s]} castShadow />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`r${i}`} geometry={box} material={boneMat} position={[1.25 - i * 0.075, -0.12, 0.02]} rotation={[0, 0, 0.35]} scale={[0.02, 0.24, 0.03]} castShadow />
      ))}
      {[1.15, 0.45].map((x) => (
        <mesh key={`l${x}`} geometry={box} material={boneMat} position={[x, -0.2, 0.03]} rotation={[0, 0, -0.6]} scale={[0.035, 0.3, 0.04]} castShadow />
      ))}
    </group>
  );
};

type Key = { f: number; pos: [number, number, number]; tgt: [number, number, number] };
const KEYS: Key[] = [
  { f: 0, pos: [-6.2, -0.7, 6.2], tgt: [-4.0, -1.2, 0] },
  { f: 125, pos: [-2.0, -0.85, 6.4], tgt: [-0.6, -1.5, 0] },
  { f: DUR - 1, pos: [1.2, 0.7, 8.2], tgt: [0.5, -1.85, 0] },
];
const camAt = (f: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && f > KEYS[i + 1].f) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f))));
  return { position: lerp3(a.pos, b.pos, t), target: lerp3(a.tgt, b.tgt, t) };
};

export const Scene2Fossil: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pose = camAt(frame);

  const goldOp = fade(frame, 6, 18, K4 - 12, K4 - 2);
  const creditOp = fade(frame, 22, 34, K4 - 12, K4 - 2);
  const idOp = fade(frame, K4 + 2, K4 + 14);
  const grow = interpolate(frame, [K4 + 18, K4 + 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const skelY = -2.15;
  return (
    <DioramaStage pose={pose} shadowFocus={[0, -1, 0]}>
      <SkyDome />
      <group position={[0, -0.12, 0]}>
        <Terrain height={height} size={260} segments={180} center={TERRAIN_C} seed={12} />
      </group>
      <Grass height={heightLow} t={t} count={7000} area={{ xMin: -30, xMax: 30, zMin: -45, zMax: -12.5 }} seed={31} />
      <Grass height={flat0} t={t} count={4000} area={{ xMin: -30, xMax: 30, zMin: -12, zMax: -0.4 }} seed={33} maxH={0.55} />
      {[-1, 1].map((s) => (
        <Grass key={s} height={flat0} t={t} count={1500} area={{ xMin: s > 0 ? PIT_W / 2 + 1.1 : -24, xMax: s > 0 ? 24 : -PIT_W / 2 - 1.1, zMin: 0, zMax: 16 }} seed={40 + s} maxH={0.5} />
      ))}
      <group>
        <StrataWall width={PIT_W} depth={PIT_DEPTH} floorDepth={PIT_FLOOR} />
        {/* permukaan di sekeliling galian */}
        <mesh geometry={box} material={groundMat} position={[-(PIT_W / 2 + 1 + 15), -0.25, 4]} scale={[30, 0.5, 36]} receiveShadow />
        <mesh geometry={box} material={groundMat} position={[PIT_W / 2 + 1 + 15, -0.25, 4]} scale={[30, 0.5, 36]} receiveShadow />
        <mesh geometry={box} material={groundMat} position={[0, -0.25, PIT_FLOOR + 8]} scale={[PIT_W + 2, 0.5, 16]} receiveShadow />
        <mesh geometry={box} material={groundMat} position={[0, -0.25, -20]} scale={[80, 0.5, 16]} receiveShadow />
      </group>
      <group position={[-0.6, 0, 0]}>
        <FossilSkeleton y={skelY} />
      </group>
      {/* patok & tali grid galian */}
      {[-2.0, 2.4].map((x) => (
        <mesh key={x} geometry={box} material={groundMat} position={[x, -PIT_DEPTH + 0.3, 0.6]} scale={[0.04, 0.6, 0.04]} castShadow />
      ))}
      <mesh geometry={box} material={boneMat} position={[0.2, -PIT_DEPTH + 0.55, 0.6]} scale={[4.4, 0.012, 0.012]} />
      <Human variant="paleontolog" position={[-2.3, -PIT_DEPTH, 0.95]} rotationY={1.0} t={t} />
      {CLOUDS.map((c) => (
        <Cloud key={c.seed} seed={c.seed} position={c.p} scale={c.s} />
      ))}

      {/* Angka emas & kredit — menempel di depan dinding strata */}
      <Text3DBlock
        variant="gold"
        lines={[{ words: [{ text: '3,8–4' }], size: 1 }, { words: [{ text: 'JUTA' }, { text: 'TAHUN' }], size: 0.55 }]}
        position={[-2.8, -0.55, 0.35]}
        rotation={[0, 0.15, 0]}
        size={0.62}
        opacity={goldOp}
      />
      <Text3DBlock
        lines={[
          { words: [{ text: 'HOCKNULL' }, { text: '·' }, { text: 'QUEENSLAND' }, { text: 'MUSEUM' }] },
          { words: [{ text: 'PLoS', accent: true }, { text: 'ONE', accent: true }, { text: '2009', accent: true }] },
        ]}
        position={[-2.6, -1.75, 0.3]}
        rotation={[0, 0.15, 0]}
        size={0.17}
        opacity={creditOp}
      />
      <Text3DBlock
        lines={[{ words: [{ text: 'IDENTIK', accent: true }], size: 1.3 }, { words: [{ text: '3' }, { text: 'METER' }, { text: '·' }, { text: '70+' }, { text: 'KG' }] }]}
        position={[0.25, 0.5, 0.3]}
        size={0.36}
        opacity={idOp}
      />
      <MeasureLine start={[-1.6, skelY + 0.55, 0.2]} length={3} label="3 M" grow={grow} opacity={idOp} labelSize={0.2} />
    </DioramaStage>
  );
};

const CLOUDS: { p: [number, number, number]; s: number; seed: number }[] = [
  { p: [-25, 30, -120], s: 8, seed: 21 },
  { p: [14, 38, -150], s: 10, seed: 22 },
  { p: [38, 26, -110], s: 7, seed: 23 },
  { p: [-4, 46, -180], s: 12, seed: 24 },
];
