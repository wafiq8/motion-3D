import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {V3, clamp, seeded} from '../../lib/time';
import {glossy, haloMat} from '../materials';
import {varTube, curveOf} from '../VarTube';
import {Inst, InstItem} from '../Inst';

// Penampang arteri cutaway sepanjang sumbu x: dinding (tunika) + intima, luka radang oranye,
// plak kolesterol kuning pucat yang tumbuh dan menyempitkan lumen. Sel darah MERAH (kaya O2).
export const ART_R = 1.25;
export const ART_WALL = 0.32;
const CUT = 0.85;
export const PLQ: V3 = [0.7, -ART_R, 0];
export const PLQ_RAD: V3 = [1.75, 1.05, 0.72];
export const AXIS = curveOf([[-9, 0, 0], [0, 0, 0], [9, 0, 0]]);
export const wallLine = (th: number, rr = ART_R * 0.97) => curveOf([[-9, -rr * Math.cos(th), rr * Math.sin(th)], [0, -rr * Math.cos(th), rr * Math.sin(th)], [9, -rr * Math.cos(th), rr * Math.sin(th)]]);
/** tinggi permukaan plak (y) di (x,z) untuk ukuran p; -Infinity bila di luar jejak plak */
export const plaqueTop = (x: number, z: number, p: number) => {
  if (p <= 0.01) return -Infinity;
  const dx = (x - PLQ[0]) / (PLQ_RAD[0] * Math.cbrt(p));
  const dz = z / PLQ_RAD[2];
  const k = 1 - dx * dx - dz * dz;
  return k <= 0 ? -Infinity : PLQ[1] + PLQ_RAD[1] * p * Math.sqrt(k);
};
const r = seeded(401);
const RBC = Array.from({length: 80}, () => {
  const a = r() * Math.PI * 2;
  const rr = Math.sqrt(r()) * ART_R * 0.82;
  return {o: r(), y: -Math.cos(a) * rr, z: Math.sin(a) * rr * 0.8 - 0.1, rot: r() * 6.28, sp: 0.9 + r() * 0.2};
});
const LDL = Array.from({length: 34}, (_, i) => {
  const a = r() * Math.PI * 2;
  const rr = Math.sqrt(r()) * ART_R * 0.7;
  // titik tempel di permukaan plak
  const ax = PLQ[0] + (r() - 0.5) * 2.6;
  const az = (r() - 0.5) * 1.0;
  return {o: r(), y: -Math.cos(a) * rr, z: Math.sin(a) * rr * 0.7, ax, az, d: i / 34};
});
const LESION = Array.from({length: 9}, () => ({x: PLQ[0] + (r() - 0.5) * 2.8, z: (r() - 0.5) * 0.9, s: 0.2 + r() * 0.22, ph: r() * 6.28}));

