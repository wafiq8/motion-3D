# Laporan Akhir — PERJALANAN NUTRISI (Seri Tubuh Manusia — Part 1)

- Mode: **C — anatomi** · skill diorama-basabasi v2.7 · tanggal produksi 13 Nov 2026
- File final: `out/perjalanan-nutrisi-final.mp4` (1080×1920, 30 fps, 58,80 dtk, H.264 + AAC 48 kHz)
- Preview: `out/perjalanan-nutrisi-preview.mp4` (skala 0,5) · Contact sheet: `out/contact-sheet.png`
- Scene: `out/scenes/scene-1.mp4` … `scene-8.mp4` (render per scene, digabung FFmpeg concat `-c copy`)
- Gerbang: Gerbang 1 disetujui · Gerbang 2 disetujui dengan permintaan merapikan hati & jantung (dikerjakan sebelum preview). Format Gerbang 2 = **penuh** (3 still/scene); belum ada pelonggaran (video Mode C pertama).

## Audio & timing

- Narasi: `voice-offer.mp3` asli 68,36 dtk (di atas batas 60) → **dipercepat 1,18× (FFmpeg atempo, nada tetap) atas persetujuan user** → `public/narasi.mp3` 57,97 dtk.
- Timestamp: Whisper large-v3 (faster-whisper, `language="id"` dipaksa) + verifikasi silencedetect −35 dB; batas scene = awal suara kalimat. Teks dari naskah resmi (selisih ASR: "12"→"dua belas", "fili"→"vili", "memompah"→"memompa").
- Musik: `music-medical.mp3` → `public/musik.mp3`, bed di bawah narasi dengan sidechain ducking, fade in/out.
- Total 58,80 dtk = narasi + jeda penutup 1,02 dtk setelah kata terakhir (musik tetap jalan), fade ke hitam.

## Tabel kalimat

| No | Kalimat | Mulai | Selesai | Scene |
|----|---------|-------|---------|-------|
| 1 | Perjalanan dimulai di mulut. Gigi menghancurkan makanan, air liur melembutkannya, dan enzim amilase mulai memecah karbohidrat menjadi gumpalan siap telan. | 0.00 | 8.30 | 1 |
| 2 | Saat ditelan, otot kerongkongan bergerak peristaltik — meremas bergelombang mendorong makanan turun ke lambung. | 8.67 | 14.05 | 2 |
| 3 | Di lambung, asam dan enzim pepsin mengaduk makanan menjadi bubur halus bernama kimus, sambil memecah protein. | 14.39 | 19.94 | 3 |
| 4 | Di usus dua belas jari, empedu memecah lemak dan enzim pankreas membongkar sisanya menjadi molekul terkecil: glukosa, asam amino, asam lemak. | 20.29 | 27.94 | 4 |
| 5 | Dinding usus halus dilapisi jutaan tonjolan bernama vili, yang memperluas area penyerapan agar molekul nutrisi menembus masuk. | 28.28 | 34.64 | 5 |
| 6 | Di dalam vili, nutrisi terbagi dua: gula dan asam amino masuk kapiler darah, sedangkan lemak lewat pembuluh limfa sebelum bergabung ke aliran darah. | 34.99 | 42.56 | 6 |
| 7 | Sebelum menyebar, darah dari usus mampir ke hati — racun disaring, kadar gula diatur, sebagian glukosa disimpan sebagai cadangan. | 42.93 | 49.74 | 7 |
| 8 | Akhirnya, jantung memompa darah penuh nutrisi ke seluruh tubuh: bahan bakar bagi otak, tenaga bagi otot, bahan baku perbaikan bagi setiap sel. | 50.08 | 57.78 | 8 |

## Pemetaan scene

| Scene | Pill | Kalimat | Detik | Frame timeline | Frame aktual di file |
|-------|------|---------|-------|----------------|----------------------|
| 1 | MULUT · pos 1/8 | 1 | 0.00–8.67 | 0–259 | 0–259 (selisih 0,00 dtk) |
| 2 | KERONGKONGAN · pos 2/8 | 2 | 8.67–14.39 | 260–431 | 260–431 (selisih 0,00 dtk) |
| 3 | LAMBUNG · pos 3/8 | 3 | 14.39–20.29 | 432–608 | 432–608 (selisih 0,00 dtk) |
| 4 | USUS DUA BELAS JARI · pos 4/8 | 4 | 20.29–28.28 | 609–847 | 609–847 (selisih 0,00 dtk) |
| 5 | VILI USUS · pos 5/8 | 5 | 28.28–34.99 | 848–1049 | 848–1049 (selisih 0,00 dtk) |
| 6 | DUA JALUR · pos 6/8 | 6 | 34.99–42.93 | 1050–1287 | 1050–1287 (selisih 0,00 dtk) |
| 7 | HATI · pos 7/8 | 7 | 42.93–50.08 | 1288–1501 | 1288–1501 (selisih 0,00 dtk) |
| 8 | SELURUH TUBUH · pos 8/8 | 8 | 50.08–58.80 | 1502–1763 | 1502–1763 (selisih 0,00 dtk) |

