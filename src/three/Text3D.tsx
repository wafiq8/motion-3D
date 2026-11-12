/**
 * Tipografi 3D di DALAM scene (bukan overlay): TextGeometry diekstrusi.
 *  - TitleCard: sans tebal condensed kapital, putih + satu kata aksen #FFB03A.
 *  - GoldNumber: angka kunci emas #D9A62E (metalness 0.65).
 */
import React, { useMemo } from 'react';
import { Box3, BufferGeometry, MeshStandardMaterial } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fontJson from '../fonts/oswald-bold.typeface.json';
import { MATERIAL, PALETTE, TYPE_COLORS } from '../styleLock';

const font = new FontLoader().parse(fontJson as never);

type Word = { text: string; accent?: boolean };
export type TextLine = { words: Word[]; size?: number };

const geoCache = new Map<string, { g: BufferGeometry; w: number }>();
const wordGeo = (text: string, size: number, depth: number) => {
  const key = `${text}|${size}|${depth}`;
  const hit = geoCache.get(key);
  if (hit) return hit;
  const g = new TextGeometry(text, {
    font,
    size,
    depth,
    curveSegments: 6,
    bevelEnabled: true,
    bevelThickness: depth * 0.18,
    bevelSize: size * 0.018,
    bevelSegments: 2,
  });
  g.computeBoundingBox();
  const bb = g.boundingBox as Box3;
  const out = { g, w: bb.max.x - bb.min.x };
  g.translate(-bb.min.x, 0, -depth / 2);
  geoCache.set(key, out);
  return out;
};

const useTextMaterials = (opacity: number, variant: 'title' | 'gold') =>
  useMemo(() => {
    const transparent = opacity < 0.999;
    const mk = (color: string, emissive: number, metal = 0, rough = 0.88) =>
      new MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: emissive,
        roughness: rough,
        metalness: metal,
        transparent,
        opacity,
        fog: false,
      });
    if (variant === 'gold') {
      const face = mk(MATERIAL.gold.color, 0.28, MATERIAL.gold.metalness, MATERIAL.gold.roughness);
      const side = mk(PALETTE.kayu, 0.05, 0, 0.9);
      return { main: [face, side], accent: [face, side] };
    }
    const side = mk(PALETTE.kayu, 0.02, 0, 0.92);
    return {
      main: [mk(TYPE_COLORS.utama, 0.55), side],
      accent: [mk(TYPE_COLORS.aksen, 0.45), side],
    };
  }, [opacity, variant]);

/**
 * Blok teks 3D multi-baris, rata tengah. Titik origin = tengah blok.
 * condense: skala X tambahan agar lebih condensed.
 */
export const Text3DBlock: React.FC<{
  lines: TextLine[];
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
  depth?: number;
  lineGap?: number;
  opacity?: number;
  condense?: number;
  variant?: 'title' | 'gold';
}> = ({
  lines,
  position,
  rotation = [0, 0, 0],
  size = 1,
  depth,
  lineGap = 0.28,
  opacity = 1,
  condense = 0.9,
  variant = 'title',
}) => {
  const mats = useTextMaterials(opacity, variant);
  const layout = useMemo(() => {
    const rows: { y: number; items: { g: BufferGeometry; x: number; accent: boolean }[] }[] = [];
    let y = 0;
    const heights: number[] = [];
    for (const line of lines) {
      const s = (line.size ?? 1) * size;
      const d = depth ?? s * 0.22;
      const space = s * 0.26;
      const items: { g: BufferGeometry; x: number; accent: boolean }[] = [];
      let x = 0;
      for (const w of line.words) {
        const wg = wordGeo(w.text, s, d);
        items.push({ g: wg.g, x, accent: !!w.accent });
        x += wg.w + space;
      }
      const total = x - space;
      for (const it of items) it.x -= total / 2;
      rows.push({ y: -y - s, items });
      heights.push(s);
      y += s * (1 + lineGap);
    }
    const totalH = y - heights[heights.length - 1] * lineGap;
    for (const r of rows) r.y += totalH / 2;
    return rows;
  }, [lines, size, depth, lineGap]);

  if (opacity <= 0.001) return null;
  return (
    <group position={position} rotation={rotation} scale={[condense, 1, 1]}>
      {layout.map((row, i) =>
        row.items.map((it, j) => (
          <mesh
            key={`${i}-${j}`}
            geometry={it.g}
            material={it.accent ? mats.accent : mats.main}
            position={[it.x, row.y, 0]}
            castShadow
          />
        )),
      )}
    </group>
  );
};
