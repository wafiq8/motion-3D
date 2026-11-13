# Laporan Akhir — LEAKY GUT — USUS BOCOR (Seri Tubuh Manusia — Part 2)

- Mode: **C — anatomi** · skill diorama-basabasi v2.7 · produksi 13 Nov 2026
- File final: `out/leaky-gut-final.mp4` (1080×1920, 30 fps, 44,50 dtk, H.264 + AAC 48 kHz, 29,6 MB)
- Preview: `out/leaky-gut-preview.mp4` (skala 0,5) · Contact sheet: `out/contact-sheet.png` (+ potongan `-1`/`-2`)
- Scene: `out/scenes/scene-1.mp4` … `scene-6.mp4` (render per scene, gabung FFmpeg concat `-c copy`)
- Gerbang: Gerbang 1 disetujui · Gerbang 2 disetujui tanpa revisi. Format Gerbang 2 = **penuh** (3 still/scene). Catatan tangga pelonggaran: ini video ke-1 yang lolos Gerbang 2 tanpa revisi visual mayor (Part 1 lolos dengan permintaan merapikan hati & jantung) — belum ada pelonggaran (butuh 3 berturut-turut).

## Audio & timing

- Narasi: `voice-offer-usus.mp3` → `public/narasi.mp3`, **tempo asli** 43,47 dtk.
- Timestamp: Whisper large-v3 (faster-whisper, `language="id"` dipaksa) + verifikasi silencedetect −35 dB; batas kalimat = awal/akhir suara. Teks dari naskah resmi (selisih ASR: «Taukah» → «Tahukah»). Skrip: `tools/build_timeline.py`.
- Musik: `music-medical.mp3` (di repo sudah berada di `public/musik.mp3` sejak Part 1) — bed di bawah narasi, sidechain ducking, fade in/out.
- Total 44,50 dtk = narasi + jeda payoff 1,03 dtk setelah kata terakhir (kartu seri + musik), fade ke hitam (luma frame terakhir 0).

## Tabel kalimat

| No | Kalimat | Mulai | Selesai | Scene |
|----|---------|-------|---------|-------|
| 1 | Tahukah kamu, banyak masalah kesehatan sebenarnya berawal dari usus? Sisa makanan yang menumpuk memicu bakteri jahat menghasilkan racun di dalam usus. | 0.00 | 9.08 | 1 |
| 2 | Iritasi yang dibiarkan terus-menerus membuat dinding usus merenggang dan bocor—kondisi yang disebut leaky gut. | 9.43 | 15.57 | 2 |
| 3 | Lewat celah bocor inilah racun endotoksin lolos masuk ke aliran darah dan memicu peradangan di seluruh tubuh. | 16.06 | 22.16 | 3 |
| 4 | Peradangan ini melukai dinding pembuluh darah, bikin kolesterol mudah menempel hingga menumpuk menjadi plak penyumbat. | 22.54 | 28.58 | 4 |
| 5 | Saat darah penuh peradangan ini mengalir ke jantung, hati, hingga otak, sel-sel sehat perlahan rusak dan memicu berbagai penyakit. | 28.98 | 36.46 | 5 |
| 6 | Karena itu, hidup sehat selalu diawali dari usus yang sehat. Rawat dari dalam, jangan sampai terlambat. | 36.88 | 43.23 | 6 |

## Pemetaan scene

| Scene | Pill | Kalimat | Detik | Frame timeline | Frame aktual di file |
|-------|------|---------|-------|----------------|----------------------|
| 1 | USUS · pos 1/6 | 1 | 0.00–9.43 | 0–282 | 0–282 (283 frame, selisih 0,00 dtk) |
| 2 | DINDING USUS · pos 2/6 | 2 | 9.43–16.07 | 283–481 | 283–481 (199) |
| 3 | ALIRAN DARAH · pos 3/6 | 3 | 16.07–22.53 | 482–675 | 482–675 (194) |
| 4 | PEMBULUH DARAH · pos 4/6 | 4 | 22.53–28.97 | 676–868 | 676–868 (193) |
| 5 | ORGAN VITAL · pos 5/6 | 5 | 28.97–36.87 | 869–1105 | 869–1105 (237) |
| 6 | PEMULIHAN · pos 6/6 | 6 | 36.87–44.50 | 1106–1334 | 1106–1334 (229) |

## Hasil validator & pemeriksa file

