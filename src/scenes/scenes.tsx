import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Cam, Rig, Terrain, Sea, Palms, Bushes, Grass, Rocks, Clouds, B, G, terrainHeight, TerrainOpts, Instanced} from '../kit/world';
import {Komodo, headGeo, jawGeo, komodoVC, Figure, Goat, SpeedBoat, WoodBoat, Clinic, Pier, SrikayaTree, Ring, StretcherGroup} from '../kit/actors';
import {PAL, mat} from '../kit/style';
import {V3, keys3, keys1, ramp, ease, lerp, clamp, mulberry32} from '../kit/math';
import {wt, sc, sent} from '../timeline';
import {SerifTitle, Chip, env, SAFE_TOP} from '../overlay/Text';
import {Leader, ReadoutStack} from '../overlay/Labels';
import {project} from '../kit/project';

export type SceneDef = {id: number; World: React.FC<{t: number}>; cam: (t: number) => Cam; Overlay: React.FC<{t: number}>; grade?: string};

const CASE17 = 'KASUS MEI 2017 — AFP / JAKARTA POST';
const ILU = 'ILUSTRASI · REKONSTRUKSI';
const face = (from: [number, number], to: [number, number]) => Math.atan2(-(to[1] - from[1]), to[0] - from[0]);
const gy = (x: number, z: number, o?: TerrainOpts) => Math.max(0, terrainHeight(x, z, o));

/* ---------------- Shared savanna island set (S1–S3, S7) ---------------- */
const SAV: TerrainOpts = {flat: 22, islandR: 150, hill: 14};
// clearings: action area, camera paths (S1–S3, S7), ring walk, resting komodo
const AVOID: [number, number, number][] = [[0, 0, 11], [-4, -6, 6], [-14, 13, 8], [-15, 3, 8], [-13, -6, 7], [-20, 24, 9], [-5, 0, 8], [4, -4, 4], [-16, 14, 8]];
const Savanna: React.FC = () => (
  <>
    <Terrain {...SAV} />
    <Sea />
    <Palms seed={11} count={60} rMin={10} rMax={130} avoid={AVOID} to={SAV} />
    <Bushes seed={21} count={90} rMin={8} rMax={120} avoid={AVOID} to={SAV} />
    <Bushes seed={25} count={40} rMin={14} rMax={60} avoid={AVOID} to={SAV} color={'#7A8A40'} />
    <Grass seed={31} count={2200} rMin={1.5} rMax={70} to={SAV} avoid={[[-14, 13, 4], [-15, 3, 4], [-13, -6, 4], [-16, 14, 4]]} />
    <Grass seed={34} count={1400} rMin={1.5} rMax={45} to={SAV} avoid={[[-14, 13, 4], [-15, 3, 4], [-13, -6, 4], [-16, 14, 4]]} />
    <Rocks seed={41} count={30} rMin={7} rMax={90} avoid={AVOID} to={SAV} />
    <Clouds seed={5} count={12} />
  </>
);

/* ---------------- Actors timing for the 2017 case ---------------- */
const T = {
  s1: sc(1).start_s, s2: sc(2).start_s, s3: sc(3).start_s, s4: sc(4).start_s, s5: sc(5).start_s, s6: sc(6).start_s, s7: sc(7).start_s,
  camUp: wt(2, 'kamera'), step: wt(2, 'melangkah'), samping: wt(4, 'dari'), bite: wt(4, 'menggigit'),
};
const K1: V3 = [4, 0, 0];               // feeding komodo
const GOAT: V3 = [5.25, 0, 0.35];
const TOUR_A: [number, number] = [-9.5, 4.2], TOUR_B: [number, number] = [-3.2, 2.6], TOUR_C: [number, number] = [-1.3, 1.9];
const K2_A: [number, number] = [-3.6, -11.5], K2_B: [number, number] = [-1.52, 0.62];

