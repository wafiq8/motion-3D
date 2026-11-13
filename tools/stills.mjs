// Render still per scene (awal/tengah/akhir) dengan satu bundle. Pakai: node tools/stills.mjs <outDir> <scale> [frames...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const [, , outDir = 'out/stills', scaleArg = '0.5', ...extra] = process.argv;
const scale = Number(scaleArg);
const tl = JSON.parse(fs.readFileSync('docs/timeline.json', 'utf8'));
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = {gl: 'swangle'};
const comp = await selectComposition({serveUrl, id: process.env.COMP ?? 'LeakyGut', browserExecutable, chromiumOptions});
let jobs = [];
if (extra.length) jobs = extra.map((f) => ({name: `f${f}`, frame: Number(f)}));
else
  for (const s of tl.scenes) {
    const a = Math.round(s.start_s * 30), b = Math.round(s.end_s * 30) - 1;
    const pick = [a + 14, Math.round((a + b) / 2), b - 14];
    ['awal', 'tengah', 'akhir'].forEach((n, i) => jobs.push({name: `scene${s.id}-${n}`, frame: pick[i]}));
  }
for (const j of jobs) {
  await renderStill({composition: comp, serveUrl, frame: j.frame, output: path.join(outDir, `${j.name}.png`), scale, browserExecutable, chromiumOptions, imageFormat: 'png'});
  console.log(j.name, j.frame);
}
