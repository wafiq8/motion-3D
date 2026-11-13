#!/usr/bin/env node
/**
 * Pipeline render per-scene + gabung tanpa encode ulang.
 *
 *   node scripts/render.mjs             # final: full-res, hanya scene yang berubah, lalu gabung -> out/komodo-final.mp4
 *   node scripts/render.mjs --preview   # preview: --scale=0.5, tanpa MSAA -> out/preview/komodo-preview.mp4
 *   node scripts/render.mjs S3 S4       # paksa render ulang scene tertentu saja (lalu gabung)
 *   node scripts/render.mjs --force     # render ulang semua scene
 *
 * - Bundle dibuat SEKALI, semua scene memakai bundle yang sama.
 * - Tiap scene = MP4 terpisah (video saja, --muted) di out/scenes/ (atau out/preview/scenes/).
 * - Cache: hash isi file sumber yang memengaruhi scene; scene yang hash-nya sama TIDAK di-render ulang.
 * - Gabung: ffmpeg concat demuxer, video -c copy (tanpa encode ulang). Audio narasi di-mux sekali;
 *   hanya audio yang di-encode (MP3 -> AAC, ~1 dtk) agar kompatibel di semua pemutar MP4.
 */
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const PREVIEW = args.includes('--preview');
const FORCE = args.includes('--force');
const ONLY = args.filter((a) => /^S[1-7]$/.test(a));

const SCENES = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
const SCENE_FILE = {
  S1: 'Scene1Hook.tsx', S2: 'Scene2Fossil.tsx', S3: 'Scene3Rivals.tsx', S4: 'Scene4Islands.tsx',
  S5: 'Scene5DNA.tsx', S6: 'Scene6Contrast.tsx', S7: 'Scene7Legacy.tsx',
};
const OUT_DIR = path.join(ROOT, 'out', PREVIEW ? 'preview' : '');
const SCENE_DIR = path.join(OUT_DIR, 'scenes');
const CACHE_FILE = path.join(SCENE_DIR, 'cache.json');
const FINAL = path.join(OUT_DIR, PREVIEW ? 'komodo-preview.mp4' : 'komodo-final.mp4');
const AUDIO = path.join(ROOT, 'public', 'narasi-komodo.mp3');
const CONCURRENCY = os.cpus().length; // sesuai jumlah core CPU
const BROWSER = [
  process.env.REMOTION_BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
].find((p) => p && fs.existsSync(p));

const settings = { preview: PREVIEW, scale: PREVIEW ? 0.5 : 1, crf: 21, codec: 'h264', v: 1 };

/** Hash semua file sumber yang memengaruhi scene: kode bersama + file scene itu sendiri. */
const listFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
const sharedFiles = listFiles(path.join(ROOT, 'src'))
  .filter((f) => !f.includes(`${path.sep}scenes${path.sep}`))
  .concat([path.join(ROOT, 'package-lock.json')])
  .sort();
const hashOf = (files) => {
  const h = createHash('sha256');
  for (const f of files) h.update(path.relative(ROOT, f)).update(fs.readFileSync(f));
  h.update(JSON.stringify(settings));
  return h.digest('hex').slice(0, 16);
};
const sceneHash = (id) => hashOf([...sharedFiles, path.join(ROOT, 'src', 'scenes', SCENE_FILE[id])]);

fs.mkdirSync(SCENE_DIR, { recursive: true });
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};

const todo = SCENES.filter((id) => {
  const file = path.join(SCENE_DIR, `${id}.mp4`);
  if (FORCE || ONLY.includes(id)) return true;
  return !(fs.existsSync(file) && cache[id] === sceneHash(id));
});
console.log(`Mode: ${PREVIEW ? 'PREVIEW (scale 0.5, tanpa MSAA)' : 'FINAL (full-res)'} · concurrency ${CONCURRENCY}`);
console.log(`Scene di-render: ${todo.length ? todo.join(', ') : '(tidak ada — semua dari cache)'}`);

if (todo.length) {
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });
  console.log(`Bundle: ${((Date.now() - t0) / 1000).toFixed(1)} dtk (sekali untuk semua scene)`);
  const envVariables = PREVIEW ? { KOMODO_PREVIEW: '1' } : {};
  for (const id of todo) {
    const t = Date.now();
    const composition = await selectComposition({
      serveUrl, id: `Scene-${id}`, envVariables, browserExecutable: BROWSER, chromiumOptions: { gl: 'swangle' },
    });
    const outputLocation = path.join(SCENE_DIR, `${id}.mp4`);
    let last = -1;
    await renderMedia({
      serveUrl, composition, codec: 'h264', outputLocation, muted: true, crf: settings.crf, scale: settings.scale,
      pixelFormat: 'yuv420p', imageFormat: 'jpeg', jpegQuality: 92, concurrency: CONCURRENCY, envVariables,
      browserExecutable: BROWSER, chromiumOptions: { gl: 'swangle' }, timeoutInMilliseconds: 240000,
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 10) * 10;
        if (pct !== last) { last = pct; process.stdout.write(`  ${id} ${pct}%\n`); }
      },
    });
    cache[id] = sceneHash(id);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`  ${id} selesai: ${((Date.now() - t) / 1000).toFixed(0)} dtk, ${composition.durationInFrames} frame`);
  }
}

// Gabung: concat demuxer -c copy (video tidak di-encode ulang) + mux audio narasi.
const list = path.join(SCENE_DIR, 'concat.txt');
fs.writeFileSync(list, SCENES.map((id) => `file '${path.join(SCENE_DIR, `${id}.mp4`)}'`).join('\n') + '\n');
const ff = ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list];
if (fs.existsSync(AUDIO)) ff.push('-i', AUDIO, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k');
else ff.push('-c', 'copy');
ff.push('-movflags', '+faststart', FINAL);
execFileSync('ffmpeg', ff, { stdio: 'inherit' });

const probe = execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
  'stream=width,height,nb_read_packets:format=duration,size', '-of', 'compact', FINAL]).toString().trim();
console.log(`Gabung selesai -> ${path.relative(ROOT, FINAL)}\n${probe}`);
