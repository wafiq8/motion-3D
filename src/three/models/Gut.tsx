import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {V3, clamp, seeded, smooth} from '../../lib/time';
import {glossy, haloMat} from '../materials';
import {varTube, curveOf} from '../VarTube';
import {Inst, InstItem} from '../Inst';
import {toxinGeo, toxinMat} from './Toxin';

// Usus besar (bingkai kolon berhaustra) + gulungan usus halus. Kolon transversum cutaway
// (sisi depan dibuka) agar isi rongga terlihat. Koordinat lokal: lebar ±2.7, tinggi -3.5..2.2.
export const GUT_ASC = curveOf([[-2.0, -1.9, 0.05], [-2.12, -0.9, 0.1], [-2.18, 0.4, 0.14], [-2.0, 1.3, 0.2], [-1.55, 1.65, 0.3]]);
export const GUT_TRANS = curveOf([[-1.55, 1.65, 0.3], [-0.8, 1.74, 0.42], [0, 1.62, 0.46], [0.8, 1.74, 0.42], [1.6, 1.65, 0.28]]);
export const GUT_DESC = curveOf([[1.6, 1.65, 0.28], [2.05, 1.25, 0.12], [2.2, 0.3, 0.0], [2.12, -0.9, 0.0], [1.8, -1.85, 0.08], [1.05, -2.35, 0.22], [0.4, -2.3, 0.2], [0.12, -2.85, 0.05], [0.05, -3.5, -0.05]]);
export const GUT_R = 0.48;
export const VIEW = new THREE.Vector3(0, 0.35, 1).normalize();
const haus = (u: number, n: number) => GUT_R * (0.86 + 0.16 * Math.pow(Math.abs(Math.sin(Math.PI * u * n)), 0.6));
const SI_PTS: V3[] = (() => {
  const pts: V3[] = [];
  for (let row = 0; row < 6; row++) {
    const y = 0.95 - row * 0.5;
    const dir = row % 2 ? -1 : 1;
    for (let k = 0; k <= 5; k++) {
      const x = dir * (-1.35 + (2.7 * k) / 5);
      pts.push([x, y + 0.12 * Math.sin(k * 1.9 + row), -0.25 + 0.22 * Math.sin(k * 1.3 + row * 0.7)]);
    }
  }
  return pts;
})();
export const SMALL_INT = curveOf(SI_PTS, 0.5);

/** Rangka lokal penampang kolon transversum: th=0 lantai, π/2 bukaan depan, π atap, 3π/2 dinding belakang. */
export const lumenPt = (u: number, th: number, rr: number): V3 => {
  const c = GUT_TRANS.getPointAt(clamp(u));
  const T = GUT_TRANS.getTangentAt(clamp(u));
  const B = new THREE.Vector3().crossVectors(T, VIEW).normalize();
  const Z = new THREE.Vector3().crossVectors(B, T).normalize();
  const p = c.add(B.multiplyScalar(rr * Math.cos(th))).add(Z.multiplyScalar(rr * Math.sin(th)));
  return [p.x, p.y, p.z];
};
export const transR = (u: number) => haus(u, 9);

const r = seeded(201);
export const RESIDUE = Array.from({length: 30}, (_, i) => ({u: 0.06 + (0.88 * (i + r() * 0.8)) / 30, th: (r() - 0.5) * 1.1, s: 0.09 + r() * 0.12, d: r()}));
export const BACT = Array.from({length: 26}, () => {
  const back = r() < 0.6;
  return {u: 0.05 + r() * 0.9, th: back ? 3.4 + r() * 2.1 : (r() - 0.5) * 1.4, rot: r() * 6.28, ph: r() * 6.28};
});
export const TOX = Array.from({length: 46}, (_, i) => ({b: i % 26, o: r(), dth: (r() - 0.5) * 1.2}));
const SLITS = Array.from({length: 8}, (_, i) => ({u: 0.12 + i * 0.1 + (r() - 0.5) * 0.04, th: 4.2 + (r() - 0.5) * 1.0}));

export const toxinPos = (i: number, t: number): {p: V3; age: number; u: number} => {
  const x = TOX[i];
  const b = BACT[x.b];
  const age = (x.o + t * 0.22) % 1;
  const rr = transR(b.u) * (0.82 - 0.5 * age);
  return {p: lumenPt(b.u + (x.o - 0.5) * 0.06, b.th + x.dth * age, rr), age, u: b.u};
};

