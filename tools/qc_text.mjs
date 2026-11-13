// QC lebar teks: semua halaman karaoke diukur dengan font asli di Chromium (Inter 800).
import {build} from 'esbuild';
import {createRequire as cr} from 'node:module';
const {chromium} = cr(import.meta.url)('playwright');
import fs from 'node:fs';
const out = new URL('../out/qc_pages.cjs', import.meta.url).pathname;
await build({entryPoints: ['tools/qc_pages_entry.ts'], bundle: true, platform: 'node', outfile: out, external: ['react', 'remotion', '@remotion/*', 'three'], logLevel: 'error'});
const {createRequire} = await import('node:module');
const req = createRequire(import.meta.url);
const pages = req(out).pages;
const font = fs.readFileSync('public/fonts/inter-latin-800-normal.woff2').toString('base64');
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<style>@font-face{font-family:I;src:url(data:font/woff2;base64,${font});font-weight:800}</style><span style="font-family:I;font-weight:800">x</span>`);
await p.evaluate(() => document.fonts.ready);
const res = await p.evaluate((pages) => {
  const c = document.createElement('canvas').getContext('2d');
  return pages.map((t) => { let s = 64; for (; s >= 44; s--) { c.font = `800 ${s}px I`; if (c.measureText(t).width <= 1080 * 0.9 - 64) break; } return {t, s, ok: s >= 44}; });
}, pages);
await b.close();
let bad = 0;
for (const r of res) { if (!r.ok) bad++; console.log(r.ok ? 'PASS' : 'SPLIT', String(r.s).padStart(2), r.t); }
console.log(`${res.length} halaman, ${bad} butuh 2 baris (lantai 44px)`);