const tourist = (t: number) => {
  // walk A->B during S1, stand, raise camera, step B->C
  const w1 = ramp(t, 0.3, T.s2 - 0.2), w2 = ramp(t, T.step, T.step + 1.1);
  const x = t < T.step ? lerp(TOUR_A[0], TOUR_B[0], w1) : lerp(TOUR_B[0], TOUR_C[0], w2);
  const z = t < T.step ? lerp(TOUR_A[1], TOUR_B[1], w1) : lerp(TOUR_B[1], TOUR_C[1], w2);
  const walking = (w1 > 0 && w1 < 1) || (w2 > 0 && w2 < 1);
  const walkAmt = walking ? 1 : 0;
  const cam = ramp(t, T.camUp, T.camUp + 0.5) * (1 - ramp(t, T.bite + 0.05, T.bite + 0.3));
  const stagger = ramp(t, T.bite + 0.05, T.bite + 0.35) * (1 - ramp(t, T.bite + 0.6, T.bite + 0.9));
  const fall = ease(ramp(t, T.bite + 0.45, T.bite + 1.3)) * 0.85;
  const ry = face(t < T.step ? TOUR_A : TOUR_B, [K1[0], K1[2]]);
  return {p: [x, 0, z] as V3, ry: walking && t < T.step ? face(TOUR_A, TOUR_B) : ry, pose: {walk: t * 9.5, walkAmt, cam, stagger, fall}};
};
const komodo2 = (t: number) => {
  const k = ramp(t, T.samping - 0.1, T.bite - 0.25);
  const x = lerp(K2_A[0], K2_B[0], k), z = lerp(K2_A[1], K2_B[1], k);
  const lunge = ease(ramp(t, T.bite - 0.25, T.bite + 0.05)) * (1 - 0.6 * ramp(t, T.bite + 0.8, T.bite + 1.3));
  const jaw = ramp(t, T.bite - 0.3, T.bite - 0.05) * (1 - ramp(t, T.bite + 0.05, T.bite + 0.2)) + 0.25 * ramp(t, T.bite + 0.9, T.bite + 1.3);
  return {p: [x, 0, z] as V3, ry: face(K2_A, K2_B) + 0.15 * Math.sin(t * 1.3), pose: {walk: t * 6.4, walkAmt: k > 0 && k < 1 ? 1 : 0, lunge, jaw, tongue: k > 0 && k < 1 ? Math.max(0, Math.sin(t * 7)) : 0}};
};
const feeding = (t: number) => ({walk: 0, walkAmt: 0, eat: 0.6 + 0.4 * Math.sin(t * 2.3), headYaw: 0.15 * Math.sin(t * 1.7), jaw: 0.35 + 0.3 * Math.sin(t * 4.6), tail: t * 1.2});

const CaseWorld: React.FC<{t: number}> = ({t}) => {
  const tr = tourist(t), k2 = komodo2(t);
  return (
    <>
      <Rig shadowCenter={[0, 0, 0]} shadowSize={22} />
      <Savanna />
      <Goat p={GOAT} ry={0.3} />
      <Komodo p={K1} ry={face([K1[0], K1[2]], [GOAT[0], GOAT[2]]) + 0.1} s={1.08} pose={feeding(t)} />
      <Figure p={tr.p} ry={tr.ry} role="tourist" pose={tr.pose} />
      {t > T.s3 - 0.5 && <Komodo p={k2.p} ry={k2.ry} s={0.78} pose={k2.pose} />}
    </>
  );
};

/* ---------------- S1 ---------------- */
const S1: SceneDef = {
  id: 1, World: CaseWorld,
  cam: (t) => ({fov: keys1(t, [[0, 40], [T.s2, 32]]), pos: keys3(t, [[0, [-26, 19, 36]], [T.s2, [-14.5, 3.6, 14.5]]]), look: keys3(t, [[0, [-1, 1.5, 0]], [T.s2, [-1.5, 0.8, 1.0]]])}),
  Overlay: ({t}) => (
    <>
      <SerifTitle t={t} a={0.0} b={T.s2 - 0.25} top={SAFE_TOP + 40} lines={[{text: 'PULAU KOMODO', cap: 124, ls: '0.04em'}, {text: 'MEI 2017', cap: 70, weight: '600', ls: '0.2em'}]} />
      <Chip t={t} a={1.2} b={T.s4} top={SAFE_TOP + 330} label={ILU} credit={CASE17} />
    </>
  ),
};

/* ---------------- S2 ---------------- */
const S2: SceneDef = {
  id: 2, World: CaseWorld,
  cam: (t) => ({fov: 30, pos: keys3(t, [[T.s2, [-13.2, 3.2, 13.0]], [T.s3, [-12.0, 2.7, 11.6]]]), look: keys3(t, [[T.s2, [0.6, 0.7, 0.8]], [T.s3, [1.0, 0.6, 0.8]]])}),
  Overlay: ({t}) => <Chip t={t} a={T.s2} b={T.s4} label={ILU} credit={CASE17} />,
};

