import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {FPS, TOTAL_FRAMES} from './lib/time';
import {EP} from "./lib/episode";

export const Root: React.FC = () => (
  <>
    <Composition id={EP.comp} component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{withAudio: false}} />
  </>
);