## Hasil validator & pemeriksa file

```
validate_timeline.py docs/timeline.json  → HASIL: PASS SEMUA (23 cek)
check_output.sh out/perjalanan-nutrisi-final.mp4
  PASS resolusi 1080x1920
  PASS fps 30
  PASS durasi 58.800000s (30–60)
  PASS tidak ada keheningan > 1,2 detik
  INFO loudness terukur: -14.4 LUFS (target -14 ±1)
  HASIL: PASS SEMUA
ebur128: I = -14.3 LUFS · true peak = -1.5 dBFS · LRA 1.4 LU
8 file scene identik: h264 1080x1920 30/1 (syarat concat -c copy) · total 1764 frame = 58,80 dtk
```

## QC mandiri 10 poin

1. **PASS** — validator PASS; file final ter-probe 1080×1920, 30 fps, 58,80 dtk; audio ada sampai akhir (durasi audio 58,80 dtk).
2. **PASS** — setiap batas scene jatuh tepat di frame awal kalimatnya (render per rentang frame dari timeline.json; selisih 0,00 dtk ≤ 0,3).
3. **PASS** — 50 halaman karaoke diukur dengan font asli (`tools/qc_text.mjs`): semua muat satu baris, terkecil 52 px (lantai 44 px). Chip/pill/judul dijepit di zona aman (atas ≥ 250 px, bawah ≤ 1610 px). Satu halaman 5 kata yang terpotong di still dev sudah diperbaiki sebelum Gerbang 2.
4. **PASS (dengan catatan)** — detik 0: penampang kepala + teks "Perjalanan dimulai di mulut." + suara hadir bersamaan. Catatan: hook Mode C bawaan (rujukan waktu-nyata + counter hidup) TIDAK dipakai, sesuai naskah final dan instruksi user (tanpa counter detak).
5. **PASS / N/A** — tidak ada angka data di naskah; tidak ada readout angka & tidak ada angka hero 3D (sesuai bawaan Mode C). Chip menyala tepat pada kata pemicunya (diambil dari timestamp kata).
6. **PASS** — tidak ada keheningan > 1 dtk (silencedetect −45 dB/0,5 dtk: 0 kejadian); jeda payoff 1,02 dtk dengan bed musik.
7. **PASS** — −14,3 LUFS terintegrasi, true peak −1,5 dBFS.
8. **PASS** — satu Stage (renderer, rig cahaya, void ungu, bokeh), satu set material glossy, font Playfair Display + Inter, gaya pill/chip/karaoke sama di 8 scene.
9. **PASS** — manusia hanya siluet tanpa wajah (penampang kepala profil scene 1, tubuh utuh scene 8). Organ hero utuh terbaca. Cek khusus Mode C di bawah.
10. **PASS** — penutup: teks callback "Perjalanan dimulai di mulut — dan berakhir di setiap sel." + kartu "SERI TUBUH MANUSIA · Part 1 · Perjalanan Nutrisi" di atas siluet tubuh dengan arteri menyala; fade ke hitam (frame terakhir luma 0). Tanpa CTV, tanpa ajakan membeli.

### Cek khusus Mode C

- Kode warna tidak terbalik di still mana pun: biru = vena porta, vena hepatika, vena kava, arteri pulmonalis, sisi vena kapiler & sel darah miskin O₂; merah terang = arteri, vena pulmonalis, sisi arteri kapiler. Emas HANYA paket/molekul nutrisi. Limfa putih susu, empedu hijau, enzim putih-lavender, asam hijau limau.
- Titik perubahan warna: kapiler vili (merah→biru, sel darah ikut berganti warna) dan paru (pembuluh biru keluar, merah kembali) — keduanya pada kalimat 6 & 8.
- Counter detak: N/A (dinonaktifkan atas permintaan user).
- Pill tahap sesuai pos di setiap still (pos n/8 + titik progres).
- Chip hanya menyala saat bagiannya disebut narasi.
- Judul tidak muncul di 5 detik pertama: judul tampil 8,67–12,27 dtk (awal scene 2).
- Penutup memuat callback ke kalimat pembuka + label seri.

