// Panggung peta A2: satu renderer, satu rig cahaya, satu set material.
// Semua gerak diturunkan dari useCurrentFrame(); objek dinamis dimutasi di badan render.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import {camAt, FOV} from '../lib/camera';
import {elevM, getAlbedo, v3, wx, wz, yOf} from '../lib/geo';
import {clamp, easeInOut, easeOut, lerp, ramp, seeded, win} from '../lib/anim';
import {curves, parcelU, radiusFor} from '../lib/routes';
import {cutOpenAt, exagAt, flowQ, SEC} from '../lib/story';

// ---------- rig ----------
const CameraRig: React.FC<{t: number}> = ({t}) => {
  const {camera, gl, scene} = useThree();
  const c = camAt(t);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = FOV; cam.near = Math.max(0.02, c.dist * 0.02); cam.far = c.dist * 6 + 60;
  cam.position.copy(c.pos); cam.lookAt(c.target); cam.updateProjectionMatrix();
  gl.localClippingEnabled = true;
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1;
  const bg = new THREE.Color('#2a4763');
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, c.dist * 1.5, c.dist * 3.6 + 8);
  return null;
};

const useAlbedo = () => useMemo(() => {
  const img = getAlbedo();
  if (!img) return null;
  const tx = new THREE.Texture(img);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; tx.generateMipmaps = true;
  tx.minFilter = THREE.LinearMipmapLinearFilter; tx.needsUpdate = true;
  return tx;
}, []);

