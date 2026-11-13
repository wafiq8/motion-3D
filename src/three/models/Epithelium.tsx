import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {V3, clamp, seeded} from '../../lib/time';
import {glossy} from '../materials';
import {varTube, curveOf} from '../VarTube';
import {Inst, InstItem} from '../Inst';

// Dinding usus skala sel: barisan sel epitel kolumnar + tight junction (pita terang) di dekat apeks,
// lapisan bawah dengan kapiler cutaway (merah = sisi arteri, biru = sisi vena — kode seri).
export const N_CELLS = 12;
export const CELL_W = 0.62;
export const CELL_TOP = 0.2;
export const CELL_BOT = -1.4;
export const CAP_Y = -2.45;
export const CAP_R = 0.46;
export const cellX = (i: number, gap: number) => (i - (N_CELLS - 1) / 2) * (CELL_W + 0.035 * gap) + (i >= N_CELLS / 2 ? 1 : -1) * 0.2 * gap;
export const CAPILLARY = curveOf([[-6.5, CAP_Y, 0], [-2, CAP_Y - 0.05, 0], [2, CAP_Y + 0.05, 0], [6.5, CAP_Y, 0]]);
const red = new THREE.Color(C.bloodRed);
const blue = new THREE.Color(C.bloodBlue);
export const capColor = (x: number) => red.clone().lerp(blue, THREE.MathUtils.smoothstep(x, -0.9, -0.1));
const r = seeded(301);
const RBC = Array.from({length: 46}, () => ({o: r(), y: (r() - 0.5) * 0.5, z: (r() - 0.5) * 0.5, rot: r() * 6.28}));
export const rbcPos = (i: number, t: number, speed = 0.06): V3 => {
  const b = RBC[i];
  const u = (b.o + t * speed) % 1;
  return [-6.2 + 12.4 * u, CAP_Y + b.y, b.z - 0.05];
};

export const Epithelium: React.FC<{t: number; gap: number; irr: number; bloodGlow?: number}> = ({t, gap, irr, bloodGlow = 0.2}) => {
  const g = useMemo(() => {
    const cell = new THREE.CapsuleGeometry(0.3, 1.0, 8, 20);
    const micro = new THREE.CylinderGeometry(0.018, 0.022, 0.16, 5);
    micro.translate(0, 0.08, 0);
    const junction = new THREE.CapsuleGeometry(0.05, 1, 4, 8);
    junction.rotateZ(Math.PI / 2);
    const cap = varTube(CAPILLARY, () => CAP_R, {n: 120, m: 32, cut: 1.0, colors: (u) => capColor(-6.5 + 13 * u)});
    const rbc = new THREE.SphereGeometry(1, 18, 10);
    rbc.scale(1, 0.42, 1);
    const tissue = new THREE.BoxGeometry(14, 1.9, 2.2, 1, 1, 1);
    return {cell, micro, junction, cap, rbc, tissue};
  }, []);
  const m = useMemo(
    () => ({
      cell: glossy(C.epithelium, {roughness: 0.33}),
      back: glossy('#B86E7E', {roughness: 0.4}),
      micro: glossy('#F4B3BA', {roughness: 0.3}),
      jn: new THREE.MeshStandardMaterial({color: '#FFE6EE', emissive: '#FFD0DC', emissiveIntensity: 1.1, transparent: true}),
      cap: glossy('#ffffff', {vertexColors: true, roughness: 0.3, side: THREE.DoubleSide, transparent: true, opacity: 0.9}),
      rbc: glossy('#ffffff', {roughness: 0.28, emissive: '#000000'}),
      tissue: glossy('#5A2E5E', {roughness: 0.6, transparent: true, opacity: 0.55, depthWrite: false}),
    }),
    [],
  );
  // iritasi: sel memerah-oranye kusam & berdenyut (bukan merah darah)
  const pulse = 0.6 + 0.4 * Math.sin(t * 6);
  m.cell.color.set(C.epithelium).lerp(new THREE.Color('#D9786A'), 0.5 * irr);
  m.cell.emissive.set(C.inflame);
  m.cell.emissiveIntensity = 0.22 * irr * pulse;
  m.rbc.emissiveIntensity = 0;
  const cells: InstItem[] = [];
  const backs: InstItem[] = [];
  const micros: InstItem[] = [];
  for (let i = 0; i < N_CELLS; i++) {
    const x = cellX(i, gap);
    const sw = 1 + 0.04 * irr * Math.sin(t * 5 + i * 1.7);
    cells.push({p: [x, (CELL_TOP + CELL_BOT) / 2, 0], s: [sw, 1, 1.05]});
    backs.push({p: [x + 0.31, (CELL_TOP + CELL_BOT) / 2 + 0.05, -0.72], s: [sw, 1.02, 1]});
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      micros.push({p: [x + Math.cos(a) * 0.17, CELL_TOP - 0.05, Math.sin(a) * 0.17 + 0.02], s: 1, r: [Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25]});
    }
  }
  const jns: InstItem[] = [];
  for (let i = 0; i < N_CELLS - 1; i++) {
    const a = cellX(i, gap) + 0.3;
    const b = cellX(i + 1, gap) - 0.3;
    const central = i === N_CELLS / 2 - 1;
    const len = Math.max(0.06, b - a + 0.08);
    const k = central ? clamp(1 - gap * 1.6) : 1 - 0.5 * gap;
    if (k > 0.02) jns.push({p: [(a + b) / 2, CELL_TOP - 0.18, 0.12], s: [len, k, k]});
  }
  m.jn.opacity = 0.95;
  const rbcs: InstItem[] = RBC.map((b, i) => {
    const p = rbcPos(i, t);
    return {p, s: 0.15, r: [b.rot + t, b.rot, 0.4], c: capColor(p[0]).multiplyScalar(0.75 + bloodGlow)};
  });
  return (
    <group>
      <mesh geometry={g.tissue} material={m.tissue} position={[0, CAP_Y + 0.25, -1.1]} />
      <Inst geo={g.cell} mat={m.back} items={backs} max={N_CELLS} />
      <Inst geo={g.cell} mat={m.cell} items={cells} max={N_CELLS} />
      <Inst geo={g.micro} mat={m.micro} items={micros} max={N_CELLS * 9} />
      <Inst geo={g.junction} mat={m.jn} items={jns} max={N_CELLS} />
      <mesh geometry={g.cap} material={m.cap} />
      <Inst geo={g.rbc} mat={m.rbc} items={rbcs} max={RBC.length} />
    </group>
  );
};