/* ---------------- S3 ---------------- */
const S3: SceneDef = {
  id: 3, World: CaseWorld,
  cam: (t) => {
    const shake = t > T.bite && t < T.bite + 0.5 ? Math.sin(t * 70) * 0.05 * (1 - ramp(t, T.bite, T.bite + 0.5)) : 0;
    return {
      fov: 30,
      pos: keys3(t, [[T.s3, [-12.0, 2.7, 11.6]], [T.samping - 0.2, [-14.0, 3.0, 5.0]], [T.samping + 2.2, [-13.6, 3.4, -4.0]], [T.bite, [-12.6, 3.2, -5.6]], [sc(3).end_s, [-13.0, 3.4, -6.0]]]).map((v, i) => v + (i === 1 ? shake : 0)) as V3,
      look: keys3(t, [[T.s3, [1.0, 0.6, 0.8]], [T.samping - 0.2, [0.0, 0.7, 0.6]], [T.samping + 2.2, [-1.6, 0.5, -2.6]], [T.bite, [-1.4, 0.6, 0.8]], [sc(3).end_s, [-1.4, 0.5, 1.0]]]),
    };
  },
  Overlay: ({t}) => <Chip t={t} a={T.s3} b={T.s4} label={ILU} credit={CASE17} />,
};

