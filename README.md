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
src/models/Human.tsx        figur siluet (paleontolog, perwira 1910, ranger)
src/models/Fauna.tsx        Thylacoleo, Diprotodon, Quinkana, rusa timor
src/models/Fossil.tsx       strata galian + tengkorak/tulang fosil
src/models/Sea.tsx          laut dengan gelombang vertex
src/models/DNA.tsx          heliks DNA dua untai yang menyatu
src/models/Markers.tsx      garis ukur, pin emas, alas diorama
src/scenes/Scene1..7*.tsx   7 scene
src/Root.tsx                komposisi KomodoDiorama60 + Scene-S1..S7, audio narasi
```

## Audio = master clock
`public/narasi-komodo.mp3` (48,04 dtk) mulai di frame 0. Batas scene mengikuti batas kalimat
(diukur dari jeda hening, lihat `NARRATION` & `SCENES` di `src/styleLock.ts`):

| Scene | Frame | Detik | Kalimat |
|---|---|---|---|
| S1 | 0–328 | 0–10,9 | 1–2 |
| S2 | 328–568 | 10,9–18,9 | 3–4 |
| S3 | 568–786 | 18,9–26,2 | 5 |
| S4 | 786–1122 | 26,2–37,4 | 6 |
| S5 | 1122–1229 | 37,4–41,0 | 7 |
| S6 | 1229–1310 | 41,0–43,7 | 8 |
| S7 | 1310–1800 | 43,7–60,0 | 9 + kartu penutup |

## Render
```
npm install
npm run render:scene1   # -> out/scene1-test.mp4
npm run render          # video final -> out/komodo-final.mp4 (dengan audio)
```
Tanpa GPU: memakai `--gl=swangle` (software WebGL). `remotion.config.ts` memakai chrome-headless-shell yang ada
di environment (atau `REMOTION_BROWSER=/path/ke/chrome`).

## Status
Semua 7 scene dibangun; video final `out/komodo-final.mp4`.
