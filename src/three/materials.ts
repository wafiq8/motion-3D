import * as THREE from 'three';
import {useMemo} from 'react';
// Satu set material Mode C: vinyl glossy, tanpa tekstur luar.
export const glossy = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({color, roughness: 0.32, metalness: 0.02, ...o});
export const useGlossy = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => glossy(color, o), [color, JSON.stringify(o)]);
export const glow = (color: string, intensity = 1.6) =>
  new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity: intensity, roughness: 0.3, toneMapped: true});

/** Halo lembut menghadap kamera (fresnel pada bola) — prosedural. */
export const haloMat = (color: string, strength = 1) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {col: {value: new THREE.Color(color)}, k: {value: strength}},
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 col; uniform float k; varying vec3 vN; varying vec3 vV;
      void main(){ float f = clamp(dot(vN, vV),0.0,1.0); float a = pow(f, 2.5)*k; gl_FragColor = vec4(col*a, a); }`,
  });