export const Artery: React.FC<{t: number; lesion: number; ldl: number; stick: number; plaque: number; flow?: number; bright?: number}> = ({t, lesion, ldl, stick, plaque, flow = 1.2, bright = 0}) => {
  const g = useMemo(() => {
    const inner = varTube(AXIS, () => ART_R, {n: 60, m: 48, cut: CUT});
    const outer = varTube(AXIS, () => ART_R + ART_WALL, {n: 60, m: 48, cut: CUT});
    // pita tepi potongan (menutup ketebalan dinding)
    const rib = (th: number) => {
      const pos: number[] = [];
      const idx: number[] = [];
      for (let i = 0; i <= 40; i++) {
        const x = -9 + (18 * i) / 40;
        for (const R of [ART_R, ART_R + ART_WALL]) pos.push(x, -R * Math.cos(th), R * Math.sin(th));
      }
      for (let i = 0; i < 40; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
      const gg = new THREE.BufferGeometry();
      gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      gg.setIndex(idx);
      gg.computeVertexNormals();
      return gg;
    };
    const plq = new THREE.SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const pp = plq.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pp.count; i++) {
      v.fromBufferAttribute(pp, i);
      const bump = 1 + 0.07 * Math.sin(v.x * 9) * Math.sin(v.z * 8) + 0.05 * Math.sin(v.y * 11 + v.x * 5);
      pp.setXYZ(i, v.x * bump, v.y * bump, v.z * bump);
    }
    plq.computeVertexNormals();
    const rbc = new THREE.SphereGeometry(1, 18, 10);
    rbc.scale(1, 0.4, 1);
    return {inner, outer, ribA: rib(Math.PI / 2 - CUT), ribB: rib(Math.PI / 2 + CUT), plq, rbc, ball: new THREE.SphereGeometry(1, 16, 12), lesion: new THREE.SphereGeometry(1, 20, 10)};
  }, []);
  const m = useMemo(
    () => ({
      intima: glossy(C.intima, {roughness: 0.32, side: THREE.DoubleSide}),
      outer: glossy(C.arteryWall, {roughness: 0.36, side: THREE.DoubleSide}),
      rib: glossy('#C45E6C', {roughness: 0.45, side: THREE.DoubleSide}),
      plq: glossy(C.plaque, {roughness: 0.38, emissive: C.plaque, emissiveIntensity: 0.12}),
      ldl: glossy(C.plaque, {roughness: 0.3, emissive: C.plaque, emissiveIntensity: 0.3}),
      rbc: glossy(C.bloodRed, {roughness: 0.28, emissive: C.bloodRed, emissiveIntensity: 0.18}),
      lesion: new THREE.MeshStandardMaterial({color: C.inflame, emissive: C.inflame, emissiveIntensity: 1.4, transparent: true}),
      lHalo: haloMat(C.inflame, 1),
    }),
    [],
  );
  m.rbc.emissiveIntensity = 0.12 + 0.55 * bright;
  const rbcs: InstItem[] = RBC.map((b, i) => {
    const x = -8.5 + ((b.o + (t * flow * b.sp) / 17) % 1) * 17;
    let y = b.y;
    const top = plaqueTop(x, b.z, plaque);
    if (y < top + 0.18) y = top + 0.18 + (y + ART_R) * 0.15;
    return {p: [x, Math.min(y, ART_R * 0.85), b.z], s: 0.19, r: [b.rot + t * 0.6, b.rot, 0.5 + i]};
  });
  const ldls: InstItem[] = [];
  LDL.forEach((l, i) => {
    if (ldl <= 0.01) return;
    const k = clamp(stick * 1.4 - l.d * 0.4);
    const fx = -8.5 + ((l.o + (t * flow) / 17) % 1) * 17;
    const free: V3 = [fx, l.y, l.z];
    const ty = Math.max(plaqueTop(l.ax, l.az, plaque), PLQ[1] + 0.02);
    const stuck: V3 = [l.ax, ty + 0.03, l.az];
    const p: V3 = k > 0 ? [free[0] + (stuck[0] - free[0]) * k, free[1] + (stuck[1] - free[1]) * k, free[2] + (stuck[2] - free[2]) * k] : free;
    ldls.push({p, s: 0.085 * ldl * (1 - 0.3 * clamp(plaque - 0.6) * k), r: [i, i, 0]});
  });
  const les: InstItem[] = [];
  if (lesion > 0.01) LESION.forEach((l) => les.push({p: [l.x, -ART_R + 0.02, l.z], s: [l.s * 1.6 * lesion, 0.05, l.s * lesion], c: '#ffffff'}));
  m.lesion.opacity = 0.9;
  m.lesion.emissiveIntensity = 1.0 + 0.6 * Math.sin(t * 8);
  return (
    <group>
      <mesh geometry={g.outer} material={m.outer} />
      <mesh geometry={g.inner} material={m.intima} />
      <mesh geometry={g.ribA} material={m.rib} />
      <mesh geometry={g.ribB} material={m.rib} />
      <Inst geo={g.lesion} mat={m.lesion} items={les} max={LESION.length} />
      {plaque > 0.01 && <mesh geometry={g.plq} material={m.plq} position={PLQ} scale={[PLQ_RAD[0] * Math.cbrt(plaque), PLQ_RAD[1] * plaque, PLQ_RAD[2]]} />}
      <Inst geo={g.ball} mat={m.ldl} items={ldls} max={LDL.length} />
      <Inst geo={g.rbc} mat={m.rbc} items={rbcs} max={RBC.length} />
    </group>
  );
};
