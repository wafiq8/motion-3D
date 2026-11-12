/**
 * Komodo prosedural — 100% geometri Three.js (tanpa GLB / tanpa gambar).
 * Panjang dasar 3 m, menghadap +X, titik (0,0,0) = tanah di bawah badan.
 *
 * Dipakai ulang (BUKAN model baru) untuk:
 *  - Megalania: length 5–7, bulk ~1.3 (lebih kekar)
 *  - Biawak pasir: length ~1, dua varian warna (bodyColor/bellyColor)
 */
import React, { useMemo } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  LatheGeometry,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { DERIVED, PALETTE } from '../styleLock';
import { scaleBump } from '../lib/proceduralTextures';
import { applyBellyGradient, segmentTransform, taperedTube } from '../lib/geom';

export type KomodoProps = {
  /** Waktu animasi (detik). */
  t: number;
  /** Kecepatan jalan (m/s) — menggerakkan siklus kaki. Posisi dunia diatur parent. */
  speed?: number;
  /** Panjang total (m). Komodo 3, Megalania 5–7, biawak ~1. */
  length?: number;
  /** Kekekaran (skala tinggi & lebar relatif). */
  bulk?: number;
  bodyColor?: string;
  bellyColor?: string;
  /** Offset fase agar beberapa individu tidak sinkron. */
  phase?: number;
  tongue?: boolean;
  position?: [number, number, number];
  rotationY?: number;
};

const BODY_REAR = -0.45;
const BODY_LEN = 1.42;
const BODY_Y = 0.31;
const STRIDE = 0.36; // m (skala dasar 3 m)

// Profil lathe badan: [t (0=pinggul, 1=leher), radius]
const PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.015, 0.11],
  [0.06, 0.145],
  [0.2, 0.175],
  [0.42, 0.205],
  [0.6, 0.2],
  [0.75, 0.18],
  [0.86, 0.15],
  [0.95, 0.125],
  [0.99, 0.095],
  [1.0, 0.0],
];

const useKomodoGeometries = (bodyColor: string, bellyColor: string) =>
  useMemo(() => {
    const pts = PROFILE.map(([t, r]) => new Vector2(r, t * BODY_LEN));
    const body = new LatheGeometry(pts, 28);
    body.rotateZ(-Math.PI / 2); // sumbu lathe Y -> X
    body.scale(1, 0.8, 1.08); // lebih lebar daripada tinggi
    body.translate(BODY_REAR, BODY_Y, 0);
    body.computeVertexNormals();
    applyBellyGradient(body, bodyColor, bellyColor);

    const head = new RoundedBoxGeometry(0.38, 0.135, 0.22, 4, 0.055);
    // moncong meruncing: sempitkan bagian depan
    const hp = head.getAttribute('position');
    for (let i = 0; i < hp.count; i++) {
      const x = hp.getX(i);
      const u = (x + 0.17) / 0.34; // 0 = pangkal, 1 = ujung moncong
      const k = 1 - Math.max(0, u - 0.25) * 0.55;
      hp.setZ(i, hp.getZ(i) * k);
      // atas rata, moncong menurun ke ujung
      const y = hp.getY(i);
      hp.setY(i, y * (1 - Math.max(0, u - 0.3) * 0.35) - Math.max(0, u - 0.5) * 0.02);
    }
    head.computeVertexNormals();
    applyBellyGradient(head, bodyColor, bellyColor);

    const jaw = new RoundedBoxGeometry(0.26, 0.05, 0.15, 2, 0.022);
    applyBellyGradient(jaw, bodyColor, bellyColor);

    const limb = new CylinderGeometry(1, 0.85, 1, 10, 1);
    const joint = new SphereGeometry(1, 12, 8);
    const foot = new RoundedBoxGeometry(0.15, 0.04, 0.1, 2, 0.015);
    const eye = new SphereGeometry(0.017, 10, 8);

    // Lidah bercabang: plane tipis (ShapeGeometry) di bidang XZ.
    const s = new Shape();
    const w = 0.009;
    s.moveTo(0, -w);
    s.lineTo(0.15, -w);
    s.lineTo(0.205, -0.03);
    s.lineTo(0.21, -0.024);
    s.lineTo(0.165, 0);
    s.lineTo(0.21, 0.024);
    s.lineTo(0.205, 0.03);
    s.lineTo(0.15, w);
    s.lineTo(0, w);
    s.closePath();
    const tongue = new ShapeGeometry(s);
    tongue.rotateX(-Math.PI / 2);

    return { body, head, jaw, limb, joint, foot, eye, tongue };
  }, [bodyColor, bellyColor]);

