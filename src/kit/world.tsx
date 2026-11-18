import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {PAL, mat} from './style';
import {fbm, mulberry32, V3} from './math';

/* ---------- Shared geometry (built once) ---------- */
export const G = {
  sphere: new THREE.SphereGeometry(1, 20, 14),
  sphereLo: new THREE.SphereGeometry(1, 10, 8),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cone: new THREE.ConeGeometry(1, 1, 8),
  capsule: new THREE.CapsuleGeometry(1, 1, 6, 12),
  dodeca: new THREE.DodecahedronGeometry(1, 0),
};

/* ---------- Camera rig: position + lookAt + fov, set every render from timeline ---------- */
export type Cam = {pos: V3; look: V3; fov?: number; roll?: number};
export const CameraRig: React.FC<{cam: Cam}> = ({cam}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos);
  c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
  c.lookAt(...cam.look);
  const fov = cam.fov ?? 40;
  if (c.fov !== fov) { c.fov = fov; }
  c.near = 0.1; c.far = 900;
  c.updateProjectionMatrix();
  return null;
};

/* ---------- The ONE light rig (Mode A dusk rig) + sky + fog ---------- */
const skyGeo = (() => {
  const g = new THREE.SphereGeometry(600, 32, 16);
  const col: number[] = [];
  const top = new THREE.Color('#7FAFCB'), mid = new THREE.Color('#F3D7A6'), low = new THREE.Color('#EFC386');
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 600;
    const c = y > 0.08 ? mid.clone().lerp(top, Math.min(1, (y - 0.08) / 0.6)) : low.clone().lerp(mid, Math.max(0, (y + 0.1) / 0.18));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
})();
const skyMat = new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false});

export const Rig: React.FC<{fogNear?: number; fogFar?: number; fogColor?: string; sky?: boolean; shadowCenter?: V3; shadowSize?: number}> = ({
  fogNear = 110, fogFar = 520, fogColor = PAL.kabut, sky = true, shadowCenter = [0, 0, 0], shadowSize = 30,
}) => {
  const {scene, gl} = useThree();
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.1;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  if (!scene.fog || (scene.fog as THREE.Fog).near !== fogNear || (scene.fog as THREE.Fog).far !== fogFar) scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
  (scene.fog as THREE.Fog).color.set(fogColor);
  scene.background = new THREE.Color(fogColor);
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#FFD9A0', 2.2);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    return l;
  }, []);
  const sc = shadowCenter;
  light.position.set(sc[0] + 40, sc[1] + 34, sc[2] + 22);
  light.target.position.set(...sc);
  light.target.updateMatrixWorld();
  const cam = light.shadow.camera;
  cam.left = -shadowSize; cam.right = shadowSize; cam.top = shadowSize; cam.bottom = -shadowSize; cam.near = 1; cam.far = 160;
  cam.updateProjectionMatrix();
  return (
    <>
      <hemisphereLight args={['#FFE3B3', '#8A6B45', 0.9]} />
      <primitive object={light} />
      <primitive object={light.target} />
      {sky && <mesh geometry={skyGeo} material={skyMat} renderOrder={-1} />}
    </>
  );
};

/* ---------- Terrain (procedural savanna island) ---------- */
export type TerrainOpts = {seed?: number; size?: number; seg?: number; flat?: number; islandR?: number; hill?: number; offset?: [number, number]};
export const terrainHeight = (x: number, z: number, o: TerrainOpts = {}) => {
  const {flat = 22, islandR = 150, hill = 14, offset = [0, 0]} = o;
  const r = Math.hypot(x + offset[0], z + offset[1]);
  const n = fbm((x + 300) * 0.012, (z + 300) * 0.012, 5);
  const ridge = Math.pow(Math.max(0, n - 0.35), 1.4) * hill * 2.6;
  const flatMask = Math.min(1, Math.max(0, (Math.hypot(x, z) - flat) / 40));
  const micro = (fbm(x * 0.15, z * 0.15, 2) - 0.5) * 0.35;
  const coast = Math.min(0, (islandR - r) * 0.12);
  return ridge * flatMask + micro + coast + 0.05;
};
export const Terrain: React.FC<TerrainOpts & {color?: string}> = (o) => {
  const {size = 520, seg = 160} = o;
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const cols: number[] = [];
    const cS = new THREE.Color(PAL.sabana), cD = new THREE.Color('#A8873A'), cDirt = new THREE.Color(PAL.dirt),
      cG = new THREE.Color('#7E8A3E'), cSand = new THREE.Color(PAL.pasir);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const h = terrainHeight(x, z, o);
      p.setY(i, h);
      const n = fbm(x * 0.05 + 7, z * 0.05 + 3, 3);
      const g2 = fbm(x * 0.02 - 11, z * 0.02 + 5, 3);
      const c = cS.clone().lerp(cD, Math.min(1, n * 1.2)).lerp(cG, Math.max(0, Math.min(1, (h - 4) / 10)) * 0.75 + Math.max(0, g2 - 0.5) * 1.1);
      if (n > 0.62) c.lerp(cDirt, (n - 0.62) * 2);
      if (h < 0.6) c.lerp(cSand, Math.min(1, (0.6 - h) / 1.2));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(o)]);
  const m = useMemo(() => new THREE.MeshStandardMaterial({vertexColors: true, roughness: 1, metalness: 0}), []);
  return <mesh geometry={geo} material={m} receiveShadow />;
};

