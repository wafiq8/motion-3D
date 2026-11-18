import React from 'react';
import * as THREE from 'three';
import {PAL, mat} from './style';
import {G, B} from './world';
import {V3} from './math';

/* =========================================================
   KOMODO — procedural hero (forward = +x, origin on ground)
   Smooth elliptical tube body (neck→tail tip) + tube head
   + jointed sprawling legs. Vertex colours: dark dorsal,
   olive-grey flanks, pale belly, fine deterministic mottling.
   ========================================================= */
export type KomodoPose = {
  walk?: number; walkAmt?: number; headYaw?: number; headPitch?: number; jaw?: number;
  lunge?: number; tail?: number; tongue?: number; lie?: number; eat?: number; bodyYaw?: number;
};
const kSkin = () => mat(PAL.komodo, {rough: 0.95});
const kDark = () => mat(PAL.komodoDark, {rough: 0.95});
const kVC = new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.92, metalness: 0});
const C_D = new THREE.Color('#4A4232'), C_S = new THREE.Color('#6E6249'), C_B = new THREE.Color('#9A8B68');

type Prof = [number, number, number, number][]; // x, wz, wy, yc
const interp = (p: Prof, x: number) => {
  // p sorted by descending x
  if (x >= p[0][0]) return p[0];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i], b = p[i + 1];
    if (x >= b[0]) {
      const k = (x - b[0]) / (a[0] - b[0]);
      const s = k * k * (3 - 2 * k);
      return [x, b[1] + (a[1] - b[1]) * s, b[2] + (a[2] - b[2]) * s, b[3] + (a[3] - b[3]) * s] as [number, number, number, number];
    }
  }
  return p[p.length - 1];
};
const hash2 = (a: number, b: number) => {const s = Math.sin(a * 91.7 + b * 47.3) * 43758.5; return s - Math.floor(s);};

/** elliptical tube along x with lateral offset fn; capped ends */
const tubeGeo = (prof: Prof, n: number, radial: number, zOff: (x: number) => number) => {
  const x0 = prof[0][0], x1 = prof[prof.length - 1][0];
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * (i / n);
    const [, wz, wy, yc] = interp(prof, x);
    const z0 = zOff(x);
    for (let j = 0; j < radial; j++) {
      const th = (j / radial) * Math.PI * 2;
      const sy = Math.sin(th), cz = Math.cos(th);
      // flatter belly
      const yy = sy < 0 ? sy * 0.8 : sy;
      pos.push(x, yc + yy * wy, z0 + cz * wz);
      const c = sy > 0.35 ? C_S.clone().lerp(C_D, Math.min(1, (sy - 0.35) / 0.5)) : C_S.clone().lerp(C_B, Math.min(1, (0.35 - sy) / 0.9));
      const m = 0.9 + 0.2 * hash2(Math.floor(x * 40), j);
      col.push(c.r * m, c.g * m, c.b * m);
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
    const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, d = b + radial;
    idx.push(a, c, b, b, c, d);
  }
  // caps
  const capFront = pos.length / 3; const f = prof[0];
  pos.push(f[0], f[3], zOff(f[0])); col.push(C_S.r, C_S.g, C_S.b);
  for (let j = 0; j < radial; j++) idx.push(capFront, j, (j + 1) % radial);
  const capBack = pos.length / 3; const l = prof[prof.length - 1];
  pos.push(l[0], l[3], zOff(l[0])); col.push(C_S.r, C_S.g, C_S.b);
  for (let j = 0; j < radial; j++) idx.push(capBack, n * radial + ((j + 1) % radial), n * radial + j);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};
