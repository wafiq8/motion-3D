# komodo-diorama

Video 3D vertikal **"KomodoDiorama60"** — Remotion + Three.js (`@remotion/three` + `@react-three/fiber`).
1080×1920 (9:16 native), 30 fps, 1800 frame (60 detik), 7 scene, hard cut.

**Style lock:** `src/styleLock.ts` — "Diorama 3D Basabasi v1" (palet, cahaya, fog, material, awan, tipografi).

## Aturan keras proyek
- Semua visual = geometri 3D prosedural dari primitif Three.js. Tanpa foto, gambar AI, sprite, tekstur file, GLB.
  Satu-satunya tekstur adalah bump map yang dihasilkan kode (`src/lib/proceduralTextures.ts`).
- Kamera 3D native 9:16, tanpa letterbox. Gerak shot hanya dari kamera yang berpindah di ruang 3D.
- Manusia = siluet primitif gelap tanpa wajah. Komodo tidak pernah close-up: jarak kamera ≥ 8 m
  (dicek di kode — render gagal bila dilanggar).
- Teks dibangun sebagai `TextGeometry` 3D di dalam scene (font Oswald Bold, OFL, dikonversi ke data outline vektor
  oleh `scripts/build-font.mjs`).

## Struktur
```
src/styleLock.ts            style lock (dipakai semua scene)
src/three/Stage.tsx         ThreeCanvas 9:16 + rig cahaya/fog/ACES + kamera
src/three/Text3D.tsx        kartu judul 3D & angka emas
src/models/Komodo.tsx       Komodo prosedural (juga Megalania/biawak lewat props)
src/models/Terrain.tsx      terrain noise + rumput InstancedMesh bergoyang
src/models/Scenery.tsx      awan merged-spheres, langit, lontar, batu
src/scenes/Scene1Hook.tsx   S1 (0–210)
src/Root.tsx                komposisi KomodoDiorama60 + KomodoS1Test, slot audio
```

## Audio
Taruh narasi di `public/narasi-komodo.mp3` — otomatis dipakai komposisi utama bila file ada.

## Render
```
npm install
npm run render:scene1   # -> out/scene1-test.mp4
npm run render          # komposisi penuh (setelah S2–S7 dibangun)
```
Tanpa GPU: memakai `--gl=swangle` (software WebGL). `remotion.config.ts` memakai chrome-headless-shell yang ada
di environment (atau `REMOTION_BROWSER=/path/ke/chrome`).

## Status
Tahap 0–2 selesai (scaffold, style lock, Komodo + terrain sabana, test render S1). S2–S7 menunggu review.
