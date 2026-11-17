// Render still banyak frame sekali jalan (satu bundle, satu browser).
// Pakai: node scripts/stills.mjs <scale> <outdir> <frame1,frame2,...>
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [scale = '0.5', outdir = 'out/stills', list = '0'] = process.argv.slice(2);
const frames = list.split(',').map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id: 'Arlindo', puppeteerInstance: browser});
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: f, output: `${outdir}/f${String(f).padStart(4, '0')}.png`, scale: Number(scale),
    puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log('still', f, Date.now() - t0, 'ms');
}
await browser.close({silent: true});
