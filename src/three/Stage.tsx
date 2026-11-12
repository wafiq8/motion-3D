/**
 * Panggung diorama standar: ThreeCanvas 9:16 native + rig cahaya/fog/tone mapping dari styleLock.
 * Semua scene WAJIB memakai komponen ini.
 */
import React, { useLayoutEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, Object3D, PCFShadowMap, PerspectiveCamera, Vector3 } from 'three';
import { useVideoConfig } from 'remotion';
import { LIGHT, RENDER } from '../styleLock';

export type CameraPose = { position: [number, number, number]; target: [number, number, number] };

/** Pasang pose kamera tiap frame (kamera = satu-satunya sumber gerak shot). */
const CameraRig: React.FC<{ pose: CameraPose }> = ({ pose }) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pose.position);
    camera.lookAt(new Vector3(...pose.target));
    camera.updateMatrixWorld();
  }, [camera, pose.position[0], pose.position[1], pose.position[2], pose.target[0], pose.target[1], pose.target[2]]);
  return null;
};

const StyleLights: React.FC<{ focus: [number, number, number] }> = ({ focus }) => {
  const target = useMemo(() => new Object3D(), []);
  const dir = new Vector3(...LIGHT.sun.direction).normalize().multiplyScalar(LIGHT.sun.distance);
  const s = LIGHT.sun;
  return (
    <>
      <hemisphereLight args={[LIGHT.hemisphere.sky, LIGHT.hemisphere.ground, LIGHT.hemisphere.intensity]} />
      <primitive object={target} position={focus} />
      <directionalLight
        color={s.color}
        intensity={s.intensity}
        position={[focus[0] + dir.x, focus[1] + dir.y, focus[2] + dir.z]}
        target={target}
        castShadow
        shadow-mapSize-width={s.shadowMapSize}
        shadow-mapSize-height={s.shadowMapSize}
        shadow-radius={s.shadowRadius}
        shadow-bias={s.shadowBias}
        shadow-normalBias={s.shadowNormalBias}
        shadow-camera-left={-s.shadowArea}
        shadow-camera-right={s.shadowArea}
        shadow-camera-top={s.shadowArea}
        shadow-camera-bottom={-s.shadowArea}
        shadow-camera-near={1}
        shadow-camera-far={s.distance * 2.2}
      />
    </>
  );
};

export const DioramaStage: React.FC<{
  pose: CameraPose;
  /** Titik fokus bayangan matahari (biasanya subjek). */
  shadowFocus?: [number, number, number];
  outdoor?: boolean;
  children: React.ReactNode;
}> = ({ pose, shadowFocus = [0, 0, 0], outdoor = true, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows={{ type: PCFShadowMap }}
      camera={{ fov: RENDER.fov, near: 0.1, far: 1500, position: pose.position }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: RENDER.exposure }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = RENDER.exposure;
      }}
      style={{ backgroundColor: RENDER.fog.color }}
    >
      <color attach="background" args={[RENDER.fog.color]} />
      {outdoor ? <fog attach="fog" args={[RENDER.fog.color, RENDER.fog.near, RENDER.fog.far]} /> : null}
      <StyleLights focus={shadowFocus} />
      <CameraRig pose={pose} />
      {children}
    </ThreeCanvas>
  );
};