export const Sea: React.FC<{y?: number; size?: number; t?: number}> = ({y = -0.3, size = 1400}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow material={mat(PAL.laut, {rough: 0.55})}>
    <planeGeometry args={[size, size]} />
  </mesh>
);

/* ---------- Instanced helper ---------- */
export const Instanced: React.FC<{geo: THREE.BufferGeometry; material: THREE.Material; mats: THREE.Matrix4[]; shadow?: boolean}> = ({geo, material, mats, shadow = true}) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, material, mats.length);
    mats.forEach((mm, i) => m.setMatrixAt(i, mm));
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = shadow; m.receiveShadow = true;
    m.computeBoundingSphere();
    return m;
  }, [geo, material, mats]);
  return <primitive object={mesh} />;
};
const M4 = (p: V3, s: V3, ry = 0, rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(...s));

/* ---------- Vegetation: lontar palms, bushes (merged spheres), grass tufts, rocks ---------- */
export type Scatter = {seed: number; count: number; rMin: number; rMax: number; center?: [number, number]; avoid?: [number, number, number][]; to?: TerrainOpts};
const scatter = ({seed, count, rMin, rMax, center = [0, 0], avoid = [], to = {}}: Scatter) => {
  const r = mulberry32(seed);
  const pts: {x: number; z: number; y: number; k: number; a: number}[] = [];
  let guard = 0;
  while (pts.length < count && guard++ < count * 20) {
    const a = r() * Math.PI * 2, d = rMin + Math.sqrt(r()) * (rMax - rMin);
    const x = center[0] + Math.cos(a) * d, z = center[1] + Math.sin(a) * d;
    if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
    const y = terrainHeight(x, z, to);
    if (y < -0.05) continue;
    pts.push({x, z, y, k: r(), a: r() * Math.PI * 2});
  }
  return pts;
};

const frondGeo = (() => {
  const g = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  return g;
})();
export const Palms: React.FC<Scatter> = (s) => {
  const {trunks, crowns, skirts} = useMemo(() => {
    const pts = scatter(s);
    const trunks: THREE.Matrix4[] = [], crowns: THREE.Matrix4[] = [], skirts: THREE.Matrix4[] = [];
    pts.forEach(({x, z, y, k, a}) => {
      const h = 7 + k * 6;
      const lean = (k - 0.5) * 0.12;
      trunks.push(M4([x, y + h / 2, z], [0.22, h, 0.22], a, lean, 0));
      const top: V3 = [x + Math.sin(lean) * h * 0.0, y + h, z];
      for (let i = 0; i < 9; i++) {
        const ang = a + (i / 9) * Math.PI * 2;
        crowns.push(M4([top[0] + Math.cos(ang) * 0.9, top[1] + 0.1, top[2] + Math.sin(ang) * 0.9], [1.25, 0.35, 0.55], -ang, 0, 0.35));
      }
      skirts.push(M4([top[0], top[1] - 0.5, top[2]], [0.75, 1.0, 0.75], a));
    });
    return {trunks, crowns, skirts};
  }, [JSON.stringify(s)]);
  return (
    <>
      <Instanced geo={G.cyl} material={mat('#5E4A33')} mats={trunks} />
      <Instanced geo={frondGeo} material={mat(PAL.leaf)} mats={crowns} />
      <Instanced geo={G.sphereLo} material={mat('#7A6A40')} mats={skirts} />
    </>
  );
};