// ---------- potongan batimetri (S5) ----------
export const CUT_LON = 126.85, CUT_N = 0.2, CUT_S = -6.2;
const clipPlanes = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), wz(CUT_N)), new THREE.Plane(new THREE.Vector3(0, 0, 1), -wz(CUT_S))];
const BASE = -0.45;
// eksagerasi kedalaman hanya di bawah muka laut (shader), dipakai potongan S5
const uDeep = {value: 1};
const deepify = <M extends THREE.Material>(m: M): M => {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uDeep = uDeep;
    sh.vertexShader = 'uniform float uDeep;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n if (transformed.y < 0.0) transformed.y *= uDeep;');
  };
  m.customProgramCacheKey = () => 'deep';
  return m;
};
const curtain = (pts: [number, number][], water: boolean) => {
  // strip vertikal: dasar laut (data GEBCO) -> BASE (tanah) atau -> 0 (air)
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const top = new THREE.Color('#8a6a45'), bot = new THREE.Color('#2b1c10');
  pts.forEach(([lo, la], i) => {
    const y = yOf(elevM(lo, la));
    if (water) { pos.push(wx(lo), Math.min(y, 0), wz(la), wx(lo), 0, wz(la)); }
    else { pos.push(wx(lo), y, wz(la), wx(lo), BASE, wz(la)); col.push(top.r, top.g, top.b, bot.r, bot.g, bot.b); }
    if (i > 0) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (!water) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals(); return g;
};
const wallPts = (): [number, number][][] => {
  const front: [number, number][] = [], n: [number, number][] = [], s: [number, number][] = [];
  for (let i = 0; i <= 360; i++) front.push([CUT_LON, lerp(CUT_N, CUT_S, i / 360)]);
  for (let i = 0; i <= 300; i++) { const lo = lerp(CUT_LON, 135, i / 300); n.push([lo, CUT_N]); s.push([lo, CUT_S]); }
  return [front, n, s];
};

// laut lepas di luar bbox data (menyambung ke kabut), bukan data
const APRON: [number, number, number, number][] = [[0, -12 - 150, 400, 300], [0, 12 + 150, 400, 300], [-13.5 - 150, 0, 300, 24], [13.5 + 150, 0, 300, 24]];
const floorMat = new THREE.MeshStandardMaterial({color: '#3a2716', roughness: 1, metalness: 0, side: THREE.DoubleSide});
const apronMat = new THREE.MeshStandardMaterial({color: '#123a5e', roughness: 0.9, metalness: 0});

// ---------- utama ----------
export const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const albedo = useAlbedo();

  // terrain: 540x480 segmen, elevasi GEBCO x VS
  const terrain = useMemo(() => {
    const g = new THREE.PlaneGeometry(27, 24, 432, 384);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, yOf(elevM(p.getX(i) + 121.5, -p.getZ(i) - 2)));
    g.computeVertexNormals();
    return g;
  }, []);
  const terrainMat = useMemo(() => deepify(new THREE.MeshStandardMaterial({roughness: 0.92, metalness: 0, clipIntersection: true})), []);
  const waterMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#1d6a93', transparent: true, opacity: 0.16,
    roughness: 0.35, metalness: 0, depthWrite: false, clipIntersection: true}), []);
  const walls = useMemo(() => {
    const [f, n, s] = wallPts();
    return {soil: [curtain(f, false), curtain(n, false), curtain(s, false)], water: [curtain(f, true), curtain(n, true), curtain(s, true)]};
  }, []);
  const soilMat = useMemo(() => deepify(new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.95, metalness: 0, side: THREE.DoubleSide})), []);
  const wallWaterMat = useMemo(() => deepify(new THREE.MeshStandardMaterial({color: '#2f8fd0', transparent: true, opacity: 0.5,
    roughness: 0.4, metalness: 0, side: THREE.DoubleSide, depthWrite: false})), []);

  if (albedo && terrainMat.map !== albedo) { terrainMat.map = albedo; terrainMat.needsUpdate = true; }

  // --- S5: buka potongan + perbesar kedalaman
  const cutOpen = cutOpenAt(t);
  const exag = exagAt(t);
  uDeep.value = exag;
  const cutX = lerp(13.6, wx(CUT_LON), easeOut(cutOpen));
  clipPlanes[0].constant = cutX;
  const clipping = cutOpen > 0.001 ? clipPlanes : [];
  terrainMat.clippingPlanes = clipping; waterMat.clippingPlanes = clipping;
  // --- S8: El Niño/kemarau = tint hangat-kering (ILUSTRASI)
  const dry = win(t, SEC.elnino, SEC.s9 + 1.5, 1.2, 1.5);
  terrainMat.color.setRGB(1, lerp(1, 0.86, dry), lerp(1, 0.66, dry));

  return (
    <>
      <CameraRig t={t} />
      <hemisphereLight args={['#FFE3B3', '#8A6B45', 0.9]} />
      <directionalLight color="#FFD9A0" intensity={2.2} position={[-12, 14, -8]} />
      <group>
        <mesh geometry={terrain} material={terrainMat} />
        {cutOpen > 0.02 && walls.soil.map((g, i) => <mesh key={i} geometry={g} material={soilMat} position={[cutX - wx(CUT_LON), 0, 0]} />)}
        {cutOpen > 0.02 && walls.water.map((g, i) => <mesh key={'w' + i} geometry={g} material={wallWaterMat} position={[cutX - wx(CUT_LON), 0, 0]} renderOrder={2} />)}
        {cutOpen > 0.02 && <DeepWallFlow t={t} open={cutOpen} />}
        {cutOpen > 0.02 && <mesh rotation={[-Math.PI / 2, 0, 0]} material={floorMat}
          position={[(wx(CUT_LON) + 13.5) / 2 + cutX - wx(CUT_LON), BASE * exag, (wz(CUT_N) + wz(CUT_S)) / 2]}>
          <planeGeometry args={[13.5 - wx(CUT_LON), wz(CUT_S) - wz(CUT_N)]} /></mesh>}
      </group>
      {APRON.map(([x, z, w, d], i) => <mesh key={'ap' + i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.55, z]} material={apronMat}>
        <planeGeometry args={[w, d]} /></mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} material={waterMat} renderOrder={3}>
        <planeGeometry args={[27, 24]} />
      </mesh>
      <Flows t={t} />
      <Moorings t={t} />
      <Pools t={t} />
      <Gates t={t} />
      <Measures t={t} />
      <Parcel t={t} />
      <HeroNumber t={t} />
    </>
  );
};