const BODY: Prof = [
  [0.92, 0.1, 0.1, 0.07], [0.7, 0.14, 0.135, 0.05], [0.42, 0.24, 0.19, 0.01], [0.05, 0.3, 0.215, 0], [-0.35, 0.26, 0.2, 0],
  [-0.68, 0.17, 0.15, -0.04], [-1.05, 0.105, 0.095, -0.11], [-1.45, 0.06, 0.055, -0.19], [-1.9, 0.012, 0.012, -0.25],
];
const HEAD: Prof = [[0.5, 0.03, 0.026, -0.02], [0.43, 0.066, 0.043, -0.012], [0.28, 0.092, 0.062, 0], [0.12, 0.115, 0.085, 0.01], [-0.06, 0.1, 0.09, 0]];
const JAW: Prof = [[0.47, 0.026, 0.014, 0], [0.3, 0.07, 0.024, 0], [0.08, 0.09, 0.035, 0], [-0.02, 0.08, 0.035, 0]];
export const headGeo = tubeGeo(HEAD, 20, 16, () => 0);
export const jawGeo = tubeGeo(JAW, 14, 12, () => 0);
export const komodoVC = kVC;

const UP = new THREE.Vector3(0, 1, 0);
/** capsule between two points */
export const Seg: React.FC<{a: V3; b: V3; r: number; m: THREE.Material}> = ({a, b, r, m}) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const d = vb.clone().sub(va), len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.normalize());
  const mid = va.add(vb).multiplyScalar(0.5);
  return <mesh geometry={G.capsule} material={m} castShadow position={mid} quaternion={q} scale={[r, Math.max(0.005, len / 2 - r), r]} />;
};
const Leg: React.FC<{p: V3; side: 1 | -1; swing: number; lift: number; bodyY: number; front: boolean; raise?: number}> = ({p, side, swing, lift, bodyY, front, raise = 0}) => {
  // sprawling reptile leg: upper limb goes out sideways, forearm down to the ground, elbow out
  const dx = Math.sin(swing) * 0.2;
  const elbow: V3 = [dx * 0.4 + (front ? -0.02 : 0.03), -0.02 + lift * 0.6 + raise * 0.12, side * 0.2];
  const foot: V3 = [dx + (front ? 0.07 : -0.02) + raise * 0.14, -bodyY - p[1] + 0.04 + lift * 1.3 + raise * 0.2, side * 0.25];
  return (
    <group position={p}>
      <Seg a={[0, 0, 0]} b={elbow} r={0.085} m={kSkin()} />
      <Seg a={elbow} b={foot} r={0.065} m={kSkin()} />
      <mesh geometry={G.sphere} material={kDark()} castShadow position={[foot[0] + 0.05, foot[1] - 0.015, foot[2]]} scale={[0.1, 0.03, 0.075]} />
      {[-0.045, -0.015, 0.015, 0.045].map((cz, i) => (
        <mesh key={i} geometry={G.cone} material={mat('#2C261C')} position={[foot[0] + 0.15, foot[1] - 0.02, foot[2] + cz * 1.2]} rotation={[0, 0, -Math.PI / 2]} scale={[0.012, 0.05, 0.012]} />
      ))}
    </group>
  );
};

