/**
 * Elemen latar prosedural: awan (merged spheres — tanda tangan style), langit gradasi,
 * pohon lontar, batu. Semua dari primitif Three.js.
 */
import React, { useMemo } from 'react';
import {
  BackSide,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DodecahedronGeometry,
  DoubleSide,
  MeshStandardMaterial,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CLOUD, DERIVED, LIGHT, PALETTE } from '../styleLock';
import { mulberry32 } from '../lib/noise';
import { noiseBump } from '../lib/proceduralTextures';

/* ---------------- Awan: SELALU 5–9 SphereGeometry digabung ---------------- */
export const makeCloudGeometry = (seed: number) => {
  const r = mulberry32(seed);
  const n = CLOUD.minSpheres + Math.floor(r() * (CLOUD.maxSpheres - CLOUD.minSpheres + 1));
  const parts = [];
  for (let i = 0; i < n; i++) {
    const rad = 0.55 + r() * 0.55;
    const s = new SphereGeometry(rad, 18, 12);
    const x = (i / (n - 1) - 0.5) * 3.4 + (r() - 0.5) * 0.4;
    const y = Math.max(0, (1 - Math.abs(x) / 2) * 0.45 + (r() - 0.3) * 0.3);
    const z = (r() - 0.5) * 0.8;
    s.translate(x, y, z);
    parts.push(s);
  }
  const g = mergeGeometries(parts)!;
  // ratakan dasar awan sedikit
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) if (p.getY(i) < -0.25) p.setY(i, -0.25 + (p.getY(i) + 0.25) * 0.3);
  g.computeVertexNormals();
  return g;
};

const cloudMat = new MeshStandardMaterial({
  color: CLOUD.color,
  emissive: CLOUD.color,
  emissiveIntensity: 0.22,
  roughness: 1,
  metalness: 0,
  fog: false,
});

export const Cloud: React.FC<{ seed: number; position: [number, number, number]; scale?: number }> = ({
  seed,
  position,
  scale = 6,
}) => {
  const g = useMemo(() => makeCloudGeometry(seed), [seed]);
  return <mesh geometry={g} material={cloudMat} position={position} scale={[scale, scale * 0.8, scale]} />;
};

/* ---------------- Langit gradasi (shader prosedural) ---------------- */
export const SkyDome: React.FC<{ radius?: number }> = ({ radius = 600 }) => {
  const mat = useMemo(() => {
    const sunDir = new Vector3(...LIGHT.sun.direction).normalize();
    return new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new Color(DERIVED.langitAtas) },
        uHorizon: { value: new Color(DERIVED.langitHorizon) },
        uHaze: { value: new Color(PALETTE.kabut) },
        uSun: { value: new Color(PALETTE.senja) },
        uSunDir: { value: sunDir },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uHaze; uniform vec3 uSun; uniform vec3 uSunDir;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
          col = mix(uHaze, col, smoothstep(-0.05, 0.12, h));
          float s = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
          col += uSun * (pow(s, 6.0) * 0.35 + pow(s, 60.0) * 0.6);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
  }, []);
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  );
};

/* ---------------- Pohon lontar (Borassus) dari primitif ---------------- */
const trunkMat = new MeshStandardMaterial({ color: PALETTE.kayu, roughness: 0.95, metalness: 0 });
const leafMat = new MeshStandardMaterial({
  color: DERIVED.daunLontar,
  roughness: 0.9,
  metalness: 0,
  side: DoubleSide,
});
const deadLeafMat = new MeshStandardMaterial({
  color: '#' + new Color(PALETTE.kayu).lerp(new Color(PALETTE.sabana), 0.45).getHexString(),
  roughness: 0.95,
  metalness: 0,
  side: DoubleSide,
});

