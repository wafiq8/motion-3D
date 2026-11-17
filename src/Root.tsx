import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import timeline from '../docs/timeline.json';

export const FPS = 30;
export const TOTAL_FRAMES = Math.round(timeline.total_duration_s * FPS);

export const RemotionRoot: React.FC = () => (
  <Composition id="Arlindo" component={Video} durationInFrames={TOTAL_FRAMES}
    fps={FPS} width={1080} height={1920} />
);