export const Komodo: React.FC<{p?: V3; ry?: number; s?: number; pose?: KomodoPose}> = ({p = [0, 0, 0], ry = 0, s = 1, pose = {}}) => {
  const {walk = 0, walkAmt = 0, headYaw = 0, headPitch = 0, jaw = 0, lunge = 0, tail = 0, tongue = 0, lie = 0, eat = 0} = pose;
  const bodyY = 0.34 - lie * 0.13 + lunge * 0.06;
  const pitch = lunge * 0.16 - eat * 0.04;
  const phase = (o: number) => Math.sin(walk + o);
  const lift = (o: number) => Math.max(0, Math.cos(walk + o)) * 0.06 * walkAmt;
  const swingA = 1.0 * walkAmt;
  const amp = 0.05 + 0.1 * walkAmt;
  const zOff = (x: number) => {
    const w = x > -0.4 ? 0.35 : 0.35 + ((-0.4 - x) / 1.5) * 1.2;
    return Math.sin(walk - 2.0 * x) * amp * w + Math.sin(tail - 2.6 * x) * 0.06 * Math.max(0, -x - 0.6);
  };
  // rebuild body each frame (deterministic from pose)
  const bodyGeo = tubeGeo(BODY, 46, 18, zOff);
  React.useEffect(() => () => bodyGeo.dispose(), [bodyGeo]);
  const neckZ = zOff(0.92);
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      <group position={[lunge * 0.35, bodyY, 0]} rotation={[0, 0, pitch]}>
        <mesh geometry={bodyGeo} material={kVC} castShadow receiveShadow />
        {/* head */}
        <group position={[0.86, 0.075, neckZ]} rotation={[0, headYaw - zOff(0.5) * 1.5, headPitch - eat * 0.6 + lunge * 0.2]}>
          <mesh geometry={headGeo} material={kVC} castShadow position={[0.0, 0.02, 0]} />
          <mesh geometry={G.sphere} material={mat('#17110B')} position={[0.2, 0.065, 0.068]} scale={0.016} />
          <mesh geometry={G.sphere} material={mat('#17110B')} position={[0.2, 0.065, -0.068]} scale={0.016} />
          <mesh geometry={G.sphere} material={kDark()} position={[0.19, 0.078, 0.06]} scale={[0.04, 0.012, 0.02]} />
          <mesh geometry={G.sphere} material={kDark()} position={[0.19, 0.078, -0.06]} scale={[0.04, 0.012, 0.02]} />
          <group position={[0.0, -0.035, 0]} rotation={[0, 0, -jaw * 0.5]}>
            <mesh geometry={jawGeo} material={kVC} castShadow />
            {jaw > 0.05 && <mesh geometry={G.sphere} material={mat('#9C6050')} position={[0.24, 0.022, 0]} scale={[0.2, 0.01, 0.055]} />}
          </group>
          {tongue > 0.02 && (
            <group position={[0.48, -0.03, 0]}>
              <mesh geometry={G.cyl} material={mat('#D9B23A')} position={[0.06 * tongue, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.007, 0.12 * tongue, 0.007]} />
              <mesh geometry={G.cyl} material={mat('#D9B23A')} position={[0.13 * tongue, 0, 0.013]} rotation={[0.5, 0, Math.PI / 2]} scale={[0.006, 0.05 * tongue, 0.006]} />
              <mesh geometry={G.cyl} material={mat('#D9B23A')} position={[0.13 * tongue, 0, -0.013]} rotation={[-0.5, 0, Math.PI / 2]} scale={[0.006, 0.05 * tongue, 0.006]} />
            </group>
          )}
        </group>
        {/* legs (diagonal gait) */}
        <Leg p={[0.42, -0.04, 0.17 + zOff(0.42)]} side={1} front swing={phase(0) * swingA} lift={lift(0)} bodyY={bodyY} raise={lunge} />
        <Leg p={[0.42, -0.04, -0.17 + zOff(0.42)]} side={-1} front swing={phase(Math.PI) * swingA} lift={lift(Math.PI)} bodyY={bodyY} raise={lunge} />
        <Leg p={[-0.42, -0.04, 0.16 + zOff(-0.42)]} side={1} front={false} swing={phase(Math.PI) * swingA} lift={lift(Math.PI)} bodyY={bodyY} />
        <Leg p={[-0.42, -0.04, -0.16 + zOff(-0.42)]} side={-1} front={false} swing={phase(0) * swingA} lift={lift(0)} bodyY={bodyY} />
      </group>
    </group>
  );
};

/* =========================================================
   FIGURE — "siluet plus": proportioned, jointed, faceless,
   dark neutral base + max ONE muted role colour. Faces +x.
   ========================================================= */
