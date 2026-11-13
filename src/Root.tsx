import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {FPS, TOTAL_FRAMES} from './lib/time';

export const Root: React.FC = () => (
  <>
    <Composition id="PerjalananNutrisi" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{withAudio: false}} />
  </>
);