export const Bushes: React.FC<Scatter & {color?: string}> = (s) => {
  const mats = useMemo(() => {
    const pts = scatter(s);
    const r = mulberry32(s.seed + 99);
    const out: THREE.Matrix4[] = [];
    pts.forEach(({x, z, y, k}) => {
      const n = 5 + Math.floor(k * 4), base = 0.9 + k * 1.3;
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, d = r() * base * 0.7, sz = base * (0.45 + r() * 0.45);
        out.push(M4([x + Math.cos(a) * d, y + sz * 0.7 + r() * base * 0.4, z + Math.sin(a) * d], [sz, sz * 0.85, sz]));
      }
    });
    return out;
  }, [JSON.stringify(s)]);
  return <Instanced geo={G.sphereLo} material={mat(s.color ?? PAL.leafDark)} mats={mats} />;
};

export const Grass: React.FC<Scatter> = (s) => {
  // tufts of 3 thin blades
  const mats = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    scatter(s).forEach(({x, z, y, k, a}) => {
      for (let i = 0; i < 3; i++) {
        const ang = a + i * 2.1, h = 0.32 + k * 0.32 - i * 0.05;
        out.push(M4([x + Math.cos(ang) * 0.06, y + h / 2, z + Math.sin(ang) * 0.06], [0.045 + k * 0.02, h, 0.045 + k * 0.02], ang, Math.cos(ang) * 0.25, Math.sin(ang) * 0.25));
      }
    });
    return out;
  }, [JSON.stringify(s)]);
  return <Instanced geo={G.cone} material={mat(s.seed % 2 ? '#B89A48' : '#D2B25C')} mats={mats} shadow={false} />;
};

export const Rocks: React.FC<Scatter> = (s) => {
  const mats = useMemo(() => scatter(s).map(({x, z, y, k, a}) => {
    const sz = 0.3 + k * k * 1.6;
    return M4([x, y + sz * 0.3, z], [sz, sz * 0.7, sz * 1.1], a, k, 0);
  }), [JSON.stringify(s)]);
  return <Instanced geo={G.dodeca} material={mat(PAL.rock)} mats={mats} />;
};

/* ---------- Clouds: 5–9 merged spheres per puff ---------- */
export const Clouds: React.FC<{seed?: number; count?: number; y?: number; r?: number; drift?: number}> = ({seed = 5, count = 10, y = 70, r = 260, drift = 0}) => {
  const puffs = useMemo(() => {
    const rr = mulberry32(seed);
    const out: {p: V3; parts: [V3, number][]}[] = [];
    for (let i = 0; i < count; i++) {
      const a = rr() * Math.PI * 2, d = r * (0.4 + rr() * 0.6);
      const n = 5 + Math.floor(rr() * 5), parts: [V3, number][] = [];
      for (let j = 0; j < n; j++) parts.push([[(j - n / 2) * 4 + rr() * 3, rr() * 3, rr() * 4], 3.5 + rr() * 4]);
      out.push({p: [Math.cos(a) * d, y + rr() * 25, Math.sin(a) * d], parts});
    }
    return out;
  }, [seed, count, y, r]);
  return (
    <>
      {puffs.map((pf, i) => (
        <group key={i} position={[pf.p[0] + drift, pf.p[1], pf.p[2]]}>
          {pf.parts.map(([p, s], j) => <mesh key={j} geometry={G.sphereLo} material={mat(PAL.awan, {rough: 1})} position={p} scale={[s, s * 0.7, s]} />)}
        </group>
      ))}
    </>
  );
};

/* ---------- Simple mesh shorthand ---------- */
export const B: React.FC<{g?: THREE.BufferGeometry; c: string; p?: V3; s?: V3 | number; r?: V3; m?: THREE.Material; shadow?: boolean}> = ({g = G.sphere, c, p = [0, 0, 0], s = 1, r = [0, 0, 0], m, shadow = true}) => (
  <mesh geometry={g} material={m ?? mat(c)} position={p} scale={typeof s === 'number' ? [s, s, s] : s} rotation={r} castShadow={shadow} receiveShadow />
);
