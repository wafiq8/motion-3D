import {staticFile} from 'remotion';
export const SERIF = 'BBSerif';
export const SANS = 'BBSans';
const faces: [string, string, string][] = [
  [SERIF, 'fonts/playfair-display-latin-600-normal.woff2', '600'],
  [SERIF, 'fonts/playfair-display-latin-800-normal.woff2', '800'],
  [SANS, 'fonts/inter-latin-500-normal.woff2', '500'],
  [SANS, 'fonts/inter-latin-700-normal.woff2', '700'],
  [SANS, 'fonts/inter-latin-800-normal.woff2', '800'],
];
let p: Promise<void> | null = null;
export const loadFonts = () => {
  if (!p) p = Promise.all(faces.map(async ([fam, file, w]) => {
    const f = new FontFace(fam, `url(${staticFile(file)}) format('woff2')`, {weight: w});
    await f.load(); document.fonts.add(f);
  })).then(() => undefined);
  return p;
};