// ---------- jalur arus ----------
type FlowDef = {key: keyof typeof curves; q: number; color: string; draw: [number, number]; vis: [number, number]; n: number};
const FLOWS: FlowDef[] = [
  {key: 'main', q: 11.6, color: '#ff5a3c', draw: [0.2, 4.2], vis: [0, 999], n: 44},
  {key: 'lombok', q: 2.6, color: '#ff5a3c', draw: [2.6, 5.4], vis: [0, 999], n: 22},
  {key: 'ombai', q: 4.9, color: '#ff5a3c', draw: [3.4, 5.6], vis: [0, 999], n: 26},
  {key: 'timor', q: 7.5, color: '#ff5a3c', draw: [3.6, 5.9], vis: [0, 999], n: 34},
  {key: 'deep', q: 2.5, color: '#7fdcff', draw: [3.0, 5.8], vis: [0, 999], n: 18},
];
const TUB = 360, RAD = 10;
// jari-jari tabung mengikuti jarak kamera: posisi = pusat + normal * (R0 * k)
const tubeMat = (params: THREE.MeshBasicMaterialParameters, r0: number) => {
  const m = new THREE.MeshBasicMaterial(params);
  const u = {value: 0};
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uExtra = u;
    sh.vertexShader = 'uniform float uExtra;\n' + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * uExtra;');
  };
  m.customProgramCacheKey = () => 'tube';
  return {m, set: (k: number) => { u.value = r0 * (k - 1); }};
};
const Flows: React.FC<{t: number}> = ({t}) => {
  const objs = useMemo(() => FLOWS.map((f) => {
    const c = curves[f.key];
    const cm = tubeMat({color: f.color, toneMapped: false, transparent: true, fog: false}, radiusFor(f.q));
    const gm = tubeMat({color: f.key === 'deep' ? '#9fe8ff' : '#ff9a70', toneMapped: false, transparent: true, opacity: 0.2,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false}, radiusFor(f.q) * 2.6);
    const core = new THREE.Mesh(new THREE.TubeGeometry(c, TUB, radiusFor(f.q), RAD, false), cm.m);
    const glow = new THREE.Mesh(new THREE.TubeGeometry(c, TUB, radiusFor(f.q) * 2.6, RAD, false), gm.m);
    core.userData.set = cm.set; glow.userData.set = gm.set;
    const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8),
      new THREE.MeshBasicMaterial({color: '#fff1d6', toneMapped: false, transparent: true, fog: false}), f.n);
    return {f, c, core, glow, dots};
  }), []);
  const q = flowQ(t);           // debit "bernapas" (S8) – memengaruhi tebal & laju
  const m = q / 15;
  const tmp = new THREE.Object3D();
  return <>{objs.map(({f, c, core, glow, dots}) => {
    const prog = easeInOut((t - f.draw[0]) / (f.draw[1] - f.draw[0]));
    const segs = Math.floor(prog * TUB) * RAD * 6;
    core.geometry.setDrawRange(0, segs); glow.geometry.setDrawRange(0, segs);
    const wide = camAt(t).dist;
    const thick = clamp(wide / 30, 0.13, 1.3) * lerp(0.6, 1.35, clamp((m - 0.66) / 0.6));
    core.userData.set(thick); glow.userData.set(thick);
    (glow.material as THREE.MeshBasicMaterial).opacity = 0.16 + 0.22 * clamp((m - 0.6) / 0.7);
    const sp = 0.035 * m; const dsz = radiusFor(f.q) * 0.55 * thick;
    for (let i = 0; i < f.n; i++) {
      const u = ((i / f.n) + t * sp / (c.getLength() / 20)) % 1;
      if (u > prog) { tmp.scale.setScalar(0); } else {
        tmp.position.copy(c.getPointAt(u)); tmp.position.y += 0.01; tmp.scale.setScalar(dsz);
      }
      tmp.updateMatrix(); dots.setMatrixAt(i, tmp.matrix);
    }
    dots.instanceMatrix.needsUpdate = true;
    if (f.key === 'deep') { const hide = 1 - cutOpenAt(t); core.visible = glow.visible = dots.visible = hide > 0.1; }
    return <group key={f.key}><primitive object={glow} /><primitive object={core} /><primitive object={dots} /></group>;
  })}</>;
};

