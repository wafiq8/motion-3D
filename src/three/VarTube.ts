import * as THREE from 'three';
/**
 * Tabung beradius variabel sepanjang kurva, opsional "cutaway" (sisi menghadap
 * kamera dibuka) agar isi (paket nutrisi) terlihat — gaya ilustrasi anatomi.
 * r(u, theta) -> radius. viewAxis = arah kira-kira menuju kamera.
 */
export const varTube = (
  curve: THREE.Curve<THREE.Vector3>,
  r: (u: number, th: number) => number,
  o: {n?: number; m?: number; cut?: number; viewAxis?: THREE.Vector3; colors?: (u: number) => THREE.Color; capEnds?: boolean} = {},
) => {
  const n = o.n ?? 120;
  const m = o.m ?? 36;
  const cut = o.cut ?? 0; // setengah-lebar bukaan (radian), 0 = tertutup
  const view = (o.viewAxis ?? new THREE.Vector3(0, 0, 1)).clone().normalize();
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const T = new THREE.Vector3();
  const B = new THREE.Vector3();
  const Z = new THREE.Vector3();
  const c = new THREE.Vector3();
  const th0 = Math.PI / 2 + cut;
  const span = Math.PI * 2 - 2 * cut;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    curve.getPointAt(u, c);
    curve.getTangentAt(u, T);
    B.crossVectors(T, view);
    if (B.lengthSq() < 1e-6) B.set(1, 0, 0);
    B.normalize();
    Z.crossVectors(B, T).normalize(); // menunjuk ke arah kamera
    const cc = o.colors ? o.colors(u) : null;
    for (let j = 0; j <= m; j++) {
      const th = th0 + (span * j) / m;
      const rr = r(u, th);
      pos.push(c.x + rr * (Math.cos(th) * B.x + Math.sin(th) * Z.x), c.y + rr * (Math.cos(th) * B.y + Math.sin(th) * Z.y), c.z + rr * (Math.cos(th) * B.z + Math.sin(th) * Z.z));
      if (cc) col.push(cc.r, cc.g, cc.b);
    }
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      const a = i * (m + 1) + j;
      const b = a + m + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (col.length) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};
export const curveOf = (pts: [number, number, number][], tension = 0.5) =>
  new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', tension);