export const Lontar: React.FC<{
  position: [number, number, number];
  height?: number;
  seed?: number;
  t?: number;
  scale?: number;
}> = ({ position, height = 12, seed = 1, t = 0, scale = 1 }) => {
  const data = useMemo(() => {
    const r = mulberry32(seed);
    const trunk = new CylinderGeometry(0.17, 0.28, height, 10, 6);
    trunk.translate(0, height / 2, 0);
    const lean = (r() - 0.5) * 0.08;
    const leaves: { rot: [number, number, number]; dead: boolean }[] = [];
    const nLeaves = 26;
    for (let i = 0; i < nLeaves; i++) {
      const az = (i / nLeaves) * Math.PI * 2 * 2.618 + r() * 0.4; // sebaran golden-angle
      const el = -0.35 + r() * 1.55; // dari merunduk sampai tegak
      const roll = (r() - 0.5) * 1.6;
      leaves.push({ rot: [roll, az, el], dead: false });
    }
    for (let i = 0; i < 6; i++) {
      leaves.push({ rot: [Math.PI / 2 + (r() - 0.5) * 0.6, r() * Math.PI * 2, -1.25 - r() * 0.2], dead: true });
    }
    const fan = new CircleGeometry(1.35, 16, -1.7, 3.4); // kipas palmate hampir bundar
    fan.rotateX(-Math.PI / 2); // kipas di bidang XZ, mengarah ke +X
    const petiole = new CylinderGeometry(0.025, 0.035, 0.9, 5);
    petiole.rotateZ(-Math.PI / 2);
    petiole.translate(0.45, 0, 0);
    return { trunk, lean, leaves, fan, petiole };
  }, [height, seed]);
  const sway = Math.sin(t * 0.9 + seed) * 0.02;
  return (
    <group position={position} rotation={[sway, 0, data.lean]} scale={scale}>
      <mesh geometry={data.trunk} material={trunkMat} castShadow receiveShadow />
      <group position={[0, height, 0]}>
        {data.leaves.map((l, i) => (
          <group key={i} rotation={[0, l.rot[1], 0]}>
            <group rotation={[0, 0, l.rot[2]]}>
              <mesh geometry={data.petiole} material={trunkMat} castShadow />
              <mesh
                geometry={data.fan}
                material={l.dead ? deadLeafMat : leafMat}
                position={[0.85, 0, 0]}
                rotation={[l.rot[0], 0, 0]}
                castShadow
              />
            </group>
          </group>
        ))}
      </group>
    </group>
  );
};

/* ---------------- Batu ---------------- */
const rockMat = new MeshStandardMaterial({
  color: '#' + new Color(PALETTE.kayu).lerp(new Color(PALETTE.pasir), 0.45).getHexString(),
  roughness: 0.96,
  metalness: 0,
  bumpMap: noiseBump(17, 128, 3),
  bumpScale: 2,
  flatShading: true,
});
const rockGeo = new DodecahedronGeometry(1, 1);
export const Rock: React.FC<{ position: [number, number, number]; scale?: [number, number, number]; rotY?: number }> = ({
  position,
  scale = [1, 0.6, 0.8],
  rotY = 0,
}) => (
  <mesh
    geometry={rockGeo}
    material={rockMat}
    position={position}
    scale={scale}
    rotation={[0, rotY, 0]}
    castShadow
    receiveShadow
  />
);

/* ---------------- Pohon sabana purba (eukaliptus stilasi) ---------------- */
const canopyMat = new MeshStandardMaterial({ color: DERIVED.daunLontar, roughness: 0.95, metalness: 0, flatShading: true });
const canopyGeo = new DodecahedronGeometry(1, 1);
export const SavannaTree: React.FC<{ position: [number, number, number]; height?: number; seed?: number; dry?: boolean; scale?: number }> = ({
  position,
  height = 7,
  seed = 1,
  dry = false,
  scale = 1,
}) => {
  const parts = useMemo(() => {
    const r = mulberry32(seed + 500);
    return Array.from({ length: 4 }).map(() => ({
      p: [(r() - 0.5) * 2.6, height + (r() - 0.3) * 1.2, (r() - 0.5) * 2.2] as [number, number, number],
      s: 1.2 + r() * 0.9,
    }));
  }, [height, seed]);
  return (
    <group position={position} scale={scale}>
      <mesh material={trunkMat} position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.3, height, 8]} />
      </mesh>
      {[0.6, -0.7].map((a, i) => (
        <mesh key={i} material={trunkMat} position={[a * 0.9, height * 0.75, 0]} rotation={[0, 0, -a]} castShadow>
          <cylinderGeometry args={[0.07, 0.12, height * 0.45, 6]} />
        </mesh>
      ))}
      {dry
        ? null
        : parts.map((c, i) => (
            <mesh key={i} geometry={canopyGeo} material={canopyMat} position={c.p} scale={[c.s * 1.3, c.s * 0.6, c.s * 1.2]} castShadow />
          ))}
    </group>
  );
};
