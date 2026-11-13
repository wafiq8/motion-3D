import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useVideoConfig} from 'remotion';
import {C} from '../lib/style';
import {Cam, applyCam} from '../lib/project';
import {seeded, V3} from '../lib/time';

const CamSync: React.FC<{cam: Cam}> = ({cam}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  applyCam(camera, cam);
  return null;
};

// Kehampaan ungu: bola latar dengan gradien radial (mengikuti kamera).
const voidMat = () =>
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {cA: {value: new THREE.Color(C.voidCenter)}, cB: {value: new THREE.Color(C.voidEdge)}, dir: {value: new THREE.Vector3(0, 0, -1)}},
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `uniform vec3 cA; uniform vec3 cB; uniform vec3 dir; varying vec3 vP;
      void main(){ float k = clamp(dot(vP, dir)*0.5+0.5,0.0,1.0); k = pow(k, 1.4); gl_FragColor = vec4(mix(cB,cA,k),1.0); }`,
  });

// Bokeh: cakram lembut prosedural (shader), bukan tekstur.
export const softDiscMat = (color: string, opacity: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {col: {value: new THREE.Color(color)}, op: {value: opacity}},
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `uniform vec3 col; uniform float op; varying vec2 vUv;
      void main(){ float d = length(vUv-0.5)*2.0; float a = smoothstep(1.0,0.55,d); gl_FragColor = vec4(col*a*op, a*op);} `,
  });

const tmpCam = new THREE.PerspectiveCamera();
const Bokeh: React.FC<{t: number; cam: Cam; seed: number}> = ({t, cam, seed}) => {
  const items = useMemo(() => {
    const r = seeded(seed);
    return Array.from({length: 26}, () => ({
      d: [(r() - 0.5) * 60, (r() - 0.5) * 90, -25 - r() * 35] as V3,
      s: 1.2 + r() * 3.2,
      sp: 0.15 + r() * 0.35,
      ph: r() * 6.28,
      op: 0.12 + r() * 0.22,
    }));
  }, [seed]);
  const mats = useMemo(() => items.map((it) => softDiscMat(C.bokeh, it.op)), [items]);
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  applyCam(tmpCam, cam);
  return (
    <group position={cam.pos} quaternion={tmpCam.quaternion.clone()}>
      {items.map((it, i) => (
        <mesh key={i} geometry={geo} material={mats[i]} scale={it.s}
          position={[it.d[0] + Math.sin(t * it.sp + it.ph) * 1.5, it.d[1] + t * it.sp * 0.8, it.d[2]]} />
      ))}
    </group>
  );
};

/** Kilau emas lewat paket: dipakai di transisi masuk/keluar scene (match-cut pada paket). */
const Flash: React.FC<{amount: number; cam: Cam}> = ({amount, cam}) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: '#FFE2A0', transparent: true, depthTest: false, depthWrite: false}), []);
  if (amount <= 0.001) return null;
  mat.opacity = amount;
  const d = new THREE.Vector3(...cam.target).sub(new THREE.Vector3(...cam.pos)).normalize().multiplyScalar(0.2).add(new THREE.Vector3(...cam.pos));
  return (
    <mesh position={d} renderOrder={999} material={mat} onUpdate={(m) => m.lookAt(...cam.pos)}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

export const Stage: React.FC<{cam: Cam; t: number; flash?: number; seed?: number; children: React.ReactNode}> = ({cam, t, flash = 0, seed = 7, children}) => {
  const {width, height} = useVideoConfig();
  const vm = useMemo(voidMat, []);
  const dir = new THREE.Vector3(...cam.target).sub(new THREE.Vector3(...cam.pos)).normalize();
  vm.uniforms.dir.value.copy(dir);
  return (
    <ThreeCanvas width={width} height={height} gl={{antialias: true, preserveDrawingBuffer: true}} style={{position: 'absolute', inset: 0}}>
      <CamSync cam={cam} />
      {/* Rig cahaya Mode C — satu untuk semua scene */}
      <ambientLight intensity={0.28} color="#B9A8E8" />
      <hemisphereLight args={['#D9CCFF', '#1A0D33', 0.35]} />
      <directionalLight position={[3, 6, 8]} intensity={2.2} color="#FFF4EC" />
      <directionalLight position={[-7, 3, -6]} intensity={3.2} color="#C9A6FF" />
      <directionalLight position={[6, -2, -5]} intensity={1.6} color="#FF9FC4" />
      <mesh position={cam.pos} material={vm} renderOrder={-10}>
        <sphereGeometry args={[150, 32, 16]} />
      </mesh>
      <Bokeh t={t} cam={cam} seed={seed} />
      {children}
      <Flash amount={flash} cam={cam} />
    </ThreeCanvas>
  );
};