```
validate_timeline.py docs/timeline.json  → HASIL: PASS SEMUA (20 cek)
check_output.sh out/leaky-gut-final.mp4
  PASS resolusi 1080x1920
  PASS fps 30
  PASS durasi 44.500000s (30–60)
  PASS tidak ada keheningan > 1,2 detik
  INFO loudness terukur: -14.4 LUFS (target -14 ±1)
  HASIL: PASS SEMUA
ebur128: I = -14.2 LUFS · true peak = -1.6 dBFS · LRA 1.9 LU
6 file scene identik: h264 1080x1920 30/1 (syarat concat -c copy) · total 1335 frame = 44,50 dtk
```

## QC mandiri 10 poin

1. **PASS** — validator PASS; final ter-probe 1080×1920, 30 fps, 44,50 dtk; audio AAC 44,50 dtk (sampai akhir).
2. **PASS** — setiap batas scene jatuh di frame awal kalimatnya (render per rentang frame dari timeline.json; selisih ≤ 0,01 dtk).
3. **PASS** — 28 halaman karaoke diukur dengan font asli (`tools/qc_text.mjs`): semua muat 1 baris (58–64 px, lantai 44). Judul, chip, teks besar penutup, kartu seri diukur `fitSize` dan berada di zona aman (atas ≥ 250 px, bawah ≤ 1610 px); dicek di contact sheet & frame preview.
4. **PASS (dengan catatan)** — detik 0: usus utuh + teks «Tahukah kamu,» + suara hadir bersamaan. Catatan: hook Mode C bawaan (rujukan waktu-nyata + counter hidup) TIDAK dipakai karena naskah final tidak memuatnya.
5. **PASS / N/A** — naskah tanpa angka data → tidak ada readout angka, tidak ada angka hero 3D (sesuai brief). Chip menyala tepat pada kata pemicunya (timestamp kata).
6. **PASS** — tidak ada keheningan > 1 dtk (silencedetect −45 dB/0,5 dtk: 0 kejadian); jeda payoff 1,03 dtk dengan bed musik + kartu seri.
7. **PASS** — −14,2 LUFS terintegrasi, true peak −1,6 dBFS.
8. **PASS** — satu Stage (renderer, rig cahaya, void ungu, bokeh), satu set material glossy, font Playfair Display + Inter, gaya pill/chip/karaoke sama di 6 scene. Suasana suram→cerah hanya menggeser intensitas/temperatur rig yang sama.
9. **PASS** — manusia hanya siluet tanpa wajah (Scene 3, 5, 6). Organ hero (usus) utuh terbaca di hook; jantung/hati/otak utuh di singgahan masing-masing. Cek khusus Mode C di bawah.
10. **PASS** — penutup: teks besar bertahap «Hidup Sehat Diawali dari Usus yang Sehat» → «Rawat dari Dalam — Jangan Sampai Terlambat.» (memantulkan hook «berawal dari usus») + kartu «SERI TUBUH MANUSIA · Part 2 · Leaky Gut — Usus Bocor»; fade ke hitam. Tanpa CTA, tanpa teks ajakan lain.

### Cek khusus Mode C

- Kode warna tidak terbalik di still mana pun: merah = arteri/sel darah kaya O₂ (arteri Scene 4, jaringan arteri tubuh), biru = sisi vena kapiler usus, vena kava, arteri pulmonalis. Biru/merah TIDAK dipakai untuk racun/plak: racun hijau keruh, plak & kolesterol kuning pucat, sinyal radang oranye, sel rusak abu-ungu, bilasan putih hangat.
- Titik perubahan warna: kapiler dinding usus (merah → biru) saat racun masuk sisi vena (kalimat 3). Darah suram (merah tua redup) → merah terang di Scene 6 — hue tetap merah.
- Counter detak: N/A (naskah tanpa counter).
- Pill tahap sesuai pos di setiap still (pos n/6, titik semantik: hijau = racun di usus, oranye = radang di darah, merah = darah sehat).
- Chip hanya menyala saat bagiannya disebut narasi.
- Judul tidak muncul di 5 detik pertama: judul tampil 9,43–12,93 dtk (awal Scene 2, sesuai brief).

## Temuan QC preview yang sudah diperbaiki (sebelum final)

- Hero racun tampak kuning saat kilatan radang aktif (halo oranye aditif di atas hijau) → halo dikurangi, kilatan radang dibuat oranye murni tanpa pencahayaan; inti racun tetap hijau.
- Bercak kerusakan otak melayang di luar permukaan → radius ditempelkan ke permukaan.

## Penyimpangan & keputusan yang perlu diketahui

