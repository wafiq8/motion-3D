import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Stage} from '../three/Stage';
import {VillusInterior, LOOP, LACTEAL, loopColor} from '../three/models/VillusInterior';
import {Packet, Molecule} from '../three/models/Packet';
import {Chip} from '../overlay/Chip';
import {C} from '../lib/style';
import {kf3, ramp, sceneEnd, sceneStart, wordAt, V3, lerp3, clamp, seeded} from '../lib/time';
import {withDive} from '../lib/dive';
import {project} from '../lib/project';

const S = 6;
const t0 = sceneStart(S);
const t1 = sceneEnd(S);
const tDua = wordAt(6, 'dua');
const tGula = wordAt(6, 'gula');
const tKapiler = wordAt(6, 'kapiler');
const tLemak = wordAt(6, 'lemak');
const tLimfa = wordAt(6, 'limfa');
const tBergabung = wordAt(6, 'bergabung');
const at = (c: THREE.Curve<THREE.Vector3>, u: number): V3 => {
  const p = c.getPointAt(clamp(u));
  return [p.x, p.y, p.z + 0.05];
};
const r = seeded(66);
const cells = Array.from({length: 46}, () => ({o: r(), sp: 0.07 + r() * 0.02}));
const golds = Array.from({length: 10}, (_, i) => ({o: i / 10, kind: i % 2 ? 'amino' : 'glukosa'}) as const);
const fats = Array.from({length: 7}, (_, i) => ({o: i / 7}));

export const Scene6: React.FC<{t: number}> = ({t}) => {
  // paket hero mengikuti jalur gula (kapiler → vena), lemak berpisah ke limfa
  const start: V3 = [0.35, 3.4, 0.8];
  const capEntry = at(LOOP, 0.62);
  const vk = ramp(t, tKapiler, t1);
  const pk: V3 = t < tGula ? kf3(t, [[t0, start], [tDua, [0.45, 2.2, 0.6]], [tGula, [0.8, 1.6, 0.4]]]) : t < tKapiler ? lerp3([0.8, 1.6, 0.4], capEntry, ramp(t, tGula, tKapiler)) : at(LOOP, 0.62 + 0.3 * vk);
  const base = {
    pos: kf3(t, [[t0, [0.6, 3.6, 3.5]], [t0 + 1.3, [0.3, 0.6, 13.5]], [tKapiler, [0.6, 0.0, 12.0]], [tLimfa, [0.2, -0.6, 12.0]], [tBergabung, [0.3, -1.6, 12.5]], [t1 - 0.75, [0.4, -2.0, 12.0]], [t1, [1.4, pk[1] + 0.2, 5.5]]]),
    target: kf3(t, [[t0, start], [t0 + 1.3, [0, -0.2, 0]], [tKapiler, [0.3, -0.4, 0]], [tLimfa, [0, -0.9, 0]], [tBergabung, [0.2, -2.2, 0]], [t1 - 0.75, [0.3, -2.5, 0]], [t1, pk]]),
    fov: 38,
  };
  const {cam, flash} = withDive(base, pk, t, t0, t1);
  const split = ramp(t, tDua - 0.2, tDua + 0.4);
  const capOn = ramp(t, tKapiler - 0.3, tKapiler + 0.3);
  const lymOn = ramp(t, tLimfa - 0.3, tLimfa + 0.3);
  const cellGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 16, 10);
    g.scale(1, 0.45, 1);
    return g;
  }, []);
  const cellMats = useMemo(() => [C.bloodRed, C.bloodBlue].map((c) => new THREE.MeshStandardMaterial({color: c, roughness: 0.3, emissive: c, emissiveIntensity: 0.25})), []);
  const capChip = project(cam, at(LOOP, 0.78));
  const lymChip = project(cam, at(LACTEAL, 0.45));
  return (
    <>
      <Stage cam={cam} t={t} flash={flash} seed={6}>
        <VillusInterior glowCap={capOn} glowLym={lymOn} />
        {cells.map((c, i) => {
          const u = (c.o + (t - t0) * c.sp) % 1;
          const p = at(LOOP, u);
          const col = loopColor(u);
          return <mesh key={i} geometry={cellGeo} material={col.r > col.b ? cellMats[0] : cellMats[1]} position={[p[0], p[1], p[2] + 0.12]} scale={0.11} rotation={[1.2, i, 0]} />;
        })}
        {/* gula & asam amino masuk kapiler lalu terbawa turun */}
        {golds.map((g, i) => {
          const k = clamp((t - tGula - g.o * 1.6) / 1.2);
          if (k <= 0) return null;
          const from: V3 = [2.4, 1.4 - g.o * 3, 0.4];
          const entry = at(LOOP, 0.6 + g.o * 0.15);
          const p = k < 1 ? lerp3(from, entry, k) : at(LOOP, Math.min(0.99, 0.6 + g.o * 0.15 + (t - tGula - g.o * 1.6 - 1.2) * 0.07));
          return <Molecule key={i} kind={g.kind} position={[p[0], p[1], p[2] + 0.2]} size={0.08} rot={t + i} />;
        })}
        {/* asam lemak masuk pembuluh limfa */}
        {fats.map((f, i) => {
          const k = clamp((t - tLemak + 0.2 - f.o * 1.2) / 1.1);
          if (k <= 0) return null;
          const from: V3 = [-2.4 + f.o * 0.5, 2.0 - f.o * 2.5, 0.5];
          const entry = at(LACTEAL, 0.05 + f.o * 0.2);
          const p = k < 1 ? lerp3(from, entry, k) : at(LACTEAL, Math.min(0.99, 0.05 + f.o * 0.2 + (t - tLemak + 0.2 - f.o * 1.2 - 1.1) * 0.09));
          return <Molecule key={i} kind="lemak" position={[p[0], p[1], p[2] + 0.25]} size={0.09} rot={t + i} />;
        })}
        <Packet position={[pk[0], pk[1], pk[2] + 0.25]} t={t} size={0.36} gold={1} split={1 - 0.5 * split} />
      </Stage>
      <Chip anchor={capChip} box={{x: 790, y: 560}} text="Kapiler Darah" sub="gula + asam amino" color={C.bloodBlue} active={capOn} appear={ramp(t, tKapiler - 0.2, tKapiler + 0.25) * (1 - ramp(t, t1 - 0.9, t1 - 0.6))} />
      <Chip anchor={lymChip} box={{x: 330, y: 1200}} text="& Pembuluh Limfa" sub="asam lemak" subs={[{text: 'lalu bergabung ke aliran darah', k: ramp(t, tBergabung - 0.1, tBergabung + 0.3)}]} color={C.lymph} active={lymOn} appear={ramp(t, tLimfa - 0.2, tLimfa + 0.25) * (1 - ramp(t, t1 - 0.9, t1 - 0.6))} />
    </>
  );
};
