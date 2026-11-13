/**
 * Penanda 3D: garis ukur (dengan ujung tick + label), pin lokasi, alas diorama (plinth kayu).
 */
import React from 'react';
import { BoxGeometry, ConeGeometry, CylinderGeometry, MeshStandardMaterial, SphereGeometry } from 'three';
import { MATERIAL, PALETTE, TYPE_COLORS } from '../styleLock';
import { Text3DBlock, useGoldEnv } from '../three/Text3D';
import { noiseBump } from '../lib/proceduralTextures';

const box = new BoxGeometry(1, 1, 1);
const lineMat = (opacity: number) =>
  new MeshStandardMaterial({
    color: TYPE_COLORS.utama,
    emissive: TYPE_COLORS.utama,
    emissiveIntensity: 0.5,
    roughness: 0.9,
    metalness: 0,
    transparent: opacity < 1,
    opacity,
    fog: false,
  });

/** Garis ukur horizontal sepanjang `length` (meter) dimulai dari `start`, sepanjang +X. */
export const MeasureLine: React.FC<{
  start: [number, number, number];
  length: number;
  label: string;
  opacity?: number;
  /** 0..1 progres garis "tumbuh". */
  grow?: number;
  labelSize?: number;
  rotationY?: number;
}> = ({ start, length, label, opacity = 1, grow = 1, labelSize = 0.45, rotationY = 0 }) => {
  if (opacity <= 0.001) return null;
  const m = lineMat(opacity);
  const L = length * Math.max(0.001, grow);
  return (
    <group position={start} rotation={[0, rotationY, 0]}>
      <mesh geometry={box} material={m} position={[L / 2, 0, 0]} scale={[L, 0.04, 0.04]} />
      <mesh geometry={box} material={m} position={[0, 0, 0]} scale={[0.04, 0.32, 0.04]} />
      {grow > 0.98 ? <mesh geometry={box} material={m} position={[L, 0, 0]} scale={[0.04, 0.32, 0.04]} /> : null}
      {grow > 0.98 ? (
        <Text3DBlock lines={[{ words: [{ text: label, accent: true }] }]} position={[L / 2, labelSize * 0.9, 0]} size={labelSize} opacity={opacity} />
      ) : null}
    </group>
  );
};

const pinHead = new SphereGeometry(0.5, 20, 14);
const pinCone = new ConeGeometry(0.28, 1.4, 16);
export const Pin: React.FC<{ position: [number, number, number]; scale?: number }> = ({ position, scale = 1 }) => {
  const env = useGoldEnv();
  const gold = React.useMemo(() => {
    const m = new MeshStandardMaterial({
      color: MATERIAL.gold.color,
      metalness: MATERIAL.gold.metalness,
      roughness: MATERIAL.gold.roughness,
      emissive: PALETTE.emas,
      emissiveIntensity: 0.15,
    });
    m.envMap = env;
    m.envMapIntensity = 1.6;
    return m;
  }, [env]);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={pinCone} material={gold} position={[0, 0.7, 0]} rotation={[Math.PI, 0, 0]} castShadow />
      <mesh geometry={pinHead} material={gold} position={[0, 1.55, 0]} castShadow />
    </group>
  );
};

const plinthMat = new MeshStandardMaterial({
  color: PALETTE.kayu,
  roughness: 0.9,
  metalness: 0,
  bumpMap: noiseBump(55, 128, 10),
  bumpScale: 2,
});
const plinthGeo = new CylinderGeometry(1, 1.04, 1, 48);
/** Alas diorama kayu (silinder). Puncak di y=0. */
export const Plinth: React.FC<{ position: [number, number, number]; radius: number; height?: number }> = ({
  position,
  radius,
  height = 0.6,
}) => (
  <mesh geometry={plinthGeo} material={plinthMat} position={[position[0], position[1] - height / 2, position[2]]} scale={[radius, height, radius]} castShadow receiveShadow />
);

export const PinStick: React.FC<{ from: [number, number, number]; height: number }> = ({ from, height }) => (
  <mesh geometry={new CylinderGeometry(0.03, 0.03, 1, 6)} material={lineMat(1)} position={[from[0], from[1] + height / 2, from[2]]} scale={[1, height, 1]} />
);