/* ---------------- S4 — simplified jaw cutaway + vessel ---------------- */
const S4T = {kel: wt(5, 'kelenjar'), rac: wt(5, 'racunnya'), darah: wt(5, 'darah'), tek: wt(5, 'tekanan'), luka: wt(5, 'luka'), end: sc(4).end_s};
const JAW_Y = 1.3, VES_Y = -1.05, HS = 5.6; // head model scale (same head/jaw geometry as the hero komodo)
const TEETH = Array.from({length: 12}, (_, i) => 0.07 + i * 0.032);
const GLANDS: [number, number][] = [[0.08, 0.03], [0.15, 0.032], [0.22, 0.032], [0.29, 0.03], [0.36, 0.025]];
const jawShell = new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.92, metalness: 0, transparent: true, opacity: 0.32, depthWrite: false});
const venomMats = (t: number) => {
  const out: THREE.Matrix4[] = [];
  const k = ramp(t, S4T.rac, S4T.rac + 0.4);
  if (k <= 0) return out;
  GLANDS.forEach(([gx], gi) => {
    for (let j = 0; j < 4; j++) {
      const u = ((t - S4T.rac) * 0.8 + j / 4 + gi * 0.13) % 1;
      const p = new THREE.Vector3(gx + u * 0.012, -0.005 + u * 0.04, 0.0);
      out.push(new THREE.Matrix4().compose(p, new THREE.Quaternion(), new THREE.Vector3(0.0065, 0.0065, 0.0065).multiplyScalar(k)));
    }
  });
  return out;
};
const VenomParticles: React.FC<{t: number}> = ({t}) => {
  const m = venomMats(t);
  const mesh = useMemo(() => new THREE.InstancedMesh(G.sphereLo, new THREE.MeshStandardMaterial({color: '#F2D04A', emissive: '#F0B020', emissiveIntensity: 1.4, roughness: 0.9}), 40), []);
  mesh.count = m.length;
  m.forEach((mm, i) => mesh.setMatrixAt(i, mm));
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
const Cells: React.FC<{t: number}> = ({t}) => {
  const widen = ease(ramp(t, S4T.tek, S4T.tek + 0.8));
  const r = lerp(0.32, 0.5, widen);
  const speed = lerp(1.1, 0.45, widen);
  const show = ramp(t, S4T.darah - 0.3, S4T.darah + 0.2);
  const rnd = useMemo(() => {const g = mulberry32(77); return Array.from({length: 46}, () => [g(), g(), g()]);}, []);
  const mesh = useMemo(() => new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 0.35, 14), mat('#C9332B', {rough: 0.6}), 46), []);
  rnd.forEach(([a, b, c], i) => {
    const u = ((t * speed * 0.35 + a) % 1);
    const x = -1.7 + u * 3.4;
    const ang = b * Math.PI * 2, rr = c * (r - 0.11);
    mesh.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, VES_Y + Math.sin(ang) * rr, Math.cos(ang) * rr),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(a * 3, b * 3, c * 3)), new THREE.Vector3(0.085, 0.085, 0.085).multiplyScalar(show)));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = false;
  return (
    <>
      <primitive object={mesh} />
      <mesh position={[0, VES_Y, 0]} rotation={[0, 0, Math.PI / 2]} scale={[r, 3.6, r]}>
        <cylinderGeometry args={[1, 1, 1, 28, 1, true]} />
        <meshStandardMaterial color="#E07A6A" roughness={0.9} transparent opacity={0.28 * show} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </>
  );
};
const JawWorld: React.FC<{t: number}> = ({t}) => {
  const glow = ramp(t, S4T.kel - 0.1, S4T.kel + 0.4);
  const gmat = useMemo(() => new THREE.MeshStandardMaterial({color: '#D9782A', roughness: 0.9, emissive: '#FF7A1A', emissiveIntensity: 0}), []);
  gmat.emissiveIntensity = 0.1 + glow * (1.5 + 0.4 * Math.sin(t * 6));
  const open = 0.1 + 0.04 * Math.sin(t * 1.4);
  return (
    <>
      <Rig sky={false} fogColor={'#2A1F16'} fogNear={14} fogFar={60} shadowCenter={[0, 0, 0]} shadowSize={8} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow material={mat('#3A2C1F')}><planeGeometry args={[80, 80]} /></mesh>
      {Array.from({length: 17}, (_, i) => (
        <React.Fragment key={i}>
          <B g={G.box} c={'#4D3B29'} p={[-16 + i * 2, -2.59, 0]} s={[0.03, 0.01, 40]} shadow={false} />
          <B g={G.box} c={'#4D3B29'} p={[0, -2.59, -16 + i * 2]} s={[40, 0.01, 0.03]} shadow={false} />
        </React.Fragment>
      ))}
      <group position={[-1.25, JAW_Y, 0]} scale={HS} rotation={[0, 0.12, 0]}>
        {/* upper head: same geometry as the hero komodo */}
        <mesh geometry={headGeo} material={komodoVC} castShadow position={[0, 0.02, 0]} />
        <mesh geometry={G.sphere} material={mat(PAL.komodoDark)} position={[-0.07, 0.02, 0]} scale={[0.07, 0.09, 0.1]} />
        <mesh geometry={G.sphere} material={mat('#17110B')} position={[0.2, 0.065, 0.068]} scale={0.016} />
        {TEETH.map((x, i) => <mesh key={i} geometry={G.cone} material={mat('#EFE6D2', {rough: 0.6})} position={[x, -0.035, 0.05]} rotation={[0, 0, Math.PI + 0.3]} scale={[0.006, 0.02, 0.004]} />)}
        {/* lower jaw: cutaway shell + venom glands + ducts + teeth */}
        <group position={[0, -0.035, 0]} rotation={[0, 0, -open]}>
          <mesh geometry={jawGeo} material={jawShell} />
          {GLANDS.map(([gx, r], i) => <mesh key={i} geometry={G.sphere} material={gmat} position={[gx, -0.008, 0.02]} scale={[r, 0.012, 0.022]} />)}
          {GLANDS.map(([gx], i) => <mesh key={i} geometry={G.cyl} material={gmat} position={[gx + 0.006, 0.012, 0.03]} rotation={[0, 0, -0.3]} scale={[0.0025, 0.028, 0.0025]} />)}
          {TEETH.map((x, i) => <mesh key={i} geometry={G.cone} material={mat('#EFE6D2', {rough: 0.6})} position={[x, 0.03, 0.05]} rotation={[0, 0, 0.3]} scale={[0.006, 0.02, 0.004]} />)}
          <group position={[0, 0, 0.03]}><VenomParticles t={t} /></group>
        </group>
      </group>
      <Cells t={t} />
    </>
  );
};
const S4: SceneDef = {
  id: 4, World: JawWorld,
  cam: (t) => ({pos: keys3(t, [[T.s4, [-0.8, 1.0, 10.6]], [S4T.end, [0.6, 0.2, 9.8]]]), look: keys3(t, [[T.s4, [0, 0.2, 0]], [S4T.end, [0.1, 0, 0]]])}),
  Overlay: ({t}) => {
    const cam = S4.cam(t);
    const g = project(cam, [-1.25 + 0.22 * HS, JAW_Y - 0.043 * HS, 0.1 * HS]);
    return (
      <>
        <Chip t={t} a={T.s4} b={S4T.end} label="DISEDERHANAKAN" credit="FRY DKK. 2009 · PNAS" />
        <Leader t={t} a={S4T.kel} b={S4T.end} x={g.x} y={g.y} dx={-150} dy={-200} text="KELENJAR BISA" />
        <ReadoutStack t={t} b={S4T.end} top={850} cap={46} items={[
          {text: 'DARAH SULIT MEMBEKU', a: S4T.darah},
          {text: 'TEKANAN DARAH ANJLOK', a: S4T.tek, prefix: '↓  '},
          {text: 'LUKA BERDARAH LEBIH LAMA', a: S4T.luka, prefix: '↓  ', accent: true},
        ]} />
      </>
    );
  },
};

