/**
 * Laut: plane dengan gelombang vertex animasi (CPU, deterministik per frame).
 */
import React, { useMemo } from 'react';
import { Color, Float32BufferAttribute, MeshStandardMaterial, PlaneGeometry } from 'three';
import { PALETTE } from '../styleLock';

const ORIGIN: [number, number] = [0, 0];

export const Sea: React.FC<{
  t: number;
  level?: number;
  size?: number;
  segments?: number;
  center?: [number, number];
  amplitude?: number;
}> = ({ t, level = 0, size = 400, segments = 140, center = ORIGIN, amplitude = 0.18 }) => {
  const { geo, base } = useMemo(() => {
    const g = new PlaneGeometry(size, size, segments, segments);
    g.rotateX(-Math.PI / 2);
    g.translate(center[0], 0, center[1]);
    const p = g.getAttribute('position');
    const base = Float32Array.from(p.array as Float32Array);
    const c1 = new Color(PALETTE.laut);
    const c2 = new Color(PALETTE.laut).lerp(new Color(PALETTE.kabut), 0.25);
    const col: number[] = [];
    for (let i = 0; i < p.count; i++) {
      const k = 0.5 + 0.5 * Math.sin(p.getX(i) * 0.05) * Math.cos(p.getZ(i) * 0.04);
      const c = c1.clone().lerp(c2, k * 0.6);
      col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new Float32BufferAttribute(col, 3));
    return { geo: g, base };
  }, [size, segments, center[0], center[1]]);
  const mat = useMemo(
    () => new MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.85, metalness: 0 }),
    [],
  );
  // gelombang
  const p = geo.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = base[i * 3];
    const z = base[i * 3 + 2];
    const y =
      Math.sin(x * 0.18 + t * 1.3) * 0.5 +
      Math.sin(z * 0.23 - t * 1.1 + x * 0.05) * 0.35 +
      Math.sin((x + z) * 0.6 + t * 2.4) * 0.15;
    p.setY(i, y * amplitude);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return <mesh geometry={geo} material={mat} position={[0, level, 0]} receiveShadow />;
};
