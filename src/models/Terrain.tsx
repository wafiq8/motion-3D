/**
 * Terrain sabana: plane displacement noise + rumput InstancedMesh yang bergoyang halus.
 * Semua prosedural.
 */
import React, { useMemo } from 'react';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from 'three';
import { DERIVED, PALETTE } from '../styleLock';
import { createSimplex2D, fbm, mulberry32, smoothstep } from '../lib/noise';
import { noiseBump } from '../lib/proceduralTextures';

export type TerrainOpts = {
  seed?: number;
  /** Area datar (tempat Komodo) — pusat & radius. */
  flatCenter?: [number, number];
  flatRadius?: number;
  /** Tinggi maksimum bukit di kejauhan. */
  hillHeight?: number;
  hillStart?: number;
};

export const makeHeightFn = ({
  seed = 3,
  flatCenter = [0, 0],
  flatRadius = 9,
  hillHeight = 26,
  hillStart = 38,
}: TerrainOpts = {}) => {
  const n = createSimplex2D(seed);
  const n2 = createSimplex2D(seed + 101);
  return (x: number, z: number) => {
    const dx = x - flatCenter[0];
    const dz = z - flatCenter[1];
    const d = Math.sqrt(dx * dx + dz * dz);
    const rolling = fbm(n, x * 0.035, z * 0.035, 4) * 0.9 + fbm(n2, x * 0.18, z * 0.18, 2) * 0.12;
    const flat = smoothstep(flatRadius * 0.5, flatRadius * 1.6, d);
    const hillMask = smoothstep(hillStart, hillStart + 70, d);
    const ridge = 1 - Math.abs(fbm(n2, x * 0.012 + 3.1, z * 0.012 - 1.7, 4));
    const hills = hillMask * hillHeight * (0.35 + 0.65 * ridge * ridge) * (0.6 + 0.4 * fbm(n, x * 0.02, z * 0.02, 3));
    return rolling * (0.15 + 0.85 * flat) + hills;
  };
};

const DEFAULT_CENTER: [number, number] = [0, -60];
const NO_CLEARINGS: [number, number, number, number][] = [];

export const Terrain: React.FC<{
  height: (x: number, z: number) => number;
  size?: number;
  segments?: number;
  center?: [number, number];
  seed?: number;
  /** Mode pulau: pantai pasir di dekat permukaan laut, dasar laut kebiruan. */
  island?: boolean;
  /** Warna rona (harus warna palet/turunan) + kekuatannya. */
  tint?: string;
  tintAmount?: number;
}> = ({ height, size = 420, segments = 260, center = DEFAULT_CENTER, seed = 5, island = false, tint, tintAmount = 0 }) => {
  const { geometry, material } = useMemo(() => {
    const g = new PlaneGeometry(size, size, segments, segments);
    g.rotateX(-Math.PI / 2);
    g.translate(center[0], 0, center[1]);
    const pos = g.getAttribute('position');
    const cn = createSimplex2D(seed);
    const cSab = new Color(PALETTE.sabana);
    const cPas = new Color(PALETTE.pasir);
    const cGel = new Color(DERIVED.tanahGelap);
    const cFar = new Color(DERIVED.bukitJauh);
    const cSea = new Color(PALETTE.laut);
    const cTint = new Color(tint ?? PALETTE.sabana);
    const col: number[] = [];
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = height(x, z);
      pos.setY(i, y);
      const patch = fbm(cn, x * 0.05, z * 0.05, 4);
      const fine = cn(x * 0.6, z * 0.6) * 0.06;
      c.copy(cSab);
      c.lerp(cPas, smoothstep(0.15, 0.55, patch) * 0.55);
      c.lerp(cGel, smoothstep(-0.2, -0.6, patch) * 0.45);
      if (island) {
        c.lerp(cPas, 1 - smoothstep(0.25, 0.9, y));
        c.lerp(cGel, smoothstep(3, 7, y) * 0.35);
        if (y < 0) c.lerp(cSea, smoothstep(0, -2.5, y) * 0.7);
      } else {
        c.lerp(cFar, smoothstep(10, 30, y) * 0.35);
      }
      if (tint) c.lerp(cTint, tintAmount * (0.75 + patch * 0.5));
      c.offsetHSL(0, 0, fine);
      col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const bump = noiseBump(9, 256, 6).clone();
    bump.repeat.set(size / 6, size / 6);
    bump.needsUpdate = true;
    const m = new MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.97,
      metalness: 0,
      bumpMap: bump,
      bumpScale: 1.5,
    });
    return { geometry: g, material: m };
  }, [height, size, segments, center[0], center[1], seed, island, tint, tintAmount]);
  return <mesh geometry={geometry} material={material} receiveShadow />;
};

