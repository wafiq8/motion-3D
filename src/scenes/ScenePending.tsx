/**
 * Placeholder 3D untuk S2–S7 (BELUM dibangun — menunggu persetujuan test render S1).
 * Tetap 3D native (tidak ada overlay 2D).
 */
import React from 'react';
import { DioramaStage } from '../three/Stage';
import { SkyDome } from '../models/Scenery';
import { Text3DBlock } from '../three/Text3D';

export const ScenePending: React.FC<{ id: string }> = ({ id }) => (
  <DioramaStage pose={{ position: [0, 2, 12], target: [0, 2, 0] }}>
    <SkyDome />
    <Text3DBlock
      lines={[{ words: [{ text: id, accent: true }] }, { words: [{ text: 'MENUNGGU' }, { text: 'REVIEW' }], size: 0.6 }]}
      position={[0, 2, 0]}
      size={1}
    />
  </DioramaStage>
);
