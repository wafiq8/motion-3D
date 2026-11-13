import {measureText} from '@remotion/layout-utils';
/** fontSize = min(batas, hasil fit) dengan lantai keterbacaan; null = tidak muat (wajib dipecah). */
export const fitSize = (text: string, fontFamily: string, fontWeight: string, maxWidth: number, maxSize: number, floor: number, letterSpacing = 0): number | null => {
  for (let s = maxSize; s >= floor; s -= 1) {
    const w = measureText({text, fontFamily, fontWeight, fontSize: s, letterSpacing: letterSpacing ? `${letterSpacing * s}px` : undefined, validateFontIsLoaded: true}).width;
    if (w <= maxWidth) return s;
  }
  return null;
};
export const textWidth = (text: string, fontFamily: string, fontWeight: string, fontSize: number) =>
  measureText({text, fontFamily, fontWeight, fontSize, validateFontIsLoaded: true}).width;
