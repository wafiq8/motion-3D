# Laporan Akhir — Arus Lintas Indonesia (Arlindo)

Produksi 03 · skill diorama-basabasi v3.0 · Mode A, **Varian A2 — struktur perjalanan bukti** (penutup verdict + pertanyaan terbuka, tanpa CTA).

- Final: `out/arlindo-final.mp4` (1080×1920, 30 fps, 102,20 dtk)
- Preview: `out/arlindo-preview.mp4` (540×960) · per scene: `out/scenes/final-scene-N.mp4`
- Contact sheet Gerbang 2: `out/contact-sheet.png` · Timeline: `docs/timeline.json` (`"variant": "A2"`) · Tabel kalimat: `docs/tabel-kalimat.md`

## Gerbang

| Gerbang | Status |
|---|---|
| Gerbang 1 — ringkasan timeline | Disetujui user (9 scene, 102,20 dtk). Catatan pelafalan "Timor" dikonfirmasi user. |
| Gerbang 2 — contact sheet 9×3 | Disetujui user, format PENUH (3 still/scene). Tidak ada pelonggaran: ini produksi A2 pertama. |

## Audio & timing

- Narasi `narasi.mp3` 101,952 dtk (MP3 mono 24 kHz) · musik `musik.mp3` 169,43 dtk (dipotong 102,2 dtk, fade-out 1,6 dtk).
- Timing: faster-whisper **large-v3**, `language=id` dipaksa, timestamp per kata; teks kalimat dari naskah resmi. Subtitle karaoke = token naskah diselaraskan ke waktu Whisper (`scripts/build_captions.py`).
- Mix: musik −21 dB + sidechain ducking oleh narasi; loudnorm dua lintasan → −14 LUFS, true peak −1,5 dBTP (`scripts/mix_audio.sh`).

## Tabel kalimat ringkas & pemetaan scene

| Scene | Kalimat | Mulai (dtk) | Isi |
|---|---|---|---|
| S1 | 1–2 | 0,00 | Judul serif + peta satelit, jalur menyala Pasifik→Hindia, readout 15 jt |
| S2 | 3–4 | 11,44 | BENARKAH? di gerbang Mindanao; paket air muncul ("Kita ikuti") |
| S3 | 5–6 | 18,76 | Angka hero 3D emas 15 JUTA + readout; 6.000 kolam; 11 mooring INSTANT |
| S4 | 7–8 | 32,60 | Mindanao → Laut Sulawesi → Selat Makassar; 11,6 jt; ±77% |
| S5 | 9 | 47,28 | Potongan batimetri GEBCO 126,85°BT: ambang Lifamatola → Laut Banda |
| S6 | 10–11 | 54,76 | Tiga pintu keluar; Selat Lombok 20 km · 350 m · 2,6 jt |
| S7 | 12–13 | 67,28 | Ombai 4,9 jt; Celah Timor 160 km · 7,5 jt; batang jatah; paket keluar |
| S8 | 14–15 | 79,36 | TERBUKTI; counter "bernapas" 10↔19 menggerakkan garis; El Niño melemahkan |
| S9 | 16 | 93,04 | Pertanyaan Lombok vs Timor, ditahan di jeda payoff 0,92 dtk, fade hitam |

## Hasil validator & check_output

`python3 scripts/validate_timeline.py docs/timeline.json` → **PASS SEMUA** (fps 30; total 102,20 dtk dalam rentang A2 30–120; ekor 0,92 dtk; 9 scene mulai tepat di awal kalimat pemetaannya; scene bersebelahan).

`bash scripts/check_output.sh out/arlindo-final.mp4` (rentang A2 terbaca otomatis) → **PASS SEMUA**: resolusi 1080×1920 · fps 30 · durasi 102,200 dtk (30–120) · tidak ada keheningan > 1,2 dtk · loudness −14,1 LUFS.

## QC mandiri 10 poin

