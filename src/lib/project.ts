import * as THREE from 'three';
import {V3} from './time';
import {W, H} from './style';
export type Cam = {pos: V3; target: V3; fov: number; roll?: number};
const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 400);
export const applyCam = (c: THREE.PerspectiveCamera, k: Cam) => {
  c.position.set(...k.pos);
  c.up.set(Math.sin(k.roll ?? 0), Math.cos(k.roll ?? 0), 0);
  c.lookAt(...k.target);
  c.fov = k.fov;
  c.aspect = W / H;
  c.near = 0.05;
  c.far = 400;
  c.updateProjectionMatrix();
  c.updateMatrixWorld(true);
};
/** Proyeksi titik 3D ke piksel layar (1080x1920) untuk chip DOM. */
export const project = (k: Cam, p: V3): {x: number; y: number; behind: boolean} => {
  applyCam(cam, k);
  const v = new THREE.Vector3(...p).project(cam);
  return {x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, behind: v.z > 1};
};
