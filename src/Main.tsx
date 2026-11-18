import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {TL, FPS, sceneOf} from './timeline';
import {SCENES} from './scenes/scenes';
import {CameraRig} from './kit/world';
import {Captions} from './overlay/Captions';
import {loadFonts} from './overlay/fonts';

const BOUNDS = TL.scenes.slice(1).map((s) => s.start_s);
const FADE = 0.1;

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { loadFonts().then(() => { setReady(true); continueRender(handle); }); }, [handle]);

  const scene = SCENES[sceneOf(t).id - 1];
  const cam = scene.cam(t);
  // fade-to-black ±0.1 s around every scene boundary, and final fade
  let black = 0;
  BOUNDS.forEach((b) => { black = Math.max(black, 1 - Math.abs(t - b) / FADE); });
  black = Math.max(black, Math.min(1, Math.max(0, (t - (TL.total_duration_s - 0.7)) / 0.6)));
  const World = scene.World, Overlay = scene.Overlay;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{filter: scene.grade}}>
        <ThreeCanvas width={1080} height={1920} shadows camera={{fov: 40, near: 0.1, far: 900, position: [0, 5, 10]}}
          gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping}}>
          <CameraRig cam={cam} />
          <World t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      {ready && (
        <AbsoluteFill>
          <Overlay t={t} />
          <Captions t={t} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{backgroundColor: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};