// aliran dalam di dinding potongan (S5) – mengikuti dasar laut data GEBCO
const DeepWallFlow: React.FC<{t: number; open: number}> = ({t, open}) => {
  const obj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const la = lerp(0.1, -5.9, i / 120);
      const floor = yOf(elevM(CUT_LON, la));
      pts.push(new THREE.Vector3(wx(CUT_LON) + 0.06, Math.min(floor + 0.025, -0.1), wz(la)));
    }
    const c = new THREE.CatmullRomCurve3(pts);
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, 240, 0.014, 8, false),
      deepify(new THREE.MeshBasicMaterial({color: '#8fe3ff', toneMapped: false})));
    return m;
  }, []);
  const prog = easeInOut((t - (SEC.s5 + 0.9)) / 3.6) * (open > 0.5 ? 1 : 0);
  obj.geometry.setDrawRange(0, Math.floor(prog * 240) * 8 * 6);
  return <primitive object={obj} />;
};

// ---------- paket air (hero prosedural) ----------
const Parcel: React.FC<{t: number}> = ({t}) => {
  const parts = useMemo(() => {
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24),
      new THREE.MeshStandardMaterial({color: '#dffbff', emissive: '#7ff0ff', emissiveIntensity: 1.6, roughness: 0.3, metalness: 0}));
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24),
      new THREE.MeshStandardMaterial({color: '#4fd8ff', transparent: true, opacity: 0.32, roughness: 0.2, metalness: 0, depthWrite: false}));
    const halo = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.55, 48),
      new THREE.MeshBasicMaterial({color: '#bff6ff', transparent: true, opacity: 0.6, toneMapped: false, side: THREE.DoubleSide, depthWrite: false}));
    halo.rotation.x = -Math.PI / 2;
    const trail = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10),
      new THREE.MeshBasicMaterial({color: '#9ff1ff', transparent: true, opacity: 0.55, toneMapped: false}), 14);
    const g = new THREE.Group(); g.add(core, shell, halo);
    return {g, core, shell, halo, trail};
  }, []);
  const vis = win(t, SEC.s2b, SEC.s8 + 0.6, 0.6, 0.8);
  const u = parcelU(t);
  const c = curves.parcel;
  const p = c.getPointAt(u);
  const s = 0.11 * clamp(camAt(t).dist / 6, 0.7, 3.2) * easeOut(vis * 1.2);
  const wob = Math.sin(t * 5.1) * 0.06;
  parts.g.position.set(p.x, 0.06 + s * 0.6 + Math.sin(t * 2.2) * 0.01, p.z);
  parts.core.scale.set(s * 0.55 * (1 + wob), s * 0.55 * (1 - wob), s * 0.55 * (1 + wob));
  parts.shell.scale.setScalar(s * (1 + 0.05 * Math.sin(t * 3.3)));
  parts.halo.scale.setScalar(s * (1 + 0.25 * ((t * 1.2) % 1)));
  (parts.halo.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - ((t * 1.2) % 1));
  const tmp = new THREE.Object3D();
  for (let i = 0; i < 14; i++) {
    const uu = u - (i + 1) * 0.0035;
    if (uu < 0 || vis < 0.05) tmp.scale.setScalar(0); else {
      tmp.position.copy(c.getPointAt(uu)); tmp.position.y = 0.06 + s * 0.4; tmp.scale.setScalar(s * 0.42 * (1 - i / 15));
    }
    tmp.updateMatrix(); parts.trail.setMatrixAt(i, tmp.matrix);
  }
  parts.trail.instanceMatrix.needsUpdate = true;
  parts.g.visible = vis > 0.01;
  return <><primitive object={parts.g} /><primitive object={parts.trail} /></>;
};

