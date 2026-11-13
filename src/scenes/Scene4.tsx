import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage} from '../three/Stage';
import {Duodenum, DUO, BILE_DUCT, PANC_DUCT} from '../three/models/Duodenum';
import {Packet, Molecule, MolKind} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, kf1, ramp, sceneEnd, sceneStart, wordAt, V3, seeded} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

const S = 4;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tEmpedu = wordAt(4, 'empedu');
const tPankreas = wordAt(4, 'pankreas');
const tMolekul = wordAt(4, 'molekul');
const tGluk = wordAt(4, 'glukosa');
const tAmino = wordAt(4, 'amino');
const tLemak = wordAt(4, 'lemak', 2);
const at = (c: THREE.Curve<THREE.Vector3>, u: number): V3 => {
  const p = c.getPointAt(Math.min(1, Math.max(0, u)));
  return [p.x, p.y, p.z];
};
const r = seeded(44);
const cloud = Array.from({length: 30}, (_, i) => ({a: r() * 6.28, b: r() * 6.28, rr: 0.25 + r() * 0.35, sp: 0.5 + r(), kind: (['glukosa', 'amino', 'lemak'] as MolKind[])[i % 3]}));
export const u4 = (t: number) => kf1(t, [[t0, 0.0], [tEmpedu, 0.2], [tMolekul, 0.3], [t1 - 0.5, 0.36], [t1, 0.42]]);

export const Scene4: React.FC<{t: number}> = ({t}) => {
  const pk = at(DUO, u4(t));
  const pkz: V3 = [pk[0], pk[1], pk[2] + 0.05];
  const bile = ramp(t, tEmpedu - 0.2, tEmpedu + 0.5);
  const panc = ramp(t, tPankreas - 0.2, tPankreas + 0.5);
  const split = ramp(t, tMolekul - 0.2, tMolekul + 0.8);
  const base = {
    pos: kf3(t, [[t0, [-1.5, 2.6, 5]], [t0 + 1.3, [0.2, 0.6, 13.5]], [tPankreas, [0.4, 0.4, 12.5]], [tMolekul - 0.35, [0.4, 0.3, 12.0]], [tMolekul + 0.4, [pk[0] + 0.3, pk[1] - 0.1, 5.2]], [t1, [pk[0] + 0.2, pk[1] - 0.2, 4.4]]]),
    target: kf3(t, [[t0, pkz], [t0 + 1.3, [0.1, 0.5, 0]], [tPankreas, [0.3, 0.3, 0]], [tMolekul - 0.35, [0.3, 0.2, 0]], [tMolekul + 0.4, [pk[0], pk[1] - 0.35, 0]], [t1, [pk[0], pk[1] - 0.3, 0]]]),
    fov: 36,
  };
  const {cam, flash} = withDive(base, pkz, t, t0, t1);
  const m = useMemo(
    () => ({
      bile: new THREE.MeshStandardMaterial({color: C.bile, emissive: C.bile, emissiveIntensity: 0.6, roughness: 0.15}),
      pep: new THREE.MeshStandardMaterial({color: C.enzyme, emissive: C.enzyme, emissiveIntensity: 1.2}),
      chyme: new THREE.MeshStandardMaterial({color: C.gold, emissive: C.goldEmissive, emissiveIntensity: 0.7, roughness: 0.3}),
    }),
    [],
  );
  const gb = project(cam, [2.95, 3.3, 0]);
  const pa = project(cam, [-1.4, 0.1, 0.3]);
  const mp = project(cam, pkz);
  const kinds: [string, number][] = [['Glukosa', tGluk], ['Asam Amino', tAmino], ['Asam Lemak', tLemak]];
  const shown = kinds.filter(([, tt]) => t >= tt - 0.05).map(([n]) => n);
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={4}>
        <Duodenum glowBile={bile} glowPanc={panc} />
        {/* empedu: tetes hijau turun lewat saluran ke usus, mengemulsi lemak */}
        {bile > 0 &&
          [0, 0.2, 0.4, 0.6, 0.8].map((o, i) => {
            const k = (t - tEmpedu + 0.4 + o * 0.9) / 1.4;
            if (k < 0 || k > 1.3) return null;
            const p = k <= 1 ? at(BILE_DUCT, k) : [pk[0] + (k - 1) * 0.8 * Math.cos(i), pk[1] + (k - 1) * 0.8 * Math.sin(i), 0.15];
            return <mesh key={i} material={m.bile} position={p as V3} scale={0.09}><sphereGeometry args={[1, 12, 8]} /></mesh>;
          })}
        {panc > 0 &&
          [0, 0.15, 0.3, 0.45, 0.6, 0.75].map((o, i) => {
            const k = (t - tPankreas + 0.3 + o * 1.2) / 1.5;
            if (k < 0 || k > 1) return null;
            return <mesh key={i} material={m.pep} position={at(PANC_DUCT, k)} scale={0.06}><octahedronGeometry args={[1, 0]} /></mesh>;
          })}
        {/* kimus terurai menjadi tiga jenis molekul terkecil */}
        {cloud.map((d, i) => {
          const a = d.a + t * d.sp;
          const rr = d.rr + split * 0.45;
          const p: V3 = [pk[0] + Math.cos(a) * rr, pk[1] + Math.sin(d.b + t * d.sp) * rr * 0.7, pk[2] + 0.1 + Math.sin(a) * rr * 0.4];
          return split < 0.5 ? (
            <mesh key={i} material={m.chyme} position={p} scale={0.05 * (1 - split)}><sphereGeometry args={[1, 10, 8]} /></mesh>
          ) : (
            <Molecule key={i} kind={d.kind} position={p} size={0.055 * split} rot={t * 1.3 + i} />
          );
        })}
        <Packet position={pkz} t={t} size={0.55} gold={1} split={split} />
      </Stage>
      <Chip anchor={gb} box={{x: 300, y: 1150}} text="Empedu" sub="mengemulsi lemak" color={C.bile} active={bile * (1 - ramp(t, tMolekul - 0.3, tMolekul))} appear={ramp(t, tEmpedu - 0.15, tEmpedu + 0.3) * (1 - ramp(t, tMolekul - 0.4, tMolekul))} />
      <Chip anchor={pa} box={{x: 330, y: 1290}} text="Enzim Pankreas" color={C.enzyme} active={panc} appear={ramp(t, tPankreas - 0.15, tPankreas + 0.3) * (1 - ramp(t, tMolekul - 0.4, tMolekul))} />
      <Chip anchor={mp} box={{x: 540, y: 470}} text={shown.join(' • ') || ' '} color={C.gold} active={1} appear={shown.length ? ramp(t, tGluk - 0.1, tGluk + 0.25) * (1 - ramp(t, t1 - 0.6, t1 - 0.3)) : 0} maxW={1080 * 0.9} />
    </>
  );
};