/* ---------------- S5 — 2009 flashback ---------------- */
const COAST5: TerrainOpts = {flat: 30, islandR: 150, hill: 7, offset: [0, -140]};
const S5T = {a: sc(5).start_s, flores: wt(6, 'flores'), end: sc(5).end_s};
const boat5 = (t: number): V3 => {const k = ramp(t, S5T.a, S5T.end); return [lerp(-4, 18, k), -0.32, lerp(-26, -80, k)];};
const FLORES: V3 = [70, 6, -330];
const FlashWorld: React.FC<{t: number}> = ({t}) => (
  <>
    <Rig shadowCenter={[0, 0, -4]} shadowSize={22} />
    <Terrain {...COAST5} />
    <Sea />
    <B c={'#8FA3A0'} p={FLORES} s={[150, 20, 30]} shadow={false} />
    <B c={'#9BAAA2'} p={[-110, 2, -360]} s={[90, 14, 25]} shadow={false} />
    <Palms seed={12} count={20} rMin={12} rMax={70} avoid={[[0, -30, 26]]} to={COAST5} />
    <Bushes seed={22} count={30} rMin={8} rMax={70} avoid={[[0, -30, 26], [0, 0, 6]]} to={COAST5} />
    <Grass seed={32} count={900} rMin={1} rMax={40} to={COAST5} />
    <Clouds seed={8} count={10} />
    <SrikayaTree p={[0, gy(0, 0, COAST5), 0]} s={1.05} />
    <Komodo p={[1.7, gy(1.7, 1.5, COAST5), 1.5]} ry={2.6} s={1.0} pose={{lie: 1, headPitch: 0.25 + 0.05 * Math.sin(t * 1.1), tail: t * 0.6, headYaw: 0.2}} />
    <Komodo p={[-1.6, gy(-1.6, 1.9, COAST5), 1.9]} ry={0.5} s={0.95} pose={{lie: 1, headPitch: 0.3, tail: t * 0.5 + 1, headYaw: -0.15 * Math.sin(t * 0.8)}} />
    <WoodBoat p={boat5(t)} ry={face([-4, -26], [18, -80])} roll={0.04 * Math.sin(t * 2)} />
  </>
);
const S5: SceneDef = {
  id: 5, World: FlashWorld, grade: 'sepia(0.55) saturate(0.75) contrast(1.02)',
  cam: (t) => ({fov: 36, pos: keys3(t, [[S5T.a, [-5.5, 3.2, 15]], [S5T.end, [-8.5, 7.5, 20]]]), look: keys3(t, [[S5T.a, [0, 1.8, 0]], [S5T.end, [6, 0, -40]]])}),
  Overlay: ({t}) => {
    const f = project(S5.cam(t), FLORES.map((v, i) => (i === 1 ? 22 : v)) as V3);
    return (
      <>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(30,18,8,0.55) 100%)'}} />
        <SerifTitle t={t} a={S5T.a} b={S5T.flores - 0.5} top={SAFE_TOP + 40} lines={[{text: '2009', cap: 110, ls: '0.1em'}, {text: 'MUHAMAD ANWAR', cap: 72, weight: '600', ls: '0.1em'}]} />
        <Chip t={t} a={S5T.a + 0.3} b={S5T.end} top={SAFE_TOP + 290} label={ILU} credit="KASUS 2009 — THE GUARDIAN" />
        {f.vis && <Leader t={t} a={S5T.flores - 0.2} b={S5T.end} x={f.x} y={f.y} dx={0} dy={-90} text="FLORES" />}
      </>
    );
  },
};

