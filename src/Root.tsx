import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {TL} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition id="Main" component={Main} width={1080} height={1920} fps={30}
    durationInFrames={Math.round(TL.total_duration_s * 30)} />
);
