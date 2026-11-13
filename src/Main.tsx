import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FPS, SCENES, TOTAL_S, ramp, sceneStart} from './lib/time';
import {FontGate} from './overlay/fonts';
import {StagePill} from './overlay/StagePill';
import {Karaoke} from './overlay/Karaoke';
import {DelayedTitle, BigClosing} from './overlay/Title';
import {Scene1} from './scenes/Scene1';
import {Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Scene6} from './scenes/Scene6';

const SCENE_COMPS: Record<number, React.FC<{t: number}>> = {1: Scene1, 2: Scene2, 3: Scene3, 4: Scene4, 5: Scene5, 6: Scene6};
const PHRASES = [
  [{text: 'Hidup Sehat Diawali'}, {text: 'dari Usus yang Sehat', key: ['usus', 'sehat']}],
  [{text: 'Rawat dari Dalam —'}, {text: 'Jangan Sampai Terlambat.', key: ['terlambat']}],
];
const T_CARD = 43.15;

export const Main: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sc = SCENES.find((s) => t >= s.start_s && t < s.end_s) ?? SCENES[SCENES.length - 1];
  const Comp = SCENE_COMPS[sc.id] ?? SCENE_COMPS[1];
  const fadeBlack = ramp(t, TOTAL_S - 0.5, TOTAL_S - 0.03);
  return (
    <AbsoluteFill style={{background: '#120824'}}>
      {withAudio && <Audio src={staticFile('narasi.mp3')} />}
      <FontGate>
        <Comp t={t} />
        <StagePill n={sc.id} t={t} t0={sc.start_s} />
        <DelayedTitle t={t} t0={sceneStart(2)} t1={sceneStart(2) + 3.5} />
        <BigClosing t={t} sId={6} phrases={PHRASES} tCard={T_CARD} top={400} />
        <Karaoke t={t} />
      </FontGate>
      <AbsoluteFill style={{background: '#000', opacity: fadeBlack}} />
    </AbsoluteFill>
  );
};