export const Gut: React.FC<{t: number; residue: number; bact: number; tox: number; rinse?: number; slits?: number; heal?: number; healthy?: number}> = ({t, residue, bact, tox, rinse = -1, slits = 0, heal = 0, healthy = 0}) => {
  const g = useMemo(() => {
    const asc = varTube(GUT_ASC, (u) => haus(u, 8), {n: 120, m: 32});
    const trans = varTube(GUT_TRANS, (u) => haus(u, 9), {n: 160, m: 40, cut: 1.0, viewAxis: VIEW});
    const desc = varTube(GUT_DESC, (u) => haus(u, 16) * (u > 0.8 ? 1 - (u - 0.8) * 1.4 : 1), {n: 200, m: 32});
    const si = varTube(SMALL_INT, () => 0.25, {n: 700, m: 18});
    const lump = new THREE.IcosahedronGeometry(1, 2);
    const rod = new THREE.CapsuleGeometry(0.35, 1.0, 4, 10);
    const slit = new THREE.CapsuleGeometry(0.2, 1, 4, 8);
    return {asc, trans, desc, si, lump, rod, slit};
  }, []);
  const m = useMemo(
    () => ({
      colon: glossy(C.colon, {roughness: 0.34}),
      inner: glossy(C.colon, {roughness: 0.4, side: THREE.DoubleSide}),
      si: glossy(C.smallInt, {roughness: 0.3}),
      res: glossy('#A08A62', {roughness: 0.45}),
      bact: glossy('#7A4A96', {roughness: 0.3, emissive: '#6B3C88', emissiveIntensity: 0.45}),
      slit: new THREE.MeshStandardMaterial({color: C.endotoxin, emissive: C.endotoxinGlow, emissiveIntensity: 0.9}),
      rinse: new THREE.MeshStandardMaterial({color: C.rinse, emissive: C.rinse, emissiveIntensity: 1.6, transparent: true, opacity: 0.85}),
      rinseHalo: haloMat(C.rinse, 1.4),
    }),
    [],
  );
  // pemulihan: dinding kembali merah muda sehat bercahaya lembut
  for (const mm of [m.colon, m.inner, m.si]) {
    mm.emissive.set(C.healthy);
    mm.emissiveIntensity = 0.22 * healthy;
  }
  const cleared = (u: number) => (rinse < 0 ? 0 : clamp((rinse - u) / 0.08));
  const resItems: InstItem[] = [];
  RESIDUE.forEach((x, i) => {
    const k = clamp(residue * 1.6 - x.d * 0.6) * (1 - cleared(x.u));
    if (k <= 0.01) return;
    const rr = transR(x.u) - x.s * 0.55;
    resItems.push({p: lumenPt(x.u, x.th, rr), s: [x.s * k, x.s * 0.75 * k, x.s * 0.9 * k], r: [i, i * 0.7, 0]});
  });
  const bItems: InstItem[] = [];
  BACT.forEach((b, i) => {
    const k = bact * (1 - cleared(b.u));
    if (k <= 0.01) return;
    const p = lumenPt(b.u, b.th + 0.04 * Math.sin(t * 2 + b.ph), transR(b.u) * 0.86);
    bItems.push({p, s: 0.11 * k * (1 + 0.08 * Math.sin(t * 5 + i)), r: [b.rot, t * 0.8 + b.ph, b.rot * 0.5]});
  });
  const tItems: InstItem[] = [];
  if (tox > 0.01)
    TOX.forEach((_, i) => {
      const {p, age, u} = toxinPos(i, t);
      const k = tox * Math.sin(Math.PI * Math.min(1, age * 1.15)) * (1 - cleared(u));
      if (k > 0.02) tItems.push({p, s: 0.035 * k, r: [t + i, t * 0.7, i]});
    });
  const sItems: InstItem[] = [];
  if (slits > 0.01)
    SLITS.forEach((s) => {
      const w = slits * (1 - heal);
      if (w <= 0.01) return;
      const p = lumenPt(s.u, s.th, transR(s.u) * 0.99);
      sItems.push({p, s: [0.09 * w, 0.075, 0.09 * w], r: [0, 0, Math.PI / 2 + 0.2 * Math.sin(s.u * 20)]});
    });
  let ring: V3 | null = null;
  let ringQ = new THREE.Quaternion();
  if (rinse >= 0 && rinse <= 1.08) {
    const u = clamp(rinse);
    ring = GUT_TRANS.getPointAt(u).toArray() as V3;
    ringQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), GUT_TRANS.getTangentAt(u));
  }
  const fadeRing = rinse < 0 ? 0 : smooth(rinse / 0.1) * (1 - smooth((rinse - 0.95) / 0.13));
  m.rinse.opacity = 0.85 * fadeRing;
  m.rinseHalo.uniforms.k.value = 1.4 * fadeRing;
  return (
    <group>
      <mesh geometry={g.si} material={m.si} />
      <mesh geometry={g.asc} material={m.colon} />
      <mesh geometry={g.desc} material={m.colon} />
      <mesh geometry={g.trans} material={m.inner} />
      {/* sambungan fleksura & sekum */}
      <mesh material={m.colon} position={[-1.55, 1.65, 0.3]} scale={GUT_R * 0.93}><sphereGeometry args={[1, 24, 16]} /></mesh>
      <mesh material={m.colon} position={[1.6, 1.65, 0.28]} scale={GUT_R * 0.93}><sphereGeometry args={[1, 24, 16]} /></mesh>
      <mesh material={m.colon} position={[-2.0, -1.9, 0.05]} scale={GUT_R * 0.95}><sphereGeometry args={[1, 24, 16]} /></mesh>
      <Inst geo={g.lump} mat={m.res} items={resItems} max={RESIDUE.length} />
      <Inst geo={g.rod} mat={m.bact} items={bItems} max={BACT.length} />
      <Inst geo={toxinGeo} mat={toxinMat} items={tItems} max={TOX.length} />
      <Inst geo={g.slit} mat={m.slit} items={sItems} max={SLITS.length} />
      {ring && fadeRing > 0.01 && (
        <group position={ring} quaternion={ringQ}>
          <mesh material={m.rinse}><torusGeometry args={[GUT_R * 0.92, 0.07, 12, 48]} /></mesh>
          <mesh material={m.rinseHalo} scale={[GUT_R * 1.1, GUT_R * 1.1, 0.5]}><sphereGeometry args={[1, 24, 16]} /></mesh>
        </group>
      )}
    </group>
  );
};
