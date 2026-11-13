# Tabel Kalimat & Pemetaan Scene — LEAKY GUT — USUS BOCOR (Seri Tubuh Manusia — Part 2)

- File audio: `public/narasi.mp3` (dari `voice-offer-usus.mp3`, tempo asli)
- Durasi audio terukur: 43.47 dtk · total video 44.5 dtk (1335 frame)
- FPS komposisi: 30
- Metode: Whisper large-v3 (`language="id"` dipaksa) untuk waktu + verifikasi jeda hening silencedetect −35 dB; teks dari naskah resmi (selisih ASR: «Taukah» → «Tahukah»).
- Batas scene = awal suara kalimat berikutnya (dibulatkan ke frame, selisih ≤ 0,01 dtk).

## Tabel Kalimat

| No | Kalimat | Mulai | Selesai | Frame mulai | Frame selesai | Scene |
|----|---------|-------|---------|-------------|---------------|-------|
| 1 | Tahukah kamu, banyak masalah kesehatan sebenarnya berawal dari usus? Sisa makanan yang menumpuk memicu bakteri jahat menghasilkan racun di dalam usus. | 0.00 | 9.08 | 0 | 272 | 1 |
| 2 | Iritasi yang dibiarkan terus-menerus membuat dinding usus merenggang dan bocor—kondisi yang disebut leaky gut. | 9.43 | 15.57 | 283 | 467 | 2 |
| 3 | Lewat celah bocor inilah racun endotoksin lolos masuk ke aliran darah dan memicu peradangan di seluruh tubuh. | 16.06 | 22.16 | 482 | 665 | 3 |
| 4 | Peradangan ini melukai dinding pembuluh darah, bikin kolesterol mudah menempel hingga menumpuk menjadi plak penyumbat. | 22.54 | 28.58 | 676 | 857 | 4 |
| 5 | Saat darah penuh peradangan ini mengalir ke jantung, hati, hingga otak, sel-sel sehat perlahan rusak dan memicu berbagai penyakit. | 28.98 | 36.46 | 869 | 1094 | 5 |
| 6 | Karena itu, hidup sehat selalu diawali dari usus yang sehat. Rawat dari dalam, jangan sampai terlambat. | 36.88 | 43.23 | 1106 | 1297 | 6 |

## Pemetaan Scene

| Scene | Kalimat | Detik | Frame | Visual inti | Teks layar |
|---|---|---|---|---|---|
| 1 | 1 | 0.00–9.43 (9.43 dtk) | 0–282 | Rongga usus besar (tabung cutaway Villi/VarTube, cahaya redup); sisa makanan menumpuk, bakteri jahat menghasilkan partikel racun hijau keruh — kamera memilih SATU partikel endotoksin (hero) | Hook kalimat 1 sejak dtk 0 · chip «Penumpukan Sisa & Racun Usus» saat «menumpuk» · pill USUS 1/6 |
| 2 | 2 | 9.43–16.07 (6.64 dtk) | 283–481 | Zoom ke dinding usus: sel dinding (vili) merenggang, celah terbuka; hero menempel di celah | Judul serif tunda «LEAKY GUT — USUS BOCOR» di awal scene · chip «Leaky Gut (Usus Bocor)» saat «bocor» · pill DINDING USUS 2/6 |
| 3 | 3 | 16.07–22.53 (6.46 dtk) | 482–675 | Hero lolos lewat celah masuk kapiler; ikut arus sel darah; kilatan oranye sinyal radang menyebar | chip «Endotoksin Masuk ke Darah» saat «endotoksin» · pill ALIRAN DARAH 3/6 |
| 4 | 4 | 22.53–28.97 (6.44 dtk) | 676–868 | Penampang pembuluh: kilatan oranye melukai dinding; kolesterol kuning pucat menempel jadi plak penyempit | chip «Inflamasi & Plak Pembuluh Darah» saat «melukai/plak» · pill PEMBULUH DARAH 4/6 |
| 5 | 5 | 28.97–36.87 (7.90 dtk) | 869–1105 | Arus membawa hero ke jantung → hati → otak (model Part 1 + penampang kepala); sel organ meredup bercak; zoom-out ke siluet tubuh | chip «Sel Rusak & Picu Penyakit» saat «rusak» · pill ORGAN VITAL 5/6 |
| 6 | 6 | 36.87–44.50 (7.63 dtk) | 1106–1334 | Payoff: rig sama dinaikkan intensitas & dihangatkan; gelombang bilasan menyapu rongga usus, celah menutup, darah merah terang, jantung/hati/otak menyala sehat | Teks besar «Hidup Sehat Diawali dari Usus yang Sehat» (37,46) → «Rawat dari Dalam — Jangan Sampai Terlambat.» (40,66) → kartu «SERI TUBUH MANUSIA · Part 2» (±43,2) · pill PEMULIHAN 6/6 · fade hitam |

## Cek akhir pra-produksi

- [x] Scene terakhir menutup di akhir audio (43,47) + jeda payoff 1,03 dtk = 44,50 dtk.
- [x] Zona tanpa narasi di akhir 1,27 dtk (≤ 5).
- [x] Setiap teks layar terikat ke nomor kalimat / kata pemicunya.
- [x] `validate_timeline.py` → PASS SEMUA (20 cek).
