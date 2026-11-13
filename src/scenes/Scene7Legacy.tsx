/**
 * S7 (frame 1310–1800, narasi kalimat 9 + kartu penutup sampai 60 dtk).
 *  A) Siluet perwira 1910 dari belakang di punggung bukit, memandang Komodo di lembah (≥ 8 m).
 *     "1910 · VAN STEYN VAN HENSBROEK" lalu "1912 · OUWENS · DESKRIPSI RESMI".
 *  B) Hard cut ke diorama modern senja: ranger siluet, rusa timor, Komodo, lontar, laut.
 *     Dolly-out 11 m -> 19 m. Kartu penutup 3D.
 */
import React from 'react';
import { Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { DioramaStage } from '../three/Stage';
import { Komodo, komodoCenter } from '../models/Komodo';
import { Human } from '../models/Human';
import { Quadruped } from '../models/Fauna';
import { Grass, Terrain, makeHeightFn } from '../models/Terrain';
import { Cloud, Lontar, Rock, SkyDome } from '../models/Scenery';
import { Sea } from '../models/Sea';
import { Text3DBlock } from '../three/Text3D';
import { sceneDuration, sceneLocal } from '../styleLock';
import { assertKomodoDistance, fade } from '../lib/qc';

const DUR = sceneDuration('S7');
/** Hard cut A->B tepat setelah kalimat 9 selesai (47,83 dtk) + jeda. */
const CUT = sceneLocal('S7', 48.0);

/* ---------- A: perwira 1910 ---------- */
const hA0 = makeHeightFn({ seed: 71, flatCenter: [0, -12], flatRadius: 12, hillHeight: 20, hillStart: 40 });
const hA = (x: number, z: number) => {
  // punggung bukit di depan (z>0) naik — perwira berdiri di atasnya, lembah di depannya
  const base = hA0(x, z);
  const ridge = Math.max(0, Math.min(1, (z - 0) / 6)) * 2.2;
  return base + ridge;
};
const CLEAR_A: [number, number, number, number][] = [[-1.5, -8, 3.5, 2]];

const ShotOfficer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const officer: [number, number, number] = [0.9, hA(0.9, 6.5), 6.5];
  const kPos: [number, number, number] = [-2.5 + 0.2 * t, hA(-2.5, -8), -8];
  const kc = komodoCenter(kPos);
  const p = Easing.inOut(Easing.sin)(frame / Math.max(1, CUT - 1));
  const position: [number, number, number] = [interpolate(p, [0, 1], [1.9, 1.3]), officer[1] + 1.9, interpolate(p, [0, 1], [12.6, 11.4])];
  const target: [number, number, number] = [-0.6, officer[1] - 0.2, -6];
  assertKomodoDistance('S7A', frame, position, [kc]);
  const k2 = Math.round(CUT * 0.5);
  return (
    <DioramaStage pose={{ position, target }} shadowFocus={[0, 0, 0]}>
      <SkyDome />
      <Terrain height={hA} seed={72} />
      <Grass height={hA} t={t} count={12000} clearings={CLEAR_A} area={{ xMin: -22, xMax: 22, zMin: -40, zMax: 12 }} seed={73} />
      <Human variant="perwira1910" position={officer} rotationY={Math.PI / 2 + 0.1} t={t} />
      <Komodo t={t} speed={0.2} position={kPos} />
      <Lontar position={[-10, hA(-10, -16), -16]} height={12} seed={41} t={t} />
      <Lontar position={[5, hA(5, -22), -22]} height={13} seed={42} t={t} />
      <Rock position={[2.2, hA(2.2, 5.5), 5.5]} scale={[0.6, 0.4, 0.5]} />
      <Cloud seed={81} position={[-20, 30, -120]} scale={9} />
      <Cloud seed={82} position={[18, 38, -150]} scale={11} />
      <Text3DBlock
        variant="gold"
        lines={[{ words: [{ text: '1910' }] }]}
        position={[-0.5, 6.6, -6]}
        size={1.1}
        opacity={fade(frame, 2, 10, k2 - 6, k2)}
      />
      <Text3DBlock
        lines={[{ words: [{ text: 'VAN' }, { text: 'STEYN' }] }, { words: [{ text: 'VAN' }, { text: 'HENSBROEK', accent: true }] }]}
        position={[-0.5, 4.7, -6]}
        size={0.55}
        opacity={fade(frame, 6, 14, k2 - 6, k2)}
      />
      <Text3DBlock variant="gold" lines={[{ words: [{ text: '1912' }] }]} position={[-0.5, 6.6, -6]} size={1.1} opacity={fade(frame, k2 + 1, k2 + 8)} />
      <Text3DBlock
        lines={[{ words: [{ text: 'OUWENS', accent: true }] }, { words: [{ text: 'DESKRIPSI' }, { text: 'RESMI' }], size: 0.85 }]}
        position={[-0.5, 4.7, -6]}
        size={0.55}
        opacity={fade(frame, k2 + 4, k2 + 12)}
      />
    </DioramaStage>
  );
};