// ---------- 11 mooring INSTANT (posisi DISEDERHANAKAN) ----------
export const MOORINGS: [number, number][] = [[118.45, -2.85], [118.62, -2.9], [126.75, -1.8], [126.95, -1.95],
  [115.62, -8.45], [115.85, -8.5], [125.0, -8.5], [125.18, -8.55], [122.9, -11.3], [123.9, -10.9], [124.4, -10.6]];
const Moorings: React.FC<{t: number}> = ({t}) => {
  const objs = useMemo(() => MOORINGS.map(([lo, la]) => {
    const floor = Math.min(yOf(elevM(lo, la)), -0.05);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8),
      new THREE.MeshStandardMaterial({color: '#f3e6c8', roughness: 0.6, metalness: 0}));
    const buoy = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12),
      new THREE.MeshStandardMaterial({color: '#FFB03A', emissive: '#ff8a1a', emissiveIntensity: 0.6, roughness: 0.5, metalness: 0}));
    const g = new THREE.Group(); g.add(cable, buoy); g.position.set(wx(lo), 0, wz(la));
    return {g, cable, buoy, floor};
  }), []);
  const d = camAt(t).dist;
  const k = clamp(d / 10, 0.45, 2.4);
  return <>{objs.map((o, i) => {
    const a = easeOut((t - (SEC.mooring + i * 0.09)) / 0.7);
    const fl = o.floor * exagAt(t);
    const top = lerp(fl, 0.32 * k, a);
    o.cable.scale.set(0.012 * k, top - fl, 0.012 * k); o.cable.position.y = (top + fl) / 2;
    o.buoy.scale.setScalar(0.05 * k); o.buoy.position.y = top;
    o.g.visible = a > 0.001;
    return <primitive key={i} object={o.g} />;
  })}</>;
};

// ---------- 6.000 kolam renang Olimpiade (ILUSTRASI skala) ----------
const Pools: React.FC<{t: number}> = ({t}) => {
  const mesh = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({color: '#59c8ff', emissive: '#1d8fd0', emissiveIntensity: 0.5, roughness: 0.4, metalness: 0}), 6000), []);
  const vis = win(t, SEC.pools, 24.3, 0.3, 0.45);
  const tmp = new THREE.Object3D();
  const cx = wx(122.0), cz = wz(-1.6);
  if (vis > 0.001) for (let i = 0; i < 6000; i++) {
    const r = Math.floor(i / 100), c = i % 100;
    const a = easeOut((t - SEC.pools - (r / 60) * 1.0) / 0.35) * vis;
    tmp.position.set(cx + (c - 49.5) * 0.085, 0.9 + (1 - a) * 0.8, cz + (r - 29.5) * 0.085);
    tmp.scale.set(0.07 * a, 0.02 * a, 0.035 * a);
    tmp.updateMatrix(); mesh.setMatrixAt(i, tmp.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.visible = vis > 0.001;
  return <primitive object={mesh} />;
};

// ---------- tiga pintu keluar ----------
export const GATES: {lon: number; lat: number}[] = [{lon: 115.72, lat: -8.7}, {lon: 125.05, lat: -8.45}, {lon: 124.0, lat: -11.0}];
const Gates: React.FC<{t: number}> = ({t}) => {
  const rings = useMemo(() => GATES.map((g) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 10, 64),
      new THREE.MeshBasicMaterial({color: '#FFB03A', toneMapped: false, transparent: true}));
    m.rotation.x = -Math.PI / 2; m.position.copy(v3(g.lon, g.lat, 0.05)); return m;
  }), []);
  const k = clamp(camAt(t).dist / 12, 0.25, 1.4);
  const starts = [SEC.gate1, SEC.gate2, SEC.gate3];
  return <>{rings.map((m, i) => {
    const a = win(t, starts[i], SEC.s8 + 0.5, 0.5, 1.0);
    const pulse = 1 + 0.08 * Math.sin(t * 4 + i);
    m.scale.setScalar(0.55 * k * easeOut(a) * pulse);
    (m.material as THREE.MeshBasicMaterial).opacity = 0.9 * a;
    m.visible = a > 0.01;
    return <primitive key={i} object={m} />;
  })}</>;
};