| # | Cek | Hasil |
|---|---|---|
| 1 | Validator PASS; file final 1080×1920, 30 fps, 102,2 dtk (A2 30–120); audio AAC 48 kHz sepanjang 102,2 dtk | PASS |
| 2 | Batas scene ≤ 0,3 dtk dari awal kalimat (diukur dari jumlah frame file per scene yang di-concat) | PASS: selisih maks 0,013 dtk (S5, S7) |
| 3 | Tidak ada teks terpotong / keluar zona aman (contact sheet, grid preview tiap 2 dtk, frame full-res) | PASS: readout dan teks besar mulai di y ≥ 300 px, subtitle di atas zona 310 px bawah, chip di atas subtitle; semua teks diukur dengan fitText/measureText |
| 4 | Hook lengkap ≤ 1,5 dtk | PASS: judul serif, karaoke "Setiap detik", dan peta satelit sejak frame 0; jalur menyala ±0,5 dtk; readout 15 juta mulai menghitung di 0,76 dtk |
| 5 | Readout sinkron, angka hero 3D maksimal satu, kredit di frame yang sama, label kejujuran | PASS: satu angka hero (15 JUTA, S3) juga tampil sebagai readout; setiap readout membawa sub-baris kredit A/B; chip ILUSTRASI/DISEDERHANAKAN tampil bersama pemicunya (tabel di bawah) |
| 6 | Keheningan > 1 dtk tanpa alasan tidak ada; jeda payoff ≤ 1 dtk | PASS: silencedetect −45 dB nihil; jeda payoff 0,92 dtk dengan musik tetap berjalan |
| 7 | Loudness −14 LUFS ±1, peak ≤ −1 dB | PASS: −14,1 LUFS, true peak −1,3 dBTP |
| 8 | Gaya konsisten | PASS: satu renderer, satu rig (hemisphere #FFE3B3/#8A6B45 0,9 + directional #FFD9A0 2,2, ACES 1,1), satu panggung peta, satu gaya readout/caption, Playfair Display + Inter |
| 9 | Manusia hanya siluet; aturan close-up | PASS: tidak ada figur manusia; A2 membebaskan jarak hero (paket air di-tracking dekat) |
| 10 | Penutup A2 perjalanan bukti | PASS: verdict TERBUKTI (kal. 14), lalu pertanyaan terbuka spesifik Lombok vs Timor sebagai kalimat terakhir, ditahan selama jeda payoff, fade hitam bersih; tanpa CTA, tanpa kartu/label seri, tanpa pill tahap |

## Kredit & label kejujuran per scene (tampil di layar)

Baris kredit readout: **A** = "MENURUT GORDON DKK. 2010 · PROGRAM INSTANT"; **B** = "HITUNGAN KAMI · DATA INSTANT".

| Scene | Readout + kredit | Label/chip kejujuran |
|---|---|---|
| S1 | 15 juta m³/dtk — A | JALUR DISEDERHANAKAN |
| S2 | — | JALUR DISEDERHANAKAN · ILUSTRASI · PAKET AIR (sejak kal. 4) |
| S3 | 15 juta (readout + angka hero 3D) — A; 6.000 kolam — B (±2.500 m³/kolam); 3 tahun · 11 stasiun — A | ILUSTRASI · 6.000 KOLAM · POSISI MOORING DISEDERHANAKAN · ILUSTRASI · PAKET AIR · JALUR DISEDERHANAKAN |
| S4 | 11,6 juta — A; ±77% (11,6 ÷ 15) — B | ILUSTRASI · PAKET AIR · JALUR DISEDERHANAKAN |
| S5 | — | ILUSTRASI · POTONGAN BATIMETRI · KEDALAMAN DIPERBESAR · ILUSTRASI · PAKET AIR · JALUR DISEDERHANAKAN |
| S6 | 20 km · 350 m · 2,6 juta — A | ILUSTRASI · PAKET AIR · JALUR DISEDERHANAKAN |
| S7 | 4,9 juta — A; 160 km · 7,5 juta — A; batang jatah tiga pintu — A | ILUSTRASI · PAKET AIR · JALUR DISEDERHANAKAN |
| S8 | Debit berayun 10–19 juta (counter + legenda "tebal & terang garis = debit") — A | ILUSTRASI · KEMARAU EL NIÑO · JALUR DISEDERHANAKAN |
| S9 | — | JALUR DISEDERHANAKAN |

## Fakta & sumber

- Gordon, A. L., Sprintall, J., Van Aken, H. M., dkk. (2010). *The Indonesian throughflow during 2004–2006 as observed by the INSTANT program.* Dynamics of Atmospheres and Oceans 50: 115–128. Sumber angka: total ±15 Sv (rentang ±10,7–18,7 Sv), Makassar 11,6 Sv, Lombok 2,6 Sv, Ombai 4,9 Sv, Timor 7,5 Sv, 11 mooring selama 3 tahun.
- Lebar Lombok ±20 km, ambang ±350 m, dan lebar Celah Timor ±160 km diambil dari naskah user dan dikreditkan ke kredit A sesuai instruksi. Garis ukur di peta digambar di atas data GEBCO; garis ukur Lombok di peta ±24 km, karena celah tersempit sebenarnya bergantung pada titik ukur.
- Pelemahan Arlindo saat El Niño adalah temuan mapan di literatur (mis. Meyers 1996; Gordon dkk. 1999); visual tint kering diberi label ILUSTRASI.
- Posisi 11 mooring di peta = perkiraan per pintu (2 Makassar, 2 Lifamatola, 2 Lombok, 2 Ombai, 3 Timor), BUKAN koordinat resmi INSTANT. Sudah dilabeli di layar.
- Klaim "satu-satunya pintu tropis antara dua samudra": Arlindo adalah satu-satunya hubungan lintang rendah Pasifik–Hindia (Gordon 2005, Oceanography 18(4)).

## Aset & data luar (semua di-vendor ke repo, tanpa hotlink)

| Aset | Pembuat / sumber | Lisensi | Dicek | Ukuran |
|---|---|---|---|---|
| `assets/vendor/s2cloudless2016_108-135E_14S-10N_z7.png` (mosaik 360 tile WMTS zoom 7, layer `s2cloudless` 2016, EPSG:4326) | Sentinel-2 cloudless 2016 by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016) | CC BY 4.0 (dicek di WMTS GetCapabilities; layer 2018–2025 = CC BY-NC-SA, TIDAK dipakai) | 17 Nov 2026 | 13,6 MB |
| `assets/vendor/gebco_2026_n10.0_s-14.0_w108.0_e135.0_geotiff.tif` (grid 15″) | GEBCO Compilation Group (2026) GEBCO 2026 Grid | Domain publik dengan atribusi (lihat `GEBCO_Grid_terms_of_use.pdf`) | 17 Nov 2026 | 74,7 MB |
| `GEBCO_Grid_documentation.pdf`, `GEBCO_Grid_terms_of_use.pdf` | GEBCO | — | 17 Nov 2026 | 0,4 MB |
| `public/map/albedo.jpg` (turunan: satelit + arsiran kedalaman GEBCO) | olahan `scripts/prep_map.py` | turunan dari dua sumber di atas | — | 2,5 MB |
| `public/map/height.bin` (GEBCO dirata-rata 6×6 → 1080×960 int16) | olahan `scripts/prep_map.py` | turunan GEBCO | — | 2,1 MB |
| Font Playfair Display 800, Inter 600/700/800 (fontsource) | Claus Eggers Sørensen; Rasmus Andersson | SIL OFL 1.1 | — | 0,1 MB |