export type Role = 'tourist' | 'ranger' | 'plain';
export type FigPose = {
  walk?: number; walkAmt?: number; cam?: number; fall?: number; headYaw?: number; headPitch?: number;
  carry?: number; lying?: number; stagger?: number;
};
const FIG = () => mat(PAL.figur, {rough: 0.85});
const Limb: React.FC<{len: number; r: number; children?: React.ReactNode; rot: V3; p: V3}> = ({len, r, children, rot, p}) => (
  <group position={p} rotation={rot}>
    <mesh geometry={G.capsule} material={FIG()} castShadow position={[0, -len / 2, 0]} scale={[r, Math.max(0.01, len / 2 - r), r]} />
    <group position={[0, -len, 0]}>{children}</group>
  </group>
);

export const Figure: React.FC<{p?: V3; ry?: number; role?: Role; pose?: FigPose; s?: number}> = ({p = [0, 0, 0], ry = 0, role = 'plain', pose = {}, s = 1}) => {
  const {walk = 0, walkAmt = 0, cam = 0, fall = 0, headYaw = 0, headPitch = 0, carry = 0, stagger = 0} = pose;
  const sw = Math.sin(walk) * 0.5 * walkAmt;
  const knee = (o: number) => Math.max(0, Math.sin(walk + o + 1.2)) * 0.7 * walkAmt;
  const bob = Math.abs(Math.cos(walk)) * 0.03 * walkAmt;
  const hipY = 0.92 + bob - fall * 0.35;
  const role1 = role === 'tourist' ? mat(PAL.tourist, {rough: 0.6}) : mat(PAL.ranger, {rough: 0.9});
  // arm angles (rotation about z = forward/back swing; x = sideways)
  const flail = fall * 0.7 + stagger * 0.6;
  const armUR = -sw * 0.8 * (1 - cam) * (1 - carry) + cam * 1.25 + carry * 0.6 + flail;
  const armUL = sw * 0.8 * (1 - cam) * (1 - carry) + cam * 1.25 + carry * 0.6 + flail * 0.7;
  const fore = cam * 1.55 + carry * 0.5 + 0.15;
  const fallRot = fall * 1.25 + stagger * 0.25;
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      <group rotation={[fall * 0.35, 0, fallRot]} position={[-fall * 0.45, 0, 0]}>
        {/* legs */}
        <Limb p={[0, hipY, 0.09]} len={0.45} r={0.068} rot={[0, 0, sw + fall * 0.9]}>
          <Limb p={[0, 0, 0]} len={0.44} r={0.058} rot={[0, 0, -knee(0) - fall * 0.6]}>
            <mesh geometry={G.box} material={FIG()} position={[0.05, -0.0, 0]} scale={[0.22, 0.06, 0.09]} castShadow />
          </Limb>
        </Limb>
        <Limb p={[0, hipY, -0.09]} len={0.45} r={0.068} rot={[0, 0, -sw + fall * 0.4]}>
          <Limb p={[0, 0, 0]} len={0.44} r={0.058} rot={[0, 0, -knee(Math.PI) - fall * 0.3]}>
            <mesh geometry={G.box} material={FIG()} position={[0.05, -0.0, 0]} scale={[0.22, 0.06, 0.09]} castShadow />
          </Limb>
        </Limb>
        {/* torso */}
        <group position={[0, hipY, 0]} rotation={[0, 0, -cam * 0.08 + carry * 0.05]}>
          <mesh geometry={G.capsule} material={FIG()} castShadow position={[0, 0.3, 0]} scale={[0.15, 0.2, 0.19]} />
          <mesh geometry={G.capsule} material={FIG()} castShadow position={[0, 0.06, 0]} scale={[0.14, 0.06, 0.17]} />
          {/* neck + faceless head */}
          <group position={[0, 0.6, 0]} rotation={[0, headYaw, headPitch]}>
            <mesh geometry={G.cyl} material={FIG()} position={[0, 0.04, 0]} scale={[0.05, 0.1, 0.05]} />
            <mesh geometry={G.sphere} material={FIG()} castShadow position={[0, 0.19, 0]} scale={[0.11, 0.13, 0.105]} />
            {role === 'ranger' && (
              <>
                <mesh geometry={G.cyl} material={role1} castShadow position={[0, 0.28, 0]} scale={[0.21, 0.018, 0.21]} />
                <mesh geometry={G.cyl} material={role1} castShadow position={[0, 0.33, 0]} scale={[0.115, 0.08, 0.115]} />
              </>
            )}
          </group>
          {/* arms */}
          <Limb p={[0, 0.5, 0.21]} len={0.29} r={0.047} rot={[-0.12 - stagger * 0.3, 0, armUR]}>
            <Limb p={[0, 0, 0]} len={0.27} r={0.042} rot={[0, 0, fore]}>
              {role === 'ranger' && (
                <group rotation={[0, 0, -armUR - fore]}>
                  <mesh geometry={G.cyl} material={role1} castShadow position={[0.04, 0.05, 0]} rotation={[0, 0, -0.12]} scale={[0.018, 1.7, 0.018]} />
                  <mesh geometry={G.cyl} material={role1} position={[0.17, 0.95, 0.04]} rotation={[0.35, 0, -0.12]} scale={[0.014, 0.22, 0.014]} />
                  <mesh geometry={G.cyl} material={role1} position={[0.17, 0.95, -0.04]} rotation={[-0.35, 0, -0.12]} scale={[0.014, 0.22, 0.014]} />
                </group>
              )}
            </Limb>
          </Limb>
          <Limb p={[0, 0.5, -0.21]} len={0.29} r={0.047} rot={[0.12 + stagger * 0.3, 0, armUL]}>
            <Limb p={[0, 0, 0]} len={0.27} r={0.042} rot={[0, 0, fore]} />
          </Limb>
          {role === 'tourist' && (
            // camera prop: hangs at chest, rises to face with `cam`
            <group position={[0.17 + cam * 0.12, 0.38 + cam * 0.4, 0]}>
              <mesh geometry={G.box} material={role1} castShadow scale={[0.1, 0.09, 0.15]} />
              <mesh geometry={G.cyl} material={role1} position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.04, 0.08, 0.04]} />
            </group>
          )}
        </group>
      </group>
    </group>
  );
};

