import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setEntryPoint('./src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(21); // jaga file final < 100 MB (batas GitHub)
Config.setPixelFormat('yuv420p');
// Tanpa GPU: software WebGL (SwiftShader lewat ANGLE).
Config.setChromiumOpenGlRenderer('swangle');
Config.setTimeoutInMilliseconds(240000);

// Browser headless: pakai REMOTION_BROWSER bila diset, lalu chrome-headless-shell bawaan
// environment cloud (Playwright), kalau tidak ada biarkan Remotion mengunduh sendiri.
const candidates = [
  process.env.REMOTION_BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
].filter(Boolean) as string[];
const found = candidates.find((p) => fs.existsSync(p));
if (found) Config.setBrowserExecutable(found);