/* ---------- B: diorama modern senja + kartu penutup ---------- */
const hB0 = makeHeightFn({ seed: 74, flatCenter: [0, 0], flatRadius: 12, hillHeight: 18, hillStart: 45 });
const hB = (x: number, z: number) => hB0(x, z) - (z < -50 ? Math.min(6, (-50 - z) * 0.4) : 0);
const CLEAR_B: [number, number, number, number][] = [[0, 0, 3.6, 1.8]];
const SEA_C: [number, number] = [0, -220];

const ShotModern: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dur = DUR - CUT;
  const kPos: [number, number, number] = [-1.2 + 0.15 * t, hB(-1.2, 0), 0];
  const kc = komodoCenter(kPos);
  const p = Easing.inOut(Easing.sin)(Math.min(1, frame / (dur * 0.85)));
  const d = interpolate(p, [0, 1], [11, 19]);
  const camY = interpolate(p, [0, 1], [3, 4.6]);
  const dy = camY - kc.y;
  const horiz = Math.sqrt(d * d - dy * dy);
  const th = interpolate(p, [0, 1], [0.12, 0.2]);
  const position: [number, number, number] = [kc.x + horiz * Math.sin(th), camY, kc.z + horiz * Math.cos(th)];
  const target: [number, number, number] = [kc.x + 0.3, interpolate(p, [0, 1], [2.6, 4.2]), -6];
  assertKomodoDistance('S7B', frame + CUT, position, [kc]);
  const c1 = 100;
  return (
    <DioramaStage pose={{ position, target }} shadowFocus={[0, 0, -3]}>
      <SkyDome />
      <Terrain height={hB} seed={75} />
      <Sea t={t} level={-1.0} size={500} segments={70} center={SEA_C} amplitude={0.15} />
      <Grass height={hB} t={t} count={13000} clearings={CLEAR_B} area={{ xMin: -28, xMax: 28, zMin: -50, zMax: 18 }} seed={76} />
      <Komodo t={t} speed={0.15} position={kPos} />
      <Human variant="ranger" position={[4.2, hB(4.2, -1.5), -1.5]} rotationY={Math.PI - 0.2} t={t} />
      <Quadruped species="rusa" position={[-6.5, hB(-6.5, -9), -9]} rotationY={0.3} t={t} grazing />
      <Quadruped species="rusa" position={[-9, hB(-9, -12), -12]} rotationY={0.9} t={t + 1.3} />
      <Quadruped species="rusa" position={[8, hB(8, -16), -16]} rotationY={2.8} t={t + 0.6} grazing />
      {LONTAR.map((l, i) => (
        <Lontar key={i} position={[l[0], hB(l[0], l[1]) - 0.2, l[1]]} height={l[2]} seed={i + 50} t={t} />
      ))}
      <Rock position={[2.5, hB(2.5, 2.5), 2.5]} scale={[0.5, 0.3, 0.4]} />
      {CLOUDS.map((c) => (
        <Cloud key={c.seed} seed={c.seed} position={c.p} scale={c.s} />
      ))}
      <Text3DBlock
        lines={[
          { words: [{ text: 'NAGA' }, { text: 'PURBA' }, { text: 'AUSTRALIA,' }] },
          { words: [{ text: 'MASIH' }, { text: 'HIDUP' }, { text: 'DI' }, { text: 'NTT', accent: true }], size: 1.12 },
        ]}
        position={[0.3, 9.0, -8]}
        size={0.72}
        opacity={fade(frame, c1, c1 + 14)}
      />
      <Text3DBlock
        lines={[{ words: [{ text: 'Sejarah' }, { text: 'Alam' }, { text: '3D', accent: true }, { text: '–' }, { text: 'Part' }, { text: '1' }] }]}
        position={[0.3, 7.15, -8]}
        size={0.55}
        opacity={fade(frame, c1 + 35, c1 + 49)}
      />
      <Text3DBlock
        lines={[
          { words: [{ text: 'Lihat' }, { text: 'langsung' }, { text: 'di' }, { text: 'habitat' }, { text: 'aslinya' }, { text: '–' }] },
          { words: [{ text: 'open' }, { text: 'trip' }, { text: 'Labuan', accent: true }, { text: 'Bajo', accent: true }, { text: 'bersama' }] },
          { words: [{ text: 'Basa', accent: true }, { text: 'Basi', accent: true }, { text: 'Trip.', accent: true }] },
        ]}
        position={[0.3, 5.55, -8]}
        size={0.42}
        opacity={fade(frame, c1 + 75, c1 + 90)}
      />
    </DioramaStage>
  );
};

export const Scene7Legacy: React.FC = () => (
  <>
    <Sequence durationInFrames={CUT} name="S7A 1910" layout="none">
      <ShotOfficer />
    </Sequence>
    <Sequence from={CUT} durationInFrames={DUR - CUT} name="S7B Penutup" layout="none">
      <ShotModern />
    </Sequence>
  </>
);

const LONTAR: [number, number, number][] = [
  [-7, -10, 11.5], [9, -14, 12.5], [-3, -24, 12], [14, -30, 13], [-14, -32, 12.5], [4, -40, 13.5],
];
const CLOUDS: { p: [number, number, number]; s: number; seed: number }[] = [
  { p: [-30, 34, -150], s: 9, seed: 91 },
  { p: [18, 44, -170], s: 11, seed: 92 },
  { p: [-6, 56, -210], s: 13, seed: 93 },
  { p: [40, 30, -120], s: 7, seed: 94 },
];