/* Figure lying flat (for the stretcher) */
export const LyingFigure: React.FC<{p: V3; ry?: number}> = ({p, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <group rotation={[0, 0, Math.PI / 2]} position={[0.9, 0.08, 0]}>
      <Figure pose={{}} />
    </group>
  </group>
);

/* Goat carcass — stylised, no gore */
export const Goat: React.FC<{p: V3; ry?: number}> = ({p, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <B c={PAL.goat} p={[0, 0.2, 0]} s={[0.5, 0.2, 0.26]} />
    <B c={PAL.goat} p={[0.52, 0.12, 0.05]} s={[0.16, 0.1, 0.1]} r={[0, 0, -0.3]} />
    <B c={'#6F604E'} p={[0.6, 0.2, 0.08]} s={[0.04, 0.09, 0.03]} r={[0, 0, 0.8]} />
    {[[0.25, 0.22], [0.1, 0.25], [-0.25, 0.22], [-0.38, 0.25]].map(([x, z], i) => (
      <mesh key={i} geometry={G.cyl} material={mat('#6F604E')} castShadow position={[x, 0.12, z + 0.15]} rotation={[1.25, 0, (i - 1.5) * 0.15]} scale={[0.03, 0.42, 0.03]} />
    ))}
  </group>
);

/* Stretcher with patient, carried by two figures walking along +x */
export const StretcherGroup: React.FC<{p: V3; ry?: number; walk: number; walkAmt: number}> = ({p, ry = 0, walk, walkAmt}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Figure p={[1.15, 0, 0]} pose={{walk, walkAmt, carry: 1}} />
    <Figure p={[-1.15, 0, 0]} pose={{walk: walk + Math.PI, walkAmt, carry: 1}} />
    <B g={G.box} c={'#7D7562'} p={[0, 0.9, 0]} s={[2.0, 0.05, 0.55]} />
    <B g={G.cyl} c={'#3A3125'} p={[0, 0.92, 0.3]} r={[0, 0, Math.PI / 2]} s={[0.025, 2.5, 0.025]} />
    <B g={G.cyl} c={'#3A3125'} p={[0, 0.92, -0.3]} r={[0, 0, Math.PI / 2]} s={[0.025, 2.5, 0.025]} />
    <group position={[-0.85, 0.95, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <group position={[0, -0.06, 0]}><Figure s={0.95} /></group>
    </group>
  </group>
);

const hull = (pts: [number, number][], h: number) => {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, {depth: h, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2});
  g.rotateX(-Math.PI / 2);
  return g;
};
const SPEED_HULL = hull([[-1.75, -0.65], [0.9, -0.65], [2.2, 0], [0.9, 0.65], [-1.75, 0.65]], 0.5);
const WOOD_HULL = hull([[-2.0, 0], [-1.3, -0.48], [1.3, -0.48], [2.1, 0], [1.3, 0.48], [-1.3, 0.48]], 0.42);
const ROOF = (() => {
  const sh = new THREE.Shape([new THREE.Vector2(-3.5, 0), new THREE.Vector2(3.5, 0), new THREE.Vector2(0, 1.7)]);
  const g = new THREE.ExtrudeGeometry(sh, {depth: 10.6, bevelEnabled: false});
  g.translate(0, 0, -5.3); g.rotateY(Math.PI / 2);
  return g;
})();

/* Speed boat (forward +x) */
export const SpeedBoat: React.FC<{p: V3; ry?: number; roll?: number; pitch?: number; people?: boolean}> = ({p, ry = 0, roll = 0, pitch = 0, people = true}) => (
  <group position={p} rotation={[roll, ry, pitch]}>
    <mesh geometry={SPEED_HULL} material={mat('#E9E2D2', {rough: 0.85})} castShadow receiveShadow position={[0, 0.05, 0]} />
    <B g={G.box} c={'#2E4E5E'} p={[-0.3, 0.12, 0]} s={[2.9, 0.1, 1.42]} />
    <B g={G.box} c={'#3B3328'} p={[0.4, 0.62, 0]} s={[0.45, 0.35, 0.7]} />
    <B g={G.box} c={'#2A241C'} p={[-1.85, 0.5, 0]} s={[0.3, 0.6, 0.3]} />
    {people && (
      <>
        <Figure p={[0.1, 0.55, -0.25]} s={0.95} pose={{headYaw: 0}} />
        <group position={[-0.7, 0.85, 0.2]} rotation={[0, 0, -Math.PI / 2]}><Figure s={0.9} /></group>
        <Figure p={[-1.3, 0.55, 0.2]} s={0.95} role="ranger" pose={{}} />
      </>
    )}
  </group>
);

/* Small wooden boat (2009 flashback) */
export const WoodBoat: React.FC<{p: V3; ry?: number; roll?: number}> = ({p, ry = 0, roll = 0}) => (
  <group position={p} rotation={[roll, ry, 0]}>
    <mesh geometry={WOOD_HULL} material={mat(PAL.kayu)} castShadow receiveShadow position={[0, 0.05, 0]} />
    <B g={G.box} c={'#8A6A44'} p={[0, 0.5, 0]} s={[1.2, 0.08, 1.0]} />
    <Figure p={[0.6, 0.45, 0]} s={0.9} />
    <Figure p={[-0.9, 0.45, 0]} s={0.9} ry={Math.PI} />
  </group>
);

/* Simple clinic / hospital building (no emblem text in 3D) */
export const Clinic: React.FC<{p: V3; ry?: number}> = ({p, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <B g={G.box} c={PAL.white} p={[0, 1.8, 0]} s={[10, 3.6, 6]} />
    <mesh geometry={ROOF} material={mat(PAL.roof)} castShadow receiveShadow position={[0, 3.6, 0]} />
    <B g={G.box} c={'#3A2E22'} p={[3.01 * 0 + 0, 1.2, 3.01]} s={[1.6, 2.4, 0.05]} />
    {[-3.4, -1.8, 1.8, 3.4].map((x) => <B key={x} g={G.box} c={'#3E5560'} p={[x, 2.1, 3.01]} s={[1.0, 1.0, 0.05]} />)}
    <B g={G.box} c={'#6E8B5A'} p={[0, 3.0, 3.03]} s={[3.2, 0.5, 0.05]} />
    <B g={G.box} c={'#D8CBB0'} p={[0, 0.1, 4.2]} s={[5, 0.2, 2.4]} />
    {[-2.2, 2.2].map((x) => <B key={x} g={G.cyl} c={PAL.white} p={[x, 1.6, 5.1]} s={[0.12, 3.0, 0.12]} />)}
    <B g={G.box} c={PAL.roof} p={[0, 3.15, 4.4]} s={[5.2, 0.15, 2.0]} />
  </group>
);

export const Pier: React.FC<{p: V3; ry?: number; len?: number}> = ({p, ry = 0, len = 12}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <B g={G.box} c={'#7A5A3A'} p={[len / 2, 0.6, 0]} s={[len, 0.15, 2.2]} />
    {Array.from({length: Math.floor(len / 2) + 1}, (_, i) => (
      <React.Fragment key={i}>
        <B g={G.cyl} c={'#5A4028'} p={[i * 2, 0, 1.0]} s={[0.1, 1.5, 0.1]} />
        <B g={G.cyl} c={'#5A4028'} p={[i * 2, 0, -1.0]} s={[0.1, 1.5, 0.1]} />
      </React.Fragment>
    ))}
  </group>
);

/* Sugar-apple (srikaya) tree: short branching trunk, merged-sphere canopy, green fruits */
export const SrikayaTree: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => {
  const canopy: [V3, number][] = [
    [[0, 3.6, 0], 1.6], [[1.2, 3.3, 0.4], 1.2], [[-1.1, 3.4, -0.3], 1.25], [[0.3, 3.2, 1.2], 1.1], [[-0.4, 3.3, -1.2], 1.1], [[0.2, 4.4, 0.1], 1.1], [[1.4, 2.8, -0.8], 0.8],
  ];
  const fruits: V3[] = [[1.5, 2.5, 0.9], [-1.6, 2.7, 0.6], [0.6, 2.4, 1.6], [-0.8, 2.5, -1.5], [2.0, 2.9, -0.2]];
  return (
    <group position={p} scale={s}>
      <B g={G.cyl} c={'#5E4A33'} p={[0, 1.1, 0]} s={[0.16, 2.2, 0.16]} />
      <B g={G.cyl} c={'#5E4A33'} p={[0.5, 2.4, 0.1]} r={[0, 0, -0.7]} s={[0.09, 1.4, 0.09]} />
      <B g={G.cyl} c={'#5E4A33'} p={[-0.45, 2.5, -0.1]} r={[0, 0, 0.6]} s={[0.09, 1.3, 0.09]} />
      {canopy.map(([q, r], i) => <B key={i} g={G.sphereLo} c={i % 2 ? '#6C8A3A' : '#5D7A32'} p={q} s={[r, r * 0.8, r]} />)}
      {fruits.map((q, i) => <B key={i} c={'#A3B86A'} p={q} s={0.16} />)}
    </group>
  );
};

/* Ground glow ring (safe-distance circle) */
export const Ring: React.FC<{p: V3; r: number; o: number}> = ({p, r, o}) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[r - 0.12, r + 0.12, 96]} />
    <meshBasicMaterial color={'#FFC65A'} transparent opacity={o} toneMapped={false} depthWrite={false} />
  </mesh>
);