/* ---------------- S6 — rescue: boat -> Labuan Bajo -> clinic ---------------- */
const HARB: TerrainOpts = {flat: 80, islandR: 150, hill: 9, offset: [-172, 0]};
const S6T = {a: sc(6).start_s, perahu: wt(7, 'perahu'), labuan: wt(7, 'labuan'), rs: wt(7, 'rumah'), sel: wt(7, 'ia', 0), end: sc(6).end_s};
const boat6 = (t: number): V3 => {const k = ease(ramp(t, S6T.a - 0.2, S6T.rs - 0.3)); return [lerp(-34, 6.5, k), -0.25, lerp(4, 2.4, k)];};
const CLINIC: V3 = [36, 0, -3];
const Wake: React.FC<{p: V3; t: number}> = ({p, t}) => {
  const mesh = useMemo(() => new THREE.InstancedMesh(G.sphereLo, mat('#F4F1E8', {rough: 1}), 40), []);
  const speed = 1 - ramp(t, S6T.rs - 0.9, S6T.rs - 0.2);
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
    const s = Math.max(0.01, (0.55 - k * 0.025) * speed * (0.8 + 0.2 * Math.sin(t * 9 + i)));
    mesh.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(p[0] - 1.8 - k * 0.9, -0.28, p[2] + side * (0.5 + k * 0.12)), new THREE.Quaternion(), new THREE.Vector3(s * 1.4, s * 0.25, s)));
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
const RescueWorld: React.FC<{t: number}> = ({t}) => {
  const b = boat6(t);
  const ks = ramp(t, S6T.rs - 0.4, S6T.end + 0.2);
  const sx = lerp(22.5, 31.5, ks), sz = lerp(1.2, -2.6, ks);
  const cy = gy(CLINIC[0], CLINIC[2], HARB);
  return (
    <>
      <Rig shadowCenter={[14, 0, 0]} shadowSize={30} />
      <Terrain {...HARB} />
      <Sea />
      <Clouds seed={9} count={10} drift={0} />
      <Palms seed={13} count={18} rMin={10} rMax={60} center={[50, 0]} avoid={[[36, -3, 10], [26, 0, 6]]} to={HARB} />
      <Bushes seed={24} count={22} rMin={6} rMax={50} center={[44, 0]} avoid={[[36, -3, 10], [26, 0, 7]]} to={HARB} />
      <Clinic p={[CLINIC[0], cy, CLINIC[2]]} ry={-Math.PI / 2} />
      <Pier p={[6.5, -0.4, 0.0]} len={16} />
      <SpeedBoat p={b} ry={0} roll={0.03 * Math.sin(t * 3)} pitch={0.04 * (1 - ramp(t, S6T.rs - 0.9, S6T.rs - 0.2))} people={t < S6T.rs - 0.4} />
      <Wake p={b} t={t} />
      {t >= S6T.rs - 0.4 && <StretcherGroup p={[sx, gy(sx, sz, HARB), sz]} ry={face([22.5, 1.2], [31.5, -2.6])} walk={t * 8} walkAmt={ks < 1 ? 1 : 0} />}
      {t >= S6T.rs - 0.4 && <Figure p={[sx - 2.6, gy(sx - 2.6, sz + 1.2, HARB), sz + 1.2]} ry={face([22.5, 1.2], [31.5, -2.6])} role="ranger" pose={{walk: t * 8 + 1, walkAmt: ks < 1 ? 1 : 0}} />}
    </>
  );
};
const S6: SceneDef = {
  id: 6, World: RescueWorld,
  cam: (t) => {
    const b = boat6(t);
    const k = ease(ramp(t, S6T.labuan - 0.5, S6T.rs + 0.4));
    const trackPos: V3 = [b[0] - 7, 4.4, b[2] + 14.5], trackLook: V3 = [b[0] + 1.5, 0.5, b[2]];
    const shorePos: V3 = [16.5, 5.2, 15.5], shoreLook: V3 = [29, 1.2, -1.8];
    return {pos: [lerp(trackPos[0], shorePos[0], k), lerp(trackPos[1], shorePos[1], k), lerp(trackPos[2], shorePos[2], k)], look: [lerp(trackLook[0], shoreLook[0], k), lerp(trackLook[1], shoreLook[1], k), lerp(trackLook[2], shoreLook[2], k)]};
  },
  Overlay: ({t}) => {
    const c = project(S6.cam(t), [CLINIC[0] - 1, 5.5, CLINIC[2]]);
    return (
      <>
        <Chip t={t} a={S6T.a} b={S6T.end} label={ILU} credit={CASE17} />
        {c.vis && <Leader t={t} a={S6T.labuan} b={S6T.sel - 0.1} x={c.x} y={c.y} dx={-60} dy={-160} text="LABUAN BAJO" />}
        <SerifTitle t={t} a={S6T.sel} b={S6T.end + 0.4} top={SAFE_TOP + 120} lines={[{text: 'IA SELAMAT', cap: 118, ls: '0.06em'}]} />
      </>
    );
  },
};

