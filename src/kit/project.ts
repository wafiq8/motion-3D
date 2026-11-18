import * as THREE from 'three';
import {Cam} from './world';
import {V3} from './math';
const c = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 900);
/** project world point -> screen px for DOM leader labels (same camera as the canvas) */
export const project = (cam: Cam, p: V3): {x: number; y: number; vis: boolean} => {
  c.fov = cam.fov ?? 40; c.position.set(...cam.pos);
  c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
  c.lookAt(...cam.look); c.updateProjectionMatrix(); c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return {x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920, vis: v.z < 1};
};
