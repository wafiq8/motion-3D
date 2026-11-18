import * as THREE from 'three';
// STYLE LOCK Mode A — palette + one material set shared by all scenes.
export const PAL = {
  sabana: '#C8A24A', sabanaDry: '#D9B865', dirt: '#B08A55', pasir: '#EAD9B0', kayu: '#6B4226',
  laut: '#2E6E8E', lautDeep: '#245A75', senja: '#F08A2E', emas: '#D9A62E', kabut: '#F2D8AE',
  figur: '#1F150C', awan: '#FFF3DC', aksen: '#FFB03A', rock: '#8C7A62', leaf: '#6E7F3A',
  leafDark: '#55652C', komodo: '#6A5E47', komodoDark: '#4C4333', komodoBelly: '#857659',
  goat: '#8E7E68', tourist: '#5F7C82', ranger: '#6B6A45', white: '#EDE3CF', roof: '#5C6B3E',
};
const cache = new Map<string, THREE.Material>();
export const mat = (color: string, opts: {rough?: number; emissive?: string; ei?: number; opacity?: number} = {}) => {
  const key = `${color}|${opts.rough ?? 0.9}|${opts.emissive ?? ''}|${opts.ei ?? 0}|${opts.opacity ?? 1}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color, roughness: opts.rough ?? 0.9, metalness: 0,
      emissive: opts.emissive ?? '#000000', emissiveIntensity: opts.ei ?? 0,
      transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1, depthWrite: (opts.opacity ?? 1) >= 1,
    });
    cache.set(key, m);
  }
  return m;
};
