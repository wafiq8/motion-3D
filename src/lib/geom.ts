import {
  BufferGeometry,
  Color,
  Curve,
  Float32BufferAttribute,
  Quaternion,
  Vector3,
} from 'three';

/** Tube yang meruncing di sepanjang kurva (radius = radiusFn(u)). */
export const taperedTube = (
  curve: Curve<Vector3>,
  segments: number,
  radial: number,
  radiusFn: (u: number) => number,
  flattenY = 1,
) => {
  const frames = curve.computeFrenetFrames(segments, false);
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const p = new Vector3();
  const n = new Vector3();
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, p);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radiusFn(u);
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);
      n.set(cos * N.x + sin * B.x, cos * N.y + sin * B.y, cos * N.z + sin * B.z).normalize();
      pos.push(p.x + r * n.x, p.y + r * n.y * flattenY, p.z + r * n.z);
      nor.push(n.x, n.y, n.z);
      uv.push(u * 6, j / radial);
    }
  }
  for (let i = 1; i <= segments; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = (radial + 1) * (i - 1) + (j - 1);
      const b = (radial + 1) * i + (j - 1);
      const c = (radial + 1) * i + j;
      const d = (radial + 1) * (i - 1) + j;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/** Vertex color gradasi punggung (gelap) -> perut (terang) berdasarkan normal Y. */
export const applyBellyGradient = (g: BufferGeometry, top: string, belly: string) => {
  const nrm = g.getAttribute('normal');
  const cTop = new Color(top);
  const cBelly = new Color(belly);
  const col: number[] = [];
  const c = new Color();
  for (let i = 0; i < nrm.count; i++) {
    const ny = nrm.getY(i);
    const t = Math.min(1, Math.max(0, (-ny + 0.15) * 1.6));
    c.copy(cTop).lerp(cBelly, t);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  return g;
};

const UP = new Vector3(0, 1, 0);
/** Transform untuk silinder (tinggi 1, sumbu Y) agar membentang dari a ke b. */
export const segmentTransform = (a: Vector3, b: Vector3) => {
  const dir = new Vector3().subVectors(b, a);
  const len = dir.length();
  const mid = new Vector3().addVectors(a, b).multiplyScalar(0.5);
  const q = new Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
  return { position: mid, quaternion: q, length: len };
};
