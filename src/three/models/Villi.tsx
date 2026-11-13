import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';
import {seeded} from '../../lib/time';

// Dinding usus halus: lipatan + karpet vili (instanced) + satu vili hero berbulu mikrovili.
export const wallY = (x: number, z: number) => 0.55 * Math.sin(x * 0.55) * Math.cos(z * 0.18) - 0.04 * x * x * 0.0;
export const HERO_VILLUS = {x: 0.4, z: 0.6, h: 1.5, r: 0.26};
export const heroTop = (): [number, number, number] => [HERO_VILLUS.x, wallY(HERO_VILLUS.x, HERO_VILLUS.z) + HERO_VILLUS.h + HERO_VILLUS.r, HERO_VILLUS.z];

export const VilliField: React.FC<{t: number; heroGlow: number; micro: number}> = ({t, heroGlow, micro}) => {
  const data = useMemo(() => {
    const r = seeded(55);
    const items: {x: number; z: number; h: number; s: number; ph: number}[] = [];
    for (let i = -18; i <= 18; i++)
      for (let j = -22; j <= 10; j++) {
        const x = i * 0.42 + (r() - 0.5) * 0.18;
        const z = j * 0.42 + (r() - 0.5) * 0.18;
        if (Math.hypot(x - HERO_VILLUS.x, z - HERO_VILLUS.z) < 0.55) continue;
        items.push({x, z, h: 0.9 + r() * 0.45, s: 0.8 + r() * 0.3, ph: r() * 6.28});
      }
    return items;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.17, 1, 6, 14);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  const mat = useMemo(() => glossy(C.villus, {roughness: 0.35}), []);
  const inst = useMemo(() => new THREE.InstancedMesh(geo, mat, data.length), [geo, mat, data.length]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  data.forEach((d, i) => {
    e.set(0.06 * Math.sin(t * 1.3 + d.ph), 0, 0.06 * Math.cos(t * 1.1 + d.ph));
    q.setFromEuler(e);
    m4.compose(new THREE.Vector3(d.x, wallY(d.x, d.z), d.z), q, new THREE.Vector3(d.s, d.h, d.s));
    inst.setMatrixAt(i, m4);
  });
  inst.instanceMatrix.needsUpdate = true;
  const wall = useMemo(() => {
    const g = new THREE.PlaneGeometry(18, 16, 90, 80);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -2.5);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, wallY(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  const wallMat = useMemo(() => glossy('#B85565', {roughness: 0.5}), []);
  // vili hero + mikrovili
  const hv = HERO_VILLUS;
  const hy = wallY(hv.x, hv.z);
  const heroMat = useMemo(() => glossy(C.villus, {roughness: 0.3}), []);
  heroMat.emissive.set(C.accent);
  heroMat.emissiveIntensity = 0.12 * heroGlow;
  const microGeo = useMemo(() => new THREE.CylinderGeometry(0.012, 0.014, 0.12, 5), []);
  const microMat = useMemo(() => glossy('#F2A3A8', {roughness: 0.3}), []);
  const micros = useMemo(() => {
    const r = seeded(56);
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < 520; i++) {
      // titik acak di permukaan kapsul (bagian atas lebih padat)
      const y = r() * (hv.h + hv.r * 0.9);
      const a = r() * Math.PI * 2;
      let n: THREE.Vector3;
      let p: THREE.Vector3;
      if (y > hv.h) {
        const k = (y - hv.h) / hv.r;
        const rr = Math.sqrt(Math.max(0, 1 - k * k)) * hv.r;
        p = new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr);
        n = new THREE.Vector3(Math.cos(a) * rr, (y - hv.h), Math.sin(a) * rr).normalize();
      } else {
        p = new THREE.Vector3(Math.cos(a) * hv.r, y, Math.sin(a) * hv.r);
        n = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      }
      p.add(n.clone().multiplyScalar(0.05));
      const qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      arr.push(new THREE.Matrix4().compose(p, qq, new THREE.Vector3(1, 1, 1)));
    }
    return arr;
  }, [hv.h, hv.r]);
  const microInst = useMemo(() => new THREE.InstancedMesh(microGeo, microMat, micros.length), [microGeo, microMat, micros.length]);
  const s = Math.max(0.001, micro);
  micros.forEach((mm, i) => {
    const pp = new THREE.Vector3();
    const qq = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    mm.decompose(pp, qq, sc);
    microInst.setMatrixAt(i, new THREE.Matrix4().compose(pp, qq, new THREE.Vector3(1, s, 1)));
  });
  microInst.instanceMatrix.needsUpdate = true;
  return (
    <group>
      <mesh geometry={wall} material={wallMat} />
      <primitive object={inst} />
      <group position={[hv.x, hy, hv.z]}>
        <mesh material={heroMat} position={[0, hv.h / 2, 0]}>
          <capsuleGeometry args={[hv.r, hv.h, 8, 24]} />
        </mesh>
        <primitive object={microInst} />
      </group>
    </group>
  );
};
