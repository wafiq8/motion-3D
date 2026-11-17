import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Stage} from './three/Stage';
import {Overlay} from './overlay/Overlay';
import {setAlbedo, setHeights} from './lib/geo';
import {camSpeed} from './lib/camera';
import {clamp} from './lib/anim';

const FONTS: [string, string, string][] = [
  ['Playfair Display', 'fonts/playfair-display-latin-800-normal.woff2', '800'],
  ['Inter', 'fonts/inter-latin-600-normal.woff2', '600'],
  ['Inter', 'fonts/inter-latin-700-normal.woff2', '700'],
  ['Inter', 'fonts/inter-latin-800-normal.woff2', '800'],
];

const useAssets = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('assets'));
  useEffect(() => {
    Promise.all([
      ...FONTS.map(([fam, url, w]) => new FontFace(fam, `url(${staticFile(url)}) format('woff2')`, {weight: w}).load()
        .then((f) => { document.fonts.add(f); })),
      (async () => { const img = new Image(); img.src = staticFile('map/albedo.jpg'); await img.decode(); setAlbedo(img); })(),
      fetch(staticFile('map/height.bin')).then((r) => r.arrayBuffer()).then((b) => setHeights(new Int16Array(b))),
    ]).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};

export const Video: React.FC = () => {
  const ready = useAssets();
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  if (!ready) return null;
  // blur gerak saat zoom ngebut antarwilayah (turunan dari kecepatan kamera)
  const blur = clamp((camSpeed(frame / fps) - 0.025) * 55, 0, 3.5);
  return (
    <AbsoluteFill style={{backgroundColor: '#2a4763'}}>
      <AbsoluteFill style={{filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true, preserveDrawingBuffer: true}}>
          <Stage />
        </ThreeCanvas>
      </AbsoluteFill>
      <Overlay />
      <Audio src={staticFile('narasi.mp3')} />
    </AbsoluteFill>
  );
};
