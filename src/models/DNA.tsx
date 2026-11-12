/**
 * DNA: dua TubeGeometry heliks emissive dua warna + anak tangga silinder.
 * Dua untai datang dari dua diorama (kiri & kanan) lalu MENYATU menjadi satu heliks.
 */
import React, { useMemo } from 'react';
import { Curve, CylinderGeometry, MeshStandardMaterial, TubeGeometry, Vector3 } from 'three';
import { PALETTE } from '../styleLock';
import { segmentTransform } from '../lib/geom';

class StrandCurve extends Curve<Vector3> {
  constructor(
    private phase: number,
    private from: Vector3,
    private helixBase: number,
    private helixTop: number,
    private radius: number,
    private turns: number,
    private joinFrac: number,
  ) {
    super();
  }
  helixPoint(u: number, out: Vector3) {
    const y = this.helixBase + u * (this.helixTop - this.helixBase);
    const a = u * this.turns * Math.PI * 2 + this.phase;
    return out.set(Math.cos(a) * this.radius, y, Math.sin(a) * this.radius);
  }
  getPoint(t: number, out = new Vector3()) {
    const j = this.joinFrac;
    if (t >= j) return this.helixPoint((t - j) / (1 - j), out);
    // bagian pendekatan: kurva halus dari diorama ke awal heliks
    const s = t / j;
    const start = this.from;
    const end = this.helixPoint(0, new Vector3());
    const ctrl = new Vector3(start.x * 0.3, (start.y + end.y) * 0.5 + 0.3, start.z * 0.3);
    const a = start.clone().lerp(ctrl, s);
    const b = ctrl.clone().lerp(end, s);
    return out.copy(a.lerp(b, s));
  }
}

class SubCurve extends Curve<Vector3> {
  constructor(private c: StrandCurve, private g: number) {
    super();
  }
  getPoint(u: number, out = new Vector3()) {
    return this.c.getPoint(u * this.g, out);
  }
}

export const DNAHelix: React.FC<{
  position: [number, number, number];
  t: number;
  leftFrom: [number, number, number];
  rightFrom: [number, number, number];
  height?: number;
  radius?: number;
  turns?: number;
  /** 0..1 — seberapa jauh untai sudah tumbuh (animasi menyatu). */
  grow?: number;
  colorA?: string;
  colorB?: string;
}> = ({
  position,
  t,
  leftFrom,
  rightFrom,
  height = 5,
  radius = 0.75,
  turns = 2.6,
  grow = 1,
  colorA = PALETTE.senja,
  colorB = PALETTE.laut,
}) => {
  const joinFrac = 0.3;
  const spin = t * 0.6;
  const data = useMemo(() => {
    const base = 0;
    const mk = (phase: number, from: [number, number, number]) =>
      new StrandCurve(phase, new Vector3(...from).sub(new Vector3(...position)), base, height, radius, turns, joinFrac);
    const A = mk(0, leftFrom);
    const B = mk(Math.PI, rightFrom);
    return { A, B };
  }, [position, leftFrom, rightFrom, height, radius, turns]);

  const tubes = useMemo(() => {
    const g = Math.max(0.02, Math.min(1, grow));
    const part = (c: StrandCurve) => {
      const sub = new SubCurve(c, g);
      return new TubeGeometry(sub, 220, 0.07, 10, false);
    };
    return { a: part(data.A), b: part(data.B) };
  }, [data, grow]);

  const rungs = useMemo(() => {
    const out: { p: Vector3; q: import('three').Quaternion; len: number; visible: boolean }[] = [];
    const n = 26;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const tt = joinFrac + u * (1 - joinFrac);
      const a = data.A.getPoint(tt);
      const b = data.B.getPoint(tt);
      const s = segmentTransform(a, b);
      out.push({ p: s.position, q: s.quaternion, len: s.length, visible: tt <= grow });
    }
    return out;
  }, [data, grow]);

  const mats = useMemo(() => {
    const m = (c: string, e: number) =>
      new MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: e, roughness: 0.85, metalness: 0, fog: false });
    return { a: m(colorA, 1.6), b: m(colorB, 2.2), rung: m(PALETTE.kabut, 0.9) };
  }, [colorA, colorB]);
  const rungGeo = useMemo(() => new CylinderGeometry(0.03, 0.03, 1, 6), []);

  // Rotasi heliks; bagian pendekatan ikut berputar sedikit (diimbangi agar ujung tetap di diorama)
  return (
    <group position={position}>
      <group rotation={[0, spin * 0, 0]}>
        <mesh geometry={tubes.a} material={mats.a} />
        <mesh geometry={tubes.b} material={mats.b} />
        {rungs.map((r, i) =>
          r.visible ? (
            <mesh key={i} geometry={rungGeo} material={mats.rung} position={r.p} quaternion={r.q} scale={[1, r.len, 1]} />
          ) : null,
        )}
      </group>
    </group>
  );
};