Total aset: **93,3 MB** (dominan GeoTIFF GEBCO 74,7 MB, di atas batas saran GitHub 50 MB; pertimbangkan Git LFS bila repo membengkak).
Hero paket air, garis arus, mooring, cincin pintu, garis ukur, kolam, dan angka emas: **prosedural**, tanpa model unduhan.

## Catatan render

- Renderer: Chromium headless + ANGLE/SwiftShader (`--gl=swangle`, GL perangkat lunak), `--concurrency=4` (= `nproc`).
- Preview 0,5×: ±1.480 dtk untuk 3.066 frame (±0,48 dtk/frame), per scene; QC preview: readout Ombai diperpanjang sampai 72,9 dtk (scene 7 dirender ulang).
- Final 1×: 1.719 dtk (±28,7 menit) untuk 3.066 frame (±0,56 dtk/frame): S1 204 · S2 102 · S3 281 · S4 208 · S5 186 · S6 167 · S7 163 · S8 267 · S9 141 dtk. File final 148 MB (H.264 CRF 18, AAC 256 kbps).
- Terrain 432×384 segmen (diturunkan dari 540×480 demi kecepatan); kolam 6.000 di-instancing; tidak ada bayangan real-time (hillshade di-bake ke albedo).

## Caption Instagram (siap tempel)

Setiap detik, 15 juta meter kubik air Samudra Pasifik menyeberangi Indonesia menuju Samudra Hindia. Inilah Arus Lintas Indonesia (Arlindo), satu-satunya jalur air hangat tropis antara dua samudra besar.

Kami mengikuti satu paket air: masuk lewat Arus Mindanao, turun lewat Selat Makassar (11,6 juta m³/detik), bertemu air dalam dari Celah Lifamatola di Laut Banda, lalu keluar lewat tiga pintu: Lombok, Ombai, dan Celah Timor. Semua angka dari pengukuran langsung program internasional INSTANT, 2004–2006.

Pertanyaan untukmu: mana yang paling menentukan kuat-lemahnya arus ini, Lombok yang sempit dan dangkal, atau Timor yang lebar dan dalam? Tulis alasanmu di komentar.

Sumber: Gordon dkk. 2010, Dynamics of Atmospheres and Oceans (program INSTANT).
Citra satelit: Sentinel-2 cloudless 2016 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016), CC BY 4.0. Batimetri: GEBCO Compilation Group (2026) GEBCO 2026 Grid. Jalur arus disederhanakan; paket air dan potongan batimetri adalah ilustrasi.

Basabasi · Peta Hidup
#Arlindo #ArusLintasIndonesia #Oseanografi #LautIndonesia #SelatMakassar #SelatLombok #LautBanda #ElNino #Geografi #EdukasiSains #Basabasi