## Penyimpangan & keputusan yang perlu diketahui

- Narasi dipercepat 1,18× (disetujui user).
- Judul tunda muncul di 8,67 dtk (sedikit di luar ±5–8 dtk) karena kalimat 1 baru selesai 8,30 dtk — dilaporkan di Gerbang 1, disetujui.
- Chip storyboard dipecah dua agar menempel ke bagiannya: "Pencernaan Mekanis" + "& Enzim Amilase"; "Asam Lambung (HCl)" + "& Enzim Pepsin → Kimus"; "Kapiler Darah" + "& Pembuluh Limfa". "Glukosa • Asam Amino • Asam Lemak" tampil bertahap mengikuti kata. "Distribusi Sistemik" di scene 8. Chip tambahan: Empedu, Enzim Pankreas, Jantung.
- Transisi antarscene = kamera menyelam ke / keluar dari paket emas (±0,28 dtk, kilau emas lembut) — tidak ada hard cut.
- Musik: ducking sederhana; tidak ada pemilihan musik oleh sesi.
- Format piksel file: yuvj420p (rentang penuh, keluaran bawaan Remotion) — diterima Instagram/TikTok; bila suatu platform menggeser warna, bisa dikonversi ke yuv420p tanpa render ulang 3D.

## Sumber fakta

- **Utama:** storyboard 8 scene dari user (sudah diperiksa user) — semua kalimat narasi.
- **Riset web: tidak dilakukan di sesi ini.** Teks layar tambahan di luar storyboard berasal dari pengetahuan fisiologi umum dan **ditandai BELUM DIVERIFIKASI dengan sumber di sesi ini**:
  - "memecah karbohidrat (pati)" (sub-chip amilase) — sesuai storyboard user ("karbohidrat/pati").
  - "mengemulsi lemak" (empedu) — sesuai storyboard user.
  - "area penyerapan berlipat ganda" (vili & mikrovili) — penegasan "memperluas area penyerapan"; besaran pastinya tidak disebut. ⚠ belum diverifikasi sumber.
  - "lewat paru-paru dulu: ambil oksigen" (scene 8) — sirkulasi pulmonal: darah vena dari tubuh masuk jantung kanan → paru → jantung kiri → aorta. ⚠ belum diverifikasi sumber di sesi ini; ditambahkan agar perubahan biru→merah tidak terkesan terjadi di jantung. Narasi tidak menyebut paru.
  - "lalu bergabung ke aliran darah" (limfa) — sesuai narasi; jalur rinci (duktus torasikus → vena subklavia) TIDAK digambarkan.
  - Penyimpanan glukosa di hati divisualkan sebagai gugus butir emas "cadangan" tanpa menyebut istilah glikogen.

## Aset yang disimpan untuk dipakai ulang

`src/three/Stage.tsx` (rig, void, bokeh, kilau transisi) · `src/three/materials.ts` · `src/three/VarTube.ts` (tabung cutaway beradius variabel) · `src/three/models/` (Packet, HeadSection, Esophagus, Stomach, Duodenum, Villi, VillusInterior, Liver, Heart, Body) · `src/overlay/` (FontGate, fit, StagePill, Chip, Karaoke, Title/Closing) · `tools/` (stills.mjs, contact_sheet.py, qc_text.mjs, render.sh, mix_audio.sh).

## Caption Instagram

Pernah kepikiran ke mana perginya nasi yang kamu kunyah tadi siang? 🍚➡️🫀

Perjalanannya dimulai di mulut: gigi menghancurkan, enzim amilase mulai memecah karbohidrat. Lewat gerak peristaltik kerongkongan, makanan turun ke lambung dan diaduk asam + pepsin jadi kimus. Di usus dua belas jari, empedu dan enzim pankreas membongkarnya jadi glukosa, asam amino, dan asam lemak. Jutaan vili di usus halus menyerapnya — gula & asam amino masuk kapiler darah, lemak lewat pembuluh limfa. Darah dari usus mampir ke hati untuk disaring dan diatur kadar gulanya, lalu jantung memompanya ke seluruh tubuh: bahan bakar otak, tenaga otot, bahan baku perbaikan setiap sel.

Perjalanan dimulai di mulut — dan berakhir di setiap sel.

Seri Tubuh Manusia — Part 1 · Perjalanan Nutrisi

#SeriTubuhManusia #TubuhManusia #SistemPencernaan #Pencernaan #Nutrisi #Biologi #BelajarBiologi #Anatomi #EdukasiSains #Basabasi
