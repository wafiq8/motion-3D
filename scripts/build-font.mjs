// Konversi Oswald Bold (OFL) TTF -> format typeface JSON untuk THREE.FontLoader.
// Ini data outline glyph (vektor), BUKAN gambar/tekstur. Dijalankan sekali; hasil di-commit.
import opentype from 'opentype.js';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ttf = require.resolve('@expo-google-fonts/oswald/700Bold/Oswald_700Bold.ttf');
const font = opentype.parse(fs.readFileSync(ttf).buffer);
const chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;!?-–—+/\'"()&%#@·×';
const round = (v) => Math.round(v);
const glyphs = {};
for (const ch of chars) {
  const g = font.charToGlyph(ch);
  const bb = g.getBoundingBox();
  let o = '';
  for (const c of g.path.commands) {
    if (c.type === 'M') o += `m ${round(c.x)} ${round(c.y)} `;
    else if (c.type === 'L') o += `l ${round(c.x)} ${round(c.y)} `;
    else if (c.type === 'Q') o += `q ${round(c.x)} ${round(c.y)} ${round(c.x1)} ${round(c.y1)} `;
    else if (c.type === 'C')
      o += `b ${round(c.x)} ${round(c.y)} ${round(c.x1)} ${round(c.y1)} ${round(c.x2)} ${round(c.y2)} `;
    else if (c.type === 'Z') o += 'z ';
  }
  glyphs[ch] = { ha: round(g.advanceWidth), x_min: round(bb.x1), x_max: round(bb.x2), o: o.trim() };
}
const out = {
  glyphs,
  familyName: 'Oswald',
  ascender: font.ascender,
  descender: font.descender,
  underlinePosition: font.tables.post.underlinePosition,
  underlineThickness: font.tables.post.underlineThickness,
  boundingBox: { xMin: font.tables.head.xMin, yMin: font.tables.head.yMin, xMax: font.tables.head.xMax, yMax: font.tables.head.yMax },
  resolution: font.unitsPerEm,
  original_font_information: { license: 'SIL Open Font License 1.1', fontFamily: 'Oswald Bold' },
  cssFontWeight: 'bold',
  cssFontStyle: 'normal',
};
fs.writeFileSync('src/fonts/oswald-bold.typeface.json', JSON.stringify(out));
console.log('glyphs', Object.keys(glyphs).length, 'bytes', fs.statSync('src/fonts/oswald-bold.typeface.json').size);