const useKomodoMaterials = (bodyColor: string) =>
  useMemo(() => {
    const bump = scaleBump(11, 256, 16).clone();
    bump.repeat.set(10, 5);
    bump.needsUpdate = true;
    const skin = new MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.92,
      metalness: 0,
      bumpMap: bump,
      bumpScale: 2.2,
    });
    const limb = new MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.94,
      metalness: 0,
      bumpMap: bump,
      bumpScale: 1.6,
    });
    const eye = new MeshStandardMaterial({ color: DERIVED.komodoGelap, roughness: 0.85, metalness: 0 });
    const tongue = new MeshStandardMaterial({
      color: DERIVED.lidah,
      roughness: 0.85,
      metalness: 0,
      side: DoubleSide,
    });
    return { skin, limb, eye, tongue };
  }, [bodyColor]);

type LegDef = { x: number; side: 1 | -1; phase: number; hind: boolean };
const LEGS: LegDef[] = [
  { x: 0.66, side: 1, phase: 0.0, hind: false }, // depan kiri
  { x: 0.66, side: -1, phase: 0.5, hind: false }, // depan kanan
  { x: -0.28, side: 1, phase: 0.5, hind: true }, // belakang kiri
  { x: -0.28, side: -1, phase: 0.0, hind: true }, // belakang kanan
];

const frac = (v: number) => v - Math.floor(v);

const Leg: React.FC<{
  def: LegDef;
  cycle: number;
  geo: ReturnType<typeof useKomodoGeometries>;
  mat: ReturnType<typeof useKomodoMaterials>;
}> = ({ def, cycle, geo, mat }) => {
  const ph = frac(cycle + def.phase);
  const stanceFrac = 0.62;
  let off: number;
  let lift = 0;
  if (ph < stanceFrac) {
    off = STRIDE / 2 - (ph / stanceFrac) * STRIDE;
  } else {
    const s = (ph - stanceFrac) / (1 - stanceFrac);
    off = -STRIDE / 2 + s * STRIDE;
    lift = Math.sin(Math.PI * s) * 0.07;
  }
  const side = def.side;
  const spread = def.hind ? 0.47 : 0.44;
  const shoulder = new Vector3(def.x, BODY_Y - 0.03, side * 0.16);
  const footP = new Vector3(def.x + off + (def.hind ? -0.04 : 0.05), 0.03 + lift, side * spread);
  const elbow = new Vector3(
    (shoulder.x + footP.x) / 2 + (def.hind ? -0.05 : 0.04),
    0.2 + lift * 0.6,
    side * (spread - 0.02),
  );
  const upper = segmentTransform(shoulder, elbow);
  const lower = segmentTransform(elbow, footP);
  const rU = def.hind ? 0.085 : 0.075;
  const rL = def.hind ? 0.06 : 0.055;
  return (
    <group>
      <mesh
        geometry={geo.limb}
        material={mat.limb}
        position={upper.position}
        quaternion={upper.quaternion}
        scale={[rU, upper.length, rU]}
        castShadow
      />
      <mesh geometry={geo.joint} material={mat.limb} position={elbow} scale={rU * 0.95} castShadow />
      <mesh
        geometry={geo.limb}
        material={mat.limb}
        position={lower.position}
        quaternion={lower.quaternion}
        scale={[rL, lower.length, rL]}
        castShadow
      />
      <mesh
        geometry={geo.foot}
        material={mat.limb}
        position={[footP.x + 0.03, footP.y, footP.z + side * 0.015]}
        rotation={[0, side * -0.35, 0]}
        castShadow
      />
    </group>
  );
};

