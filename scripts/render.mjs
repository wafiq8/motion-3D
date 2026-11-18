// Usage:
//   node scripts/render.mjs stills [scale] [frames...]   -> out/stills/f<frame>.png (default: 3 per scene)
//   node scripts/render.mjs scenes <scale> <outDir> [ids...] -> <outDir>/scene-N.mp4 (video only)
import {bundle} from '@remotion/bundler';
import {renderStill, renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [mode, scaleArg, ...rest] = process.argv.slice(2);
const scale = Number(scaleArg ?? 0.5);
const tl = JSON.parse(fs.readFileSync('docs/timeline.json', 'utf8'));
const GL = process.env.GL ?? 'angle';
const t0 = Date.now();
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const chromiumOptions = {gl: GL};
const browserExecutable = process.env.BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const composition = await selectComposition({serveUrl, id: 'Main', chromiumOptions, browserExecutable});
console.log('bundled in', ((Date.now() - t0) / 1000).toFixed(1), 's');

if (mode === 'stills') {
  fs.mkdirSync('out/stills', {recursive: true});
  let frames = rest.map(Number);
  if (!frames.length) {
    frames = tl.scenes.flatMap((s) => {
      const a = Math.round(s.start_s * 30), b = Math.round(s.end_s * 30) - 1;
      return [a + 6, Math.round((a + b) / 2), b - 6];
    });
  }
  for (const f of frames) {
    const ts = Date.now();
    await renderStill({serveUrl, composition, frame: f, output: `out/stills/f${String(f).padStart(4, '0')}.png`, scale, chromiumOptions, browserExecutable, overwrite: true});
    console.log('still', f, ((Date.now() - ts) / 1000).toFixed(1) + 's');
  }
} else if (mode === 'scenes') {
  const [outDir, ...ids] = rest;
  fs.mkdirSync(outDir, {recursive: true});
  const want = ids.length ? ids.map(Number) : tl.scenes.map((s) => s.id);
  const total = Math.round(tl.total_duration_s * 30);
  for (const s of tl.scenes.filter((x) => want.includes(x.id))) {
    const a = Math.round(s.start_s * 30);
    const b = s.id === tl.scenes.length ? total - 1 : Math.round(s.end_s * 30) - 1;
    const ts = Date.now();
    await renderMedia({serveUrl, composition, codec: 'h264', muted: true, frameRange: [a, b], scale, crf: scale < 1 ? 23 : 16,
      outputLocation: `${outDir}/scene-${s.id}.mp4`, chromiumOptions, browserExecutable, concurrency: os.cpus().length, imageFormat: 'jpeg', jpegQuality: 92, overwrite: true,
      onProgress: ({progress}) => { if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\rscene ${s.id} ${(progress * 100).toFixed(0)}%   `); }});
    console.log(`\nscene ${s.id} frames ${a}-${b} in ${((Date.now() - ts) / 1000).toFixed(0)}s`);
  }
}
console.log('total', ((Date.now() - t0) / 1000).toFixed(0), 's');