- Hook tanpa rujukan waktu-nyata/counter hidup (naskah final) — sama seperti Part 1.
- Judul tunda di 9,43 dtk (di luar patokan ±5–8 dtk) karena kalimat 1 baru selesai 9,08 dtk; posisinya sesuai brief (awal Scene 2), disetujui di Gerbang 1.
- Penutup Mode C bawaan (counter finale) diganti teks besar bertahap sesuai brief; kalimat 6 tidak memakai karaoke — teks besar menjadi captionnya, muncul kata demi kata tepat saat diucapkan. Kata «Karena itu» dan «selalu» tidak tampil di layar (mengikuti teks brief).
- Chip tambahan di luar daftar brief: label kecil «Jantung», «Hati», «Otak» (Scene 5); baris kecil di chip Scene 4 «dinding pembuluh terluka» · «kolesterol menempel» · «menumpuk jadi plak»; sub-baris «jantung · hati · otak» di chip Scene 5. Semuanya parafrase narasi, tanpa klaim baru.
- Perjalanan hero: usus → celah dinding → kapiler (vena) → vena kava menuju jantung → arteri (Scene 4) → jantung/hati/otak. Kelanjutan antar skala memakai transisi «menyelam ke/keluar dari hero» (±0,3 dtk, kilau hijau/oranye) — tanpa hard cut.
- Format piksel file: yuvj420p (rentang penuh, keluaran bawaan Remotion — sama seperti Part 1).

## Sumber fakta

- **Utama:** storyboard + naskah final dari user — semua kalimat narasi, isi & nada klaim dipakai persis.
- **Riset web: tidak dilakukan di sesi ini.** Pilihan visual di luar naskah berasal dari pengetahuan fisiologi umum dan **ditandai BELUM DIVERIFIKASI dengan sumber di sesi ini**:
  - Dinding usus digambarkan sebagai barisan sel epitel dengan *tight junction* (pita terang) yang putus saat «merenggang». ⚠ belum diverifikasi sumber.
  - Endotoksin digambarkan masuk ke sisi vena kapiler lalu ke vena kava menuju jantung. ⚠ belum diverifikasi sumber.
  - Plak digambarkan sebagai timbunan kuning pucat di dinding dalam arteri pada lokasi luka radang. ⚠ belum diverifikasi sumber.
  - Klaim naskah (usus sebagai awal banyak masalah kesehatan; leaky gut → endotoksin → peradangan → plak → kerusakan sel organ) disajikan persis sesuai naskah user dan tidak dinilai/diverifikasi ulang di sesi ini.

## Aset yang disimpan untuk dipakai ulang

Baru: `src/three/models/Gut.tsx` (usus besar berhaustra + usus halus, kolon transversum cutaway, isi rongga, gelombang bilasan) · `Epithelium.tsx` (sel dinding usus + tight junction + kapiler) · `Artery.tsx` (arteri cutaway, luka radang, plak) · `Brain.tsx` · `Toxin.tsx` (endotoksin hero + kilatan radang instanced) · `Damage.tsx` (bercak sel rusak / halo sehat) · `BodyWorld.tsx` (peta tubuh + organ) · `src/three/Inst.tsx` (instancing generik) · `src/lib/episode.ts` (satu-satunya file konfigurasi isi per episode: judul, pill, kata kunci, label seri).
Dipakai ulang dari Part 1: Stage (+ parameter suasana dim/warm), materials, VarTube, Heart, Liver, Body, Chip, StagePill, Karaoke, FontGate/fit, tools render/still/QC/mix. Scene Part 1 diarsipkan di `archive/part1-scenes/`.

## Caption Instagram

Pernah dengar istilah leaky gut? 🦠➡️🫀

Sisa makanan yang menumpuk di usus bisa memicu bakteri jahat menghasilkan racun. Iritasi yang dibiarkan terus-menerus membuat dinding usus merenggang dan bocor — kondisi yang disebut leaky gut. Lewat celah itu, racun endotoksin lolos ke aliran darah dan memicu peradangan di seluruh tubuh: melukai dinding pembuluh darah sampai kolesterol menumpuk jadi plak, lalu ikut mengalir ke jantung, hati, hingga otak.

Hidup sehat diawali dari usus yang sehat. Rawat dari dalam — jangan sampai terlambat.

Seri Tubuh Manusia — Part 2 · Leaky Gut (Usus Bocor)

#SeriTubuhManusia #TubuhManusia #LeakyGut #UsusBocor #KesehatanUsus #Usus #Peradangan #Anatomi #EdukasiKesehatan #Basabasi