export const Komodo: React.FC<KomodoProps> = ({
  t,
  speed = 0,
  length = 3,
  bulk = 1,
  bodyColor = PALETTE.komodo,
  bellyColor = DERIVED.komodoPerut,
  phase = 0,
  tongue = true,
  position = [0, 0, 0],
  rotationY = 0,
}) => {
  const geo = useKomodoGeometries(bodyColor, bellyColor);
  const mat = useKomodoMaterials(bodyColor);

  // Siklus jalan: jarak tempuh (dalam skala dasar) / langkah.
  const unit = length / 3;
  const cycle = (speed * t) / unit / (STRIDE * 2) + phase + (speed === 0 ? 0.15 : 0);
  const gait = Math.sin(cycle * Math.PI * 2);

  // Ekor: tube meruncing dari CatmullRomCurve3, berayun lateral.
  const tail = useMemo(() => {
    const idle = Math.sin(t * 1.3 + phase * 6) * 0.04;
    const pts = [0, 1, 2, 3, 4, 5].map((i) => {
      const u = i / 5;
      const x = -0.32 - u * 1.43;
      const y = BODY_Y - 0.01 - Math.pow(u, 0.8) * 0.27;
      const z = (gait * 0.12 + idle) * Math.sin(u * Math.PI * 0.9 + 0.3) * u * 1.4;
      return new Vector3(x, y, z);
    });
    const curve = new CatmullRomCurve3(pts, false, 'centripetal');
    const g = taperedTube(curve, 40, 12, (u) => 0.165 * Math.pow(1 - u, 1.1) + 0.006, 0.82);
    applyBellyGradient(g, bodyColor, bellyColor);
    return g as BufferGeometry;
  }, [gait, t, phase, bodyColor, bellyColor]);

  // Kepala menoleh pelan + lidah menjulur periodik.
  const headYaw = Math.sin(t * 0.7 + phase * 3) * 0.12 - gait * 0.04;
  const flickPeriod = 1.9;
  const fp = frac(t / flickPeriod + phase);
  const flick = tongue && fp < 0.22 ? Math.sin((fp / 0.22) * Math.PI) : 0;

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[unit, unit * bulk, unit * bulk]}>
      <group rotation={[0, gait * 0.05, 0]}>
        <mesh geometry={geo.body} material={mat.skin} castShadow receiveShadow />
        <mesh geometry={tail} material={mat.skin} castShadow receiveShadow />
        {LEGS.map((d, i) => (
          <Leg key={i} def={d} cycle={cycle} geo={geo} mat={mat} />
        ))}
        {/* Kepala */}
        <group position={[0.92, BODY_Y - 0.01, 0]} rotation={[0, headYaw, -0.05]}>
          <mesh geometry={geo.head} material={mat.skin} position={[0.19, 0.0, 0]} castShadow />
          <mesh geometry={geo.jaw} material={mat.skin} position={[0.13, -0.045, 0]} castShadow />
          <mesh geometry={geo.eye} material={mat.eye} position={[0.12, 0.035, 0.08]} />
          <mesh geometry={geo.eye} material={mat.eye} position={[0.12, 0.035, -0.08]} />
          {flick > 0.02 ? (
            <mesh
              geometry={geo.tongue}
              material={mat.tongue}
              position={[0.36, -0.03, 0]}
              rotation={[0, 0, -0.12]}
              scale={[flick * 1.2, 1, 1]}
            />
          ) : null}
        </group>
      </group>
    </group>
  );
};

/** Posisi titik referensi Komodo (tengah badan) untuk QC jarak kamera. */
export const komodoCenter = (pos: [number, number, number], length = 3) =>
  new Vector3(pos[0], pos[1] + BODY_Y * (length / 3), pos[2]);