/** Satu rumpun rumput: beberapa helai meruncing (tinggi lokal 0..1). */
const makeTuft = (blades = 6, seed = 1) => {
  const r = mulberry32(seed);
  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const base = new Color(DERIVED.rumputPangkal);
  const tip = new Color(DERIVED.rumputUjung);
  const c = new Color();
  const SEG = 3;
  for (let b = 0; b < blades; b++) {
    const ang = r() * Math.PI * 2;
    const lean = 0.15 + r() * 0.35;
    const h = 0.6 + r() * 0.4;
    const w = 0.014 + r() * 0.008;
    const ox = (r() - 0.5) * 0.2;
    const oz = (r() - 0.5) * 0.2;
    const dx = Math.cos(ang);
    const dz = Math.sin(ang);
    const px = -dz;
    const pz = dx;
    const start = pos.length / 3;
    for (let s = 0; s <= SEG; s++) {
      const u = s / SEG;
      const ww = w * (1 - u * 0.92);
      const bend = lean * u * u;
      const cx = ox + dx * bend;
      const cz = oz + dz * bend;
      const y = h * u;
      pos.push(cx - px * ww, y, cz - pz * ww, cx + px * ww, y, cz + pz * ww);
      nor.push(0, 1, 0, 0, 1, 0);
      c.copy(base).lerp(tip, Math.pow(u, 0.7));
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
    for (let s = 0; s < SEG; s++) {
      const a = start + s * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      // sisi belakang dengan normal tetap ke atas (rumput tidak menggelap dari belakang)
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
};

export type GrassProps = {
  height: (x: number, z: number) => number;
  /** Waktu (detik) untuk goyangan angin. */
  t: number;
  count?: number;
  area?: { xMin: number; xMax: number; zMin: number; zMax: number };
  /** Zona kosong/pendek (mis. jalur Komodo): [x, z, radiusX, radiusZ]. */
  clearings?: [number, number, number, number][];
  seed?: number;
  minH?: number;
  maxH?: number;
  tint?: string;
  tintAmount?: number;
};

export const Grass: React.FC<GrassProps> = ({
  height,
  t,
  count = 9000,
  area = { xMin: -40, xMax: 40, zMin: -70, zMax: 24 },
  clearings = NO_CLEARINGS,
  seed = 21,
  minH = 0.25,
  maxH = 0.75,
  tint,
  tintAmount = 0,
}) => {
  const { mesh, uniforms } = useMemo(() => {
    const geo = makeTuft(11, seed);
    const uniforms = { uTime: { value: 0 } };
    const mat = new MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.95,
      metalness: 0,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          #else
            vec3 ip = vec3(0.0);
          #endif
          float hh = transformed.y * transformed.y;
          float sw = sin(uTime * 1.5 + ip.x * 0.32 + ip.z * 0.21) * 0.6
                   + sin(uTime * 2.6 + ip.x * 0.9 - ip.z * 0.4) * 0.25;
          transformed.x += sw * hh * 0.16;
          transformed.z += sw * hh * 0.07;`,
        );
    };
    mat.customProgramCacheKey = () => 'grass-sway-v1';

    const r = mulberry32(seed * 7 + 3);
    const inst = new InstancedMesh(geo, mat, count);
    const o = new Object3D();
    const c = new Color();
    let placed = 0;
    let guard = 0;
    while (placed < count && guard < count * 6) {
      guard++;
      const x = area.xMin + r() * (area.xMax - area.xMin);
      const z = area.zMin + r() * (area.zMax - area.zMin);
      let hScale = 1;
      let skip = false;
      for (const [cx, cz, rx, rz] of clearings) {
        const d = Math.sqrt(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2);
        if (d < 1) {
          if (r() > d * d * 0.6) skip = true;
          hScale = Math.min(hScale, 0.35 + d * 0.5);
        }
      }
      if (skip) continue;
      const h = (minH + r() * (maxH - minH)) * hScale;
      o.position.set(x, height(x, z) - 0.02, z);
      o.rotation.set(0, r() * Math.PI * 2, 0);
      o.scale.set(0.8 + r() * 0.8, h, 0.8 + r() * 0.8);
      o.updateMatrix();
      inst.setMatrixAt(placed, o.matrix);
      c.setRGB(1, 1, 1).offsetHSL((r() - 0.5) * 0.03, (r() - 0.5) * 0.1, (r() - 0.5) * 0.12);
      if (tint) c.lerp(new Color(tint).multiplyScalar(1.6), tintAmount * r());
      inst.setColorAt(placed, c);
      placed++;
    }
    inst.count = placed;
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.receiveShadow = true;
    inst.castShadow = false;
    inst.frustumCulled = false;
    return { mesh: inst, uniforms };
  }, [height, count, area.xMin, area.xMax, area.zMin, area.zMax, clearings, seed, minH, maxH, tint, tintAmount]);

  uniforms.uTime.value = t;
  return <primitive object={mesh} />;
};
