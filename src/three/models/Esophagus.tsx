import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C} from '../../lib/style';
import {glossy} from '../materials';
import {varTube, curveOf} from '../VarTube';

export const ESO2 = curveOf([[0.2, 4.6, 0], [0.0, 2.5, 0], [-0.25, 0.3, 0], [0.0, -2.0, 0], [0.45, -4.2, 0], [0.9, -5.4, 0]]);
const bump = (x: number, w: number) => Math.exp(-(x * x) / (w * w));
/** Kerongkongan cutaway dengan gelombang peristaltik di belakang bolus (ub = posisi bolus 0..1). */
export const Esophagus: React.FC<{ub: number; squeeze: number}> = ({ub, squeeze}) => {
  const mat = useMemo(() => glossy('#ffffff', {side: THREE.DoubleSide, vertexColors: true}), []);
  const base = new THREE.Color(C.esophagus);
  const dark = new THREE.Color('#8E3346');
  const geo = useMemo(() => {
    const R = 0.46;
    const r = (u: number, th: number) => {
      const fold = 1 + 0.035 * Math.sin(th * 10);
      const bulge = 1 + 0.38 * bump(u - ub, 0.05);
      const sq = 1 - 0.55 * squeeze * bump(u - (ub - 0.085), 0.035) - 0.25 * squeeze * bump(u - (ub - 0.2), 0.04);
      return R * fold * bulge * sq;
    };
    const colors = (u: number) => base.clone().lerp(dark, Math.min(1, squeeze * (1.2 * bump(u - (ub - 0.085), 0.04) + 0.6 * bump(u - (ub - 0.2), 0.05))));
    return varTube(ESO2, r, {n: 160, m: 40, cut: 0.95, colors});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ub, squeeze]);
  return <mesh geometry={geo} material={mat} />;
};