// ---------- garis ukur lebar selat (20 km Lombok, 160 km Timor) ----------
export const MEASURES = [
  {a: [115.6, -8.78] as [number, number], b: [115.81, -8.78] as [number, number], t0: 'lombokW', t1: 'lombokEnd'},
  {a: [124.25, -10.15] as [number, number], b: [124.75, -11.55] as [number, number], t0: 'timorW', t1: 'timorEnd'},
];
const Measures: React.FC<{t: number}> = ({t}) => {
  const objs = useMemo(() => MEASURES.map((m) => {
    const A = v3(m.a[0], m.a[1], 0.06), B = v3(m.b[0], m.b[1], 0.06);
    const len = A.distanceTo(B);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: '#ffffff', toneMapped: false}));
    const capA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bar.material);
    const capB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bar.material);
    const g = new THREE.Group(); g.add(bar, capA, capB);
    g.position.copy(A.clone().add(B).multiplyScalar(0.5));
    g.rotation.y = -Math.atan2(B.z - A.z, B.x - A.x);
    return {g, bar, capA, capB, len};
  }), []);
  const times = [[SEC.lombokW, SEC.s7], [SEC.timorW, SEC.s8 - 0.4]];
  return <>{objs.map((o, i) => {
    const a = win(t, times[i][0], times[i][1], 0.6, 0.5);
    const th = 0.008 * clamp(camAt(t).dist / 3, 0.6, 3);
    const L = o.len * easeOut(a);
    o.bar.scale.set(L, th, th);
    o.capA.scale.set(th, th, th * 9); o.capA.position.x = -L / 2;
    o.capB.scale.set(th, th, th * 9); o.capB.position.x = L / 2;
    o.g.visible = a > 0.01;
    return <primitive key={i} object={o.g} />;
  })}</>;
};

// ---------- satu-satunya angka hero 3D emas: 15 JUTA ----------
const HeroNumber: React.FC<{t: number}> = ({t}) => {
  const mesh = useMemo(() => {
    const font = new FontLoader().parse(fontJson as never);
    const g = new TextGeometry('15 JUTA', {font, size: 1.25, depth: 0.28, curveSegments: 8, bevelEnabled: true,
      bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 3});
    g.center();
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({color: '#F2C14E', emissive: '#a86f12', emissiveIntensity: 0.55,
      roughness: 0.35, metalness: 0.55}));
  }, []);
  const a = win(t, SEC.s3, SEC.pools - 0.1, 0.7, 0.5);
  const c = camAt(t);
  // diletakkan di depan kamera, menghadap kamera, utuh di dalam frame
  const dir = c.target.clone().sub(c.pos).normalize();
  const p = c.pos.clone().add(dir.multiplyScalar(c.dist * 0.62));
  mesh.position.copy(p).add(new THREE.Vector3(0, c.dist * 0.07, 0));
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(c.pos, c.target, new THREE.Vector3(0, 1, 0)));
  const s = c.dist * 0.62 * 0.04 * (0.85 + 0.15 * easeOut(a)) ;
  mesh.scale.setScalar(s * easeOut(a));
  mesh.rotateY(Math.sin(t * 0.9) * 0.12);
  mesh.visible = a > 0.01;
  return <primitive object={mesh} />;
};