/* ---------------- S7 — safety lesson + closing ---------------- */
const S7T = {a: sc(7).start_s, jaga: wt(8, 'jaga'), jangan: wt(8, 'jangan'), awasi: wt(8, 'awasi'), bukan: wt(8, 'bukan'), close: sent(9).start_s, detik: wt(9, 'detik'), end: sc(7).end_s};
const groupX = (t: number) => lerp(-7, -1.5, ramp(t, S7T.a, S7T.close + 1.5));
const K7: V3 = [4, 0, -4];
const LessonWorld: React.FC<{t: number}> = ({t}) => {
  const gx = groupX(t);
  const walking = t < S7T.close + 1.5;
  const look = (i: number) => ramp(t, S7T.awasi - 0.1, S7T.awasi + 0.4) * (1 - ramp(t, S7T.close, S7T.close + 0.6)) * (i % 2 ? 1 : -1) * 0.9 * Math.sin((t - S7T.awasi) * 2.4 + i);
  const ring = ramp(t, S7T.jaga - 0.1, S7T.jaga + 0.5) * (1 - ramp(t, S7T.end - 1.2, S7T.end - 0.4));
  const people: [number, number, 'ranger' | 'tourist'][] = [[1.6, 0.0, 'ranger'], [0.3, 0.6, 'tourist'], [-0.6, -0.5, 'tourist'], [-1.6, 0.4, 'tourist']];
  const alert = ease(ramp(t, S7T.detik - 0.1, S7T.detik + 0.25));
  return (
    <>
      <Rig shadowCenter={[0, 0, 0]} shadowSize={24} />
      <Savanna />
      {people.map(([dx, dz, role], i) => (
        <Figure key={i} p={[gx + dx, 0, dz]} ry={0} role={role} pose={{walk: t * 7 + i * 1.3, walkAmt: walking ? 0.8 : 0, headYaw: look(i), cam: role === 'tourist' && i === 1 ? 0 : 0}} />
      ))}
      <Ring p={[gx, 0.12, 0]} r={4.6} o={ring * 0.9} />
      <Ring p={[gx, 0.11, 0]} r={4.3} o={ring * 0.35} />
      <Komodo p={K7} ry={face([K7[0], K7[2]], [gx, 0]) - 1.2} s={1.0} pose={{lie: 1 - alert, headPitch: 0.1 + alert * 0.3, headYaw: alert * 0.25, walk: alert * 2, walkAmt: alert * 0.3, tongue: alert * Math.max(0, Math.sin(t * 8)), tail: t}} />
    </>
  );
};
const S7: SceneDef = {
  id: 7, World: LessonWorld,
  cam: (t) => ({
    fov: keys1(t, [[S7T.a, 34], [S7T.close, 34], [S7T.end, 40]]),
    pos: keys3(t, [[S7T.a, [-16, 7.5, 14.5]], [S7T.close, [-14, 6.4, 12]], [S7T.end, [-46, 30, 62]]]),
    look: keys3(t, [[S7T.a, [-3.5, 0.4, -0.5]], [S7T.close, [-0.5, 0.4, -0.5]], [S7T.end, [2, 4, -10]]]),
  }),
  Overlay: ({t}) => (
    <>
      <ReadoutStack t={t} b={S7T.close - 0.1} top={SAFE_TOP + 40} cap={56} items={[
        {text: 'JAGA JARAK', a: S7T.jaga, prefix: '1  '},
        {text: 'JANGAN BERPISAH DARI RANGER', a: S7T.jangan, prefix: '2  '},
        {text: 'AWASI SEKELILINGMU', a: S7T.awasi, prefix: '3  ', accent: true},
      ]} />
      <SerifTitle t={t} a={S7T.close + 0.1} b={S7T.end + 1} top={SAFE_TOP + 60} lines={[{text: 'PULAU KOMODO', cap: 124, ls: '0.04em'}]} />
    </>
  ),
};

export const SCENES: SceneDef[] = [S1, S2, S3, S4, S5, S6, S7];
export {env, clamp, keys1};
