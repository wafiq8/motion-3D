import React, {useMemo} from 'react';
import * as THREE from 'three';
import {V3} from '../lib/time';
export type InstItem = {p: V3; s: number | V3; r?: V3; c?: THREE.Color | string};
/** Instancing generik: satu draw call untuk banyak elemen berulang (partikel, sel). */
export const Inst: React.FC<{geo: THREE.BufferGeometry; mat: THREE.Material; items: InstItem[]; max: number; renderOrder?: number}> = ({geo, mat, items, max, renderOrder = 0}) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, max);
    m.frustumCulled = false;
    return m;
  }, [geo, mat, max]);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const sc = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const col = new THREE.Color();
  const n = Math.min(max, items.length);
  for (let i = 0; i < n; i++) {
    const it = items[i];
    e.set(...(it.r ?? [0, 0, 0]));
    q.setFromEuler(e);
    if (typeof it.s === 'number') sc.set(it.s, it.s, it.s);
    else sc.set(...it.s);
    pos.set(...it.p);
    m4.compose(pos, q, sc);
    mesh.setMatrixAt(i, m4);
    if (it.c !== undefined) {
      col.set(it.c as THREE.ColorRepresentation);
      mesh.setColorAt(i, col);
    }
  }
  mesh.count = n;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.renderOrder = renderOrder;
  return <primitive object={mesh} />;
};
